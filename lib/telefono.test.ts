import test from "node:test";
import assert from "node:assert/strict";
import { normalizarTelefono, telefonoValido } from "./telefono.ts";

test("acepta números con código de país", () => {
  assert.equal(normalizarTelefono("+595 981 123 456"), "595981123456");
  assert.equal(normalizarTelefono("+55 (45) 99999-8888"), "5545999998888");
  assert.equal(normalizarTelefono("0054 9 11 5555 1234"), "5491155551234");
  assert.equal(telefonoValido("+1 305 555 0123"), true);
});

test("rechaza códigos que no existen y números sin código", () => {
  assert.equal(telefonoValido("+696 12345678"), false);
  assert.equal(telefonoValido("0981 123 456"), false);
  assert.equal(telefonoValido("1234"), false);
  assert.equal(telefonoValido(""), false);
  assert.equal(telefonoValido("+595 981 123 456 789 000"), false);
});
