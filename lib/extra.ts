// Precio de la clase extra para los alumnos: US$10 durante los primeros 15 días desde la compra del curso,
// después vuelve a US$20. Todo el cálculo vive acá (sin dependencias del framework) para poder probarlo.
import { EXTRA } from "./config.ts";

const HORA = 3600000;

export type PrecioExtra = {
  enOferta: boolean;
  valor: number;
  valorAntes: number | null; // precio tachado (solo durante la oferta)
  vence: Date | null;
  horasRestantes: number | null; // solo durante la oferta
};

// compraEn: fecha de compra del curso (null = vista previa del equipo: se muestra la oferta completa).
export function precioExtra(compraEn: Date | null, ahora: Date): PrecioExtra {
  if (!compraEn) return { enOferta: true, valor: EXTRA.valor, valorAntes: EXTRA.valorAntes, vence: null, horasRestantes: null };
  const vence = new Date(compraEn.getTime() + EXTRA.diasPrecio * 24 * HORA);
  const restan = vence.getTime() - ahora.getTime();
  if (restan > 0) return { enOferta: true, valor: EXTRA.valor, valorAntes: EXTRA.valorAntes, vence, horasRestantes: restan / HORA };
  return { enOferta: false, valor: EXTRA.valorAntes, valorAntes: null, vence, horasRestantes: null };
}

// "5 días", "1 día", "menos de 24 horas" (redondea hacia arriba los días completos que faltan).
export function textoRestante(horas: number): string {
  if (horas <= 24) return "menos de 24 horas";
  const dias = Math.ceil(horas / 24);
  return dias === 1 ? "1 día" : `${dias} días`;
}

function sinOff(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("off");
    return u.toString();
  } catch {
    return url;
  }
}

// Link de checkout de la Hotmart según el precio vigente. Con email, la Hotmart lo trae completado.
export function enlaceExtra(
  enOferta: boolean,
  urls: { oferta?: string; normal?: string },
  email?: string,
): string | null {
  const base = enOferta ? urls.oferta : urls.normal || (urls.oferta ? sinOff(urls.oferta) : undefined);
  if (!base) return null;
  if (!email) return base;
  try {
    const u = new URL(base);
    u.searchParams.set("email", email.trim().toLowerCase());
    return u.toString();
  } catch {
    return base;
  }
}

export const URLS_EXTRA = { oferta: EXTRA.checkoutUrl, normal: EXTRA.checkoutUrlNormal };
