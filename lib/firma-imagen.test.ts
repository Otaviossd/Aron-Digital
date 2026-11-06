import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { firmaTransparente } from "./firma-imagen.ts";

test("firma oscura sobre papel blanco queda transparente y recortada", async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="#fafafa"/><path d="M120 200 C 180 60, 260 260, 330 140 S 450 120, 480 190" stroke="#101010" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`;
  const origen = await sharp(Buffer.from(svg)).jpeg().toBuffer();
  const salida = await firmaTransparente(origen);
  const meta = await sharp(salida).metadata();
  assert.equal(meta.format, "png");
  assert.equal(meta.hasAlpha, true);
  assert.ok((meta.width ?? 0) < 600 && (meta.height ?? 0) < 300, "se recortó al contenido");
  const { data } = await sharp(salida).raw().toBuffer({ resolveWithObject: true });
  let opacos = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 200) opacos++;
  assert.ok(opacos > 200, "hay trazo visible");
});

test("una hoja en blanco no es una firma", async () => {
  const blanco = await sharp({ create: { width: 200, height: 100, channels: 3, background: "#ffffff" } }).png().toBuffer();
  await assert.rejects(() => firmaTransparente(blanco), /No se encontró una firma/);
});
