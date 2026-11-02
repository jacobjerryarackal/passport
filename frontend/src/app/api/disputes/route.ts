import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { runDisputeAutopsy } from "@/server/agents/dispute-agent";
import { logAuditEvent } from "@/server/audit/logger";
import * as crypto from "crypto";

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        purchase: {
          include: {
            mandate: true,
            proposal: true,
            passport: true,
          },
        },
        passport: true,
        evidenceItems: true,
      },
    });

    return NextResponse.json({ disputes });
  } catch (err) {
    console.error("GET /api/disputes error:", err);
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}

// POST: Simulate or trigger a dispute on a purchase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { purchaseId, reason = "UNAUTHORIZED_TRANSACTION", buyerNotes } = body;

    let targetPurchase = null;
    if (purchaseId) {
      targetPurchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { passport: true },
      });
    } else {
      // Find latest completed purchase with passport
      targetPurchase = await prisma.purchase.findFirst({
        where: { status: { in: ["COMPLETED", "DISPUTED"] } },
        orderBy: { createdAt: "desc" },
        include: { passport: true },
      });
    }

    if (!targetPurchase) {
      return NextResponse.json({ error: "No eligible purchase found to dispute" }, { status: 404 });
    }

    const paypalDisputeId = `PP-D-${crypto.randomInt(100000, 999999)}`;
    const dueDate = new Date(Date.now() + 7 * 86400000);

    const dispute = await prisma.dispute.create({
      data: {
        paypalDisputeId,
        purchaseId: targetPurchase.id,
        passportId: targetPurchase.passport?.id || null,
        status: "ACTION_REQUIRED",
        disputeReason: reason,
        disputeAmount: targetPurchase.amount,
        currency: targetPurchase.currency,
        disputeLifeCycleStage: "CHARGEBACK",
        dueDate,
        buyerNotes:
          buyerNotes ||
          "Cardholder reported unrecognized digital transaction and filed chargeback claiming unauthorized access.",
      },
    });

    // Mark purchase as disputed
    await prisma.purchase.update({
      where: { id: targetPurchase.id },
      data: { status: "DISPUTED" },
    });

    if (targetPurchase.passport?.id) {
      await prisma.trustPassport.update({
        where: { id: targetPurchase.passport.id },
        data: { status: "DISPUTED" },
      });
    }

    await logAuditEvent({
      mandateId: targetPurchase.mandateId,
      action: "DISPUTE_RECEIVED",
      actor: "PAYPAL_WEBHOOK",
      actorModel: "dispute-simulator",
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        reason: dispute.disputeReason,
        amount: dispute.disputeAmount,
      },
    });

    // Run Chargeback Autopsy automatically!
    const autopsyResult = await runDisputeAutopsy(dispute.id);

    return NextResponse.json({
      dispute: autopsyResult.dispute,
      analysis: autopsyResult.analysis,
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/disputes error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

