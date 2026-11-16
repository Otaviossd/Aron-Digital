# -*- coding: utf-8 -*-
"""Genera el PDF: "Cómo entrar a la plataforma y al grupo de WhatsApp"."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_seccion, pagina_paso, pagina_cierre
from render import render_pdf

IMG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pdfimgs"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-plataforma-whatsapp.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")

paginas = []
paginas.append(pagina_portada(
    "Cómo entrar a la plataforma<br>y al grupo de WhatsApp",
    "Guía rápida para tus alumnos",
    "Mostrásela en clase o dejala como material descargable: en 8 pasos, de cero a adentro.",
    LOGO, AARON,
))

paginas.append(pagina_seccion(1, "Entrar a la plataforma", "Con el email que usaste para comprar, sin contraseñas que recordar.", LOGO))

pasos1 = [
    ("Entrá a la página de acceso", ["Abrí <b>lanuevaolaacademy.com/entrar</b> y escribí el mismo email con el que compraste el curso."], "1-entrar-vacio.png", None),
    ("Escribí tu email", ["Revisá que esté bien escrito (sin espacios ni errores) y tocá «Enviarme el enlace de acceso»."], "2-entrar-email.png", None),
    ("Listo, te mandamos el enlace", ["Esta pantalla confirma que el email ya salió. Ahora andá a tu correo."], "3-entrar-enviado.png", "El enlace vence en unos minutos. Si tarda, pedí uno nuevo."),
    ("Abrí tu Gmail y buscá el correo", ["Buscá «La Nueva Ola Academy» en tu bandeja de entrada."], "gmail-inbox.png", "Si no aparece, revisá la carpeta de Spam o Promociones."),
    ("Tocá el botón del email", ["Dentro del correo, tocá «Entrar a mi cuenta». No hace falta contraseña."], "gmail-open.png", None),
    ("¡Ya estás adentro!", ["Esta es tu página de inicio, con tu progreso y los módulos del curso."], "4-inicio.png", None),
]
for i, (titulo, texto, img, nota) in enumerate(pasos1, start=1):
    paginas.append(pagina_paso(i, 8, titulo, texto, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_seccion(2, "Entrar al grupo de WhatsApp", "Ahí está Aaron y el resto de la comunidad.", LOGO))

pasos2 = [
    ("Tocá el enlace del grupo", ["Buscá el enlace en la clase «Soporte, clases en vivo y comunidad» y tocalo para abrir WhatsApp."], "wa-invite.png", None),
    ("Ya sos parte de la comunidad", ["Ahí vas a poder preguntarle a Aaron, enterarte de las clases en vivo y conocer a otros alumnos."], "wa-group.png", None),
]
for i, (titulo, texto, img, nota) in enumerate(pasos2, start=7):
    paginas.append(pagina_paso(i, 8, titulo, texto, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_cierre("Listo, ya estás dentro", "Cualquier duda, preguntá en el grupo de WhatsApp o escribile a Aaron desde la propia clase.", LOGO))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
