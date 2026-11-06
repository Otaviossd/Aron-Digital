import test from "node:test";
import assert from "node:assert/strict";
import { aEmbed, esArchivoDeVideo } from "./video.ts";

test("YouTube en todas sus formas", () => {
  const esperado = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1";
  assert.equal(aEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), esperado);
  assert.equal(aEmbed("https://youtu.be/dQw4w9WgXcQ?si=abc"), esperado);
  assert.equal(aEmbed("https://www.youtube.com/live/dQw4w9WgXcQ?feature=share"), esperado);
  assert.equal(aEmbed("https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10"), esperado);
  assert.equal(aEmbed("https://www.youtube.com/embed/dQw4w9WgXcQ"), esperado);
});

test("Vimeo y enlaces propios", () => {
  assert.equal(aEmbed("https://vimeo.com/123456789"), "https://player.vimeo.com/video/123456789");
  assert.equal(aEmbed("https://player.vimeo.com/video/123?h=abc"), "https://player.vimeo.com/video/123?h=abc");
  assert.equal(aEmbed("https://cdn.ejemplo.com/clase.mp4"), "https://cdn.ejemplo.com/clase.mp4");
});

test("rechaza lo que no es un enlace", () => {
  assert.equal(aEmbed(""), null);
  assert.equal(aEmbed(null), null);
  assert.equal(aEmbed("hola"), null);
  assert.equal(aEmbed("javascript:alert(1)"), null);
  assert.equal(aEmbed("https://www.youtube.com/watch?v=corto"), "https://www.youtube.com/watch?v=corto");
});

test("detecta archivos de video", () => {
  assert.equal(esArchivoDeVideo("https://x.com/a.mp4?token=1"), true);
  assert.equal(esArchivoDeVideo("https://youtube.com/embed/abc"), false);
  assert.equal(esArchivoDeVideo(null), false);
});
