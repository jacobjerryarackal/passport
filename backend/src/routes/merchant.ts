import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { verifyPassportSignature, sha256 } from "../verification/hasher";
import { createPayPalOrder, capturePayPalOrder } from "../paypal/orders";
import { logAuditEvent } from "../audit/logger";
import { getMerchantPayPalCredentials } from "../paypal/client";
import * as crypto from "crypto";

const router = Router();

// Auto-seed GiftCardCo catalog products if empty
async function ensureDefaultMerchantProducts() {
  const count = await prisma.merchantProduct.count();
  if (count === 0) {
    const products = [
      {
        sku: "gcc-digital-25",
        name: "GiftCardCo Digital Pass · $25",
        description: "Instant digital merchant procurement voucher for cloud services and client incentives.",
        amount: 25.0,
        currency: "USD",
        category: "digital gift cards",
        merchant: "GiftCardCo",
      },
      {
        sku: "gcc-digital-50",
        name: "GiftCardCo Digital Pass · $50",
        description: "Standard business digital incentive reward voucher, non-repudiable delivery.",
        amount: 50.0,
        currency: "USD",
        category: "digital gift cards",
        merchant: "GiftCardCo",
      },
      {
        sku: "gcc-digital-75",
        name: "GiftCardCo Digital Pass · $75",
        description: "Executive client appreciation gift credit. Compliant with tier-1 $80 corporate mandate.",
        amount: 75.0,
        currency: "USD",
        category: "digital gift cards",
        merchant: "GiftCardCo",
      },
      {
        sku: "gcc-digital-120",
        name: "GiftCardCo Digital Pass · $120",
        description: "Tier-1 enterprise digital procurement pass. Exceeds standard client $80 mandate cap.",
        amount: 120.0,
        currency: "USD",
        category: "digital gift cards",
        merchant: "GiftCardCo",
      },
    ];

    for (const p of products) {
      await prisma.merchantProduct.create({ data: p });
    }
  }
}

// GET /api/merchant/products
router.get("/products", async (_req: Request, res: Response) => {
  try {
    await ensureDefaultMerchantProducts();
    const products = await prisma.merchantProduct.findMany({
      where: { active: true },
      orderBy: { amount: "asc" },
    });
    const merchantCreds = getMerchantPayPalCredentials();
    return res.json({
      merchant: "GiftCardCo",
      isSeparateAccount: merchantCreds.isSeparate,
      products,
    });
  } catch (err) {
    console.error("GET /api/merchant/products error:", err);
    return res.status(500).json({ error: "Failed to fetch merchant products" });
  }
});

// GET /api/merchant/orders
router.get("/orders", async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.merchantOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
      },
    });

    const stats = {
      totalOrders: orders.length,
      verifiedSettled: orders.filter((o) => o.status === "CAPTURED").length,
      rejectedCount: orders.filter((o) => o.status === "REJECTED").length,
      grossSettledVolume: orders
        .filter((o) => o.status === "CAPTURED")
        .reduce((sum, o) => sum + o.amount, 0),
    };

    return res.json({ orders, stats });
  } catch (err) {
    console.error("GET /api/merchant/orders error:", err);
    return res.status(500).json({ error: "Failed to fetch merchant orders" });
  }
});

// POST /api/merchant/checkout - Passport-gated merchant checkout API
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    await ensureDefaultMerchantProducts();
    const { productId, passport, idempotencyKey } = req.body;

    // 1. Mandatory Parameter Verification
    if (!passport) {
      await logAuditEvent({
        action: "MERCHANT_CHECKOUT_REJECTED",
        actor: "MERCHANT_PORTAL",
        actorModel: "giftcardco-checkout-sentinel",
        details: {
          productId,
          reasonCode: "PASSPORT_MISSING",
          rejectionReason: "No cryptographic Trust Passport was provided with the agent requisition.",
        },
      });

      return res.status(400).json({
        success: false,
        reasonCode: "PASSPORT_MISSING",
        error: "Requisition rejected: Missing cryptographic Trust Passport. GiftCardCo requires attested PFCP-v2 credentials.",
      });
    }

    // 2. Product Lookup
    const product =
      (await prisma.merchantProduct.findUnique({ where: { id: productId } })) ||
      (await prisma.merchantProduct.findFirst({ where: { sku: productId } }));

    if (!product) {
      return res.status(404).json({
        success: false,
        reasonCode: "PRODUCT_NOT_FOUND",
        error: `Product ${productId} not found in GiftCardCo merchant catalog.`,
      });
    }

    const passportNumber = passport.passportNumber || passport.id || "PASS-UNKNOWN";

    // 3. Independent Cryptographic Signature Verification
    const isSignatureValid = verifyPassportSignature(passport.passportHash, passport.signature);
    if (!isSignatureValid) {
      await logAuditEvent({
        action: "MERCHANT_CHECKOUT_REJECTED",
        actor: "MERCHANT_PORTAL",
        actorModel: "giftcardco-checkout-sentinel",
        details: {
          productId: product.id,
          productName: product.name,
          amount: product.amount,
          passportNumber,
          reasonCode: "PASSPORT_SIGNATURE_INVALID",
          rejectionReason: "Ed25519 signature mismatch. Passport has been tampered with or signed by unauthorized entity.",
        },
      });

      await prisma.merchantOrder.create({
        data: {
          orderNumber: `MORD-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`,
          productId: product.id,
          passportId: passport.id || passportNumber,
          passportNumber,
          amount: product.amount,
          currency: product.currency,
          status: "REJECTED",
          verificationStatus: "REJECTED",
          rejectionReason: "PASSPORT_SIGNATURE_INVALID",
        },
      });

      return res.status(400).json({
        success: false,
        reasonCode: "PASSPORT_SIGNATURE_INVALID",
        error: "Merchant Verification Denied: Cryptographic signature mismatch. Attestation payload is forged or altered.",
      });
    }

    // 4. Resolve Mandate Constraints Independently
    let mandate = null;
    if (passport.mandateId) {
      mandate = await prisma.mandate.findUnique({ where: { id: passport.mandateId } });
    }
    if (!mandate && passport.passportNumber) {
      const dbPassport = await prisma.trustPassport.findFirst({
        where: { passportNumber: passport.passportNumber },
        include: { mandate: true },
      });
      if (dbPassport?.mandate) {
        mandate = dbPassport.mandate;
      }
    }
    if (!mandate && passport.mandate) {
      mandate = passport.mandate;
    }
    if (!mandate) {
      mandate = (await prisma.mandate.findFirst({ where: { status: "ACTIVE" } })) || (await prisma.mandate.findFirst());
    }

    // 5. Expiration Check
    const expiryDate = passport.expiresAt
      ? new Date(passport.expiresAt)
      : mandate?.expiresAt
      ? new Date(mandate.expiresAt)
      : null;

    if (expiryDate && expiryDate.getTime() < Date.now()) {
      await logAuditEvent({
        mandateId: mandate?.id,
        action: "MERCHANT_CHECKOUT_REJECTED",
        actor: "MERCHANT_PORTAL",
        actorModel: "giftcardco-checkout-sentinel",
        details: {
          productId: product.id,
          amount: product.amount,
          passportNumber,
          reasonCode: "PASSPORT_EXPIRED",
          rejectionReason: `Trust Passport validity expired at ${expiryDate.toISOString()}.`,
        },
      });

      await prisma.merchantOrder.create({
        data: {
          orderNumber: `MORD-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`,
          productId: product.id,
          passportId: passport.id || passportNumber,
          passportNumber,
          mandateId: mandate?.id,
          amount: product.amount,
          currency: product.currency,
          status: "REJECTED",
          verificationStatus: "REJECTED",
          rejectionReason: "PASSPORT_EXPIRED",
        },
      });

      return res.status(400).json({
        success: false,
        reasonCode: "PASSPORT_EXPIRED",
        error: `Merchant Verification Denied: Trust Passport expired on ${expiryDate.toISOString()}.`,
      });
    }

    // 6. Kill Switch / Revocation Check
    const isRevoked =
      Boolean(mandate?.revoked) ||
      mandate?.status?.toUpperCase() === "REVOKED" ||
      Boolean(passport.revoked) ||
      passport.mandate?.revoked === true ||
      passport.mandate?.status?.toUpperCase() === "REVOKED";
    if (isRevoked) {
      await logAuditEvent({
        mandateId: mandate?.id,
        action: "MERCHANT_CHECKOUT_REJECTED",
        actor: "MERCHANT_PORTAL",
        actorModel: "giftcardco-checkout-sentinel",
        details: {
          productId: product.id,
          amount: product.amount,
          passportNumber,
          reasonCode: "MANDATE_REVOKED",
          rejectionReason: "Governing Spend Mandate was revoked by account owner kill switch.",
        },
      });

      await prisma.merchantOrder.create({
        data: {
          orderNumber: `MORD-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`,
          productId: product.id,
          passportId: passport.id || passportNumber,
          passportNumber,
          mandateId: mandate?.id,
          amount: product.amount,
          currency: product.currency,
          status: "REJECTED",
          verificationStatus: "REJECTED",
          rejectionReason: "MANDATE_REVOKED",
        },
      });

      return res.status(400).json({
        success: false,
        reasonCode: "MANDATE_REVOKED",
        error: "Merchant Verification Denied: The governing spend mandate has been revoked via kill switch.",
      });
    }

    // 7. Budget Cap Check (OVER_LIMIT)
    const maxAllowedAmount = passport.maxAmount || mandate?.maxAmount || 80.0;
    if (product.amount > maxAllowedAmount) {
      await logAuditEvent({
        mandateId: mandate?.id,
        action: "MERCHANT_CHECKOUT_REJECTED",
        actor: "MERCHANT_PORTAL",
        actorModel: "giftcardco-checkout-sentinel",
        details: {
          productId: product.id,
          productName: product.name,
          productPrice: product.amount,
          mandateCap: maxAllowedAmount,
          passportNumber,
          reasonCode: "OVER_LIMIT",
          rejectionReason: `Product price ($${product.amount.toFixed(2)}) exceeds authorized mandate cap of $${maxAllowedAmount.toFixed(2)}.`,
        },
      });

      await prisma.merchantOrder.create({
        data: {
          orderNumber: `MORD-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`,
          productId: product.id,
          passportId: passport.id || passportNumber,
          passportNumber,
          mandateId: mandate?.id,
          amount: product.amount,
          currency: product.currency,
          status: "REJECTED",
          verificationStatus: "REJECTED",
          rejectionReason: "OVER_LIMIT",
        },
      });

      return res.status(400).json({
        success: false,
        reasonCode: "OVER_LIMIT",
        error: `Merchant Verification Denied: Product price ($${product.amount.toFixed(2)}) exceeds authorized passport spend limit of $${maxAllowedAmount.toFixed(2)}.`,
      });
    }

    // 8. Category Allowlist Verification
    const rawCategories = mandate?.allowedCategories || passport.allowedCategories || ["digital gift cards"];
    const allowedCategories: string[] =
      typeof rawCategories === "string" ? JSON.parse(rawCategories) : rawCategories;

    const isCategoryAllowed = allowedCategories.some(
      (cat) =>
        cat.toLowerCase() === product.category.toLowerCase() ||
        product.category.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(product.category.toLowerCase())
    );

    if (!isCategoryAllowed) {
      await logAuditEvent({
        mandateId: mandate?.id,
        action: "MERCHANT_CHECKOUT_REJECTED",
        actor: "MERCHANT_PORTAL",
        actorModel: "giftcardco-checkout-sentinel",
        details: {
          productId: product.id,
          category: product.category,
          allowedCategories,
          passportNumber,
          reasonCode: "MERCHANT_NOT_ALLOWED",
          rejectionReason: `Category '${product.category}' is not authorized in buyer mandate.`,
        },
      });

      return res.status(400).json({
        success: false,
        reasonCode: "MERCHANT_NOT_ALLOWED",
        error: `Merchant Verification Denied: Product category '${product.category}' is outside mandate allowlist.`,
      });
    }

    // 9. Idempotency Check (Prevent duplicate orders if idempotencyKey supplied)
    if (idempotencyKey) {
      const existingOrder = await prisma.merchantOrder.findFirst({
        where: {
          idempotencyKey,
          status: "CAPTURED",
        },
        include: { product: true },
      });

      if (existingOrder) {
        return res.json({
          success: true,
          idempotent: true,
          message: "Idempotent checkout: Existing order returned without double-capture.",
          merchantOrder: existingOrder,
        });
      }
    }

    // 10. Execution: Create & Capture PayPal Order with Custom_ID containing Trust Passport Number
    const mandateHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(mandate || {}))
      .digest("hex")
      .slice(0, 32);

    const paypalOrder = await createPayPalOrder({
      mandateId: mandate?.id || "mandate-default",
      amount: product.amount,
      currency: product.currency,
      itemName: product.name,
      category: product.category,
      recipient: passport.recipient || "client-recipient@authorized-partner.internal",
      passportId: passportNumber,
      mandateHash,
    });

    const captured = await capturePayPalOrder(paypalOrder.id);

    // 11. Persist Verified Merchant Order
    const orderNumber = `MORD-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}`;
    const merchantOrder = await prisma.merchantOrder.create({
      data: {
        orderNumber,
        productId: product.id,
        passportId: passport.id || passportNumber,
        passportNumber,
        mandateId: mandate?.id,
        amount: product.amount,
        currency: product.currency,
        status: "CAPTURED",
        verificationStatus: "VERIFIED",
        paypalOrderId: paypalOrder.id,
        paypalCaptureId: captured.captureId,
        simulated: captured.isSimulated,
        idempotencyKey: idempotencyKey || `${passportNumber}:${product.id}:${Date.now()}`,
      },
      include: { product: true },
    });

    // 12. Also link into core Purchase record so dispute evidence & timeline automatically resolve
    if (mandate) {
      const purchaseProposal = await prisma.purchaseProposal.create({
        data: {
          mandateId: mandate.id,
          itemName: product.name,
          itemCategory: product.category,
          amount: product.amount,
          currency: product.currency,
          recipient: "client-recipient@authorized-partner.internal",
          reasoning: "Merchant-attested autonomous purchase via GiftCardCo",
          validationStatus: "APPROVED",
          validationChecks: JSON.stringify([{ rule: "MERCHANT_PASSPORT_VERIFIED", passed: true }]),
        },
      });

      await prisma.purchase.create({
        data: {
          mandateId: mandate.id,
          proposalId: purchaseProposal.id,
          paypalOrderId: paypalOrder.id,
          paypalCaptureId: captured.captureId,
          status: "COMPLETED",
          amount: product.amount,
          currency: product.currency,
          merchantName: "GiftCardCo Digital Merchant",
          payerEmail: "agent-treasury@passport-ai.internal",
          paymentMethod: captured.isSimulated ? "PayPal Sandbox (Simulated Instant)" : "PayPal Sandbox Wallet",
          completedAt: new Date(),
        },
      });
    }

    // 13. Write Tamper-Evident Merchant Audit Event
    await logAuditEvent({
      mandateId: mandate?.id,
      action: "MERCHANT_CHECKOUT_ACCEPTED",
      actor: "MERCHANT_PORTAL",
      actorModel: "giftcardco-checkout-sentinel",
      details: {
        merchantOrderId: merchantOrder.id,
        orderNumber: merchantOrder.orderNumber,
        productId: product.id,
        productName: product.name,
        amount: product.amount,
        paypalOrderId: paypalOrder.id,
        paypalCaptureId: captured.captureId,
        passportNumber,
        sellerProtectionStatus: captured.sellerProtectionStatus,
      },
    });

    return res.json({
      success: true,
      merchantOrder,
      captured,
    });
  } catch (err) {
    console.error("POST /api/merchant/checkout error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
