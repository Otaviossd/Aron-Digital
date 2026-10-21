// Molde visual compartido por todos los emails (marca del sitio: fondo oscuro, verde neón, Inter).
// Tablas e estilos en línea porque los clientes de email no soportan CSS moderno.
// El logo (public/logo-email.png) y la foto (public/aaron/email-header.jpg) se sirven desde el sitio.

export const COLORES = {
  fondo: "#07090a",
  tarjeta: "#0e1214",
  borde: "#1d2428",
  texto: "#f4f4f2",
  suave: "#a9b0b3",
  tenue: "#6f787c",
  acento: "#39ff7e",
  acento2: "#b6ff5c",
};

const sitio = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lanuevaolaacademy.com").replace(/\/$/, "");
const fuente = "Inter,'Segoe UI',Helvetica,Arial,sans-serif";

export const boton = (url: string, texto: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0"><tr><td style="border-radius:999px;background:${COLORES.acento};background-image:linear-gradient(135deg,${COLORES.acento},${COLORES.acento2})">
    <a href="${url}" style="display:inline-block;padding:15px 30px;font-family:${fuente};font-size:15px;font-weight:700;color:#04120a;text-decoration:none;border-radius:999px">${texto}</a>
  </td></tr></table>`;

export const parrafo = (html: string) =>
  `<p style="margin:0 0 16px;font-family:${fuente};font-size:15px;line-height:1.65;color:${COLORES.suave}">${html}</p>`;

export const titulo = (texto: string) =>
  `<h1 style="margin:0 0 16px;font-family:${fuente};font-size:26px;line-height:1.2;font-weight:700;letter-spacing:-0.5px;color:${COLORES.texto}">${texto}</h1>`;

type Opciones = {
  cuerpo: string;
  pie?: string; // texto chico + enlace de baja
  siteUrl?: string;
  conFoto?: boolean;
  preheader?: string;
};

export function layoutEmail({ cuerpo, pie, siteUrl, conFoto = true, preheader }: Opciones) {
  const base = (siteUrl ?? sitio()).replace(/\/$/, "");
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background:${COLORES.fondo}">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORES.fondo}">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORES.fondo}"><tr><td align="center" style="padding:28px 14px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td align="left" style="padding:0 6px 18px">
        <a href="${base}" style="text-decoration:none"><img src="${base}/logo-email.png" width="190" alt="La Nueva Ola Academy" style="display:block;border:0;height:auto;width:190px"></a>
      </td></tr>
      <tr><td style="background:${COLORES.tarjeta};border:1px solid ${COLORES.borde};border-radius:22px;overflow:hidden">
        <div style="height:3px;line-height:3px;background:${COLORES.acento};background-image:linear-gradient(90deg,${COLORES.acento},${COLORES.acento2},${COLORES.acento})">&nbsp;</div>
        ${conFoto ? `<img src="${base}/aaron/email-header.jpg" width="560" alt="" style="display:block;width:100%;height:auto;border:0">` : ""}
        <div style="padding:30px 30px 26px">${cuerpo}</div>
      </td></tr>
      <tr><td align="left" style="padding:18px 8px 0;font-family:${fuente};font-size:12px;line-height:1.6;color:${COLORES.tenue}">
        ${pie ?? ""}
        <div style="margin-top:10px">La Nueva Ola Academy · Aaron Dalla Rosa</div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
