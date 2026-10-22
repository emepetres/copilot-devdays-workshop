# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab==4.4.4", "pillow==11.3.0"]
# ///
"""Genera el PDF de calentamiento de Docling para la lección 0.

Página 1: texto digital con una tabla pequeña (modelos de layout y de tablas).
Página 2: una imagen sin capa de texto que simula un escaneado (OCR).

El resultado va a la plantilla del workshop, en `scripts/docling-warmup/calentamiento.pdf`:

    uv run docs/assets/generate-warmup-pdf.py <ruta de salida>
"""

import random
import sys
from io import BytesIO
from pathlib import Path

import reportlab
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

FONT = Path(reportlab.__file__).parent / "fonts" / "Vera.ttf"
DPI = 150

SCAN_LINES = [
    ("Acta de prueba (página escaneada)", 44),
    ("", 30),
    ("Esta página es una imagen, sin capa de texto.", 30),
    ("Docling solo puede leerla con OCR.", 30),
    ("", 30),
    # Must match CONTROL_WORD in scripts/docling-warmup/warmup.mjs of the template.
    ("Palabra de control: Giralda", 30),
    ("", 30),
    ("Si el script la encuentra, el OCR funciona.", 30),
]


def text_page() -> list:
    styles = getSampleStyleSheet()
    table = Table(
        [
            ["Modelo", "Para qué sirve", "Tamaño aprox."],
            ["Layout (heron)", "Detectar títulos, párrafos y tablas", "164 MB"],
            ["TableFormer", "Reconstruir la estructura de las tablas", "342 MB"],
            ["RapidOCR", "Leer texto en imágenes escaneadas", "61 MB (incluido)"],
        ],
        colWidths=[4 * cm, 8 * cm, 4 * cm],
    )
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ]
        )
    )
    return [
        Paragraph("Documento de calentamiento de Docling", styles["Title"]),
        Paragraph(
            "Este PDF forma parte de la lección 0 del workshop "
            "<i>Construye tu Engineering Reviewer con GitHub Copilot</i>. "
            "Convertirlo una vez en casa descarga los modelos que Docling necesita, "
            "para no tener que hacerlo con la wifi del evento.",
            styles["BodyText"],
        ),
        Spacer(1, 0.5 * cm),
        Paragraph("Modelos que se descargan", styles["Heading2"]),
        table,
        Spacer(1, 0.5 * cm),
        Paragraph(
            "La página siguiente es una imagen escaneada. Sirve para comprobar que el OCR funciona.",
            styles["BodyText"],
        ),
    ]


def scanned_image() -> Image.Image:
    width, height = int(A4[0] / 72 * DPI), int(A4[1] / 72 * DPI)
    img = Image.new("L", (width, height), 245)
    draw = ImageDraw.Draw(img)
    y = 180
    for line, size in SCAN_LINES:
        font = ImageFont.truetype(str(FONT), size)
        draw.text((140, y), line, fill=25, font=font)
        y += int(size * 1.8)
    # Paper noise, a slight tilt and blur, like a cheap office scanner.
    rng = random.Random(28)
    for _ in range(4000):
        draw.point((rng.randrange(width), rng.randrange(height)), fill=rng.randrange(150, 220))
    img = img.rotate(0.8, fillcolor=245, resample=Image.Resampling.BICUBIC)
    return img.filter(ImageFilter.GaussianBlur(0.6))


def main(out: Path) -> None:
    doc = SimpleDocTemplate(str(out), pagesize=A4, title="Calentamiento de Docling")
    buf = BytesIO()
    scanned_image().save(buf, format="JPEG", quality=70)
    scan = ImageReader(BytesIO(buf.getvalue()))

    def draw_scan(canvas, _doc) -> None:
        if canvas.getPageNumber() == 2:
            canvas.drawImage(scan, 0, 0, width=A4[0], height=A4[1])

    story = text_page()
    # An empty second page; `draw_scan` paints the scan onto it.
    story += [PageBreak(), Spacer(1, 1)]
    doc.build(story, onFirstPage=draw_scan, onLaterPages=draw_scan)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
