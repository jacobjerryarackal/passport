import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { submitDisputeEvidence } from "@/server/paypal/disputes";
import { logAuditEvent } from "@/server/audit/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { cosignedBy, finalResponseText } = await req.json();

    if (!cosignedBy || typeof cosignedBy !== "string") {
      return NextResponse.json({ error: "Human approver name or identity is required to co-sign" }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        evidenceItems: true,
        purchase: {
          include: { mandate: true },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const now = new Date();
    const effectiveResponse = finalResponseText || dispute.draftResponse || "Evidence package submitted.";

    // 1. Submit evidence payload to PayPal API
    const submissionResult = await submitDisputeEvidence({
      disputeId: dispute.paypalDisputeId,
      notes: effectiveResponse,
      evidenceType: "PROOF_OF_FULFILLMENT",
      evidenceItems: dispute.evidenceItems.map((e) => ({ title: e.title, hash: e.hash })),
      cosignedBy,
    });

    // 2. Update Dispute in Database
    const updated = await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "SUBMITTED",
        cosignedBy,
        cosignedAt: now,
        submittedAt: now,
        draftResponse: effectiveResponse,
        submissionPayload: JSON.stringify({
          disputeId: dispute.paypalDisputeId,
          cosignedBy,
          submittedAt: now.toISOString(),
          submissionResult,
        }),
      },
    });

    // 3. Log Human Co-Signature Audit Event
    await logAuditEvent({
      mandateId: dispute.purchase.mandateId,
      action: "HUMAN_COSIGNED",
      actor: "HUMAN_ADMIN",
      actorModel: "dispute-co-sign-modal",
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        cosignedBy,
        cosignedAt: now.toISOString(),
      },
    });

    // 4. Log Dispute Submission Event
    await logAuditEvent({
      mandateId: dispute.purchase.mandateId,
      action: "DISPUTE_SUBMITTED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: "paypal-disputes-v1-client",
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        isSimulated: submissionResult.isSimulated,
      },
    });

    return NextResponse.json({
      success: true,
      dispute: updated,
      submissionResult,
    });
  } catch (err) {
    console.error("POST /api/disputes/[id]/cosign error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

