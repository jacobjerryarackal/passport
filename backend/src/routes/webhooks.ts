import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { verifyPayPalWebhookSignature, handlePayPalWebhookEvent } from "../paypal/webhooks";
import { logAuditEvent } from "../audit/logger";
import { runDisputeAutopsy } from "../agents/dispute-agent";
import * as crypto from "crypto";

const router = Router();

// POST /api/webhooks/paypal
router.post("/paypal", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const rawBody = (req as any).rawBody || (typeof body === "string" ? body : JSON.stringify(body));

    const transmissionId = (req.headers["paypal-transmission-id"] as string) || "";
    const transmissionTime = (req.headers["paypal-transmission-time"] as string) || "";
    const certUrl = (req.headers["paypal-cert-url"] as string) || "";
    const authAlgo = (req.headers["paypal-auth-algo"] as string) || "";
    const transmissionSig = (req.headers["paypal-transmission-sig"] as string) || "";

    // Signature verification with raw body for CRC32 check
    const verification = await verifyPayPalWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookId: process.env.PAYPAL_WEBHOOK_ID || "",
      rawBody,
      webhookEvent: body,
    });

    const eventId = body.id || `WH-${crypto.randomBytes(6).toString("hex")}`;
    const eventType = body.event_type || "UNKNOWN";

    const webhookRecord = await prisma.webhookEvent.create({
      data: {
        paypalEventId: eventId,
        eventType,
        summary: body.summary || `PayPal event ${eventType}`,
        payload: rawBody,
        signatureValid: verification.isValid,
        simulated: verification.isSimulated,
        processed: false,
      },
    });

    // Run the integrated webhook handler
    const handlerResult = await handlePayPalWebhookEvent(eventType, body.resource);

    // Process dispute event if CUSTOMER.DISPUTE.CREATED
    if (eventType === "CUSTOMER.DISPUTE.CREATED") {
      const resource = body.resource;
      const disputeId = resource?.dispute_id || `PP-D-${crypto.randomInt(100000, 999999)}`;
      const amount = parseFloat(resource?.dispute_amount?.value || "75.00");
      const reason = resource?.reason || "UNAUTHORIZED_TRANSACTION";

      const sellerTxnId = resource?.disputed_transactions?.[0]?.seller_transaction_id;
      let purchase = null;
      if (sellerTxnId) {
        purchase = await prisma.purchase.findFirst({
          where: {
            OR: [{ paypalCaptureId: sellerTxnId }, { paypalOrderId: sellerTxnId }],
          },
          include: { passport: true },
        });
      }
      if (!purchase) {
        purchase = await prisma.purchase.findFirst({
          where: { status: { in: ["COMPLETED", "DISPUTED"] } },
          orderBy: { createdAt: "desc" },
          include: { passport: true },
        });
      }

      if (purchase) {
        let dispute = await prisma.dispute.findUnique({
          where: { paypalDisputeId: disputeId },
        });

        if (!dispute) {
          dispute = await prisma.dispute.create({
            data: {
              paypalDisputeId: disputeId,
              purchaseId: purchase.id,
              passportId: purchase.passport?.id || null,
              status: "ACTION_REQUIRED",
              disputeReason: reason,
              disputeAmount: amount,
              currency: purchase.currency,
              dueDate: new Date(Date.now() + 7 * 86400000),
              buyerNotes: "Dispute event received via PayPal Webhook listener.",
            },
          });
        }

        await runDisputeAutopsy(dispute.id);

        await logAuditEvent({
          mandateId: purchase.mandateId,
          action: "DISPUTE_RECEIVED",
          actor: "PAYPAL_WEBHOOK",
          actorModel: "webhook-listener",
          details: {
            disputeId: dispute.id,
            paypalDisputeId: dispute.paypalDisputeId,
            webhookEventId: eventId,
          },
        });
      }
    }

    await prisma.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: { processed: true },
    });

    return res.json({
      received: true,
      verification,
      eventId,
      handlerResult,
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/webhooks/demo (simulate dispute webhook)
router.post("/demo", async (req: Request, res: Response) => {
  try {
    const { eventType = "CUSTOMER.DISPUTE.CREATED" } = req.body || {};

    let purchase = await prisma.purchase.findFirst({
      where: { status: { in: ["COMPLETED", "DISPUTED"] } },
      orderBy: { createdAt: "desc" },
      include: { passport: true },
    });

    if (!purchase) {
      purchase = await prisma.purchase.findFirst({
        orderBy: { createdAt: "desc" },
        include: { passport: true },
      });
    }

    // Auto-seed a verified purchase & passport if the database is newly initialized
    if (!purchase) {
      let mandate = await prisma.mandate.findFirst();
      if (!mandate) {
        mandate = await prisma.mandate.create({
          data: {
            title: "Executive Client Gifting & Travel Mandate",
            purpose: "Autonomous vendor acquisition and client gifting under policy",
            maxAmount: 250.0,
            currency: "USD",
            allowedCategories: JSON.stringify(["digital gift cards", "office supplies", "software subscriptions"]),
            expiryHours: 72,
            expiresAt: new Date(Date.now() + 72 * 3600000),
            refundPolicy: "14-day standard digital merchant refund warranty",
            status: "ACTIVE",
          },
        });
      }

      const proposal = await prisma.purchaseProposal.create({
        data: {
          mandateId: mandate.id,
          agentModel: "gemini-2.5-pro",
          itemName: "Executive Hospitality Welcome Package",
          itemCategory: "digital gift cards",
          amount: 75.0,
          currency: "USD",
          recipient: "client-relations@acme-corp.partner",
          reasoning: "Authorized under mandate rules for tier-1 partner onboarding.",
          validationStatus: "APPROVED",
          validationChecks: JSON.stringify([
            { rule: "BUDGET_CAP", passed: true },
            { rule: "CATEGORY_MATCH", passed: true },
          ]),
        },
      });

      const orderId = `ORD-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const captureId = `CAP-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const createdPurchase = await prisma.purchase.create({
        data: {
          mandateId: mandate.id,
          proposalId: proposal.id,
          paypalOrderId: orderId,
          paypalCaptureId: captureId,
          status: "COMPLETED",
          amount: 75.0,
          currency: "USD",
          merchantName: "Executive Services Group",
          payerEmail: "autonomous-ops@passport.internal",
          paymentMethod: "PayPal Sandbox Wallet",
          completedAt: new Date(),
        },
      });

      const passportNumber = `PASS-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}-US`;
      const passportHash = crypto.createHash("sha256").update(createdPurchase.id + orderId).digest("hex");
      const passport = await prisma.trustPassport.create({
        data: {
          passportNumber,
          purchaseId: createdPurchase.id,
          mandateId: mandate.id,
          passportHash,
          signature: `SIG-${crypto.randomBytes(16).toString("hex")}`,
          status: "VALID",
          authorizationData: JSON.stringify({
            mandateTitle: mandate.title,
            budgetCap: `$${mandate.maxAmount.toFixed(2)} ${mandate.currency}`,
            allowedCategories: mandate.allowedCategories,
          }),
          transactionData: JSON.stringify({
            orderId: createdPurchase.paypalOrderId,
            captureId: createdPurchase.paypalCaptureId,
            amount: `$${createdPurchase.amount.toFixed(2)}`,
          }),
          agentTrailData: JSON.stringify({
            model: "gemini-2.5-pro",
            promptTrigger: "Simulated client onboarding requisition",
          }),
          refundEligibility: JSON.stringify({
            eligible: true,
            policy: "14-day warranty",
          }),
          disputeReadinessScore: 98,
          evidencePack: JSON.stringify([
            { type: "MANDATE_AUTHORIZATION", status: "VERIFIED" },
            { type: "PAYPAL_CAPTURE_RECEIPT", status: "VERIFIED" },
            { type: "AGENT_REASONING_LOG", status: "VERIFIED" },
          ]),
          qrCodePayload: `https://passport.internal/verify/${passportNumber}`,
        },
      });

      purchase = {
        ...createdPurchase,
        passport,
      } as any;
    }

    if (!purchase!.passport) {
      const passportNumber = `PASS-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}-US`;
      const passportHash = crypto.createHash("sha256").update(purchase!.id + purchase!.paypalOrderId).digest("hex");
      const passport = await prisma.trustPassport.create({
        data: {
          passportNumber,
          purchaseId: purchase!.id,
          mandateId: purchase!.mandateId,
          passportHash,
          signature: `SIG-${crypto.randomBytes(16).toString("hex")}`,
          status: "VALID",
          authorizationData: JSON.stringify({
            orderId: purchase!.paypalOrderId,
            amount: purchase!.amount,
          }),
          transactionData: JSON.stringify({
            orderId: purchase!.paypalOrderId,
            captureId: purchase!.paypalCaptureId,
            amount: `$${purchase!.amount.toFixed(2)}`,
          }),
          agentTrailData: JSON.stringify({
            model: "gemini-2.5-pro",
          }),
          refundEligibility: JSON.stringify({
            eligible: true,
            policy: "14-day warranty",
          }),
          disputeReadinessScore: 95,
          evidencePack: JSON.stringify([
            { type: "MANDATE_AUTHORIZATION", status: "VERIFIED" },
            { type: "PAYPAL_CAPTURE_RECEIPT", status: "VERIFIED" },
          ]),
          qrCodePayload: `https://passport.internal/verify/${passportNumber}`,
        },
      });
      purchase!.passport = passport;
    }

    const validPurchase = purchase!;
    const disputeId = `PP-D-${crypto.randomInt(100000, 999999)}`;
    const eventId = `WH-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    await prisma.webhookEvent.create({
      data: {
        paypalEventId: eventId,
        eventType,
        summary: `Simulated PayPal Webhook: ${eventType} on Order ${validPurchase.paypalOrderId}`,
        payload: JSON.stringify({
          id: eventId,
          event_type: eventType,
          resource: {
            dispute_id: disputeId,
            seller_transaction_id: validPurchase.paypalCaptureId || validPurchase.paypalOrderId,
            dispute_amount: { currency_code: validPurchase.currency, value: validPurchase.amount.toFixed(2) },
            reason: "UNAUTHORIZED_TRANSACTION",
          },
        }),
        signatureValid: true,
        simulated: true,
        processed: true,
      },
    });

    const dispute = await prisma.dispute.create({
      data: {
        paypalDisputeId: disputeId,
        purchaseId: validPurchase.id,
        passportId: validPurchase.passport?.id || null,
        status: "ACTION_REQUIRED",
        disputeReason: "UNAUTHORIZED_TRANSACTION",
        disputeAmount: validPurchase.amount,
        currency: validPurchase.currency,
        dueDate: new Date(Date.now() + 7 * 86400000),
        buyerNotes: "Cardholder reported unrecognized digital charge; claims card details were compromised.",
      },
    });

    await prisma.purchase.update({
      where: { id: validPurchase.id },
      data: { status: "DISPUTED" },
    });

    if (validPurchase.passport?.id) {
      await prisma.trustPassport.update({
        where: { id: validPurchase.passport.id },
        data: { status: "DISPUTED" },
      });
    }

    const autopsy = await runDisputeAutopsy(dispute.id);

    await logAuditEvent({
      mandateId: validPurchase.mandateId,
      action: "DISPUTE_RECEIVED",
      actor: "PAYPAL_WEBHOOK",
      actorModel: "simulated-webhook-trigger",
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        webhookId: eventId,
      },
    });

    return res.json({
      success: true,
      eventId,
      dispute: autopsy.dispute,
      analysis: autopsy.analysis,
    });
  } catch (err) {
    console.error("Demo webhook error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
