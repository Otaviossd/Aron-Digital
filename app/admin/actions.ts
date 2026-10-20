"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
const entero = (f: FormData, k: string, def = 0) => {
  const n = parseInt(texto(f, k), 10);
  return Number.isFinite(n) ? n : def;
};

function refrescar() {
  revalidatePath("/admin", "layout");
  revalidatePath("/aulas", "layout");
}

export async function guardarModulo(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = texto(formData, "id");

  let cover_url = texto(formData, "cover_url") || null;

  // Si se envió un archivo, se sube al Storage y se usa la URL pública.
  const arquivo = formData.get("cover_file");
  if (arquivo instanceof File && arquivo.size > 0) {
    const ext = (arquivo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const caminho = `${crypto.randomUUID()}.${ext || "jpg"}`;
    const { error } = await supabase.storage.from("covers").upload(caminho, arquivo, {
      contentType: arquivo.type || "image/jpeg",
    });
    if (error) throw new Error(`No se pudo subir la portada: ${error.message}`);
    cover_url = supabase.storage.from("covers").getPublicUrl(caminho).data.publicUrl;
  }

  const accent = /^#[0-9a-fA-F]{6}$/.test(texto(formData, "accent")) ? texto(formData, "accent") : "#cdb48a";

  const fila = {
    title: texto(formData, "title"),
    description: texto(formData, "description") || null,
    position: entero(formData, "position"),
    unlock_after_days: Math.max(0, entero(formData, "unlock_after_days")),
    cover_url,
    accent,
    is_bonus: formData.get("is_bonus") === "on",
  };
  if (!fila.title) throw new Error("El módulo necesita un título");

  const { error } = id
    ? await supabase.from("modules").update(fila).eq("id", id)
    : await supabase.from("modules").insert(fila);
  if (error) throw new Error(error.message);
  refrescar();
}

export async function apagarModulo(formData: FormData) {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("modules").delete().eq("id", texto(formData, "id"));
  if (error) throw new Error(error.message);
  refrescar();
}

export async function guardarAula(formData: FormData) {
  const supabase = await exigirAdmin();
  const id = texto(formData, "id");
  const publicada = texto(formData, "published_at");

  const fila = {
    module_id: texto(formData, "module_id"),
    title: texto(formData, "title"),
    description: texto(formData, "description") || null,
    position: entero(formData, "position"),
    video_url: texto(formData, "video_url") || null,
    unlock_after_days: Math.max(0, entero(formData, "unlock_after_days")),
    duration_minutes: texto(formData, "duration_minutes") ? entero(formData, "duration_minutes") : null,
    // datetime-local vem sem fuso; interpretamos como horário de Assunção (UTC-03:00).
    published_at: publicada ? new Date(`${publicada}:00-03:00`).toISOString() : new Date().toISOString(),
  };
  if (!fila.title || !fila.module_id) throw new Error("La clase necesita título y módulo");

  const { error } = id
    ? await supabase.from("lessons").update(fila).eq("id", id)
    : await supabase.from("lessons").insert(fila);
  if (error) throw new Error(error.message);
  refrescar();
}

export async function apagarAula(formData: FormData) {
  const supabase = await exigirAdmin();
  const { error } = await supabase.from("lessons").delete().eq("id", texto(formData, "id"));
  if (error) throw new Error(error.message);
  refrescar();
}

// ---------- Equipo (quem pode entrar no painel) ----------

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function agregarAdmin(formData: FormData) {
  const supabase = await exigirAdmin();
  const email = texto(formData, "email").toLowerCase();
  if (!EMAIL_OK.test(email) || email.length > 254) throw new Error("Email no válido");
  // on conflict do nothing: agregar dos veces el mismo email no es un error
  const { error } = await supabase.from("admins").upsert({ email }, { onConflict: "email", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function quitarAdmin(formData: FormData) {
  const supabase = await exigirAdmin();
  const email = texto(formData, "email").toLowerCase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() === email) throw new Error("No podés quitarte a vos mismo del equipo");

  const { count } = await supabase.from("admins").select("email", { count: "exact", head: true });
  if ((count ?? 0) <= 1) throw new Error("Tiene que quedar al menos una persona en el equipo");

  const { error } = await supabase.from("admins").delete().eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}
