# -*- coding: utf-8 -*-
"""Genera el PDF individual: "Cómo funciona la plataforma" (para la aula del mismo nombre)."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_imagen_simple, pagina_checklist, pagina_cierre
from render import render_pdf

IMG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/shots"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-plataforma.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")
TOTAL = 6

paginas = []
paginas.append(pagina_portada(
    "Cómo funciona la plataforma",
    "Módulos, clases y certificado",
    "Esta guía te lleva por toda la plataforma para que le saques el jugo completo desde el primer día, sin perderte nada en el camino.",
    LOGO, AARON,
))

paginas.append(pagina_imagen_simple(
    1, TOTAL, "Tu inicio",
    [
        "Arriba de todo seguís exactamente donde quedaste la última vez: la plataforma",
        "recuerda tu progreso clase por clase, así que nunca empezás de cero.",
        "Más abajo tenés accesos directos a <b>Clases en vivo</b>, <b>Comunidad</b> y tu <b>Certificado</b>.",
    ],
    os.path.join(IMG, "1-home.png"), LOGO,
    "Guardá esta página en tus favoritos del celular: es tu punto de partida cada vez que entrás a estudiar.",
))

paginas.append(pagina_imagen_simple(
    2, TOTAL, "Elegí un módulo",
    [
        "El curso está dividido en módulos, y cada tarjeta te muestra de un vistazo",
        "cuántas clases tiene adentro y cuánto ya avanzaste.",
        "Los que tienen un candado todavía no se abrieron: se liberan solos con el",
        "tiempo, como vas a ver en la próxima página.",
    ],
    os.path.join(IMG, "2-modulos.png"), LOGO,
    "No hace falta terminar un módulo entero de una sentada: podés entrar y salir las veces que quieras.",
))

paginas.append(pagina_checklist(
    3, TOTAL, "Clases bloqueadas y módulos bonus",
    "Esto es intencional: el curso se arma en un orden pensado para que cada módulo tenga más sentido después de haber visto el anterior.",
    [
        ("🔒", "Los módulos con candado", "Se abren automáticamente a partir de cierta cantidad de días desde tu acceso. No hay que hacer nada: el candado desaparece solo."),
        ("🎁", "Los bonos se liberan a los 7 días", "Los módulos bonus (como Color o Mentalidad) son contenido extra para cuando ya tenés una base, y se abren solos sin pagar nada de más."),
        ("📚", "El módulo extra", "Cómo crecer en redes sociales como barbero: un módulo aparte, con su propia clase dentro de la plataforma."),
    ],
    LOGO,
))

paginas.append(pagina_imagen_simple(
    4, TOTAL, "Adentro del Módulo 1",
    [
        "Cada módulo lista sus clases en orden. Mirá el video con atención (podés",
        "pausarlo y repetir las veces que necesites), y cuando termines tocá",
        "<b>«Completada»</b> para que tu progreso quede guardado.",
    ],
    os.path.join(IMG, "4-modulo1-lista.png"), LOGO,
    None,
))

paginas.append(pagina_imagen_simple(
    5, TOTAL, "Adentro del Módulo 2",
    [
        "La misma lógica se repite en cada módulo que vayas abriendo: clases en",
        "orden, de arriba hacia abajo, cada una con su número y su nombre bien claro.",
    ],
    os.path.join(IMG, "5-modulo2-lista.png"), LOGO,
    None,
))

paginas.append(pagina_cierre(
    "Ya conocés toda la plataforma",
    "Guardá esta guía: podés volver a leerla cuando quieras. Y cualquier duda, preguntá en los comentarios de la clase o en el grupo de WhatsApp — siempre hay alguien para ayudarte.",
    LOGO,
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
