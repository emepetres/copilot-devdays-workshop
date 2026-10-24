# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab==4.4.4", "pillow==11.3.0"]
# ///
"""Genera el acta escaneada de Tailspin Toys, en inglés, que revisa el Engineering Reviewer
(lección *The Engineering Reviewer with Docling MCP*).

Es un PDF de una página cuyo único contenido es una imagen, sin capa de texto, así que
Docling solo puede leerlo con OCR. Lleva sembrada la inconsistencia 6 (decisión D2); el
resto del acta coincide con el código de la plantilla. La clave de respuestas está en
`docs/inconsistencias-sembradas.md`.

El resultado va al material de la lección `docling`:

    uv run docs/assets/generate-acta-scan.py mod/lessons/docling/docs/meeting-minutes.pdf
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
REGULAR_FONT = ImageFont.truetype(str(FONTS / "Vera.ttf"), 30)
BOLD_FONT = ImageFont.truetype(str(FONTS / "VeraBd.ttf"), 30)
TITLE_FONT = ImageFont.truetype(str(FONTS / "VeraBd.ttf"), 46)
DPI = 200
MARGIN = 170

# (font, text, indent in px). An empty text is a blank line. D2 is seeded inconsistency 6.
LINES = [
    (TITLE_FONT, "MEETING MINUTES", 0),
    (BOLD_FONT, "Product committee · Tailspin Toys", 0),
    (REGULAR_FONT, "", 0),
    (REGULAR_FONT, "Date: October 14, 2026, from 10:00 to 11:00", 0),
    (REGULAR_FONT, "Place: Triana room, Seville office", 0),
    (REGULAR_FONT, "Attendees: Lucía Romero (product), Andrés Vega (web team),", 0),
    (REGULAR_FONT, "Marta Ibáñez (data) and Pablo Ortega (QA)", 40),
    (REGULAR_FONT, "", 0),
    (BOLD_FONT, "1. Status of sprint 14", 0),
    (REGULAR_FONT, "The web team closes every task of the sprint. The end-to-end", 40),
    (REGULAR_FONT, "tests pass against the built site.", 40),
    (REGULAR_FONT, "", 0),
    (BOLD_FONT, "2. Game ratings", 0),
    (REGULAR_FONT, "Several users can't tell half stars apart. The proposal is to", 40),
    (REGULAR_FONT, "replace them with a numeric score, which is easier to compare.", 40),
    (REGULAR_FONT, "", 0),
    (BOLD_FONT, "3. Database", 0),
    (REGULAR_FONT, "The committee reviews whether to change the database. The catalog", 40),
    (REGULAR_FONT, "is small and loads from games.csv, so there is no need.", 40),
    (REGULAR_FONT, "", 0),
    (BOLD_FONT, "Decisions", 0),
    (REGULAR_FONT, "D1. SQLite remains the database of the catalog.", 40),
    (REGULAR_FONT, "D2. Game ratings are shown on a scale of 1 to 10, as whole", 40),
    (REGULAR_FONT, "numbers and without stars. Implemented in sprint 14.", 100),
    (REGULAR_FONT, "D3. The \"Support This Game\" button still does not process", 40),
    (REGULAR_FONT, "contributions until the payment gateway is chosen.", 100),
    (REGULAR_FONT, "", 0),
    (BOLD_FONT, "Actions", 0),
    (REGULAR_FONT, "- Lucía Romero: update the requirements specification (v1.3)", 40),
    (REGULAR_FONT, "with decision D2. Before 2026-10-30.", 70),
    (REGULAR_FONT, "- Pablo Ortega: prepare the test plan of version 1.3.", 40),
    (REGULAR_FONT, "Before 2026-11-06.", 70),
    (REGULAR_FONT, "", 0),
    (REGULAR_FONT, "", 0),
    (REGULAR_FONT, "Signed: Lucía Romero, secretary of the committee", 0),
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
    canvas.setTitle("Scan")  # Scanners do not know what they scan.
    canvas.drawImage(ImageReader(BytesIO(buf.getvalue())), 0, 0, width=A4[0], height=A4[1])
    canvas.showPage()
    canvas.save()


if __name__ == "__main__":
    main(Path(sys.argv[1]))
