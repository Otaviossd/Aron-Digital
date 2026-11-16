# -*- coding: utf-8 -*-
"""Genera el PDF de apoyo para la clase extra: "Cómo crecer en redes sociales como barbero"."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
RAIZ = os.path.dirname(os.path.dirname(AQUI))

from plantilla import envolver, pagina_portada, pagina_seccion, pagina_checklist, pagina_imagen_simple, pagina_cierre
from render import render_pdf

IMG = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pdfimgs"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(AQUI, "salida", "guia-redes-sociales.pdf")
LOGO = os.path.join(RAIZ, "public", "logo-lno.png")
AARON = os.path.join(RAIZ, "public", "aaron", "retrato-recorte.webp")

paginas = []
paginas.append(pagina_portada(
    "Cómo crecer en redes<br>sociales como barbero",
    "Material de apoyo · Clase extra",
    "Un resumen para tener a mano mientras mirás la clase de Aaron y para releer después, cuando te pongas a publicar.",
    LOGO, AARON,
))

paginas.append(pagina_imagen_simple(
    1, 7, "La idea de esta clase",
    ["Quien no se muestra, no se recuerda. Tu Instagram no es un álbum de", "fotos: es la vidriera que hace que te elijan a vos y no a otro barbero."],
    os.path.join(IMG, "extra-portada.png"), LOGO,
    "Mirá la clase completa en la plataforma; esta hoja es solo un resumen para tener a mano.",
))

paginas.append(pagina_seccion(1, "Qué publicar", "Cuatro tipos de contenido que no te pueden faltar.", LOGO))
paginas.append(pagina_checklist(2, 7, "Qué publicar", None, [
    ("✂️", "Antes y después", "Es lo que más convence: mostrá siempre el cambio completo, con buena luz y el mismo ángulo en las dos fotos."),
    ("🎥", "El proceso en reel", "Grabá partes clave del corte (el degradé, el acabado). No hace falta mostrar todo: 15-20 segundos bien editados alcanzan."),
    ("⭐", "Lo que dicen tus clientes", "Un video corto o una captura de un cliente contento vale más que cualquier promoción que hagas vos mismo."),
    ("📍", "Tu día a día", "Vos trabajando, la barbería, tus herramientas. La gente también sigue a la persona, no solo el trabajo."),
], LOGO))

paginas.append(pagina_seccion(2, "Cómo mostrar tus cortes", "El detalle que separa un perfil amateur de uno que vende.", LOGO))
paginas.append(pagina_checklist(3, 7, "Cómo mostrarlos", None, [
    ("💡", "Buena luz, siempre", "Luz natural de día o un aro de luz. Una foto oscura o con sombras arruina el mejor corte del mundo."),
    ("📐", "El mismo encuadre", "Mismo ángulo y distancia en el antes/después para que se note el cambio real."),
    ("🧹", "Fondo limpio", "Un fondo ordenado (o liso) hace que el corte sea lo único que se mire."),
], LOGO))

paginas.append(pagina_seccion(3, "De seguidor a cliente", "Mostrar no alcanza: hay que facilitar que te escriban.", LOGO))
paginas.append(pagina_checklist(4, 7, "De seguidor a cliente", None, [
    ("🔗", "Un solo lugar para reservar", "Poné en tu biografía el link o el WhatsApp para agendar. Que nadie tenga que preguntar «¿cómo te contacto?»."),
    ("⚡", "Respondé rápido", "Los primeros minutos después de un comentario o un DM son los que más convierten en turno agendado."),
    ("🔁", "Historias destacadas", "Guardá tus mejores antes/después y testimonios en una historia destacada llamada «Trabajos» o «Reservas»."),
], LOGO))

paginas.append(pagina_seccion(4, "Constancia", "El algoritmo (y los clientes) premian a quien no desaparece.", LOGO))
paginas.append(pagina_checklist(5, 7, "Constancia", None, [
    ("📅", "Un ritmo sostenible", "Mejor 2-3 publicaciones por semana todas las semanas, que 10 juntas y después un mes en silencio."),
    ("🏷️", "Ubicación y etiquetas", "Etiquetá tu ciudad/barrio: así te encuentra gente nueva que busca un barbero cerca."),
], LOGO))

paginas.append(pagina_cierre(
    "Elegí 1 o 2 ideas y arrancá hoy",
    "No hace falta aplicar todo de una. Mirá de nuevo la clase cuando quieras repasar el detalle de cada punto.",
    LOGO,
))

html = envolver("\n".join(paginas), LOGO, AARON)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
render_pdf(html, OUT)
print("OK ->", OUT)
