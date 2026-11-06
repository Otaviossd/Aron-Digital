import test from "node:test";
import assert from "node:assert/strict";
import { generarCertificadoPdf, textoHoras, fechaLarga } from "./certificado.ts";

test("horas en texto", () => {
  assert.equal(textoHoras(3), "3 horas");
  assert.equal(textoHoras(1), "1 hora");
  assert.equal(textoHoras(2.5), "2,5 horas");
  assert.equal(textoHoras(0.75), "45 minutos");
});

test("fecha larga en hora de Paraguay", () => {
  assert.equal(fechaLarga("2026-11-05T22:30:00-03:00"), "5 de noviembre de 2026");
  // 01:00 UTC del día 6 sigue siendo el 5 en Paraguay (UTC-3)
  assert.equal(fechaLarga("2026-11-06T01:00:00Z"), "5 de noviembre de 2026");
});

test("genera un PDF válido, también con nombres difíciles", async () => {
  for (const nombre of ["Ana María López", "José Ñandú Benítez", "Łukasz Müller 田中", "A".repeat(80)]) {
    const pdf = await generarCertificadoPdf({
      nombre,
      codigo: "LNO-AB12-CD34",
      emitidoAt: "2026-11-20T15:00:00Z",
      horas: 12.5,
      clases: 40,
      urlVerificacion: "https://www.lanuevaolaacademy.com/verificar/LNO-AB12-CD34",
    });
    assert.equal(Buffer.from(pdf.slice(0, 5)).toString(), "%PDF-");
    assert.ok(pdf.length > 3000);
  }
});
