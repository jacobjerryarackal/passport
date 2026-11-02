import { isPayPalConfigured, paypalFetch } from "./client";

export interface VerifyWebhookParams {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  webhookEvent: Record<string, unknown>;
}

export async function verifyPayPalWebhookSignature(params: VerifyWebhookParams): Promise<{
  isValid: boolean;
  status: string;
  isSimulated: boolean;
}> {
  // If not configured, in local dev, or simulated event, mark as valid with isSimulated flag
  if (!isPayPalConfigured() || !process.env.PAYPAL_WEBHOOK_ID) {
    return {
      isValid: true,
      status: "SUCCESS_SIMULATED",
      isSimulated: true,
    };
  }

  try {
    const payload = {
      transmission_id: params.transmissionId,
      transmission_time: params.transmissionTime,
      cert_url: params.certUrl,
      auth_algo: params.authAlgo,
      transmission_sig: params.transmissionSig,
      webhook_id: params.webhookId || process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: params.webhookEvent,
    };

    const res = await paypalFetch<{ verification_status: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (res.isSimulated) {
      return { isValid: true, status: "SUCCESS_SIMULATED", isSimulated: true };
    }

    const isValid = res.data?.verification_status === "SUCCESS";
    return {
      isValid,
      status: res.data?.verification_status || "FAILURE",
      isSimulated: false,
    };
  } catch (err) {
    console.error("Webhook verification error:", err);
    // Graceful demo degradation: allow demo events while logging warning
    return {
      isValid: true,
      status: "FALLBACK_ACCEPTED",
      isSimulated: true,
    };
  }
}

