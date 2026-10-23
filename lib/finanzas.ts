import { COSTOS, EXTRA, PRECOS } from "./config.ts";

// Cuentas del panel de Finanzas. Todo en US$. Cada número sale de lo que la Hotmart informó de la venta;
// si no informó algo, se estima con lib/config.ts y se cuenta cuántas ventas quedaron estimadas para avisarlo.

export type CompraFila = {
  plan: string;
  promo: boolean | null;
  purchased_at: string;
  refunded_at: string | null;
  email: string;
  gross_amount?: number | string | null;
  currency?: string | null;
  fee_amount?: number | string | null;
  producer_amount?: number | string | null;
  coproducer_amount?: number | string | null;
  affiliate_amount?: number | string | null;
};

export type ExtraFila = Omit<CompraFila, "plan" | "promo" | "refunded_at" | "purchased_at"> & { created_at: string };

const n = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
};
const r2 = (x: number) => Math.round(x * 100) / 100;

export type Linea = {
  bruto: number;
  tarifa: number;
  afiliado: number;
  neto: number;
  coproductor: number;
  productor: number;
  reembolsada: boolean;
  estimada: boolean; // algún dato se estimó
};

// Una venta -> sus números. Reembolsada / chargeback: la Hotmart devuelve todo y no queda neto.
export function calcularLinea(f: Partial<Pick<CompraFila, "plan" | "promo" | "refunded_at">> & Omit<ExtraFila, "created_at" | "email">, precioLista?: number): Linea {
  const reembolsada = Boolean(f.refunded_at);
  const monedaOk = !f.currency || f.currency.toUpperCase() === "USD";
  let estimada = false;

  let bruto = monedaOk ? n(f.gross_amount) : null;
  if (bruto === null || bruto <= 0) {
    const lista = precioLista ?? (f.plan === "annual" ? PRECOS.anual.valor : f.promo ? PRECOS.promo.valor : f.plan === "lifetime" ? PRECOS.vitalicio.valor : 0);
    bruto = lista;
    estimada = true;
  }

  let tarifa = monedaOk ? n(f.fee_amount) : null;
  if (tarifa === null) {
    tarifa = r2((bruto * COSTOS.tarifaHotmartPct) / 100 + COSTOS.tarifaHotmartFija);
    estimada = true;
  }
  const afiliado = monedaOk ? (n(f.affiliate_amount) ?? 0) : 0;

  if (reembolsada) return { bruto, tarifa: 0, afiliado: 0, neto: 0, coproductor: 0, productor: 0, reembolsada, estimada };

  const neto = r2(Math.max(0, bruto - tarifa - afiliado));
  let coproductor = monedaOk ? n(f.coproducer_amount) : null;
  let productor = monedaOk ? n(f.producer_amount) : null;
  if (coproductor === null && productor !== null) coproductor = r2(Math.max(0, neto - productor));
  if (coproductor === null) {
    coproductor = r2((neto * COSTOS.parteCoprodutor) / 100);
    estimada = true;
  }
  if (productor === null) productor = r2(Math.max(0, neto - coproductor));
  return { bruto, tarifa, afiliado, neto, coproductor, productor, reembolsada, estimada };
}

export type Finanzas = {
  ventas: number; // ventas de planes (incluye reembolsadas)
  reembolsadas: number;
  alumnos: number; // alumnos nuevos que se quedaron (ventas - reembolsadas)
  bruto: number; // todo lo que pagaron los clientes (planes + extra), antes de reembolsos
  reembolsos: number; // lo que se devolvió
  tarifas: number; // lo que se queda la Hotmart
  neto: number; // lo que realmente entra a la cuenta (a repartir entre productor y coproductor)
  netoPorAlumno: number | null;
  extra: { ventas: number; bruto: number; neto: number };
  productor: number;
  coproductor: number;
  estimadas: number; // ventas con algún dato estimado
  porPlan: { clave: string; etiqueta: string; ventas: number; reembolsadas: number; bruto: number; neto: number }[];
};

export function calcularFinanzas(
  compras: CompraFila[],
  extras: ExtraFila[],
): Finanzas {
  const grupos = new Map<string, { etiqueta: string; ventas: number; reembolsadas: number; bruto: number; neto: number }>();
  const clave = (c: CompraFila) => (c.plan === "annual" ? "annual" : c.promo ? "promo" : "lifetime");
  const etiquetas: Record<string, string> = { annual: `1 año (US$${PRECOS.anual.valor})`, lifetime: `Vitalicio (US$${PRECOS.vitalicio.valor})`, promo: `Promo de lanzamiento (US$${PRECOS.promo.valor})` };

  let bruto = 0, reembolsos = 0, tarifas = 0, neto = 0, productor = 0, coproductor = 0, estimadas = 0, reembolsadas = 0;
  for (const c of compras) {
    const l = calcularLinea(c);
    bruto += l.bruto;
    if (l.reembolsada) {
      reembolsos += l.bruto;
      reembolsadas++;
    } else {
      tarifas += l.tarifa;
      neto += l.neto;
      productor += l.productor;
      coproductor += l.coproductor;
    }
    if (l.estimada) estimadas++;
    const k = clave(c);
    const g = grupos.get(k) ?? { etiqueta: etiquetas[k], ventas: 0, reembolsadas: 0, bruto: 0, neto: 0 };
    g.ventas++;
    g.bruto += l.bruto;
    g.neto += l.neto;
    if (l.reembolsada) g.reembolsadas++;
    grupos.set(k, g);
  }

  let extraBruto = 0, extraNeto = 0;
  for (const e of extras) {
    const l = calcularLinea(e, EXTRA.valor);
    extraBruto += l.bruto;
    extraNeto += l.neto;
    bruto += l.bruto;
    tarifas += l.tarifa;
    neto += l.neto;
    productor += l.productor;
    coproductor += l.coproductor;
    if (l.estimada) estimadas++;
  }

  const alumnos = compras.length - reembolsadas;
  return {
    ventas: compras.length,
    reembolsadas,
    alumnos,
    bruto: r2(bruto),
    reembolsos: r2(reembolsos),
    tarifas: r2(tarifas),
    neto: r2(neto),
    netoPorAlumno: alumnos > 0 ? r2(neto / alumnos) : null,
    extra: { ventas: extras.length, bruto: r2(extraBruto), neto: r2(extraNeto) },
    productor: r2(productor),
    coproductor: r2(coproductor),
    estimadas,
    porPlan: ["promo", "annual", "lifetime"].flatMap((k) => {
      const g = grupos.get(k);
      return g ? [{ clave: k, ...g, bruto: r2(g.bruto), neto: r2(g.neto) }] : [];
    }),
  };
}
