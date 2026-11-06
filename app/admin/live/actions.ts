"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { aEmbed } from "@/lib/video";
import { desdeHoraParaguay } from "@/lib/live";

async function exigirAdmin() {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) throw new Error("No autorizado");
  return supabase;
}

const texto = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};

function refrescar() {
  revalidatePath("/admin/live");
  revalidatePath("/aulas", "layout");
}

export type EstadoLive = { error?: string; ok?: string };

// Crea una clase en vivo: programada para más tarde o iniciada ahora (botón "Iniciar ahora").
export async function crearLive(_prev: EstadoLive, formData: FormData): Promise<EstadoLive> {
  const supabase = await exigirAdmin();
  const titulo = texto(formData, "titulo");
  if (!titulo) return { error: "Poné un título para la clase en vivo." };

  const enlace = texto(formData, "video_url");
  const video_url = enlace ? aEmbed(enlace) : null;
  if (enlace && !video_url) return { error: "El enlace del directo no es válido. Pegá el enlace de YouTube." };

  const ahora = formData.get("accion") === "iniciar";
  const programada = texto(formData, "programada_para");
  const programada_para = programada ? desdeHoraParaguay(programada) : null;
  if (programada && !programada_para) return { error: "La fecha no es válida." };
  if (ahora && !video_url) return { error: "Para iniciar ahora necesitás pegar el enlace del directo." };

  const { data: enCurso } = await supabase.from("lives").select("id").eq("estado", "en_vivo").limit(1);
  if (ahora && (enCurso ?? []).length > 0) return { error: "Ya hay una clase en vivo en curso. Terminala antes de iniciar otra." };

  const { error } = await supabase.from("lives").insert({
    titulo,
    video_url,
    estado: ahora ? "en_vivo" : "programada",
    programada_para: ahora ? null : programada_para,
    inicio_at: ahora ? new Date().toISOString() : null,
  });
  if (error) return { error: "No se pudo guardar. ¿Ya corriste el SQL de plataforma-v2?" };

  refrescar();
  return { ok: ahora ? "¡Estás en vivo!" : "Clase en vivo programada." };
}

// Pasa una clase programada a "en vivo". Si ya tiene enlace, no hace falta pegarlo otra vez.
export async function iniciarLive(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = texto(formData, "id");
  const enlace = texto(formData, "video_url");
  const video = enlace ? aEmbed(enlace) : null;

  const { data: live } = await supabase.from("lives").select("video_url").eq("id", id).maybeSingle();
  const url = video ?? (live?.video_url as string | null) ?? null;
  if (!url) throw new Error("Falta el enlace del directo.");

  const { data: enCurso } = await supabase.from("lives").select("id").eq("estado", "en_vivo").neq("id", id).limit(1);
  if ((enCurso ?? []).length > 0) throw new Error("Ya hay otra clase en vivo en curso.");

  const { error } = await supabase.from("lives").update({ estado: "en_vivo", video_url: url, inicio_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  refrescar();
}

// Termina el directo y, si se pide, publica la grabación en el módulo "Clases en vivo".
export async function terminarLive(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = texto(formData, "id");
  const publicar = formData.get("publicar") === "on";
  const enlace = texto(formData, "grabacion_url");
  const grabacion = enlace ? aEmbed(enlace) : null;
  const { error } = await supabase.rpc("finalizar_live", { p_live_id: id, p_publicar: publicar, p_video_url: grabacion });
  if (error) throw new Error(error.message);
  refrescar();
}

// Publica la grabación de una clase que ya terminó (por si en su momento se eligió no publicar).
export async function publicarGrabacion(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = texto(formData, "id");
  const enlace = texto(formData, "grabacion_url");
  const grabacion = enlace ? aEmbed(enlace) : null;
  const { error } = await supabase.rpc("finalizar_live", { p_live_id: id, p_publicar: true, p_video_url: grabacion });
  if (error) throw new Error(error.message);
  refrescar();
}

export async function eliminarLive(formData: FormData) {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("lives").delete().eq("id", texto(formData, "id"));
  if (error) throw new Error(error.message);
  refrescar();
}
