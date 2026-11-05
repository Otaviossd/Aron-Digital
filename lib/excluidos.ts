import type { SupabaseClient } from "@supabase/supabase-js";

// E-mails de prueba (nuestros): no cuentan en los números del panel. La lista vive en la tabla
// public.emails_excluidos (supabase/excluir-pruebas.sql); si la tabla todavía no existe, se usa esta.
const RESPALDO = ["otavio.gabriel.0256@gmail.com", "tape.agency.py@gmail.com"];

export async function cargarExcluidos(supabase: SupabaseClient): Promise<string[]> {
  try {
    const { data, error } = await supabase.from("emails_excluidos").select("email");
    if (error || !data) return RESPALDO;
    return data.map((r) => String(r.email).toLowerCase());
  } catch {
    return RESPALDO;
  }
}

// Valor para PostgREST: .not("columna", "in", enLista(lista))
export const enLista = (emails: string[]) => `(${emails.map((e) => `"${e}"`).join(",")})`;
