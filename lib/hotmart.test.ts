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
