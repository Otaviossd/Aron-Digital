// Precios del curso: pago único (sin suscripción). Se cambian acá y en las ofertas de la Hotmart.
export const PRECOS = {
  // 1 año de acceso
  anual: { valor: 50, rotulo: "Acceso 1 año", detalle: "pago único, acceso por 12 meses" },
  // Para siempre, con todas las actualizaciones
  vitalicio: { valor: 70, rotulo: "Acceso vitalicio", detalle: "pago único, para siempre y con todas las actualizaciones" },
  // Precio de lanzamiento: vitalicio al precio del anual con 50% de descuento, solo para las primeras personas
  promo: { valor: 25, vagas: 50, rotulo: "Precio de lanzamiento", detalle: "acceso vitalicio al precio promocional" },
} as const;

// Links de checkout de la Hotmart (uno por oferta). Se definen en la Vercel; sin ellos el botón queda como "próximamente".
// Links fijos de las 3 ofertas. No dependen de variables de la Vercel, para que un valor viejo allá no mande al checkout antiguo.
export const CHECKOUT_URLS = {
  anual: "https://pay.hotmart.com/L108130682Q?off=snaqp8m9&checkoutMode=10",
  vitalicio: "https://pay.hotmart.com/L108130682Q?off=xz9l3slm&checkoutMode=10",
  promo: "https://pay.hotmart.com/L108130682Q?off=zpu4tvlu&checkoutMode=10",
} as const;

// Códigos de las 3 ofertas de la Hotmart (el valor de "off" en cada link). El webhook los usa para saber qué plan se compró.
export const OFERTAS_HOTMART = { promo: "zpu4tvlu", anual: "snaqp8m9", vitalicio: "xz9l3slm" } as const;

// Pon NEXT_PUBLIC_PROMO_ACTIVA=0 en la Vercel para cerrar la promo de lanzamiento a mano.
export const PROMO_ACTIVA = process.env.NEXT_PUBLIC_PROMO_ACTIVA !== "0";

// La promo de lanzamiento dura 3 días (7 a 10 de noviembre) o hasta agotar los cupos, lo que ocurra primero.
// Pasada esta fecha (hora de Paraguay) la oferta de lanzamiento desaparece sola del sitio. Se puede cambiar con NEXT_PUBLIC_PROMO_FIN.
export const PROMO_FIN = process.env.NEXT_PUBLIC_PROMO_FIN || "2026-11-10T23:59:59-03:00";

export const DIAS_REEMBOLSO = 7;

export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Barbería Aaron";

// Grupo de WhatsApp da lista de espera (link de convite sem os parâmetros de rastreio do compartilhamento).
// Para trocar sem mexer no código, defina NEXT_PUBLIC_WHATSAPP_GROUP_URL na Vercel.
export const WHATSAPP_GRUPO_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "https://chat.whatsapp.com/B4wYyWa1Lfj0pvgbkY93yg";

// Grupo de WhatsApp de los ALUMNOS (quienes ya compraron). Distinto del grupo de la lista de espera.
// Para cambiarlo sin tocar el código: NEXT_PUBLIC_WHATSAPP_ALUMNOS_URL en Vercel.
export const WHATSAPP_ALUMNOS_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_ALUMNOS_URL || "https://chat.whatsapp.com/HXl5PCWAVzUKxLkN8ZiaN8";

// Soporte al alumno. Para cambiar el email sin tocar el código: NEXT_PUBLIC_SUPPORT_EMAIL en Vercel.
export const SOPORTE_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "lanuevaolaacademy.soporte@gmail.com";

// Días que los bonos (y algunas clases) quedan bloqueados después de la compra.
export const DIAS_BONO = 7;

// Páginas públicas del sitio, para el panel del equipo (/admin/enlaces).
// Cuando la página de ventas esté lista, cambia `lista` a true y aparece el enlace para copiar.
export const PAGINAS = [
  { nombre: "Página de captura", ruta: "/captura", detalle: "Lista de espera: email y grupo de WhatsApp", lista: true },
  { nombre: "Página de ventas", ruta: "/ventas", detalle: "Venta del curso: formulario de contacto y checkout de la Hotmart", lista: true },
  { nombre: "Checkout (las 3 ofertas)", ruta: "/ventas#comprar", detalle: "Lleva directo al formulario y a la elección de plan; ideal para anuncios y mensajes de cierre", lista: true },
  { nombre: "Gracias: compra aprobada", ruta: "/gracias", detalle: "Hotmart > URL para Compras Aprobadas", lista: true },
  { nombre: "Gracias: pago pendiente", ruta: "/gracias/pendiente", detalle: "Hotmart > URL para Compras a la espera de pago", lista: true },
  { nombre: "Gracias: pago en análisis", ruta: "/gracias/analisis", detalle: "Hotmart > URL para Compras a la Espera del Análisis de Crédito", lista: true },
  { nombre: "Acceso de alumnos", ruta: "/entrar", detalle: "Login de la área de miembros (link para la Hotmart: área de miembros externa)", lista: true },
] as const;

// Clase extra (order bump / venta posterior dentro del área de alumnos). Un solo producto barato en la Hotmart.
export const EXTRA = {
  titulo: "Cómo crecer en redes sociales como barbero",
  descripcion: "Tu Instagram puede llenarte la agenda. En esta clase Aaron te muestra qué publicar, cómo mostrar tus cortes para que la gente quiera reservar y cómo convertir a tus seguidores en clientes.",
  valor: 10,
  valorAntes: 20, // precio "de" tachado
  diasPrecio: 15, // el precio de alumno (US$10) dura 15 días desde la compra del curso; después vuelve a US$20 (lo calcula el sitio)
  portada: "/extra/portada.webp", // portada cuadrada de la clase (también se usa de miniatura)
  portadaChica: "/extra/portada-chica.webp",
  checkoutUrl: process.env.NEXT_PUBLIC_HOTMART_URL_EXTRA, // oferta de US$10 (precio de alumno)
  // Link del precio normal (US$20). Si no se define, se usa el mismo link sin el parámetro "off" (la oferta base del producto).
  checkoutUrlNormal: process.env.NEXT_PUBLIC_HOTMART_URL_EXTRA_NORMAL,
  videoUrl: process.env.NEXT_PUBLIC_EXTRA_VIDEO_URL, // enlace "embed" (YouTube no listado, Vimeo, Drive...)
} as const;

// Cupones de recuperación (se crean en la Hotmart, con fecha de vencimiento real). Los emails solo muestran el código.
export const CUPONES = {
  diez: process.env.NEXT_PUBLIC_CUPON_10 || "LNO10",
  veinte: process.env.NEXT_PUBLIC_CUPON_20 || "LNO20",
} as const;

// Fecha de apertura de las inscripciones (día 0 del lanzamiento), formato AAAA-MM-DD. La secuencia de captura se calcula
// contra esta fecha: quien entra tarde recibe solo los emails que faltan.
export const FECHA_LANZAMIENTO = process.env.NEXT_PUBLIC_FECHA_LANZAMIENTO || "";

// Costos para el panel de Finanzas. Cuando la Hotmart informa la tarifa real de una venta (webhook) se usa esa;
// estos valores solo estiman las ventas donde no vino. Confirmalos en tu cuenta de Hotmart y ajustalos acá.
export const COSTOS = {
  tarifaHotmartPct: 9.9, // % que cobra la Hotmart por venta
  tarifaHotmartFija: 0.5, // US$ fijos por venta
  parteCoprodutor: 50, // % de lo que queda después de la tarifa que corresponde al coproductor (si el webhook no lo informa)
} as const;
