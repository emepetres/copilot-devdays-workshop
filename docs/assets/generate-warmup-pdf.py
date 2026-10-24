# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab==4.4.4", "pillow==11.3.0"]
# ///
"""Genera el PDF de calentamiento de Docling de los prerrequisitos extra, en inglés.

Página 1: texto digital con una tabla pequeña (modelos de layout y de tablas).
Página 2: una imagen sin capa de texto que simula un escaneado (OCR).

El resultado va al CLI del mod, en `mod/warmup/warmup.pdf`:

    uv run docs/assets/generate-warmup-pdf.py mod/warmup/warmup.pdf
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
    ("Test minutes (scanned page)", 44),
    ("", 30),
    ("This page is an image, with no text layer.", 30),
    ("Docling can only read it with OCR.", 30),
    ("", 30),
    # Must match CONTROL_WORD in mod/warmup/warmup.mjs.
    ("Control word: Giralda", 30),
    ("", 30),
    ("If the warm-up finds it, OCR works.", 30),
]


def text_page() -> list:
    styles = getSampleStyleSheet()
    table = Table(
        [
            ["Model", "What it does", "Approx. size"],
            ["Layout (heron)", "Detects headings, paragraphs and tables", "164 MB"],
            ["TableFormer", "Rebuilds the structure of tables", "342 MB"],
            ["RapidOCR", "Reads text in scanned images", "61 MB (bundled)"],
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
        Paragraph("Docling warm-up document", styles["Title"]),
        Paragraph(
            "This PDF is part of the extra prerequisites of the workshop "
            "<i>Build your Engineering Reviewer</i>. "
            "Converting it once at home downloads the models Docling needs, "
            "so you do not have to do it over the venue wifi.",
            styles["BodyText"],
        ),
        Spacer(1, 0.5 * cm),
        Paragraph("Models it downloads", styles["Heading2"]),
        table,
        Spacer(1, 0.5 * cm),
        Paragraph(
            "The next page is a scanned image. It checks that OCR works.",
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
    doc = SimpleDocTemplate(str(out), pagesize=A4, title="Docling warm-up")
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
