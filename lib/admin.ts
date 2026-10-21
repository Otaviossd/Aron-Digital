// Formatação e helpers do painel do equipe (admin).

export const fmtFecha = (d: string | Date) =>
  new Date(d).toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" });

export const fmtFechaHora = (d: string | Date) =>
  new Date(d).toLocaleString("es-PY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

// "hace 3 h", "hace 2 días"
export function hace(d: string | Date) {
  const min = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}

export type ResumenAdmin = {
  activos: number;
  activos_mensual: number;
  activos_anual: number;
  activos_vitalicio: number;
  compras: number;
  compras_7d: number;
  reembolsos: number;
  viendo_24h: number;
  viendo_7d: number;
  viendo_30d: number;
  vistas: number;
  completadas: number;
  aulas: number;
  modulos: number;
  top_clases: { title: string; vistas: number; alumnos: number }[];
  actividad: { email: string; clase: string; cuando: string }[];
};

export type AlumnoAdmin = {
  email: string;
  plan: string;
  status: string;
  purchased_at: string;
  access_until: string | null;
  refunded_at: string | null;
  con_acceso: boolean;
  completadas: number;
  vistas: number;
  ultima_vista: string | null;
};

export const estadoAlumno = (a: Pick<AlumnoAdmin, "refunded_at" | "status" | "con_acceso">) =>
  a.refunded_at ? "Reembolsado" : a.con_acceso ? (a.status === "cancelled" ? "Cancelado (con acceso)" : "Activo") : a.status === "suspended" ? "Suspendido" : "Sin acceso";

// Estado da configuração (só diz se cada variável existe; nunca mostra valores).
const tiene = (v: string | undefined) => Boolean(v && v.trim());

export function estadoConfig() {
  const e = process.env;
  return {
    pagos: [
      { id: "hotmart-anual", etiqueta: "Hotmart: link de checkout de 1 año", ok: tiene(e.NEXT_PUBLIC_HOTMART_URL_ANUAL) },
      { id: "hotmart-vitalicio", etiqueta: "Hotmart: link de checkout vitalicio", ok: tiene(e.NEXT_PUBLIC_HOTMART_URL_VITALICIO) },
      { id: "hotmart-promo", etiqueta: "Hotmart: link de la promo de lanzamiento", ok: tiene(e.NEXT_PUBLIC_HOTMART_URL_PROMO) },
      { id: "hotmart-hottok", etiqueta: "Hotmart: hottok del webhook (HOTMART_HOTTOK)", ok: tiene(e.HOTMART_HOTTOK) },
      { id: "hotmart-ofertas", etiqueta: "Hotmart: códigos de las 3 ofertas", ok: tiene(e.HOTMART_OFFER_PROMO) && tiene(e.HOTMART_OFFER_VITALICIO) && tiene(e.HOTMART_OFFER_ANUAL) },
    ],
    email: [
      { id: "resend", etiqueta: "Resend: API key", ok: tiene(e.RESEND_API_KEY) },
      { id: "from", etiqueta: "Remitente de compra (EMAIL_FROM)", ok: tiene(e.EMAIL_FROM) },
      { id: "from-mkt", etiqueta: "Remitente de marketing (opcional, recomendado)", ok: tiene(e.EMAIL_FROM_MARKETING), opcional: true },
      { id: "cron", etiqueta: "Clave del agendador (CRON_SECRET)", ok: tiene(e.CRON_SECRET) },
    ],
    sitio: [{ id: "site", etiqueta: "URL del sitio (NEXT_PUBLIC_SITE_URL)", ok: tiene(e.NEXT_PUBLIC_SITE_URL) && !/localhost/.test(e.NEXT_PUBLIC_SITE_URL ?? "") }],
  };
}

export const nombrePlan = (plan: string) => (plan === "lifetime" ? "Vitalicio" : plan === "annual" ? "1 año" : "Mensual");
