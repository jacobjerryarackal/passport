import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { verifyPayPalWebhookSignature } from "@/server/paypal/webhooks";
import { logAuditEvent } from "@/server/audit/logger";
import { runDisputeAutopsy } from "@/server/agents/dispute-agent";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const headers = req.headers;
    const transmissionId = headers.get("paypal-transmission-id") || "";
    const transmissionTime = headers.get("paypal-transmission-time") || "";
    const certUrl = headers.get("paypal-cert-url") || "";
    const authAlgo = headers.get("paypal-auth-algo") || "";
    const transmissionSig = headers.get("paypal-transmission-sig") || "";

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

    // Process dispute event
    if (eventType === "CUSTOMER.DISPUTE.CREATED") {
      const resource = body.resource;
      const disputeId = resource?.dispute_id || `PP-D-${crypto.randomInt(100000, 999999)}`;
      const amount = parseFloat(resource?.dispute_amount?.value || "75.00");
      const reason = resource?.reason || "UNAUTHORIZED_TRANSACTION";

      // Match to a purchase by seller_transaction_id or latest purchase
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
        // Create dispute if not exists
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

    return NextResponse.json({
      received: true,
      verification,
      eventId,
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

