// Mapa de emails: todos los caminos del lead y los emails de cada camino (copy en español, con el diseño real).
// "activo" = ya sale hoy; "propuesta" = copy listo para aprobar y conectar al envío automático.
import { CUPONES, DIAS_BONO, DIAS_REEMBOLSO, EXTRA, SOPORTE_EMAIL, WHATSAPP_GRUPO_URL } from "@/lib/config";
import { bloque, boton, COLORES, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout";
import { htmlCompra, ASUNTO_COMPRA } from "./compra";

export type TipoNodo = "origen" | "pagina" | "accion" | "email" | "bien" | "mal";

export type Nodo = {
  id: string;
  col: number;
  row: number;
  tipo: TipoNodo;
  titulo: string;
  sub?: string;
  detalle?: string; // para nodos que no son emails
  email?: string; // id en EMAILS
};
export type Arista = { de: string; a: string; etiqueta?: string; punteada?: boolean };

export type FichaEmail = {
  asunto: string;
  cuando: string;
  objetivo: string;
  estado: "activo" | "propuesta";
  nota?: string;
  html: string;
};

type Ctx = { siteUrl: string; marca: string };

const enlace = (u: string, t: string) => `<a href="${u}" style="color:${COLORES.acento};text-decoration:underline">${t}</a>`;
const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;
const cupon = (codigo: string, pct: string) =>
  bloque(`<span style="color:#b9c0c3">Tu cupón de ${pct} de descuento</span><br/><span style="font-size:30px;font-weight:700;letter-spacing:6px;color:#ffffff">${codigo}</span><br/><span style="color:#b9c0c3">Escribilo en el checkout, en el campo "cupón".</span>`);

export function construirMapa(ctx: Ctx) {
  const base = ctx.siteUrl.replace(/\/$/, "");
  const ventas = `${base}/ventas#comprar`;
  const pieLista = `Recibís este email porque lo dejaste en la página de ${ctx.marca}. <a href="#" style="color:#b9c0c3">Darme de baja</a>`;
  const pieCheckout = `Recibís este email porque escribiste tu email en el checkout de ${ctx.marca}. <a href="#" style="color:#b9c0c3">Darme de baja</a>`;
  const lista = (cuerpo: string, preheader: string) => layoutEmail({ siteUrl: base, cuerpo, pie: pieLista, preheader });
  const checkout = (cuerpo: string, preheader: string) => layoutEmail({ siteUrl: base, cuerpo, pie: pieCheckout, preheader });

  const EMAILS: Record<string, FichaEmail> = {
    // ───────── Lista de espera (7 emails en 10 días) ─────────
    L1: {
      asunto: "Estás en la lista: esto es lo que viene",
      cuando: "Al instante, cuando deja su email en /captura",
      objetivo: "Confirmar, bajar la ansiedad y llevarlo al grupo de WhatsApp (el canal donde se avisa primero).",
      estado: "activo",
      nota: "Ya sale hoy (versión más corta). Esta versión suma el paso a paso.",
      html: lista(
        `${titulo("¡Listo, estás en la lista!")}
         ${parrafo("Gracias por anotarte. Vas a enterarte primero cuando abramos el nuevo curso de Aaron Dalla Rosa, y entrás antes que el resto.")}
         ${boton(WHATSAPP_GRUPO_URL, "Entrar al grupo de WhatsApp")}
         ${subtitulo("Qué pasa ahora")}
         ${paso(1, "Entrá al grupo de WhatsApp: ahí avisamos todo primero.")}
         ${paso(2, "Estos días te escribimos con lo que necesitás saber antes de empezar.")}
         ${paso(3, "El día del lanzamiento te llega un email con el acceso a la oferta de apertura.")}`,
        "Entrás primero. Sumate al grupo de WhatsApp.",
      ),
    },
    L2: {
      asunto: "Quién es Aaron y por qué armó este curso",
      cuando: "Día 2",
      objetivo: "Construir confianza: autoridad y historia, sin vender todavía.",
      estado: "propuesta",
      nota: "Datos tomados del brief: 7 años cortando, 3 enseñando, +2.500 barberos, cursos en 6 países. Aaron debe confirmarlos.",
      html: lista(
        `${titulo("Quién es Aaron (y por qué armó este curso)")}
         ${parrafo("Aaron Dalla Rosa lleva 7 años cortando y 3 dedicado a enseñar. Formó a más de 2.500 barberos y dio cursos presenciales en 6 países.")}
         ${parrafo("Después de ver a tanta gente aprender a los golpes, decidió ordenar todo lo que sabe en un solo curso, paso a paso, para que puedas verlo desde tu celular y a tu ritmo.")}
         ${bloque(`${fuerte("La idea es simple:")} que dejes de improvisar y empieces a cortar con método.`)}
         ${parrafo("En los próximos días te voy mostrando cómo es por dentro.")}`,
        "Quién está detrás de La Nueva Ola Academy.",
      ),
    },
    L3: {
      asunto: "Cómo es el curso por dentro",
      cuando: "Día 4",
      objetivo: "Mostrar el formato y bajar la barrera: es simple de usar y se ve desde el celular.",
      estado: "propuesta",
      nota: "Ajustar la lista de módulos con el contenido final.",
      html: lista(
        `${titulo("Así es el curso por dentro")}
         ${parrafo("Pensamos la plataforma para que aprender sea fácil, sin perderte.")}
         ${paso(1, `${fuerte("Módulos en orden:")} empezás por lo básico y avanzás clase a clase.`)}
         ${paso(2, `${fuerte("Desde cualquier lugar:")} celular, tablet o computadora.`)}
         ${paso(3, `${fuerte("Nuevas clases:")} Aaron sigue sumando contenido.`)}
         ${paso(4, `${fuerte("Bonos:")} regalos de lanzamiento que se abren a los ${DIAS_BONO} días de tu acceso.`)}
         ${parrafo("Mañana te cuento las dudas más comunes.")}`,
        "Módulos, bonos y cómo se ve la plataforma.",
      ),
    },
    L4: {
      asunto: "Las dudas de siempre (con respuesta)",
      cuando: "Día 6",
      objetivo: "Sacar objeciones antes de la oferta: pago, reembolso, nivel, dispositivo.",
      estado: "propuesta",
      html: lista(
        `${titulo("Las dudas que todos tienen")}
         ${parrafo(`${fuerte("¿Es suscripción?")}<br/>No. Pagás una sola vez, sin cobros mensuales.`)}
         ${parrafo(`${fuerte("¿Y si no me gusta?")}<br/>Tenés ${DIAS_REEMBOLSO} días para pedir el reembolso.`)}
         ${parrafo(`${fuerte("¿Cuándo recibo el acceso?")}<br/>Apenas se confirma el pago, por email.`)}
         ${parrafo(`${fuerte("¿Desde dónde lo veo?")}<br/>Celular, tablet o computadora.`)}
         ${parrafo(`¿Otra pregunta? Respondé este email o escribinos a ${enlace(`mailto:${SOPORTE_EMAIL}`, SOPORTE_EMAIL)}.`)}`,
        "Pago único, reembolso y acceso: todo claro.",
      ),
    },
    L5: {
      asunto: "Faltan 2 días: así será el lanzamiento",
      cuando: "Día 8",
      objetivo: "Crear expectativa real y explicar la oferta de apertura sin inventar escasez.",
      estado: "propuesta",
      nota: "El número de cupos no se muestra: solo 'cupos limitados'.",
      html: lista(
        `${titulo("En 2 días abrimos")}
         ${parrafo("Esto es lo que va a pasar el día del lanzamiento:")}
         ${paso(1, "Te llega un email con el enlace para ver la oferta.")}
         ${paso(2, `Los primeros en entrar tienen un ${fuerte("precio de apertura")} con acceso vitalicio (cupos limitados).`)}
         ${paso(3, "También vas a poder elegir entre acceso de 1 año o vitalicio.")}
         ${parrafo("Para no perderte el aviso, sumate al grupo de WhatsApp.")}
         ${boton(WHATSAPP_GRUPO_URL, "Entrar al grupo")}`,
        "Qué va a pasar el día del lanzamiento.",
      ),
    },
    L6: {
      asunto: "Mañana abrimos. Dejá todo listo",
      cuando: "Día 9",
      objetivo: "Acción previa: que tenga listo el email de compra y el grupo, para cerrar más rápido.",
      estado: "propuesta",
      html: lista(
        `${titulo("Mañana abrimos")}
         ${parrafo("Para que no pierdas tiempo, dejá esto listo hoy:")}
         ${paso(1, "Usá el mismo email con el que vas a comprar: ahí llega tu acceso.")}
         ${paso(2, "Estar en el grupo de WhatsApp, donde avisamos cuando se abre.")}
         ${paso(3, "Tener un medio de pago a mano (tarjeta).")}
         ${boton(WHATSAPP_GRUPO_URL, "Entrar al grupo de WhatsApp")}`,
        "Tres cosas para dejar listas hoy.",
      ),
    },
    L7: {
      asunto: "¡Hoy abrimos! Entrá a la oferta de lanzamiento",
      cuando: "Día 10 (día del lanzamiento)",
      objetivo: "Primera venta: llevar a la lista caliente a la página de ventas.",
      estado: "propuesta",
      html: lista(
        `${titulo("¡Abrimos las inscripciones!")}
         ${parrafo("Ya podés entrar a La Nueva Ola Academy. Elegí tu acceso y empezá hoy.")}
         ${boton(ventas, "Ver la oferta de lanzamiento")}
         ${bloque(`${fuerte("Pago único.")} Sin mensualidades. Reembolso durante ${DIAS_REEMBOLSO} días.`)}
         ${parrafo("Las condiciones de apertura son por cupos limitados.")}`,
        "Abrieron las inscripciones. Entrá primero.",
      ),
    },

    // ───────── Compra y después ─────────
    C1: {
      asunto: ASUNTO_COMPRA,
      cuando: "Al instante, cuando se aprueba el pago",
      objetivo: "Dar el acceso con un clic y dejar claro cómo empezar.",
      estado: "activo",
      html: htmlCompra({ accessLink: "#", loginLink: `${base}/entrar`, to: "alumno@ejemplo.com", plan: "lifetime" }),
    },
    C2: {
      asunto: "¿Ya viste tu primera clase? (y una clase extra a mitad de precio)",
      cuando: "3 días después de comprar (solo si no compró la clase extra)",
      objetivo: "Activar al alumno y ofrecer la clase extra con precio especial.",
      estado: "propuesta",
      nota: "Necesita el producto extra creado en la Hotmart y su link en la Vercel.",
      html: layoutEmail({
        siteUrl: base,
        preheader: "Un empujón para empezar y una clase extra.",
        cuerpo: `${titulo("¿Ya empezaste?")}
         ${parrafo("Lo mejor es hacer la primera clase hoy: te lleva pocos minutos y ya ves cómo es todo por dentro.")}
         ${boton(`${base}/aulas`, "Ir a mis clases")}
         ${subtitulo("Clase extra para alumnos")}
         ${bloque(`${fuerte(EXTRA.titulo)}<br/>${EXTRA.descripcion}<br/><br/><span style="font-size:20px;font-weight:700;color:#ffffff">US$${EXTRA.valor}</span> <span style="color:#b9c0c3;text-decoration:line-through">US$${EXTRA.valorAntes}</span>`)}
         ${parrafo(`${enlace(`${base}/aulas/extra`, "Ver la clase extra")} · se abre acá mismo, en tu plataforma.`)}`,
      }),
    },
    C3: {
      asunto: "Se abrieron tus bonos",
      cuando: `${DIAS_BONO} días después de comprar`,
      objetivo: "Reenganchar y mostrar valor extra, con un motivo real para volver.",
      estado: "propuesta",
      html: layoutEmail({
        siteUrl: base,
        preheader: "Tus bonos ya están disponibles.",
        cuerpo: `${titulo("Tus bonos ya están abiertos")}
         ${parrafo(`Pasaron ${DIAS_BONO} días y se liberaron los bonos de tu acceso. Entrá y empezá por el que más te sirva.`)}
         ${boton(`${base}/aulas`, "Ver mis bonos")}
         ${parrafo(`¿Algo para mejorar? Respondé este email o escribinos a ${enlace(`mailto:${SOPORTE_EMAIL}`, SOPORTE_EMAIL)}.`)}`,
      }),
    },

    // ───────── Entró al checkout y no compró ─────────
    A1: {
      asunto: "¿Te quedó algo pendiente?",
      cuando: "1 hora después de escribir su email en el checkout",
      objetivo: "Recordatorio simple y amable, con el botón a un clic.",
      estado: "activo",
      html: checkout(
        `${titulo("Dejaste tu acceso a medio camino")}
         ${parrafo("Vimos que empezaste a inscribirte y no terminaste el pago. Tu lugar sigue disponible: entrás en segundos y el acceso llega a tu email.")}
         ${boton(ventas, "Volver al checkout")}
         ${parrafo("Si tuviste algún problema con el pago, respondé este email y lo vemos.")}`,
        "Tu lugar sigue disponible.",
      ),
    },
    A2: {
      asunto: "¿Algo falló con el pago?",
      cuando: "4 horas después",
      objetivo: "Resolver el problema técnico más común: medio de pago rechazado o dudas al pagar.",
      estado: "propuesta",
      html: checkout(
        `${titulo("¿Tuviste algún problema para pagar?")}
         ${parrafo("A veces el banco rechaza el pago o algo no queda claro. Es normal y se arregla rápido.")}
         ${paso(1, "Probá con otra tarjeta o otro medio de pago.")}
         ${paso(2, "Revisá que los datos estén bien escritos.")}
         ${paso(3, `Si sigue fallando, escribinos a ${enlace(`mailto:${SOPORTE_EMAIL}`, SOPORTE_EMAIL)} y te ayudamos.`)}
         ${boton(ventas, "Intentar de nuevo")}`,
        "Si algo falló, lo resolvemos.",
      ),
    },
    A3: {
      asunto: "Lo que te van a preguntar antes de entrar",
      cuando: "12 horas después",
      objetivo: "Sacar las objeciones: pago único, reembolso, cuándo llega el acceso y dónde se ve.",
      estado: "propuesta",
      html: checkout(
        `${titulo("Dudas frecuentes")}
         ${parrafo(`${fuerte("¿Cuándo recibo el acceso?")}<br/>Apenas se confirma el pago te llega un email con un botón para entrar.`)}
         ${parrafo(`${fuerte("¿Hay cobros mensuales?")}<br/>No. Es un pago único, sin suscripción.`)}
         ${parrafo(`${fuerte("¿Hay reembolso?")}<br/>Sí, durante los primeros ${DIAS_REEMBOLSO} días desde la compra.`)}
         ${parrafo(`${fuerte("¿Desde dónde lo veo?")}<br/>Celular, tablet o computadora.`)}
         ${boton(ventas, "Quiero entrar")}`,
        "Pago único, reembolso y acceso.",
      ),
    },
    A4: {
      asunto: "Un 10% de descuento para vos",
      cuando: "24 horas después",
      objetivo: "Primer incentivo: cupón de 10% para quien dudaba por el precio.",
      estado: "propuesta",
      nota: "El cupón se crea en la Hotmart con vencimiento real (48 h). No aplicarlo a la promo de US$25 para no regalar margen.",
      html: checkout(
        `${titulo("Te regalamos un 10% de descuento")}
         ${parrafo("Sabemos que decidir lleva tiempo. Para ayudarte a dar el paso, te dejamos un cupón de descuento por tiempo limitado.")}
         ${cupon(CUPONES.diez, "10%")}
         ${boton(ventas, "Usar mi cupón")}
         ${parrafo("El cupón tiene fecha de vencimiento. Si lo necesitás, respondé este email.")}`,
        "Un cupón de 10% por tiempo limitado.",
      ),
    },
    A5: {
      asunto: "Tu cupón de 10% vence mañana",
      cuando: "48 horas después",
      objetivo: "Recordar el cupón con un vencimiento real, sin presión falsa.",
      estado: "propuesta",
      html: checkout(
        `${titulo("Tu cupón vence mañana")}
         ${parrafo("Te recordamos que tu cupón de 10% sigue activo, pero sólo por un día más.")}
         ${cupon(CUPONES.diez, "10%")}
         ${boton(ventas, "Aprovechar el descuento")}`,
        "Tu descuento está por vencer.",
      ),
    },
    A6: {
      asunto: "Último día: tu cupón vence hoy",
      cuando: "72 horas después",
      objetivo: "Cierre del primer cupón con el mensaje 'hoy es el último día'.",
      estado: "propuesta",
      html: checkout(
        `${titulo("Hoy vence tu cupón")}
         ${parrafo("Es el último día para usar tu 10% de descuento. Después vuelve el precio normal.")}
         ${cupon(CUPONES.diez, "10%")}
         ${boton(ventas, "Entrar con descuento")}
         ${parrafo("Si el curso no es para vos, no pasa nada. Pero si te quedaste con ganas, este es el momento.")}`,
        "Último día de tu descuento.",
      ),
    },
    A7: {
      asunto: "Última oportunidad: 20% de descuento",
      cuando: "5 días después",
      objetivo: "Último intento con la mejor oferta, por pocas horas.",
      estado: "propuesta",
      nota: "Cupón de 20% con vencimiento real de 24 h en la Hotmart. Confirmar con Aaron que el margen lo permite. Es el último email de la secuencia.",
      html: checkout(
        `${titulo("Última oportunidad: 20% de descuento")}
         ${parrafo("Es el último email que te mandamos sobre esto. Para cerrar, te dejamos nuestro mejor descuento por 24 horas.")}
         ${cupon(CUPONES.veinte, "20%")}
         ${boton(ventas, "Entrar con 20% de descuento")}
         ${parrafo("Gracias por tu tiempo. Si ahora no es el momento, ¡todo bien!")}`,
        "Nuestro mejor descuento, por 24 horas.",
      ),
    },
  };

  const NODOS: Nodo[] = [
    // Orígenes
    { id: "ig", col: 0, row: 0, tipo: "origen", titulo: "Instagram, stories y WhatsApp", sub: "Tráfico orgánico", detalle: "Contenido de Aaron y mensajes del equipo. Usá los enlaces con origen de Admin > Enlaces para medir de dónde llega cada visita." },
    { id: "ads", col: 0, row: 2, tipo: "origen", titulo: "Tráfico pago", sub: "Anuncios de Meta", detalle: "Anuncios a la página de captura (para armar lista antes del lanzamiento) o directo a la página de ventas (cuando ya está abierto)." },
    // Camino A: lista de espera
    { id: "captura", col: 1, row: 0, tipo: "pagina", titulo: "Página de captura", sub: "/captura", detalle: "Lista de espera: la persona deja su email y entra al grupo de WhatsApp." },
    { id: "lead", col: 2, row: 0, tipo: "accion", titulo: "Lead en la lista", sub: "Email guardado", detalle: "El email queda guardado y empieza la secuencia de lanzamiento (7 emails en 10 días)." },
    { id: "L1", col: 3, row: 0, tipo: "email", titulo: "1 · Estás en la lista", sub: "Al instante", email: "L1" },
    { id: "L2", col: 4, row: 0, tipo: "email", titulo: "2 · Quién es Aaron", sub: "Día 2", email: "L2" },
    { id: "L3", col: 5, row: 0, tipo: "email", titulo: "3 · El curso por dentro", sub: "Día 4", email: "L3" },
    { id: "L4", col: 6, row: 0, tipo: "email", titulo: "4 · Dudas de siempre", sub: "Día 6", email: "L4" },
    { id: "L5", col: 7, row: 0, tipo: "email", titulo: "5 · Faltan 2 días", sub: "Día 8", email: "L5" },
    { id: "L6", col: 8, row: 0, tipo: "email", titulo: "6 · Mañana abrimos", sub: "Día 9", email: "L6" },
    { id: "L7", col: 9, row: 0, tipo: "email", titulo: "7 · ¡Hoy abrimos!", sub: "Día 10 · lanzamiento", email: "L7" },
    // Camino B: venta
    { id: "ventas", col: 1, row: 2, tipo: "pagina", titulo: "Página de ventas", sub: "/ventas", detalle: "Sin precios a la vista. Para ver la oferta, la persona deja nombre, email y WhatsApp." },
    { id: "form", col: 2, row: 2, tipo: "accion", titulo: "Deja nombre, email y WhatsApp", sub: "Se vuelve lead", detalle: "Se guarda el contacto y se desbloquean los precios. Desde acá ya podemos recuperarlo." },
    { id: "plan", col: 3, row: 2, tipo: "accion", titulo: "Elige su acceso", sub: "Promo, vitalicio o 1 año", detalle: "Compara los planes y toca 'Continuar al pago'." },
    { id: "checkout", col: 4, row: 2, tipo: "pagina", titulo: "Checkout Hotmart", sub: "Pago", detalle: "Aquí la persona escribe su email y paga. Si deja el email y no paga, la Hotmart nos avisa (carrito abandonado)." },
    // Compró
    { id: "bien", col: 5, row: 3, tipo: "bien", titulo: "Pagó", sub: "Se convierte en alumno", detalle: "El webhook libera el acceso, corta toda secuencia de recuperación y envía la confirmación." },
    { id: "C1", col: 6, row: 3, tipo: "email", titulo: "Confirmación de compra", sub: "Al instante", email: "C1" },
    { id: "C2", col: 7, row: 3, tipo: "email", titulo: "¿Ya empezaste? + clase extra", sub: "Día 3", email: "C2" },
    { id: "C3", col: 8, row: 3, tipo: "email", titulo: "Se abrieron tus bonos", sub: "Día 7", email: "C3" },
    // No compró
    { id: "mal", col: 5, row: 4, tipo: "mal", titulo: "No pagó", sub: "Carrito abandonado", detalle: "Empieza la secuencia de recuperación. Si compra en cualquier momento, se corta sola." },
    { id: "A1", col: 6, row: 4, tipo: "email", titulo: "¿Te quedó algo pendiente?", sub: "1 hora", email: "A1" },
    { id: "A2", col: 7, row: 4, tipo: "email", titulo: "¿Algo falló con el pago?", sub: "4 horas", email: "A2" },
    { id: "A3", col: 8, row: 4, tipo: "email", titulo: "Dudas frecuentes", sub: "12 horas", email: "A3" },
    { id: "A4", col: 9, row: 4, tipo: "email", titulo: "10% de descuento", sub: "24 horas · cupón", email: "A4" },
    { id: "A5", col: 10, row: 4, tipo: "email", titulo: "El cupón vence mañana", sub: "48 horas", email: "A5" },
    { id: "A6", col: 11, row: 4, tipo: "email", titulo: "Último día del cupón", sub: "72 horas", email: "A6" },
    { id: "A7", col: 12, row: 4, tipo: "email", titulo: "Última oportunidad: 20%", sub: "5 días · cupón", email: "A7" },
  ];

  const cadena = (ids: string[]): Arista[] => ids.slice(1).map((id, i) => ({ de: ids[i], a: id }));
  const ARISTAS: Arista[] = [
    { de: "ig", a: "captura" },
    { de: "ig", a: "ventas" },
    { de: "ads", a: "captura" },
    { de: "ads", a: "ventas" },
    ...cadena(["captura", "lead", "L1", "L2", "L3", "L4", "L5", "L6", "L7"]),
    { de: "L7", a: "ventas", etiqueta: "va a ventas", punteada: true },
    ...cadena(["ventas", "form", "plan", "checkout"]),
    { de: "checkout", a: "bien", etiqueta: "paga" },
    { de: "checkout", a: "mal", etiqueta: "no paga" },
    ...cadena(["bien", "C1", "C2", "C3"]),
    ...cadena(["mal", "A1", "A2", "A3", "A4", "A5", "A6", "A7"]),
    { de: "A4", a: "bien", etiqueta: "compra con cupón", punteada: true },
  ];

  return { NODOS, ARISTAS, EMAILS };
}
