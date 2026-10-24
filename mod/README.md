# CLI del mod

Trae al repo de Tailspin Toys del asistente el material de las **lecciones propias**. El diseño está en §5 de [`docs/workshop-design.md`](../docs/workshop-design.md).

```sh
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 <setup|lesson <name>|warmup|check>
```

| Subcomando | Qué hace |
|---|---|
| `setup` | Copia el material de todas las lecciones, instala `uv` si falta (instalador oficial), instala `docling-mcp[local]==3.3.0` (con `--torch-backend cpu` en Linux) y hace el calentamiento. Termina pidiendo reiniciar VS Code |
| `lesson <pocock\|images\|docling\|extra>` | Copia solo el material de esa lección |
| `warmup` | Repite el calentamiento |
| `check` | Informa con ✅/❌ de Node, `uv`, `docling-mcp`, los modelos y el material, e imprime la ruta absoluta de `docling-mcp-server`. Sale con error si algo falla |

El comando se escribe igual en PowerShell, bash y zsh, y se lanza desde la raíz del repo (`package.json` con `"name": "tailspin-toys"`). La copia no sobrescribe ficheros existentes: avisa. Además es idempotente. Si Windows PowerShell bloquea `npx` por la directiva de scripts, se usa `npx.cmd` con los mismos argumentos.

- `cli.mjs`: Node sin dependencias. El `package.json` de la raíz solo publica esta carpeta y no afecta al sitio.
- `docling.mjs`: instalación de `uv` y Docling, ruta del servidor y comprobación de los modelos en la caché de Hugging Face (`HF_HUB_CACHE`, `HF_HOME` o `~/.cache/huggingface`). Un modelo cuenta como descargado solo si están sus pesos.
- `warmup/`: `warmup.pdf` (en inglés; se regenera con `uv run docs/assets/generate-warmup-pdf.py mod/warmup/warmup.pdf`) y `warmup.mjs`, que habla MCP por `stdio` con `docling-mcp-server` (`DOCLING_MCP_CONVERSION_MODE=local`, grupos `conversion manipulation`), convierte el PDF y busca la palabra de control del OCR. No se copia al repo del asistente ni toca su `package.json`.
- `lessons/<name>/`: el material de cada lección, con las rutas tal cual quedan en el repo del asistente. Por ejemplo, `lessons/pocock/.github/skills/implement-lite/SKILL.md` acaba en `.github/skills/implement-lite/SKILL.md`.
- `.gitattributes` marca `mod/**` como `-text`. Así los ficheros llegan byte a byte y el shebang conserva LF.
- Pruebas: `npm test` en la raíz del repo.

## Plan B

Solo para copiar ficheros, si `npx github:` falla:

```sh
npx -y degit@3.10.1 --force emepetres/copilot-devdays-workshop/mod/lessons/<name>#mod-v1 .
```

Copia los mismos ficheros, pero con `--force` sobrescribe los que ya existan: no avisa como `lesson`.
