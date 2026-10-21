# Catálogo de workshops Dev Days y recomendación de workshop base

> Investigación para el ticket #2 (mapa #1). Fecha de consulta: 2026-10-21.
> Fuentes primarias: la web oficial <https://dev-days.github.com/> (y su `archive.html`), los repos de GitHub enlazados (leídos con `gh api`) y la página de planes de Copilot en docs.github.com. Cada afirmación lleva su fuente; las duraciones por lección que no aparecen en el material son **estimaciones mías** (marcadas como "≈ est.") a partir del número de palabras y pasos de cada lección.

## Resumen

- La página `#workshops` lista **5 workshops** de la temporada actual, centrada en la **GitHub Copilot app** y la CLI. **Ninguno de los 5 enlaza a una pista de VS Code**, pero dos de ellos viven en repos que **también tienen pista de VS Code**: `github-samples/copilot-workshops` (First steps y Real-world development) y `copilot-dev-days/mona-mayhem`. Fuente: <https://dev-days.github.com/> (HTML descargado); árbol de `github-samples/copilot-workshops`.
- Los workshops específicos de VS Code agent mode (Agent Lab ×4, Mona Mayhem pista VS Code, App Modernization…) están en el **archivo** (<https://dev-days.github.com/archive.html>): "no longer part of the current event format, but still available for self-guided learning".
- **Todo el material revisado es MIT** → se puede reutilizar, traducir y adaptar manteniendo el aviso de copyright.
- Ningún workshop toca **visión/imágenes** (salvo los de Visual Studio y Xcode, archivados, que mencionan "Copilot Vision") ni **Docling**. **Skills**, **MCP** y **agentes custom** sí aparecen en varios.
- **Recomendación**: 1ª opción **Real-world development — pista VS Code** (app Tailspin Toys); 2ª opción **First steps — pista VS Code** (Space Quiz). Detalle y razones al final.

## 1. Lo que hay en `#workshops` (temporada actual)

Fuente de toda esta sección salvo indicación: <https://dev-days.github.com/> ("This season of Dev Days focuses on the GitHub Copilot app for agent-driven development"; "General Prerequisites: GitHub Copilot Free Subscription, GitHub Copilot App, Laptop"). La web tiene versión en español en <https://copilot-dev-days.github.io/es/>.

| # | Workshop (en la web) | Enlace | Nivel / duración (web) | Repo |
|---|---|---|---|---|
| 1 | First Steps with the GitHub Copilot App | `github-samples.github.io/copilot-workshops/first-steps/copilot-app/` | Beginner, ~1–1,5 h | `github-samples/copilot-workshops` |
| 2 | Real-world Development with the GitHub Copilot App | `github-samples.github.io/copilot-workshops/real-world-development/app/` | Intermediate, ~1–1,5 h | `github-samples/copilot-workshops` + app `github-samples/tailspin-toys` |
| 3 | Copilot CLI Workshop | `gh.io/dev-days/workshop/cli` → redirige a `…/copilot-workshops/first-steps/copilot-cli/` (comprobado con `curl -I`) | ~2 h | `github-samples/copilot-workshops` |
| 4 | Mona Mayhem | `copilot-dev-days.github.io/mona-mayhem/?track=cli` | ~60 min | `copilot-dev-days/mona-mayhem` |
| 5 | Copilot SDK Workshop | `github.github.com/copilot-sdk-workshop/` | ~30–115 min | `github/copilot-sdk-workshop` |

Nota: la tarjeta 3 dice "with the Tailspin Toys project", pero el enlace corto lleva a *First steps / Copilot CLI*, que construye el Space Quiz desde cero. Hay incoherencia en la web.

### 1.1 `github-samples/copilot-workshops` (workshops 1, 2 y 3)

- **Licencia**: MIT (`LICENSE`, "Copyright (c) 2023 GitHub"). Los *First steps* están "adapted from James Montemagno's First Steps with GitHub Copilot (MIT)" (`README.md`).
- **Formato**: Markdown por lección en `docs/`, publicado en GitHub Pages con **Astro + Starlight** (`website/`, `workflows/pages.yml`). Árboles traducidos en `docs/es-es/`, `ja-jp`, `ko-kr`, `pt-br`, `zh-cn`. El repo incluye una skill `localizations` con reglas `es-es.md` y un workflow `localization-sync.yml`. Fuente: `README.md` y árbol del repo.
- **Estructura**: dos familias, cada una con varias pistas (entornos):
  - `first-steps/` → `copilot-app/`, `copilot-cli/`, `vscode/` — "Every workshop builds the same Space Quiz from an empty folder" (`docs/first-steps/README.md`).
  - `real-world-development/` → `app/`, `cli/`, `cloud/`, `vscode/` — escenario Tailspin Toys con backlog de issues (`docs/real-world-development/README.md`).

#### Workshop 1 — First steps / Copilot app

13 lecciones (0–13: prerequisites, create workspace, build and polish, inspect and test, project instructions, publish, issues and sessions, plan mode, review loop, automations, remote, canvas, deploy pages, review). Requiere instalar la **Copilot app** (escritorio). Traducido a `es-es` (falta `12-deploy-pages`). Fuente: árbol `docs/first-steps/copilot-app/` y `docs/es-es/first-steps/copilot-app/`.

#### Workshop 2 — Real-world development / Copilot app

11 lecciones: 0 Prerequisites · 1 Install the Copilot app · 2 Add star ratings · 3 Agent modes (Plan/Autopilot) · 4 Custom instructions · **5 Customize and use a quality-checks skill** · **6 Playwright MCP** · **7 Create and use a QA agent** (agente custom) · 8 Create and merge the feature PR (Agent Merge) · 9 Canvases · 10 Wrap-up; opcional *Foundry canvas*. Prerrequisitos: plan **Copilot Student, Pro, Pro+, Business o Enterprise**, Git, Node.js. Traducido completo a `es-es`. Fuente: `docs/real-world-development/app/README.md`.

#### Workshop 3 — First steps / Copilot CLI

11 lecciones (0–10: prerequisites, build, project instructions, publish, issues and sessions, plan mode, context, resume and remote, pull request, delegate, review). Terminal (`copilot`). Traducido a `es-es`. Fuente: árbol `docs/first-steps/copilot-cli/`.

### 1.2 Mona Mayhem (workshop 4) — `copilot-dev-days/mona-mayhem`

- **Objetivo**: construir una "GitHub Contribution Battle Arena" retro que compara gráficas de contribuciones de dos usuarios.
- **Pistas**: **VS Code** (Chat, Plan Mode, Agent Mode, background agents) y **CLI** (la web actual enlaza `?track=cli`; el archivo enlaza `?track=vscode`).
- **Lecciones** (7): 00 Overview · 01 Setup & Context Engineering · 02 Plan & Scaffold · 03 Build the Game · 04 Design-First Theming · 05 Polish & Parallel Work · 06 Bonus. Duración total "~1 hour", nivel "Intermediate" (`workshop/00-overview.md`).
- **Stack**: Astro 6 + Node adapter, API de contribuciones de GitHub.
- **Prerrequisitos**: "GitHub Copilot (Pro, Business, or Enterprise)", Git, Node.js, VS Code 1.107+.
- **Formato**: Markdown en `workshop/` + visor HTML en `docs/step.html` (GitHub Pages). Traducido a `workshop/es/` completo.
- **Licencia**: MIT. Fuente: `README.md` y árbol del repo.

### 1.3 Copilot SDK Workshop (workshop 5) — `github/copilot-sdk-workshop`

- **Objetivo**: construir agentes **por código** con el GitHub Copilot SDK. Tres opciones: **SDK 101** (exactamente 30 min; hello world en streaming + agente de podcast con herramientas RSS), **Accessibility Reviewer** (~115 min; inspecciona una web, consulta guía WCAG, informe con evidencias, herramientas locales + **MCP**) y **Museum Exhibit Studio** (~90 min).
- **Lenguajes**: .NET, Node/TS, Python, Go, Rust, Java (se elige uno). Requiere el runtime, **Copilot CLI** y un navegador (Edge/Chrome).
- **Formato**: lecciones en `workshop/`, visor HTML en `docs/` (GitHub Pages), traducciones en `localizations/es-es/`.
- **Licencia**: MIT. Fuente: `README.md`.
- Relevancia: es la alternativa "oficial Dev Days" más cercana a una **lección extra de orquestación por código** (en lugar de MAF).

## 2. Workshops archivados relevantes (VS Code)

Fuente: <https://dev-days.github.com/archive.html>.

| Workshop | Repo | Lo esencial |
|---|---|---|
| **Agent Lab** (Python / TypeScript / Java / .NET) | `copilot-dev-days/agent-lab-*` | "Build a Social Bingo game while mastering VS Code's Agent Mode… context engineering, custom agents". ~1 h, 4 partes, 9 pasos (web). Lecciones: 00 Overview · 01 Setup & Context Engineering · 02 Design-First Frontend · 03 Custom Quiz Master (agentes custom) · 04 Multi-Agent Development (hooks de VS Code + agentes TDD Red/Green/Refactor como subagentes) · 05 Completion. Nivel "Intermediate", VS Code 1.135+, Node 22 (TS). Incluye `.github/agents/*`, `.github/skills/*` (TS), `.github/hooks/*`, `.solutions/` por paso. Markdown en `workshop/` + `workshop/es/` completo. MIT. Fuente: `README.md`, `workshop/00-overview.md`, `workshop/04-multi-agent.md`, árboles. |
| Mona Mayhem (pista VS Code) | ver 1.2 | — |
| App Modernization (Java 8→21) | `copilot-dev-days/appmod-workshop-java` | ~60 min, 6 pasos; Java/Spring. |
| Agentic Workflows (`gh aw`) | `copilot-dev-days/agentic-workflows-workshop` | ~75 min, 3 ejercicios; GitHub Actions. |
| Copilot for Visual Studio / JetBrains / Xcode | `copilot-dev-days/visual-studio-lab`, `jetbrains-workshop`, `xcode-workshop` | ~60 min; otros IDEs. VS y Xcode citan **Copilot Vision**. |
| GitHub Skills (5 labs) | `github/skills/*` | "Codespaces only". |

También existe en la org `copilot-dev-days/tailspin-toys-workshop` (versión antigua de Tailspin con Flask + Astro + Svelte, pista CLI, "90-min event kickstart") y `copilot-cli-deep-dive-workshop` (13 módulos, ~4,5 h, CLI). Fuente: `gh repo list copilot-dev-days` y sus READMEs.

## 3. Las dos pistas de VS Code del repo `copilot-workshops` (candidatas principales)

Aunque la web no las enlaza, son material **actual** (lastUpdated 2026-06/09, repo actualizado 2026-10-20) del mismo repo oficial que los workshops 1–3.

### 3.1 Real-world development — VS Code (Tailspin Toys)

Fuente: `docs/real-world-development/vscode/README.md` y lecciones 0–6.

- **Objetivo**: "drive Copilot Chat in agent mode, connect external tools through MCP, and rely on custom agents" sobre una app real con backlog.
- **Lecciones** (7 + opcional):

| Lección | Tema | Qué se hace | Duración ≈ est. |
|---|---|---|---|
| 0. Prerequisites | Setup | Repo desde plantilla (crea el backlog de issues automáticamente) + Codespace | 10 min (+ espera del Codespace) |
| 1. Custom instructions | Contexto | Explora `.github/copilot-instructions.md` e `instructions/*.md` (`applyTo`), genera un helper, añade una regla de TSDoc y ve el cambio | 20–25 min |
| 2. Agent Mode | Generación | Arranca la web, explora el backlog con agent mode, implementa el **filtrado** (UI + datos + tests) | 20–25 min |
| 3. MCP with Playwright | Herramientas | Añade Playwright MCP en `.vscode/mcp.json`, prueba el filtrado en el navegador, crea la PR con el GitHub MCP | 20 min |
| 4. Custom Agents | Agentes | Usa un agente custom de accesibilidad (high-contrast) | 15 min |
| 5. Managing Agents | Supervisión | Monitoriza/dirige el agente (añadir light mode), revisa el working set | 10–15 min |
| 6. Iterating | Revisión | Publica rama, PR, revisión del diff | 10–15 min |
| Opcional: Foundry Toolkit | IA | Modelo + agente en Azure AI Foundry | — |

- **App** — `github-samples/tailspin-toys` (MIT, plantilla): web de crowdfunding de juegos; **Astro 7** estático + **Drizzle ORM + SQLite** (Node), **Tailwind 4**, **Vitest**, **Playwright**, ESLint, TypeScript 7 (`tsgo`). Ya trae `.github/copilot-instructions.md`, 6 `instructions/*.md`, **skill `quality-checks`** y `make-contribution`, `.vscode/mcp.json` (GitHub MCP), `.devcontainer`, 9 issues de backlog sembrados (`.github/bootstrap-issues/01…09`), una "canvas" extension. Requiere Node 22.13+. Fuente: `README.md` y árbol de `tailspin-toys`.
- **Entorno**: pensado para **Codespaces**; "If you'd prefer to run it locally, open the cloned repository in VS Code and select **Reopen in Container**" (lección 0). Local sin contenedor también es viable (`npm ci && npm run dev`, README de la app), pero el texto de las lecciones dice "Return to your codespace" en todos los pasos → habría que adaptarlo.
- **Prerrequisitos de plan**: "Copilot Student, Pro, Pro+, Business, or Enterprise" + acceso a Codespaces.
- **Español**: **traducción parcial**. En `docs/es-es/real-world-development/vscode/` solo existen `README.md`, `6-iterating.md` y el opcional Foundry; **faltan las lecciones 0–5**. Sí están traducidas las lecciones equivalentes de las pistas `app/` y `cli/` (custom instructions, skills, MCP, agentes), útiles como base de traducción. Fuente: árbol del repo.
- **Skills / MCP / agentes / visión**: MCP sí (GitHub + Playwright), agentes custom sí, **skills no en la pista VS Code** (sí en `app/5-agent-skills.md` y `cli/5-agent-skills.md`, usando la skill `quality-checks` de la app), visión no.
- **Avisos detectados**:
  - La lección 4 abre `.github/agents/accessibility.md`, pero **ese fichero no existe hoy en la plantilla `tailspin-toys`** (el árbol actual no tiene `.github/agents/`). La pista VS Code (lastUpdated 2026-06-30) va por detrás de la app.
  - Las lecciones fijan modelos concretos ("Claude Sonnet 4.5"); con Copilot Free/Student solo hay **"Auto model selection only"** (ver §5) → cambiar a *Auto*.

### 3.2 First steps — VS Code (Space Quiz)

Fuente: `docs/first-steps/vscode/README.md` y lecciones.

- **Objetivo**: "beginner-friendly, hands-on tour of GitHub Copilot in Visual Studio Code"; "approximately 60 to 90 minutes"; "a single HTML file with no runtime dependencies".
- **Lecciones** (11):

| Lección | Tema | Duración ≈ est. |
|---|---|---|
| 0. Prerequisites and setup | VS Code, extensión GitHub PRs & Issues, carpeta vacía, modelo | 5 min |
| 1. Build in the workspace | Construir el quiz, navegador integrado | 10 min |
| 2. Capture project instructions | `/init` → `.github/copilot-instructions.md` | 5–10 min |
| 3. Inspect context and test | Contexto del chat + smoke test | 5–10 min |
| 4. Publish the project | Source Control → GitHub | 5 min |
| 5. Plan before you edit | Plan mode | 5–10 min |
| 6. GitHub MCP | Habilitar GitHub MCP server | 5 min |
| 7. Plan and implement issues | Issues con herramientas GitHub | 10 min |
| 8. Review and merge | PR + review (Free: alternativa manual) | 10 min |
| 9. Cloud session | Delegar a la nube (no disponible en Free) | 5–10 min |
| 10. Review and next steps | Recap | 5 min |

- **Entorno**: VS Code **local**, sin Codespaces. Prerrequisitos: cuenta GitHub, "Copilot Free or a paid Copilot plan", VS Code, Git (lección 0). Avisa: "Copilot Free does not include Copilot code review".
- **Español**: **completo** en `docs/es-es/first-steps/vscode/` (0–10).
- **Skills / MCP / agentes / visión**: MCP (GitHub) sí; skills, agentes custom y visión no.
- **App**: un único HTML generado por Copilot desde cero → resultado distinto en cada asistente; sin arquitectura, BBDD ni tests que revisar.

## 4. Tabla comparativa

Criterios del mapa: junior, reutilizar al máximo, app reutilizable como "repo a revisar", VS Code agent mode local, Free/Student, español, hueco para skills/imagen/Docling.

| Workshop | Vigente | Entorno | Nivel | Duración | Plan mínimo declarado | Español | App de ejemplo | Skills | MCP | Agentes custom | Visión | Formato | ¿Sirve como "repo a revisar"? |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Real-world dev — VS Code** | Sí (no enlazado) | VS Code + Codespaces / dev container (local adaptable) | Intermedio-bajo | ≈ 1,5–2 h est. | Student | Parcial (README + 6) | **Tailspin Toys** (Astro+Drizzle+SQLite, tests, backlog) | No (sí en pistas app/cli; la app trae `quality-checks`) | GitHub + Playwright | Sí | No | MD + Starlight Pages, i18n | **Muy bien** |
| First steps — VS Code | Sí (no enlazado) | VS Code local | Principiante | 60–90 min | Free | **Completo** | Space Quiz (1 HTML, desde cero) | No | GitHub | No | No | MD + Starlight Pages, i18n | Mal |
| First steps — Copilot app (W1) | Sí | Copilot app | Principiante | 1–1,5 h | Free | Casi completo | Space Quiz | No | — | No | No | ídem | Mal |
| Real-world dev — Copilot app (W2) | Sí | Copilot app | Intermedio | 1–1,5 h | Student | Completo | Tailspin Toys | **Sí** | Playwright | Sí (QA) | No | ídem | Muy bien (pero no es VS Code) |
| First steps — CLI (W3) | Sí | Terminal | Principiante | ~2 h | Free | Completo | Space Quiz | No | — | — | No | ídem | Mal |
| Mona Mayhem (W4) | Sí (CLI) / archivo (VS Code) | VS Code o CLI | Intermedio | ~1 h | Pro | Completo | Astro + API de GitHub (desde plantilla) | No | — | — | No | MD + visor HTML | Regular (depende de API externa) |
| Copilot SDK (W5) | Sí | Código (6 lenguajes) + CLI | Intermedio | 30–115 min | "subscription or trial" | Sí | Starters por lenguaje | — | Sí | Agentes por código | No | MD + visor HTML | No (es otra cosa: candidata a lección extra) |
| Agent Lab (TS/Python/…) | Archivado | VS Code local | Intermedio | ~1 h | No declarado | Completo | Social Bingo (pequeña) | Sí (TS) | `.vscode/mcp.json` | **Sí** (+ hooks, subagentes TDD) | No | MD + visor HTML | Regular |

## 5. Copilot Free / Student (restricción del mapa)

Fuente: <https://docs.github.com/en/copilot/get-started/plans> (tablas de planes):

- Free y Student incluyen **agent mode**, **MCP**, **Copilot CLI** y la **Copilot app**.
- Ambos: **"Auto model selection only"** → hay que quitar de las lecciones la selección de modelos concretos.
- Free: "Limited to 2000 completions per month"; **cloud agent: no incluido**; code review solo "Review selection" en VS Code. Student: cloud agent y code review incluidos, "An allowance of GitHub AI Credits".
- La página no detalla límites de peticiones de chat/agent para Free (sistema de *AI credits*); conviene que el **Student** sea el plan recomendado y Free "debería bastar para las lecciones base" — a verificar en un ticket de prototipo.

Consecuencia: en cualquier base hay que marcar como "para casa"/opcional lo que use cloud agent (First steps 9) o Copilot code review (First steps 8, Real-world 6).

## 6. Recomendación

### 1ª opción: Real-world development — pista VS Code (Tailspin Toys)

Lecciones base a reutilizar (2–3): **1. Custom instructions**, **2. Agent Mode** y, si cabe, **3. MCP with Playwright** (o dejarla para casa). Lección 0 adaptada a local.

Razones:
1. **Hilo conductor**: Tailspin Toys es una app real con capas (páginas Astro, capa de datos Drizzle/SQLite, tests unitarios y E2E, CI) y un **backlog de issues sembrado** → encaja como "repo a revisar". Sobre ella se pueden añadir requisitos (PDF), diagramas de arquitectura e inconsistencias sembradas para el Engineering Reviewer.
2. **Reutilización con hueco para lo nuevo**: la app ya trae `.github/skills/quality-checks` (y la pista app/cli tiene una lección de skills traducida) → transición natural a "flujo de Matt Pocock" y a "skill propia que analiza imágenes". La lección 3 introduce MCP en VS Code (`.vscode/mcp.json`), que es justo el mecanismo de la lección de **Docling MCP**.
3. **Es material vigente y del mismo repo y app** que el workshop 2 de la temporada actual → alineado con Dev Days 2026.
4. **VS Code agent mode** de principio a fin; MIT; formato Markdown + Starlight con locale `es-es` ya montado (facilita GitHub Pages).

Costes / riesgos a asumir:
- Traducir lecciones 1–3 (no existen en `es-es`; partir de las equivalentes de `app/`/`cli/` traducidas).
- Reescribir "Return to your codespace" → local (o dev container) y cambiar modelos fijos por *Auto*.
- Nivel algo superior a First steps; para junior conviene recortar los bonus y mantener lo complejo para el final.
- La lección 4 (agente de accesibilidad) está rota respecto a la plantilla actual → no reutilizarla tal cual.

### 2ª opción: First steps — pista VS Code (Space Quiz)

Lecciones reutilizables: **2. Capture project instructions**, **5. Plan before you edit**, **6. GitHub MCP** (y 1 como calentamiento).

Razones: el más **junior**, **100 % en español**, local, compatible con **Free**, lecciones cortas (5–10 min). Contras: el Space Quiz es un único HTML generado desde cero, distinto en cada asistente → **mal "repo a revisar"** (sin arquitectura, datos ni tests); habría que traer otro repo para las lecciones nuevas, rompiendo el hilo conductor. Podría servir como **fuente de texto en español** para adaptar las lecciones de instrucciones/Plan mode a Tailspin.

### Descartadas como base

- **Copilot app / CLI (W1–W3)**: no son VS Code agent mode.
- **Mona Mayhem**: pide plan Pro, depende de la API de contribuciones de GitHub, la app se genera durante el workshop.
- **Agent Lab**: archivado; app pequeña (bingo). Aun así, su parte 04 (hooks + subagentes TDD) es buena referencia si se quiere una lección extra de agentes.
- **Copilot SDK**: no es base, pero **SDK 101 (30 min, Python/TS)** es una alternativa oficial y más asequible para junior que MAF para la **lección extra de orquestación por código**.

## Fuentes

- Web Dev Days: <https://dev-days.github.com/>, <https://dev-days.github.com/archive.html>, versión ES <https://copilot-dev-days.github.io/es/>
- <https://github.com/github-samples/copilot-workshops> (`README.md`, `LICENSE`, `docs/README.md`, `docs/first-steps/**`, `docs/real-world-development/**`, `docs/es-es/**`) — sitio <https://github-samples.github.io/copilot-workshops/>
- <https://github.com/github-samples/tailspin-toys> (`README.md`, árbol)
- <https://github.com/copilot-dev-days/mona-mayhem> (`README.md`, `workshop/00-overview.md`)
- <https://github.com/github/copilot-sdk-workshop> (`README.md`)
- <https://github.com/copilot-dev-days/agent-lab-typescript>, <https://github.com/copilot-dev-days/agent-lab-python> (`README.md`, `workshop/*.md`, `LICENSE`)
- <https://github.com/copilot-dev-days/tailspin-toys-workshop>, <https://github.com/copilot-dev-days/copilot-cli-deep-dive-workshop> (`README.md`)
- Planes Copilot: <https://docs.github.com/en/copilot/get-started/plans>
