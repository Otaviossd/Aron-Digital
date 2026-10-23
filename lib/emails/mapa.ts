// Mapa de emails: todos los caminos del lead y los emails de cada camino (copy en español, con el diseño real).
// "activo" = ya sale hoy; "propuesta" = copy listo para aprobar y conectar al envío automático.
import { CUPONES, DIAS_BONO, DIAS_REEMBOLSO, EXTRA, SOPORTE_EMAIL, WHATSAPP_GRUPO_URL } from "@/lib/config";
import { bloque, boton, COLORES, layoutEmail, paso, parrafo, subtitulo, titulo } from "./layout";
import { htmlCompra, ASUNTO_COMPRA } from "./compra";

export type TipoNodo = "origen" | "pagina" | "accion" | "email" | "bien" | "mal" | "frio";

export type Nodo = {
  id: string;
  col: number;
  row: number;
  tipo: TipoNodo;
  titulo: string;
  sub?: string;
  detalle?: string;
  email?: string;
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

type Ctx = { siteUrl: string; marca: string; ofertaFin?: string };

const enlace = (u: string, t: string) => `<a href="${u}" style="color:${COLORES.acento};text-decoration:underline">${t}</a>`;
const fuerte = (t: string) => `<strong style="color:#ffffff">${t}</strong>`;
const cupon = (codigo: string, pct: string) =>
  bloque(
    `<span style="color:#b9c0c3">Tu cupón de ${pct} de descuento</span><br/><span style="font-size:30px;font-weight:700;letter-spacing:6px;color:#ffffff">${codigo}</span><br/><span style="color:#b9c0c3">Escribilo en el checkout, en el campo "cupón".</span>`,
  );
const firma = `<p style="margin:22px 0 0;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#ffffff">Aaron Dalla Rosa<br/><span style="color:#b9c0c3">La Nueva Ola Academy</span></p>`;

export function construirMapa(ctx: Ctx) {
  const base = ctx.siteUrl.replace(/\/$/, "");
  const ventas = `${base}/ventas#comprar`;
  const mail = enlace(`mailto:${SOPORTE_EMAIL}`, SOPORTE_EMAIL);
  const baja = (txt: string) => `${txt} <a href="#" style="color:#b9c0c3">Darme de baja</a>`;
  const pieLista = baja(`Recibís este email porque dejaste tus datos en ${ctx.marca}.`);
  const pieCheckout = baja(`Recibís este email porque empezaste tu inscripción en ${ctx.marca}.`);
  const pieAlumno = `Recibís este email porque sos alumno de ${ctx.marca}. <a href="#" style="color:#b9c0c3">Dejar de recibir estos avisos</a>`;
  const L = (cuerpo: string, pre: string) => layoutEmail({ siteUrl: base, cuerpo, pie: pieLista, preheader: pre });
  const K = (cuerpo: string, pre: string) => layoutEmail({ siteUrl: base, cuerpo, pie: pieCheckout, preheader: pre });
  const A = (cuerpo: string, pre: string) => layoutEmail({ siteUrl: base, cuerpo, pie: pieAlumno, preheader: pre });

  const E: Record<string, FichaEmail> = {};
  const add = (id: string, f: Omit<FichaEmail, "estado"> & { estado?: FichaEmail["estado"] }) => {
    E[id] = { estado: "propuesta", ...f };
  };

  // ════════ 1 · CAPTURA (calendario: 10 días hasta la apertura) ════════
  add("W0", {
    estado: "activo",
    asunto: "Estás en la lista: esto es lo que viene",
    cuando: "Al instante, cuando deja su email en /captura (para cualquier día de la captura)",
    objetivo: "Confirmar, bajar la ansiedad y llevarlo al grupo de WhatsApp, donde se avisa primero.",
    nota: "Ya sale hoy (versión corta). Esta versión suma el paso a paso. Quien entra tarde recibe este email y después solo los que faltan hasta la apertura.",
    html: L(
      `${titulo("¡Listo, estás en la lista!")}
       ${parrafo("Gracias por anotarte. Vas a enterarte primero cuando abramos el nuevo curso de Aaron Dalla Rosa, y entrás antes que el resto.")}
       ${boton(WHATSAPP_GRUPO_URL, "Entrar al grupo de WhatsApp")}
       ${subtitulo("Qué pasa ahora")}
       ${paso(1, "Entrá al grupo de WhatsApp: ahí avisamos todo primero.")}
       ${paso(2, "Estos días te escribimos con lo que necesitás saber antes de empezar.")}
       ${paso(3, "El día de la apertura te llega un email con el acceso a la oferta de lanzamiento.")}`,
      "Entrás primero. Sumate al grupo de WhatsApp.",
    ),
  });
  add("F9", {
    asunto: "Quién es Aaron (y por qué armó este curso)",
    cuando: "Faltan 9 días para la apertura",
    objetivo: "Construir confianza: autoridad e historia, sin vender todavía.",
    nota: "Datos del brief (7 años cortando, 3 enseñando, +2.500 barberos, 6 países): Aaron debe confirmarlos.",
    html: L(
      `${titulo("Quién es Aaron (y por qué armó este curso)")}
       ${parrafo("Aaron Dalla Rosa lleva 7 años cortando y 3 dedicado a enseñar. Formó a más de 2.500 barberos y dio cursos presenciales en 6 países.")}
       ${parrafo("Después de ver a tanta gente aprender a los golpes, decidió ordenar todo lo que sabe en un solo curso: paso a paso, para ver desde el celular y a tu ritmo.")}
       ${bloque(`${fuerte("La idea es simple:")} que dejes de improvisar y empieces a cortar con método.`)}
       ${parrafo("En los próximos días te voy mostrando cómo es por dentro.")}`,
      "El barbero detrás de La Nueva Ola Academy.",
    ),
  });
  add("F8", {
    asunto: "Imaginate dentro de 3 meses",
    cuando: "Faltan 8 días",
    objetivo: "Visualización: que se vea ya en la versión mejor de su oficio. Activa el deseo antes del precio.",
    html: L(
      `${titulo("Imaginate dentro de 3 meses")}
       ${parrafo("Es lunes. Abrís la barbería y tu agenda ya está llena.")}
       ${parrafo("Los clientes que se sientan en tu silla se van mirándose en el espejo, sacan una foto y la suben. Vuelven. Y traen a un amigo.")}
       ${parrafo("No empezaste a cortar mejor por suerte: empezaste a seguir un método, clase tras clase, hasta que las manos lo hicieron solo.")}
       ${bloque(`${fuerte("Eso empieza con una decisión chica:")} dedicarte unos minutos por día a aprender de verdad.`)}
       ${parrafo("En unos días abrimos. Quedate cerca.")}`,
      "Un lunes con la agenda llena.",
    ),
  });
  add("F7", {
    asunto: "Así es el curso por dentro",
    cuando: "Faltan 7 días",
    objetivo: "Mostrar el formato y bajar la barrera: simple de usar, desde el celular, a tu ritmo.",
    nota: "Ajustar con la lista final de módulos.",
    html: L(
      `${titulo("Así es el curso por dentro")}
       ${parrafo("Pensamos la plataforma para que aprender sea fácil y no te pierdas.")}
       ${paso(1, `${fuerte("Módulos en orden:")} empezás por lo básico y avanzás clase a clase.`)}
       ${paso(2, `${fuerte("Desde cualquier lugar:")} celular, tablet o computadora.`)}
       ${paso(3, `${fuerte("Clases nuevas:")} Aaron sigue sumando contenido.`)}
       ${paso(4, `${fuerte("Bonos:")} regalos de lanzamiento que se abren a los ${DIAS_BONO} días de tu acceso.`)}
       ${parrafo("Mañana te cuento qué dicen quienes ya aprendieron con Aaron.")}`,
      "Módulos, bonos y cómo se ve la plataforma.",
    ),
  });
  add("F6", {
    asunto: "Detrás de escena: cómo se armó el curso",
    cuando: "Faltan 6 días",
    objetivo: "Mostrar el trabajo detrás del curso (sin testimonios, porque todavía no hay alumnos del curso digital): método, tiempo y cuidado.",
    nota: "Pre-lanzamiento: no hay alumnos del curso digital, así que no se usan testimonios. La autoridad viene de la trayectoria de Aaron (confirmar datos con él).",
    html: L(
      `${titulo("Detrás de escena: cómo se armó el curso")}
       ${parrafo("Armar este curso no fue grabar unos videos y listo. Aaron juntó lo que enseñó durante años en cursos presenciales y lo ordenó clase por clase.")}
       ${paso(1, `${fuerte("Partió de las dudas reales:")} las preguntas que más se repiten entre barberos que arrancan.`)}
       ${paso(2, `${fuerte("Lo ordenó con método:")} para que no tengas que adivinar qué aprender primero.`)}
       ${paso(3, `${fuerte("Lo pensó para el celular:")} clases cortas que podés ver donde estés.`)}
       ${parrafo("Faltan pocos días para que lo veas por dentro.")}`,
      "Cómo se armó el curso, paso a paso.",
    ),
  });
  add("F5", {
    asunto: "5 errores que frenan a un barbero (y cómo evitarlos)",
    cuando: "Faltan 5 días",
    objetivo: "Dar valor real y gratis: demuestra que Aaron sabe, y deja la puerta abierta al curso.",
    html: L(
      `${titulo("5 errores que frenan a un barbero")}
       ${paso(1, `${fuerte("Cortar sin método:")} improvisar cada vez hace que los resultados cambien según el día.`)}
       ${paso(2, `${fuerte("No practicar con constancia:")} mejorar son repeticiones, no inspiración.`)}
       ${paso(3, `${fuerte("Cobrar de menos:")} cuando no confiás en tu trabajo, tampoco lo defendés.`)}
       ${paso(4, `${fuerte("Descuidar la imagen:")} tu local, tus redes y tu trato también venden.`)}
       ${paso(5, `${fuerte("No invertir en formación:")} quien aprende rápido se adelanta a quien espera.`)}
       ${parrafo("El curso está pensado para cambiar justo esto. Faltan pocos días.")}`,
      "Empezá por corregir esto hoy.",
    ),
  });
  add("F4", {
    asunto: "El año se termina. ¿Empezás el próximo igual?",
    cuando: "Faltan 4 días",
    objetivo: "Contexto emocional del cierre de año y de la Black Friday: invertir en el oficio y no solo gastar.",
    html: L(
      `${titulo("El año se termina")}
       ${parrafo("Se acerca la Black Friday y todos van a gastar en cosas que se rompen, se pasan de moda o se olvidan en un cajón.")}
       ${parrafo("Hay otra forma de aprovechar estas semanas: gastar en algo que te devuelva más de lo que cuesta.")}
       ${bloque(`${fuerte("Lo que aprendés no se rompe ni se devuelve.")} Se queda con vos, se nota en tus cortes y se paga solo cada vez que un cliente vuelve.`)}
       ${parrafo("Empezá el año nuevo con una habilidad nueva, no con la misma rutina.")}`,
      "Gastar vs. invertir en tu oficio.",
    ),
  });
  add("F3", {
    asunto: "Lo que vas a recibir (y cómo se paga)",
    cuando: "Faltan 3 días",
    objetivo: "Adelantar la oferta con claridad: pago único, dos tipos de acceso, bonos y garantía.",
    nota: "No se muestran precios en el email: se ven al entrar a la página de ventas.",
    html: L(
      `${titulo("Lo que vas a recibir")}
       ${paso(1, `${fuerte("El curso completo,")} módulos y clases para ver a tu ritmo.`)}
       ${paso(2, `${fuerte("Dos formas de acceso:")} 1 año o vitalicio (para siempre y con todas las novedades).`)}
       ${paso(3, `${fuerte("Bonos de lanzamiento,")} que se abren a los ${DIAS_BONO} días.`)}
       ${paso(4, `${fuerte("Pago único:")} sin mensualidades ni letra chica.`)}
       ${paso(5, `${fuerte(`Garantía de ${DIAS_REEMBOLSO} días:`)} si no es para vos, te devolvemos tu dinero.`)}
       ${parrafo("El día de la apertura, los primeros tienen un precio especial con acceso vitalicio. Cupos limitados.")}`,
      "Qué incluye y cómo se paga.",
    ),
  });
  add("F2", {
    asunto: "Faltan 2 días: dejá todo listo",
    cuando: "Faltan 2 días",
    objetivo: "Acción previa: que tenga el mismo email y un medio de pago a mano, para cerrar rápido.",
    html: L(
      `${titulo("Faltan 2 días")}
       ${parrafo("Para que no pierdas ni un minuto el día de la apertura, dejá esto listo hoy:")}
       ${paso(1, "Usá el mismo email con el que vas a comprar: ahí llega tu acceso.")}
       ${paso(2, "Entrá al grupo de WhatsApp: ahí avisamos primero.")}
       ${paso(3, "Tené a mano tu medio de pago.")}
       ${boton(WHATSAPP_GRUPO_URL, "Entrar al grupo de WhatsApp")}`,
      "Tres cosas para dejar listas hoy.",
    ),
  });
  add("F1", {
    asunto: "Mañana abrimos",
    cuando: "Faltan 1 día (víspera)",
    objetivo: "Generar expectativa real. Un solo mensaje claro: mañana pasa algo.",
    html: L(
      `${titulo("Mañana abrimos")}
       ${parrafo("Mañana abrimos las inscripciones a La Nueva Ola Academy.")}
       ${parrafo("Vas a recibir un email con el enlace a la oferta de lanzamiento. Los primeros en entrar tienen el mejor precio, con cupos limitados.")}
       ${bloque(`${fuerte("Tip:")} agregá este remitente a tus contactos para que el email no se pierda en spam o promociones.`)}`,
      "Mañana pasa algo importante.",
    ),
  });
  add("F0a", {
    asunto: "¡Hoy abrimos! Tu oferta de lanzamiento",
    cuando: "Día de la apertura, a la mañana",
    objetivo: "Primera venta: llevar a la lista caliente a la página de ventas.",
    html: L(
      `${titulo("¡Abrimos las inscripciones!")}
       ${parrafo("Ya podés entrar a La Nueva Ola Academy. Elegí tu acceso y empezá hoy.")}
       ${boton(ventas, "Ver la oferta de lanzamiento")}
       ${bloque(`${fuerte("Pago único.")} Sin mensualidades. Reembolso durante ${DIAS_REEMBOLSO} días.`)}
       ${parrafo("Las condiciones de apertura son por cupos limitados.")}`,
      "Abrieron las inscripciones. Entrá primero.",
    ),
  });
  add("F0b", {
    asunto: "Primer día: la oferta de apertura está corriendo",
    cuando: "Día de la apertura, a la noche (solo a quienes no entraron al checkout)",
    objetivo: "Segundo toque el mismo día, con cierre del día y recordatorio del cupo.",
    nota: "Decir que 'los cupos se están llenando' solo si es verdad. Si no, dejar el texto neutro.",
    html: L(
      `${titulo("Hoy fue el primer día")}
       ${parrafo("Muchos ya entraron a la oferta de apertura. Si todavía no viste cómo es, tenés tiempo de elegir tu acceso.")}
       ${boton(ventas, "Ver los accesos")}
       ${parrafo(`Recordá: pago único, ${DIAS_REEMBOLSO} días de garantía y cupos limitados en el precio de lanzamiento.`)}`,
      "El precio de apertura sigue disponible.",
    ),
  });

  // ════════ 2 · VIO LA OFERTA Y NO FUE AL CHECKOUT (desde el formulario de ventas o la apertura) ════════
  add("S1", {
    asunto: "Tus accesos te están esperando",
    cuando: "30 minutos después de dejar sus datos",
    objetivo: "Retomar mientras el interés está caliente, con el botón a un clic.",
    html: L(
      `${titulo("Viste la oferta, pero no terminaste")}
       ${parrafo("Dejaste tus datos y viste los accesos disponibles. Tu lugar sigue abierto.")}
       ${boton(ventas, "Volver a la oferta")}
       ${parrafo(`¿Alguna duda? Respondé este email o escribinos a ${mail}.`)}`,
      "Seguí donde lo dejaste.",
    ),
  });
  add("S2", {
    asunto: "Imaginate aprendiendo con Aaron",
    cuando: "1 día después",
    objetivo: "Visualización: que se imagine ya dentro del curso.",
    html: L(
      `${titulo("Imaginate aprendiendo con Aaron")}
       ${parrafo("Abrís la plataforma desde el celular. Elegís una clase. En pocos minutos entendés algo que antes te costaba semanas.")}
       ${parrafo("Mañana lo practicás en tu primer cliente. Pasado, ya lo hacés sin pensar.")}
       ${parrafo("Así se ve avanzar con método: clase a clase, sin improvisar.")}
       ${boton(ventas, "Quiero empezar")}`,
      "Un minuto para imaginarte adentro.",
    ),
  });
  add("S3", {
    asunto: "Así es una clase por dentro",
    cuando: "2 días después",
    objetivo: "Bajar la duda '¿cómo es el curso?' explicando el formato de cada clase.",
    nota: "Sin testimonios: el curso todavía no tiene alumnos. Cuando haya alumnos reales (con su permiso), se pueden sumar en este punto.",
    html: L(
      `${titulo("Así es una clase por dentro")}
       ${parrafo("Antes de decidir, está bien querer saber cómo se aprende. Cada clase está pensada para que no te pierdas:")}
       ${paso(1, `${fuerte("Explicación clara:")} Aaron muestra cada paso mientras corta, sin saltear nada.`)}
       ${paso(2, `${fuerte("Pocos minutos por clase:")} las podés ver entre cliente y cliente, desde el celular.`)}
       ${paso(3, `${fuerte("Para repetir:")} volvés a verla las veces que haga falta, hasta que te salga solo.`)}
       ${boton(ventas, "Ver cómo es el curso")}
       ${bloque(`${fuerte("Sin riesgo:")} si el curso no es lo que esperabas, tenés ${DIAS_REEMBOLSO} días para pedir el reembolso.`)}`,
      "Cómo se aprende dentro del curso.",
    ),
  });
  add("S4", {
    asunto: "Black Friday: gastá en algo que te devuelva más",
    cuando: "4 días después",
    objetivo: "Usar el clima de compras de fin de año para reencuadrar: del gasto a la inversión.",
    html: L(
      `${titulo("Esta Black Friday, comprá algo que te haga ganar")}
       ${parrafo("Todo el mundo está gastando: ropa, pantallas, cosas que en dos meses ya no usás.")}
       ${parrafo("Pensalo al revés: ¿qué podrías comprar hoy que te haga ganar más durante todo el año que viene?")}
       ${bloque(`${fuerte("Una habilidad.")} Se paga una vez y la usás cada día.`)}
       ${boton(ventas, "Invertir en mi oficio")}`,
      "Gastar vs. invertir en tu oficio.",
    ),
  });
  add("S5", {
    asunto: "¿Y si el año que viene sigue todo igual?",
    cuando: "6 días después",
    objetivo: "Costo de no actuar, con tono respetuoso (sin presión falsa).",
    html: L(
      `${titulo("¿Y si el año que viene sigue todo igual?")}
       ${parrafo("Hay una decisión que se toma sola cuando no se toma otra: seguir como estás.")}
       ${parrafo("Si hoy cortás igual que hace un año, cobrás parecido y tu agenda se mueve igual, el próximo año probablemente también.")}
       ${parrafo("Cambiar eso no requiere un gran salto: requiere empezar. Y empezar es más fácil con un método.")}
       ${boton(ventas, "Empezar ahora")}`,
      "El costo de no empezar.",
    ),
  });
  add("S6", {
    asunto: "¿Es mucho dinero? Hagamos la cuenta",
    cuando: "9 días después",
    objetivo: "Tratar la objeción de precio con lógica de retorno y la garantía.",
    html: L(
      `${titulo("¿Es mucho dinero? Hagamos la cuenta")}
       ${parrafo("Pensá cuántos cortes más tendrías que hacer para recuperar lo que cuesta el acceso. Es un número chico.")}
       ${parrafo("Y si el curso no es lo que esperabas, tenés " + DIAS_REEMBOLSO + " días para pedir el reembolso, sin vueltas.")}
       ${bloque(`${fuerte("Pago único.")} Sin mensualidades, sin letra chica.`)}
       ${boton(ventas, "Ver los accesos")}`,
      "El riesgo es mínimo.",
    ),
  });
  add("S7", {
    asunto: "Te escribo yo, Aaron",
    cuando: "14 días después",
    objetivo: "Toque humano: mensaje corto y personal del barbero.",
    nota: "Aaron debe aprobar este texto y la firma.",
    html: L(
      `${titulo("Te escribo yo")}
       ${parrafo("Soy Aaron. Vi que te interesó el curso y quería escribirte yo.")}
       ${parrafo("Si hay algo que te frena, contame: respondé este email y lo leo yo o alguien de mi equipo.")}
       ${parrafo("Me gustaría que lo veas como lo pensé: un camino claro para que mejores sin perder años probando por tu cuenta.")}
       ${boton(ventas, "Ver el curso")}
       ${firma}`,
      "Un mensaje corto de Aaron.",
    ),
  });
  add("S8", {
    asunto: "Seguimos sumando clases a La Nueva Ola Academy",
    cuando: "21 días después",
    objetivo: "Mostrar que el curso crece y dar un motivo para volver a mirarlo.",
    html: L(
      `${titulo("El curso sigue creciendo")}
       ${parrafo("La Nueva Ola Academy no es un curso cerrado: Aaron sigue sumando clases y mejoras, y con el acceso vitalicio las recibís todas sin pagar de nuevo.")}
       ${parrafo("Si todavía no entraste, este es un buen momento para empezar y no quedarte mirando.")}
       ${boton(ventas, "Ver el curso")}`,
      "El curso sigue creciendo.",
    ),
  });
  add("R1", {
    asunto: "Hace un mes pasaste por acá",
    cuando: "30 días sin comprar",
    objetivo: "Reabrir la conversación con un recordatorio amable y una novedad.",
    html: L(
      `${titulo("Hace un mes pasaste por acá")}
       ${parrafo("Pasó un mes desde que viste La Nueva Ola Academy. Sigue abierta y se suman clases todo el tiempo.")}
       ${parrafo("Si todavía querés aprender con método, entrá y mirá lo que hay.")}
       ${boton(ventas, "Ver la oferta")}`,
      "Un mes después.",
    ),
  });
  add("R2", {
    asunto: "¿Qué te frenó? Respondé en 10 segundos",
    cuando: "45 días sin comprar",
    objetivo: "Encuesta de un clic: entender la objeción y recuperar conversaciones.",
    html: L(
      `${titulo("¿Qué te frenó?")}
       ${parrafo("Nos ayudás muchísimo si respondés una sola cosa. Tocá la opción que más se parezca a vos:")}
       ${paso(1, enlace(`mailto:${SOPORTE_EMAIL}?subject=Me%20frena%20el%20precio`, "El precio"))}
       ${paso(2, enlace(`mailto:${SOPORTE_EMAIL}?subject=No%20tengo%20tiempo`, "No tengo tiempo"))}
       ${paso(3, enlace(`mailto:${SOPORTE_EMAIL}?subject=No%20estoy%20seguro%20de%20que%20funcione`, "No sé si funciona"))}
       ${paso(4, enlace(`mailto:${SOPORTE_EMAIL}?subject=Otra%20razon`, "Otra razón"))}
       ${parrafo("Cada respuesta la lee una persona.")}`,
      "Una pregunta, diez segundos.",
    ),
  });
  add("R3", {
    asunto: "Un consejo para tu próximo corte",
    cuando: "60 días sin comprar",
    objetivo: "Aportar valor gratis para mantener la relación, sin vender fuerte.",
    nota: "Cada vez que se repita este tipo de email se puede cambiar el consejo.",
    html: L(
      `${titulo("Un consejo para tu próximo corte")}
       ${parrafo("Antes de tocar la máquina, dedicale dos minutos a la consulta: preguntale al cliente cómo lo usa, cuánto tiempo tiene para peinarse y qué fue lo que no le gustó del último corte.")}
       ${parrafo("Esa conversación corta evita la mayoría de los reclamos y hace que el cliente sienta que lo escuchás. Y un cliente que se siente escuchado vuelve.")}
       ${parrafo("Si querés aprender así, paso a paso, el curso sigue abierto.")}
       ${boton(ventas, "Ver el curso")}`,
      "Un consejo práctico de barbería.",
    ),
  });
  add("R4", {
    asunto: "Lo que pasa dentro de La Nueva Ola Academy",
    cuando: "75 días sin comprar",
    objetivo: "Mostrar que la plataforma está viva y recordar el formato.",
    html: L(
      `${titulo("Lo que pasa dentro de la Academy")}
       ${parrafo("Mientras vos seguís con tu día, la plataforma sigue creciendo: nuevas clases, mejoras y bonos para quienes ya están adentro.")}
       ${parrafo("Recordá que el pago es único y que tenés garantía de " + DIAS_REEMBOLSO + " días.")}
       ${boton(ventas, "Ver qué incluye")}`,
      "La plataforma sigue creciendo.",
    ),
  });
  add("R5", {
    asunto: "Tres meses después: ¿seguís igual?",
    cuando: "90 días sin comprar",
    objetivo: "Reflexión sobre el tiempo que pasó, con tono amable.",
    html: L(
      `${titulo("Tres meses después")}
       ${parrafo("Pasaron tres meses desde que viste el curso. ¿Cómo viene tu trabajo? ¿Seguís cortando igual que antes?")}
       ${parrafo("Si querés dar el salto, el mejor momento sigue siendo hoy. Es un pago único y tenés garantía.")}
       ${boton(ventas, "Empezar ahora")}`,
      "Tres meses después.",
    ),
  });
  add("R6", {
    asunto: "Año nuevo, oficio nuevo",
    cuando: "120 días sin comprar",
    objetivo: "Aprovechar el efecto 'empezar de cero' del comienzo de año.",
    html: L(
      `${titulo("Año nuevo, oficio nuevo")}
       ${parrafo("Es el momento del año en que todos se proponen cambiar algo. Hacelo con método y no con ganas sueltas.")}
       ${boton(ventas, "Empezar con método")}`,
      "El año arranca. Arrancá vos también.",
    ),
  });
  add("R7", {
    asunto: "Un regalo para retomar",
    cuando: "150 días sin comprar",
    objetivo: "Incentivo especial para quien lleva meses mirando: cupón de reactivación.",
    nota: "Crear un cupón de reactivación en la Hotmart con vencimiento real.",
    html: L(
      `${titulo("Un regalo para retomar")}
       ${parrafo("Pasó un buen tiempo y sabemos que a veces el momento no era el indicado. Si ahora sí, te dejamos un descuento por tiempo limitado.")}
       ${cupon(CUPONES.diez, "10%")}
       ${boton(ventas, "Usar mi cupón")}`,
      "Un descuento para volver.",
    ),
  });
  add("R8", {
    asunto: "Medio año después",
    cuando: "180 días sin comprar",
    objetivo: "Último mensaje del primer ciclo; después sigue un aviso mensual.",
    html: L(
      `${titulo("Medio año después")}
       ${parrafo("Pasaron seis meses. Seguimos acá y seguimos sumando contenido.")}
       ${parrafo("A partir de ahora te escribimos una vez por mes con consejos y novedades. Si preferís no recibirlos, usá el enlace de baja.")}
       ${boton(ventas, "Ver el curso")}`,
      "Seguimos acá.",
    ),
  });
  add("M1", {
    asunto: "El consejo del mes: la regla de los dos minutos",
    cuando: "Cada mes, desde el mes 7 y hasta que compre o pida la baja",
    objetivo: "Mantener viva la relación a largo plazo: valor gratis + una puerta abierta al curso.",
    nota: "Es un email recurrente: el consejo se renueva cada mes (este es el del primer mes).",
    html: L(
      `${titulo("El consejo del mes")}
       ${parrafo("Dedicá dos minutos antes de cada corte a revisar la cabeza del cliente: la forma del cráneo, los remolinos y el crecimiento del pelo. Ahí se define cómo va a quedar el corte, antes de empezar.")}
       ${parrafo("Es un hábito chico que separa a los que cortan de memoria de los que cortan con criterio.")}
       ${boton(ventas, "Aprender más en el curso")}`,
      "Tu consejo del mes.",
    ),
  });
  // ════════ 3 · ENTRÓ AL CHECKOUT Y NO PAGÓ ════════
  add("A1", {
    estado: "activo",
    asunto: "¿Te quedó algo pendiente?",
    cuando: "1 hora después de escribir su email en el checkout",
    objetivo: "Recordatorio simple y amable, con el botón a un clic.",
    html: K(
      `${titulo("Dejaste tu acceso a medio camino")}
       ${parrafo("Vimos que empezaste a inscribirte y no terminaste el pago. Tu lugar sigue disponible: entrás en segundos y el acceso llega a tu email.")}
       ${boton(ventas, "Volver al checkout")}
       ${parrafo("Si tuviste algún problema con el pago, respondé este email y lo vemos.")}`,
      "Tu lugar sigue disponible.",
    ),
  });
  add("A2", {
    asunto: "¿Algo falló con el pago?",
    cuando: "4 horas después",
    objetivo: "Resolver el problema técnico más común: tarjeta rechazada o dudas al pagar.",
    html: K(
      `${titulo("¿Tuviste algún problema para pagar?")}
       ${parrafo("A veces el banco rechaza el pago o algo no queda claro. Es normal y se arregla rápido.")}
       ${paso(1, "Probá con otra tarjeta o otro medio de pago.")}
       ${paso(2, "Revisá que los datos estén bien escritos.")}
       ${paso(3, `Si sigue fallando, escribinos a ${mail} y te ayudamos.`)}
       ${boton(ventas, "Intentar de nuevo")}`,
      "Si algo falló, lo resolvemos.",
    ),
  });
  add("A3", {
    asunto: "Lo que te van a preguntar antes de entrar",
    cuando: "12 horas después",
    objetivo: "Sacar las objeciones: pago único, reembolso, cuándo llega el acceso y dónde se ve.",
    html: K(
      `${titulo("Dudas frecuentes")}
       ${parrafo(`${fuerte("¿Cuándo recibo el acceso?")}<br/>Apenas se confirma el pago te llega un email con un botón para entrar.`)}
       ${parrafo(`${fuerte("¿Hay cobros mensuales?")}<br/>No. Es un pago único.`)}
       ${parrafo(`${fuerte("¿Hay reembolso?")}<br/>Sí, durante los primeros ${DIAS_REEMBOLSO} días desde la compra.`)}
       ${parrafo(`${fuerte("¿Desde dónde lo veo?")}<br/>Celular, tablet o computadora.`)}
       ${boton(ventas, "Quiero entrar")}`,
      "Pago único, reembolso y acceso.",
    ),
  });
  add("A4", {
    asunto: "Un 10% de descuento para vos",
    cuando: "24 horas después",
    objetivo: "Primer incentivo: cupón de 10% para quien dudaba por el precio.",
    nota: "El cupón se crea en la Hotmart con vencimiento real (48 h). Conviene no aplicarlo a la promo de US$25.",
    html: K(
      `${titulo("Te regalamos un 10% de descuento")}
       ${parrafo("Sabemos que decidir lleva tiempo. Para ayudarte a dar el paso, te dejamos un cupón por tiempo limitado.")}
       ${cupon(CUPONES.diez, "10%")}
       ${boton(ventas, "Usar mi cupón")}
       ${parrafo("El cupón tiene fecha de vencimiento. Si lo necesitás, respondé este email.")}`,
      "Un cupón de 10% por tiempo limitado.",
    ),
  });
  add("A5", {
    asunto: "Tu cupón de 10% vence mañana",
    cuando: "48 horas después",
    objetivo: "Recordar el cupón con un vencimiento real, sin presión falsa.",
    html: K(
      `${titulo("Tu cupón vence mañana")}
       ${parrafo("Tu cupón de 10% sigue activo, pero solo por un día más.")}
       ${cupon(CUPONES.diez, "10%")}
       ${boton(ventas, "Aprovechar el descuento")}`,
      "Tu descuento está por vencer.",
    ),
  });
  add("A6", {
    asunto: "Último día: tu cupón vence hoy",
    cuando: "72 horas después",
    objetivo: "Cierre del primer cupón con el mensaje 'hoy es el último día'.",
    html: K(
      `${titulo("Hoy vence tu cupón")}
       ${parrafo("Es el último día para usar tu 10% de descuento. Después vuelve el precio normal.")}
       ${cupon(CUPONES.diez, "10%")}
       ${boton(ventas, "Entrar con descuento")}
       ${parrafo("Si el curso no es para vos, no pasa nada. Pero si te quedaste con ganas, este es el momento.")}`,
      "Último día de tu descuento.",
    ),
  });
  add("A7", {
    asunto: "Última oportunidad: 20% de descuento",
    cuando: "5 días después",
    objetivo: "Último intento con la mejor oferta, por pocas horas.",
    nota: "Cupón de 20% con vencimiento real de 24 h en la Hotmart. Confirmar con Aaron que el margen lo permite.",
    html: K(
      `${titulo("Última oportunidad: 20% de descuento")}
       ${parrafo("Para cerrar, te dejamos nuestro mejor descuento por 24 horas.")}
       ${cupon(CUPONES.veinte, "20%")}
       ${boton(ventas, "Entrar con 20% de descuento")}
       ${parrafo("Gracias por tu tiempo. Si ahora no es el momento, todo bien.")}`,
      "Nuestro mejor descuento, por 24 horas.",
    ),
  });
  add("A8", {
    asunto: "¿Te ayudamos a decidir?",
    cuando: "7 días después",
    objetivo: "Cambiar de registro: de descuento a ayuda personal y reducir el riesgo percibido.",
    html: K(
      `${titulo("¿Te ayudamos a decidir?")}
       ${parrafo("Sabemos que comprar un curso es una decisión importante. Si te queda alguna duda, respondé este email y una persona del equipo te contesta.")}
       ${bloque(`${fuerte("Recordá:")} pago único, sin mensualidades, y ${DIAS_REEMBOLSO} días de garantía para pedir tu reembolso.`)}
       ${boton(ventas, "Ver el curso")}`,
      "Escribinos y te ayudamos a decidir.",
    ),
  });
  add("A9", {
    asunto: "Antes de que termine el año",
    cuando: "10 días después",
    objetivo: "Último toque del carrito con el contexto de fin de año; luego pasa al flujo de 'un mes sin comprar'.",
    html: K(
      `${titulo("Antes de que termine el año")}
       ${parrafo("Faltan pocas semanas para cerrar el año. Empezarlo con una habilidad nueva cambia cómo se ve todo lo que viene.")}
       ${boton(ventas, "Empezar ahora")}
       ${parrafo(`Pago único, ${DIAS_REEMBOLSO} días de garantía.`)}`,
      "El año se termina.",
    ),
  });

  // ════════ 4 · COMPRÓ EL CURSO (sin la clase extra) ════════
  add("C1", {
    estado: "activo",
    asunto: ASUNTO_COMPRA,
    cuando: "Al instante, cuando se aprueba el pago",
    objetivo: "Dar el acceso con un clic y dejar claro cómo empezar.",
    html: htmlCompra({ accessLink: "#", loginLink: `${base}/entrar`, to: "tu@email.com", plan: "lifetime" }),
  });
  const bloqueExtra = bloque(`${fuerte(EXTRA.titulo)}<br/>${EXTRA.descripcion}<br/><br/><span style="font-size:22px;font-weight:700;color:#ffffff">US$${EXTRA.valor}</span> <span style="color:#b9c0c3;text-decoration:line-through">US$${EXTRA.valorAntes}</span> <span style="color:#b9c0c3">precio de alumno durante tus primeros ${EXTRA.diasPrecio} días</span>`);
  const verExtra = boton(`${base}/aulas/extra`, "Quiero la clase extra");
  add("C2", {
    asunto: "Una cosa más antes de empezar: sumá la clase extra",
    cuando: "3 horas después de comprar (solo si no tiene la clase extra)",
    objetivo: "Primera oferta de la clase extra, con el interés de compra todavía alto.",
    nota: `Regla de negocio propuesta: el precio de alumno (US$${EXTRA.valor}) vale durante los primeros ${EXTRA.diasPrecio} días de la compra; después vuelve a US$${EXTRA.valorAntes}. Hay que programarlo para que la urgencia sea real. Necesita el producto extra y su enlace en la Hotmart.`,
    html: A(
      `${titulo("Una cosa más antes de empezar")}
       ${parrafo("Ya tenés el curso, y eso es lo más importante. Pero cortar bien es solo la mitad del camino: la otra mitad es que te encuentren y te elijan.")}
       ${parrafo("Por eso armamos una clase extra, pensada para quienes recién empiezan a mostrar su trabajo:")}
       ${bloqueExtra}
       ${verExtra}
       ${parrafo("Se abre en tu plataforma apenas se confirma el pago, sin esperar.")}`,
      "Precio especial de alumno por tiempo limitado.",
    ),
  });
  add("C3", {
    asunto: "Tu primera clase te lleva 10 minutos",
    cuando: "1 día después de comprar",
    objetivo: "Activar: quien mira la primera clase en las primeras 24 h casi siempre termina el curso.",
    html: A(
      `${titulo("Tu primera clase te lleva 10 minutos")}
       ${parrafo("Lo más difícil es empezar. Hoy lo hacés fácil: abrí la plataforma y mirá solo la primera clase.")}
       ${boton(`${base}/aulas`, "Ir a mi primera clase")}
       ${parrafo("Después seguí el orden de los módulos. No hace falta apurarse: lo importante es la constancia.")}
       ${parrafo(`${fuerte("P. D.:")} cuando quieras, también podés sumar ${enlace(`${base}/aulas/extra`, EXTRA.titulo)} a precio de alumno.`)}`,
      "Un primer paso corto.",
    ),
  });
  add("C4", {
    asunto: "¿De qué sirve cortar bien si nadie lo ve?",
    cuando: "3 días después de comprar (solo si no tiene la clase extra)",
    objetivo: "Segunda oferta, centrada en el problema real: conseguir clientes.",
    html: A(
      `${titulo("¿De qué sirve cortar bien si nadie lo ve?")}
       ${parrafo("Hay barberos que cortan increíble y tienen la agenda vacía. Y otros que cortan parecido y no dan abasto. La diferencia casi nunca es la técnica: es cómo se muestran.")}
       ${parrafo("En la clase extra Aaron te explica, sin vueltas:")}
       ${paso(1, `${fuerte("Qué publicar")} para que te sigan las personas correctas.`)}
       ${paso(2, `${fuerte("Cómo mostrar tus cortes")} para que se vean profesionales.`)}
       ${paso(3, `${fuerte("Cómo convertir seguidores en clientes")} que reservan.`)}
       ${bloqueExtra}
       ${verExtra}`,
      "Cortar bien no alcanza si nadie te ve.",
    ),
  });
  add("C5", {
    asunto: "¿Cómo vas? Si algo no te cierra, escribinos",
    cuando: "5 días después de comprar",
    objetivo: "Prevenir reembolsos: ayudar antes de que termine la garantía de 7 días.",
    html: A(
      `${titulo("¿Cómo vas con el curso?")}
       ${parrafo("Pasaron unos días. Queremos asegurarnos de que te estés llevando lo que esperabas.")}
       ${parrafo(`Si algo no te cierra o te trabaste en alguna clase, escribinos a ${mail}. Lo resolvemos con vos.`)}
       ${boton(`${base}/aulas`, "Seguir con mis clases")}`,
      "Estamos para ayudarte.",
    ),
  });
  add("C6", {
    asunto: "Se abrieron tus bonos (y un complemento ideal)",
    cuando: `${DIAS_BONO} días después de comprar`,
    objetivo: "Reenganchar con un motivo real para volver, y recordar la clase extra como complemento.",
    html: A(
      `${titulo("Tus bonos ya están abiertos")}
       ${parrafo(`Pasaron ${DIAS_BONO} días y se liberaron los bonos de tu acceso. Entrá y empezá por el que más te sirva.`)}
       ${boton(`${base}/aulas`, "Ver mis bonos")}
       ${subtitulo("Para completar tu aprendizaje")}
       ${parrafo(`Quienes quieren más clientes suelen sumar ${fuerte(EXTRA.titulo)}. Todavía tenés el precio de alumno: US$${EXTRA.valor} en lugar de US$${EXTRA.valorAntes}.`)}
       ${enlace(`${base}/aulas/extra`, "Ver la clase extra")}`,
      "Tus bonos ya están disponibles.",
    ),
  });
  add("C7", {
    asunto: "Lo que vas a aprender en la clase extra, en 3 puntos",
    cuando: "9 días después de comprar (solo si no tiene la clase extra)",
    objetivo: "Tercera oferta: detallar el contenido para quien todavía duda.",
    html: A(
      `${titulo("La clase extra, en 3 puntos")}
       ${paso(1, `${fuerte("Qué publicar.")} Dejás de improvisar contenido: sabés qué mostrar para que te sigan personas de tu zona que buscan un barbero.`)}
       ${paso(2, `${fuerte("Cómo mostrar tus cortes.")} Ángulos, luz y detalles simples para que cada corte se vea como lo que es: trabajo profesional.`)}
       ${paso(3, `${fuerte("Cómo convertir seguidores en clientes.")} El paso de "me gusta tu trabajo" a "quiero reservar un turno".`)}
       ${bloqueExtra}
       ${verExtra}`,
      "Qué vas a aprender, punto por punto.",
    ),
  });
  add("C8", {
    asunto: "Tu precio de alumno vence en 2 días",
    cuando: `${EXTRA.diasPrecio - 2} días después de comprar (solo si no tiene la clase extra)`,
    objetivo: "Urgencia real: el precio de alumno termina a los 14 días.",
    nota: `Solo es verdad si se programa el vencimiento: a los ${EXTRA.diasPrecio} días de la compra la clase extra pasa a US$${EXTRA.valorAntes}.`,
    html: A(
      `${titulo("Tu precio de alumno vence en 2 días")}
       ${parrafo(`Como alumno tenés la clase extra a US$${EXTRA.valor} durante tus primeros ${EXTRA.diasPrecio} días. En 2 días vuelve a US$${EXTRA.valorAntes}.`)}
       ${verExtra}
       ${parrafo("Se abre al instante en tu plataforma. Sin esperar y sin trámites.")}`,
      "El precio especial está por terminar.",
    ),
  });
  add("C9", {
    asunto: "Último día: la clase extra a US$10",
    cuando: `${EXTRA.diasPrecio} días después de comprar (solo si no tiene la clase extra)`,
    objetivo: "Cierre de la oferta de la clase extra.",
    html: A(
      `${titulo("Hoy es el último día")}
       ${parrafo(`Hoy termina tu precio de alumno. Mañana, "${EXTRA.titulo}" pasa a US$${EXTRA.valorAntes}.`)}
       ${bloqueExtra}
       ${verExtra}
       ${parrafo("Es la última vez que te lo recordamos. Gracias por ser parte de La Nueva Ola Academy.")}`,
      "Último día del precio de alumno.",
    ),
  });
  add("C10", {
    asunto: "¿Nos contás cómo te fue?",
    cuando: "21 días después de comprar",
    objetivo: "Conseguir testimonios reales y feedback para mejorar el curso.",
    html: A(
      `${titulo("¿Nos contás cómo te fue?")}
       ${parrafo("Ya llevás unas semanas con el curso. Tu opinión nos ayuda a mejorarlo y a que otros barberos se animen.")}
       ${parrafo(`Respondé este email con una o dos frases sobre tu experiencia, o escribinos a ${mail}.`)}
       ${parrafo("Si nos das permiso, tu comentario puede aparecer en nuestra página.")}`,
      "Tu opinión nos ayuda.",
    ),
  });
  add("C11", {
    asunto: "Un mes con La Nueva Ola Academy",
    cuando: "30 días después de comprar",
    objetivo: "Retención: que siga activo y vuelva a la plataforma.",
    html: A(
      `${titulo("Un mes juntos")}
       ${parrafo("Hace un mes que sos parte de La Nueva Ola Academy. Lo que más cambia resultados es la constancia: seguí avanzando clase a clase.")}
       ${parrafo("La plataforma sigue creciendo, y con tu acceso recibís las novedades.")}
       ${boton(`${base}/aulas`, "Seguir aprendiendo")}`,
      "Un mes después.",
    ),
  });

  // ════════ 5 · COMPRÓ EL CURSO Y LA CLASE EXTRA ════════
  add("X1", {
    asunto: "Compra confirmada: curso + clase extra",
    cuando: "Al instante, cuando compra ambos",
    objetivo: "Agradecer, reforzar la decisión y marcar el camino ideal (curso + clase extra).",
    html: A(
      `${titulo("¡Bienvenido! Tenés el curso y la clase extra")}
       ${parrafo("Tu pago fue confirmado: ya tenés acceso al curso completo y a la clase extra.")}
       ${boton(`${base}/aulas`, "Entrar automáticamente")}
       ${subtitulo("Tu orden sugerido")}
       ${paso(1, "Empezá por la primera clase del curso.")}
       ${paso(2, `Mirá "${EXTRA.titulo}" cuando quieras: está en tu plataforma.`)}
       ${paso(3, `Los bonos se abren a los ${DIAS_BONO} días.`)}`,
      "Todo listo para empezar.",
    ),
  });
  add("X2", {
    asunto: "Cómo sacarle el máximo a lo que compraste",
    cuando: "2 días después",
    objetivo: "Activación guiada: combinar curso y clase extra.",
    html: A(
      `${titulo("Cómo sacarle el máximo")}
       ${paso(1, "Practicá cada técnica en tu trabajo la misma semana que la ves.")}
       ${paso(2, "Aplicá lo de la clase extra para que te encuentren más clientes.")}
       ${paso(3, "Anotá tus dudas: si algo no te cierra, escribinos.")}
       ${boton(`${base}/aulas`, "Ir a mis clases")}`,
      "Tres hábitos que aceleran resultados.",
    ),
  });
  add("X3", {
    asunto: "Contanos tu resultado",
    cuando: "14 días después",
    objetivo: "Pedir testimonio: quienes compraron todo suelen ser los más entusiastas.",
    html: A(
      `${titulo("Contanos tu resultado")}
       ${parrafo("Ya hace dos semanas que empezaste. ¿Qué cambió en tu trabajo?")}
       ${parrafo(`Respondé este email con tu experiencia, o escribinos a ${mail}. Si nos das permiso, la compartimos.`)}`,
      "Tu experiencia ayuda a otros.",
    ),
  });
  add("X4", {
    asunto: "Un mes después: seguimos sumando",
    cuando: "30 días después",
    objetivo: "Retención y anticipo de nuevas clases.",
    html: A(
      `${titulo("Un mes después")}
       ${parrafo("Gracias por confiar en La Nueva Ola Academy. Seguimos sumando clases y mejoras.")}
       ${boton(`${base}/aulas`, "Ver las novedades")}`,
      "Seguimos sumando contenido.",
    ),
  });

  // ════════ 6 · PLAN DE 1 AÑO: PASAR A VITALICIO ════════
  add("Y1", {
    asunto: "Te quedan 2 meses de acceso",
    cuando: "Día 300 del acceso de 1 año",
    objetivo: "Avisar antes de que venza y abrir la puerta al acceso vitalicio.",
    nota: "Hace falta una oferta de upgrade en la Hotmart (diferencia entre 1 año y vitalicio).",
    html: A(
      `${titulo("Te quedan 2 meses de acceso")}
       ${parrafo("Tu acceso de 1 año vence en unos 65 días. Si querés seguir aprendiendo y no depender de una fecha, podés pasar a acceso vitalicio.")}
       ${boton(ventas, "Pasar a acceso vitalicio")}`,
      "Pasá a vitalicio y olvidate de las fechas.",
    ),
  });
  add("Y2", {
    asunto: "Tu acceso vence en 3 semanas",
    cuando: "Día 340",
    objetivo: "Segundo aviso con la ventaja clara del vitalicio.",
    html: A(
      `${titulo("Tu acceso vence en 3 semanas")}
       ${parrafo("Con el acceso vitalicio conservás todas las clases y recibís las que se sumen, sin renovar nada.")}
       ${boton(ventas, "Quiero el acceso vitalicio")}`,
      "Conservá todo lo que ya aprendiste.",
    ),
  });
  add("Y3", {
    asunto: "Último aviso: tu acceso vence mañana",
    cuando: "Día 364",
    objetivo: "Última oportunidad de convertir a vitalicio.",
    html: A(
      `${titulo("Tu acceso vence mañana")}
       ${parrafo("Mañana termina tu año de acceso. Si querés seguir, pasá a vitalicio hoy.")}
       ${boton(ventas, "Pasar a vitalicio")}`,
      "Último día de acceso.",
    ),
  });

  // ════════ MAPA (organizado como un árbol: cada camino en su propia fila, sin cruces ni líneas de vuelta) ════════
  const N: Nodo[] = [];
  const nodo = (n: Nodo) => N.push(n);
  const fila = (ids: string[], tit: Record<string, [string, string]>, col0: number, row: number) =>
    ids.forEach((id, i) => nodo({ id, col: col0 + i, row, tipo: "email", titulo: tit[id][0], sub: tit[id][1], email: id }));

  nodo({ id: "origen", col: 0, row: 0.5, tipo: "origen", titulo: "Instagram, WhatsApp y anuncios", sub: "Orgánico + tráfico pago", detalle: "Durante los 10 días de captura el tráfico (orgánico y de anuncios) va a la página de captura. Después de la apertura va directo a la página de ventas. Usá los enlaces con origen de Admin > Enlaces para medir cada fuente." });

  // Fila 0 · captura
  nodo({ id: "captura", col: 1, row: 0, tipo: "pagina", titulo: "Página de captura", sub: "/captura · 10 días", detalle: "Lista de espera de 10 días. La persona deja su email y entra al grupo de WhatsApp. Pasada la apertura, el tráfico va directo a la página de ventas." });
  nodo({ id: "lead", col: 2, row: 0, tipo: "accion", titulo: "Lead en la lista", sub: "Calendario hasta la apertura", detalle: "La secuencia se cuenta contra la fecha de apertura, no contra el día en que se anotó. Si entra 8 días después de empezar la captura, recibe el email de bienvenida y solo los emails que faltan hasta la apertura." });
  const cap = ["W0", "F9", "F8", "F7", "F6", "F5", "F4", "F3", "F2", "F1", "F0a", "F0b"];
  fila(cap, {
    W0: ["Estás en la lista", "Al instante"], F9: ["Quién es Aaron", "Faltan 9 días"], F8: ["Imaginate en 3 meses", "Faltan 8"],
    F7: ["El curso por dentro", "Faltan 7"], F6: ["Detrás de escena", "Faltan 6"], F5: ["5 errores del barbero", "Faltan 5"],
    F4: ["El año se termina", "Faltan 4"], F3: ["Lo que vas a recibir", "Faltan 3"], F2: ["Dejá todo listo", "Faltan 2"],
    F1: ["Mañana abrimos", "Víspera"], F0a: ["¡Hoy abrimos!", "Apertura · mañana"], F0b: ["Primer día", "Apertura · noche"],
  }, 3, 0);
  nodo({ id: "aVentas", col: 15, row: 0, tipo: "mal", titulo: "Apertura: pasan a ventas", sub: "Si no compran: se unen a 'Vio la oferta y no compró'", detalle: "Los emails de apertura llevan a la página de ventas. Después de la apertura, quienes estaban en la lista y todavía no compraron se unen al mismo grupo que los visitantes que vieron la oferta y no avanzaron (fila de abajo, 'Vio la oferta y no compró'), y reciben exactamente los mismos emails hasta que compren." });

  // Fila 1 · columna vertebral de ventas
  nodo({ id: "ventas", col: 1, row: 1, tipo: "pagina", titulo: "Página de ventas", sub: "/ventas", detalle: "Sin precios a la vista. Para ver la oferta, la persona deja nombre, email y WhatsApp." });
  nodo({ id: "form", col: 2, row: 1, tipo: "accion", titulo: "Deja nombre, email y WhatsApp", sub: "Se vuelve lead", detalle: "Se guarda el contacto y se desbloquean los precios. Desde acá ya podemos recuperarlo." });
  nodo({ id: "plan", col: 3, row: 1, tipo: "accion", titulo: "Elige su acceso", sub: "Promo, vitalicio o 1 año", detalle: "Compara los planes y toca 'Continuar al pago'." });
  nodo({ id: "checkout", col: 4, row: 1, tipo: "pagina", titulo: "Checkout Hotmart", sub: "Pago", detalle: "Aquí la persona escribe su email y paga. Si deja el email y no paga, la Hotmart nos avisa (carrito abandonado)." });

  // Fila 2 · no pagó
  nodo({ id: "mal", col: 5, row: 2, tipo: "mal", titulo: "No pagó", sub: "Carrito abandonado", detalle: "Escribió su email en el checkout y no pagó. Empieza la secuencia de recuperación y se corta sola si compra. Además puede configurarse en la Hotmart el mensaje de recuperación por WhatsApp." });
  const a = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"];
  fila(a, {
    A1: ["¿Te quedó algo pendiente?", "1 hora"], A2: ["¿Algo falló con el pago?", "4 horas"], A3: ["Dudas frecuentes", "12 horas"], A4: ["10% de descuento", "24 h · cupón"],
    A5: ["El cupón vence mañana", "48 horas"], A6: ["Último día del cupón", "72 horas"], A7: ["Última oportunidad: 20%", "5 días · cupón"], A8: ["¿Te ayudamos a decidir?", "7 días"], A9: ["Antes de que termine el año", "10 días"],
  }, 6, 2);
  nodo({ id: "aFrio", col: 15, row: 2, tipo: "frio", titulo: "Sigue en reactivación", sub: "Mismo ciclo de la fila de abajo", detalle: "Si pasa el día 10 sin comprar, entra al mismo ciclo largo de reactivación (fila de abajo: emails a los 30, 45, 60 días y después cada mes) hasta que compre o pida la baja." });

  // Filas 3-5 · pagó
  nodo({ id: "bien", col: 5, row: 3, tipo: "bien", titulo: "Pagó", sub: "Se convierte en alumno", detalle: "El webhook libera el acceso, corta toda secuencia de recuperación y envía la confirmación. Según lo que compró, entra a uno de estos caminos." });
  nodo({ id: "solo", col: 6, row: 3, tipo: "bien", titulo: "Solo el curso", sub: "Sin la clase extra", detalle: "Recibe 6 emails con la oferta de la clase extra (3 horas, días 3, 7, 9, 12 y 14, y una mención en el día 1) mezclados con los de seguimiento. Si compra la clase extra, pasa al camino 'Curso + clase extra' y deja de recibir las ofertas." });
  nodo({ id: "both", col: 6, row: 4, tipo: "bien", titulo: "Curso + clase extra", sub: "Cliente completo", detalle: "Compró también la clase extra (en el checkout o después). Deja de recibir ofertas de la clase extra." });
  nodo({ id: "ren", col: 6, row: 5, tipo: "bien", titulo: "Plan de 1 año", sub: "Antes de que venza", detalle: "Quien compró el acceso de 1 año recibe 3 avisos antes del vencimiento, con la opción de pasar a vitalicio." });
  const c = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11"];
  fila(c, {
    C1: ["Confirmación de compra", "Al instante"], C2: ["Sumá la clase extra", "3 horas · oferta"], C3: ["Tu primera clase", "1 día"], C4: ["¿De qué sirve cortar bien si nadie lo ve?", "3 días · oferta"],
    C5: ["¿Cómo vas?", "5 días"], C6: ["Tus bonos + complemento", "7 días · oferta"], C7: ["La clase extra en 3 puntos", "9 días · oferta"], C8: ["Tu precio de alumno vence", "12 días · oferta"],
    C9: ["Último día: clase extra", "14 días · oferta"], C10: ["¿Nos contás cómo te fue?", "21 días"], C11: ["Un mes juntos", "30 días"],
  }, 7, 3);
  const x = ["X1", "X2", "X3", "X4"];
  fila(x, { X1: ["Compra confirmada: curso + extra", "Al instante"], X2: ["Sacale el máximo", "2 días"], X3: ["Contanos tu resultado", "14 días"], X4: ["Un mes después", "30 días"] }, 7, 4);
  const y = ["Y1", "Y2", "Y3"];
  fila(y, { Y1: ["Te quedan 2 meses", "Día 300"], Y2: ["Vence en 3 semanas", "Día 340"], Y3: ["Vence mañana", "Día 364"] }, 7, 5);

  // Fila 6 · vio la oferta y no fue al checkout + reactivación larga
  nodo({ id: "sn", col: 3, row: 6, tipo: "mal", titulo: "Vio la oferta y no compró", sub: "Visitantes + lista de espera", detalle: "Grupo común: visitantes que dejaron sus datos y no avanzaron, y personas de la lista de espera que no compraron tras la apertura. Reciben los mismos emails por semanas y, si siguen sin comprar, pasan a la reactivación larga (meses) hasta que compren o pidan la baja." });
  const s = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
  fila(s, {
    S1: ["Tus accesos te esperan", "30 min"], S2: ["Imaginate aprendiendo", "1 día"], S3: ["Mirá una clase por dentro", "2 días"], S4: ["Black Friday: invertí", "4 días"],
    S5: ["¿Y si sigue todo igual?", "6 días"], S6: ["¿Es mucho? Hagamos la cuenta", "9 días"], S7: ["Te escribo yo, Aaron", "14 días"], S8: ["Novedades", "21 días"],
  }, 4, 6);
  nodo({ id: "frio", col: 12, row: 6, tipo: "frio", titulo: "Reactivación larga", sub: "30 días sin comprar", detalle: "Quien llega a los 30 días sin comprar (venga del formulario o del checkout) sigue recibiendo emails por meses: recordatorio, encuesta, consejos de Aaron, novedades, un cupón y después un aviso mensual. Solo se corta si compra o pide la baja." });
  const r = ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8"];
  fila(r, {
    R1: ["Hace un mes pasaste por acá", "30 días"], R2: ["¿Qué te frenó?", "45 días"], R3: ["Un consejo de Aaron", "60 días"], R4: ["Lo nuevo en la Academy", "75 días"],
    R5: ["Tres meses después", "90 días"], R6: ["Año nuevo, oficio nuevo", "120 días"], R7: ["Un regalo para retomar", "150 días · cupón"], R8: ["Medio año después", "180 días"],
  }, 13, 6);
  fila(["M1"], { M1: ["Consejo del mes + novedades", "Cada mes, hasta que compre"] }, 21, 6);

  const cadena = (ids: string[]): Arista[] => ids.slice(1).map((id, i) => ({ de: ids[i], a: id }));
  const AR: Arista[] = [
    { de: "origen", a: "captura" },
    { de: "origen", a: "ventas" },
    ...cadena(["captura", "lead", ...cap, "aVentas"]),
    ...cadena(["ventas", "form", "plan", "checkout"]),
    { de: "form", a: "sn", etiqueta: "no avanza" },
    ...cadena(["sn", ...s, "frio", ...r, "M1"]),
    { de: "checkout", a: "mal", etiqueta: "no paga" },
    ...cadena(["mal", ...a, "aFrio"]),
    { de: "checkout", a: "bien", etiqueta: "paga" },
    { de: "bien", a: "solo" },
    { de: "bien", a: "both", etiqueta: "compra ambos" },
    { de: "bien", a: "ren", etiqueta: "plan 1 año" },
    ...cadena(["solo", ...c]),
    ...cadena(["both", ...x]),
    ...cadena(["ren", ...y]),
  ];

  return { NODOS: N, ARISTAS: AR, EMAILS: E };
}
