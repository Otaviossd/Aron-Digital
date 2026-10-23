import { timingSafeEqual } from "node:crypto";

export type PlanCompra = "annual" | "lifetime";

export type CompraHotmart = {
  email: string;
  nombre: string | null;
  telefono: string | null;
  transaccion: string;
  plan: PlanCompra;
  promo: boolean;
  // Compra barata que no es ninguno de los 3 planes (ej. el bump de redes sociales): no da acceso al curso.
  extra: boolean;
  montos: MontosCompra;
};

// Lo que la Hotmart informa de una compra. Los campos que no vienen en el evento quedan en null
// (el panel de finanzas los estima y lo avisa).
export type MontosCompra = {
  bruto: number | null;
  moneda: string | null;
  tarifa: number | null;
  productor: number | null;
  coproductor: number | null;
  afiliado: number | null;
};

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

// Lee precio y comisiones del evento (data.purchase.price y data.commissions[] con source MARKETPLACE / PRODUCER / COPRODUCER / AFFILIATE).
// Si las comisiones vienen en otra moneda que el precio, no se pueden sumar: se descartan y el panel estima.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function leerMontos(payload: any): MontosCompra {
  const d = payload?.data;
  const bruto = num(d?.purchase?.price?.value ?? d?.purchase?.price);
  const moneda = typeof d?.purchase?.price?.currency_value === "string" ? d.purchase.price.currency_value : null;
  const vacio: MontosCompra = { bruto, moneda, tarifa: null, productor: null, coproductor: null, afiliado: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lista: any[] = Array.isArray(d?.commissions) ? d.commissions : [];
  if (lista.length === 0) return vacio;
  const monedas = new Set(lista.map((c) => c?.currency_value ?? c?.currency_conversion?.currency_code).filter(Boolean));
  if (moneda && monedas.size > 0 && !(monedas.size === 1 && monedas.has(moneda))) return vacio;
  const suma = (fuente: string) => {
    const f = lista.filter((c) => String(c?.source ?? "").toUpperCase() === fuente);
    if (f.length === 0) return null;
    return Math.round(f.reduce((t, c) => t + (num(c?.value) ?? 0), 0) * 100) / 100;
  };
  return { bruto, moneda, tarifa: suma("MARKETPLACE"), productor: suma("PRODUCER"), coproductor: suma("COPRODUCER"), afiliado: suma("AFFILIATE") };
}

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
  const codigo = d?.purchase?.offer?.code;
  const esPlan = [env.HOTMART_OFFER_PROMO, env.HOTMART_OFFER_VITALICIO, env.HOTMART_OFFER_ANUAL].includes(codigo);
  const esPrueba = (env.HOTMART_TEST_EMAILS ?? "").toLowerCase().split(",").map((x) => x.trim()).includes(email);
  // La clase extra se reconoce por su producto u oferta (HOTMART_PRODUCT_EXTRA / HOTMART_OFFER_EXTRA, separados por coma);
  // si no están definidos, por precio: cualquier compra de menos de US$ 25 que no sea uno de los 3 planes (el extra cuesta US$ 10 o 20).
  const lista = (v?: string) => (v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const idProducto = String(d?.product?.id ?? "");
  const esExtraDeclarado = (idProducto !== "" && lista(env.HOTMART_PRODUCT_EXTRA).includes(idProducto)) || (typeof codigo === "string" && lista(env.HOTMART_OFFER_EXTRA).includes(codigo));
  const extra = !esPlan && !esPrueba && (esExtraDeclarado || (Number.isFinite(precio) && precio > 0 && precio < 25));
  const { plan, promo } = planDeCompra(d?.purchase?.offer?.code, Number.isFinite(precio) ? precio : undefined, env);
  const tel = d?.buyer?.checkout_phone ?? d?.buyer?.phone;
  return {
    email,
    nombre: typeof d?.buyer?.name === "string" ? d.buyer.name : null,
    telefono: typeof tel === "string" ? tel : null,
    transaccion,
    plan,
    promo,
    extra,
    montos: leerMontos(payload),
  };
}
