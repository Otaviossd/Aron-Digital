import type { SupabaseClient } from "@supabase/supabase-js";

// Para onde cada pessoa vai depois de entrar: equipe (admin) cai direto no painel,
// aluno cai direto nas aulas. Quem decide é a tabela public.admins.
export async function rutaInicial(supabase: SupabaseClient): Promise<"/admin" | "/aulas"> {
  const { data } = await supabase.rpc("is_admin");
  return data === true ? "/admin" : "/aulas";
}
