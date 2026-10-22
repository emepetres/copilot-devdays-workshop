# Diseño del workshop: GitHub Copilot Dev Days Sevilla

## 1. Resumen

**Workshop** de 3 h, en español, de los GitHub Copilot Dev Days de Sevilla: miércoles 28 de octubre de 2026, 18:00–21:00, Espacio RES. Se retransmite por YouTube ([evento en Luma](https://luma.com/h8739h67)).

Los asistentes parten de la app del **workshop base**, Tailspin Toys. Primero aprenden lo esencial de GitHub Copilot en VS Code: instrucciones, agent mode y MCP. Después adoptan el **flujo de Matt Pocock** y con él construyen el **Engineering Reviewer**: un *custom agent* que revisa a la vez la documentación (PDF, escaneados y diagramas) y el código de Tailspin Toys, y detecta inconsistencias entre requisitos, arquitectura e implementación.

Como en los workshops publicados, no todo cabe en 3 h: lo que no se termine en la sesión se completa en casa.

Este documento recoge el diseño. La redacción detallada de cada lección es un esfuerzo posterior, con una sesión por lección.

## 2. Público, entorno y plan

- **Público**: estudiantes y perfiles junior. La complejidad es similar a la de los workshops publicados, y lo complejo va al final o en la **lección extra**.
- **Entorno**: VS Code con Copilot agent mode **en local**. Codespaces es opcional.
- **Plan de Copilot**: diseñado para **Free / Student**, sin funciones exclusivas de Business/Enterprise y con el modelo *Auto*.
- **Lección 0** (prerrequisitos) obligatoria antes de venir, sobre todo por Docling (~1,5 GB).

## 3. Workshop base

La pista **VS Code** de *Real-world development* (`github-samples/copilot-workshops`, `real-world-development/vscode/`, licencia MIT), con la app **Tailspin Toys** (Astro + Drizzle + SQLite, tests y backlog de issues).

- **Se conservan** sus lecciones 1 (Custom instructions), 2 (Agent Mode) y 3 (MCP with Playwright). Se traducen y adaptan mínimamente: local en lugar de Codespace, modelo *Auto* y la PR de la lección 3 pasa a ser opcional.
- **Se descartan** las lecciones 4–6 y Foundry.
- **Fuente de texto en español** para traducir: la pista *Copilot app* y *First steps — VS Code*.

Material en Markdown por lección (`lessons/`), visible directamente en GitHub. Como en la base, un sitio Astro + Starlight (`website/`) lo publica en **GitHub Pages** (<https://emepetres.github.io/copilot-devdays-workshop/>), solo en español. Ver `AUTHORING.md`.

## 4. Índice de lecciones

Numeración consecutiva. Entre paréntesis, la lección de la base de la que procede.

| # | Lección | Objetivo | Min | Dónde | % reutilizado | Qué cambia respecto a la base |
|---|---|---|---|---|---|---|
| 0 | Prerrequisitos | Llegar con todo instalado y el repo creado desde la plantilla del workshop | — | Antes de venir | ~40 % | Local en lugar de Codespace; añade `gh`, plugins, Playwright, `uv` + Docling y la conversión de calentamiento |
| 1 | Custom instructions (base 1) | Dar contexto al agente con `copilot-instructions.md` e `instructions/*.md` | 20 | Sesión | ~90 % | Traducción, local, modelo *Auto* |
| 2 | Agent mode (base 2) | Implementar el filtrado del catálogo con agent mode | 20 | Sesión | ~90 % | Traducción, local, modelo *Auto* |
| 3 | El flujo de Matt Pocock | Qué es una skill; afinar con `/grill-with-docs` y construir con `/implement-lite` la ordenación del catálogo | 50 | Sesión | ~10 % | Nueva; reutiliza la explicación de skills de la pista app (lección 5) |
| 4 | Una skill que analiza imágenes | Escribir la skill `review-diagram`, que contrasta `docs/architecture.png` con el código | 25 | Sesión | 0 % | Nueva |
| 5 | Playwright MCP (base 3) | Añadir un MCP en `.vscode/mcp.json` y probar en el navegador | 15 | Sesión (PR, en casa) | ~85 % | Traducción, local, *Auto*; la PR con GitHub MCP pasa a opcional |
| 6 | El Engineering Reviewer con Docling MCP | Crear el custom agent con la skill `review-documents` (Docling) y `review-diagram` y lanzar la revisión | 28 (+7 en casa) | Sesión (demo A/B de tokens, en casa) | ~5 % | Nueva; reutiliza el patrón de `mcp.json` de la lección 5 |
| Extra | Orquestación por código (MAF + Copilot SDK) | Reimplementar el Engineering Reviewer como secuencia de 3 agentes en Python | ~45 | En casa | 0 % | Nueva. **Se construye la última; puede caer si no hay tiempo** |

A partir de la lección 3, cada lección nueva incluye un paso para **afinar la idea antes de construir**. Ese paso ofrece dos vías: el flujo de Matt Pocock (`/grill-with-docs`), que es la vía por defecto, o Plan mode. Las lecciones base no se tocan.

### Resumen por lección nueva

- **3 · Flujo de Matt Pocock** ([decisión](https://github.com/emepetres/copilot-devdays-workshop/issues/8)). Pasos:
  1. Se lee la skill `quality-checks` para entender qué es una skill.
  2. Se instala el plugin oficial `mattpocock/skills` sin modificar y se ejecuta `/setup-matt-pocock-skills` con las respuestas por defecto.
  3. Se afina con `/grill-with-docs` la issue de ordenación (rama `sorting`). Deja `GLOSSARY.md`, un ADR si hace falta y la spec como comentario en la issue.
  4. Se presenta Plan mode como alternativa.
  5. Se construye con `/implement-lite`, que llama a `/tdd` y `/quality-checks`, hace una review ligera y un commit.
- **4 · Skill de imágenes** ([decisión](https://github.com/emepetres/copilot-devdays-workshop/issues/9)). Pasos:
  1. Se afina con `/grill-with-docs` y se escribe la skill con `/writing-for-agents`.
  2. La skill `review-diagram` (en inglés) lee el PNG del disco y toma el código como fuente de verdad.
  3. Deja el informe en `docs/reviews/architecture-diagram.md`.
- **6 · Engineering Reviewer** ([decisión](https://github.com/emepetres/copilot-devdays-workshop/issues/10)). Pasos:
  1. Se añade Docling a `mcp.json`.
  2. Se afina la idea.
  3. Se escriben la skill `review-documents` (índice → búsqueda → anclas) y `.github/agents/engineering-reviewer.agent.md`, un custom agent delgado con `tools:` restringido. Incluye el recuadro "skill vs. custom agent".
  4. Se lanza la revisión. Deja el informe único en `docs/reviews/engineering-review.md`.
- **Extra · Orquestación** ([decisión](https://github.com/emepetres/copilot-devdays-workshop/issues/11)):
  - `SequentialBuilder` con `GitHubCopilotAgent` (Python/`uv`, carpeta `reviewer/`) y 3 agentes: diagrama → documentos → sintetizador.
  - Los prompts se cargan de los `SKILL.md`.
  - Plan B: solo Copilot SDK, con las sesiones encadenadas en Python.

Todas las lecciones nuevas incluyen una **solución plegable**, que sirve también de plan B.

## 5. Agenda de la sesión (180 min)

| Bloque | Min | Acumulado |
|---|---|---|
| Apertura: objetivo, Engineering Reviewer, material | 5 | 5 |
| 1 · Custom instructions | 20 | 25 |
| 2 · Agent mode | 20 | 45 |
| 3 · El flujo de Matt Pocock | 50 | 95 |
| 4 · Una skill que analiza imágenes | 25 | 120 |
| 5 · Playwright MCP (sin PR) | 15 | 135 |
| 6 · El Engineering Reviewer con Docling MCP (sin la demo A/B) | 28 | 163 |
| Cierre: recapitulación y mención de la lección extra con su salida pregrabada | 5 | 168 |
| **Colchón** | **12** | **180** |

**Para casa**:

- Lo que no se termine en la sesión.
- La PR opcional de la lección 5.
- La demo A/B de ahorro de tokens de la lección 6, que el ponente enseña en directo con las capturas de referencia.
- La ampliación del Engineering Reviewer para leer issues con `gh`.
- La lección extra completa.

## 6. Material añadido a Tailspin Toys

Los asistentes crean su repo desde una **plantilla del workshop** propia, derivada de la plantilla de Tailspin Toys. Contiene:

- `.github/skills/implement-lite/SKILL.md`: la variante ligera de `implement`.
- `docs/architecture.png`: el diagrama en estilo pizarra (Excalidraw). Su fuente se guarda **fuera** de la plantilla.
- `docs/` con un PDF de requisitos de 2–3 págs. y un escaneado de 1 pág. (acta), ambos en español.
- `reviewer/`: el esqueleto `uv` de la lección extra, con TODOs y un agente de ejemplo.
- `scripts/docling-warmup/`: el PDF y el script de la conversión de calentamiento de la lección 0 (`npm run docling:warmup`). Va fuera de `docs/` para que el Engineering Reviewer no lo revise.

Lo que **no** va en la plantilla:

- La línea "Responde siempre en español" en `copilot-instructions.md`, que añade el asistente en la lección 3.
- Las soluciones plegables, que van en el material de cada lección.

### Inconsistencias sembradas

Todas se contrastan con el código de la plantilla, que es determinista.

| # | Fuente | Inconsistencia |
|---|---|---|
| 1 | Diagrama | Caja "REST API (Flask)" llamada en runtime; el sitio es estático (`output: 'static'`) |
| 2 | Diagrama | PostgreSQL en lugar de SQLite |
| 3 | Diagrama | Tabla `Backers` inexistente en `db/schema.ts` |
| 4 | PDF de requisitos | Requisito funcional ↔ código (p. ej. "un juego puede pertenecer a varias categorías") |
| 5 | PDF de requisitos | Requisito no funcional ↔ código (p. ej. "el catálogo se actualiza en tiempo real") |
| 6 | Escaneado (acta) | Decisión del acta ↔ código |

El texto concreto de las inconsistencias 4–6 se escribe al redactar la lección 6.

## 7. Lección 0: prerrequisitos

Se hace antes de venir, sin consumir tiempo de la sesión:

1. Cuenta de GitHub con Copilot Free o Student activado.
2. VS Code ≥ 1.112 con Copilot Chat. Activar `chat.plugins.enabled`.
3. Git y Node.js en la versión que exige Tailspin Toys (`node:sqlite`, ≥ 22.x).
4. `gh` instalado y `gh auth login`.
5. Repo creado desde la plantilla del workshop, clonado y con `npm install`.
6. Navegador de Playwright instalado (`npx playwright install chromium`).
7. `uv`, `uv tool install "docling-mcp[local]==3.3.0"` y una **conversión de calentamiento** con `npm run docling:warmup`. Descarga ~510 MB de modelos.
   - Convierte un **PDF de calentamiento** propio, `scripts/docling-warmup/calentamiento.pdf`, y no el PDF de requisitos de la lección 6. Así la lección 0 no espera a los documentos sembrados ([#16](https://github.com/emepetres/copilot-devdays-workshop/issues/16)). Tiene una página de texto con una tabla y una página escaneada, para que se descarguen los modelos de layout, tablas y OCR. Su generador está en `docs/assets/generate-warmup-pdf.py`.
   - El script arranca `docling-mcp-server` por `stdio` con `DOCLING_MCP_CONVERSION_MODE=local` y los grupos `conversion manipulation`. Cuando la lección 6 añada Docling a `.vscode/mcp.json`, debe usar la misma configuración. El script también comprueba que el OCR lee una palabra de control de la página escaneada.
8. Avisos: Workspace Trust y rutas largas en Windows.

MAF no añade nada aquí, porque se instala en la propia lección extra (`uv sync`).

## 8. Lección extra

Se hace en casa (~45 min) y **no aparece en la descripción pública**. **Se construye la última y puede caer si no hay tiempo.** En el cierre de la sesión solo se menciona, en 1–2 min, con la salida pregrabada. Ampliación propuesta: `ConcurrentBuilder` para los agentes de diagrama y documentos.

## 9. Riesgos y ensayo pendiente

Hay que ensayar con una **cuenta Free y el modelo Auto** antes del 28 de octubre.

| Comprobar | Plan B |
|---|---|
| `/grill-with-docs` espera las respuestas y responde en español | Plan mode |
| `/implement-lite` funciona; probar también el `implement` original | Agent mode a pelo y luego `/quality-checks` |
| La skill `review-diagram` lee `docs/architecture.png` del disco | Adjuntar la imagen en el chat; informe pregenerado |
| Docling en VS Code (Windows y macOS arm64), timeouts de herramienta, comportamiento con un PDF sin Docling | Trabajar en pareja; Markdown ya convertido en `docs/reviews/_docling/` |
| `DOCLING_ARTIFACTS_PATH` para repartir los modelos por USB | Sin USB: depender de la lección 0 |
| El Engineering Reviewer llama a sus skills y respeta `tools:` | Solución plegable |
| VS Code detecta agentes en `.claude/agents/` (para el recuadro) | Mencionarlo sin demo |
| Lección extra: `GitHubCopilotAgent` dentro de `SequentialBuilder` con Free, créditos por ejecución, si `auto` elige un modelo con visión | Solo Copilot SDK; si también falla, cae la lección extra |

## 10. Decisiones

El detalle de cada decisión está en su ticket del [mapa](https://github.com/emepetres/copilot-devdays-workshop/issues/1):

- [Catálogo de workshops Dev Days y recomendación de base](https://github.com/emepetres/copilot-devdays-workshop/issues/2)
- [Skills de Matt Pocock en GitHub Copilot](https://github.com/emepetres/copilot-devdays-workshop/issues/3)
- [Análisis de imágenes desde una skill de Copilot](https://github.com/emepetres/copilot-devdays-workshop/issues/4)
- [Docling MCP con agentes de Copilot en VS Code](https://github.com/emepetres/copilot-devdays-workshop/issues/5)
- [Viabilidad de MAF + Copilot SDK para la lección extra](https://github.com/emepetres/copilot-devdays-workshop/issues/6)
- [Elegir el workshop base y sus lecciones conservadas](https://github.com/emepetres/copilot-devdays-workshop/issues/7)
- [Diseño de la lección del flujo de Matt Pocock](https://github.com/emepetres/copilot-devdays-workshop/issues/8)
- [Diseño de la lección de skill que analiza imágenes](https://github.com/emepetres/copilot-devdays-workshop/issues/9)
- [Diseño de la lección del agente con Docling MCP](https://github.com/emepetres/copilot-devdays-workshop/issues/10)
- [Decidir la lección extra de orquestación (MAF / Copilot SDK)](https://github.com/emepetres/copilot-devdays-workshop/issues/11)
- [Documento de diseño y descripción pública del workshop](https://github.com/emepetres/copilot-devdays-workshop/issues/12)
