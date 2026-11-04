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
    const rawBody = typeof body === "string" ? body : JSON.stringify(body);

    const transmissionId = (req.headers["paypal-transmission-id"] as string) || "";
    const transmissionTime = (req.headers["paypal-transmission-time"] as string) || "";
    const certUrl = (req.headers["paypal-cert-url"] as string) || "";
    const authAlgo = (req.headers["paypal-auth-algo"] as string) || "";
    const transmissionSig = (req.headers["paypal-transmission-sig"] as string) || "";

    // Signature verification
    const verification = await verifyPayPalWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookId: process.env.PAYPAL_WEBHOOK_ID || "",
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

    const purchase = await prisma.purchase.findFirst({
      where: { status: { in: ["COMPLETED", "DISPUTED"] } },
      orderBy: { createdAt: "desc" },
      include: { passport: true },
    });

    if (!purchase) {
      return res.status(404).json({ error: "No completed purchase found to attach simulated webhook" });
    }

    const disputeId = `PP-D-${crypto.randomInt(100000, 999999)}`;
    const eventId = `WH-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    await prisma.webhookEvent.create({
      data: {
        paypalEventId: eventId,
        eventType,
        summary: `Simulated PayPal Webhook: ${eventType} on Order ${purchase.paypalOrderId}`,
        payload: JSON.stringify({
          id: eventId,
          event_type: eventType,
          resource: {
            dispute_id: disputeId,
            seller_transaction_id: purchase.paypalCaptureId || purchase.paypalOrderId,
            dispute_amount: { currency_code: purchase.currency, value: purchase.amount.toFixed(2) },
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
        purchaseId: purchase.id,
        passportId: purchase.passport?.id || null,
        status: "ACTION_REQUIRED",
        disputeReason: "UNAUTHORIZED_TRANSACTION",
        disputeAmount: purchase.amount,
        currency: purchase.currency,
        dueDate: new Date(Date.now() + 7 * 86400000),
        buyerNotes: "Cardholder reported unrecognized digital charge; claims card details were compromised.",
      },
    });

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "DISPUTED" },
    });

    if (purchase.passport?.id) {
      await prisma.trustPassport.update({
        where: { id: purchase.passport.id },
        data: { status: "DISPUTED" },
      });
    }

    const autopsy = await runDisputeAutopsy(dispute.id);

    await logAuditEvent({
      mandateId: purchase.mandateId,
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
