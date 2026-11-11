// Calendario de la secuencia de la lista de espera: captura del 5 al 13 de noviembre, apertura el 11 (09:00, Paraguay).
// Cada email tiene una hora fija (2 por día: 09:00 y 19:00). Quien se anota tarde recibe solo los que todavía no salieron.
// Sin dependencias del framework: se prueba con node --test.

export type PasoCaptura = { step: number; id: string; sendAt: string; fase: "pre" | "lanzamiento" };

const hora = (dia: string, h: string) => `2026-11-${dia}T${h}:00-03:00`;

export const PASOS_CAPTURA: readonly PasoCaptura[] = [
  { step: 1, id: "K1", sendAt: hora("06", "09:00"), fase: "pre" },
  { step: 2, id: "K2", sendAt: hora("06", "19:00"), fase: "pre" },
  { step: 3, id: "K3", sendAt: hora("07", "09:00"), fase: "pre" },
  { step: 4, id: "K4", sendAt: hora("07", "19:00"), fase: "pre" },
  { step: 5, id: "K5", sendAt: hora("08", "09:00"), fase: "pre" },
  { step: 6, id: "K6", sendAt: hora("08", "19:00"), fase: "pre" },
  { step: 7, id: "K7", sendAt: hora("09", "09:00"), fase: "pre" },
  { step: 8, id: "K8", sendAt: hora("09", "19:00"), fase: "pre" },
  { step: 9, id: "K9", sendAt: hora("10", "09:00"), fase: "pre" },
  { step: 10, id: "K10", sendAt: hora("10", "19:00"), fase: "pre" },
  // La apertura se movió del 11 al sábado 14. Los pasos 11 a 14 (apertura vieja) quedan retirados: no se vuelven a usar
  // para que quien ya recibió alguno reciba igual los nuevos (cada paso se envía una sola vez por persona).
  { step: 15, id: "C1", sendAt: hora("11", "09:55"), fase: "pre" }, // aviso del cambio de fecha
  { step: 16, id: "R1", sendAt: hora("13", "09:00"), fase: "pre" },
  { step: 17, id: "R2", sendAt: hora("13", "19:00"), fase: "pre" },
  { step: 18, id: "L1", sendAt: hora("14", "09:00"), fase: "lanzamiento" },
  { step: 19, id: "L2", sendAt: hora("14", "19:00"), fase: "lanzamiento" },
  { step: 20, id: "L3", sendAt: hora("16", "09:00"), fase: "lanzamiento" },
  { step: 21, id: "L4", sendAt: hora("16", "19:00"), fase: "lanzamiento" },
];

// Si el agendador se atrasa, un email sigue "vigente" este tiempo; pasado eso se salta (nunca sale un email viejo).
export const VENTANA_HORAS = 18;

type Entrada = {
  creadoEn: Date; // cuándo se anotó
  ahora: Date;
  enviados: number[]; // pasos ya enviados
  compro: boolean;
  baja: boolean;
};

// Qué paso toca mandar ahora a esta persona (o null). Se manda solo el más reciente que ya venció.
export function pasoCapturaDebido({ creadoEn, ahora, enviados, compro, baja }: Entrada): number | null {
  if (compro || baja) return null;
  const vigentes = PASOS_CAPTURA.filter((p) => {
    const t = new Date(p.sendAt).getTime();
    return t <= ahora.getTime() && ahora.getTime() - t < VENTANA_HORAS * 3600000 && t >= creadoEn.getTime();
  });
  if (vigentes.length === 0) return null;
  const candidato = vigentes[vigentes.length - 1];
  if (enviados.some((s) => s >= candidato.step)) return null;
  return candidato.step;
}

// ¿Hay algún paso vigente? (para no consultar la base cuando no toca enviar nada)
export function hayPasoVigente(ahora: Date): boolean {
  return PASOS_CAPTURA.some((p) => {
    const t = new Date(p.sendAt).getTime();
    return t <= ahora.getTime() && ahora.getTime() - t < VENTANA_HORAS * 3600000;
  });
}
