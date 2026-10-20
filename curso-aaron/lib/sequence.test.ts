import test from "node:test";
import assert from "node:assert/strict";
import { pasoDebido } from "./sequence.ts";

const t0 = new Date("2026-11-01T12:00:00Z");
const despues = (h: number) => new Date(t0.getTime() + h * 3600000);
const base = { createdAt: t0, enviados: [] as number[], convertedAt: null, unsubscribedAt: null };

test("antes de 1 hora: nada", () => {
  assert.equal(pasoDebido({ ...base, now: despues(0.5) }), null);
});
test("a la 1 hora: etapa 1", () => {
  assert.equal(pasoDebido({ ...base, now: despues(1) }), 1);
  assert.equal(pasoDebido({ ...base, now: despues(2) }), 1);
});
test("etapa 1 ya enviada: espera las 24 h", () => {
  assert.equal(pasoDebido({ ...base, now: despues(5), enviados: [1] }), null);
});
test("a las 24 h con la 1 enviada: etapa 2", () => {
  assert.equal(pasoDebido({ ...base, now: despues(25), enviados: [1] }), 2);
});
test("agendador atrasado: salta la etapa perdida en vez de mandar dos", () => {
  assert.equal(pasoDebido({ ...base, now: despues(30) }), 2);
});
test("a las 48 h con 1 y 2 enviadas: etapa 3", () => {
  assert.equal(pasoDebido({ ...base, now: despues(50), enviados: [1, 2] }), 3);
});
test("todo enviado: nada", () => {
  assert.equal(pasoDebido({ ...base, now: despues(60), enviados: [1, 2, 3] }), null);
});
test("no manda una etapa anterior a una ya enviada", () => {
  assert.equal(pasoDebido({ ...base, now: despues(30), enviados: [3] }), null);
});
test("compró: nada", () => {
  assert.equal(pasoDebido({ ...base, now: despues(30), convertedAt: despues(3) }), null);
});
test("se dio de baja: nada", () => {
  assert.equal(pasoDebido({ ...base, now: despues(30), unsubscribedAt: despues(3) }), null);
});
test("más de 7 días: nada", () => {
  assert.equal(pasoDebido({ ...base, now: despues(24 * 8) }), null);
});
