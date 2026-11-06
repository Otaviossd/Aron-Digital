"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function exigirAdmin() {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) throw new Error("No autorizado");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

const texto = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};

// Responde a un comentario desde el panel. Sale con el sello de Instructor si el e-mail está en la lista de instructores.
export async function responderComentario(formData: FormData) {
  const { supabase, user } = await exigirAdmin();
  const cuerpo = texto(formData, "cuerpo");
  if (!cuerpo) return;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const nombre = typeof meta.full_name === "string" && meta.full_name ? meta.full_name : (user?.email ?? "Equipo").split("@")[0];
  const avatar = typeof meta.avatar_url === "string" ? meta.avatar_url : null;
  const { error } = await supabase.rpc("publicar_comentario", {
    p_tipo: texto(formData, "tipo"),
    p_lesson_id: texto(formData, "lesson_id") || null,
    p_parent_id: texto(formData, "parent_id"),
    p_cuerpo: cuerpo,
    p_nombre: nombre,
    p_avatar: avatar,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/comentarios");
  revalidatePath("/aulas", "layout");
}

export async function borrarComentarioAdmin(formData: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.rpc("borrar_comentario", { p_id: texto(formData, "id") });
  revalidatePath("/admin/comentarios");
}

export async function agregarInstructor(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const email = texto(formData, "email").toLowerCase();
  const nombre = texto(formData, "nombre") || "Aaron Dalla Rosa";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido");
  const { error } = await supabase.from("instructores").upsert({ email, nombre });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/instructor");
  revalidatePath("/aulas", "layout");
}

export async function quitarInstructor(formData: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from("instructores").delete().eq("email", texto(formData, "email"));
  revalidatePath("/admin/instructor");
  revalidatePath("/aulas", "layout");
}
