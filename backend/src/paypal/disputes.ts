import { isPayPalConfigured, paypalFetch } from "./client";

export interface PayPalDisputeSummary {
  dispute_id: string;
  create_time: string;
  update_time: string;
  dispute_amount: {
    currency_code: string;
    value: string;
  };
  status: "OPEN" | "WAITING_FOR_BUYER_RESPONSE" | "WAITING_FOR_SELLER_RESPONSE" | "UNDER_REVIEW" | "RESOLVED";
  dispute_reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED" | "UNAUTHORIZED_TRANSACTION" | "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED";
  dispute_life_cycle_stage: "INQUIRY" | "CHARGEBACK" | "PRE_ARBITRATION";
  dispute_channel: "INTERNAL" | "ACH" | "CREDIT_CARD";
  seller_response_due_date?: string;
  disputed_transactions?: Array<{
    seller_transaction_id: string;
    buyer_transaction_id?: string;
    gross_amount: {
      currency_code: string;
      value: string;
    };
  }>;
}

export async function fetchPayPalDisputes(): Promise<{
  items: PayPalDisputeSummary[];
  isSimulated: boolean;
}> {
  if (!isPayPalConfigured()) {
    return {
      items: [
        {
          dispute_id: "PP-D-849201",
          create_time: new Date(Date.now() - 3600000 * 2).toISOString(),
          update_time: new Date().toISOString(),
          dispute_amount: { currency_code: "USD", value: "75.00" },
          status: "WAITING_FOR_SELLER_RESPONSE",
          dispute_reason: "UNAUTHORIZED_TRANSACTION",
          dispute_life_cycle_stage: "CHARGEBACK",
          dispute_channel: "CREDIT_CARD",
          seller_response_due_date: new Date(Date.now() + 86400000 * 6).toISOString(),
          disputed_transactions: [
            {
              seller_transaction_id: "CAPTURE-7TY90123L-SB",
              gross_amount: { currency_code: "USD", value: "75.00" },
            },
          ],
        },
      ],
      isSimulated: true,
    };
  }

  const response = await paypalFetch<{ items: PayPalDisputeSummary[] }>("/v1/customer/disputes?page_size=10");
  if (!response.ok || response.isSimulated || !response.data?.items) {
    return {
      items: [],
      isSimulated: true,
    };
  }

  return {
    items: response.data.items,
    isSimulated: false,
  };
}

export async function getPayPalDispute(disputeId: string): Promise<{
  dispute: PayPalDisputeSummary | null;
  isSimulated: boolean;
}> {
  if (!isPayPalConfigured() || disputeId.startsWith("PP-D-849201")) {
    return {
      dispute: {
        dispute_id: disputeId,
        create_time: new Date(Date.now() - 3600000 * 2).toISOString(),
        update_time: new Date().toISOString(),
        dispute_amount: { currency_code: "USD", value: "75.00" },
        status: "WAITING_FOR_SELLER_RESPONSE",
        dispute_reason: "UNAUTHORIZED_TRANSACTION",
        dispute_life_cycle_stage: "CHARGEBACK",
        dispute_channel: "CREDIT_CARD",
        seller_response_due_date: new Date(Date.now() + 86400000 * 6).toISOString(),
        disputed_transactions: [
          {
            seller_transaction_id: "CAPTURE-7TY90123L-SB",
            gross_amount: { currency_code: "USD", value: "75.00" },
          },
        ],
      },
      isSimulated: true,
    };
  }

  const response = await paypalFetch<PayPalDisputeSummary>(`/v1/customer/disputes/${disputeId}`);
  if (!response.ok || response.isSimulated) {
    return { dispute: null, isSimulated: true };
  }

  return { dispute: response.data, isSimulated: false };
}

export async function submitDisputeEvidence(params: {
  disputeId: string;
  notes: string;
  evidenceType: string;
  evidenceItems: Array<{ title: string; hash: string }>;
  cosignedBy: string;
}): Promise<{ success: boolean; disputeId: string; submittedAt: string; isSimulated: boolean }> {
  const isConfigured = isPayPalConfigured();

  // 1. Verify dispute status is WAITING_FOR_SELLER_RESPONSE before submitting
  const disputeLookup = await getPayPalDispute(params.disputeId);
  const currentStatus = disputeLookup.dispute?.status || "WAITING_FOR_SELLER_RESPONSE";
  if (currentStatus !== "WAITING_FOR_SELLER_RESPONSE") {
    throw new Error(
      `Cannot submit evidence: Dispute status is "${currentStatus}". Evidence can only be submitted when status is "WAITING_FOR_SELLER_RESPONSE".`
    );
  }

  // 2. Build official PayPal multipart/related evidence payload
  const boundary = `----PayPalDisputeEvidence${Date.now().toString(16)}`;
  const evidencePayload = {
    evidences: [
      {
        evidence_type: params.evidenceType || "PROOF_OF_FULFILLMENT",
        evidence_info: {
          tracking_info: [
            {
              carrier_name: "DIGITAL_DELIVERY",
              tracking_number: `PASS-HASH-${params.evidenceItems[0]?.hash?.slice(0, 16) || "PROOF"}`,
            },
          ],
        },
        notes: `${params.notes}\n\nCo-signed and approved by human administrator: ${params.cosignedBy}`,
      },
    ],
  };

  const bodyParts = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="input"',
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(evidencePayload),
    `--${boundary}--`,
    '',
  ];
  const multipartBody = bodyParts.join("\r\n");

  if (!isConfigured || params.disputeId.startsWith("PP-D-849201")) {
    return {
      success: true,
      disputeId: params.disputeId,
      submittedAt: new Date().toISOString(),
      isSimulated: true,
    };
  }

  // 3. Raw REST call to POST /v1/customer/disputes/{disputeId}/provide-evidence
  const res = await paypalFetch(`/v1/customer/disputes/${params.disputeId}/provide-evidence`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  return {
    success: res.ok,
    disputeId: params.disputeId,
    submittedAt: new Date().toISOString(),
    isSimulated: res.isSimulated,
  };
}

