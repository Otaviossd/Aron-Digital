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
