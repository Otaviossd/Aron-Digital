# Identidad de PDFs — La Nueva Ola Academy

Genera guías/PDFs con el mismo look del sitio (fondo oscuro, verde #39ff7e,
tipografía Inter, tarjetas de vidrio) y la foto de Aaron en la portada.

## Cómo generar una guía nueva

1. Juntá las capturas/imágenes que vas a usar en una carpeta (teléfono, ideal 480x900 o similar).
2. Copiá `generar_entrar.py` como base: armá la lista de "pasos" (título, 1-2 líneas
   de texto, nombre de la imagen, nota opcional) separados en "secciones".
3. Corré: `python3 scripts/guia-pdf/tu_script.py <carpeta-de-imagenes> <salida.pdf>`

## Piezas reutilizables (`plantilla.py`)

- `pagina_portada(titulo, subtitulo, bajada, logo, foto_aaron)`
- `pagina_seccion(numero, titulo, descripcion, logo)`
- `pagina_paso(numero, total, titulo, [lineas], imagen, logo, nota=None)`
- `pagina_cierre(titulo, texto, logo)`

Todas devuelven un `<div class="pagina">...</div>`; juntalas con `envolver(...)`
y renderizalas con `render.render_pdf(html, salida.pdf)` (usa Playwright/Chromium,
A4, con el logo y la foto de Aaron ya insertados).

La fuente (Inter variable) va embebida en base64 dentro de `assets/Inter.woff2`,
así el PDF no depende de fuentes del sistema.
