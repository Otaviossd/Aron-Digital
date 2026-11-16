# -*- coding: utf-8 -*-
"""Genera el PDF: "Cómo funciona la plataforma, clases bloqueadas y comunidad"."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_seccion, pagina_paso, pagina_cierre
from render import render_pdf

IMG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pdfimgs"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-plataforma.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")

paginas = []
paginas.append(pagina_portada(
    "Cómo funciona la plataforma",
    "Módulos, clases, comunidad y bonos",
    "Guía rápida para recorrer el curso sin perderte nada: desde tu inicio hasta cuándo se abren los bonos.",
    LOGO, AARON,
))

paginas.append(pagina_seccion(1, "Cómo funciona la plataforma", "Tu inicio, tus módulos y tus clases, en tres pantallas.", LOGO))
pasos1 = [
    ("Tu inicio", ["Arriba de todo seguís donde quedaste. Más abajo tenés accesos", "directos a Clases en vivo, Comunidad y tu Certificado."], "p-inicio.png", None),
    ("Elegí un módulo", ["Cada módulo muestra cuántas clases tiene y tu progreso.", "Tocalo para ver la lista de clases adentro."], "p-modulo1.png", None),
    ("Adentro de una clase", ["Mirá el video, marcalo como «Completada» y pasá a la", "siguiente clase con los botones de abajo."], "p-clase.png", None),
]
for i, (t, txt, img, nota) in enumerate(pasos1, start=1):
    paginas.append(pagina_paso(i, 8, t, txt, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_seccion(2, "Clases bloqueadas y módulos bonus", "Algunos contenidos se abren solos con el tiempo.", LOGO))
pasos2 = [
    ("Los módulos con candado", ["En «Todos los módulos» vas a ver cuáles ya están", "disponibles y cuáles todavía no."], "p-modulos-candado.png", None),
    ("Los bonos se liberan solos", ["Los bonos (como «Bono: Color» o «Bono: Mindset») se", "abren automáticamente a los días de tu acceso."], "p-bonos.png", "No hay que hacer nada: el día que se cumple el plazo, el candado desaparece solo."),
]
for i, (t, txt, img, nota) in enumerate(pasos2, start=4):
    paginas.append(pagina_paso(i, 8, t, txt, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_seccion(3, "Soporte, clases en vivo y comunidad", "Nunca estás solo/a con una duda.", LOGO))
pasos3 = [
    ("Preguntá en cada clase", ["Debajo del video, en la pestaña «Comentarios», podés", "escribirle tu duda a Aaron sobre esa clase puntual."], "p-comentarios.png", None),
    ("Sumate al grupo de WhatsApp", ["Buscá el enlace en la clase «Soporte, clases en vivo y", "comunidad» para unirte a la comunidad."], "wa-invite.png", None),
]
for i, (t, txt, img, nota) in enumerate(pasos3, start=6):
    paginas.append(pagina_paso(i, 8, t, txt, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_cierre("Ya conocés toda la plataforma", "Cualquier duda, preguntá en los comentarios de la clase o en el grupo de WhatsApp.", LOGO))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
