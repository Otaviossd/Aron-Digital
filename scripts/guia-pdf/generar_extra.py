# -*- coding: utf-8 -*-
"""Genera el PDF del módulo extra "Cómo crecer en redes sociales como barbero".

Importante: esto NO es un resumen de lo que se enseña en la clase (eso ya lo ve
adentro del módulo). Es una página de estado/venta: le dice a quien la lee si
ya tiene el módulo desbloqueado (quien compró en la promo de lanzamiento, los
primeros 50) o si todavía lo puede comprar, con el precio y el botón para
hacerlo. Los valores de precio deben coincidir siempre con EXTRA en lib/config.ts.
"""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_imagen_simple, pagina_texto, pagina_cierre
from render import render_pdf

IMG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pdfimgs"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-redes-sociales.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")

# Debe coincidir con EXTRA en lib/config.ts.
PRECIO_ALUMNO = 10
PRECIO_NORMAL = 20
DIAS_PRECIO = 15
URL_EXTRA = "https://www.lanuevaolaacademy.com/aulas/extra"

paginas = []
paginas.append(pagina_portada(
    "Tu módulo extra:<br>cómo crecer en redes",
    "Cómo crecer en redes sociales como barbero",
    "Esta hoja te dice exactamente cómo acceder a este módulo: si ya es gratis para vos o cómo conseguirlo, y hasta cuándo tenés el precio especial de alumno.",
    LOGO, AARON,
))

paginas.append(pagina_imagen_simple(
    1, 4, "Qué es este módulo",
    [
        "«Cómo crecer en redes sociales como barbero» es un módulo completo",
        "aparte del curso principal, con varias clases propias.",
        "Ahí Aaron te muestra qué publicar, cómo mostrar tus cortes para que la",
        "gente quiera reservar con vos y cómo convertir seguidores en clientes.",
    ],
    os.path.join(IMG, "extra-portada.png"), LOGO,
    "No es un bonus suelto: es contenido pensado para que tu Instagram también te traiga clientes, no solo likes.",
))

paginas.append(pagina_texto(
    2, 4, "¿Ya lo tenés desbloqueado?",
    [
        (
            "Si compraste en la promo de lanzamiento",
            "Si fuiste parte de los primeros 50 alumnos en inscribirse, este módulo "
            "extra ya es tuyo, gratis, para siempre — no tenés que pagar nada ni "
            "hacer nada para activarlo.",
        ),
        (
            "Dónde encontrarlo",
            'Entrá a tu cuenta en la plataforma y abrí <b>"Módulo extra"</b> en el '
            "menú de clases (o tocá el botón de abajo). Si ya está desbloqueado para "
            "vos, vas a ver todas las clases disponibles ahí mismo, listas para mirar.",
        ),
        "Si no estás seguro/a de si te corresponde gratis, entrá al enlace: la plataforma te muestra automáticamente tu estado, según el email con el que compraste.",
    ],
    LOGO,
    boton="Ver mi módulo extra",
    boton_url=URL_EXTRA,
))

paginas.append(pagina_texto(
    3, 4, "¿Todavía no lo tenés?",
    [
        (
            f"Precio especial de alumno: US${PRECIO_ALUMNO}",
            f"Por ser alumno del curso, tenés un precio especial de <b>US${PRECIO_ALUMNO}</b> "
            f"(en vez de US${PRECIO_NORMAL}) durante los <b>{DIAS_PRECIO} días</b> siguientes a "
            "tu compra del curso. Es un pago único: no es una mensualidad.",
        ),
        (
            "¿Y después de esos días?",
            f"Nada se cierra. El módulo sigue disponible para comprar cuando quieras, "
            f"solo que el precio pasa a ser el normal de US${PRECIO_NORMAL}. Cuanto antes "
            "lo actives, mejor precio te queda.",
        ),
        (
            "Cómo comprarlo",
            'Entrá a la plataforma y abrí <b>"Módulo extra"</b> en el menú de clases '
            "(o tocá el botón de abajo). Ahí vas a ver tu precio vigente y el botón "
            "para pagar — el módulo se abre solo, en esa misma pantalla, apenas se "
            "confirma el pago.",
        ),
    ],
    LOGO,
    boton="Quiero el módulo extra",
    boton_url=URL_EXTRA,
))

paginas.append(pagina_cierre(
    "Un clic y listo",
    "Pagá con el mismo email de tu cuenta del curso y el módulo se desbloquea automáticamente, sin esperas ni pasos extra.",
    LOGO,
    boton="Ir al módulo extra",
    boton_url=URL_EXTRA,
    icono="🚀",
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
