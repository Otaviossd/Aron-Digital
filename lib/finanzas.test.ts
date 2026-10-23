import test from "node:test";
import assert from "node:assert/strict";
import { calcularFinanzas, calcularLinea } from "./finanzas.ts";
import { leerMontos } from "./hotmart.ts";

const base = { email: "a@x.com", purchased_at: "2026-10-01T00:00:00Z", refunded_at: null };

test("venta con datos reales de la Hotmart: usa tarifa y reparto informados", () => {
  const l = calcularLinea({ plan: "lifetime", promo: false, gross_amount: 70, currency: "USD", fee_amount: 7.43, producer_amount: 31.28, coproducer_amount: 31.29 });
  assert.equal(l.bruto, 70);
  assert.equal(l.tarifa, 7.43);
  assert.equal(l.neto, 62.57);
  assert.equal(l.productor, 31.28);
  assert.equal(l.coproductor, 31.29);
  assert.equal(l.estimada, false);
});

test("venta sin montos: estima con precio de lista y lo marca", () => {
  const l = calcularLinea({ plan: "lifetime", promo: true });
  assert.equal(l.bruto, 25);
  assert.equal(l.tarifa, 2.98); // 9.9% de 25 + 0.50
  assert.equal(l.estimada, true);
});

test("reembolsada: no queda neto ni tarifa", () => {
  const l = calcularLinea({ plan: "annual", promo: false, gross_amount: 50, currency: "USD", refunded_at: "2026-10-05" });
  assert.equal(l.neto, 0);
  assert.equal(l.bruto, 50);
});

test("finanzas: CAC, ganancia real y reembolsos", () => {
  const compras = [
    { ...base, plan: "lifetime", promo: false, gross_amount: 70, currency: "USD", fee_amount: 7.43 },
    { ...base, plan: "annual", promo: false, gross_amount: 50, currency: "USD", fee_amount: 5.45 },
    { ...base, plan: "annual", promo: false, gross_amount: 50, currency: "USD", fee_amount: 5.45, refunded_at: "2026-10-03" },
  ];
  const f = calcularFinanzas(compras, [], [{ spent_on: "2026-10-01", platform: "Meta", amount_usd: "30.00" }], 12);
  assert.equal(f.ventas, 3);
  assert.equal(f.alumnos, 2);
  assert.equal(f.bruto, 170);
  assert.equal(f.reembolsos, 50);
  assert.equal(f.tarifas, 12.88);
  assert.equal(f.neto, 107.12);
  assert.equal(f.gasto, 30);
  assert.equal(f.cac, 15);
  assert.equal(f.costoPorLead, 2.5);
  assert.equal(f.gananciaReal, 77.12);
});

test("sin ventas no divide por cero", () => {
  const f = calcularFinanzas([], [], [{ spent_on: "2026-10-01", platform: "Meta", amount_usd: 20 }], 0);
  assert.equal(f.cac, null);
  assert.equal(f.gananciaReal, -20);
  assert.equal(f.roas, 0);
});

test("leerMontos: suma comisiones por origen y descarta moneda distinta", () => {
  const payload = { data: { purchase: { price: { value: 70, currency_value: "USD" } }, commissions: [
    { value: 7.43, source: "MARKETPLACE", currency_value: "USD" },
    { value: 31.28, source: "PRODUCER", currency_value: "USD" },
    { value: 31.29, source: "COPRODUCER", currency_value: "USD" },
  ] } };
  assert.deepEqual(leerMontos(payload), { bruto: 70, moneda: "USD", tarifa: 7.43, productor: 31.28, coproductor: 31.29, afiliado: null });
  const otra = { data: { purchase: { price: { value: 70, currency_value: "USD" } }, commissions: [{ value: 40, source: "MARKETPLACE", currency_value: "BRL" }] } };
  assert.equal(leerMontos(otra).tarifa, null);
  assert.equal(leerMontos({}).bruto, null);
});
