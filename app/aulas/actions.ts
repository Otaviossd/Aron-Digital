"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Marca/desmarca uma aula como concluída para o aluno logado (RLS garante que só mexe no próprio progresso).
export async function toggleCompletada(lessonId: string, yaCompletada: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return;

  if (yaCompletada) {
    await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId).eq("user_email", user.email);
  } else {
    await supabase
      .from("lesson_progress")
      .upsert({ user_email: user.email, lesson_id: lessonId }, { onConflict: "user_email,lesson_id" });
  }
  revalidatePath("/aulas", "layout");
}

// Registra que o aluno abriu a aula (alimenta "alunos assistindo" no painel). Falhar aqui nunca
// deve atrapalhar quem está assistindo, por isso os erros são ignorados.
export async function registrarVista(lessonId: string) {
  try {
    const supabase = await createClient();
    await supabase.rpc("registrar_vista", { p_lesson_id: lessonId });
  } catch {
    /* sem efeito para o aluno */
  }
}

const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

// Foto de perfil: se guarda en el bucket "avatars" (carpeta = id del usuario) y la URL queda en su perfil.
export async function guardarAvatar(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión." };

  const archivo = formData.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "Elegí una foto." };
  if (!TIPOS_IMAGEN.includes(archivo.type)) return { error: "Usá una imagen JPG, PNG o WebP." };
  if (archivo.size > 4 * 1024 * 1024) return { error: "La foto pesa más de 4 MB. Probá con una más liviana." };

  const ext = archivo.type === "image/png" ? "png" : archivo.type === "image/webp" ? "webp" : "jpg";
  // Nombre nuevo cada vez: evita que el navegador muestre la foto anterior en caché.
  const ruta = `${user.id}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(ruta, archivo, { contentType: archivo.type });
  if (error) return { error: "No pudimos subir la foto. Intentá de nuevo." };

  const url = supabase.storage.from("avatars").getPublicUrl(ruta).data.publicUrl;
  const { error: errPerfil } = await supabase.auth.updateUser({ data: { avatar_url: url } });
  if (errPerfil) return { error: "No pudimos guardar la foto en tu perfil." };

  revalidatePath("/aulas", "layout");
  return { ok: true };
}

export async function quitarAvatar() {
  const supabase = await createClient();
  await supabase.auth.updateUser({ data: { avatar_url: null } });
  revalidatePath("/aulas", "layout");
}

// Nombre que ven los demás en comentarios, comunidad y chat (y que se sugiere en el certificado).
export async function guardarNombre(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión." };

  const nombre = String(formData.get("nombre") ?? "").replace(/\s+/g, " ").trim();
  if (nombre.length < 2) return { error: "Escribí tu nombre." };
  if (nombre.length > 60) return { error: "El nombre es demasiado largo." };

  const { error } = await supabase.auth.updateUser({ data: { full_name: nombre } });
  if (error) return { error: "No pudimos guardar el nombre. Intentá de nuevo." };

  revalidatePath("/aulas", "layout");
  return { ok: true };
}

// Emite el certificado (o corrige el nombre) de quien terminó el 100 % del curso. La validación real está en la base.
export async function emitirCertificado(_prev: { error?: string; ok?: boolean }, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión." };

  const nombre = String(formData.get("nombre") ?? "").replace(/\s+/g, " ").trim();
  if (nombre.length < 5 || !nombre.includes(" ")) return { error: "Escribí tu nombre completo, con nombre y apellido." };
  if (nombre.length > 80) return { error: "El nombre es demasiado largo." };

  const { error } = await supabase.rpc("emitir_certificado", { p_nombre: nombre });
  if (error) {
    if (error.message.includes("curso_incompleto")) return { error: "Todavía te faltan clases por completar." };
    return { error: "No pudimos emitir el certificado. Intentá de nuevo." };
  }

  revalidatePath("/aulas/certificado");
  revalidatePath("/aulas", "layout");
  return { ok: true };
}
