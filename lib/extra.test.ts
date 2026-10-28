import test from "node:test";
import assert from "node:assert/strict";
import { enlaceExtra, precioExtra, textoRestante } from "./extra.ts";
import { pasoExtraDebido } from "./sequence-extra.ts";

const compra = new Date("2026-11-08T12:00:00Z");
const en = (horas: number) => new Date(compra.getTime() + horas * 3600000);

test("precio de la clase extra: US$10 los primeros 15 días y después US$20", () => {
  const a = precioExtra(compra, en(24));
  assert.equal(a.enOferta, true);
  assert.equal(a.valor, 10);
  assert.equal(a.valorAntes, 20);
  assert.equal(precioExtra(compra, en(359)).enOferta, true);
  const d = precioExtra(compra, en(361));
  assert.equal(d.enOferta, false);
  assert.equal(d.valor, 20);
  assert.equal(d.valorAntes, null);
  assert.equal(precioExtra(null, en(9999)).valor, 10);
});

test("texto de tiempo restante", () => {
  assert.equal(textoRestante(10), "menos de 24 horas");
  assert.equal(textoRestante(30), "2 días");
  assert.equal(textoRestante(24 * 5 - 2), "5 días");
});

test("enlace: oferta con off y precio normal sin off", () => {
  const urls = { oferta: "https://pay.hotmart.com/ABC123?off=xyz&checkoutMode=10" };
  assert.match(enlaceExtra(true, urls, "A@B.com")!, /off=xyz/);
  assert.match(enlaceExtra(true, urls, "A@B.com")!, /email=a%40b\.com/);
  const normal = enlaceExtra(false, urls)!;
  assert.doesNotMatch(normal, /off=/);
  assert.match(normal, /checkoutMode=10/);
  assert.equal(enlaceExtra(false, { oferta: urls.oferta, normal: "https://pay.hotmart.com/ABC123?off=n20" }), "https://pay.hotmart.com/ABC123?off=n20");
  assert.equal(enlaceExtra(true, {}), null);
});

test("secuencia: un paso por ventana, sin repetir ni mandar emails viejos", () => {
  const base = { compraEn: compra, enviados: [] as number[], ultimoEnvio: null };
  assert.equal(pasoExtraDebido({ ...base, ahora: en(1) }), null);
  assert.equal(pasoExtraDebido({ ...base, ahora: en(4) }), 1);
  assert.equal(pasoExtraDebido({ ...base, ahora: en(4), enviados: [1] }), null);
  // el agendador falló y ya pasó la ventana del paso 1
  assert.equal(pasoExtraDebido({ ...base, ahora: en(60) }), null);
  assert.equal(pasoExtraDebido({ ...base, ahora: en(340), enviados: [1, 2, 3, 4] }), 5);
  assert.equal(pasoExtraDebido({ ...base, ahora: en(355), enviados: [1, 2, 3, 4, 5], ultimoEnvio: en(340) }), 6);
  // después de los 15 días se sigue ofreciendo a US$20
  assert.equal(pasoExtraDebido({ ...base, ahora: en(24 * 18), enviados: [1, 2, 3, 4, 5, 6] }), 7);
  assert.equal(pasoExtraDebido({ ...base, ahora: en(24 * 101), enviados: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }), null);
  // espera mínima entre emails
  assert.equal(pasoExtraDebido({ ...base, ahora: en(24 * 18), ultimoEnvio: en(24 * 18 - 5) }), null);
});
