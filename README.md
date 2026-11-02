# 🛡️ Passport — Trust, Verifiable Receipt & Dispute-Defense Layer for AI-Agent Purchases

> **PayPal AI Hackathon 2026 Project**  
> *"AI agents can spend money. Passport makes every purchase accountable."*

---

## 🌟 Overview

As autonomous AI agents gain the capability to execute real-world transactions through tool-calling and API wallets, small businesses face an existential risk: **how do you prove an AI agent was authorized to spend money, and how do you defend against chargebacks when a cardholder disputes the charge?**

**Passport** is an institutional-grade trust, receipt, and dispute-defense layer for autonomous AI-agent commerce:
1. **Spend Mandates**: A human sets explicit spending boundaries (purpose, budget cap, allowed categories, expiry).
2. **Deterministic Guardrails**: AI purchase proposals are evaluated against strict code rules. Out-of-scope proposals ($120 chair) are blocked before hitting payment rails.
3. **PayPal Sandbox Checkout**: Authorized transactions ($75 digital gift card) are created and captured via the **PayPal Orders v2 API** with instant settlement.
4. **Trust Passport**: An immutable, cryptographically verifiable receipt generated with SHA-256 Merkle fingerprinting and HMAC attestation.
5. **Autonomous Chargeback Autopsy**: When a dispute arrives, **Google Gemini 1.5 Pro** reconciles the evidence checklist, identifies gaps, drafts a formal merchant defense, and enforces a **mandatory human co-signature** prior to PayPal submission.

---

## 🎯 The Exact MVP Vertical Demonstrated

**Scenario**: A small-business owner authorizes an AI assistant to buy a client appreciation gift.

- **Mandate**:
  - Purpose: *"Client appreciation gift"*
  - Maximum Budget: **$80.00 USD**
  - Allowed Category: `digital gift cards`
  - Expiry: 24 Hours
  - Refund Policy: *Refund allowed if purchase is incorrect or unauthorized*

### 🚫 1. The Blocked Attempt
- Agent proposes: **$120.00 Ergonomic Office Chair**
- **Outcome**: Passport strictly blocks it. Reason: exceeds $80 cap ($120 > $80) AND category `physical equipment` is outside authorized categories. Logged to tamper-evident audit ledger.

### ✅ 2. The Approved Purchase & PayPal Checkout
- Agent proposes: **$75.00 Starbucks Digital e-Gift Card**
- **Outcome**: Passport validates proposal &rarr; Calls PayPal Orders v2 API &rarr; Captures $75.00 order with **PayPal Seller Protection: ELIGIBLE** &rarr; Issues Trust Passport `PASS-2026-8942-US`.

### 🛡️ 3. The Dispute & Chargeback Autopsy
- A dispute arrives (`CUSTOMER.DISPUTE.CREATED`) claiming "Unauthorized Transaction".
- Passport runs **Chargeback Autopsy**:
  - Classifies claim with 96% confidence (`COMPELLING_EVIDENCE_DIGITAL_DELIVERY`).
  - Pre-assembles 5-of-5 evidence proofs (Mandate snapshot, PayPal capture receipt, Gemini inference transcript, digital delivery proof, merchant terms).
  - Identifies evidence gaps and mitigations.
  - Generates a compelling defense letter to PayPal.
  - **Human Co-Signature Approval**: Enforces small-business owner co-signature before sending defense payload to PayPal Disputes API.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- `pnpm` or `npm`

### 1. Clone & Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Configure Environment (Optional)
A pre-configured `.env` is already provided for instant local evaluation with SQLite:
```env
DATABASE_URL="file:./dev.db"

# Optional: Add your live PayPal Sandbox credentials
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
PAYPAL_ENV="sandbox"
PAYPAL_MCP_URL="https://mcp.sandbox.paypal.com"

# Optional: Add your Google Gemini API key
GEMINI_API_KEY=""

DEMO_MODE="true"
```

> 💡 **Judge Note**: If PayPal credentials or Gemini API keys are omitted, Passport automatically runs in **High-Fidelity Simulation Mode** so all flows, order captures, and autopsy forensics work out-of-the-box!

### 3. Initialize & Seed Database
```bash
pnpm run db:push
pnpm run db:seed
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧭 Application Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/` | **Fintech Landing Page** | High-contrast fintech design showcasing problem, architecture, interactive passport card, and security model. |
| `/demo` | **Guided Demo Tour** | 1-click step-by-step walkthrough of the entire 8-step hackathon narrative. |
| `/dashboard` | **Operations Dashboard** | Real-time KPIs (spend volume, active mandates, passports, disputes, live audit feed). |
| `/mandates` | **Spend Mandates** | Mandate ledger + Gemini natural-language authorization parser. |
| `/purchases` | **Agent Purchase Console** | Interactive test harness: run Approved ($75) vs Blocked ($120) scenarios with real-time policy checks. |
| `/passports/[id]` | **Trust Passport Detail** | Flagship cryptographic credential with 5 interactive tabs and JSON attestation download. |
| `/disputes/[id]` | **Chargeback Autopsy** | Forensic evidence checklist, Gemini defense drafting, and human co-signature modal. |
| `/evidence` | **Evidence Timeline** | High-performance AG Grid-style chronological ledger with CSV export. |
| `/audit` | **Tamper-Evident Audit Log** | Merkle parent-hash chaining with live 100% integrity verification. |

---

## ⚙️ Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui-inspired fintech aesthetic
- **Theming**: Dark & Light mode toggle via `next-themes`
- **Database**: Prisma ORM with zero-config SQLite (`file:./dev.db`)
- **Payment Gateway**: PayPal Orders v2 API, Disputes v1 API, Webhooks signature verification, PayPal MCP endpoint (`https://mcp.sandbox.paypal.com`)
- **AI Engine**: Google Gemini 1.5 Pro (natural language parsing, bounded agent reasoning, chargeback autopsy)
- **Cryptography**: SHA-256 Merkle chaining, HMAC-SHA256 platform signing

---

## 🧪 Running Tests
To verify the end-to-end proof-of-concept pipeline in one command:
```bash
cd frontend
pnpm run test:poc
```

---

## 📄 Documentation Links
- [System Architecture](docs/architecture.md)
- [PayPal Integration Guide](docs/paypal-integration.md)
- [Official Demo Presentation Script](docs/demo-script.md)
- [Fintech Security Model](docs/security-model.md)
- [Hackathon Submission Summary](docs/submission.md)

---

## ⚖️ License
MIT License. Created for the PayPal AI Hackathon 2026.
