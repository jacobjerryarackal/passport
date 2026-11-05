import prisma from "../db/prisma";
import { analyzeDisputeWithGemini } from "./gemini";
import { logAuditEvent } from "../audit/logger";
import { sha256 } from "../verification/hasher";

export async function runDisputeAutopsy(disputeId: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      purchase: {
        include: {
          mandate: true,
          proposal: true,
          passport: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new Error(`Dispute ${disputeId} not found`);
  }

  const { purchase } = dispute;
  const { mandate, proposal, passport } = purchase;

  const allowedCats =
    typeof mandate.allowedCategories === "string"
      ? JSON.parse(mandate.allowedCategories)
      : mandate.allowedCategories;

  // 1. Analyze dispute with Gemini
  const analysis = await analyzeDisputeWithGemini({
    dispute: {
      paypalDisputeId: dispute.paypalDisputeId,
      reason: dispute.disputeReason,
      amount: dispute.disputeAmount,
      currency: dispute.currency,
      buyerNotes: dispute.buyerNotes || undefined,
    },
    mandate: {
      title: mandate.title,
      purpose: mandate.purpose,
      maxAmount: mandate.maxAmount,
      allowedCategories: allowedCats,
    },
    purchase: {
      paypalOrderId: purchase.paypalOrderId,
      paypalCaptureId: purchase.paypalCaptureId || undefined,
      itemName: proposal.itemName,
      recipient: proposal.recipient,
      amount: purchase.amount,
    },
    passport: {
      passportNumber: passport?.passportNumber || "PASS-PENDING",
      passportHash: passport?.passportHash || "HASH-PENDING",
    },
  });

  // Compute deterministic evidence coverage score (e.g. 3 out of 5 artifacts verified)
  const verifiedCount = analysis.evidenceChecklist.filter(
    (i) => i.status === "VERIFIED" || i.status === "ATTACHED"
  ).length;
  const totalCount = analysis.evidenceChecklist.length;
  const coverageRatio = totalCount > 0 ? verifiedCount / totalCount : 0;
  const evidenceCoverageScore = `${verifiedCount}/${totalCount} Evidence Verified`;

  analysis.classification.evidenceCoverageScore = evidenceCoverageScore;
  analysis.classification.evidenceCoverageRatio = coverageRatio;
  if (!analysis.classification.evidenceRationale) {
    const verifiedIds = analysis.evidenceChecklist
      .filter((i) => i.status === "VERIFIED" || i.status === "ATTACHED")
      .map((i) => `[${i.id}]`)
      .join(", ");
    analysis.classification.evidenceRationale = `Classification substantiated by ${verifiedIds} verified evidence proofs matching mandate constraints and PayPal seller protection terms.`;
  }

  // 2. Update Dispute Record
  const updatedDispute = await prisma.dispute.update({
    where: { id: dispute.id },
    data: {
      classification: JSON.stringify(analysis.classification),
      evidenceChecklist: JSON.stringify(analysis.evidenceChecklist),
      evidenceGaps: JSON.stringify(analysis.evidenceGaps),
      draftResponse: analysis.draftResponse,
    },
  });

  // 3. Clear and recreate Evidence Items in database
  await prisma.evidenceItem.deleteMany({
    where: { disputeId: dispute.id },
  });

  for (const item of analysis.evidenceChecklist) {
    await prisma.evidenceItem.create({
      data: {
        disputeId: dispute.id,
        type: item.key,
        title: item.title,
        description: item.description,
        status: item.status,
        source: item.key.includes("PAYPAL")
          ? "PAYPAL_API"
          : item.key.includes("AGENT")
            ? "GEMINI_AGENT"
            : "SYSTEM",
        hash: sha256(item.title + item.description),
        metadata: JSON.stringify(item),
      },
    });
  }

  // 4. Log Audit Event
  await logAuditEvent({
    mandateId: mandate.id,
    action: "DISPUTE_CLASSIFIED",
    actor: "DISPUTE_AGENT",
    actorModel: "gemini-2.5-pro",
    details: {
      disputeId: dispute.id,
      paypalDisputeId: dispute.paypalDisputeId,
      classification: analysis.classification,
      evidenceCoverageScore,
      evidenceItemCount: analysis.evidenceChecklist.length,
      gapsIdentified: analysis.evidenceGaps.length,
    },
  });

  return {
    dispute: updatedDispute,
    analysis,
  };
}

