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
    "Un extra para que nadie se quede afuera por no saber entrar: en 8 pasos simples, de cero a adentro, sin contraseñas que recordar ni complicaciones.",
    LOGO, AARON,
))

paginas.append(pagina_seccion(1, "Entrar a la plataforma", "Con el email que usaste para comprar, sin contraseñas que recordar.", LOGO))

pasos1 = [
    (
        "Entrá a la página de acceso",
        [
            "Abrí <b>lanuevaolaacademy.com/entrar</b> desde el celular o la computadora",
            "y escribí el mismo email con el que compraste el curso.",
            "No necesitás crear ninguna cuenta nueva ni elegir una contraseña: el",
            "acceso funciona solo con tu email.",
        ],
        "1-entrar-vacio.png",
        "Usá siempre el mismo email de la compra. Si tenés dudas de cuál fue, revisá el correo de confirmación de Hotmart.",
    ),
    (
        "Escribí tu email",
        [
            "Revisá que esté bien escrito (sin espacios de más ni errores de tipeo)",
            "y tocá «Enviarme el enlace de acceso».",
            "En segundos te va a llegar un correo con un enlace mágico, listo para",
            "entrar sin escribir nada más.",
        ],
        "2-entrar-email.png",
        None,
    ),
    (
        "Listo, te mandamos el enlace",
        [
            "Esta pantalla confirma que el email ya salió para tu dirección.",
            "Ahora el siguiente paso es ir a tu correo y abrirlo.",
        ],
        "3-entrar-enviado.png",
        "El enlace vence en unos minutos por seguridad. Si tarda en llegar o ya venció, volvé a esta pantalla y pedí uno nuevo.",
    ),
    (
        "Abrí tu Gmail y buscá el correo",
        [
            "Entrá a tu bandeja de entrada y buscá un correo de «La Nueva Ola",
            "Academy» — suele llegar en pocos segundos.",
            "Si usás otro proveedor de correo (Outlook, Yahoo, etc.) el proceso es",
            "igual: buscá el mismo remitente ahí.",
        ],
        "gmail-inbox.png",
        "Si no aparece en la bandeja principal, revisá la carpeta de Spam o Promociones antes de pedir uno nuevo.",
    ),
    (
        "Tocá el botón del email",
        [
            "Dentro del correo vas a ver un botón grande que dice «Entrar a mi",
            "cuenta». Tocalo y listo: no hace falta escribir ninguna contraseña.",
        ],
        "gmail-open.png",
        None,
    ),
    (
        "¡Ya estás adentro!",
        [
            "Esta es tu página de inicio: ahí vas a ver tu progreso guardado y",
            "todos los módulos del curso disponibles para arrancar.",
            "La próxima vez que quieras entrar, repetís estos mismos pasos con el",
            "mismo email.",
        ],
        "4-inicio.png",
        None,
    ),
]
for i, (titulo, texto, img, nota) in enumerate(pasos1, start=1):
    paginas.append(pagina_paso(i, 8, titulo, texto, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_seccion(2, "Entrar al grupo de WhatsApp", "Ahí está Aaron y el resto de la comunidad, todos los días.", LOGO))

pasos2 = [
    (
        "Tocá el enlace del grupo",
        [
            "Dentro de la plataforma, buscá el enlace en la clase «Soporte, clases",
            "en vivo y comunidad» y tocalo para que se abra WhatsApp directamente.",
        ],
        "wa-invite.png",
        None,
    ),
    (
        "Ya sos parte de la comunidad",
        [
            "A partir de ahora vas a poder preguntarle a Aaron, enterarte primero",
            "de las clases en vivo y conocer a otros barberos que están haciendo",
            "el curso al mismo tiempo que vos.",
            "Es el lugar ideal para compartir tus avances y resolver dudas rápido.",
        ],
        "wa-group.png",
        None,
    ),
]
for i, (titulo, texto, img, nota) in enumerate(pasos2, start=7):
    paginas.append(pagina_paso(i, 8, titulo, texto, os.path.join(IMG, img), LOGO, nota))

paginas.append(pagina_cierre(
    "Listo, ya estás dentro",
    "Guardá esta guía para cuando necesites volver a entrar. Cualquier duda, preguntá en el grupo de WhatsApp o escribile a Aaron desde la propia clase.",
    LOGO,
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
