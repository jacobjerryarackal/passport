# Passport — Security Model & Threat Mitigation

> Security architecture, cryptographic boundaries, and threat mitigation for autonomous financial agents.

---

## 1. Threat Vectors in Autonomous Spending

| Threat Vector | Description | How Passport Mitigates It |
|---------------|-------------|----------------------------|
| **Prompt Injection** | Malicious seller descriptions or user inputs instruct the agent to ignore budget limits or send funds elsewhere. | **Deterministic Code Boundary**: The Mandate Guard runs in isolated TypeScript outside the LLM context. Even if an LLM outputs $10,000, the validator strictly drops it before calling PayPal. |
| **Category Evasion** | Agent tries to purchase unauthorized goods (e.g. physical hardware instead of digital gift cards). | **Strict Category Normalization**: Categories are matched against owner-authorized arrays. Unrecognized categories fail validation immediately. |
| **Silent Overspend** | Multiple small agent transactions cumulatively drain balances beyond intended limits. | **Cumulative Spend Tracking**: Mandate records calculate `currentSpent + proposal.amount <= maxAmount`. Once exhausted, status auto-shifts to `EXHAUSTED`. |
| **Replay & Tampering** | Dispute records or receipts modified after execution to forge authorization. | **SHA-256 Merkle Chaining**: Every event points to its parent's SHA-256 hash. Modifying any past event invalidates the entire audit chain. |
| **Webhook Spoofing** | Adversary sends fake chargeback notifications to trigger unauthorized refunds. | **Cryptographic Signature Verification**: Incoming webhook headers are validated against PayPal's verification endpoint with public certificate checks. |
| **Rogue Agent Submissions** | An agent automatically settling disputes or refunding buyers without authorization. | **Mandatory Human Co-Signature**: Refunds and dispute submissions strictly require human admin credentials and confirmation modals. |

---

## 2. Cryptographic Attestation Pipeline

Every Trust Passport is generated through a canonical, tamper-evident pipeline:

```
Canonical Payload:
  MANDATE:<mandateId>|
  PURCHASE:<purchaseId>|
  PAYPAL_ORDER:<orderId>|
  AMOUNT:<amount>_<currency>|
  RECIPIENT:<recipient>|
  AGENT:<agentModel>|
  TIME:<timestamp>
      │
      ▼
   SHA-256 Digest
      │
      ▼
HMAC-SHA256 Platform Attestation
```

---

## 3. Human-in-the-Loop Safeguards
Under no circumstances does Passport permit:
1. Automated submission of legal dispute responses without human co-signature.
2. Unilateral money movement outside of verified human mandates.
3. Modification of immutable audit log records.

