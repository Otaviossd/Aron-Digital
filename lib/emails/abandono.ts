// Textos da sequência de carrinho abandonado (espanhol). Sem desconto e sem urgência inventada:
// o prazo só aparece se OFERTA_FIN estiver definido (ex.: "hasta el 30 de noviembre").

type Contexto = {
  siteUrl: string;
  email: string;
  bajaUrl: string;
  marca: string;
  ofertaFin?: string;
};

function envoltorio(c: Contexto, cuerpo: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111;line-height:1.55">
    ${cuerpo}
    <hr style="border:none;border-top:1px solid #ddd;margin:32px 0 16px" />
    <p style="font-size:12px;color:#777">
      Recibís este email porque lo escribiste en el checkout de ${c.marca}.
      <a href="${c.bajaUrl}" style="color:#777">Darme de baja</a>
    </p>
  </div>`;
}

const boton = (url: string, texto: string) => `
  <p style="margin:24px 0">
    <a href="${url}" style="background:#d4ff00;color:#000;padding:14px 22px;font-weight:bold;text-decoration:none;display:inline-block">${texto}</a>
  </p>`;

export function plantilla(step: number, c: Contexto): { asunto: string; html: string } {
  const volver = `${c.siteUrl}/?email=${encodeURIComponent(c.email)}#comprar`;

  if (step === 1) {
    return {
      asunto: "¿Te quedó algo pendiente?",
      html: envoltorio(
        c,
        `<h1 style="font-size:22px;margin:0 0 12px">Dejaste tu acceso a medio camino</h1>
         <p>Vimos que empezaste a inscribirte y no terminaste el pago. Tu lugar sigue disponible: entrás en segundos y el acceso llega a tu email.</p>
         ${boton(volver, "VOLVER AL CHECKOUT")}
         <p style="font-size:14px;color:#444">Si tuviste algún problema con el pago, respondé este email y lo vemos.</p>`,
      ),
    };
  }

  if (step === 2) {
    return {
      asunto: "Lo que te van a preguntar antes de entrar",
      html: envoltorio(
        c,
        `<h1 style="font-size:22px;margin:0 0 12px">Dudas frecuentes</h1>
         <p><strong>¿Cuándo recibo el acceso?</strong><br/>Apenas se confirma el pago te llega un email con un botón para entrar.</p>
         <p><strong>¿Puedo cancelar?</strong><br/>Sí, cuando quieras desde tu cuenta. Mantenés el acceso hasta el fin del período pagado.</p>
         <p><strong>¿Hay reembolso?</strong><br/>Durante los primeros 7 días desde la compra.</p>
         <p><strong>¿Desde dónde lo veo?</strong><br/>Celular, tablet o computadora.</p>
         ${boton(volver, "QUIERO ENTRAR")}`,
      ),
    };
  }

  const plazo = c.ofertaFin ? `<p><strong>Disponible ${c.ofertaFin}.</strong></p>` : "";
  return {
    asunto: "Último aviso: tu lugar sigue abierto",
    html: envoltorio(
      c,
      `<h1 style="font-size:22px;margin:0 0 12px">Te escribimos por última vez</h1>
       <p>No queremos llenarte la bandeja. Si el curso es para vos, este es el momento de entrar.</p>
       ${plazo}
       ${boton(volver, "ENTRAR AL CURSO")}`,
    ),
  };
}
