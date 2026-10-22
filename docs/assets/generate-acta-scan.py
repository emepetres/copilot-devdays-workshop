# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab==4.4.4", "pillow==11.3.0"]
# ///
"""Genera el acta escaneada de Tailspin Toys que revisa el Engineering Reviewer (lección 6).

Es un PDF de una página cuyo único contenido es una imagen, sin capa de texto, así que
Docling solo puede leerlo con OCR. Lleva sembrada la inconsistencia 6 (decisión D2); el
resto del acta coincide con el código de la plantilla. La clave de respuestas está en
`docs/inconsistencias-sembradas.md`.

El resultado va a la plantilla del workshop, en `docs/acta-reunion.pdf`:

    uv run docs/assets/generate-acta-scan.py <ruta de salida>
"""

import random
import sys
from io import BytesIO
from pathlib import Path

import reportlab
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

FONTS = Path(reportlab.__file__).parent / "fonts"
REGULAR = ImageFont.truetype(str(FONTS / "Vera.ttf"), 30)
BOLD = ImageFont.truetype(str(FONTS / "VeraBd.ttf"), 30)
TITLE = ImageFont.truetype(str(FONTS / "VeraBd.ttf"), 46)
DPI = 200
MARGIN = 170

# (font, text, indent in px). An empty text is a blank line. D2 is seeded inconsistency 6.
LINES = [
    (TITLE, "ACTA DE REUNIÓN", 0),
    (BOLD, "Comité de producto · Tailspin Toys", 0),
    (REGULAR, "", 0),
    (REGULAR, "Fecha: 14 de octubre de 2026, de 10:00 a 11:00", 0),
    (REGULAR, "Lugar: sala Triana, oficina de Sevilla", 0),
    (REGULAR, "Asistentes: Lucía Romero (producto), Andrés Vega (equipo web),", 0),
    (REGULAR, "Marta Ibáñez (datos) y Pablo Ortega (QA)", 40),
    (REGULAR, "", 0),
    (BOLD, "1. Estado del sprint 14", 0),
    (REGULAR, "El equipo web cierra todas las tareas del sprint. Las pruebas", 40),
    (REGULAR, "end-to-end pasan contra el sitio compilado.", 40),
    (REGULAR, "", 0),
    (BOLD, "2. Valoraciones de los juegos", 0),
    (REGULAR, "Varios usuarios no distinguen bien las medias estrellas. Se propone", 40),
    (REGULAR, "sustituirlas por una nota numérica, más fácil de comparar.", 40),
    (REGULAR, "", 0),
    (BOLD, "3. Base de datos", 0),
    (REGULAR, "Se revisa si conviene cambiar de base de datos. El catálogo es pequeño", 40),
    (REGULAR, "y se carga desde games.csv, así que no hace falta.", 40),
    (REGULAR, "", 0),
    (BOLD, "Decisiones", 0),
    (REGULAR, "D1. Se mantiene SQLite como base de datos del catálogo.", 40),
    (REGULAR, "D2. La valoración de los juegos se muestra en una escala de 1 a 10,", 40),
    (REGULAR, "con números enteros y sin estrellas. Implementado en el sprint 14.", 100),
    (REGULAR, "D3. El botón «Support This Game» sigue sin tramitar aportaciones", 40),
    (REGULAR, "hasta que se elija la pasarela de pago.", 100),
    (REGULAR, "", 0),
    (BOLD, "Acciones", 0),
    (REGULAR, "- Lucía Romero: actualizar la especificación de requisitos (v1.3)", 40),
    (REGULAR, "con la decisión D2. Antes del 30/10/2026.", 70),
    (REGULAR, "- Pablo Ortega: preparar el plan de pruebas de la versión 1.3.", 40),
    (REGULAR, "Antes del 06/11/2026.", 70),
    (REGULAR, "", 0),
    (REGULAR, "", 0),
    (REGULAR, "Firmado: Lucía Romero, secretaria del comité", 0),
]


def signature(draw: ImageDraw.ImageDraw, x: int, y: int, rng: random.Random) -> None:
    """A pen scribble, so the page looks signed and printed rather than generated."""
    points = []
    for i in range(40):
        points.append((x + i * 9, y + int(28 * ((i % 7) / 7 - 0.5)) + rng.randrange(-6, 6)))
    draw.line(points, fill=60, width=3, joint="curve")


def scanned_page() -> Image.Image:
    width, height = int(A4[0] / 72 * DPI), int(A4[1] / 72 * DPI)
    img = Image.new("L", (width, height), 242)
    draw = ImageDraw.Draw(img)
    rng = random.Random(14)

    y = 190
    for font, line, indent in LINES:
        draw.text((MARGIN + indent, y), line, fill=30, font=font)
        y += int(font.size * 1.75)
    signature(draw, MARGIN + 60, y + 30, rng)

    # A staple in the corner, paper noise, a slight tilt and blur, like a cheap office scanner.
    draw.line([(70, 90), (130, 70)], fill=110, width=5)
    for _ in range(9000):
        draw.point((rng.randrange(width), rng.randrange(height)), fill=rng.randrange(140, 225))
    img = img.rotate(-0.7, fillcolor=200, resample=Image.Resampling.BICUBIC)
    # The scanner lid leaves a darker band along one edge.
    ImageDraw.Draw(img).rectangle([(width - 18, 0), (width, height)], fill=170)
    return img.filter(ImageFilter.GaussianBlur(0.7))


def main(out: Path) -> None:
    buf = BytesIO()
    scanned_page().save(buf, format="JPEG", quality=72)
    canvas = Canvas(str(out), pagesize=A4)
    canvas.setTitle("Escaneado")  # Scanners do not know what they scan.
    canvas.drawImage(ImageReader(BytesIO(buf.getvalue())), 0, 0, width=A4[0], height=A4[1])
    canvas.showPage()
    canvas.save()


if __name__ == "__main__":
    main(Path(sys.argv[1]))
