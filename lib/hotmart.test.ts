import test from "node:test";
import assert from "node:assert/strict";
import { hottokValido, leerCompra, planDeCompra } from "./hotmart.ts";

const env = { HOTMART_OFFER_PROMO: "p1", HOTMART_OFFER_VITALICIO: "v1", HOTMART_OFFER_ANUAL: "a1" };

test("hottok: igual pasa, distinto o vacío no", () => {
  assert.equal(hottokValido("abc", "abc"), true);
  assert.equal(hottokValido("abd", "abc"), false);
  assert.equal(hottokValido(null, "abc"), false);
  assert.equal(hottokValido("abc", undefined), false);
});

test("plan por código de oferta", () => {
  assert.deepEqual(planDeCompra("p1", 25, env), { plan: "lifetime", promo: true });
  assert.deepEqual(planDeCompra("v1", 70, env), { plan: "lifetime", promo: false });
  assert.deepEqual(planDeCompra("a1", 50, env), { plan: "annual", promo: false });
});

test("plan por precio si el código no coincide", () => {
  assert.deepEqual(planDeCompra("x", 25, {}), { plan: "lifetime", promo: true });
  assert.deepEqual(planDeCompra("x", 70, {}), { plan: "lifetime", promo: false });
  assert.deepEqual(planDeCompra(undefined, 50, {}), { plan: "annual", promo: false });
});

test("leerCompra extrae email en minúsculas y transacción", () => {
  const c = leerCompra({ data: { buyer: { email: " Ana@X.com ", name: "Ana", checkout_phone: "595981" }, purchase: { transaction: "HP1", price: { value: 25 }, offer: { code: "p1" } } } }, env);
  assert.equal(c?.email, "ana@x.com");
  assert.equal(c?.plan, "lifetime");
  assert.equal(c?.promo, true);
  assert.equal(leerCompra({ data: { buyer: {}, purchase: {} } }, env), null);
});

test("clase extra de US$20 u US$10 no crea acceso al curso", () => {
  const mk = (price: number, extra: Record<string, unknown> = {}) => ({ data: { buyer: { email: "a@x.com" }, product: { id: 999 }, purchase: { transaction: "HP2", price: { value: price }, offer: { code: "zzz" } }, ...extra } });
  assert.equal(leerCompra(mk(20), env)?.extra, true);
  assert.equal(leerCompra(mk(10), env)?.extra, true);
  assert.equal(leerCompra(mk(50, {}), { ...env, HOTMART_PRODUCT_EXTRA: "999" })?.extra, true);
  // un plan nunca es extra, aunque cueste poco por un cupón
  const plan = { data: { buyer: { email: "a@x.com" }, purchase: { transaction: "HP3", price: { value: 20 }, offer: { code: "p1" } } } };
  assert.equal(leerCompra(plan, env)?.extra, false);
});

test("códigos de oferta por defecto: la promo de US$25 se reconoce sin variables de entorno", async () => {
  const { entornoHotmart } = await import("./hotmart.ts");
  const e = entornoHotmart({});
  const c = leerCompra({ data: { buyer: { email: "a@x.com" }, purchase: { transaction: "HP9", price: { value: 25 }, offer: { code: "zpu4tvlu" } } } }, e);
  assert.equal(c?.plan, "lifetime");
  assert.equal(c?.promo, true);
  assert.equal(c?.extra, false);
});
