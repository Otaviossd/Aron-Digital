// Tipos y ayudas compartidas por los comentarios de las clases y la comunidad.

export type Comentario = {
  id: string;
  parent_id: string | null;
  autor_nombre: string;
  autor_avatar: string | null;
  es_instructor: boolean;
  es_mio: boolean;
  cuerpo: string;
  fijado: boolean;
  created_at: string;
  likes: number;
  yo_di_like: boolean;
};

export type Hilo = Comentario & { respuestas: Comentario[] };

// Une los comentarios principales con sus respuestas. Principales: fijados primero, luego los más nuevos.
export function armarHilos(lista: Comentario[]): Hilo[] {
  const respuestas = new Map<string, Comentario[]>();
  for (const c of lista) {
    if (!c.parent_id) continue;
    const grupo = respuestas.get(c.parent_id) ?? [];
    grupo.push(c);
    respuestas.set(c.parent_id, grupo);
  }
  return lista
    .filter((c) => !c.parent_id)
    .map((c) => ({
      ...c,
      respuestas: (respuestas.get(c.id) ?? []).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }))
    .sort((a, b) => Number(b.fijado) - Number(a.fijado) || b.created_at.localeCompare(a.created_at));
}

// "hace 5 min", "hace 3 h", "hace 2 d", o la fecha si pasó más de una semana.
export function hace(fecha: string, ahora = Date.now()) {
  const seg = Math.max(0, Math.round((ahora - new Date(fecha).getTime()) / 1000));
  if (seg < 45) return "ahora";
  if (seg < 3600) return `hace ${Math.max(1, Math.round(seg / 60))} min`;
  if (seg < 86400) return `hace ${Math.round(seg / 3600)} h`;
  if (seg < 7 * 86400) return `hace ${Math.round(seg / 86400)} d`;
  return new Date(fecha).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Asuncion" });
}

export function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "?") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

// Mensajes de error de las funciones SQL → texto para la persona.
export function mensajeDeError(msg: string | undefined) {
  if (!msg) return "No se pudo enviar. Probá de nuevo.";
  if (msg.includes("muy_rapido")) return "Vas muy rápido. Esperá un segundo y envialo de nuevo.";
  if (msg.includes("sin_acceso")) return "Necesitás tener acceso al curso para participar.";
  if (msg.includes("clase_cerrada")) return "Esta clase todavía no está abierta para comentar.";
  if (msg.includes("live_cerrada")) return "La clase en vivo ya terminó.";
  return "No se pudo enviar. Probá de nuevo.";
}
