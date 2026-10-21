# Docling MCP con agentes de Copilot en VS Code

Investigación del ticket #5 (mapa #1). Fecha: 2026-10-21. Versiones probadas: `docling-mcp` 3.3.0 (release del 2026-10-06), `docling-slim` 2.141.0, `mcp` 2.3.0, `torch` 2.14.1+cpu, Python 3.12, Windows 11.

**Resumen:** Docling MCP funciona con Copilot en VS Code por stdio, pero **no con la configuración que trae el README**. En 3.x el modo por defecto es `remote`, que necesita un servidor Docling Serve. El transporte por defecto es `streamable-http`, no stdio. Para el taller hay que lanzarlo con `docling-mcp[local]`, `--transport stdio` y `DOCLING_MCP_CONVERSION_MODE=local`. Ocupa unos **300 MB de descarga y ~1 GB en disco** para Python, más **~570 MB de modelos** que se descargan en la primera conversión. Todo eso tiene que quedar instalado en la **Lección 0**, nunca durante el taller.

Hay dos tipos de afirmación:

- **[fuente]**: viene de código o documentación primaria, enlazada.
- **[medido]**: lo he ejecutado yo en local (i7-13700KF de escritorio, 24 hilos, con fibra). En un portátil de estudiante cabe esperar entre 2 y 4 veces más tiempo.

---

## 1. Qué es y cómo ahorra tokens

`docling-mcp` es el servidor MCP oficial del proyecto Docling (IBM Research / LF AI). Convierte documentos (PDF, DOCX, PPTX, HTML, imágenes…) a un `DoclingDocument` y los guarda en una **caché LRU en memoria** dentro del proceso del servidor. Al modelo solo le devuelve una **clave** del documento. [fuente: `conversion.py`](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/conversion.py), [`shared.py`](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/shared.py)

Así el agente no recibe el documento entero. Lo explora por **anclas** (`#/texts/293`, …):

1. `convert_document_into_docling_document(source)` devuelve `{"from_cache": false, "document_key": "83be…"}`, unos 80 caracteres. [medido]
2. `get_overview_of_document_anchors(key)` devuelve el árbol de títulos con sus anclas, sin el texto de los párrafos. [fuente: `manipulation.py`](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/manipulation.py)
3. `search_for_text_in_document_anchors(key, text)` devuelve las anclas que contienen el texto, sin distinguir mayúsculas. Si no hay coincidencia exacta, busca por palabras clave. [fuente: ídem]
4. `get_text_of_document_item_at_anchor(key, anchor)` devuelve solo el texto de ese elemento. [fuente: ídem]
5. `export_docling_document_to_markdown(key, max_size?)` devuelve el documento entero en Markdown, con un límite opcional de caracteres. Es la opción cara y sirve de contraste en la demo. [fuente: `generation.py`](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/generation.py)

### Números para la demo de ahorro [medido]

Con el paper DocLayNet (arXiv 2206.01062, 9 páginas, 4,3 MB):

| Lo que entra en el contexto | Caracteres | ≈ tokens (caracteres/4) |
|---|---:|---:|
| `export_docling_document_to_markdown` (todo el documento) | 52 489 | ~13 000 |
| `get_overview_of_document_anchors` (índice con anclas) | 5 008 | ~1 250 |
| `search_for_text_in_document_anchors("inter-annotator agreement")` | 134 | ~35 |
| `convert_document_into_docling_document` (solo la clave) | ~80 | ~20 |

El flujo "índice → búsqueda → 2 o 3 párrafos" cabe en ~2 000 tokens, frente a ~13 000 si se vuelca el documento entero. Es **6–10 veces menos** con un solo PDF, y la diferencia crece con más documentos o con documentos más largos. La cifra de tokens es una estimación (caracteres/4). En el taller conviene enseñar el contador real de VS Code (ver §6).

**El coste fijo de las definiciones de herramientas** [medido]: el servidor expone por defecto 21 herramientas en 3 grupos (`conversion`, `generation`, `manipulation`), y sus esquemas JSON suman unos **24 300 caracteres (~6 000 tokens)** en cada petición. Si se cargan solo `conversion manipulation`, quedan 10 herramientas y unos **11 400 caracteres (~2 800 tokens)**. El grupo `generation` sirve para *crear* documentos y el Engineering Reviewer no lo necesita, salvo `export_docling_document_to_markdown` para la demo de contraste. La guía de VS Code también recomienda exponer solo las herramientas que necesita la tarea, porque las definiciones y los resultados ocupan contexto. [fuente: VS Code, *Optimize AI credit usage*](https://code.visualstudio.com/docs/agents/guides/optimize-usage)

Para restringir hay dos opciones, y se pueden combinar:

- pasar los grupos como argumentos al servidor (`docling-mcp-server --transport stdio conversion manipulation`) [fuente: `servers/mcp_server.py`](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/servers/mcp_server.py);
- usar `tools:` en el agente custom (§5).

## 2. Herramientas que expone

Lista completa en 3.3.0 (21 herramientas por defecto) [fuente: código + `list_tools` medido]:

- **conversion**: `convert_document_into_docling_document`, `convert_directory_files_into_docling_document` (convierte todos los ficheros de una carpeta e informa del progreso), `check_document_in_local_cache`, `list_cached_documents`, `remove_document_from_local_cache`.
- **manipulation**: `get_overview_of_document_anchors`, `search_for_text_in_document_anchors`, `get_text_of_document_item_at_anchor`, `update_text_of_document_item_at_anchor`, `delete_document_items_at_anchors`.
- **generation**: `create_new_docling_document`, `export_docling_document_to_markdown`, `save_docling_document` (escribe `.md` y `.json` en la carpeta `_cache`), `get_page_thumbnail`, `add_title_…`, `add_section_heading_…`, `add_paragraph_…`, `open_list_…` / `close_list_…`, `add_list_items_…`, `add_table_in_html_format_…`.
- Grupos opcionales que no se cargan por defecto: `llama-index-rag` (Milvus + embeddings de HuggingFace), `llama-stack-rag` y `llama-stack-ie`. Exigen extras pesados y **quedan fuera del taller**.
- El servidor también registra *prompts* MCP de conversión, generación y manipulación. [fuente: `mcp_server.py`]

Hay dos cosas que tener en cuenta:

- La caché vive **solo en memoria**. Si se reinicia el servidor (por ejemplo, al reiniciar VS Code), hay que volver a convertir. Una segunda conversión del mismo fichero sin reiniciar tarda 0,1 s. [medido]
- El límite por defecto son 10 documentos (`DOCLING_MCP_CACHE_MAX_DOCUMENTS`). [fuente: README]

## 3. Instalación

### Lo que dice el README y por qué no sirve tal cual

El README propone `uvx --from=docling-mcp docling-mcp-server`. [fuente: README](https://github.com/docling-project/docling-mcp/blob/main/README.md) En 3.x eso no funciona para el taller por dos motivos:

1. **El modo por defecto es `remote`.** `DOCLING_MCP_CONVERSION_MODE` vale `remote` por defecto y exige `DOCLING_MCP_SERVICE_URL` y `DOCLING_MCP_SERVICE_API_KEY`, es decir, un Docling Serve. El paquete base solo trae el cliente del servicio (`docling-slim[service-client]`). Para convertir en local hace falta el extra **`docling-mcp[local]`** (`docling-slim[standard]`, que incluye torch, RapidOCR, docling-parse…). Sin él, la fábrica lanza `ImportError: Local conversion mode requires docling-mcp[local] extra`. [fuente: `pyproject.toml`](https://github.com/docling-project/docling-mcp/blob/main/pyproject.toml), [`converters/factory.py`](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/converters/factory.py)
2. **El transporte por defecto es `streamable-http`** (localhost:8000), no stdio. Para que VS Code lo lance como proceso hay que pasar `--transport stdio`. [fuente: `mcp_server.py`, `docling-mcp-server --help` medido]

### Requisitos

- Python ≥ 3.10 (se declaran de 3.10 a 3.14). [fuente: `pyproject.toml`] No hace falta que el alumno lo instale aparte: `uv` descarga su propio Python.
- [`uv`](https://docs.astral.sh/uv/). Es la única instalación manual: en Windows, `winget install astral-sh.uv` o el script de PowerShell; en macOS, `brew install uv` o el script.
- Docling funciona en Windows, macOS y Linux, x86_64 y arm64. **Mac Intel**: no hay wheels de PyTorch 2.6+, así que hay que fijar `torch==2.2.2` o usar `docling[mac_intel]` con Python ≤ 3.12. [fuente: Docling, *Installation*](https://docling-project.github.io/docling/getting_started/installation/) No lo he probado a través de `docling-mcp`, así que es un riesgo para quien llegue con un Mac Intel antiguo.

### Huella [medido, Windows x64]

| Elemento | Tamaño |
|---|---|
| Descarga de wheels (las más grandes: torch 118 MiB, scipy 35, numpy 12, docling-parse 11, pandas 9, pillow 7…) | ~300 MB |
| Entorno instalado (venv) | ~1,0 GB (119 paquetes) |
| Caché de `uv` | ~1,1 GB (se puede limpiar con `uv cache prune`) |
| Modelos descargados de Hugging Face en la **primera conversión**: `docling-layout-heron` 164 MB + `docling-models` (TableFormer, etc.) 342 MB | ~510 MB |
| Modelos de RapidOCR (vienen dentro del wheel) | ~61 MB |
| Tiempo de instalación con `uv` (fibra, escritorio) | ~55 s |

El torch que se instala en Windows y macOS desde PyPI es la versión **CPU** (`2.14.1+cpu`), sin CUDA, así que no se descargan varios GB. La wheel de macOS arm64 pesa 121 MB. [medido / PyPI]

Los modelos se descargan **automáticamente en la primera conversión**, en la caché de Hugging Face (`~/.cache/huggingface/hub`, o `HF_HOME`). También se pueden precargar con `docling-tools models download` y apuntar a ellos con `DOCLING_ARTIFACTS_PATH`. [fuente: Docling, *Advanced options – model prefetching*](https://docling-project.github.io/docling/usage/advanced_options/) No he comprobado que `docling-mcp` respete `DOCLING_ARTIFACTS_PATH`. Lo más sencillo es hacer una **conversión de calentamiento** en la Lección 0 (ver §8).

### OCR

- `DOCLING_MCP_DO_OCR=true` por defecto. [fuente: README]
- El motor que elige Docling en modo `auto` es `ocrmac` en macOS si está instalado. Si no, usa **RapidOCR sobre onnxruntime**, que viene con `[local]`, y como última opción EasyOCR. [fuente: `auto_ocr_model.py`](https://github.com/docling-project/docling/blob/main/docling/models/stages/ocr/auto_ocr_model.py)
- **No hace falta instalar Tesseract** ni ningún binario del sistema. [medido: el OCR de una imagen escaneada funcionó sin nada extra]
- La descripción de imágenes con un modelo de visión (`DOCLING_MCP_DO_PICTURE_DESCRIPTION`) está **desactivada** por defecto y descargaría otro modelo de visión. Hay que dejarla apagada en el taller.

### Tiempos de conversión [medido, escritorio i7-13700KF, CPU]

| Caso | Tiempo |
|---|---|
| Arranque del servidor stdio + `list_tools` | 1,5 s |
| PDF digital de 9 páginas, primera vez (incluye descarga y carga de modelos) | ~32 s |
| El mismo PDF, con los modelos ya descargados, en un servidor nuevo | 22–29 s |
| El mismo PDF ya en caché | 0,1 s |
| Página escaneada (PNG sin capa de texto, 1 página) con OCR | ~31 s (incluye cargar el OCR la primera vez) |

En un portátil de estudiante, un PDF de 5–10 páginas puede tardar **1–2 minutos**. Para el material del taller conviene usar documentos **cortos (1–4 páginas)**.

## 4. Configuración en `.vscode/mcp.json`

Formato de VS Code: objeto `servers` en la raíz; para stdio, `type`, `command`, `args`, `env`, `envFile`, `cwd` (por defecto la carpeta del workspace). Admite `${workspaceFolder}`. [fuente: VS Code, *MCP configuration reference*](https://code.visualstudio.com/docs/agents/reference/mcp-configuration)

**Opción A (recomendada para el taller): instalar en la Lección 0 y lanzar sin red.**

```powershell
# Lección 0, una sola vez
uv tool install "docling-mcp[local]==3.3.0"
```

```jsonc
// .vscode/mcp.json
{
  "servers": {
    "docling": {
      "type": "stdio",
      "command": "docling-mcp-server",
      "args": ["--transport", "stdio", "conversion", "manipulation", "generation"],
      "env": {
        "DOCLING_MCP_CONVERSION_MODE": "local",
        "DOCLING_MCP_DO_PICTURE_DESCRIPTION": "false"
      }
    }
  }
}
```

**Opción B: sin instalación previa, con `uvx`.** En la primera ejecución descarga ~300 MB, así que solo sirve si se ha lanzado antes en casa:

```jsonc
{
  "servers": {
    "docling": {
      "type": "stdio",
      "command": "uvx",
      "args": ["--from", "docling-mcp[local]==3.3.0", "docling-mcp-server", "--transport", "stdio"],
      "env": { "DOCLING_MCP_CONVERSION_MODE": "local" }
    }
  }
}
```

Fijar la versión (`==3.3.0`) evita que `uvx` resuelva una versión nueva el día del taller y vuelva a descargar.

He comprobado la parte del servidor con un cliente MCP stdio (SDK `mcp` de Python): `initialize` + `list_tools` (10 herramientas con `conversion manipulation`) + `convert_document_into_docling_document` funcionan con estos `args`/`env`. [medido] **No lo he probado dentro de VS Code.** Queda pendiente para el ensayo.

Operación en VS Code [fuente: *Manage and troubleshoot MCP servers*](https://code.visualstudio.com/docs/agents/run/manage-mcp-servers):

- `.vscode/mcp.json` hereda **Workspace Trust**: en modo restringido, el servidor no arranca.
- **MCP: List Servers** → *Start / Stop / Restart / Show Output*. Los logs de Docling aparecen en *Show Output*.
- `chat.mcp.autostart` arranca los servidores al enviar un mensaje.
- El sandbox de servidores stdio solo existe en macOS y Linux, no en Windows.

## 5. Agente custom (`.agent.md`)

Los "chat modes" (`.chatmode.md`) ahora se llaman **custom agents**. Son ficheros `.agent.md` en **`.github/agents/`**. Para migrar uno antiguo basta con renombrarlo. Se eligen en el desplegable **Agent** del chat. [fuente: VS Code, *Custom agents*](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

Campos de frontmatter: `name`, `description`, `argument-hint`, `tools`, `agents`, `model`, `reasoning-effort`, `user-invocable`, `disable-model-invocation`, `target`, `handoffs`, `hooks`. Para incluir todas las herramientas de un servidor MCP se escribe **`<nombre del servidor>/*`** en `tools`. `mcp-servers` **no** se usa en VS Code (solo en Copilot cloud agent). [fuente: *Custom agent file reference*](https://code.visualstudio.com/docs/agents/reference/custom-agent-file-reference)

Ejemplo para el Engineering Reviewer:

```markdown
---
name: Revisor de documentación
description: Analiza PDFs, DOCX y escaneados del repo con Docling sin cargarlos enteros en el contexto
tools: ['read', 'search', 'docling/*']
---
Eres un revisor de ingeniería. Para cualquier documento en `docs/` que no sea texto plano:

1. Conviértelo con `convert_document_into_docling_document` (ruta absoluta) y guarda la `document_key`.
2. Pide el índice con `get_overview_of_document_anchors`.
3. Usa `search_for_text_in_document_anchors` y `get_text_of_document_item_at_anchor`
   para leer SOLO los fragmentos que necesitas.
4. NUNCA uses `export_docling_document_to_markdown` sin `max_size`.

Compara lo que dicen los documentos con el código y señala inconsistencias citando el ancla (`#/texts/N`) y el fichero de código.
```

El nombre `docling/*` tiene que coincidir con la clave del servidor en `mcp.json`. Copilot Free/Student solo tiene **selección automática de modelo** [fuente: GitHub Docs, *Plans*](https://docs.github.com/en/copilot/get-started/plans), así que **no hay que fijar `model:`** en el agente.

## 6. Cómo enseñar el ahorro de tokens a un público junior

VS Code ya tiene todo lo necesario, sin herramientas extra [fuente: búsqueda en code.visualstudio.com; *Optimize AI credit usage*](https://code.visualstudio.com/docs/agents/guides/optimize-usage):

- **Indicador de ventana de contexto** en la caja del chat (desde la 1.109). Al pasar el ratón muestra los tokens usados, el desglose por categoría (instrucciones del sistema, definiciones de herramientas, mensajes, resultados de herramientas) y los créditos de IA de la sesión.
- **Pie de cada respuesta**: al pasar el ratón muestra los tokens de entrada, de entrada en caché y de salida de ese turno.
- **Developer: Show Chat Debug View**: el payload exacto que se envió al modelo, con los resultados de las herramientas.
- **Agent Debug Logs → Summary**: tokens totales y llamadas a herramientas de la sesión.

Demo propuesta (2–3 min, dos sesiones de chat nuevas con la misma pregunta: "¿Qué dice el documento de requisitos sobre X?"):

1. **Sesión A, "a lo bruto"**: el agente llama a `export_docling_document_to_markdown` sin límite (o se le pega el Markdown). Se enseña el indicador de contexto: unos 13k tokens solo de documento.
2. **Sesión B, con el agente custom**: índice → búsqueda → anclas. Se enseña el indicador: unos 2k tokens.
3. Mensaje para el público: *"menos tokens = más créditos de tu plan Free y respuestas más centradas"*. En Free/Student los créditos son mensuales [fuente: GitHub Docs, *Plans*], así que el ahorro se nota en el bolsillo.
4. Extra: enseñar en el desglose cuánto ocupan las **definiciones de herramientas** (~6k tokens con 21 herramientas, ~2,8k con 10). Así se ve por qué conviene limitar `tools:`.

**Riesgo de la demo**: la selección automática de modelo y la decisión del agente sobre qué herramientas llamar no son deterministas. Hay que tener **capturas de pantalla de los dos indicadores** como plan B.

No he comprobado qué hace el agente de Copilot si se le pide leer un PDF directamente con su herramienta de lectura de ficheros, ni si VS Code permite adjuntar PDFs al chat en Free. Se puede usar como tercer contraste ("sin Docling no puede leerlo, o lo lee mal"), pero hay que verificarlo en el ensayo.

## 7. Planes Copilot Free / Student

Según GitHub Docs [fuente: *Plans*](https://docs.github.com/en/copilot/get-started/plans), **agent mode** y **MCP** están incluidos en Free y en Student. Los modelos son solo de **selección automática**, y ambos planes tienen una cuota mensual de créditos de IA (la página no da la cifra). Una organización puede restringir los servidores MCP mediante políticas, pero eso no aplica a cuentas personales.

## 8. Riesgos para el taller en vivo y mitigaciones

| Riesgo | Gravedad | Mitigación |
|---|---|---|
| **Descargas pesadas con la wifi del evento**: ~300 MB de wheels + ~510 MB de modelos de Hugging Face en la primera conversión. Con 30–50 alumnos a la vez, imposible. | **Alta (el principal)** | Lección 0 obligatoria: `uv tool install "docling-mcp[local]==3.3.0"` **y una conversión de calentamiento** (convertir el PDF del taller desde el agente o con `docling` una vez) para que los modelos queden en caché. Una casilla en la Lección 0: "he visto el `document_key`". |
| Usar la configuración del README (modo `remote` por defecto, transporte HTTP por defecto) | Alta | Dar el `.vscode/mcp.json` ya hecho en el repo del taller, con `--transport stdio` y `DOCLING_MCP_CONVERSION_MODE=local`. |
| Conversión lenta en portátiles (1–2 min por PDF de 9 páginas; OCR lento) | Media | Documentos cortos (1–4 páginas) y un único escaneado de 1 página. Convertir al principio de la lección y explicar mientras tanto. La caché hace que la segunda vez sea instantánea (si no se reinicia el servidor). |
| **Rutas largas en Windows** (MAX_PATH): reproduje `WinError 206` / `FileNotFoundError` al poner `HF_HOME` y la caché de `uv` en rutas profundas. | Media | Usar las rutas por defecto (`~/.cache/huggingface`, `%LOCALAPPDATA%\uv`). Avisar en la Lección 0 de no clonar en rutas muy profundas. Si falla, activar *LongPathsEnabled*. |
| Caché solo en memoria: al reiniciar VS Code o el servidor se pierde | Baja | Volver a convertir. Avisar de que la `document_key` cambia de sesión a sesión. |
| Mac Intel (torch ≥ 2.6 no tiene wheels) | Baja–media | Pedir que se pruebe en la Lección 0. Plan B: emparejarse con un compañero o usar Codespaces (opcional en el mapa). |
| Agente no determinista (selección automática de modelo): puede no usar las anclas o volcar el documento entero | Media | Instrucciones explícitas en `.agent.md`, `tools:` restringido y capturas o salidas pregeneradas como plan B. |
| Workspace Trust: en modo restringido, el servidor de `.vscode/mcp.json` no arranca | Baja | Paso explícito "Confiar en el workspace" en la Lección 0. |

## 9. Pendiente de verificar en el ensayo

- Probar el flujo completo dentro de VS Code (servidor arrancado desde `mcp.json`, agente custom, contador de contexto) en Windows y en macOS arm64.
- Ver qué hace Copilot ante un PDF sin Docling (para el contraste de la demo).
- Comprobar si VS Code tiene un *timeout* de llamada a herramienta que corte conversiones largas. La documentación no lo menciona; el README de docling-mcp lo cita para LM Studio.
- Comprobar si `docling-mcp` respeta `DOCLING_ARTIFACTS_PATH` (precarga de modelos en una carpeta del repo o en un USB como plan B para quien no hizo la Lección 0).

## Fuentes

- docling-mcp: [README](https://github.com/docling-project/docling-mcp/blob/main/README.md), [pyproject.toml](https://github.com/docling-project/docling-mcp/blob/main/pyproject.toml), [servers/mcp_server.py](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/servers/mcp_server.py), [tools/conversion.py](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/conversion.py), [tools/manipulation.py](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/manipulation.py), [tools/generation.py](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/generation.py), [tools/converters/factory.py](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/converters/factory.py), [tools/converters/local.py](https://github.com/docling-project/docling-mcp/blob/main/docling_mcp/tools/converters/local.py), [docs/integrations](https://github.com/docling-project/docling-mcp/tree/main/docs/integrations)
- Docling: [Installation](https://docling-project.github.io/docling/getting_started/installation/), [Advanced options (model prefetching)](https://docling-project.github.io/docling/usage/advanced_options/), [auto_ocr_model.py](https://github.com/docling-project/docling/blob/main/docling/models/stages/ocr/auto_ocr_model.py), [docling-slim en PyPI](https://pypi.org/project/docling-slim/)
- VS Code: [Add and manage MCP servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers), [MCP configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration), [Manage and troubleshoot MCP servers](https://code.visualstudio.com/docs/agents/run/manage-mcp-servers), [Custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents), [Custom agent file reference](https://code.visualstudio.com/docs/agents/reference/custom-agent-file-reference), [Optimize AI credit usage](https://code.visualstudio.com/docs/agents/guides/optimize-usage), [Chat Debug view](https://code.visualstudio.com/docs/copilot/chat/chat-debug-view), [Release notes 1.109](https://code.visualstudio.com/updates/v1_109)
- GitHub: [Copilot plans](https://docs.github.com/en/copilot/get-started/plans)
- Mediciones propias: scripts en el scratchpad de la sesión (instalación con `uv` en un venv aislado, conversión del [paper DocLayNet](https://arxiv.org/pdf/2206.01062), una página renderizada a PNG en escala de grises para simular un escaneado y un cliente MCP stdio).
