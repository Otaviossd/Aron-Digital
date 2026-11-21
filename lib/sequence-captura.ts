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
  // La apertura se movió del 11 al 14, después al martes 17 a las 17:00, después al miércoles 18 a las 17:00,
  // después al jueves 19 a las 17:00, después al sábado 21 a las 12:00, y por último al lunes 23 a las 8:00
  // (hora de Paraguay). Los pasos 11 a 14, 17 a 21, 27 a 30, 33 a 36 y 39 a 42 (L1 a L4 de fechas ya descartadas)
  // quedan retirados: no se reutilizan para que quien ya recibió alguno reciba igual los nuevos (cada paso
  // se envía una sola vez por persona, y el paso 39 ya salió para toda la lista a las 12:07 del sábado 21,
  // antes de este sexto cambio — por eso el nuevo L1 reutiliza el id pero con un step más alto, para que le
  // llegue también a quien ya había recibido el anuncio viejo).
  { step: 15, id: "C1", sendAt: hora("11", "09:55"), fase: "pre" }, // aviso del primer cambio (sábado 14)
  { step: 16, id: "R1", sendAt: hora("13", "09:00"), fase: "pre" },
  { step: 22, id: "C2", sendAt: hora("13", "12:55"), fase: "pre" }, // aviso del segundo cambio (martes 17, 17:00)
  { step: 23, id: "R3", sendAt: hora("16", "09:00"), fase: "pre" },
  { step: 24, id: "R4", sendAt: hora("17", "09:00"), fase: "pre" },
  { step: 25, id: "C3", sendAt: hora("17", "16:00"), fase: "pre" }, // aviso del tercer cambio (miércoles 18, 17:00)
  { step: 26, id: "R4", sendAt: hora("18", "09:00"), fase: "pre" },
  { step: 31, id: "C4", sendAt: hora("18", "17:15"), fase: "pre" }, // aviso del cuarto cambio (jueves 19, 17:00)
  { step: 32, id: "R4", sendAt: hora("19", "09:00"), fase: "pre" },
  { step: 37, id: "C5", sendAt: hora("19", "17:20"), fase: "pre" }, // aviso del quinto cambio (sábado 21, 12:00)
  { step: 38, id: "R5", sendAt: hora("21", "09:00"), fase: "pre" },
  { step: 43, id: "C6", sendAt: hora("21", "13:30"), fase: "pre" }, // aviso del sexto cambio (lunes 23, 8:00)
  { step: 44, id: "R6", sendAt: hora("22", "20:00"), fase: "pre" }, // la víspera a la noche: la apertura es temprano
  { step: 45, id: "L1", sendAt: hora("23", "08:00"), fase: "lanzamiento" },
  { step: 46, id: "L2", sendAt: hora("23", "12:00"), fase: "lanzamiento" },
  { step: 47, id: "L3", sendAt: hora("25", "09:00"), fase: "lanzamiento" },
  { step: 48, id: "L4", sendAt: hora("25", "19:00"), fase: "lanzamiento" },
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
