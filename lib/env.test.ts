import test from "node:test";
import assert from "node:assert/strict";
import { envLimpio } from "./env.ts";

test("remove espaços, vírgula final e aspas", () => {
  assert.equal(envLimpio('  eyJabc.def.ghi      ,'), "eyJabc.def.ghi");
  assert.equal(envLimpio('"https://x.supabase.co",'), "https://x.supabase.co");
  assert.equal(envLimpio("'https://x.supabase.co'\n"), "https://x.supabase.co");
});
test("vazio vira undefined", () => {
  assert.equal(envLimpio(undefined), undefined);
  assert.equal(envLimpio("   ,  "), undefined);
});
test("valor correto fica igual", () => {
  assert.equal(envLimpio("eyJa.b-c_d.e"), "eyJa.b-c_d.e");
});
