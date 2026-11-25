# -*- coding: utf-8 -*-
"""
Identidad visual para los PDFs de La Nueva Ola Academy: misma paleta, tipografía
y look (fondo oscuro, tarjetas "de vidrio", verde #39ff7e) que lanuevaolaacademy.com.

Uso: ver generar.py para un ejemplo completo. La idea es que cada guía nueva
solo tenga que armar una lista de "secciones" con "pasos" (título, texto, imagen)
y listo: la portada, el pie de página y el estilo salen siempre iguales.
"""

import base64
import os

AQUI = os.path.dirname(os.path.abspath(__file__))


def _b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def _font_b64():
    return _b64(os.path.join(AQUI, "assets", "Inter.woff2"))


def _img_b64(path):
    ext = path.rsplit(".", 1)[-1].lower()
    mime = {"png": "image/png", "webp": "image/webp", "jpg": "image/jpeg", "jpeg": "image/jpeg"}.get(ext, "image/png")
    return f"data:{mime};base64,{_b64(path)}"


CSS_BASE = """
@font-face {{
  font-family: "Inter";
  src: url(data:font/woff2;base64,{font_b64}) format("woff2-variations");
  font-weight: 100 900;
  font-display: block;
}}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
:root {{
  --bg: #07090a;
  --surface: #111112;
  --surface-2: #18181a;
  --ink: #f4f4f2;
  --muted: rgba(244,244,242,.62);
  --faint: rgba(244,244,242,.40);
  --line: rgba(255,255,255,.10);
  --line-strong: rgba(255,255,255,.20);
  --accent: #39ff7e;
  --accent-2: #b6ff5c;
}}
html, body {{ background: var(--bg); color: var(--ink); font-family: "Inter", "Inter Variable", ui-sans-serif, system-ui, sans-serif; letter-spacing: -0.011em; }}
@page {{ size: 210mm 297mm; margin: 0; }}
.pagina {{ width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; background: var(--bg); }}
.pagina:last-child {{ page-break-after: auto; }}

.glow {{ position: absolute; border-radius: 50%; filter: blur(60px); opacity: .22; pointer-events: none; }}

.texto-luz {{
  background: linear-gradient(100deg, var(--accent) 0%, var(--accent-2) 45%, var(--accent) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}}

.cristal {{
  background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015));
  border: 1px solid var(--line);
  border-radius: 20px;
}}

.pie {{
  position: absolute; left: 16mm; right: 16mm; bottom: 10mm;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 9px; color: var(--faint); border-top: 1px solid var(--line); padding-top: 4mm;
  letter-spacing: .02em;
}}
.pie .marca {{ display: flex; align-items: center; gap: 2mm; color: var(--muted); font-weight: 600; }}
.pie .marca img {{ height: 5mm; width: auto; opacity: .9; }}

.barra-top {{ position: absolute; top: 0; left: 0; right: 0; height: 3mm; background: linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent)); }}

.chip-numero {{
  width: 11mm; height: 11mm; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: #07090a; font-weight: 800; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}}

.marco-telefono {{
  border: 1px solid var(--line-strong);
  border-radius: 14mm;
  padding: 3mm;
  background: linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.01));
  box-shadow: 0 0 40px rgba(57,255,126,.08);
  display: inline-block;
}}
.marco-telefono img {{ display: block; border-radius: 11mm; max-width: 100%; }}
"""


def envolver(cuerpo_html, logo_path, aaron_path=None):
    """Arma el documento HTML completo (CSS + páginas) listo para imprimir a PDF."""
    font_b64 = _font_b64()
    css = CSS_BASE.format(font_b64=font_b64)
    logo_b64 = _img_b64(logo_path)
    aaron_b64 = _img_b64(aaron_path) if aaron_path else ""
    return f"""<!doctype html>
<html><head><meta charset="utf-8">
<style>{css}</style>
</head><body>
{cuerpo_html.replace("{{LOGO}}", logo_b64).replace("{{AARON}}", aaron_b64)}
</body></html>"""


def pagina_portada(titulo, subtitulo, bajada, logo_path, aaron_path):
    return f"""
<div class="pagina">
  <div class="glow" style="width:420px;height:420px;background:#39ff7e;top:-120px;right:-120px;"></div>
  <div class="glow" style="width:300px;height:300px;background:#b6ff5c;bottom:40px;left:-80px;"></div>
  <img src="{{{{AARON}}}}" style="position:absolute; right:-10mm; bottom:0; height:190mm; opacity:.96;" />
  <div style="position:absolute; top:22mm; left:18mm; right:18mm;">
    <img src="{{{{LOGO}}}}" style="height:11mm; margin-bottom:14mm;" />
    <div style="font-size:13px; letter-spacing:.14em; text-transform:uppercase; color:var(--accent); font-weight:700; margin-bottom:6mm;">La Nueva Ola Academy</div>
    <div style="font-size:40px; font-weight:800; line-height:1.08; max-width:140mm; color:var(--accent);">{titulo}</div>
    <div style="font-size:20px; font-weight:600; color:var(--ink); margin-top:4mm; max-width:130mm; line-height:1.3;">{subtitulo}</div>
    <div style="font-size:13px; color:var(--muted); margin-top:8mm; max-width:110mm; line-height:1.6;">{bajada}</div>
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> lanuevaolaacademy.com</span><span>Guía para alumnos</span></div>
</div>"""


def pagina_seccion(numero, titulo, descripcion, logo_path):
    return f"""
<div class="pagina">
  <div class="barra-top"></div>
  <div class="glow" style="width:320px;height:320px;background:#39ff7e;top:30%;left:50%;transform:translate(-50%,-50%);"></div>
  <div style="position:absolute; top:50%; left:18mm; right:18mm; transform:translateY(-50%);">
    <div style="font-size:14px; color:var(--accent); font-weight:700; letter-spacing:.08em; margin-bottom:4mm;">PARTE {numero}</div>
    <div style="font-size:34px; font-weight:800; line-height:1.15; max-width:150mm; color:var(--accent);">{titulo}</div>
    <div style="font-size:14px; color:var(--muted); margin-top:6mm; max-width:130mm; line-height:1.6;">{descripcion}</div>
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> La Nueva Ola Academy</span><span>Guía para alumnos</span></div>
</div>"""


def pagina_paso(numero, total, titulo, lineas_texto, imagen_path, logo_path, nota=None):
    texto_html = "".join(f'<p style="font-size:13px; color:var(--muted); line-height:1.65; margin-top:2.2mm;">{l}</p>' for l in lineas_texto)
    nota_html = f'''<div class="cristal" style="margin-top:8mm; padding:5mm 6mm; display:flex; gap:3mm; align-items:flex-start;">
      <span style="color:var(--accent); font-size:14px;">💡</span>
      <span style="font-size:12px; color:var(--muted); line-height:1.6;">{nota}</span>
    </div>''' if nota else ""
    img_b64 = _img_b64(imagen_path)
    return f"""
<div class="pagina">
  <div class="barra-top"></div>
  <div style="position:absolute; top:20mm; left:18mm; right:18mm; display:flex; gap:5mm; align-items:flex-start;">
    <div class="chip-numero">{numero}</div>
    <div style="flex:1;">
      <div style="font-size:11px; color:var(--faint); font-weight:600; letter-spacing:.04em; margin-bottom:1.5mm;">PASO {numero} DE {total}</div>
      <div style="font-size:21px; font-weight:800; color:var(--ink); line-height:1.2;">{titulo}</div>
      {texto_html}
      {nota_html}
    </div>
  </div>
  <div style="position:absolute; top:95mm; left:0; right:0; text-align:center;">
    <div class="marco-telefono"><img src="{img_b64}" style="height:150mm; width:auto;" /></div>
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> La Nueva Ola Academy</span><span>Paso {numero} de {total}</span></div>
</div>"""


def pagina_checklist(numero, total, titulo, intro, items, logo_path):
    """Página sin captura de teléfono: una idea por tarjeta, con número e ícono.
    items: lista de (icono_emoji, titulo_corto, texto)."""
    tarjetas = "".join(f'''
    <div class="cristal" style="padding:6mm 7mm; margin-top:4mm; display:flex; gap:4mm; align-items:flex-start;">
      <span style="font-size:20px; line-height:1;">{icono}</span>
      <div>
        <div style="font-size:14px; font-weight:700; color:var(--ink); margin-bottom:1.5mm;">{t}</div>
        <div style="font-size:12px; color:var(--muted); line-height:1.6;">{txt}</div>
      </div>
    </div>''' for icono, t, txt in items)
    intro_html = f'<div style="font-size:13px; color:var(--muted); line-height:1.65; max-width:160mm; margin-top:3mm;">{intro}</div>' if intro else ""
    return f"""
<div class="pagina">
  <div class="barra-top"></div>
  <div style="position:absolute; top:20mm; left:18mm; right:18mm;">
    <div style="display:flex; gap:5mm; align-items:flex-start;">
      <div class="chip-numero">{numero}</div>
      <div style="flex:1;">
        <div style="font-size:11px; color:var(--faint); font-weight:600; letter-spacing:.04em; margin-bottom:1.5mm;">PASO {numero} DE {total}</div>
        <div style="font-size:21px; font-weight:800; color:var(--ink); line-height:1.2;">{titulo}</div>
        {intro_html}
      </div>
    </div>
    {tarjetas}
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> La Nueva Ola Academy</span><span>Paso {numero} de {total}</span></div>
</div>"""


def pagina_imagen_simple(numero, total, titulo, lineas_texto, imagen_path, logo_path, nota=None, top_imagen="88mm", max_width="182mm", max_height="172mm"):
    """Como pagina_paso, pero la imagen entra completa sin moldura de teléfono
    (útil para portadas de clase, capturas de escritorio, infografías horizontales, etc.)."""
    texto_html = "".join(f'<p style="font-size:13px; color:var(--muted); line-height:1.65; margin-top:2.2mm;">{l}</p>' for l in lineas_texto)
    nota_html = f'''<div class="cristal" style="margin-top:6mm; padding:5mm 6mm; display:flex; gap:3mm; align-items:flex-start;">
      <span style="color:var(--accent); font-size:14px;">💡</span>
      <span style="font-size:12px; color:var(--muted); line-height:1.6;">{nota}</span>
    </div>''' if nota else ""
    img_b64 = _img_b64(imagen_path)
    return f"""
<div class="pagina">
  <div class="barra-top"></div>
  <div style="position:absolute; top:20mm; left:18mm; right:18mm; display:flex; gap:5mm; align-items:flex-start;">
    <div class="chip-numero">{numero}</div>
    <div style="flex:1;">
      <div style="font-size:11px; color:var(--faint); font-weight:600; letter-spacing:.04em; margin-bottom:1.5mm;">PASO {numero} DE {total}</div>
      <div style="font-size:21px; font-weight:800; color:var(--ink); line-height:1.2;">{titulo}</div>
      {texto_html}
      {nota_html}
    </div>
  </div>
  <div style="position:absolute; top:{top_imagen}; left:14mm; right:14mm; bottom:22mm; display:flex; align-items:center; justify-content:center;">
    <img src="{img_b64}" style="max-height:{max_height}; max-width:{max_width}; width:100%; object-fit:contain; border-radius:5mm; border:1px solid var(--line-strong); box-shadow:0 20px 60px -20px rgba(0,0,0,.6);" />
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> La Nueva Ola Academy</span><span>Paso {numero} de {total}</span></div>
</div>"""


def pagina_cierre(titulo, texto, logo_path, boton=None, boton_url=None, icono="✅"):
    """boton/boton_url opcionales: agrega un botón-enlace real (clickeable en el PDF)."""
    boton_html = (
        f'<a href="{boton_url}" style="display:inline-block; margin-top:10mm; background:linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%); '
        f'color:#07090a; font-weight:800; font-size:14px; padding:5mm 10mm; border-radius:999px; text-decoration:none;">{boton} →</a>'
        if boton and boton_url
        else ""
    )
    return f"""
<div class="pagina">
  <div class="barra-top"></div>
  <div class="glow" style="width:360px;height:360px;background:#39ff7e;top:40%;left:50%;transform:translate(-50%,-50%);"></div>
  <div style="position:absolute; top:50%; left:18mm; right:18mm; transform:translateY(-50%); text-align:center;">
    <div style="font-size:30px;">{icono}</div>
    <div style="font-size:28px; font-weight:800; margin-top:6mm; color:var(--accent);">{titulo}</div>
    <div style="font-size:14px; color:var(--muted); margin-top:6mm; max-width:120mm; margin-left:auto; margin-right:auto; line-height:1.6;">{texto}</div>
    {boton_html}
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> La Nueva Ola Academy</span><span>lanuevaolaacademy.com</span></div>
</div>"""


def pagina_texto(numero, total, titulo, bloques, logo_path, boton=None, boton_url=None):
    """Página solo de texto (sin captura): título + varios bloques (cada uno con encabezado y
    cuerpo, o solo cuerpo), para explicaciones, condiciones o una oferta. Opcionalmente, un botón-
    enlace real al final (clickeable en el PDF)."""
    partes = []
    for b in bloques:
        if isinstance(b, tuple):
            cab, cuerpo = b
            partes.append(
                f'<div class="cristal" style="padding:6mm 7mm; margin-top:4mm;">'
                f'<div style="font-size:14px; font-weight:700; color:var(--accent); margin-bottom:2mm;">{cab}</div>'
                f'<div style="font-size:13px; color:var(--muted); line-height:1.7;">{cuerpo}</div></div>'
            )
        else:
            partes.append(f'<p style="font-size:14px; color:var(--muted); line-height:1.75; margin-top:4mm;">{b}</p>')
    bloques_html = "".join(partes)
    boton_html = (
        f'<a href="{boton_url}" style="display:inline-block; margin-top:7mm; background:linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%); '
        f'color:#07090a; font-weight:800; font-size:14px; padding:5mm 10mm; border-radius:999px; text-decoration:none;">{boton} →</a>'
        if boton and boton_url
        else ""
    )
    return f"""
<div class="pagina">
  <div class="barra-top"></div>
  <div style="position:absolute; top:20mm; left:18mm; right:18mm;">
    <div style="display:flex; gap:5mm; align-items:flex-start;">
      <div class="chip-numero">{numero}</div>
      <div style="flex:1;">
        <div style="font-size:11px; color:var(--faint); font-weight:600; letter-spacing:.04em; margin-bottom:1.5mm;">{numero} DE {total}</div>
        <div style="font-size:22px; font-weight:800; color:var(--ink); line-height:1.2;">{titulo}</div>
      </div>
    </div>
    {bloques_html}
    {boton_html}
  </div>
  <div class="pie"><span class="marca"><img src="{{{{LOGO}}}}" /> La Nueva Ola Academy</span><span>{numero} de {total}</span></div>
</div>"""
