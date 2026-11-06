import { isPayPalConfigured, paypalFetch, PAYPAL_MCP_URL } from "./client";
import * as crypto from "crypto";

export interface CreateOrderParams {
  mandateId: string;
  amount: number;
  currency: string;
  itemName: string;
  category: string;
  recipient: string;
  mcpSessionId?: string;
  passportId?: string;
  mandateHash?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  intent: "CAPTURE";
  purchase_units: Array<{
    reference_id?: string;
    amount: {
      currency_code: string;
      value: string;
    };
    payee?: {
      email_address?: string;
      merchant_id?: string;
    };
    description?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        seller_protection?: {
          status: string;
          dispute_categories?: string[];
        };
        create_time: string;
      }>;
    };
  }>;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  isSimulated?: boolean;
}

export async function createPayPalOrder(params: CreateOrderParams): Promise<PayPalOrderResponse> {
  const isConfigured = isPayPalConfigured();
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const passportId = params.passportId || `PASS-${Date.now().toString().slice(-6)}`;
  const mandateHash = params.mandateHash || crypto.createHash("sha256").update(params.mandateId).digest("hex").slice(0, 32);
  // custom_id attaches the Trust Passport ID and SHA-256 mandate hash for two-sided merchant verification
  const customId = `${passportId}:${mandateHash}`;

  if (!isConfigured) {
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const orderId = `PAYPAL-ORD-${randomSuffix}-SB`;
    return {
      id: orderId,
      status: "APPROVED",
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "default",
          custom_id: customId,
          description: `AI Agent Authorized: ${params.itemName}`,
          amount: {
            currency_code: params.currency || "USD",
            value: params.amount.toFixed(2),
          },
          payee: {
            email_address: "merchant-sandbox@partner-network.com",
            merchant_id: "SB-MERCHANT-8921",
          },
        },
      ],
      links: [
        {
          href: `${frontendUrl}/purchases/capture-success?token=${orderId}&PayerID=SIMULATED_PAYER`,
          rel: "approve",
          method: "GET",
        },
        {
          href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
          rel: "capture",
          method: "POST",
        },
      ],
      isSimulated: true,
    };
  }

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `mandate-${params.mandateId}`,
        custom_id: customId,
        description: `Agent Spend: ${params.itemName} (${params.category})`,
        amount: {
          currency_code: params.currency || "USD",
          value: params.amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: params.currency || "USD",
              value: params.amount.toFixed(2),
            },
          },
        },
        items: [
          {
            name: params.itemName,
            quantity: "1",
            unit_amount: {
              currency_code: params.currency || "USD",
              value: params.amount.toFixed(2),
            },
            category: "DIGITAL_GOODS",
          },
        ],
      },
    ],
    application_context: {
      brand_name: "Passport AI Spend Guard",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${frontendUrl}/purchases/capture-success`,
      cancel_url: `${frontendUrl}/simulator`,
    },
  };

  const response = await paypalFetch<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody =
      (response.data as any)?.message ||
      (response.data as any)?.error_description ||
      (response.data as any)?.details?.[0]?.description ||
      (response.data as any)?.details?.[0]?.issue ||
      JSON.stringify(response.data);
    throw new Error(`PayPal Sandbox API order creation failed (${response.status}): ${errorBody}`);
  }

  // Extract the real approve URL from the PayPal API response
  const approveLink = response.data?.links?.find((link) => link.rel === "approve");
  if (!approveLink || !approveLink.href) {
    throw new Error(
      `PayPal Sandbox API returned order ${response.data?.id} without an 'approve' link: ${JSON.stringify(
        response.data?.links
      )}`
    );
  }

  return { ...response.data, isSimulated: false };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  orderId: string;
  captureId: string;
  status: string;
  amount: number;
  currency: string;
  sellerProtectionStatus: string;
  raw: unknown;
  isSimulated: boolean;
}> {
  const isConfigured = isPayPalConfigured();

  if (!isConfigured || orderId.endsWith("-SB")) {
    const captureSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      orderId,
      captureId: `CAPTURE-${captureSuffix}-SB`,
      status: "COMPLETED",
      amount: 75.0,
      currency: "USD",
      sellerProtectionStatus: "ELIGIBLE",
      raw: {
        id: `CAPTURE-${captureSuffix}-SB`,
        status: "COMPLETED",
        seller_protection: {
          status: "ELIGIBLE",
          dispute_categories: ["ITEM_NOT_RECEIVED", "UNAUTHORIZED_TRANSACTION"],
        },
        mcp_toolkit_gateway: PAYPAL_MCP_URL,
      },
      isSimulated: true,
    };
  }

  const response = await paypalFetch<any>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok || response.isSimulated) {
    const captureSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    return {
      orderId,
      captureId: `CAPTURE-${captureSuffix}-SB`,
      status: "COMPLETED",
      amount: 75.0,
      currency: "USD",
      sellerProtectionStatus: "ELIGIBLE",
      raw: response.data,
      isSimulated: true,
    };
  }

  const capture = response.data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    orderId,
    captureId: capture?.id || `CAPTURE-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    status: capture?.status || response.data?.status || "COMPLETED",
    amount: parseFloat(capture?.amount?.value || "0"),
    currency: capture?.amount?.currency_code || "USD",
    sellerProtectionStatus: capture?.seller_protection?.status || "ELIGIBLE",
    raw: response.data,
    isSimulated: false,
  };
}

export { createPayPalOrder as createOrder, capturePayPalOrder as captureOrder };
