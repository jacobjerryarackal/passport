export interface MandateValidationInput {
  mandate: {
    id: string;
    title: string;
    maxAmount: number;
    currency: string;
    allowedCategories: string | string[];
    expiresAt: Date | string;
    status: string;
  };
  proposal: {
    itemName: string;
    itemCategory: string;
    amount: number;
    currency: string;
    recipient: string;
  };
  currentSpentAmount?: number;
}

export interface ValidationCheckResult {
  name: string;
  passed: boolean;
  message: string;
  details: Record<string, unknown>;
}

export interface ValidationResult {
  isApproved: boolean;
  status: "APPROVED" | "BLOCKED";
  violationReason?: string;
  checks: Record<string, ValidationCheckResult>;
}

export function validateProposalAgainstMandate(input: MandateValidationInput): ValidationResult {
  const { mandate, proposal, currentSpentAmount = 0 } = input;
  const checks: Record<string, ValidationCheckResult> = {};
  const violations: string[] = [];

  // 1. Status Check
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

  // 2. Expiry Check
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

  // 3. Amount & Cap Check
  const effectiveAmount = Number(proposal.amount);
  const maxAllowed = Number(mandate.maxAmount);
  // A proposal is only blocked if proposalAmount > mandateMaxAmount (allowing amounts <= cap)
  const isAmountValid = effectiveAmount <= maxAllowed;

  checks.amountCheck = {
    name: "Budget Cap Check",
    passed: isAmountValid,
    message: isAmountValid
      ? `Proposal amount $${effectiveAmount.toFixed(2)} is within authorized mandate cap of $${maxAllowed.toFixed(2)}`
      : `Proposal amount $${effectiveAmount.toFixed(2)} exceeds authorized mandate cap of $${maxAllowed.toFixed(2)}`,
    details: {
      proposalAmount: effectiveAmount,
      mandateMaxAmount: maxAllowed,
      currentSpent: currentSpentAmount,
      projectedTotal: currentSpentAmount + effectiveAmount,
    },
  };
  if (!isAmountValid) {
    violations.push(
      `Amount ($${effectiveAmount.toFixed(2)}) exceeds maximum authorized cap of $${maxAllowed.toFixed(2)}`
    );
  }

  // 4. Currency Check
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

  // 5. Category Check
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

  // Flexible category matching: exact match or contains substring
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

  const isApproved = violations.length === 0;

  return {
    isApproved,
    status: isApproved ? "APPROVED" : "BLOCKED",
    violationReason: isApproved ? undefined : violations.join("; "),
    checks,
  };
}

