interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

export const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
export const PAYPAL_BASE_URL =
  PAYPAL_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
export const PAYPAL_MCP_URL = process.env.PAYPAL_MCP_URL || "https://mcp.sandbox.paypal.com";

export function isPayPalConfigured(): boolean {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return Boolean(clientId && clientSecret && clientId.trim() !== "" && clientSecret.trim() !== "");
}

export function getMerchantPayPalCredentials() {
  const clientId = process.env.MERCHANT_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.MERCHANT_PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
  const isSeparate = Boolean(
    process.env.MERCHANT_PAYPAL_CLIENT_ID &&
    process.env.MERCHANT_PAYPAL_CLIENT_ID !== process.env.PAYPAL_CLIENT_ID
  );
  return {
    clientId,
    clientSecret,
    isSeparate,
    isConfigured: Boolean(clientId && clientSecret && clientId.trim() !== "" && clientSecret.trim() !== ""),
  };
}

export function getPayPalConfigInfo() {
  const configured = isPayPalConfigured();
  return {
    configured,
    environment: PAYPAL_ENV,
    baseUrl: PAYPAL_BASE_URL,
    mcpEndpoint: PAYPAL_MCP_URL,
    clientIdPrefix: configured ? `${process.env.PAYPAL_CLIENT_ID?.slice(0, 6)}...` : "Not Set",
    mode: configured ? "LIVE_SANDBOX" : "SIMULATED_SANDBOX",
  };
}

export async function getPayPalAccessToken(): Promise<string> {
  if (!isPayPalConfigured()) {
    return "SIMULATED_PAYPAL_SANDBOX_ACCESS_TOKEN";
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("PayPal OAuth token request failed, falling back to simulated mode:", errorText);
      return "SIMULATED_PAYPAL_SANDBOX_ACCESS_TOKEN";
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };

    return cachedToken.accessToken;
  } catch (err) {
    console.warn("PayPal network error in OAuth token, fallback to simulation:", err);
    return "SIMULATED_PAYPAL_SANDBOX_ACCESS_TOKEN";
  }
}

export async function paypalFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T; isSimulated: boolean }> {
  if (!isPayPalConfigured()) {
    return {
      ok: true,
      status: 200,
      data: {} as T,
      isSimulated: true,
    };
  }

  const token = await getPayPalAccessToken();
  if (token === "SIMULATED_PAYPAL_SANDBOX_ACCESS_TOKEN") {
    return {
      ok: true,
      status: 200,
      data: {} as T,
      isSimulated: true,
    };
  }

  const url = endpoint.startsWith("http") ? endpoint : `${PAYPAL_BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
      isSimulated: false,
    };
  } catch (err) {
    console.warn(`PayPal fetch error on ${endpoint}:`, err);
    return {
      ok: false,
      status: 500,
      data: { error: "Network error", details: String(err) } as T,
      isSimulated: false,
    };
  }
}

