// Tipos y ayudas de las clases en vivo.

export type LiveActual = {
  id: string;
  titulo: string;
  estado: "programada" | "en_vivo" | "terminada";
  video_url: string | null;
  programada_para: string | null;
  inicio_at: string | null;
  fin_at: string | null;
  lesson_id: string | null;
};

export type MensajeLive = {
  id: number;
  live_id: string;
  autor_id: string | null;
  autor_nombre: string;
  autor_avatar: string | null;
  es_instructor: boolean;
  cuerpo: string;
  created_at: string;
};

// "domingo 16 de noviembre · 20:00", siempre en hora de Paraguay.
export function cuando(fecha: string) {
  const d = new Date(fecha);
  const dia = new Intl.DateTimeFormat("es-PY", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Asuncion" }).format(d);
  const hora = new Intl.DateTimeFormat("es-PY", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Asuncion" }).format(d);
  return `${dia} · ${hora} (hora de Paraguay)`;
}

// 90061 s → "1 d 01 h" · 3725 s → "1 h 02 min" · 125 s → "2 min 05 s"
export function cuentaAtras(segundos: number) {
  const s = Math.max(0, Math.floor(segundos));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d} d ${dos(h)} h`;
  if (h > 0) return `${h} h ${dos(m)} min`;
  return `${m} min ${dos(seg)} s`;
}

// Convierte "2026-11-16T20:00" (hora de Paraguay, UTC-3 todo el año) en un instante UTC.
export function desdeHoraParaguay(valor: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  const d = new Date(`${valor}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
