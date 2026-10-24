# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.55.0"]
# ///
"""Exporta el diagrama de arquitectura de la lección *A skill that reads images* a PNG.

La fuente es `docs/assets/architecture.excalidraw`, con las inconsistencias sembradas 1–3. Se
edita en <https://excalidraw.com> (Open → guardar con Save to… → Save to disk) y se exporta con
este script, que usa la librería de Excalidraw en Chrome sin ventana para que el PNG salga igual
que en la app:

    uv run docs/assets/render-architecture-png.py docs/assets/architecture.excalidraw mod/lessons/images/docs/architecture.png

Necesita Google Chrome instalado. El PNG va al material de la lección; la fuente se queda fuera,
para que el agente no lea una versión en texto en lugar de *ver* la imagen.
"""

import base64
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

EXCALIDRAW = "https://esm.sh/@excalidraw/excalidraw@0.18.0"
WIDTH = 1500  # px: legible in the chat, and well under the 2 MB limit
MAX_BYTES = 2 * 1024 * 1024

HTML = f"""<!doctype html><html><head><meta charset="utf-8">
<script>window.EXCALIDRAW_ASSET_PATH = "{EXCALIDRAW}/dist/prod/";</script>
</head><body><script type="module">
import * as ex from "{EXCALIDRAW}?bundle-deps";
window.ex = ex; window.ready = true;
</script></body></html>"""

EXPORT = """async ({ scene, width }) => {
    const { elements, appState } = JSON.parse(scene);
    const blob = await window.ex.exportToBlob({
        elements,
        appState: { ...appState, exportBackground: true, exportWithDarkMode: false },
        files: null,
        exportPadding: 40,
        mimeType: "image/png",
        getDimensions: (w, h) => ({ width: width, height: Math.round(h * width / w), scale: width / w }),
    });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}"""


def main(source: Path, target: Path) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        page = browser.new_page()
        page.set_content(HTML)
        page.wait_for_function("window.ready === true", timeout=120_000)
        png = base64.b64decode(page.evaluate(EXPORT, {"scene": source.read_text(encoding="utf-8"), "width": WIDTH}))
        browser.close()
    if len(png) >= MAX_BYTES:
        sys.exit(f"The PNG weighs {len(png)} bytes; it must stay under 2 MB.")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(png)
    print(f"{target}: {len(png) // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(Path(sys.argv[1]), Path(sys.argv[2]))
