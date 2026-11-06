"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { firmaTransparente } from "@/lib/firma-imagen";
import { RUTA_FIRMA } from "@/lib/firma";

export type EstadoFirma = { error?: string; ok?: boolean };

export async function subirFirma(_prev: EstadoFirma, formData: FormData): Promise<EstadoFirma> {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) return { error: "No autorizado." };

  const archivo = formData.get("firma");
  if (!(archivo instanceof File) || archivo.size === 0) return { error: "Elegí una imagen de la firma." };
  if (!["image/png", "image/jpeg", "image/webp"].includes(archivo.type)) return { error: "Usá una imagen PNG, JPG o WebP." };
  if (archivo.size > 6 * 1024 * 1024) return { error: "La imagen pesa más de 6 MB." };

  let png: Buffer;
  try {
    png = await firmaTransparente(Buffer.from(await archivo.arrayBuffer()));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo procesar la imagen." };
  }

  const { error } = await supabase.storage.from("covers").upload(RUTA_FIRMA, png, { contentType: "image/png", upsert: true });
  if (error) return { error: "No se pudo guardar la firma. Probá de nuevo." };

  revalidatePath("/admin/instructor");
  return { ok: true };
}

export async function quitarFirma() {
  const supabase = await createClient();
  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) return;
  await supabase.storage.from("covers").remove([RUTA_FIRMA]);
  revalidatePath("/admin/instructor");
}
