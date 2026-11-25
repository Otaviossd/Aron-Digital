# -*- coding: utf-8 -*-
"""Genera el PDF individual: "Cómo entrar a tu cuenta" (para la aula del mismo nombre)."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_checklist, pagina_cierre
from render import render_pdf

OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-entrar.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")
TOTAL = 2

paginas = []
paginas.append(pagina_portada(
    "Cómo entrar a tu cuenta",
    "Sin contraseñas que recordar",
    "Un extra para que nadie se quede afuera por no saber entrar: en unos pocos pasos, de cero a adentro, sin complicaciones.",
    LOGO, AARON,
))

paginas.append(pagina_checklist(
    1, TOTAL, "Entrar a la plataforma",
    "Con el mismo email que usaste para comprar. No necesitás crear ninguna cuenta nueva ni elegir una contraseña.",
    [
        ("1️⃣", "Andá a lanuevaolaacademy.com/entrar", "Desde el celular o la computadora, escribí el mismo email con el que compraste el curso y tocá «Enviarme el enlace de acceso»."),
        ("2️⃣", "Abrí tu correo", "En segundos te llega un email de «La Nueva Ola Academy» con un botón que dice «Entrar a mi cuenta». Si no aparece en la bandeja principal, revisá Spam o Promociones."),
        ("3️⃣", "Tocá el botón y listo", "Sin escribir ninguna contraseña entrás directo a tu cuenta, con tu progreso guardado. La próxima vez repetís estos mismos pasos."),
        ("⏱️", "El enlace vence en unos minutos", "Es por seguridad. Si tarda en llegar o ya venció, volvé a la página y pedí uno nuevo con el mismo email."),
    ],
    LOGO,
))

paginas.append(pagina_checklist(
    2, TOTAL, "Entrar al grupo de WhatsApp",
    "Ahí está Aaron y el resto de la comunidad, todos los días.",
    [
        ("💬", "Tocá el enlace del grupo", "Está dentro de la clase «Soporte, clases en vivo y comunidad»: tocalo y se abre WhatsApp directamente."),
        ("🤝", "Ya sos parte de la comunidad", "Vas a poder preguntarle a Aaron, enterarte primero de las clases en vivo y conocer a otros barberos que hacen el curso con vos."),
    ],
    LOGO,
))

paginas.append(pagina_cierre(
    "Listo, ya estás dentro",
    "Guardá esta guía para cuando necesites volver a entrar. Cualquier duda, preguntá en el grupo de WhatsApp o escribile a Aaron desde la propia clase.",
    LOGO,
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
