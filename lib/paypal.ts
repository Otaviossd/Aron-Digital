// Cliente mínimo da API do PayPal (assinaturas + verificação de webhook).

const BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export type PayPalSubscription = {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  start_time?: string;
  subscriber?: { email_address?: string };
  billing_info?: { next_billing_time?: string; last_payment?: { time?: string } };
};

export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal token error: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function getSubscription(id: string): Promise<PayPalSubscription> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/billing/subscriptions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal getSubscription error: ${res.status}`);
  return (await res.json()) as PayPalSubscription;
}

export async function cancelSubscription(id: string, reason: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal cancel error: ${res.status}`);
}

// Confere com o PayPal que o webhook é autêntico. Sem isso, qualquer pessoa poderia
// chamar a URL do webhook e se dar acesso de graça.
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }),
    cache: "no-store",
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { verification_status?: string };
  return json.verification_status === "SUCCESS";
}

export function planFromId(planId: string): "monthly" | "annual" {
  return planId === process.env.PAYPAL_PLAN_ID_ANNUAL ? "annual" : "monthly";
}
