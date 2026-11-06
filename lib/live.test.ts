import test from "node:test";
import assert from "node:assert/strict";
import { cuentaAtras, desdeHoraParaguay, cuando } from "./live.ts";

test("cuenta regresiva", () => {
  assert.equal(cuentaAtras(125), "2 min 05 s");
  assert.equal(cuentaAtras(3725), "1 h 02 min");
  assert.equal(cuentaAtras(90061), "1 d 01 h");
  assert.equal(cuentaAtras(-5), "0 min 00 s");
});

test("hora de Paraguay a UTC", () => {
  assert.equal(desdeHoraParaguay("2026-11-16T20:00"), "2026-11-16T23:00:00.000Z");
  assert.equal(desdeHoraParaguay("mañana"), null);
  assert.equal(desdeHoraParaguay("2026-13-40T99:00"), null);
});

test("fecha legible", () => {
  assert.match(cuando("2026-11-16T23:00:00Z"), /16 de noviembre · 20:00 \(hora de Paraguay\)/);
});
