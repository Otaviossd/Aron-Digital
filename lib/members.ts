import { cache } from "react";
import { redirect } from "next/navigation";
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

  const [{ data: modulosRaw }, { data: aulasRaw }, { data: progresoRaw }, { data: admin }] =
    await Promise.all([
      supabase.rpc("my_modules"),
      supabase.rpc("my_lessons"),
      supabase.from("lesson_progress").select("lesson_id"),
      supabase.rpc("is_admin"),
    ]);

  const modulos = ((modulosRaw ?? []) as ModuloEstado[]).sort((a, b) => a.position - b.position);
  const aulas = (aulasRaw ?? []) as Aula[];
  const completadas = new Set(((progresoRaw ?? []) as { lesson_id: string }[]).map((p) => p.lesson_id));

  // El progreso se calcula sobre las clases ya liberadas, para no penalizar lo que todavía está bloqueado.
  const liberadas = aulas.filter((a) => a.is_unlocked !== false);
  const hechas = liberadas.filter((a) => completadas.has(a.id)).length;
  const porcentaje = liberadas.length === 0 ? 0 : Math.round((hechas / liberadas.length) * 100);
  const avatarUrl = typeof user.user_metadata?.avatar_url === "string" ? (user.user_metadata.avatar_url as string) : null;

  return {
    supabase,
    user,
    email: user.email,
    esAdmin: admin === true,
    avatarUrl,
    modulos,
    aulas,
    completadas,
    porcentaje,
  };
});

// Aulas de um módulo, na ordem em que aparecem (as que RLS libera).
export function aulasDelModulo(aulas: Aula[], moduloId: string) {
  return aulas.filter((a) => a.module_id === moduloId).sort((a, b) => a.position - b.position);
}

// Primeira aula ainda não concluída, na ordem módulo → aula.
export function siguienteAula(modulos: ModuloEstado[], aulas: Aula[], completadas: Set<string>) {
  for (const m of modulos) {
    if (!m.is_unlocked) continue;
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
