# Estado del repo base tras sus lecciones 0–3 y encaje de las lecciones propias

Investigación del ticket [#30](https://github.com/emepetres/copilot-devdays-workshop/issues/30) (mapa [#29](https://github.com/emepetres/copilot-devdays-workshop/issues/29)). Fecha: 2026-10-24.

## Commits leídos (para anotar como ensayados)

| Repo | Commit | Fecha | Mensaje |
|---|---|---|---|
| `github-samples/copilot-workshops` (`main`) | [`35c69f6c039f073a46cce8891f21eecdfc1fa339`](https://github.com/github-samples/copilot-workshops/tree/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode) | 2026-10-22 | Merge pull request #207 (instructions_review) |
| `github-samples/tailspin-toys` (`main`) | [`a0f74a8d1b10d16db9921855746f7ebc410e2f85`](https://github.com/github-samples/tailspin-toys/tree/a0f74a8d1b10d16db9921855746f7ebc410e2f85) | 2026-10-06 | chore(deps): bump sharp 0.35.4 → 0.35.5 (#137) |

Último cambio en la pista VS Code: `909d7bff14` (2026-10-13). Las lecciones 0–3 llevan `lastUpdated: 2026-06-30` en su frontmatter.

Todas las rutas de abajo son relativas a esos commits: `vscode/N-*.md` = `docs/real-world-development/vscode/N-*.md` de `copilot-workshops`; el resto, de `tailspin-toys`.

## Respuesta corta

Tras las bases 0–3, el asistente tiene:

- `main` con el PR de la base 1 fusionado (estándar de TSDoc en `copilot-instructions.md` y `src/lib/publishers.ts`).
- La rama `filtering-vscode` publicada con el filtrado y un PR abierto, sin fusionar.
- Un `.vscode/mcp.json` con `github` y `playwright`.

Los diseños propios siguen siendo viables, pero rompen en cinco puntos:

1. **Ramas.** Al terminar la base 2, el filtrado está **sin commit**, y Pocock e imágenes van justo ahí.
2. **Material.** Ya no hay plantilla propia, así que `implement-lite`, el PNG, los PDF y `reviewer/` tienen que llegar por comando.
3. **Modelo y plan.** La base pide *Claude Sonnet 4.5*, retirado el 2026-09-01, y no lista Copilot Free como plan válido.
4. **Skills en Free.** La documentación de planes dice que las *skills* de Copilot Chat en IDE **no están disponibles en Free**.
5. **`mcp.json`.** La plantilla ya trae `playwright` y `astro-docs`, aunque la base 3 dice que solo trae `github`.

## 1. Backlog de la plantilla e issue de ordenación

El workflow [`.github/workflows/bootstrap-issues.yml`](https://github.com/github-samples/tailspin-toys/blob/a0f74a8d1b10d16db9921855746f7ebc410e2f85/.github/workflows/bootstrap-issues.yml) se dispara con el primer push a `main` del repo creado desde la plantilla (se salta si `is_template`).

- Crea una issue por cada `.github/bootstrap-issues/*.md`, en orden alfabético. El título sale del primer `#` y el cuerpo, del resto del fichero.
- Después borra el workflow y la carpeta con un commit de `github-actions[bot]` a `main`.

En un repo recién creado salen, por tanto, como #1–#9:

| # | Fichero | Título |
|---|---|---|
| 1 | `01-search-games.md` | Add a search box to find games by title |
| **2** | `02-sort-games.md` | **Allow users to sort the game list** |
| 3 | `03-detail-descriptions.md` | Show category and publisher descriptions on the game detail page |
| 4 | `04-publisher-pages.md` | Add a publisher page listing that publisher's games |
| 5 | `05-catalog-summary.md` | Show a catalog summary on the home page |
| 6 | `06-pagination.md` | Implement pagination on the game list page |
| 7 | `07-filter-games.md` | Allow users to filter games by category and publisher (base 2/3) |
| 8 | `08-coding-standards.md` | Update our repository coding standards (base 1 la cierra) |
| 9 | `09-backer-concierge.md` | Add a Backer Concierge assistant for catalog questions |

- **La issue de ordenación existe**: "Allow users to sort the game list", previsiblemente la **#2**. Sus criterios de aceptación piden ordenar por título A–Z/Z–A y por valoración, decidir qué pasa con los juegos sin valoración, accesibilidad con `data-testid`, y tests unitarios y E2E.
- El número no está garantizado. El orden de creación sí lo es, pero conviene que la lección diga "la issue *Allow users to sort the game list*" y no "#2".
- El commit de limpieza del bot deja `main` remoto un commit por delante si el asistente clonó antes de que terminara el workflow. La base 1 lo resuelve al final con `git pull`.

## 2. Ramas y commits que piden las lecciones base

| Lección | Rama | Qué se commitea y cómo | Estado al acabar |
|---|---|---|---|
| Base 0 ([`vscode/0-prerequisites.md`](https://github.com/github-samples/copilot-workshops/blob/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode/0-prerequisites.md)) | — | Nada. Repo desde la plantilla y codespace creado | `main` con el backlog sembrado |
| Base 1 ([`vscode/1-custom-instructions.md`](https://github.com/github-samples/copilot-workshops/blob/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode/1-custom-instructions.md)) | `git checkout -b custom-instructions` | `git add .github/copilot-instructions.md src/lib/publishers.ts` (+ tests si los hay), commit "Add doc comment standards and publishers helper foundation", `git push -u origin custom-instructions`. Copilot (GitHub MCP) crea el PR que cierra la issue de estándares, **lo fusiona**, vuelve a `main` y hace `pull` | En `main`, con el PR fusionado y la issue #8 cerrada |
| Base 2 ([`vscode/2-agent-mode.md`](https://github.com/github-samples/copilot-workshops/blob/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode/2-agent-mode.md)) | `git checkout main && git pull && git checkout -b filtering-vscode` | **Ningún commit.** Termina con **Keep** en el chat | En `filtering-vscode`, con el filtrado **sin commit** y `npm run dev` corriendo |
| Base 3 ([`vscode/3-mcp.md`](https://github.com/github-samples/copilot-workshops/blob/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode/3-mcp.md)) | sigue en `filtering-vscode` | En Source Control se preparan **todos** los cambios (el filtrado y `mcp.json`), el mensaje se genera con el botón *Sparkle* y se hace **Publish**. Copilot crea el PR asociado a la issue de filtrado: "**don't merge it yet**" (lo usan las bases 4–6) | `filtering-vscode` publicada y el PR abierto. `main` sigue sin filtrado |

## 3. `.github/copilot-instructions.md` e `instructions/` tras la base 1

- **Instrucciones de partida.** [`.github/copilot-instructions.md`](https://github.com/github-samples/tailspin-toys/blob/a0f74a8d1b10d16db9921855746f7ebc410e2f85/.github/copilot-instructions.md) tiene 101 líneas con estas secciones: *Agent notes*, *Code standards* (testing con la skill `quality-checks`, *Code formatting requirements*, Data Layer, Astro, Styling, GitHub Actions), *npm Commands* y *Repository Structure*.
- **Lo único que añade la base 1** son dos viñetas bajo *Code formatting requirements*, que está en la línea 35 y no "near line 27" como dice la lección:
  ```markdown
  - Every exported function should have a TSDoc comment describing its purpose, parameters, and return value.
  - Before imports or any code, add a comment block to the file that explains its purpose.
  ```
- **`.github/instructions/`** no cambia: `astro`, `drizzle`, `playwright`, `style`, `ui` y `unit-tests` (`*.instructions.md`).
- **Notas de agente que chocan con las lecciones propias**, en *Agent notes*:
  - "**Do not generate summary markdown files upon completion of a task**". Puede chocar con las skills que escriben informes en `docs/reviews/*.md` (imágenes y Docling); hay que ensayarlo.
  - "**NEVER commit or push to main automatically unless explicitly instructed to do so**". Encaja con que `implement-lite` haga commit en su rama.
  - "**Skills take precedence**", en *npm Commands*. Favorece a `quality-checks`.
- **Skills ya incluidas**: `.github/skills/quality-checks/SKILL.md` y `.github/skills/make-contribution/` (con plantillas de issue y PR).
- **Documentación**: no hay carpeta `docs/`. El `README.md` tiene la sección `## Architecture` (líneas 5–11), que es la que usa el Engineering Reviewer.

## 4. `.vscode/mcp.json` tras la base 3

**La plantilla ya trae `playwright` y `astro-docs`** desde su commit inicial (`fc4ddeadc4`, 2026-07-14). Contenido de [`.vscode/mcp.json`](https://github.com/github-samples/tailspin-toys/blob/a0f74a8d1b10d16db9921855746f7ebc410e2f85/.vscode/mcp.json):

```json
{
  "servers": {
    "github":     { "type": "http", "url": "https://api.githubcopilot.com/mcp/" },
    "playwright": { "command": "npx", "args": ["@playwright/mcp@latest"] },
    "astro-docs": { "type": "http", "url": "https://mcp.docs.astro.build/mcp" }
  }
}
```

La base 3, en cambio, dice que el fichero solo trae `github` y pide dejarlo **exactamente** así:

```json
{ "servers": {
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" },
    "playwright": { "command": "npx", "args": ["@playwright/mcp@latest", "--headless"] } } }
```

El estado final depende de lo literal que sea el asistente:

- Si **copia el bloque entero**, quedan `github` y `playwright` con `--headless`, y desaparece `astro-docs`.
- Si **solo añade `--headless`**, quedan los tres.

En cualquier caso, el cambio se commitea en `filtering-vscode` y **no llega a `main`**.

`--headless` es obligatorio en Codespaces, pero en local el navegador puede verse. La lección de Docling debe decir "**añade** una entrada `docling`", no dar el fichero completo, y no dar por hecho que `astro-docs` está o no está.

## 5. Modelo que fijan y choque con *Auto* en Free

- **Base 2**: "Select **Claude Sonnet 4.5**" (dos veces), con la advertencia de que no es una preferencia. Las bases 1 y 3 no fijan modelo, solo el agente **Agent**.
- **Sonnet 4.5 está retirado.** Según [`data/tables/copilot/model-deprecation-history.yml`](https://github.com/github/docs/blob/main/data/tables/copilot/model-deprecation-history.yml) de `github/docs`, Claude Sonnet 4.5 tiene `retirement_date: '2026-09-01'`. **Nadie podrá seleccionarlo**, sea cual sea su plan.
- **Free y Student solo tienen Auto.** La [página de planes](https://docs.github.com/en/copilot/get-started/plans) (fuente `content/copilot/get-started/plans.md`, commit `f8f9eb2c2b`, 2026-10-21) dice: "On Copilot Free and Copilot Student plans, access to models is available through **auto model selection only**". El paso de la base 2 no se puede seguir y hay que usar *Auto*.
- **La base no promete Free.** El [`README` de la pista](https://github.com/github-samples/copilot-workshops/blob/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode/README.md) exige "Copilot **Student, Pro, Pro+, Business, or Enterprise**" y no menciona Free. Esto contradice el ADR 0001 ("la base está revisada y probada con Copilot Free").
- **Matiz de Free.** La misma página de planes indica:
  - Para Free: "Copilot Chat skills in IDEs. (**Not available in Copilot Free**)". La nota aclara que se refiere a VS Code y Visual Studio.
  - Agent mode y MCP sí están incluidos en Free, pero el cloud agent no.
  - Para Student, todo lo anterior está incluido.

  No está claro si "Copilot Chat skills" son las *Agent Skills* (`SKILL.md`). La matriz de VS Code de `github/docs` (`data/tables/copilot/matrix/vs-code.yml`) da "Agent skills" como soportadas desde la 1.108, sin distinguir plan. **Hay que ensayarlo con una cuenta Free**, porque Pocock, imágenes y Docling dependen de las skills. Si no van, hay que exigir Student o Pro en los **prerrequisitos extra**.

## 6. Qué asume la base de Codespaces que no vale en local

La base se apoya en [`.devcontainer/devcontainer.json`](https://github.com/github-samples/tailspin-toys/blob/a0f74a8d1b10d16db9921855746f7ebc410e2f85/.devcontainer/devcontainer.json):

- imagen `typescript-node:1-22-bookworm`;
- *features* de Playwright y `github-cli`;
- extensiones Copilot, Copilot Chat, Astro y ESLint;
- `postCreateCommand: npm ci && npx playwright install --with-deps chromium && npm run db:setup`;
- puerto 4321.

En local hace falta, por tanto:

- **Node ≥ 22.13** (`package.json` → `engines`), `npm ci` y `npx playwright install chromium`. `db:setup` no hace falta porque lo ejecutan `predev` y `prebuild`.
- **`gh`**: la base no lo usa, porque trabaja con el MCP remoto de GitHub. En Codespaces viene instalado y autenticado con el token del codespace; en local lo necesitan Pocock (`/setup-matt-pocock-skills`, etiquetas, comentario de la spec). Hay que ensayar si el token de Codespaces permite crear etiquetas y comentar issues.
- **La base 0 ofrece "local" solo como dev container** ("Reopen in Container"), que exige Docker. Lo de "local sin contenedor" lo recomienda el mod, no la base.
- **Texto de la base que no aplica en local**: `--headless` "required inside a codespace" (en local es opcional) y la redirección a `*.app.github.dev` (en local es `http://localhost:4321`).
- **Codespaces y Docling**: `uv` y Docling no están en el devcontainer, así que el comando de setup del mod los instala en el codespace.
  - Hay que **reutilizar el mismo codespace** el día del evento: uno nuevo vuelve a descargar unos 510 MB de modelos.
  - La máquina por defecto (2 núcleos y 8 GB) puede quedarse corta con el OCR. Hay que ensayarlo.
- **Workflows heredados**: los repos de los asistentes heredan `weekly-workshop-triage` (lunes a las 08:00 UTC, factura a la organización `github-samples` y actúa sobre `github-samples/tailspin-toys`) y `dependabot.yml` (semanal). El primero fallará o hará ruido cada semana, y el segundo abrirá PR. La plantilla propia los quitaba; ahora no se pueden quitar sin tocar la base.

## 7. Supuestos de las lecciones propias que dejan de cumplirse

### Pocock ([#8](https://github.com/emepetres/copilot-devdays-workshop/issues/8))

| Supuesto | ¿Se cumple? |
|---|---|
| "Bases 1 y 2 hechas. El filtrado está en la rama `filtering-vscode`" | **Solo en parte.** Está en esa rama pero **sin commit**, porque el commit llega en la base 3, que ahora va después |
| Rama `sorting` creada desde `main` | **Rompe.** `git checkout -b sorting` se lleva los cambios sin commitear del filtrado. Además, `main` no tiene el filtrado y ordenación y filtrado tocan `src/lib/games.ts` y `src/pages/index.astro`. Opciones: commitear el filtrado en `filtering-vscode` antes de Pocock (la base 3 solo commitearía `mcp.json`) y crear `sorting` desde `filtering-vscode`, o crearla desde `main` y aceptar el conflicto. **En cualquier caso, hay que volver a `filtering-vscode` antes de la base 3**, que prueba el filtrado con el servidor corriendo |
| Existe la issue de ordenación | **Sí**: "Allow users to sort the game list" (#2 previsiblemente) |
| `.github/skills/quality-checks/SKILL.md` viene en la plantilla | **Sí** |
| `implement-lite` viene en `.github/skills/` de la plantilla | **Rompe**: ya no hay plantilla propia. Tiene que llegar con el comando de material |
| Línea "Responde siempre en español" en `copilot-instructions.md` | **A revisar**: el mod pasa a inglés, así que hay que decidir si se mantiene (lo añade el asistente) |
| Skills disponibles con Free y *Auto* | **En duda** (sección 5) |
| La plantilla no tiene más documentación que el `README` | **Sí** (no hay `docs/`) |

### Skill de imágenes ([#9](https://github.com/emepetres/copilot-devdays-workshop/issues/9))

| Supuesto | ¿Se cumple? |
|---|---|
| `docs/architecture.png` en el repo | **Rompe**: llega por comando. Nota: el PNG tampoco estaba aún en la plantilla retirada |
| Las 3 inconsistencias del diagrama contra el código | **Sí**: `astro.config.mjs` tiene `output: 'static'`, `src/lib/db.ts` usa `node:sqlite` y `db/schema.ts` solo tiene `publishers`, `categories` y `games` |
| Rama en la que se trabaja | **Sin definir**: la lección va entre Pocock (`sorting`) y la base 3 (`filtering-vscode`). Hay que decidir dónde vive `.github/skills/review-diagram` y si se commitea |
| El informe en `docs/reviews/` | **En riesgo** por "Do not generate summary markdown files" (sección 3) |

### Engineering Reviewer con Docling ([#10](https://github.com/emepetres/copilot-devdays-workshop/issues/10))

| Supuesto | ¿Se cumple? |
|---|---|
| `.vscode/mcp.json` de la base 3 conocido, y se añade `docling` | **Sí, con matices**: el fichero puede tener o no `astro-docs` y está commiteado solo en `filtering-vscode` (sección 4) |
| `docs/requisitos.pdf`, `docs/acta-reunion.pdf` y `docs/reviews/_docling/*.md` en la plantilla | **Rompe**: llegan por comando (antes estaban en `emepetres/tailspin-toys-devdays`) |
| Inconsistencias 4–6 contra el código | **Sí**: `games.categoryId` es una sola FK, `output: 'static'` y `StarRating` con `ratings.ts` sin cambios. La plantilla retirada es `a0f74a8` más 9 commits que no tocan el código |
| `README` `## Architecture` como fuente | **Sí** |
| `scripts/docling-warmup/` y `npm run docling:warmup` | **Rompe**: el script y la entrada en `package.json` eran de la plantilla retirada. Pasan al comando de setup del mod, que no debe tocar `package.json` de la base o debe hacerlo de forma explícita |

### Lección extra ([#11](https://github.com/emepetres/copilot-devdays-workshop/issues/11))

| Supuesto | ¿Se cumple? |
|---|---|
| El esqueleto `reviewer/` en la plantilla | **Rompe**: llega por comando |
| Lee los `SKILL.md` de `.github/skills/` | **Sí**, si las lecciones propias se commitean en la rama en la que se haga la extra |
| `model="auto"` | **Coherente** con Free y Student (solo *Auto*) |

## 8. Comparación con la plantilla retirada (`emepetres/tailspin-toys-devdays`, [#15](https://github.com/emepetres/copilot-devdays-workshop/issues/15))

Según `gh api repos/emepetres/tailspin-toys-devdays/compare/a0f74a8…main`, la plantilla retirada era `a0f74a8` + 9 commits:

| Diferencia | Qué cambia al usar la base intacta |
|---|---|
| Quitaba `weekly-workshop-triage` (`.md` y `.lock.yml`), `.github/aw/actions-lock.json` y `.github/dependabot.yml` (y el texto de Dependabot de `copilot-instructions.md`) | Vuelven: hay ejecuciones semanales con fallo o ruido y PR de Dependabot en los repos de los asistentes |
| Añadía `docs/requisitos.pdf`, `docs/acta-reunion.pdf` y `docs/reviews/_docling/*.md` | Llegan por comando del mod |
| Añadía `scripts/docling-warmup/` y el script `docling:warmup` | Llegan por comando del mod (el setup los ejecuta sin `package.json`) |
| `README` con enlace al sitio del workshop | Desaparece; la portada del mod enlaza a la base |
| `*.pdf binary` en `.gitattributes`; `astro` 7.3.8 y `drizzle-orm` 0.45.4 | Irrelevante para las lecciones |
| No traía todavía `implement-lite`, `docs/architecture.png` ni `reviewer/` | Pendientes igualmente; ahora, por comando |

El backlog sembrado (9 issues, incluida la de ordenación) era **idéntico**: el workflow de bootstrap no se tocó.

## 9. Consecuencias para el mapa

1. **Diseño de ramas del mod** (decisión nueva). Las opciones de partida:
   - Antes de Pocock, commitear el filtrado en `filtering-vscode`.
   - Crear `sorting` desde ahí.
   - Decidir en qué rama viven las skills, el agente y los informes.
   - Volver a `filtering-vscode` antes de la base 3.
2. **El comando de material** debe traer:
   - `implement-lite`;
   - `docs/architecture.png`;
   - los PDF y su Markdown de plan B;
   - el script de calentamiento;
   - `reviewer/`.

   Y debe funcionar igual en local y en Codespaces.
3. **Prerrequisitos extra y portada**:
   - Avisar de que el paso "Claude Sonnet 4.5" de la base 2 se sustituye por *Auto*.
   - Exigir **Student** (o Pro) si el ensayo confirma que las skills no van en Free.
   - Pedir Node ≥ 22.13, Chromium de Playwright y `gh` para quien trabaje en local.
4. **Lección de Docling**: añadir la entrada `docling` sin reescribir `mcp.json`.
5. **Ensayo**:
   - las skills con Free;
   - "Do not generate summary markdown files" frente a los informes;
   - `gh` en Codespaces (etiquetas y comentarios);
   - Docling en un codespace de 2 núcleos.
6. **Corregir el ADR 0001**: la base no declara soporte de Copilot Free.
