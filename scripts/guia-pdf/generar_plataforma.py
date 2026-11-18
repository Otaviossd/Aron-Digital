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
    "Esta guía es un extra del curso: te lleva paso a paso por toda la plataforma para que le saques el jugo completo desde el primer día, sin perderte nada en el camino.",
    LOGO, AARON,
))

paginas.append(pagina_seccion(1, "Cómo funciona la plataforma", "Tu inicio, tus módulos y tus clases, en tres pantallas.", LOGO))
pasos1 = [
    (
        "Tu inicio",
        [
            "Arriba de todo seguís exactamente donde quedaste la última vez: la plataforma",
            "recuerda tu progreso clase por clase, así que nunca empezás de cero.",
            "Más abajo tenés accesos directos a <b>Clases en vivo</b>, <b>Comunidad</b> y tu",
            "<b>Certificado</b>, todo a un toque de distancia.",
        ],
        "p-inicio.png",
        "Guardá esta página en tus favoritos del celular: es tu punto de partida cada vez que entrás a estudiar.",
    ),
    (
        "Elegí un módulo",
        [
            "El curso está dividido en módulos, y cada tarjeta te muestra de un vistazo",
            "cuántas clases tiene adentro y cuánto ya avanzaste.",
            "Tocá un módulo para abrir la lista completa de clases y arrancar (o continuar)",
            "por donde la dejaste.",
        ],
        "p-modulo1.png",
        "No hace falta terminar un módulo entero de una sentada: podés entrar y salir las veces que quieras.",
    ),
    (
        "Adentro de una clase",
        [
            "Mirá el video con atención (podés pausarlo y repetir las veces que necesites),",
            "y cuando termines tocá «Completada» para que tu progreso quede guardado.",
            "Los botones de abajo te llevan directo a la clase siguiente, sin tener que",
            "volver al módulo cada vez.",
        ],
        "p-clase.png",
        None,
    ),
]
for i, (t, txt, img, nota) in enumerate(pasos1, start=1):
    paginas.append(pagina_paso(i, 8, t, txt, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_seccion(2, "Clases bloqueadas y módulos bonus", "Algunos contenidos se abren solos con el tiempo, como regalo por avanzar.", LOGO))
pasos2 = [
    (
        "Los módulos con candado",
        [
            "En «Todos los módulos» vas a ver cuáles ya están disponibles para vos y",
            "cuáles todavía están bloqueados con un candado.",
            "Esto es intencional: el curso se arma en un orden pensado para que cada",
            "módulo tenga más sentido después de haber visto el anterior.",
        ],
        "p-modulos-candado.png",
        None,
    ),
    (
        "Los bonos se liberan solos",
        [
            "Los módulos bonus (como «Bono: Color» o «Bono: Mindset») no están ahí",
            "de relleno: son contenido extra pensado para cuando ya tenés una base.",
            "Se abren automáticamente a partir de cierta cantidad de días desde tu",
            "acceso, sin que tengas que pagar nada de más ni pedir nada.",
        ],
        "p-bonos.png",
        "No hay que hacer nada: el día que se cumple el plazo, el candado desaparece solo la próxima vez que entrás.",
    ),
]
for i, (t, txt, img, nota) in enumerate(pasos2, start=4):
    paginas.append(pagina_paso(i, 8, t, txt, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_seccion(3, "Soporte, clases en vivo y comunidad", "Nunca estás solo/a con una duda: siempre hay alguien del otro lado.", LOGO))
pasos3 = [
    (
        "Preguntá en cada clase",
        [
            "Debajo del video de cada clase vas a encontrar la pestaña «Comentarios».",
            "Ahí podés escribirle tu duda a Aaron sobre ese contenido puntual, sin",
            "perderte buscando en otro lado.",
            "Aaron (y otros alumnos) responden directamente ahí mismo.",
        ],
        "p-comentarios.png",
        "Mientras más específica sea tu pregunta (qué paso del corte, qué minuto del video), más rápido y mejor te van a poder ayudar.",
    ),
    (
        "Sumate al grupo de WhatsApp",
        [
            "Buscá el enlace de invitación en la clase «Soporte, clases en vivo y",
            "comunidad» para unirte al grupo oficial.",
            "Ahí se avisan las clases en vivo, se comparten dudas rápidas y vas a",
            "conocer a otros barberos que están haciendo el curso con vos.",
        ],
        "wa-invite.png",
        None,
    ),
]
for i, (t, txt, img, nota) in enumerate(pasos3, start=6):
    paginas.append(pagina_paso(i, 8, t, txt, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_cierre(
    "Ya conocés toda la plataforma",
    "Guardá esta guía: podés volver a leerla cuando quieras. Y cualquier duda, preguntá en los comentarios de la clase o en el grupo de WhatsApp — siempre hay alguien para ayudarte.",
    LOGO,
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
