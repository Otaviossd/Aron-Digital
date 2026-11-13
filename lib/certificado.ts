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
  const cursiva = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const cx = W / 2;

  // Fondo y luces suaves
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NEGRO });
  for (let i = 0; i < 9; i++) {
    page.drawCircle({ x: W - 70, y: H - 30, size: 260 - i * 26, color: ACENTO, opacity: 0.012 });
    page.drawCircle({ x: 40, y: 20, size: 200 - i * 20, color: ACENTO, opacity: 0.008 });
  }

  // Marco doble
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: ACENTO, borderWidth: 0.9, borderOpacity: 0.55 });
  page.drawRectangle({ x: 31, y: 31, width: W - 62, height: H - 62, borderColor: TINTA, borderWidth: 0.4, borderOpacity: 0.14 });

  // Encabezado
  centrado(page, "LA NUEVA OLA ACADEMY", negrita, 11, cx, 520, ACENTO, 5);
  centrado(page, "CERTIFICADO DE CONCLUSIÓN", negrita, 29, cx, 468, TINTA, 3.2);
  page.drawLine({ start: { x: cx - 36, y: 448 }, end: { x: cx + 36, y: 448 }, thickness: 1.2, color: ACENTO });

  centrado(page, "Se certifica que", normal, 12.5, cx, 416, APAGADO);

  // Nombre: se achica hasta que entre en el marco
  const nombre = textoSeguro(datos.nombre, cursiva) || "—";
  let tamano = 46;
  while (tamano > 20 && cursiva.widthOfTextAtSize(nombre, tamano) > W - 190) tamano -= 1;
  centrado(page, nombre, cursiva, tamano, cx, 366, TINTA);
  const anchoNombre = Math.min(W - 190, cursiva.widthOfTextAtSize(nombre, tamano) + 40);
  page.drawLine({ start: { x: cx - anchoNombre / 2, y: 352 }, end: { x: cx + anchoNombre / 2, y: 352 }, thickness: 0.6, color: ACENTO, opacity: 0.6 });

  // Texto
  const lineas = [
    `completó el 100 % de las clases del curso de barbería digital La Nueva Ola Academy,`,
    datos.horas > 0 ? `dictado por Aaron Dalla Rosa, con una carga de formación de ${textoHoras(datos.horas)}` : `dictado por Aaron Dalla Rosa,`,
    `en ${datos.clases} ${datos.clases === 1 ? "clase" : "clases"} en video.`,
  ];
  lineas.forEach((l, i) => centrado(page, textoSeguro(l, normal), normal, 13, cx, 322 - i * 20, TINTA));
  centrado(page, `Emitido el ${fechaLarga(datos.emitidoAt)}`, normal, 11, cx, 246, APAGADO);

  // Firma (izquierda)
  const fx = 190;
  if (datos.firmaPng) {
    try {
      const img = await doc.embedPng(datos.firmaPng);
      const escala = Math.min(190 / img.width, 70 / img.height);
      page.drawImage(img, { x: fx - (img.width * escala) / 2, y: 140, width: img.width * escala, height: img.height * escala });
    } catch {
      centrado(page, "Aaron Dalla Rosa", cursiva, 24, fx, 146, TINTA);
    }
  } else {
    centrado(page, "Aaron Dalla Rosa", cursiva, 24, fx, 146, TINTA);
  }
  page.drawLine({ start: { x: fx - 95, y: 136 }, end: { x: fx + 95, y: 136 }, thickness: 0.6, color: TINTA, opacity: 0.5 });
  centrado(page, "Aaron Dalla Rosa", negrita, 11, fx, 120, TINTA);
  centrado(page, "Instructor · La Nueva Ola Academy", normal, 8.5, fx, 106, APAGADO);

  // Sello (centro)
  const sy = 140;
  page.drawCircle({ x: cx, y: sy, size: 44, borderColor: ACENTO, borderWidth: 1.4, borderOpacity: 0.9 });
  page.drawCircle({ x: cx, y: sy, size: 38, borderColor: ACENTO, borderWidth: 0.4, borderOpacity: 0.5 });
  centrado(page, "LNO", negrita, 17, cx, sy - 2, ACENTO, 1.5);
  centrado(page, "ACADEMY", negrita, 5.6, cx, sy - 14, APAGADO, 1.6);
  centrado(page, "CERTIFICADO", negrita, 5.6, cx, sy + 13, APAGADO, 1.6);

  // QR de verificación (derecha)
  const rx = W - 190;
  const qr = await QRCode.toBuffer(datos.urlVerificacion, { margin: 1, width: 360, color: { dark: "#07090aff", light: "#f4f4f2ff" } });
  const qrImg = await doc.embedPng(qr);
  page.drawRectangle({ x: rx - 38, y: 108, width: 76, height: 76, color: TINTA });
  page.drawImage(qrImg, { x: rx - 36, y: 110, width: 72, height: 72 });
  centrado(page, datos.codigo, negrita, 10.5, rx, 94, ACENTO, 1);
  centrado(page, "Verificá este certificado en", normal, 7.5, rx, 82, APAGADO);
  centrado(page, datos.urlVerificacion.replace(/^https?:\/\//, "").replace(/\/verificar\/.*$/, "/verificar"), normal, 7.5, rx, 72, APAGADO);

  return doc.save();
}
