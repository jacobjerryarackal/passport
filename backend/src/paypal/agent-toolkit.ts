/**
 * PayPal Agent Toolkit (MCP) Integration
 * Implements MCP tools for autonomous AI agent payment and dispute lifecycle:
 * - list_disputes
 * - get_dispute
 * - accept_dispute_claim
 * Using Sandbox Base URL (https://api-m.sandbox.paypal.com)
 */

import { PAYPAL_BASE_URL, isPayPalConfigured, paypalFetch } from "./client";

export interface DisputeItem {
  dispute_id: string;
  create_time: string;
  update_time: string;
  dispute_amount: {
    currency_code: string;
    value: string;
  };
  status:
    | "OPEN"
    | "WAITING_FOR_BUYER_RESPONSE"
    | "WAITING_FOR_SELLER_RESPONSE"
    | "UNDER_REVIEW"
    | "RESOLVED";
  dispute_reason:
    | "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"
    | "UNAUTHORIZED_TRANSACTION"
    | "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED";
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
  messages?: Array<{
    posted_by: string;
    time_posted: string;
    content: string;
  }>;
}

export interface ListDisputesParams {
  pageSize?: number;
  disputeState?: string;
  startTime?: string;
}

/**
 * MCP Tool: list_disputes
 * Lists customer disputes from PayPal Sandbox
 */
export async function list_disputes(params: ListDisputesParams = {}): Promise<{
  items: DisputeItem[];
  isSimulated: boolean;
}> {
  if (!isPayPalConfigured()) {
    return {
      items: [
        {
          dispute_id: "PP-D-849201",
          create_time: new Date(Date.now() - 3600000 * 3).toISOString(),
          update_time: new Date().toISOString(),
          dispute_amount: { currency_code: "USD", value: "75.00" },
          status: "WAITING_FOR_SELLER_RESPONSE",
          dispute_reason: "UNAUTHORIZED_TRANSACTION",
          dispute_life_cycle_stage: "CHARGEBACK",
          dispute_channel: "CREDIT_CARD",
          seller_response_due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
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

  const pageSize = params.pageSize || 10;
  const res = await paypalFetch<{ items: DisputeItem[] }>(
    `/v1/customer/disputes?page_size=${pageSize}`
  );

  if (!res.ok || res.isSimulated || !res.data?.items) {
    return { items: [], isSimulated: true };
  }

  return { items: res.data.items, isSimulated: false };
}

/**
 * MCP Tool: get_dispute
 * Fetches full dispute details for a specific dispute ID
 */
export async function get_dispute(disputeId: string): Promise<{
  dispute: DisputeItem | null;
  isSimulated: boolean;
}> {
  if (!isPayPalConfigured()) {
    return {
      dispute: {
        dispute_id: disputeId || "PP-D-849201",
        create_time: new Date(Date.now() - 3600000 * 3).toISOString(),
        update_time: new Date().toISOString(),
        dispute_amount: { currency_code: "USD", value: "75.00" },
        status: "WAITING_FOR_SELLER_RESPONSE",
        dispute_reason: "UNAUTHORIZED_TRANSACTION",
        dispute_life_cycle_stage: "CHARGEBACK",
        dispute_channel: "CREDIT_CARD",
        seller_response_due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        disputed_transactions: [
          {
            seller_transaction_id: "CAPTURE-7TY90123L-SB",
            gross_amount: { currency_code: "USD", value: "75.00" },
          },
        ],
        messages: [
          {
            posted_by: "BUYER",
            time_posted: new Date(Date.now() - 3600000 * 3).toISOString(),
            content: "Cardholder did not authorize this autonomous agent charge.",
          },
        ],
      },
      isSimulated: true,
    };
  }

  const res = await paypalFetch<DisputeItem>(`/v1/customer/disputes/${disputeId}`);
  if (!res.ok || !res.data) {
    return { dispute: null, isSimulated: true };
  }

  return { dispute: res.data, isSimulated: false };
}

/**
 * MCP Tool: accept_dispute_claim
 * Accepts a customer dispute claim on PayPal Sandbox
 */
export async function accept_dispute_claim(
  disputeId: string,
  note: string = "Claim accepted autonomously under mandate policy terms"
): Promise<{
  success: boolean;
  status: string;
  isSimulated: boolean;
}> {
  if (!isPayPalConfigured()) {
    return {
      success: true,
      status: "RESOLVED_SIMULATED",
      isSimulated: true,
    };
  }

  const res = await paypalFetch(`/v1/customer/disputes/${disputeId}/accept-claim`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });

  return {
    success: res.ok,
    status: res.ok ? "RESOLVED" : "FAILED",
    isSimulated: res.isSimulated,
  };
}

/**
 * PayPal Agent Toolkit Client
 * Wraps PayPal MCP tools for LLM agent function calling
 */
export class PayPalAgentToolkit {
  readonly baseUrl = PAYPAL_BASE_URL;

  async listDisputes(params?: ListDisputesParams) {
    return list_disputes(params);
  }

  async getDispute(disputeId: string) {
    return get_dispute(disputeId);
  }

  async acceptDisputeClaim(disputeId: string, note?: string) {
    return accept_dispute_claim(disputeId, note);
  }

  getToolsSchema() {
    return [
      {
        name: "list_disputes",
        description: "List recent disputes from PayPal Sandbox",
        parameters: {
          type: "object",
          properties: {
            pageSize: { type: "number", description: "Number of records to return" },
          },
        },
      },
      {
        name: "get_dispute",
        description: "Get details for a specific PayPal dispute ID",
        parameters: {
          type: "object",
          required: ["disputeId"],
          properties: {
            disputeId: { type: "string", description: "PayPal dispute reference ID" },
          },
        },
      },
      {
        name: "accept_dispute_claim",
        description: "Accept liability on a dispute claim on PayPal",
        parameters: {
          type: "object",
          required: ["disputeId"],
          properties: {
            disputeId: { type: "string", description: "PayPal dispute reference ID" },
            note: { type: "string", description: "Reason or note for acceptance" },
          },
        },
      },
    ];
  }
}

export const paypalAgentToolkit = new PayPalAgentToolkit();

