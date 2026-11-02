# Passport — Official Demo Presentation Script (3 Minutes)

> Walkthrough script for the PayPal AI Hackathon judging panel.

---

## 🎬 Narrative Arc
**The Pitch**: AI agents are being given credit cards and API wallets to buy software, book travel, and purchase gifts. But when an agent spends money, who authorized it? Can you prove it stayed within bounds? And if the cardholder charges it back, how do you defend the case?

**The Solution**: Passport — an institutional trust, receipt, and dispute-defense layer for AI-agent purchases.

---

## ⏱️ Minute-by-Minute Script

### 0:00 - 0:35 | The Problem & Landing Page
1. **Open `http://localhost:3000`**:
   - Showcase the premium fintech landing page (dark/light theme, Trust Passport animation, PayPal badge).
   - Point out the 3 core problems: *No spending mandate*, *No verifiable receipt*, *No dispute evidence*.
2. **Click "Interactive Demo" (`/demo`)** or **"Launch App" (`/dashboard`)**:
   - Highlight the live KPI cards: Protected Spend Volume ($75 / $80 cap), 1 Active Mandate, 1 Trust Passport issued, 1 Active Chargeback Autopsy.

---

### 0:35 - 1:15 | The Exact MVP Vertical: Mandates & Guardrails
1. **Navigate to Spend Mandates (`/mandates`)**:
   - Show Mandate `mandate-gift-card-demo`:
     - Purpose: *"Client appreciation gift"*
     - Cap: **$80.00 USD**
     - Allowed Category: `digital gift cards`
     - Expiry: 24 Hours
   - Click **"New Spend Mandate"**:
     - Type: *"Authorize my AI agent to buy a digital gift card for a client, up to $80, valid for 24 hours."*
     - Click **"Parse with Gemini"** &rarr; show instant structured field extraction!

---

### 1:15 - 1:55 | The Agent Purchase Console: Blocked vs Approved
1. **Navigate to Agent Purchase Console (`/purchases`)**:
   - **Demonstrate the Blocked Scenario**:
     - Click **"Scenario B: Policy-Violating Proposal"** ($120 Physical Office Chair).
     - Show the instant rejection:
       - Amount Check: **FAILED** ($120 > $80 limit)
       - Category Check: **FAILED** (`physical equipment` not in allowed list)
       - Action: **EXECUTION BLOCKED** & logged into audit ledger!
   - **Demonstrate the Approved Scenario**:
     - Click **"Scenario A: Authorized Proposal"** ($75 Starbucks Digital Gift Card).
     - Show policy compliance: all 3 checks **PASSED**.
     - Click **"Execute via PayPal ($75.00)"**:
       - PayPal Sandbox Order created & captured.
       - Confetti fires! Trust Passport `PASS-2026-8942-US` is issued with instant Seller Protection eligibility!

---

### 1:55 - 2:35 | The Trust Passport & Chargeback Autopsy
1. **Inspect Trust Passport (`/passports/pass-giftcard-75`)**:
   - Show the 5 verifiable tabs:
     1. *Authorization*: Human mandate snapshot.
     2. *Transaction*: PayPal Order ID & Capture ID.
     3. *Agent Trail*: Gemini chain of thought transcript.
     4. *Receipt*: Digital gift card dispatch destination.
     5. *Dispute Readiness*: Score 98/100.
   - Click **"Copy Hash"** &rarr; SHA-256 fingerprint verified by platform HMAC.
2. **Click "Simulate Dispute Webhook" or open `/disputes/disp-chargeback-demo`**:
   - The cardholder filed a chargeback claiming "Unauthorized Transaction".
   - Show the **Chargeback Autopsy Room**:
     - Gemini AI Classification: Strategy `COMPELLING_EVIDENCE_DIGITAL_DELIVERY`, Risk: Low (Merchant Favor).
     - Evidence Assembly Checklist: 5 of 5 proofs automatically reconciled.
     - Evidence Gap Analysis: identified recipient acknowledgment mitigation.
     - Draft Response text: formal legal defense citing the Trust Passport.

---

### 2:35 - 3:00 | Human Co-Signature & Tamper-Evident Ledger
1. **Click "Co-Sign Defense Package"**:
   - Highlight the strict security rule: *AI is never allowed to unilaterally submit dispute responses or touch funds*.
   - Signer: `Jacob (Authorized Business Owner)`.
   - Click **"Co-Sign & Submit to PayPal"**:
     - Payload submitted to PayPal Disputes API.
     - Dispute marked as `SUBMITTED`.
2. **Navigate to Audit Log (`/audit`)**:
   - Showcase the Merkle parent-hash chaining:
     - `MANDATE_CREATED` &rarr; `VALIDATION_BLOCKED` &rarr; `VALIDATION_PASSED` &rarr; `PAYPAL_ORDER_CAPTURED` &rarr; `PASSPORT_ISSUED` &rarr; `DISPUTE_RECEIVED` &rarr; `HUMAN_COSIGNED` &rarr; `DISPUTE_SUBMITTED`.
   - **Merkle Hash Chain Integrity: 100% INTACT**.

---

## 🏆 Key Takeaways for Judges
1. **PayPal is Central**: Uses PayPal Orders v2, PayPal Disputes v1, PayPal Webhooks, and connects to the PayPal MCP endpoint.
2. **Complete Vertical Slice**: Proves both the successful $75 purchase and the blocked $120 unauthorized attempt.
3. **Institutional Trust**: Combines Gemini AI reasoning with deterministic cryptographic signatures and required human co-signatures.

