import { timingSafeEqual } from "node:crypto";

export type PlanCompra = "annual" | "lifetime";

export type CompraHotmart = {
  email: string;
  nombre: string | null;
  telefono: string | null;
  transaccion: string;
  plan: PlanCompra;
  promo: boolean;
};

// El webhook de la Hotmart manda el "hottok" (token de verificación de la cuenta) en el header X-HOTMART-HOTTOK.
export function hottokValido(recibido: string | null, esperado: string | undefined) {
  if (!recibido || !esperado) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Env = Record<string, string | undefined>;

// Decide qué se compró. Primero por el código de la oferta (variables HOTMART_OFFER_*), y si no coincide,
// por el precio: hasta US$ 35 = promo vitalicia, desde US$ 60 = vitalicio, el resto = 1 año.
export function planDeCompra(codigoOferta: string | undefined, precio: number | undefined, env: Env = process.env) {
  if (codigoOferta) {
    if (codigoOferta === env.HOTMART_OFFER_PROMO) return { plan: "lifetime" as const, promo: true };
    if (codigoOferta === env.HOTMART_OFFER_VITALICIO) return { plan: "lifetime" as const, promo: false };
    if (codigoOferta === env.HOTMART_OFFER_ANUAL) return { plan: "annual" as const, promo: false };
  }
  if (typeof precio === "number" && precio > 0) {
    if (precio <= 35) return { plan: "lifetime" as const, promo: true };
    if (precio >= 60) return { plan: "lifetime" as const, promo: false };
  }
  return { plan: "annual" as const, promo: false };
}

// Lee los campos que usamos del payload (versión 2.0.0 del webhook). Devuelve null si falta el email o la transacción.
export function leerCompra(payload: any, env: Env = process.env): CompraHotmart | null {
  const d = payload?.data;
  const email = typeof d?.buyer?.email === "string" ? d.buyer.email.trim().toLowerCase() : "";
  const transaccion = typeof d?.purchase?.transaction === "string" ? d.purchase.transaction : "";
  if (!email || !transaccion) return null;
  const precio = Number(d?.purchase?.price?.value ?? d?.purchase?.price);
  const { plan, promo } = planDeCompra(d?.purchase?.offer?.code, Number.isFinite(precio) ? precio : undefined, env);
  const tel = d?.buyer?.checkout_phone ?? d?.buyer?.phone;
  return {
    email,
    nombre: typeof d?.buyer?.name === "string" ? d.buyer.name : null,
    telefono: typeof tel === "string" ? tel : null,
    transaccion,
    plan,
    promo,
  };
}
