import { supabaseUrl } from "@/lib/env";
import { siteUrl } from "@/lib/site";

// Firma de Aaron para el certificado: PNG transparente que sube el equipo en /admin/instructor.
// Vive en el bucket público "covers". Sin ella, el certificado usa el nombre en cursiva.
export const RUTA_FIRMA = "firma/aaron.png";

export async function cargarFirma(): Promise<Uint8Array | null> {
  const base = supabaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/storage/v1/object/public/covers/${RUTA_FIRMA}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    // Firma PNG real: empieza con la cabecera PNG
    return buf.length > 100 && buf[0] === 0x89 && buf[1] === 0x50 ? buf : null;
  } catch {
    return null;
  }
}

// Logo de la marca (public/logo-lno.png), para el certificado. Se pide por HTTP al sitio ya desplegado
// en vez de leerlo del disco, para no depender de cómo el build empaqueta la carpeta public.
export async function cargarLogo(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`${siteUrl()}/logo-lno.png`, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}
