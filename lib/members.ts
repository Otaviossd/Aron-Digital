import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

import { BRAND } from "@/lib/config";
export { BRAND };

export type ModuloEstado = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  unlock_after_days: number;
  cover_url: string | null;
  accent: string;
  unlock_at: string | null;
  is_unlocked: boolean;
  is_bonus: boolean;
  // clases en vivo grabadas (existe después de correr supabase/plataforma-v2.sql)
  is_live?: boolean;
};

export type Aula = {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  position: number;
  duration_minutes: number | null;
  published_at?: string;
  unlock_at?: string | null;
  is_unlocked?: boolean;
};

// Usuário logado + dados comuns da área de membros (módulos, aulas visíveis, concluídas).
// cache() evita repetir as consultas quando layout e página pedem os mesmos dados na mesma requisição.
export const getMemberData = cache(async function getMemberData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/entrar");

  const [{ data: modulosRaw }, { data: aulasRaw }, { data: progresoRaw }, { data: admin }, { data: cursoRaw }] =
    await Promise.all([
      supabase.rpc("my_modules"),
      supabase.rpc("my_lessons"),
      supabase.from("lesson_progress").select("lesson_id"),
      supabase.rpc("is_admin"),
      // Avance del curso principal (sin bonos ni lives). Si todavía no se corrió plataforma-v2.sql, viene vacío.
      supabase.rpc("progreso_curso"),
    ]);

  let modulos = ((modulosRaw ?? []) as ModuloEstado[]).sort((a, b) => a.position - b.position);
  let aulas = (aulasRaw ?? []) as Aula[];

  // Vista previa para el equipo: el admin ve todo abierto; con esta cookie ve el curso como un alumno que compró hoy (con candados).
  const vistaAlumno = admin === true && (await cookies()).get("vista_alumno")?.value === "1";
  if (vistaAlumno) {
    const { data: diasAulas } = await supabase.from("lessons").select("id, unlock_after_days");
    const diasAula = new Map(((diasAulas ?? []) as { id: string; unlock_after_days: number }[]).map((x) => [x.id, x.unlock_after_days]));
    const diasModulo = new Map(modulos.map((m) => [m.id, m.unlock_after_days]));
    const ahora = Date.now();
    const en = (dias: number) => ({ unlock_at: dias > 0 ? new Date(ahora + dias * 86400000).toISOString() : null, is_unlocked: dias <= 0 });
    modulos = modulos.map((m) => ({ ...m, ...en(m.unlock_after_days) }));
    aulas = aulas
      .filter((a) => (diasModulo.get(a.module_id) ?? 0) <= 0)
      .map((a) => ({ ...a, ...en(Math.max(diasModulo.get(a.module_id) ?? 0, diasAula.get(a.id) ?? 0)) }));
  }
  const completadas = new Set(((progresoRaw ?? []) as { lesson_id: string }[]).map((p) => p.lesson_id));

  // Avance real del curso principal: todas las clases publicadas, también las que aún no se abrieron.
  const filaCurso = (Array.isArray(cursoRaw) ? cursoRaw[0] : null) as { total: number; hechas: number; minutos: number; elegible: boolean } | null;
  const idsLive = new Set(modulos.filter((m) => m.is_live).map((m) => m.id));
  let porcentaje: number;
  if (filaCurso && filaCurso.total > 0 && !vistaAlumno) {
    porcentaje = Math.round((filaCurso.hechas / filaCurso.total) * 100);
  } else {
    // Sin la función nueva (o en vista alumno): sobre las clases ya liberadas, sin las grabaciones de lives.
    const liberadas = aulas.filter((a) => a.is_unlocked !== false && !idsLive.has(a.module_id));
    const hechas = liberadas.filter((a) => completadas.has(a.id)).length;
    porcentaje = liberadas.length === 0 ? 0 : Math.round((hechas / liberadas.length) * 100);
  }
  const progreso = filaCurso ?? null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nombreMeta = [meta.full_name, meta.name].find((v) => typeof v === "string" && v.trim()) as string | undefined;
  const nombre = nombreMeta?.trim() ?? nombreDeEmail(user.email);
  const avatarUrl = typeof user.user_metadata?.avatar_url === "string" ? (user.user_metadata.avatar_url as string) : null;

  return {
    supabase,
    user,
    email: user.email,
    esAdmin: admin === true,
    vistaAlumno,
    avatarUrl,
    modulos,
    aulas,
    completadas,
    porcentaje,
    progreso,
    nombre,
    tieneNombre: Boolean(nombreMeta),
  };
});

// "ana.lopez@gmail.com" → "Ana Lopez"
export function nombreDeEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._\-+\d]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ") || email;
}

// Aulas de um módulo, na ordem em que aparecem (as que RLS libera).
export function aulasDelModulo(aulas: Aula[], moduloId: string) {
  return aulas.filter((a) => a.module_id === moduloId).sort((a, b) => a.position - b.position);
}

// Primeira aula ainda não concluída, na ordem módulo → aula.
export function siguienteAula(modulos: ModuloEstado[], aulas: Aula[], completadas: Set<string>) {
  for (const m of modulos) {
    if (!m.is_unlocked || m.is_live) continue;
    const pendiente = aulasDelModulo(aulas, m.id).find((a) => a.is_unlocked !== false && !completadas.has(a.id));
    if (pendiente) return { aula: pendiente, modulo: m };
  }
  return null;
}

// "en 3 días" para mostrar cuándo se libera algo bloqueado.
export function diasRestantes(fecha: string) {
  const dias = Math.max(1, Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000));
  return `en ${dias} ${dias === 1 ? "día" : "días"}`;
}
