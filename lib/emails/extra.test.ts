import test from "node:test";
import assert from "node:assert/strict";
import { PASOS_TEXTO, plantillaExtra } from "./extra.ts";

const base = { siteUrl: "https://www.lanuevaolaacademy.com", email: "a@b.com", bajaUrl: "https://x/baja?t=1", marca: "LNO", link: "https://pay.hotmart.com/X?off=1" };

test("los 11 emails de la clase extra se arman con el enlace y la baja", () => {
  for (let step = 1; step <= 11; step++) {
    const horas = step <= 6 ? 100 : null;
    const { asunto, html } = plantillaExtra(step, { ...base, horasRestantes: horas });
    assert.ok(asunto.length > 5, `asunto paso ${step}`);
    assert.ok(html.includes(base.link), `enlace paso ${step}`);
    assert.ok(html.includes(base.bajaUrl), `baja paso ${step}`);
    assert.ok(!html.includes("undefined") && !html.includes("NaN"), `sin undefined paso ${step}`);
  }
  assert.ok(Object.keys(PASOS_TEXTO).length === 11);
});

test("con precio de alumno muestra US$10 y el plazo; después solo US$20", () => {
  const oferta = plantillaExtra(2, { ...base, horasRestantes: 100 }).html;
  assert.match(oferta, /US\$10/);
  assert.match(oferta, /5 días/);
  const normal = plantillaExtra(7, { ...base, horasRestantes: null }).html;
  assert.doesNotMatch(normal, /line-through/);
  assert.match(normal, /US\$20/);
});
