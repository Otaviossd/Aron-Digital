// Emails de la clase extra para quien compró el curso y todavía NO la tiene (español, voseo).
// Primeros 15 días: precio de alumno US$10 (el vencimiento es real: lo calcula el sitio). Después: US$20, sin urgencia inventada.
import { EXTRA } from "../config.ts";
import { textoRestante } from "../extra.ts";
import { bloque, boton, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout.ts";

export type ContextoExtra = {
  siteUrl: string;
  email: string;
  bajaUrl: string;
  marca: string;
  link: string; // checkout de la Hotmart con el precio vigente
  horasRestantes: number | null; // con precio de alumno: horas que faltan; null = ya es precio normal
};

const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;

function precioBloque(c: ContextoExtra) {
  const oferta = c.horasRestantes !== null;
  const precio = oferta
    ? `<span style="font-size:22px;font-weight:700;color:#ffffff">US$${EXTRA.valor}</span> <span style="color:#b9c0c3;text-decoration:line-through">US$${EXTRA.valorAntes}</span> <span style="color:#b9c0c3">precio de alumno · vence en ${textoRestante(c.horasRestantes!)}</span>`
    : `<span style="font-size:22px;font-weight:700;color:#ffffff">US$${EXTRA.valorAntes}</span> <span style="color:#b9c0c3">pago único</span>`;
  return bloque(`${fuerte(EXTRA.titulo)}<br/>${EXTRA.descripcion}<br/><br/>${precio}`);
}

export const PASOS_TEXTO: Record<number, string> = {
  1: "Una cosa más antes de empezar: sumá la clase extra",
  2: "¿De qué sirve cortar bien si nadie lo ve?",
  3: "Lo que vas a aprender en la clase extra, en 3 puntos",
  4: "Tu precio de alumno vence pronto",
  5: "Últimas 24 horas: la clase extra a US$10",
  6: "Se termina hoy: después pasa a US$20",
  7: "Terminó tu precio de alumno, pero la clase sigue abierta",
  8: "Una sola buena publicación puede traerte un cliente nuevo",
  9: "Dudas sobre la clase extra",
  10: "Un consejo para mostrar mejor tus cortes",
  11: "Te lo recordamos por última vez",
};

export function plantillaExtra(step: number, c: ContextoExtra): { asunto: string; html: string } {
  const oferta = c.horasRestantes !== null;
  const restante = oferta ? textoRestante(c.horasRestantes!) : "";
  const cta = (texto: string) => boton(c.link, texto);
  const cierre = parrafo("Se abre en tu plataforma apenas se confirma el pago, sin esperar y sin trámites. Pagá con el mismo email de tu cuenta.");
  const envolver = (asunto: string, cuerpo: string, pre: string) => ({
    asunto,
    html: layoutEmail({
      siteUrl: c.siteUrl,
      cuerpo,
      preheader: pre,
      pie: `Recibís este email porque sos alumno de ${c.marca}. <a href="${c.bajaUrl}" style="color:#7d878b">Dejar de recibir estos avisos</a>`,
    }),
  });

  switch (step) {
    case 1:
      return envolver(
        PASOS_TEXTO[1],
        `${titulo("Una cosa más antes de empezar")}
         ${parrafo("Ya tenés el curso, y eso es lo más importante. Pero cortar bien es solo la mitad del camino: la otra mitad es que te encuentren y te elijan.")}
         ${parrafo("Por eso Aaron grabó una clase extra, pensada para quienes recién empiezan a mostrar su trabajo:")}
         ${precioBloque(c)}
         ${parrafo(`El precio de alumno dura ${fuerte(`${EXTRA.diasPrecio} días desde tu compra`)}. Después la clase pasa a US$${EXTRA.valorAntes}.`)}
         ${cta("Quiero la clase extra")}
         ${cierre}`,
        "Precio de alumno por 15 días desde tu compra.",
      );
    case 2:
      return envolver(
        PASOS_TEXTO[2],
        `${titulo("¿De qué sirve cortar bien si nadie lo ve?")}
         ${parrafo("Hay barberos que cortan increíble y tienen la agenda vacía. Y otros que cortan parecido y no dan abasto. La diferencia casi nunca es la técnica: es cómo se muestran.")}
         ${parrafo("En la clase extra Aaron te explica, sin vueltas:")}
         ${paso(1, `${fuerte("Qué publicar")} para que te sigan las personas correctas.`)}
         ${paso(2, `${fuerte("Cómo mostrar tus cortes")} para que se vean profesionales.`)}
         ${paso(3, `${fuerte("Cómo convertir seguidores en clientes")} que reservan.`)}
         ${precioBloque(c)}
         ${cta("Quiero la clase extra")}`,
        `Te quedan ${restante} con el precio de alumno.`,
      );
    case 3:
      return envolver(
        PASOS_TEXTO[3],
        `${titulo("La clase extra, en 3 puntos")}
         ${paso(1, `${fuerte("Qué publicar.")} Dejás de improvisar contenido: sabés qué mostrar para que te sigan personas de tu zona que buscan un barbero.`)}
         ${paso(2, `${fuerte("Cómo mostrar tus cortes.")} Ángulos, luz y detalles simples para que cada corte se vea como lo que es: trabajo profesional.`)}
         ${paso(3, `${fuerte("Cómo convertir seguidores en clientes.")} El paso de “me gusta tu trabajo” a “quiero reservar un turno”.`)}
         ${precioBloque(c)}
         ${parrafo(`Tu precio de alumno vence en ${fuerte(restante)}.`)}
         ${cta("Quiero la clase extra")}`,
        `Tu precio de alumno vence en ${restante}.`,
      );
    case 4:
      return envolver(
        `Tu precio de alumno vence en ${restante}`,
        `${titulo(`Te quedan ${restante} a US$${EXTRA.valor}`)}
         ${parrafo(`Como alumno tenés la clase extra a US$${EXTRA.valor} durante tus primeros ${EXTRA.diasPrecio} días. Cuando pase ese plazo vuelve a US$${EXTRA.valorAntes}, para todos.`)}
         ${precioBloque(c)}
         ${cta("Aprovechar el precio de alumno")}
         ${cierre}`,
        "Después vuelve a US$20.",
      );
    case 5:
      return envolver(
        PASOS_TEXTO[5],
        `${titulo("Mañana vuelve a US$20")}
         ${parrafo(`Quedan ${fuerte("menos de 24 horas")} de tu precio de alumno. Si la clase extra te interesa, este es el momento: ahorrás US$${EXTRA.valorAntes - EXTRA.valor} y la tenés abierta al instante.`)}
         ${precioBloque(c)}
         ${cta(`Sumar la clase extra a US$${EXTRA.valor}`)}
         ${cierre}`,
        "Mañana pasa a US$20.",
      );
    case 6:
      return envolver(
        PASOS_TEXTO[6],
        `${titulo("Se termina hoy")}
         ${parrafo(`Tu precio de alumno termina en las próximas horas. Después, “${EXTRA.titulo}” pasa a US$${EXTRA.valorAntes}.`)}
         ${precioBloque(c)}
         ${cta(`Último aviso: quiero la clase a US$${EXTRA.valor}`)}
         ${parrafo("Es el último recordatorio del precio de alumno.")}`,
        "Últimas horas del precio de alumno.",
      );
    case 7:
      return envolver(
        PASOS_TEXTO[7],
        `${titulo("Tu precio de alumno terminó")}
         ${parrafo(`Pasaron los ${EXTRA.diasPrecio} días y la clase extra volvió a su precio normal: US$${EXTRA.valorAntes}, pago único. La clase sigue disponible para vos cuando quieras sumarla.`)}
         ${precioBloque(c)}
         ${cta(`Quiero la clase extra · US$${EXTRA.valorAntes}`)}
         ${cierre}`,
        "La clase sigue disponible a US$20.",
      );
    case 8:
      return envolver(
        PASOS_TEXTO[8],
        `${titulo("Una buena publicación puede traerte un cliente nuevo")}
         ${parrafo("No hace falta publicar todos los días ni tener una cámara cara. Hace falta saber qué mostrar, cómo mostrarlo y cómo invitar a reservar.")}
         ${parrafo("Esa es la clase extra: el paso de cortar bien a que te encuentren, te elijan y te escriban para pedir turno.")}
         ${parrafo("Si te trae un solo cliente nuevo, ya empezó a pagarse sola.")}
         ${precioBloque(c)}
         ${cta("Ver la clase extra")}`,
        "Cortar bien + mostrarlo bien.",
      );
    case 9:
      return envolver(
        PASOS_TEXTO[9],
        `${titulo("Dudas sobre la clase extra")}
         ${parrafo(`${fuerte("¿Cuándo se abre?")}<br/>Apenas se confirma el pago, en tu plataforma, junto a tu curso.`)}
         ${parrafo(`${fuerte("¿Es pago único?")}<br/>Sí. Sin mensualidades ni renovaciones.`)}
         ${parrafo(`${fuerte("¿Con qué email pago?")}<br/>Con el mismo email de tu cuenta (${c.email}). Así se abre sola.`)}
         ${parrafo(`${fuerte("¿Para quién es?")}<br/>Para barberos que quieren más clientes y todavía no saben cómo mostrar su trabajo.`)}
         ${precioBloque(c)}
         ${cta("Quiero la clase extra")}`,
        "Lo que más nos preguntan.",
      );
    case 10:
      return envolver(
        PASOS_TEXTO[10],
        `${titulo("Un consejo para mostrar mejor tus cortes")}
         ${parrafo("Grabá siempre en vertical, con luz natural y mostrando el antes y el después en los primeros 3 segundos. Parece poco, pero cambia cómo te ve quien pasa por tu perfil.")}
         ${parrafo("En la clase extra Aaron va mucho más a fondo: qué publicar, en qué orden y cómo convertir esas visitas en turnos.")}
         ${subtitulo("Si querés llevarlo más lejos")}
         ${precioBloque(c)}
         ${cta("Ver la clase extra")}`,
        "Un tip rápido de Aaron.",
      );
    default:
      return envolver(
        PASOS_TEXTO[11],
        `${titulo("Te escribimos por última vez sobre esto")}
         ${parrafo("No queremos llenarte la bandeja. Si más adelante querés sumar la clase extra, la tenés disponible en tu plataforma y también acá:")}
         ${precioBloque(c)}
         ${cta("Ver la clase extra")}
         ${parrafo("Gracias por ser parte de La Nueva Ola Academy.")}`,
        "Último recordatorio.",
      );
  }
}
