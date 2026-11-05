import { generateAgentProposal } from "./gemini";
import { validateProposalAgainstMandate } from "../mandates/validator";
import { logAuditEvent } from "../audit/logger";
import prisma from "../db/prisma";

export async function runPurchaseAgent(params: {
  mandateId: string;
  userPrompt: string;
  forceBlockedScenario?: boolean;
}) {
  const mandate = await prisma.mandate.findUnique({
    where: { id: params.mandateId },
    include: { purchases: true },
  });

  if (!mandate) {
    throw new Error(`Mandate ${params.mandateId} not found`);
  }

  // 1. Calculate current total spent under this mandate
  const currentSpent = mandate.purchases.reduce((acc, p) => {
    return p.status !== "FAILED" ? acc + p.amount : acc;
  }, 0);

  // 2. Generate proposal via Gemini / Agent logic
  const allowedCats =
    typeof mandate.allowedCategories === "string"
      ? JSON.parse(mandate.allowedCategories)
      : mandate.allowedCategories;

  const rawProposal = await generateAgentProposal({
    mandate: {
      title: mandate.title,
      purpose: mandate.purpose,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: allowedCats,
    },
    userInstruction: params.userPrompt,
    forceBlockedScenario: params.forceBlockedScenario,
  });

  // 3. Strictly Validate Proposal against Mandate
  const validation = validateProposalAgainstMandate({
    mandate: {
      id: mandate.id,
      title: mandate.title,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: allowedCats,
      expiresAt: mandate.expiresAt,
      status: mandate.status,
      revoked: mandate.revoked,
    },
    proposal: rawProposal,
    currentSpentAmount: currentSpent,
  });

  // 4. Save proposal to Database
  const savedProposal = await prisma.purchaseProposal.create({
    data: {
      mandateId: mandate.id,
      agentModel: "gemini-2.5-pro",
      itemName: rawProposal.itemName,
      itemCategory: rawProposal.itemCategory,
      amount: rawProposal.amount,
      currency: rawProposal.currency,
      recipient: rawProposal.recipient,
      reasoning: rawProposal.reasoning,
      validationStatus: validation.status,
      violationReason: validation.violationReason || null,
      validationChecks: JSON.stringify(validation.checks),
    },
  });

  // 5. Append tamper-evident audit log
  await logAuditEvent({
    mandateId: mandate.id,
    action: validation.isApproved ? "VALIDATION_PASSED" : "VALIDATION_BLOCKED",
    actor: "SYSTEM_VALIDATOR",
    actorModel: "passport-guard-engine",
    details: {
      proposalId: savedProposal.id,
      itemName: rawProposal.itemName,
      amount: rawProposal.amount,
      status: validation.status,
      violationReason: validation.violationReason,
      checks: validation.checks,
    },
  });

  return {
    proposal: savedProposal,
    validation,
  };
}

