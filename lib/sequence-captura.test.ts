import test from "node:test";
import assert from "node:assert/strict";
import { PASOS_CAPTURA, hayPasoVigente, pasoCapturaDebido } from "./sequence-captura.ts";

const t = (s: string) => new Date(s);
const base = { enviados: [] as number[], compro: false, baja: false };

test("calendario: 10 emails previos (2 por día, 6 al 10) y 4 del lanzamiento", () => {
  assert.equal(PASOS_CAPTURA.filter((p) => p.fase === "pre").length, 10);
  assert.equal(PASOS_CAPTURA.filter((p) => p.fase === "lanzamiento").length, 4);
  const porDia = new Map<string, number>();
  for (const p of PASOS_CAPTURA.filter((x) => x.fase === "pre")) porDia.set(p.sendAt.slice(0, 10), (porDia.get(p.sendAt.slice(0, 10)) ?? 0) + 1);
  assert.deepEqual([...porDia.values()], [2, 2, 2, 2, 2]);
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
