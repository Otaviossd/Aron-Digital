// Preços e textos configuráveis num só lugar. Os valores são placeholders: defina
// os reais antes de publicar e crie os mesmos valores nos planos do PayPal.
export const PRECOS = {
  monthly: { valor: 25, rotulo: "Mensual", detalle: "por mes, cancelás cuando quieras" },
  annual: { valor: 149, rotulo: "Anual", detalle: "pago único por 12 meses, ahorrás más de 50%" },
} as const;

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
