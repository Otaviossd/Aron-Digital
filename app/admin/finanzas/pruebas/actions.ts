"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function exigirAdmin() {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) throw new Error("No autorizado");
  return { supabase };
}

const texto = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};

// Marca un e-mail como "de prueba": a partir de ahora no cuenta en ningún número del panel
// (Finanzas, alumnos activos, vistas, etc.), sin borrar ninguna fila real.
export async function marcarPrueba(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const email = texto(formData, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("E-mail inválido");
  const { error } = await supabase.from("emails_excluidos").upsert({ email });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/finanzas/pruebas");
  revalidatePath("/admin/finanzas");
  revalidatePath("/admin");
}

// Vuelve a contar ese e-mail en los números (lo saca de la lista de prueba).
export async function quitarPrueba(formData: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from("emails_excluidos").delete().eq("email", texto(formData, "email").toLowerCase());
  revalidatePath("/admin/finanzas/pruebas");
  revalidatePath("/admin/finanzas");
  revalidatePath("/admin");
}
