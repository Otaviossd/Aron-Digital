// Molde visual compartido por todos los emails (marca del sitio: verde neón, Inter, cabecera oscura con foto).
// Gmail móvil en tema oscuro invierte los colores de los emails oscuros. Para evitarlo, los fondos llevan también un
// background-image (Gmail no invierte imágenes). Los emails de login (Supabase) van como imagen completa: ver scripts/gen-email-templates.mjs.
// Tablas e estilos en línea porque los clientes de email no soportan CSS moderno.
// El logo (public/logo-email.png) y la foto (public/aaron/email-header.jpg) se sirven desde el sitio.

export const COLORES = {
  fondo: "#000000",
  tarjeta: "#050607",
  borde: "#1f272b",
  texto: "#ffffff",
  suave: "#ffffff",
  tenue: "#b9c0c3",
  acento: "#39ff7e",
  acento2: "#b6ff5c",
  enlace: "#39ff7e",
};

const sitio = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://lanuevaolaacademy.com").replace(/\/$/, "");
const fuente = "Inter,'Segoe UI',Helvetica,Arial,sans-serif";

export const boton = (url: string, texto: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0"><tr><td style="border-radius:999px;background:${COLORES.acento};background-image:linear-gradient(135deg,${COLORES.acento},${COLORES.acento2})">
    <a href="${url}" style="display:inline-block;padding:15px 30px;font-family:${fuente};font-size:15px;font-weight:700;color:#04120a;text-decoration:none;border-radius:999px">${texto}</a>
  </td></tr></table>`;

export const parrafo = (html: string) =>
  `<p style="margin:0 0 16px;font-family:${fuente};font-size:16px;line-height:1.65;color:${COLORES.suave}">${html}</p>`;

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
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light"></head>
<body bgcolor="${COLORES.fondo}" style="margin:0;padding:0;background:${COLORES.fondo};background-image:linear-gradient(${COLORES.fondo},${COLORES.fondo})">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORES.fondo}">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLORES.fondo}" style="background:${COLORES.fondo};background-image:linear-gradient(${COLORES.fondo},${COLORES.fondo})"><tr><td align="center" style="padding:28px 14px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
      <tr><td bgcolor="${COLORES.tarjeta}" style="background:${COLORES.tarjeta};background-image:linear-gradient(${COLORES.tarjeta},${COLORES.tarjeta});border:1px solid ${COLORES.borde};border-radius:22px;overflow:hidden">
        <div style="height:3px;line-height:3px;background:${COLORES.acento};background-image:linear-gradient(90deg,${COLORES.acento},${COLORES.acento2},${COLORES.acento})">&nbsp;</div>
        ${conFoto ? `<a href="${base}"><img src="${base}/aaron/email-header.jpg" width="560" alt="La Nueva Ola Academy" style="display:block;width:100%;height:auto;border:0;background:#000000"></a>` : ""}
        <div style="padding:30px 30px 26px">${cuerpo}</div>
      </td></tr>
      <tr><td align="left" style="padding:18px 8px 0;font-family:${fuente};font-size:12px;line-height:1.6;color:${COLORES.tenue}">
        ${pie ?? ""}
        <div style="margin-top:10px;color:#ffffff;font-weight:600">La Nueva Ola Academy</div><div>Aaron Dalla Rosa · Cursos de barbería</div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

// Bloques extra para emails más completos
export const bloque = (html: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr><td bgcolor="#0b0f11" style="background:#0b0f11;background-image:linear-gradient(#0b0f11,#0b0f11);border:1px solid ${COLORES.borde};border-radius:14px;padding:16px 18px;font-family:${fuente};font-size:14px;line-height:1.6;color:#ffffff">${html}</td></tr></table>`;

export const paso = (n: number, texto: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 12px"><tr>
    <td valign="top" width="34"><div style="width:26px;height:26px;line-height:26px;text-align:center;border-radius:13px;background:${COLORES.acento};background-image:linear-gradient(135deg,${COLORES.acento},${COLORES.acento2});color:#04120a;font-family:${fuente};font-size:13px;font-weight:700">${n}</div></td>
    <td valign="top" style="font-family:${fuente};font-size:15px;line-height:1.55;color:#ffffff;padding-top:2px">${texto}</td>
  </tr></table>`;

export const subtitulo = (texto: string) =>
  `<h2 style="margin:26px 0 12px;font-family:${fuente};font-size:13px;line-height:1.3;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:${COLORES.acento}">${texto}</h2>`;
