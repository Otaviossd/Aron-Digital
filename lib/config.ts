// Preços e textos configuráveis num só lugar. Os valores são placeholders: defina
// os reais antes de publicar e crie os mesmos valores nos planos do PayPal.
export const PRECOS = {
  monthly: { valor: 25, rotulo: "Mensual", detalle: "por mes, cancelás cuando quieras" },
  annual: { valor: 149, rotulo: "Anual", detalle: "pago único por 12 meses, ahorrás más de 50%" },
} as const;

export const DIAS_REEMBOLSO = 7;
