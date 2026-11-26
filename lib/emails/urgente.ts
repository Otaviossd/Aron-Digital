// Emails manuales (no son parte de la secuencia automática) para quien llegó al checkout y no compró.
// A diferencia de lib/emails/abandono.ts, estos SÍ muestran el descuento real y apuran la decisión.
// Hay 3 variantes (ángulos distintos de copy) para que Aaron elija cuál mandarle a cada contacto, a
// mano, desde /admin/email (ver app/admin/email/actions.ts). Cada contacto puede recibir las 3 (la
// restricción única en email_sends por (lead_id, sequence, step) evita mandar la misma variante dos veces).
// Importante: la urgencia es real (precio de lanzamiento) pero ninguna variante afirma una fecha u hora
// exacta de cierre que no podamos garantizar, y ningún número está inventado (sale de lib/config.ts).

import { EXTRA, PRECOS } from "../config.ts";
import { bloque, boton, COLORES, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout.ts";

type Contexto = {
  siteUrl: string;
  email: string;
  bajaUrl: string;
  marca: string;
};

export type VarianteUrgente = 1 | 2 | 3;

const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;
const foto = (src: string, alt: string) =>
  `<div style="margin:4px 0 6px;border-radius:14px;overflow:hidden;border:1px solid ${COLORES.borde}">
    <img src="${src}" width="560" alt="${alt}" style="display:block;width:100%;height:auto;border:0;background:#000000">
  </div>`;
const bajoFoto = (texto: string) =>
  `<p style="margin:0 0 22px;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:${COLORES.tenue}">${texto}</p>`;

export function plantillaUrgente(variante: VarianteUrgente, c: Contexto): { asunto: string; html: string } {
  const volver = `${c.siteUrl}/ventas?email=${encodeURIComponent(c.email)}#comprar`;
  const ahorroCurso = PRECOS.vitalicio.valor - PRECOS.promo.valor; // 45
  const ahorroTotal = ahorroCurso + EXTRA.valorAntes; // 65
  const pie = `Recibís este email porque lo escribiste en el checkout de ${c.marca}. <a href="${c.bajaUrl}" style="color:#7d878b">Darme de baja</a>`;

  // Variante 1: "la plataforma por dentro" — muestra una captura real y lista qué incluye.
  if (variante === 1) {
    return {
      asunto: "Esto es lo que te estás por perder (mirá la plataforma por dentro) 👀",
      html: layoutEmail({
        siteUrl: c.siteUrl,
        preheader: `Precio de lanzamiento: $${PRECOS.vitalicio.valor} → $${PRECOS.promo.valor}, más el módulo de redes sociales gratis.`,
        cuerpo: `
          ${titulo("Llegaste hasta el checkout. Te faltó un clic.")}
          ${parrafo("Empezaste a inscribirte en La Nueva Ola Academy y no llegaste a terminar el pago. Así que te mostramos, tal cual, lo que ve un alumno apenas entra:")}
          ${foto(`${c.siteUrl}/curso/modulos-d.webp`, "La plataforma por dentro: todos los módulos, en orden")}
          ${bajoFoto("Así se ve por dentro, ni bien entrás: todos los módulos, en orden, clase por clase.")}

          ${subtitulo("Qué hay adentro")}
          ${paso(1, "Todos los módulos del curso, organizados para avanzar sin perderte ni saltar pasos.")}
          ${paso(2, "Clases cortas y al grano, pensadas para aplicar en la barbería desde la primera semana.")}
          ${paso(3, "Comunidad para compartir tu corte y recibir feedback.")}
          ${paso(4, "Certificado cuando termines el curso.")}

          ${bloque(`${fuerte(`Precio de lanzamiento: $${PRECOS.vitalicio.valor} → $${PRECOS.promo.valor}`)} (ahorrás $${ahorroCurso}), más el módulo de "Cómo crecer en redes sociales como barbero" de regalo (valor $${EXTRA.valorAntes}).<br/><br/>${fuerte(`Son más de $${ahorroTotal} en beneficios`)}, mientras siga activa esta oferta de lanzamiento.`)}

          ${parrafo("No es una promoción trucha: pagás una sola vez (no es suscripción) y tenés 7 días de garantía si no es para vos.")}
          ${parrafo(`${fuerte("La promo de lanzamiento está por cerrarse")} — no te puedo asegurar hasta cuándo sigue disponible, así que si vas a entrar, mejor ahora que al precio normal de $${PRECOS.vitalicio.valor}.`)}

          ${boton(volver, "Terminar mi inscripción")}
          ${parrafo("¿Tuviste algún problema para pagar? Respondé este email y te ayudamos.")}`,
        pie,
      }),
    };
  }

  // Variante 2: "la cuenta" — directo a la plata, pérdida concreta en dólares, sin vueltas.
  if (variante === 2) {
    return {
      asunto: `Son $${ahorroCurso} que no vas a recuperar`,
      html: layoutEmail({
        siteUrl: c.siteUrl,
        preheader: `Hoy: $${PRECOS.promo.valor}. Después: $${PRECOS.vitalicio.valor}. Hagamos la cuenta.`,
        cuerpo: `
          ${titulo("Hagamos la cuenta, rápido")}
          ${parrafo("Llegaste a escribir tu email en el checkout de La Nueva Ola Academy. No sabemos por qué no terminaste, pero sí sabemos esto:")}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 20px"><tr>
            <td width="50%" style="padding:16px;border:1px solid ${COLORES.borde};border-radius:14px 0 0 14px;text-align:center">
              <p style="margin:0 0 4px;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${COLORES.tenue}">Ahora (lanzamiento)</p>
              <p style="margin:0;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:30px;font-weight:700;color:${COLORES.acento}">US$${PRECOS.promo.valor}</p>
            </td>
            <td width="50%" style="padding:16px;border:1px solid ${COLORES.borde};border-left:none;border-radius:0 14px 14px 0;text-align:center">
              <p style="margin:0 0 4px;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${COLORES.tenue}">Precio normal</p>
              <p style="margin:0;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:30px;font-weight:700;color:#8a9095;text-decoration:line-through">US$${PRECOS.vitalicio.valor}</p>
            </td>
          </tr></table>

          ${parrafo(`La diferencia es ${fuerte(`US$${ahorroCurso}`)}. No es que el curso vaya a valer más después — es que vos ya no vas a tener el precio de lanzamiento. Y encima hoy se suma, gratis, el módulo "Cómo crecer en redes sociales como barbero" (vale US$${EXTRA.valorAntes} aparte). Eso es ${fuerte(`más de US$${ahorroTotal}`)} que quedan sobre la mesa si no entrás ahora.`)}

          ${foto(`${c.siteUrl}/curso/certificado-d.webp`, "Certificado al terminar el curso")}
          ${bajoFoto("Pagás una sola vez (sin mensualidades) y tenés acceso para siempre, con certificado al terminar.")}

          ${parrafo(`${fuerte("La promo está por cerrarse")} — no te puedo asegurar hasta cuándo sigue, así que si lo vas a hacer, mejor antes de que vuelva a US$${PRECOS.vitalicio.valor}.`)}

          ${boton(volver, `Entrar ahora por US$${PRECOS.promo.valor}`)}`,
        pie,
      }),
    };
  }

  // Variante 3: recorrido completo (clases + comunidad + certificado) — menos "plata" arriba, más "esto es lo que vas a vivir".
  return {
    asunto: "Clases, comunidad, certificado — y 50% OFF mientras dure",
    html: layoutEmail({
      siteUrl: c.siteUrl,
      preheader: `Todo lo que incluye tu acceso, más el 50% OFF de lanzamiento (ahorrás $${ahorroCurso}).`,
      cuerpo: `
        ${titulo("Esto es lo que te espera adentro")}
        ${parrafo("Empezaste a inscribirte y no llegaste a terminar. Antes de que se te pase la oferta de lanzamiento, mirá lo que realmente estás por tener:")}
        ${foto(`${c.siteUrl}/curso/clase-d.webp`, "Una clase del curso: video, lista de clases y comentarios")}
        ${bajoFoto("Cada clase: el video, la lista del módulo y un espacio para dejar tus dudas — Aaron responde ahí mismo.")}

        ${subtitulo("Tu recorrido completo")}
        ${paso(1, "Fundamentos y cortes completos, paso a paso, de principio a fin.")}
        ${paso(2, "Clases en vivo con Aaron para preguntar en directo.")}
        ${paso(3, "Comunidad de barberos para compartir tu corte y recibir feedback.")}
        ${paso(4, "Certificado en PDF, con código de verificación, al completar el curso.")}

        ${bloque(`Todo eso, hoy, con ${fuerte(`50% OFF (US$${PRECOS.vitalicio.valor} → US$${PRECOS.promo.valor})`)} + el módulo "Cómo crecer en redes sociales como barbero" de regalo (US$${EXTRA.valorAntes}). ${fuerte(`Más de US$${ahorroTotal} en beneficios`)}, mientras dure la oferta de lanzamiento.`)}

        ${parrafo("Pago único, sin mensualidades, con 7 días de garantía.")}
        ${parrafo(`${fuerte("La promo de lanzamiento está por cerrarse")} — no te puedo asegurar hasta cuándo sigue disponible.`)}

        ${boton(volver, "Quiero entrar")}`,
      pie,
    }),
  };
}
