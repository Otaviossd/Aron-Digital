import test from "node:test";
import assert from "node:assert/strict";
import { armarHilos, hace, iniciales, type Comentario } from "./comentarios.ts";

const base = { autor_nombre: "x", autor_avatar: null, es_instructor: false, es_mio: false, fijado: false, likes: 0, yo_di_like: false, cuerpo: "c" };
const c = (id: string, parent_id: string | null, created_at: string, extra: Partial<Comentario> = {}): Comentario => ({ ...base, id, parent_id, created_at, ...extra });

test("agrupa respuestas bajo su comentario y ordena", () => {
  const hilos = armarHilos([
    c("a", null, "2026-11-10T10:00:00Z"),
    c("b", null, "2026-11-11T10:00:00Z"),
    c("r2", "a", "2026-11-10T12:00:00Z"),
    c("r1", "a", "2026-11-10T11:00:00Z"),
    c("fijo", null, "2026-11-01T10:00:00Z", { fijado: true }),
  ]);
  assert.deepEqual(hilos.map((h) => h.id), ["fijo", "b", "a"]);
  assert.deepEqual(hilos[2].respuestas.map((r) => r.id), ["r1", "r2"]);
});

test("tiempos relativos", () => {
  const ahora = new Date("2026-11-11T12:00:00Z").getTime();
  assert.equal(hace("2026-11-11T11:59:50Z", ahora), "ahora");
  assert.equal(hace("2026-11-11T11:55:00Z", ahora), "hace 5 min");
  assert.equal(hace("2026-11-11T09:00:00Z", ahora), "hace 3 h");
  assert.equal(hace("2026-11-09T12:00:00Z", ahora), "hace 2 d");
});

test("iniciales", () => {
  assert.equal(iniciales("Aaron Dalla Rosa"), "AR");
  assert.equal(iniciales("beto"), "B");
  assert.equal(iniciales("  "), "?");
});
