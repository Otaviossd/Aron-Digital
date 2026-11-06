import sharp from "sharp";

// Convierte la foto de una firma (tinta oscura sobre papel claro) en un PNG transparente con tinta clara,
// que se ve bien sobre el fondo oscuro del certificado.
export async function firmaTransparente(entrada: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(entrada)
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({ width: 900, withoutEnlargement: true })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const rgba = Buffer.alloc(width * height * 4);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let i = 0; i < width * height; i++) {
    const oscuridad = 255 - data[i];
    const alfa = Math.max(0, Math.min(255, Math.round((oscuridad - 45) * 2.4)));
    rgba[i * 4] = 244;
    rgba[i * 4 + 1] = 244;
    rgba[i * 4 + 2] = 242;
    rgba[i * 4 + 3] = alfa;
    if (alfa > 40) {
      const x = i % width;
      const y = (i - x) / width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error("No se encontró una firma en la imagen. Usá una foto con tinta oscura sobre papel claro.");

  const margen = 12;
  const left = Math.max(0, minX - margen);
  const top = Math.max(0, minY - margen);
  const w = Math.min(width - left, maxX - minX + 1 + margen * 2);
  const h = Math.min(height - top, maxY - minY + 1 + margen * 2);

  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: w, height: h })
    .png()
    .toBuffer();
}
