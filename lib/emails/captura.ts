// Emails de la lista de espera (español, voseo): K1 a K10 (del 6 al 10 de noviembre), aviso de cambio de fecha (C1), recordatorios (R1, R2) y 4 del lanzamiento.
// La apertura es el sábado 14 de noviembre a las 09:00 (hora de Paraguay). La oferta: 50% OFF + acceso vitalicio para los primeros 50
// que compren, durante 3 días (hasta el 16 de noviembre) o hasta agotar los cupos, lo que ocurra primero.
import { DIAS_BONO, DIAS_REEMBOLSO, PRECOS, WHATSAPP_GRUPO_URL } from "../config.ts";
import { PASOS_CAPTURA } from "../sequence-captura.ts";
import { bloque, boton, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout.ts";

export type ContextoCaptura = {
  siteUrl: string;
  email: string;
  nombre?: string | null;
  bajaUrl: string;
  marca: string;
};

const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;
const N = PRECOS.promo.vagas;

export type FichaCaptura = { step: number; id: string; asunto: string; objetivo: string; cuando: string };

const FICHAS: Record<string, { asunto: string; objetivo: string }> = {
  K1: { asunto: "Quién es Aaron (y por qué armó este curso)", objetivo: "Confianza: autoridad e historia, sin vender todavía." },
  K2: { asunto: "Imaginate dentro de 3 meses", objetivo: "Visualización: activar el deseo antes del precio." },
  K3: { asunto: "Así es el curso por dentro", objetivo: "Bajar la barrera: simple de usar, desde el celular, a tu ritmo." },
  K4: { asunto: "5 errores que frenan a un barbero (y cómo evitarlos)", objetivo: "Valor real y gratis; deja la puerta abierta al curso." },
  K5: { asunto: "Lo que vas a recibir (y cómo se paga)", objetivo: "Adelantar la oferta con claridad: 50% OFF + vitalicio para los primeros 50." },
  K6: { asunto: "El año se termina. ¿Empezás el próximo igual?", objetivo: "Reencuadrar: del gasto a la inversión en el oficio." },
  K7: { asunto: "Detrás de escena: cómo se armó el curso", objetivo: "Mostrar el trabajo detrás del curso: método, orden y cuidado." },
  K8: { asunto: `Tu lugar entre los primeros ${N}`, objetivo: "Explicar la escasez real: 50% OFF solo para los primeros 50 que compren." },
  K9: { asunto: "Mañana abrimos: dejá todo listo", objetivo: "Acción previa: mismo email, medio de pago a mano y grupo de WhatsApp." },
  K10: { asunto: "Mañana, 9:00: abrimos las inscripciones", objetivo: "Expectativa fuerte la víspera." },
  C1: { asunto: "Cambiamos la fecha: abrimos el sábado 14", objetivo: "Avisar el cambio de fecha a toda la lista, con claridad y sin perder el 50% OFF." },
  R1: { asunto: "Mañana abrimos: dejá todo listo", objetivo: "Víspera: mismo email, medio de pago a mano y grupo de WhatsApp." },
  R2: { asunto: "Mañana, sábado 9:00: abrimos las inscripciones", objetivo: "Expectativa fuerte la noche antes." },
  L1: { asunto: `¡Abrimos! 50% OFF + acceso vitalicio para los primeros ${N}`, objetivo: "El anuncio fuerte: llevar a la lista caliente a la página de ventas." },
  L2: { asunto: "Primer día: tu 50% OFF sigue disponible", objetivo: "Segundo toque del día, con el plazo real de la oferta." },
  L3: { asunto: "Último día de la oferta de lanzamiento", objetivo: "Cierre real: la oferta termina hoy." },
  L4: { asunto: "Cierra esta noche: 50% OFF + vitalicio", objetivo: "Última llamada, solo a quienes no compraron." },
};

const fmt = new Intl.DateTimeFormat("es-PY", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "America/Asuncion" });

export function fichasCaptura(): FichaCaptura[] {
  return PASOS_CAPTURA.map((p) => ({
    step: p.step,
    id: p.id,
    asunto: FICHAS[p.id].asunto,
    objetivo: FICHAS[p.id].objetivo,
    cuando: fmt.format(new Date(p.sendAt)).replace(",", ""),
  }));
}

export function plantillaCaptura(id: string, c: ContextoCaptura): { asunto: string; html: string } {
  const base = c.siteUrl.replace(/\/$/, "");
  const params = new URLSearchParams({ email: c.email });
  if (c.nombre) params.set("nombre", c.nombre);
  const ventas = `${base}/ventas?${params.toString()}#comprar`;
  const grupo = boton(WHATSAPP_GRUPO_URL, "Entrar al grupo de WhatsApp");
  const verOferta = (t: string) => boton(ventas, t);
  const saludo = c.nombre ? `${c.nombre.split(" ")[0]}, ` : "";
  const envolver = (cuerpo: string, pre: string) => ({
    asunto: FICHAS[id]?.asunto ?? "La Nueva Ola Academy",
    html: layoutEmail({
      siteUrl: c.siteUrl,
      cuerpo,
      preheader: pre,
      pie: `Recibís este email porque te anotaste en la lista de espera de ${c.marca}. <a href="${c.bajaUrl}" style="color:#7d878b">Darme de baja</a>`,
    }),
  });
  const oferta = bloque(
    `${fuerte(`50% de descuento + acceso vitalicio`)}<br/>Solo para los primeros ${N} que compren. Pagás una sola vez y el curso es tuyo para siempre.`,
  );

  switch (id) {
    case "K1":
      return envolver(
        `${titulo("Quién es Aaron (y por qué armó este curso)")}
         ${parrafo(`${saludo}Aaron Dalla Rosa formó a más de 2.500 barberos y dio cursos presenciales en 6 países.`)}
         ${parrafo("Después de ver a tanta gente aprender a los golpes, decidió ordenar todo lo que sabe en un solo curso: paso a paso, para ver desde el celular y a tu ritmo.")}
         ${bloque(`${fuerte("La idea es simple:")} que dejes de improvisar y empieces a cortar con método.`)}
         ${subtitulo("Por qué estás en una posición ventajosa")}
         ${parrafo(`Estás en la lista de espera: vas a enterarte primero de la apertura. Y el descuento de lanzamiento (${fuerte("50% OFF con acceso vitalicio")}) es solo para los primeros ${N} que compren.`)}
         ${grupo}`,
        "El barbero detrás de La Nueva Ola Academy.",
      );
    case "K2":
      return envolver(
        `${titulo("Imaginate dentro de 3 meses")}
         ${parrafo("Es lunes. Abrís la barbería y tu agenda ya está llena.")}
         ${parrafo("Los clientes que se sientan en tu silla se van mirándose en el espejo, sacan una foto y la suben. Vuelven. Y traen a un amigo.")}
         ${parrafo("No empezaste a cortar mejor por suerte: empezaste a seguir un método, clase tras clase, hasta que las manos lo hicieron solas.")}
         ${bloque(`${fuerte("Eso empieza con una decisión chica:")} dedicarte unos minutos por día a aprender de verdad.`)}
         ${parrafo("Abrimos el sábado 14 de noviembre. Quedate cerca.")}`,
        "Un lunes con la agenda llena.",
      );
    case "K3":
      return envolver(
        `${titulo("Así es el curso por dentro")}
         ${parrafo("Pensamos la plataforma para que aprender sea fácil y no te pierdas.")}
         ${paso(1, `${fuerte("Módulos en orden:")} empezás por lo básico y avanzás clase a clase.`)}
         ${paso(2, `${fuerte("Desde cualquier lugar:")} celular, tablet o computadora.`)}
         ${paso(3, `${fuerte("Clases nuevas:")} Aaron sigue sumando contenido, y con el acceso vitalicio las recibís todas.`)}
         ${paso(4, `${fuerte("Bonos de lanzamiento:")} se abren a los ${DIAS_BONO} días de tu acceso.`)}
         ${parrafo("Dentro de unos días lo ves por dentro.")}`,
        "Módulos, bonos y cómo se ve la plataforma.",
      );
    case "K4":
      return envolver(
        `${titulo("5 errores que frenan a un barbero")}
         ${paso(1, `${fuerte("Cortar sin método:")} improvisar cada vez hace que los resultados cambien según el día.`)}
         ${paso(2, `${fuerte("No practicar con constancia:")} mejorar son repeticiones, no inspiración.`)}
         ${paso(3, `${fuerte("Cobrar de menos:")} cuando no confiás en tu trabajo, tampoco lo defendés.`)}
         ${paso(4, `${fuerte("Descuidar la imagen:")} tu local, tus redes y tu trato también venden.`)}
         ${paso(5, `${fuerte("No invertir en formación:")} quien aprende rápido se adelanta a quien espera.`)}
         ${parrafo("El curso está pensado para cambiar justo esto. Abrimos el sábado 14 de noviembre.")}`,
        "Empezá por corregir esto hoy.",
      );
    case "K5":
      return envolver(
        `${titulo("Lo que vas a recibir")}
         ${paso(1, `${fuerte("El curso completo:")} módulos y clases para ver a tu ritmo.`)}
         ${paso(2, `${fuerte("Acceso vitalicio:")} pagás una vez y es tuyo para siempre, con todas las clases nuevas.`)}
         ${paso(3, `${fuerte("Bonos de lanzamiento:")} se abren a los ${DIAS_BONO} días.`)}
         ${paso(4, `${fuerte(`Garantía de ${DIAS_REEMBOLSO} días:`)} si no es para vos, pedís el reembolso.`)}
         ${oferta}
         ${parrafo("La oferta dura 3 días desde la apertura, o hasta que se agoten los cupos: lo que ocurra primero.")}`,
        `50% OFF y acceso vitalicio para los primeros ${N}.`,
      );
    case "K6":
      return envolver(
        `${titulo("El año se termina")}
         ${parrafo("Se acercan las fiestas y todos van a gastar en cosas que se rompen, se pasan de moda o se olvidan en un cajón.")}
         ${parrafo("Hay otra forma de aprovechar estas semanas: gastar en algo que te devuelva más de lo que cuesta.")}
         ${bloque(`${fuerte("Lo que aprendés no se rompe ni se devuelve.")} Se queda con vos, se nota en tus cortes y se paga solo cada vez que un cliente vuelve.`)}
         ${parrafo("Empezá el año nuevo con una habilidad nueva, no con la misma rutina.")}`,
        "Gastar vs. invertir en tu oficio.",
      );
    case "K7":
      return envolver(
        `${titulo("Detrás de escena: cómo se armó el curso")}
         ${parrafo("Armar este curso no fue grabar unos videos y listo. Aaron juntó lo que enseñó durante años en cursos presenciales y lo ordenó clase por clase.")}
         ${paso(1, `${fuerte("Partió de las dudas reales:")} las preguntas que más se repiten entre barberos que arrancan.`)}
         ${paso(2, `${fuerte("Lo ordenó con método:")} para que no tengas que adivinar qué aprender primero.`)}
         ${paso(3, `${fuerte("Lo pensó para el celular:")} clases cortas que podés ver donde estés.`)}
         ${parrafo("Faltan pocos días para que lo veas por dentro.")}`,
        "Cómo se armó el curso, paso a paso.",
      );
    case "K8":
      return envolver(
        `${titulo(`Tu lugar entre los primeros ${N}`)}
         ${parrafo(`El descuento de lanzamiento es real y tiene un límite: ${fuerte(`los primeros ${N} que compren`)} se llevan el 50% OFF con acceso vitalicio. Cuando se agoten los cupos, el precio vuelve al normal.`)}
         ${paso(1, "La lista de espera y el grupo de WhatsApp se enteran primero: el aviso sale por email y por el grupo.")}
         ${paso(2, "La oferta dura 3 días desde la apertura, o hasta agotar los cupos.")}
         ${paso(3, "Pagás una sola vez. Sin mensualidades.")}
         ${grupo}
         ${parrafo("Si todavía no entraste al grupo, hacelo hoy: es donde más rápido avisamos.")}`,
        "50% OFF solo para los primeros 50.",
      );
    case "K9":
      return envolver(
        `${titulo("Mañana abrimos")}
         ${parrafo("Mañana, sábado 14 de noviembre, abrimos las inscripciones. Para no perder ni un minuto, dejá esto listo hoy:")}
         ${paso(1, "Usá el mismo email con el que vas a comprar: ahí llega tu acceso.")}
         ${paso(2, "Entrá al grupo de WhatsApp: ahí avisamos primero.")}
         ${paso(3, "Tené a mano tu medio de pago.")}
         ${grupo}
         ${oferta}`,
        "Tres cosas para dejar listas hoy.",
      );
    case "K10":
      return envolver(
        `${titulo("Mañana, a las 9:00, abrimos")}
         ${parrafo("Mañana a las 9:00 (hora de Paraguay) abrimos La Nueva Ola Academy. Vas a recibir un email con el enlace directo a la oferta.")}
         ${oferta}
         ${parrafo("Son solo los primeros " + N + " lugares. Cuando se acaban, se acabó el 50% OFF.")}
         ${bloque(`${fuerte("Tip:")} agregá este remitente a tus contactos para que el email de mañana no se pierda en spam o promociones.`)}`,
        "Mañana a las 9:00 abrimos.",
      );
    case "C1":
      return envolver(
        `${titulo("Cambiamos la fecha de apertura")}
         ${parrafo(`${saludo}tuvimos que mover la apertura de La Nueva Ola Academy. En lugar del 11 de noviembre, ${fuerte("abrimos el sábado 14 de noviembre a las 9:00")} (hora de Paraguay).`)}
         ${parrafo("Lo que no cambia: seguís en la lista y tu lugar está asegurado. Sigue valiendo el 50% OFF con acceso vitalicio para los primeros " + N + ", y los bonos exclusivos.")}
         ${oferta}
         ${paso(1, "Sábado 14 de noviembre, 9:00: abrimos las inscripciones.")}
         ${paso(2, "Ese día te llega un email con el enlace directo a la oferta.")}
         ${paso(3, "Si todavía no estás en el grupo de WhatsApp, entrá hoy: es donde avisamos primero.")}
         ${grupo}
         ${parrafo("Perdón por el cambio y gracias por la paciencia.")}`,
        "La apertura pasa al sábado 14, a las 9:00.",
      );
    case "R1":
      return envolver(
        `${titulo("Mañana abrimos")}
         ${parrafo("Mañana, sábado 14 de noviembre, abrimos las inscripciones. Para no perder ni un minuto, dejá esto listo hoy:")}
         ${paso(1, "Usá el mismo email con el que vas a comprar: ahí llega tu acceso.")}
         ${paso(2, "Entrá al grupo de WhatsApp: ahí avisamos primero.")}
         ${paso(3, "Tené a mano tu medio de pago.")}
         ${grupo}
         ${oferta}`,
        "Tres cosas para dejar listas hoy.",
      );
    case "R2":
      return envolver(
        `${titulo("Mañana, a las 9:00, abrimos")}
         ${parrafo("Mañana sábado a las 9:00 (hora de Paraguay) abrimos La Nueva Ola Academy. Vas a recibir un email con el enlace directo a la oferta.")}
         ${oferta}
         ${parrafo("Son solo los primeros " + N + " lugares. Cuando se acaban, se acabó el 50% OFF.")}
         ${bloque(`${fuerte("Tip:")} agregá este remitente a tus contactos para que el email de mañana no se pierda en spam o promociones.`)}`,
        "Mañana a las 9:00 abrimos.",
      );
    case "L1":
      return envolver(
        `${titulo("¡Abrimos las inscripciones!")}
         ${parrafo(`${saludo}hoy es el día. La Nueva Ola Academy ya está abierta, y vos estás en la lista: entrás primero.`)}
         ${oferta}
         ${paso(1, `${fuerte(`US$${PRECOS.promo.valor}`)} por el acceso vitalicio (el acceso de 1 año cuesta US$${PRECOS.anual.valor}).`)}
         ${paso(2, `Solo los primeros ${N} que compren. Se agota el cupo o pasan 3 días (hasta el 16 de noviembre): lo que ocurra primero.`)}
         ${paso(3, `Pago único. ${DIAS_REEMBOLSO} días de garantía.`)}
         ${verOferta("Quiero mi 50% OFF")}
         ${parrafo("Entrá con este mismo email y completá tus datos: el acceso te llega al instante.")}`,
        `50% OFF + acceso vitalicio, solo para los primeros ${N}.`,
      );
    case "L2":
      return envolver(
        `${titulo("Hoy fue el primer día")}
         ${parrafo("Muchos barberos de la lista ya están entrando. Si todavía no viste la oferta, tenés tiempo, pero no para siempre.")}
         ${oferta}
         ${parrafo("La oferta de lanzamiento termina el 16 de noviembre a las 23:59, o antes si se agotan los cupos.")}
         ${verOferta("Ver la oferta de lanzamiento")}`,
        "Tu 50% OFF sigue disponible, por poco tiempo.",
      );
    case "L3":
      return envolver(
        `${titulo("Hoy termina la oferta de lanzamiento")}
         ${parrafo("Es el último día del 50% OFF con acceso vitalicio. A las 23:59 vuelve el precio normal.")}
         ${oferta}
         ${verOferta("Entrar ahora")}
         ${parrafo(`Pago único. ${DIAS_REEMBOLSO} días de garantía. Acceso inmediato por email.`)}`,
        "Último día del 50% OFF.",
      );
    default:
      return envolver(
        `${titulo("Cierra esta noche")}
         ${parrafo("Esta es la última llamada. A las 23:59 termina el 50% OFF con acceso vitalicio, y no vuelve.")}
         ${verOferta("Quiero mi lugar ahora")}
         ${parrafo("Si el curso es para vos, hoy es el mejor precio que vas a ver. Gracias por estar en la lista.")}`,
        "Últimas horas del 50% OFF.",
      );
  }
}
