# PayPal AI Hackathon — Project Submission

## Project Name
**Passport** — A Trust, Receipt, and Dispute-Defense Layer for AI-Agent Purchases

## Tagline
AI agents can spend money. Passport makes every purchase accountable.

## Exact MVP Vertical Demonstrated
A small business owner authorizes an AI purchasing assistant to buy a client appreciation gift:
- **Mandate**: Purpose = "Client appreciation gift", Cap = $80.00, Category = digital gift cards, Expiry = 24h, Refund Policy = allowed if incorrect or unauthorized.
- **Blocked Flow**: Agent proposes a $120.00 physical office chair &rarr; Passport immediately blocks it for budget and category violations.
- **Approved Flow**: Agent proposes a $75.00 digital gift card &rarr; Passport approves, settles via PayPal Sandbox, and issues a cryptographic Trust Passport.
- **Dispute Flow**: A simulated chargeback arrives &rarr; Passport runs Chargeback Autopsy (AI classification, evidence reconciliation, missing gap analysis, defense drafting) &rarr; Human co-signs before PayPal submission.

## Tech Stack
- **PayPal APIs**: Orders v2 API (create & capture), Disputes v1 API, Webhook signature verification, Agent Toolkit / MCP sandbox reference (`https://mcp.sandbox.paypal.com`).
- **AI Engine**: Google Gemini 1.5 Pro (natural language mandate parsing, bounded agent reasoning, chargeback classification, gap analysis, defense drafting).
- **Frontend / Full-stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide icons, Dark/Light theme (`next-themes`).
- **Data & Verification**: Prisma ORM, SQLite (`file:./dev.db`), SHA-256 Merkle hash chain, HMAC cryptographic signing.

## Key Innovation
While existing tools treat AI agent payments as simple API calls, Passport solves the real-world merchant dilemma: **proving non-repudiation and winning chargebacks**. By cryptographically linking human intent to agent reasoning and PayPal settlement, merchants gain airtight seller protection for autonomous commerce.

