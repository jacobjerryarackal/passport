# Passport — System Architecture

> A trust, verifiable receipt, and dispute-defense layer for AI-agent purchases powered by PayPal Sandbox and Google Gemini.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph HumanOwner["1. Human Business Owner"]
        A[Creates Spend Mandate] --> B[Plain English Prompt]
    end

    subgraph PassportIngress["2. Ingress & Policy Parsing"]
        B --> C[Gemini Natural Language Parser]
        C --> D[Cryptographic Mandate Record]
        D --> E[Status: ACTIVE, Cap: $80, Cat: Digital Gift Cards]
    end

    subgraph AgentLayer["3. Autonomous Agent Execution"]
        F[AI Purchasing Agent] --> G{Propose Purchase}
        G -->|Scenario B: $120 Chair| H[Passport Guard Engine]
        H -->|FAIL: Cap & Cat Violation| I[BLOCKED & Logged in Audit]
        G -->|Scenario A: $75 Gift Card| H
        H -->|PASS: Strict Compliance| J[APPROVED Proposal]
    end

    subgraph PayPalGateway["4. PayPal Sandbox Gateway"]
        J --> K[PayPal Orders v2 API /orders]
        K --> L[Capture Order /capture]
        L --> M[Instant Settlement & Seller Protection: ELIGIBLE]
    end

    subgraph TrustPassportCore["5. Trust Passport Engine"]
        M --> N[Assemble Attestation Payload]
        N --> O[SHA-256 Merkle Fingerprinting]
        O --> P[HMAC Platform Signature]
        P --> Q[Trust Passport PASS-2026-XXXX]
    end

    subgraph DisputeDefense["6. Autonomous Chargeback Autopsy"]
        R[PayPal Dispute Webhook] --> S[Webhook Signature Verification]
        S --> T[Chargeback Forensics Agent - Gemini]
        T --> U[Evidence Assembly Checklist 5/5]
        U --> V[Evidence Gap Analysis]
        V --> W[Draft Compelling Defense Response]
    end

    subgraph HumanApproval["7. Human Co-Signature Enforcer"]
        W --> X[Human Review & Co-Signature Modal]
        X --> Y[Co-Signed Defense Submitted to PayPal Disputes API]
        Y --> Z[Committed to Tamper-Evident Ledger]
    end

    E --> H
    Q --> T
    I --> Z
    M --> Z
    Q --> Z
```

---

## 2. Core Subsystems

### A. Mandate Enforcement Engine (`server/mandates/validator.ts`)
- **Deterministic Bounding**: Validates proposals before any money-moving API is touched.
- **Constraints Enforced**:
  1. **Budget Cap**: `proposal.amount <= mandate.maxAmount` and cumulative spend limits.
  2. **Category Authorization**: Strict array/regex matching on allowed goods (e.g. `digital gift cards` vs `physical equipment`).
  3. **Time Boundary**: Verified against `mandate.expiresAt`.
  4. **Status Guard**: Only `ACTIVE` mandates permit execution.
- **Audit Commitment**: Every validation outcome (`VALIDATION_PASSED` or `VALIDATION_BLOCKED`) is hashed and recorded with the violation reasons.

### B. PayPal Sandbox Client (`server/paypal/`)
- **Orders API v2**:
  - `POST /v2/checkout/orders`: Creates standard capture orders with reference to the governing mandate ID.
  - `POST /v2/checkout/orders/{id}/capture`: Captures settled funds and evaluates PayPal Seller Protection eligibility.
- **Disputes API v1**:
  - `GET /v1/customer/disputes`: Retrieves live customer dispute records.
  - `POST /v1/customer/disputes/{id}/provide-evidence`: Submits structured proof of fulfillment and co-signed merchant defense.
- **Webhook Signature Verification**:
  - Verifies PayPal transmission headers (`PAYPAL-TRANSMISSION-ID`, `PAYPAL-CERT-URL`, `PAYPAL-TRANSMISSION-SIG`) using PayPal's `/v1/notifications/verify-webhook-signature`.
- **PayPal MCP Endpoint**:
  - Interfaces with the PayPal Agent Toolkit sandbox endpoint at `https://mcp.sandbox.paypal.com`.

### C. Trust Passport Credential (`server/verification/hasher.ts`)
- Each completed purchase generates a **Trust Passport**:
  - **SHA-256 Canonical Fingerprint**: Hashes mandate ID, purchase ID, PayPal order ID, amount, currency, recipient, and agent model into an immutable digest.
  - **HMAC / ECDSA Signature**: Platform cryptographic signature certifying authorization and non-repudiation.
  - **Dispute Readiness Score (0-100)**: Dynamically computed readiness grade based on attached verifiable evidence.

### D. Chargeback Autopsy (`server/agents/dispute-agent.ts`)
- Autonomous dispute forensic engine powered by **Google Gemini 1.5 Pro**:
  1. **Classification**: Evaluates claim reason (e.g. `UNAUTHORIZED_TRANSACTION`), dispute channel, and probability of merchant success.
  2. **Evidence Checklist**: Automatically pulls mandate record, PayPal capture receipt, agent chain-of-thought transcript, delivery confirmation, and terms of service.
  3. **Evidence Gap Analysis**: Flags any missing evidence items (e.g., recipient direct acknowledgment) and provides mitigations.
  4. **Defense Drafting**: Generates a formal merchant response to PayPal referencing the cryptographic Trust Passport.

### E. Human Co-Signature Enforcer
- **Strict Non-Autonomous Spending Boundary**: An AI agent cannot unilaterally settle disputes, submit formal legal defenses, or transfer funds.
- A verified human administrator must explicitly review the compiled evidence bundle and co-sign the payload prior to submission.

