# PayPal Integration Guide

> Comprehensive reference for Passport's integration with PayPal Sandbox APIs and the Agent Toolkit / MCP.

---

## 1. Overview of PayPal Endpoints Used

Passport integrates with three primary PayPal REST APIs and supports the PayPal Agent Toolkit MCP server:

| API | Base URL | Endpoints Used | Purpose |
|-----|----------|----------------|---------|
| **Orders API v2** | `https://api-m.sandbox.paypal.com` | `POST /v2/checkout/orders`<br>`POST /v2/checkout/orders/{id}/capture` | Create and settle authorized purchases |
| **Disputes API v1** | `https://api-m.sandbox.paypal.com` | `GET /v1/customer/disputes`<br>`POST /v1/customer/disputes/{id}/provide-evidence` | Forensics retrieval & co-signed merchant defense |
| **Webhooks API v1** | `https://api-m.sandbox.paypal.com` | `POST /v1/notifications/verify-webhook-signature` | Cryptographic signature validation |
| **Agent Toolkit / MCP** | `https://mcp.sandbox.paypal.com` | MCP session endpoints & tools | Contextual agent transaction settlement |

---

## 2. Orders API Integration

### Order Creation
When an AI agent's proposal is validated by the Passport guard engine, Passport invokes `POST /v2/checkout/orders` with:
- `intent: "CAPTURE"`
- `purchase_units`:
  - `custom_id`: Bound directly to the governing Mandate ID.
  - `description`: Agent purchase purpose and item description.
  - `amount`: Exact proposed amount (bounded by mandate cap).
  - `items`: Categorized as `DIGITAL_GOODS`.

### Order Capture & Seller Protection
Immediately following approval, Passport invokes `POST /v2/checkout/orders/{id}/capture`:
- Returns `capture_id` and settlement timestamp.
- Extracts `seller_protection.status` (e.g. `ELIGIBLE`).
- The capture ID is stored in the `Purchase` record and linked as the parent hash for the issued **Trust Passport**.

---

## 3. Disputes API Integration

### Forensics Retrieval
When a dispute occurs, Passport queries `GET /v1/customer/disputes/{dispute_id}` to retrieve:
- `dispute_amount` and currency.
- `dispute_reason` (e.g., `UNAUTHORIZED_TRANSACTION`, `MERCHANDISE_OR_SERVICE_NOT_RECEIVED`).
- `dispute_life_cycle_stage` (e.g., `CHARGEBACK`).
- `seller_response_due_date` (creates countdown urgency in the Autopsy Room).
- `buyer_transaction_id` and `seller_transaction_id`.

### Evidence Submission (`/provide-evidence`)
After human co-signature approval, Passport submits the compiled defense package via:
```json
POST /v1/customer/disputes/{dispute_id}/provide-evidence
{
  "evidences": [
    {
      "evidence_type": "PROOF_OF_FULFILLMENT",
      "evidence_info": {
        "tracking_info": [
          {
            "carrier_name": "DIGITAL_DELIVERY",
            "tracking_number": "PASS-HASH-92fe1516cccce243"
          }
        ]
      },
      "notes": "Full defense letter text with cryptographic Trust Passport attestation and human co-sign statement."
    }
  ]
}
```

---

## 4. Webhook Verification

PayPal webhooks notify the application of incoming dispute events (`CUSTOMER.DISPUTE.CREATED`).
Passport verifies the authenticity of every incoming webhook by passing the headers to PayPal:
- `PAYPAL-TRANSMISSION-ID`
- `PAYPAL-TRANSMISSION-TIME`
- `PAYPAL-CERT-URL`
- `PAYPAL-AUTH-ALGO`
- `PAYPAL-TRANSMISSION-SIG`
- `webhook_id`

```typescript
const res = await paypalFetch("/v1/notifications/verify-webhook-signature", {
  method: "POST",
  body: JSON.stringify({
    transmission_id,
    transmission_time,
    cert_url,
    auth_algo,
    transmission_sig,
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: rawBody,
  }),
});
```

---

## 5. Offline & Judge Simulation Mode

To guarantee that judges can evaluate 100% of the platform without needing a registered PayPal Sandbox developer account or active webhooks, Passport includes a built-in **High-Fidelity Sandbox Simulator**:
- When `PAYPAL_CLIENT_ID` is empty or the network is unreachable, Passport automatically simulates realistic sandbox orders, captures, seller protection statuses, and dispute events.
- To switch to live PayPal Sandbox mode, simply add your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `.env`.

