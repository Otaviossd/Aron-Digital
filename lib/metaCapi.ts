import { createHash } from "node:crypto";
import { META_PIXEL_ID } from "./config";

// Conversions API de Meta: manda el evento de "Purchase" desde el servidor (cuando la Hotmart confirma el pago),
// para que el Meta sepa quién compró de verdad, no solo quién inició el checkout (eso lo manda el pixel del navegador).
// Necesita META_CAPI_ACCESS_TOKEN en la Vercel (Events Manager > esta cuenta de anuncios > Conversions API > Generar token).
// Si falta el token, no se manda nada (y no rompe el webhook: ver el try/catch en quien llama a esto).
const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

type DatosCompra = {
  email: string;
  valor: number | null;
  moneda: string | null;
  transaccion: string; // id único del evento (dedup si la Hotmart reenvía el webhook)
};

export async function enviarCompraCapi({ email, valor, moneda, transaccion }: DatosCompra) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token || !META_PIXEL_ID) return;

  const cuerpo = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `hotmart:${transaccion}`,
        action_source: "system_generated",
        user_data: { em: [sha256(email)] },
        custom_data: {
          currency: (moneda || "USD").toUpperCase(),
          value: typeof valor === "number" ? valor : 0,
        },
      },
    ],
  };

  const resp = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  if (!resp.ok) {
    console.error("meta capi error", resp.status, await resp.text().catch(() => ""));
  }
}
