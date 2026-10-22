# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab==4.4.4"]
# ///
"""Genera el PDF de requisitos de Tailspin Toys que revisa el Engineering Reviewer (lección 6).

Lleva sembradas las inconsistencias 4 (RF-03) y 5 (RNF-01). El resto de requisitos
coincide con el código de la plantilla, para que no haya falsos positivos. La clave de
respuestas está en `docs/inconsistencias-sembradas.md`.

El resultado va a la plantilla del workshop, en `docs/requisitos.pdf`:

    uv run docs/assets/generate-requisitos-pdf.py <ruta de salida>
"""

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

TITLE = "Especificación de requisitos del catálogo"
VERSION = "v1.2 · 30 de septiembre de 2026"

HISTORY = [
    ["Versión", "Fecha", "Cambios"],
    ["1.0", "12/05/2026", "Primera versión aprobada."],
    ["1.1", "03/07/2026", "Añade la página de detalle y la página 404."],
    ["1.2", "30/09/2026", "Añade los apartados 4 y 5."],
]

GLOSSARY = [
    ("Juego", "Título de mesa con temática de desarrollo de software que busca financiación en la plataforma."),
    ("Categoría", "Género del juego, como Strategy, Card Game o Puzzle. Sirve para agrupar el catálogo."),
    ("Editor", "Estudio o empresa que publica el juego y solicita la financiación."),
    ("Valoración", "Puntuación del juego. Es opcional: un juego nuevo puede no tenerla."),
]

# (id, requirement). RF-03 is seeded inconsistency 4.
FUNCTIONAL = [
    ("RF-01", "La página principal muestra todos los juegos del catálogo ordenados alfabéticamente por título."),
    ("RF-02", "Cada tarjeta del catálogo muestra el título, las categorías, el editor y el inicio de la descripción, "
              "y enlaza con la página de detalle del juego."),
    ("RF-03", "Un juego puede pertenecer a varias categorías. La tarjeta y la página de detalle muestran "
              "todas las categorías del juego."),
    ("RF-04", "Cada juego tiene un único editor."),
    ("RF-05", "La página de detalle de cada juego está en la ruta /game/{id} y muestra el título, la valoración, "
              "las categorías, el editor y la descripción completa."),
    ("RF-06", "La página de detalle incluye el botón «Support This Game». En esta versión el botón no tramita "
              "aportaciones (ver apartado 5)."),
    ("RF-07", "Si un juego no tiene valoración, no se muestra ninguna valoración en su página de detalle."),
    ("RF-08", "El sitio incluye una página «About» que presenta Tailspin Toys."),
    ("RF-09", "Una ruta inexistente muestra una página 404 con el diseño del sitio."),
]

# (id, requirement). RNF-01 is seeded inconsistency 5.
NON_FUNCTIONAL = [
    ("RNF-01", "El catálogo se actualiza en tiempo real: cualquier cambio en los datos de un juego se ve en la web "
               "en menos de 5 segundos, sin volver a desplegar el sitio."),
    ("RNF-02", "Los datos del catálogo se guardan en una base de datos SQLite local, que se carga a partir del "
               "fichero games.csv."),
    ("RNF-03", "La valoración de cada juego se calcula de forma determinista, para que dos compilaciones "
               "del sitio produzcan el mismo resultado."),
    ("RNF-04", "El sitio cumple las pautas WCAG 2.1 de nivel AA y se puede recorrer entero con el teclado."),
    ("RNF-05", "El catálogo se adapta al ancho de pantalla: una columna en móvil, dos en tableta y tres en escritorio."),
    ("RNF-06", "Las pruebas unitarias cubren la capa de datos y las pruebas end-to-end se ejecutan contra el "
               "sitio compilado."),
]

OUT_OF_SCOPE = [
    "Búsqueda, filtrado, ordenación y paginación del catálogo: se planifican para la versión 1.3.",
    "Páginas propias de cada editor.",
    "Tramitación de aportaciones y pasarela de pago.",
    "Cuentas de usuario y valoraciones de los usuarios.",
]


# Bold header row on a light blue background, with a thin grid.
TABLE_STYLE = [
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbe4f0")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#7a8699")),
]


def requirements_table(rows: list[tuple[str, str]], styles) -> Table:
    data = [["ID", "Requisito"]] + [[rid, Paragraph(text, styles["BodyText"])] for rid, text in rows]
    table = Table(data, colWidths=[2 * cm, 14 * cm], repeatRows=1)
    table.setStyle(TableStyle(TABLE_STYLE + [("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return table


def story() -> list:
    styles = getSampleStyleSheet()
    body = styles["BodyText"]
    h2 = styles["Heading2"]

    history = Table(HISTORY, colWidths=[2 * cm, 3 * cm, 11 * cm])
    history.setStyle(TableStyle(TABLE_STYLE))

    return [
        Paragraph(f"Tailspin Toys · {TITLE}", styles["Title"]),
        Paragraph(f"{VERSION} · Estado: aprobado por el comité de producto", body),
        Spacer(1, 0.4 * cm),
        history,
        Paragraph("1. Introducción", h2),
        Paragraph(
            "Tailspin Toys es una plataforma de crowdfunding de juegos de mesa con temática de desarrollo "
            "de software. Este documento recoge los requisitos del sitio web del catálogo: qué debe mostrar "
            "y con qué calidad. Lo mantiene el equipo de producto y sirve de referencia al equipo web.",
            body,
        ),
        Paragraph("2. Glosario", h2),
        *[Paragraph(f"<b>{term}</b>: {definition}", body) for term, definition in GLOSSARY],
        Paragraph("3. Requisitos funcionales", h2),
        requirements_table(FUNCTIONAL, styles),
        Paragraph("4. Requisitos no funcionales", h2),
        requirements_table(NON_FUNCTIONAL, styles),
        Paragraph("5. Fuera de alcance", h2),
        Paragraph("Esta versión no incluye:", body),
        *[Paragraph(f"• {item}", body) for item in OUT_OF_SCOPE],
    ]


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#555555"))
    canvas.drawString(2 * cm, 1.2 * cm, f"Tailspin Toys · {TITLE} · {VERSION}")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Página {doc.page}")
    canvas.restoreState()


def main(out: Path) -> None:
    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        title=f"Tailspin Toys · {TITLE}",
        author="Equipo de producto de Tailspin Toys",
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    doc.build(story(), onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
