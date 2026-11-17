import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";

export type DatosCertificado = {
  nombre: string;
  codigo: string;
  emitidoAt: string | Date;
  horas: number;
  clases: number;
  urlVerificacion: string;
  // PNG con fondo transparente de la firma de Aaron (opcional: sin ella se usa el nombre en cursiva)
  firmaPng?: Uint8Array | null;
  // Logo de la marca (public/logo-lno.png); opcional, sin él se usa solo el texto.
  logoPng?: Uint8Array | null;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// "5 de noviembre de 2026", siempre en hora de Paraguay.
export function fechaLarga(fecha: string | Date) {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Asuncion", year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(new Date(fecha))
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${Number(partes.day)} de ${MESES[Number(partes.month) - 1]} de ${partes.year}`;
}

// "3 horas", "2,5 horas", "45 minutos"
export function textoHoras(horas: number) {
  if (horas < 1) return `${Math.max(1, Math.round(horas * 60))} minutos`;
  const redondeado = Math.round(horas * 10) / 10;
  const texto = Number.isInteger(redondeado) ? String(redondeado) : String(redondeado).replace(".", ",");
  return `${texto} ${redondeado === 1 ? "hora" : "horas"}`;
}

// Las fuentes estándar del PDF solo entienden Latin-1: quita lo que no puedan dibujar sin romper tildes ni la ñ.
export function textoSeguro(texto: string, fuente: PDFFont) {
  const limpio = texto.normalize("NFC").replace(/\s+/g, " ").trim();
  let salida = "";
  for (const ch of limpio) {
    try {
      fuente.encodeText(ch);
      salida += ch;
    } catch {
      const base = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
      try {
        fuente.encodeText(base);
        salida += base;
      } catch {
        /* se omite el carácter */
      }
    }
  }
  return salida;
}

const NEGRO = rgb(7 / 255, 9 / 255, 10 / 255);
const TINTA = rgb(0.957, 0.957, 0.949);
const APAGADO = rgb(0.62, 0.62, 0.61);
const ACENTO = rgb(0.224, 1, 0.494);

function centrado(page: PDFPage, texto: string, fuente: PDFFont, size: number, cx: number, y: number, color = TINTA, espacio = 0) {
  const ancho = fuente.widthOfTextAtSize(texto, size) + espacio * Math.max(0, texto.length - 1);
  let x = cx - ancho / 2;
  if (!espacio) {
    page.drawText(texto, { x, y, size, font: fuente, color });
    return;
  }
  for (const ch of texto) {
    page.drawText(ch, { x, y, size, font: fuente, color });
    x += fuente.widthOfTextAtSize(ch, size) + espacio;
  }
}

export async function generarCertificadoPdf(datos: DatosCertificado): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Certificado de conclusión · ${datos.nombre}`);
  doc.setAuthor("La Nueva Ola Academy");
  doc.setSubject("Certificado de conclusión del curso La Nueva Ola Academy");

  const W = 841.89;
  const H = 595.28;
  const page = doc.addPage([W, H]);
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const negrita = await doc.embedFont(StandardFonts.HelveticaBold);
  const cx = W / 2;
  const margen = 56;

  // Fondo liso, sin marco: un único resplandor suave en la esquina superior para dar profundidad.
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NEGRO });
  for (let i = 0; i < 10; i++) {
    page.drawCircle({ x: W - 40, y: H + 10, size: 320 - i * 28, color: ACENTO, opacity: 0.01 });
  }

  // Logo + wordmark, alineados a la izquierda (nada de marco ni todo centrado tipo diploma).
  let logoImg = null;
  if (datos.logoPng) {
    try {
      logoImg = await doc.embedPng(datos.logoPng);
    } catch {
      logoImg = null;
    }
  }
  const topY = H - margen - 20;
  if (logoImg) {
    const s = 26 / logoImg.height;
    page.drawImage(logoImg, { x: margen, y: topY, width: logoImg.width * s, height: logoImg.height * s });
    page.drawText("LA NUEVA OLA ACADEMY", { x: margen + logoImg.width * s + 12, y: topY + 8, size: 10.5, font: negrita, color: TINTA });
  } else {
    page.drawText("LA NUEVA OLA ACADEMY", { x: margen, y: topY + 8, size: 10.5, font: negrita, color: TINTA });
  }
  const numeroTxt = `Nº ${datos.codigo}`;
  page.drawText(numeroTxt, { x: W - margen - negrita.widthOfTextAtSize(numeroTxt, 9), y: topY + 9, size: 9, font: negrita, color: APAGADO });

  // Eyebrow + título, minimalista: sin caja, con una sola línea de acento debajo.
  const eyebrowY = H - 150;
  centrado(page, "CERTIFICADO DE FINALIZACIÓN", negrita, 10, cx, eyebrowY, ACENTO, 4.2);
  page.drawLine({ start: { x: cx - 18, y: eyebrowY - 14 }, end: { x: cx + 18, y: eyebrowY - 14 }, thickness: 1, color: ACENTO, opacity: 0.6 });

  // Nombre: tipografía limpia (sin cursiva de diploma clásico), grande y directa.
  const nombre = textoSeguro(datos.nombre, negrita) || "—";
  let tamano = 42;
  while (tamano > 22 && negrita.widthOfTextAtSize(nombre, tamano) > W - 220) tamano -= 1;
  centrado(page, nombre, negrita, tamano, cx, eyebrowY - 58, TINTA);

  // Texto, en un solo bloque corto y liviano.
  const lineas = [
    `completó el 100 % del curso de barbería digital de La Nueva Ola Academy,`,
    datos.horas > 0 ? `dictado por Aaron Dalla Rosa — ${textoHoras(datos.horas)} en ${datos.clases} ${datos.clases === 1 ? "clase" : "clases"} en video.` : `dictado por Aaron Dalla Rosa.`,
  ];
  lineas.forEach((l, i) => centrado(page, textoSeguro(l, normal), normal, 12.5, cx, eyebrowY - 104 - i * 19, APAGADO));
  centrado(page, `Emitido el ${fechaLarga(datos.emitidoAt)}`, normal, 10, cx, eyebrowY - 150, APAGADO, 0.4);

  // Pie: una sola línea hairline, sin caja. Firma (izquierda) · logo chico (centro) · QR (derecha).
  const pieY = 96;
  page.drawLine({ start: { x: margen, y: pieY + 54 }, end: { x: W - margen, y: pieY + 54 }, thickness: 0.6, color: TINTA, opacity: 0.1 });

  // Firma (izquierda): con imagen de la firma, o solo el nombre en grande si no hay.
  let firmaImg = null;
  if (datos.firmaPng) {
    try {
      firmaImg = await doc.embedPng(datos.firmaPng);
    } catch {
      firmaImg = null;
    }
  }
  if (firmaImg) {
    const escala = Math.min(150 / firmaImg.width, 48 / firmaImg.height);
    page.drawImage(firmaImg, { x: margen, y: pieY + 10, width: firmaImg.width * escala, height: firmaImg.height * escala });
  } else {
    page.drawText("Aaron Dalla Rosa", { x: margen, y: pieY + 18, size: 15, font: negrita, color: TINTA });
  }
  page.drawLine({ start: { x: margen, y: pieY + 4 }, end: { x: margen + 150, y: pieY + 4 }, thickness: 0.6, color: TINTA, opacity: 0.25 });
  page.drawText("Aaron Dalla Rosa", { x: margen, y: pieY - 10, size: 9.5, font: negrita, color: TINTA });
  page.drawText("Instructor · La Nueva Ola Academy", { x: margen, y: pieY - 22, size: 8, font: normal, color: APAGADO });

  // Marca chica (centro), en vez del sello circular tipo diploma.
  if (logoImg) {
    const s2 = 30 / logoImg.height;
    page.drawImage(logoImg, { x: cx - (logoImg.width * s2) / 2, y: pieY + 4, width: logoImg.width * s2, height: logoImg.height * s2, opacity: 0.9 });
  }
  centrado(page, "VERIFICADO DIGITALMENTE", negrita, 7, cx, pieY - 18, APAGADO, 1.4);

  // QR de verificación (derecha)
  const rx = W - margen - 64;
  const qr = await QRCode.toBuffer(datos.urlVerificacion, { margin: 1, width: 360, color: { dark: "#07090aff", light: "#f4f4f2ff" } });
  const qrImg = await doc.embedPng(qr);
  page.drawImage(qrImg, { x: rx, y: pieY, width: 54, height: 54 });
  const vx = rx - 10;
  page.drawText(datos.codigo, { x: vx - negrita.widthOfTextAtSize(datos.codigo, 9.5), y: pieY + 36, size: 9.5, font: negrita, color: ACENTO });
  const verif = datos.urlVerificacion.replace(/^https?:\/\//, "").replace(/\/verificar\/.*$/, "/verificar");
  page.drawText("Verificá este certificado en", { x: vx - normal.widthOfTextAtSize("Verificá este certificado en", 7.5), y: pieY + 24, size: 7.5, font: normal, color: APAGADO });
  page.drawText(verif, { x: vx - normal.widthOfTextAtSize(verif, 7.5), y: pieY + 14, size: 7.5, font: normal, color: APAGADO });

  return doc.save();
}
