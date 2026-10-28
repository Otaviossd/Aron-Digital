// Secuencia de emails para quien compró el curso pero NO la clase extra.
// Durante los primeros 15 días (360 h) el precio de alumno es US$10; después sigue a US$20.
// Cada paso tiene una ventana: si el agendador se atrasa y la ventana pasó, el paso se salta (nunca se manda un email viejo).

export const HORAS_OFERTA = 15 * 24;

export const PASOS_EXTRA = [
  // con precio de alumno (US$10)
  { step: 1, desde: 3, hasta: 48 },
  { step: 2, desde: 72, hasta: 140 },
  { step: 3, desde: 216, hasta: 264 }, // día 9
  { step: 4, desde: 288, hasta: 336 }, // día 12
  { step: 5, desde: 336, hasta: 350 }, // día 14: últimas 24 h
  { step: 6, desde: 350, hasta: HORAS_OFERTA }, // últimas horas
  // después: precio normal (US$20)
  { step: 7, desde: 17 * 24, hasta: 25 * 24 },
  { step: 8, desde: 25 * 24, hasta: 40 * 24 },
  { step: 9, desde: 40 * 24, hasta: 60 * 24 },
  { step: 10, desde: 60 * 24, hasta: 90 * 24 },
  { step: 11, desde: 90 * 24, hasta: 100 * 24 },
] as const;

export const MAX_HORAS_EXTRA = 100 * 24;
const ESPERA_MINIMA_HORAS = 12; // nunca dos emails seguidos en menos de 12 h

type Entrada = {
  compraEn: Date;
  ahora: Date;
  enviados: number[]; // pasos ya enviados
  ultimoEnvio: Date | null;
};

export function pasoExtraDebido({ compraEn, ahora, enviados, ultimoEnvio }: Entrada): number | null {
  const horas = (ahora.getTime() - compraEn.getTime()) / 3600000;
  if (horas < 0) return null;
  const abierto = PASOS_EXTRA.find((p) => horas >= p.desde && horas < p.hasta);
  if (!abierto) return null;
  if (enviados.some((s) => s >= abierto.step)) return null;
  if (ultimoEnvio && (ahora.getTime() - ultimoEnvio.getTime()) / 3600000 < ESPERA_MINIMA_HORAS) return null;
  return abierto.step;
}
