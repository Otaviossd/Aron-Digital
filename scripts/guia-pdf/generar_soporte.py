# -*- coding: utf-8 -*-
"""Genera el PDF individual: "Soporte, clases en vivo y comunidad" (para la aula del mismo nombre)."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_imagen_simple, pagina_checklist, pagina_cierre
from render import render_pdf

IMG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/shots"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-soporte-comunidad.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")
TOTAL = 3

paginas = []
paginas.append(pagina_portada(
    "Soporte, clases en vivo<br>y comunidad",
    "Nunca estás solo con una duda",
    "Esta guía te muestra las 3 formas de recibir ayuda y de conectar con Aaron y el resto de los alumnos: comentarios, clases en vivo y la comunidad.",
    LOGO, AARON,
))

paginas.append(pagina_checklist(
    1, TOTAL, "Preguntá en cada clase",
    "Debajo del video de cada clase vas a encontrar la pestaña «Comentarios».",
    [
        ("💬", "Dejá tu duda ahí mismo", "Escribile a Aaron tu pregunta sobre ese contenido puntual, sin perderte buscando en otro lado. Aaron (y otros alumnos) responden directamente ahí."),
        ("🎯", "Sé específico", "Mientras más específica sea tu pregunta (qué paso del corte, qué minuto del video), más rápido y mejor te van a poder ayudar."),
        ("📺", "Clases en vivo", "Aaron hace clases en vivo donde podés preguntar en el momento. Te avisamos por WhatsApp cuándo es la próxima, y las grabaciones quedan guardadas en la plataforma."),
    ],
    LOGO,
))

paginas.append(pagina_imagen_simple(
    2, TOTAL, "Chat de la comunidad",
    [
        "En <b>Comunidad</b> podés conversar con otros alumnos y con Aaron en un solo",
        "lugar, en tiempo real. Las respuestas de Aaron salen marcadas con el",
        "sello <b>Instructor</b>, bien distintas del resto, para que las encuentres fácil.",
    ],
    os.path.join(IMG, "6-comunidad.png"), LOGO,
    "Tocá el ícono de la foto (al lado de donde escribís) para mandar una foto de tu corte y mostrar tu avance, o para mostrar una duda puntual.",
))

paginas.append(pagina_cierre(
    "Nunca estás solo en el camino",
    "Guardá esta guía. Cualquier duda, usá los comentarios de la clase, el grupo de WhatsApp o la comunidad — siempre hay alguien para ayudarte.",
    LOGO,
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
