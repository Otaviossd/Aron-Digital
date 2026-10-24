// URL pública del sitio, sin barra final. Sin variable definida usa el dominio real (nunca localhost):
// con ella se arman los enlaces de los emails que reciben los alumnos.
export const SITE_URL_PUBLICA = "https://www.lanuevaolaacademy.com";

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_PUBLICA).replace(/\/$/, "");
