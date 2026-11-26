// Email manual (un solo envío, no es parte de la secuencia automática) para quien llegó al checkout
// y no compró. A diferencia de lib/emails/abandono.ts, este SÍ muestra el descuento real y apura la
// decisión — se manda a mano, una vez, desde /admin/email cuando Aaron lo decide (ver app/admin/email/actions.ts).
// Importante: la urgencia es real (precio de lanzamiento, cupos limitados) pero no afirma una fecha u
// hora exacta de cierre que no podamos garantizar.

import { EXTRA, PRECOS } from "../config.ts";
import { bloque, boton, COLORES, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout.ts";

type Contexto = {
  siteUrl: string;
  email: string;
  bajaUrl: string;
  marca: string;
};

const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;

export function plantillaUrgente(c: Contexto): { asunto: string; html: string } {
  const volver = `${c.siteUrl}/ventas?email=${encodeURIComponent(c.email)}#comprar`;
  const ahorroCurso = PRECOS.vitalicio.valor - PRECOS.promo.valor; // 45
  const ahorroTotal = ahorroCurso + EXTRA.valorAntes; // 65

  const asunto = "Esto es lo que te estás por perder (mirá la plataforma por dentro) 👀";

  const html = layoutEmail({
    siteUrl: c.siteUrl,
    preheader: `Precio de lanzamiento: $${PRECOS.vitalicio.valor} → $${PRECOS.promo.valor}, más el módulo de redes sociales gratis.`,
    cuerpo: `
      ${titulo("Llegaste hasta el checkout. Te faltó un clic.")}
      ${parrafo("Empezaste a inscribirte en La Nueva Ola Academy y no llegaste a terminar el pago. Así que te mostramos, tal cual, lo que ve un alumno apenas entra:")}
      <div style="margin:4px 0 6px;border-radius:14px;overflow:hidden;border:1px solid ${COLORES.borde}">
        <img src="${c.siteUrl}/curso/modulos-d.webp" width="560" alt="La plataforma por dentro: todos los módulos, en orden" style="display:block;width:100%;height:auto;border:0;background:#000000">
      </div>
      <p style="margin:0 0 22px;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:${COLORES.tenue}">Así se ve por dentro, ni bien entrás: todos los módulos, en orden, clase por clase.</p>

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
    pie: `Recibís este email porque lo escribiste en el checkout de ${c.marca}. <a href="${c.bajaUrl}" style="color:#7d878b">Darme de baja</a>`,
  });

  return { asunto, html };
}
