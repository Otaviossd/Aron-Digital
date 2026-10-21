// Textos da sequência de carrinho abandonado (espanhol). Sem desconto e sem urgência inventada:
// o prazo só aparece se OFERTA_FIN estiver definido (ex.: "hasta el 30 de noviembre").

import { boton, layoutEmail, parrafo, titulo } from "./layout";

type Contexto = {
  siteUrl: string;
  email: string;
  bajaUrl: string;
  marca: string;
  ofertaFin?: string;
};

function envoltorio(c: Contexto, cuerpo: string) {
  return layoutEmail({
    siteUrl: c.siteUrl,
    cuerpo,
    pie: `Recibís este email porque lo escribiste en el checkout de ${c.marca}. <a href="${c.bajaUrl}" style="color:#7d878b">Darme de baja</a>`,
  });
}

export type ContextoEmail = Contexto;

export function plantilla(step: number, c: Contexto): { asunto: string; html: string } {
  const volver = `${c.siteUrl}/ventas?email=${encodeURIComponent(c.email)}#comprar`;

  if (step === 1) {
    return {
      asunto: "¿Te quedó algo pendiente?",
      html: envoltorio(
        c,
        `${titulo("Dejaste tu acceso a medio camino")}
         ${parrafo("Vimos que empezaste a inscribirte y no terminaste el pago. Tu lugar sigue disponible: entrás en segundos y el acceso llega a tu email.")}
         ${boton(volver, "Volver al checkout")}
         ${parrafo("Si tuviste algún problema con el pago, respondé este email y lo vemos.")}`,
      ),
    };
  }

  if (step === 2) {
    return {
      asunto: "Lo que te van a preguntar antes de entrar",
      html: envoltorio(
        c,
        `${titulo("Dudas frecuentes")}
         ${parrafo('<strong style="color:#f4f4f2">¿Cuándo recibo el acceso?</strong><br/>Apenas se confirma el pago te llega un email con un botón para entrar.')}
         ${parrafo('<strong style="color:#f4f4f2">¿Hay cobros mensuales?</strong><br/>No. Es un pago único, sin suscripción.')}
         ${parrafo('<strong style="color:#f4f4f2">¿Hay reembolso?</strong><br/>Durante los primeros 7 días desde la compra.')}
         ${parrafo('<strong style="color:#f4f4f2">¿Desde dónde lo veo?</strong><br/>Celular, tablet o computadora.')}
         ${boton(volver, "Quiero entrar")}`,
      ),
    };
  }

  const plazo = c.ofertaFin ? parrafo(`<strong style="color:#f4f4f2">Disponible ${c.ofertaFin}.</strong>`) : "";
  return {
    asunto: "Último aviso: tu lugar sigue abierto",
    html: envoltorio(
      c,
      `${titulo("Te escribimos por última vez")}
       ${parrafo("No queremos llenarte la bandeja. Si el curso es para vos, este es el momento de entrar.")}
       ${plazo}
       ${boton(volver, "Entrar al curso")}`,
    ),
  };
}
