# /// script
# requires-python = ">=3.10"
# dependencies = ["reportlab==4.4.4"]
# ///
"""Genera el PDF de requisitos de Tailspin Toys, en inglés, que revisa el Engineering Reviewer
(lección *The Engineering Reviewer with Docling MCP*).

Lleva sembradas las inconsistencias 4 (FR-03) y 5 (NFR-01). El resto de requisitos
coincide con el código de la plantilla, para que no haya falsos positivos. La clave de
respuestas está en `docs/inconsistencias-sembradas.md`.

El resultado va al material de la lección `docling`:

    uv run docs/assets/generate-requisitos-pdf.py mod/lessons/docling/docs/requirements.pdf
"""

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

TITLE = "Catalog Requirements Specification"
VERSION = "v1.2 · September 30, 2026"

HISTORY = [
    ["Version", "Date", "Changes"],
    ["1.0", "2026-05-12", "First approved version."],
    ["1.1", "2026-07-03", "Adds the detail page and the 404 page."],
    ["1.2", "2026-09-30", "Adds sections 4 and 5."],
]

GLOSSARY = [
    ("Game", "Board game themed around software development that seeks funding on the platform."),
    ("Category", "Genre of the game, such as Strategy, Card Game or Puzzle. It groups the catalog."),
    ("Publisher", "Studio or company that publishes the game and asks for the funding."),
    ("Rating", "Score of the game. It is optional: a new game may not have one."),
]

# (id, requirement). FR-03 is seeded inconsistency 4.
FUNCTIONAL = [
    ("FR-01", "The home page shows every game in the catalog, sorted alphabetically by title."),
    ("FR-02", "Each card in the catalog shows the title, the categories, the publisher and the start of the "
              "description, and links to the detail page of the game."),
    ("FR-03", "A game can belong to several categories. The card and the detail page show all the "
              "categories of the game."),
    ("FR-04", "Each game has exactly one publisher."),
    ("FR-05", "The detail page of each game is at the route /game/{id} and shows the title, the rating, "
              "the categories, the publisher and the full description."),
    ("FR-06", "The detail page includes the “Support This Game” button. In this version the button "
              "does not process contributions (see section 5)."),
    ("FR-07", "If a game has no rating, its detail page shows no rating."),
    ("FR-08", "The site includes an “About” page that introduces Tailspin Toys."),
    ("FR-09", "A route that does not exist shows a 404 page with the design of the site."),
]

# (id, requirement). NFR-01 is seeded inconsistency 5.
NON_FUNCTIONAL = [
    ("NFR-01", "The catalog updates in real time: any change to the data of a game shows on the website "
               "in less than 5 seconds, without redeploying the site."),
    ("NFR-02", "The catalog data is stored in a local SQLite database, loaded from the games.csv file."),
    ("NFR-03", "The rating of each game is computed deterministically, so that two builds of the site "
               "produce the same result."),
    ("NFR-04", "The site meets WCAG 2.1 level AA and can be fully navigated with the keyboard."),
    ("NFR-05", "The catalog adapts to the screen width: one column on mobile, two on tablet and three on desktop."),
    ("NFR-06", "Unit tests cover the data layer, and end-to-end tests run against the built site."),
]

OUT_OF_SCOPE = [
    "Search, filtering, sorting and pagination of the catalog: they are planned for version 1.3.",
    "Pages of their own for each publisher.",
    "Processing contributions and a payment gateway.",
    "User accounts and user ratings.",
]


# Bold header row on a light blue background, with a thin grid.
TABLE_STYLE = [
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbe4f0")),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#7a8699")),
]


def requirements(rows: list[tuple[str, str]], styles) -> list[Paragraph]:
    """One paragraph per requirement, not a table: docling-mcp 3.3.0 only searches and reads
    text items by anchor, so a requirement inside a table cell would be out of the agent's reach."""
    style = ParagraphStyle("Requirement", parent=styles["BodyText"], spaceAfter=4)
    return [Paragraph(f"<b>{rid}.</b> {text}", style) for rid, text in rows]


def story() -> list:
    styles = getSampleStyleSheet()
    body = styles["BodyText"]
    h2 = styles["Heading2"]
    # A real list, so Docling reads one list item per bullet.
    bullet = ParagraphStyle("Bullet", parent=body, leftIndent=0.6 * cm, bulletIndent=0.1 * cm)

    history = Table(HISTORY, colWidths=[2 * cm, 3 * cm, 11 * cm])
    history.setStyle(TableStyle(TABLE_STYLE))

    return [
        Paragraph(f"Tailspin Toys · {TITLE}", styles["Title"]),
        Paragraph(f"{VERSION} · Status: approved by the product committee", body),
        Spacer(1, 0.4 * cm),
        history,
        Paragraph("1. Introduction", h2),
        Paragraph(
            "Tailspin Toys is a crowdfunding platform for board games themed around software development. "
            "This document sets out the requirements of the catalog website: what it must show and to what "
            "quality. The product team maintains it, and the web team uses it as its reference.",
            body,
        ),
        Paragraph("2. Glossary", h2),
        *[Paragraph(f"<b>{term}</b>: {definition}", body) for term, definition in GLOSSARY],
        Paragraph("3. Functional requirements", h2),
        *requirements(FUNCTIONAL, styles),
        Paragraph("4. Non-functional requirements", h2),
        *requirements(NON_FUNCTIONAL, styles),
        Paragraph("5. Out of scope", h2),
        Paragraph("This version does not include:", body),
        *[Paragraph(item, bullet, bulletText="•") for item in OUT_OF_SCOPE],
    ]


def footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#555555"))
    canvas.drawString(2 * cm, 1.2 * cm, f"Tailspin Toys · {TITLE} · {VERSION}")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Page {doc.page}")
    canvas.restoreState()


def main(out: Path) -> None:
    doc = SimpleDocTemplate(
        str(out),
        pagesize=A4,
        title=f"Tailspin Toys · {TITLE}",
        author="Tailspin Toys product team",
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    doc.build(story(), onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
