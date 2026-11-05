export interface MandateValidationInput {
  mandate: {
    id: string;
    title: string;
    maxAmount: number;
    currency: string;
    allowedCategories: string | string[];
    expiresAt: Date | string;
    status: string;
    revoked?: boolean;
  };
  proposal: {
    itemName: string;
    itemCategory: string;
    amount: number;
    currency: string;
    recipient: string;
    reasoning?: string;
    isPromptInjection?: boolean;
    rawPrompt?: string;
  };
  currentSpentAmount?: number;
}

export interface ValidationCheckResult {
  name: string;
  passed: boolean;
  message: string;
  details: Record<string, unknown>;
}

export type PolicyOutcome = "ALLOW" | "NEEDS_APPROVAL" | "BLOCK";

export interface ValidationResult {
  isApproved: boolean;
  outcome: PolicyOutcome;
  status: "APPROVED" | "NEEDS_APPROVAL" | "BLOCKED";
  requiresStepUpApproval: boolean;
  excessPercentage: number;
  reasonCode?: string;
  violationReason?: string;
  checks: Record<string, ValidationCheckResult>;
}

export function validateProposalAgainstMandate(input: MandateValidationInput): ValidationResult {
  const { mandate, proposal, currentSpentAmount = 0 } = input;
  const checks: Record<string, ValidationCheckResult> = {};
  const violations: string[] = [];

  // 1. Security Check: Prompt Injection / Adversarial Defense
  const textToCheck = `${proposal.itemName} ${proposal.reasoning || ""} ${proposal.rawPrompt || ""}`.toLowerCase();
  const injectionPatterns = [
    /ignore (all )?previous instructions/i,
    /disregard previous instructions/i,
    /system override/i,
    /jailbreak/i,
    /bypass (policy|limits|guardrails|mandate)/i,
    /disregard constraints/i,
  ];
  const isPromptInjection =
    Boolean(proposal.isPromptInjection) ||
    injectionPatterns.some((pattern) => pattern.test(textToCheck));

  checks.securityCheck = {
    name: "Adversarial & Prompt Injection Defense",
    passed: !isPromptInjection,
    message: !isPromptInjection
      ? "Input payload verified free of adversarial prompt injection directives"
      : "Prompt injection attack pattern detected: adversarial override instruction blocked by deterministic policy gate",
    details: { isPromptInjection },
  };

  if (isPromptInjection) {
    violations.push("Security violation: Prompt injection attempt detected. Execution blocked by deterministic gate.");
    return {
      isApproved: false,
      outcome: "BLOCK",
      status: "BLOCKED",
      requiresStepUpApproval: false,
      excessPercentage: 0,
      reasonCode: "PROMPT_INJECTION_DETECTED",
      violationReason: "Security violation: Prompt injection attempt detected. Execution blocked by deterministic gate.",
      checks,
    };
  }

  // 2. Kill Switch & Revocation Check
  const isRevoked = Boolean(mandate.revoked) || mandate.status.toUpperCase() === "REVOKED";
  checks.revocationCheck = {
    name: "Emergency Kill Switch Status",
    passed: !isRevoked,
    message: !isRevoked
      ? "Mandate is intact and not revoked by emergency kill switch"
      : "Mandate was revoked by emergency kill switch. All execution halted immediately.",
    details: { revoked: isRevoked, status: mandate.status },
  };

  if (isRevoked) {
    violations.push("Mandate has been revoked by emergency kill switch.");
    return {
      isApproved: false,
      outcome: "BLOCK",
      status: "BLOCKED",
      requiresStepUpApproval: false,
      excessPercentage: 0,
      reasonCode: "MANDATE_REVOKED",
      violationReason: "Mandate has been revoked by emergency kill switch. All execution halted.",
      checks,
    };
  }

  // 3. Status Check
  const isStatusActive = mandate.status.toUpperCase() === "ACTIVE";
  checks.statusCheck = {
    name: "Mandate Active Check",
    passed: isStatusActive,
    message: isStatusActive ? "Mandate is in ACTIVE state" : `Mandate is currently ${mandate.status}`,
    details: { mandateStatus: mandate.status },
  };
  if (!isStatusActive) {
    violations.push(`Mandate is not ACTIVE (status: ${mandate.status})`);
  }

  // 4. Expiry Check
  const expiryDate = new Date(mandate.expiresAt);
  const now = new Date();
  const isExpired = now.getTime() > expiryDate.getTime();
  checks.expiryCheck = {
    name: "Time Expiry Check",
    passed: !isExpired,
    message: !isExpired
      ? `Mandate is valid until ${expiryDate.toLocaleString()}`
      : `Mandate expired on ${expiryDate.toLocaleString()}`,
    details: {
      now: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
    },
  };
  if (isExpired) {
    violations.push(`Mandate expired on ${expiryDate.toLocaleString()}`);
  }

  // 5. Currency Check
  const isCurrencyValid = proposal.currency.toUpperCase() === mandate.currency.toUpperCase();
  checks.currencyCheck = {
    name: "Currency Compatibility Check",
    passed: isCurrencyValid,
    message: isCurrencyValid
      ? `Currency ${proposal.currency} matches mandate ${mandate.currency}`
      : `Currency mismatch: proposal uses ${proposal.currency}, mandate requires ${mandate.currency}`,
    details: {
      proposalCurrency: proposal.currency,
      mandateCurrency: mandate.currency,
    },
  };
  if (!isCurrencyValid) {
    violations.push(`Currency mismatch: expected ${mandate.currency}, received ${proposal.currency}`);
  }

  // 6. Category Check
  let allowedCategories: string[] = [];
  try {
    allowedCategories =
      typeof mandate.allowedCategories === "string"
        ? JSON.parse(mandate.allowedCategories)
        : mandate.allowedCategories;
  } catch {
    allowedCategories = [String(mandate.allowedCategories)];
  }

  const normalizedAllowed = allowedCategories.map((c) => c.trim().toLowerCase());
  const proposalCat = proposal.itemCategory.trim().toLowerCase();

  const isCategoryMatch = normalizedAllowed.some(
    (cat) => cat === proposalCat || proposalCat.includes(cat) || cat.includes(proposalCat)
  );

  checks.categoryCheck = {
    name: "Authorized Category Check",
    passed: isCategoryMatch,
    message: isCategoryMatch
      ? `Item category '${proposal.itemCategory}' is permitted under mandate authorized categories`
      : `Category '${proposal.itemCategory}' is outside permitted categories [${allowedCategories.join(", ")}]`,
    details: {
      proposalCategory: proposal.itemCategory,
      allowedCategories,
    },
  };
  if (!isCategoryMatch) {
    violations.push(
      `Category '${proposal.itemCategory}' is outside authorized categories [${allowedCategories.join(", ")}]`
    );
  }

  // 7. Amount & Cap Check with Three-Outcome Policy Engine
  const effectiveAmount = Number(proposal.amount);
  const maxAllowed = Number(mandate.maxAmount);
  const varianceToleranceRatio = 0.20; // 20% step-up approval allowance
  const toleranceCap = maxAllowed * (1 + varianceToleranceRatio);

  let amountPassed = false;
  let requiresStepUpApproval = false;
  let excessPercentage = 0;

  if (effectiveAmount <= maxAllowed) {
    amountPassed = true;
    checks.amountCheck = {
      name: "Budget Cap Check",
      passed: true,
      message: `Proposal amount $${effectiveAmount.toFixed(2)} is within authorized mandate cap of $${maxAllowed.toFixed(2)}`,
      details: {
        proposalAmount: effectiveAmount,
        mandateMaxAmount: maxAllowed,
        currentSpent: currentSpentAmount,
        projectedTotal: currentSpentAmount + effectiveAmount,
      },
    };
  } else if (effectiveAmount <= toleranceCap) {
    // Within 20% tolerance: NEEDS_APPROVAL
    excessPercentage = Number((((effectiveAmount - maxAllowed) / maxAllowed) * 100).toFixed(1));
    requiresStepUpApproval = true;
    checks.amountCheck = {
      name: "Budget Cap Check (Step-Up Approval Required)",
      passed: false,
      message: `Proposal amount $${effectiveAmount.toFixed(2)} exceeds authorized cap of $${maxAllowed.toFixed(2)} by ${excessPercentage}% (within 20% tolerance). Step-up human approval required before execution.`,
      details: {
        proposalAmount: effectiveAmount,
        mandateMaxAmount: maxAllowed,
        excessPercentage,
        toleranceCap,
      },
    };
  } else {
    // Exceeds 20% tolerance: BLOCK
    excessPercentage = Number((((effectiveAmount - maxAllowed) / maxAllowed) * 100).toFixed(1));
    checks.amountCheck = {
      name: "Budget Cap Check (Hard Block)",
      passed: false,
      message: `Proposal amount $${effectiveAmount.toFixed(2)} exceeds maximum cap $${maxAllowed.toFixed(2)} by ${excessPercentage}% (exceeds 20% allowance). Hard blocked.`,
      details: {
        proposalAmount: effectiveAmount,
        mandateMaxAmount: maxAllowed,
        excessPercentage,
        toleranceCap,
      },
    };
    violations.push(
      `Amount ($${effectiveAmount.toFixed(2)}) exceeds maximum authorized cap of $${maxAllowed.toFixed(2)} by ${excessPercentage}%`
    );
  }

  // Determine final outcome
  let outcome: PolicyOutcome = "BLOCK";
  let status: "APPROVED" | "NEEDS_APPROVAL" | "BLOCKED" = "BLOCKED";
  let reasonCode: string | undefined = undefined;

  // If there are hard violations (expiry, category, currency, hard budget excess)
  if (violations.length > 0) {
    outcome = "BLOCK";
    status = "BLOCKED";
    if (!isCategoryMatch) reasonCode = "CATEGORY_DISALLOWED";
    else if (isExpired) reasonCode = "MANDATE_EXPIRED";
    else if (!isCurrencyValid) reasonCode = "CURRENCY_MISMATCH";
    else reasonCode = "BUDGET_EXCEEDED";
  } else if (requiresStepUpApproval) {
    outcome = "NEEDS_APPROVAL";
    status = "NEEDS_APPROVAL";
    reasonCode = "BUDGET_VARIANCE_TOLERANCE";
  } else {
    outcome = "ALLOW";
    status = "APPROVED";
  }

  const isApproved = outcome === "ALLOW";

  return {
    isApproved,
    outcome,
    status,
    requiresStepUpApproval,
    excessPercentage,
    reasonCode,
    violationReason: isApproved
      ? requiresStepUpApproval
        ? `Variance of ${excessPercentage}% exceeds budget cap but qualifies for Step-Up Human Approval.`
        : undefined
      : violations.join("; "),
    checks,
  };
}
