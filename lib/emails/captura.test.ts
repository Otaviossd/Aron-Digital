import test from "node:test";
import assert from "node:assert/strict";
import { fichasCaptura, plantillaCaptura } from "./captura.ts";
import { PASOS_CAPTURA } from "../sequence-captura.ts";

const ctx = { siteUrl: "https://www.lanuevaolaacademy.com", email: "a@b.com", nombre: "Ana López", bajaUrl: "https://x/baja?t=1", marca: "LNO" };

test("los 19 emails de captura se arman con baja y sin valores rotos", () => {
  assert.equal(fichasCaptura().length, 19);
  for (const p of PASOS_CAPTURA) {
    const { asunto, html } = plantillaCaptura(p.id, ctx);
    assert.ok(asunto.length > 8, p.id);
    assert.ok(html.includes(ctx.bajaUrl), `baja ${p.id}`);
    assert.ok(!html.includes("undefined") && !html.includes("NaN"), `valores ${p.id}`);
  }
});

test("el anuncio de apertura lleva a /ventas con el email y deja claro 50% OFF para los primeros 50", () => {
  const { asunto, html } = plantillaCaptura("L1", ctx);
  assert.match(asunto, /50% OFF/);
  assert.match(html, /ventas\?email=a%40b\.com&amp;nombre=Ana\+L%C3%B3pez#comprar|ventas\?email=a%40b\.com&nombre=Ana\+L%C3%B3pez#comprar/);
  assert.match(html, /primeros 50/);
  assert.match(html, /vitalicio/);
});
