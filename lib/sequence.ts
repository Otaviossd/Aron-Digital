// Regra da sequência de carrinho abandonado. Sem dependências: fácil de testar.

export const PASOS = [
  { step: 1, afterHours: 1 },
  { step: 2, afterHours: 24 },
  { step: 3, afterHours: 48 },
] as const;

// Depois disso o lead é considerado frio e a sequência não é mais enviada.
export const MAX_AGE_HOURS = 24 * 7;

type Entrada = {
  createdAt: Date;
  now: Date;
  enviados: number[]; // etapas já enviadas
  convertedAt: Date | null;
  unsubscribedAt: Date | null;
};

// Qual etapa enviar agora (ou null). Regras:
// - comprou ou se descadastrou: nada
// - mais de 7 dias: nada
// - envia só a etapa mais avançada que já venceu; se uma etapa anterior foi perdida (agendador
//   atrasado), ela é pulada em vez de mandar dois e-mails de uma vez.
export function pasoDebido({ createdAt, now, enviados, convertedAt, unsubscribedAt }: Entrada): number | null {
  if (convertedAt || unsubscribedAt) return null;
  const horas = (now.getTime() - createdAt.getTime()) / 3600000;
  if (horas < 0 || horas > MAX_AGE_HOURS) return null;

  const vencidas = PASOS.filter((p) => horas >= p.afterHours);
  if (vencidas.length === 0) return null;

  const candidata = vencidas[vencidas.length - 1];
  // se já mandamos esta etapa ou uma posterior, não há nada a fazer
  if (enviados.some((s) => s >= candidata.step)) return null;
  return candidata.step;
}
