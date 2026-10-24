# Diseño del workshop: GitHub Copilot Dev Days Sevilla (v2, mod)

## 1. Resumen

**Workshop** de 3 h de los GitHub Copilot Dev Days de Sevilla: miércoles 28 de octubre de 2026, 18:00–21:00, Espacio RES. Se imparte en español y se retransmite por YouTube ([evento en Luma](https://luma.com/h8739h67)).

El workshop es el **workshop base** usado tal cual más un **mod** publicado en este repo ([ADR 0001](adr/0001-workshop-como-mod-del-base.md)):

- **La base** aporta los prerrequisitos, la app Tailspin Toys y las lecciones de instrucciones, agent mode y MCP. Están revisadas y probadas, y no se traducen ni se reescriben.
- **El mod** aporta las **lecciones propias**, en inglés (en-US): el **flujo de Matt Pocock**, una skill que analiza imágenes y el **Engineering Reviewer** con Docling MCP. También los **prerrequisitos extra** y el material que esas lecciones necesitan, que llega por comando.

El hilo conductor no cambia respecto a la v1. Primero se aprende lo esencial de Copilot en VS Code con la base. Después se adopta el flujo de Matt Pocock y con él se construye el Engineering Reviewer, que revisa a la vez la documentación (PDF, escaneado y diagrama) y el código, y detecta inconsistencias entre requisitos, arquitectura e implementación.

Lo que no se termine en la sesión se completa en casa. Este documento recoge el diseño; la redacción de cada lección se hace aparte (ver §10).

## 2. Público, entorno y plan

- **Público**: estudiantes y perfiles junior.
- **Plan de Copilot**: el que exige la base: **Student, Pro, Pro+, Business o Enterprise**. Free no está soportado; si alguien viene con Free, se improvisa en la sala. Con Free y Student solo hay modelo *Auto*, y todo el workshop se hace con *Auto*.
- **Entorno**: el de referencia es el de la base, **Codespaces**. El ponente recomienda trabajar en **local sin contenedor**, y las lecciones propias funcionan igual en los dos entornos. No se menciona "Reopen in Container".
- **Idioma**:
  - En inglés: las lecciones propias, el sitio, el material y los mensajes del CLI.
  - En español: la explicación oral, la descripción pública, este documento, el glosario y las issues. Se puede escribir al agente en español.

## 3. Workshop base

Es la pista **VS Code** de *Real-world development* (`github-samples/copilot-workshops`, `docs/real-world-development/vscode/`, MIT), publicada en <https://github-samples.github.io/copilot-workshops/>, con la plantilla `github-samples/tailspin-toys`.

| Lección base | ¿Se usa? |
|---|---|
| Exercise 0 · Prerequisites | Sí, tal cual (crea el repo desde la plantilla y el Codespace) |
| Exercise 1 · Custom instructions | Sí, tal cual |
| Exercise 2 · Agent mode | Sí, tal cual. Pide Claude Sonnet 4.5, que está retirado: se usa *Auto* (lo avisan los prerrequisitos extra) |
| Exercise 3 · Testing your feature with the Playwright MCP server | Sí, tal cual. **Saltable** si se va mal de tiempo |
| Exercises 4–6 (custom agents, managing agents, iterating) y Foundry | No. Las sustituyen en bloque las lecciones propias |

**Commits ensayados**: `github-samples/copilot-workshops@35c69f6` y `github-samples/tailspin-toys@a0f74a8`. Si la base cambia antes del 28, se compara contra estos commits.

Qué deja la base en el repo del asistente ([estado del repo base](https://github.com/emepetres/copilot-devdays-workshop/issues/30)):

- **Backlog**: 9 issues sembradas. La de ordenación es "Allow users to sort the game list". La lección propia la cita por su título, no por su número.
- **Exercise 1**: deja `main` limpio, con el PR de instrucciones fusionado.
- **Exercise 2**: deja el filtrado **sin commit** en `filtering-vscode`.
- **`.vscode/mcp.json`**: la plantilla ya lo trae con `github`, `playwright` y `astro-docs`.
- **Instrucciones de la base**: dicen "Do not generate summary markdown files", lo que afecta a los informes de las lecciones propias (ver §6).
- **Workflows**: los de la base (triage semanal y Dependabot) se ignoran.

## 4. Itinerario y agenda

El diagrama está prototipado en la rama `prototype/itinerary-diagram` ([decisión](https://github.com/emepetres/copilot-devdays-workshop/issues/33)): pizarra, azul para la base y naranja para el mod, horizontal para la portada y la diapositiva de apertura, y vertical para móvil. Ya está ajustado al orden de abajo, con Exercise 3 marcado como saltable, en `lessons/_images/itinerary-horizontal.svg` y `itinerary-vertical.svg`. La portada numera también los pasos de casa: 1 es Exercise 0 y 2 son los prerrequisitos extra.

| # | Lección | Origen | Min | Acumulado |
|---|---|---|---|---|
| — | Apertura: objetivo, Engineering Reviewer, itinerario | — | 5 | 5 |
| 1 | Exercise 1 · Custom instructions | Base | 20 | 25 |
| 2 | Exercise 2 · Agent mode | Base | 20 | 45 |
| 3 | *Matt Pocock's workflow* | Mod | 50 | 95 |
| 4 | Exercise 3 · Playwright MCP (**saltable**) | Base | 15 | 110 |
| 5 | *A skill that reads images* | Mod | 25 | 135 |
| 6 | *The Engineering Reviewer with Docling MCP* | Mod | 28 | 163 |
| — | Cierre | — | 5 | 168 |
| | **Colchón** | | **12** (27 si se salta Exercise 3) | 180 |

**Antes de venir**: Exercise 0 de la base y los *Extra prerequisites*.

**Para casa**:
- lo que no se termine;
- la demo A/B de tokens de Docling;
- la ampliación del Engineering Reviewer para leer issues con `gh`;
- el `implement` original con `code-review`;
- la lección extra, que no se hace en la sesión y puede no estar lista el 28.

**Orden**: Pocock va justo después de Agent mode, como forma de trabajar alternativa al Plan mode. Imágenes y Docling van juntas al final, porque las dos construyen el Engineering Reviewer.

**Plan B**: no hay plan B específico. Cada lección propia lleva su **solución plegable**, sin comandos de recuperación.

## 5. Prerrequisitos extra y CLI del mod

Decisión: [prerrequisitos extra y comando de setup](https://github.com/emepetres/copilot-devdays-workshop/issues/32). Research: [comando multiplataforma](https://github.com/emepetres/copilot-devdays-workshop/issues/31).

### Página *Extra prerequisites*

Se hace en casa, después del Exercise 0 de la base. Tiene dos rutas, y las dos empiezan creando el repo desde la plantilla de la base:

- **Codespaces**: Exercise 0 tal cual y después `setup`. Aviso: hay que usar el **mismo** Codespace el día del workshop y **no reconstruirlo**, porque Docling y sus modelos viven fuera de `/workspaces`.
- **Local sin contenedor (recomendada)**: VS Code ≥ 1.112, Node ≥ 22.13, git, `gh` + `gh auth login` (lo necesita `/setup-matt-pocock-skills`), clonar el repo, `npm install` y `npx playwright install chromium`. Después, `setup`. Se reaprovecha el texto de la lección 0 retirada.
- **En las dos rutas**: activar `chat.plugins.enabled`, elegir siempre *Auto* y terminar con **`check` en verde**.

### CLI del mod

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 <subcommand>
```

Es un script de Node sin dependencias (`mod/cli.mjs`). El comando es el mismo en PowerShell, bash y zsh, y solo exige Node, npm y git.

| Subcomando | Qué hace |
|---|---|
| `setup` | Copia el material de todas las lecciones a su sitio. Instala `uv` si falta e instala `docling-mcp[local]==3.3.0` (con `--torch-backend cpu` en Linux y Codespaces, para no descargar ~2,8 GiB de CUDA). Hace la conversión de calentamiento desde el paquete, sin tocar el `package.json` de la base. Al final pide reiniciar VS Code |
| `lesson <pocock\|images\|docling\|extra>` | Copia solo el material de esa lección. Es idempotente y no sobrescribe sin avisar |
| `warmup` | Repite la conversión de calentamiento |
| `check` | Comprueba Node, `uv`, `docling-mcp`, los modelos y el material, con ✅/❌, e imprime la ruta absoluta de `docling-mcp-server` |

- **Comprobación de entrada**: el CLI exige estar en la raíz de Tailspin Toys (`package.json` con `"name": "tailspin-toys"`).
- **Si `npx` está bloqueado** en Windows PowerShell por la directiva de scripts, se usa `npx.cmd`.
- **Plan B solo para copiar ficheros**: `npx -y degit@3.10.1 --force emepetres/copilot-devdays-workshop/mod/lessons/<name>#mod-v1 .`
- **Versionado**: la etiqueta `mod-v1` se crea tras el ensayo y nunca se mueve. Las correcciones se publican como `mod-v2`, y se actualizan los enlaces.
- **Material**: `setup` lo copia a su sitio desde el principio y queda sin commit hasta la lección que lo usa. Se acepta que Copilot lo incluya en algún PR de la base.

### Estructura en este repo

```text
package.json            # raíz: bin → mod/cli.mjs, "files": ["mod"], engines node >=22.13
mod/
  cli.mjs
  warmup/               # warmup.pdf (en inglés) y warmup.mjs
  lessons/              # rutas tal cual quedan en el repo del asistente
    pocock/.github/skills/implement-lite/SKILL.md
    images/docs/architecture.png
    docling/docs/requirements.pdf
    docling/docs/meeting-minutes.pdf
    docling/docs/reviews/_docling/*.md
    extra/reviewer/…
```

## 6. Lecciones propias

Decisión: [cambios en las lecciones propias](https://github.com/emepetres/copilot-devdays-workshop/issues/34). Los diseños de origen siguen valiendo salvo en lo que se indica.

**Común a todas**:
- Título en inglés, sin número.
- Empiezan con "Do this after *Exercise N · …*" y un recuadro "Where you should be": rama y estado esperado.
- El primer paso es `lesson <name>`, que no hace nada si ya se hizo `setup`.
- Terminan con un commit en `sorting` y una solución plegable.
- Desaparece el paso "Responde siempre en español"; un tip dice que se puede escribir al agente en español.

**Ramas**:
- Pocock commitea el filtrado de Exercise 2 en `filtering-vscode` con un comando dado y crea `sorting` desde ahí.
- Todo lo que viene después sigue en `sorting`, también Exercise 3. Su PR incluirá la ordenación, y un recuadro en Pocock lo avisa; da igual, porque no se fusiona.

| Lección propia | Slug | Va después de | Diseño de origen | Cambios en el mod |
|---|---|---|---|---|
| *Extra prerequisites* | `prerequisites/` | Exercise 0 | [Lección 0](https://github.com/emepetres/copilot-devdays-workshop/issues/16) (retirada) | Ver §5 |
| *Matt Pocock's workflow* | `pocock-workflow/` | Exercise 2 | [Pocock](https://github.com/emepetres/copilot-devdays-workshop/issues/8) | Se presenta como alternativa al Plan mode. Commitea el filtrado y crea `sorting`. Trabaja sobre la issue "Allow users to sort the game list". `implement-lite` llega por `lesson pocock` y no cambia; el `implement` original queda como opción para casa |
| *A skill that reads images* | `image-skill/` | Exercise 3 | [Imágenes](https://github.com/emepetres/copilot-devdays-workshop/issues/9) | `docs/architecture.png` llega por `lesson images`. `review-diagram` dice explícitamente que su informe en `docs/reviews/architecture-diagram.md` es un entregable pedido |
| *The Engineering Reviewer with Docling MCP* | `engineering-reviewer/` | *A skill that reads images* | [Docling](https://github.com/emepetres/copilot-devdays-workshop/issues/10) | Los PDF llegan por `lesson docling`, en inglés y con nombres en inglés. Se **añade** una entrada `docling` a `.vscode/mcp.json`: se muestra solo ese bloque y no se asume si existe `astro-docs`. Si VS Code no encuentra el servidor, se usa la ruta de `check`. Lleva un recuadro de 3–4 líneas sobre qué es un MCP, por si se saltó Exercise 3. El informe se declara entregable pedido |
| *Extra: orchestration in code* | `extra-orchestration/` | *The Engineering Reviewer…* (en casa) | [Extra](https://github.com/emepetres/copilot-devdays-workshop/issues/11) | `reviewer/` llega por `lesson extra`. Se construye la última y puede no estar lista el 28 |

## 7. Inconsistencias sembradas

Son las mismas seis de la v1. Todas se contrastan con el código de la plantilla de la base, que no cambia. Los documentos se regeneran **en inglés** con los generadores de `docs/assets/`, y la clave de respuestas `docs/inconsistencias-sembradas.md` se actualiza con las nuevas ubicaciones.

| # | Fuente | Inconsistencia |
|---|---|---|
| 1 | Diagrama | Caja "REST API (Flask)" llamada en runtime; el sitio es estático (`output: 'static'`) |
| 2 | Diagrama | PostgreSQL en lugar de SQLite |
| 3 | Diagrama | Tabla `Backers` inexistente en `db/schema.ts` |
| 4 | `docs/requirements.pdf` | FR-03: "a game can belong to several categories"; `games.categoryId` es una sola clave ajena |
| 5 | `docs/requirements.pdf` | NFR-01: "the catalog updates in real time"; el sitio es estático |
| 6 | `docs/meeting-minutes.pdf` (escaneado) | D2: la valoración se muestra de 1 a 10 sin estrellas; el código sigue en 0–5 con estrellas |

## 8. Sitio

- **Locale**: el sitio Astro + Starlight (`website/`) pasa a inglés (locale `en`), con el título *Build your Engineering Reviewer*.
- **Portada**:
  - un párrafo que explica qué es esto (*a mod of the Dev Days workshop*);
  - el diagrama del itinerario;
  - la lista numerada del itinerario, con enlaces a la base y a las lecciones propias;
  - los commits ensayados de la base.
- **Barra lateral**: sigue el orden del itinerario e incluye enlaces externos a los ejercicios de la base.
- **Lecciones retiradas**: se borran `0-prerrequisitos.md` y `1-custom-instructions.md`, y los marcadores 2 y 5.
- **`AUTHORING.md`**: se actualiza para el idioma, los slugs sin número y el material en `mod/`.
- **Descripción pública**: `docs/public-description.md` sigue en español (Luma). Se ajusta así:
  - plan Student o superior, no Free;
  - el material está en inglés;
  - antes de venir, el Exercise 0 de la base y los prerrequisitos extra.

## 9. Riesgos y ensayo

Se ensaya de principio a fin, base + mod, con **Student y *Auto***, en local (Windows) y en Codespaces. Tras el ensayo se crea `mod-v1`.

| Comprobar | Si falla |
|---|---|
| `npx github:…` con este repo (Windows, macOS, Codespaces); directiva `Restricted` → `npx.cmd` | `degit` para copiar e instalación manual de Docling |
| Tiempo de `setup` y del OCR en un Codespace de 2 núcleos; `--torch-backend cpu` real en Linux | Recomendar local con más fuerza |
| `docling-mcp-server` en el `PATH` de VS Code (local y Codespaces) | Ruta absoluta de `check` en `mcp.json` |
| `chat.plugins.enabled` y lectura de `docs/architecture.png` en Codespaces | Adjuntar la imagen al chat |
| Con *Auto*, `/grill-with-docs` espera las respuestas; `/implement-lite` funciona | Solución plegable |
| Los informes se escriben pese a "Do not generate summary markdown files" | Reforzar el texto de la skill |
| El Engineering Reviewer llama a sus skills y respeta `tools:` | Solución plegable |
| El token de Codespaces permite a `/setup-matt-pocock-skills` crear etiquetas y comentar issues | `gh auth login` dentro del Codespace |
| Exercise 3 sobre `sorting` (prueba del filtrado y PR) | Saltar Exercise 3 |
| macOS (Apple Silicon) de principio a fin | Aviso en los prerrequisitos extra |

## 10. Backlog de ejecución

Esta es la propuesta para convertir en issues. Va en orden de prioridad. El ensayo lleva `ready-for-human`; el resto, `ready-for-agent`.

| # | Issue | Qué es | Bloqueada por |
|---|---|---|---|
| 1 | CLI del mod y estructura `mod/` (nueva) | `setup`, `lesson`, `warmup` y `check`; `package.json` en la raíz; spike de `npx github:` en Windows | — |
| 2 | Documentos sembrados en inglés (nueva) | Requisitos, acta escaneada, `_docling/*.md`, PDF de calentamiento y clave de respuestas | — |
| 3 | *Matt Pocock's workflow* (reescribir la issue de la lección 3) | §6 | 1 |
| 4 | *A skill that reads images* (reescribir la issue de la lección 4) | §6 | 1 |
| 5 | *The Engineering Reviewer with Docling MCP* (reescribir la issue de la lección 6) | §6 | 1, 2 |
| 6 | *Extra prerequisites* (nueva) | §5; incluye archivar `emepetres/tailspin-toys-devdays` | 1 |
| 7 | Sitio en inglés con itinerario (nueva) | §8; diagrama ajustado al orden nuevo y lecciones retiradas | 3–6 |
| 8 | Descripción pública v2 (nueva) | §8 | — |
| 9 | Ensayo de extremo a extremo (nueva, humana) | §9; al terminar, crear la etiqueta `mod-v1` | 1–7 |
| 10 | *Extra: orchestration in code* (reescribir la issue de la lección extra) | §6 | 1 |

Las issues de *Lección 2 · Agent mode* y *Lección 5 · Playwright MCP* se cierran como `wontfix`, porque se usan los ejercicios de la base.

## 11. Decisiones

- **Mapa de la v2**: [Mapa: el workshop como mod del workshop base](https://github.com/emepetres/copilot-devdays-workshop/issues/29).
  - [Estado del repo base tras sus lecciones 0–3 y encaje de las lecciones propias](https://github.com/emepetres/copilot-devdays-workshop/issues/30)
  - [Comando multiplataforma para traer el material del mod e instalar Docling](https://github.com/emepetres/copilot-devdays-workshop/issues/31)
  - [Diseño de los prerrequisitos extra y del comando de setup del mod](https://github.com/emepetres/copilot-devdays-workshop/issues/32)
  - [Diagrama del itinerario: cómo el mod se inserta en la base](https://github.com/emepetres/copilot-devdays-workshop/issues/33)
  - [Cambios en las lecciones propias para encajar en el mod](https://github.com/emepetres/copilot-devdays-workshop/issues/34)
  - [Documento de diseño v2 y backlog reajustado del mod](https://github.com/emepetres/copilot-devdays-workshop/issues/35)
- **Mapa de la v1**, cuyos diseños de lección siguen vigentes: [Mapa: diseño del workshop Copilot Dev Days Sevilla](https://github.com/emepetres/copilot-devdays-workshop/issues/1).
