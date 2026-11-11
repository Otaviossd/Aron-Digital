import test from "node:test";
import assert from "node:assert/strict";
import { PASOS_CAPTURA, hayPasoVigente, pasoCapturaDebido } from "./sequence-captura.ts";

const t = (s: string) => new Date(s);
const base = { enviados: [] as number[], compro: false, baja: false };

test("calendario: 10 emails de captura, aviso de cambio, 2 recordatorios y 4 del lanzamiento (sábado 14)", () => {
  assert.equal(PASOS_CAPTURA.filter((p) => p.fase === "pre").length, 13);
  assert.equal(PASOS_CAPTURA.filter((p) => p.fase === "lanzamiento").length, 4);
  assert.equal(PASOS_CAPTURA.find((p) => p.id === "L1")?.sendAt, "2026-11-14T09:00:00-03:00");
  assert.equal(new Set(PASOS_CAPTURA.map((p) => p.step)).size, PASOS_CAPTURA.length);
  const orden = PASOS_CAPTURA.map((p) => new Date(p.sendAt).getTime());
  assert.deepEqual(orden, [...orden].sort((a, b) => a - b));
});

test("sale cada email a su hora y una sola vez", () => {
  const creadoEn = t("2026-11-05T19:00:00-03:00");
  assert.equal(pasoCapturaDebido({ ...base, creadoEn, ahora: t("2026-11-06T08:59:00-03:00") }), null);
  assert.equal(pasoCapturaDebido({ ...base, creadoEn, ahora: t("2026-11-06T09:10:00-03:00") }), 1);
  assert.equal(pasoCapturaDebido({ ...base, creadoEn, ahora: t("2026-11-06T09:10:00-03:00"), enviados: [1] }), null);
  assert.equal(pasoCapturaDebido({ ...base, creadoEn, ahora: t("2026-11-06T19:20:00-03:00"), enviados: [1] }), 2);
});

test("quien se anota tarde solo recibe los que faltan; compra o baja cortan todo", () => {
  const tarde = t("2026-11-08T12:00:00-03:00");
  assert.equal(pasoCapturaDebido({ ...base, creadoEn: tarde, ahora: t("2026-11-08T09:30:00-03:00") }), null);
  assert.equal(pasoCapturaDebido({ ...base, creadoEn: tarde, ahora: t("2026-11-08T19:15:00-03:00") }), 6);
  assert.equal(pasoCapturaDebido({ ...base, creadoEn: t("2026-11-05T10:00:00-03:00"), ahora: t("2026-11-11T09:05:00-03:00"), compro: true }), null);
  assert.equal(pasoCapturaDebido({ ...base, creadoEn: t("2026-11-05T10:00:00-03:00"), ahora: t("2026-11-11T09:05:00-03:00"), baja: true }), null);
});

test("si el agendador falla, un email viejo no sale", () => {
  const creadoEn = t("2026-11-05T10:00:00-03:00");
  assert.equal(pasoCapturaDebido({ ...base, creadoEn, ahora: t("2026-11-07T08:00:00-03:00"), enviados: [1, 2] }), null);
  assert.equal(hayPasoVigente(t("2026-11-12T15:00:00-03:00")), false);
  assert.equal(hayPasoVigente(t("2026-11-11T09:05:00-03:00")), true);
  // dos vencidos a la vez: solo el más reciente
  assert.equal(pasoCapturaDebido({ ...base, creadoEn, ahora: t("2026-11-06T19:30:00-03:00") }), 2);
});
