// Precios del curso: pago único (sin suscripción). Se cambian acá y en las ofertas de la Hotmart.
export const PRECOS = {
  // 1 año de acceso
  anual: { valor: 50, rotulo: "Acceso 1 año", detalle: "pago único, acceso por 12 meses" },
  // Para siempre, con todas las actualizaciones
  vitalicio: { valor: 70, rotulo: "Acceso vitalicio", detalle: "pago único, para siempre y con todas las actualizaciones" },
  // Precio de lanzamiento: vitalicio al precio del anual con 50% de descuento, solo para las primeras personas
  promo: { valor: 25, vagas: 20, rotulo: "Precio de lanzamiento", detalle: "acceso vitalicio al precio promocional" },
} as const;

// Links de checkout de la Hotmart (uno por oferta). Se definen en la Vercel; sin ellos el botón queda como "próximamente".
export const CHECKOUT_URLS = {
  anual: process.env.NEXT_PUBLIC_HOTMART_URL_ANUAL,
  vitalicio: process.env.NEXT_PUBLIC_HOTMART_URL_VITALICIO,
  promo: process.env.NEXT_PUBLIC_HOTMART_URL_PROMO,
} as const;

// Pon NEXT_PUBLIC_PROMO_ACTIVA=0 en la Vercel para cerrar la promo de lanzamiento a mano.
export const PROMO_ACTIVA = process.env.NEXT_PUBLIC_PROMO_ACTIVA !== "0";

export const DIAS_REEMBOLSO = 7;

export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Barbería Aaron";

// Grupo de WhatsApp da lista de espera (link de convite sem os parâmetros de rastreio do compartilhamento).
// Para trocar sem mexer no código, defina NEXT_PUBLIC_WHATSAPP_GROUP_URL na Vercel.
export const WHATSAPP_GRUPO_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "https://chat.whatsapp.com/B4wYyWa1Lfj0pvgbkY93yg";

// Soporte al alumno. Para cambiar el email sin tocar el código: NEXT_PUBLIC_SUPPORT_EMAIL en Vercel.
export const SOPORTE_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "lanuevaolaacademy.soporte@gmail.com";

// Días que los bonos (y algunas clases) quedan bloqueados después de la compra.
export const DIAS_BONO = 7;

// Páginas públicas del sitio, para el panel del equipo (/admin/enlaces).
// Cuando la página de ventas esté lista, cambia `lista` a true y aparece el enlace para copiar.
export const PAGINAS = [
  { nombre: "Página de captura", ruta: "/captura", detalle: "Lista de espera: email y grupo de WhatsApp", lista: true },
  { nombre: "Página de ventas", ruta: "/ventas", detalle: "Venta del curso con checkout", lista: false },
] as const;
