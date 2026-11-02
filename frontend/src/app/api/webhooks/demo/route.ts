import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { runDisputeAutopsy } from "@/server/agents/dispute-agent";
import { logAuditEvent } from "@/server/audit/logger";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { eventType = "CUSTOMER.DISPUTE.CREATED" } = await req.json().catch(() => ({}));

    // Find latest purchase
    const purchase = await prisma.purchase.findFirst({
      where: { status: { in: ["COMPLETED", "DISPUTED"] } },
      orderBy: { createdAt: "desc" },
      include: { passport: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "No completed purchase found to attach simulated webhook" }, { status: 404 });
    }

    const disputeId = `PP-D-${crypto.randomInt(100000, 999999)}`;
    const eventId = `WH-SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Record webhook event
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

    // Create dispute
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

    // Update purchase & passport status
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

    // Run Autopsy
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

    return NextResponse.json({
      success: true,
      eventId,
      dispute: autopsy.dispute,
      analysis: autopsy.analysis,
    });
  } catch (err) {
    console.error("Demo webhook error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

