# Skills de Matt Pocock en GitHub Copilot (VS Code, agent mode)

Investigación para el ticket "Skills de Matt Pocock en GitHub Copilot" (#3) del mapa del workshop (#1). Fecha: 2026-10-21. Versión de las skills revisada: `mattpocock-skills` 1.3.1 (`main` de https://github.com/mattpocock/skills).

## Resumen

- **Sí funcionan.** Copilot en VS Code (agent mode) soporta Agent Skills (`SKILL.md`, estándar abierto) y además *agent plugins*. El repo de Matt documenta oficialmente la instalación en Copilot (CLI y VS Code). [1][2][3]
- **Para un aula de juniors, lo más robusto es no instalar nada:** copiar 3–4 skills al repo del workshop base, dentro de `.github/skills/` (o `.agents/skills/`), para que lleguen con el `git clone`. Sin plugins, sin `settings.json`, sin `gh` autenticado. [2][4]
- **Fricción principal:** las skills "envoltorio" (`grill-me`, `grill-with-docs`) dicen *"Call the Skill tool with …"*, y Copilot en VS Code no expone una herramienta Skill. En la práctica Copilot lee los `SKILL.md` directamente y sigue adelante, pero no es determinista. Hay que probarlo antes del directo, o invocar directamente `/grilling` y `/domain-modeling`. [5][6]
- **Subconjunto recomendado (30–40 min):** `grilling` + `domain-modeling` (o su envoltorio `grill-with-docs`), con `tdd` como opción para casa. Fuera de la lección: `wayfinder`, `to-tickets`, `to-spec`, `triage`, `implement*`, porque dependen de un issue tracker configurado y de `gh`. [7][8]
- **Copilot Free/Student:** agent mode, MCP y la personalización están incluidos. Solo hay selección automática de modelo ("Auto") y una cuota mensual limitada de créditos. Las skills no exigen plan de pago (ninguna fuente oficial las restringe por plan). [9][2]

## 1. Soporte de Agent Skills en Copilot / VS Code

**Dónde busca VS Code las skills** [2]:

| Ámbito | Rutas |
|---|---|
| Proyecto (repo) | `.github/skills/`, `.claude/skills/`, `.agents/skills/` |
| Personal (home) | `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/` |

Cada skill es una carpeta con un `SKILL.md`.

**Frontmatter soportado** [2]:
- `name`: obligatorio. Debe coincidir con el nombre de la carpeta y usar solo minúsculas, números y guiones. *"Names with invalid characters cause the skill to silently fail to load."*
- `description`: obligatorio, hasta 1024 caracteres. Es lo que usa el modelo para decidir si carga la skill.
- `disable-model-invocation: true`: la skill solo se puede lanzar a mano con `/`. Es el mecanismo que usa Matt para las skills *user-invoked* [10].
- `user-invocable: false`: la skill no aparece en el menú `/`.
- `argument-hint`.
- `context: fork` (experimental): ejecuta la skill en un subagente. Requiere `github.copilot.chat.skillTool.enabled`.

**Cómo se invocan** [2]: escribiendo `/nombre-skill` en el chat, o de forma automática cuando la `description` encaja con la petición. Aviso de la propia documentación: *"Discovery makes skills available to the model but does not guarantee that it invokes a skill for every relevant prompt."*

**Superficies** [3]: el soporte de skills cubre agent mode en VS Code, Visual Studio y JetBrains, además de Copilot CLI, el cloud agent y la app. La matriz de funcionalidades marca *Agent skills* como soportado desde VS Code **1.108** [11]. Conviene pedir el VS Code estable más reciente en la lección 0.

**Plugins** [4]: VS Code soporta *agent plugins*, que agrupan skills, agentes, hooks y MCP. Se activan con `chat.plugins.enabled` y se instalan con **Chat: Install Plugin From Source** o con `/plugin install <source>`. La documentación dice: *"VS Code also supports existing Copilot, Claude, and legacy OpenPlugin formats."* Las skills que llegan por plugin llevan prefijo, por ejemplo `/mattpocock-skills:grilling` [2]. Advertencia de la documentación: *"Plugins can include hooks and MCP servers that run code on your machine."*

## 2. Cómo instalar las skills de Matt

El README del repo de Matt da tres vías para Copilot [1].

**A. Plugin (se actualiza solo).** Es la vía que Matt recomienda desde el 2026-10-08 [12].
```bash
copilot plugin marketplace add mattpocock/skills
copilot plugin install mattpocock-skills@mattpocock
```
Una vez, en `~/.copilot/settings.json`:
```json
{ "extraKnownMarketplaces": { "mattpocock": { "source": { "source": "github", "repo": "mattpocock/skills" }, "autoUpdate": true } } }
```
En VS Code: **Chat: Install Plugin From Source** → `https://github.com/mattpocock/skills`. El plugin trae **27 skills** (`.claude-plugin/plugin.json`) [13]. Según el ADR del repo, *"Copilot CLI reads the same manifests and reports 'Installed 27 skills'"* [12].

**B. Copiar archivos editables** con `npx skills@latest add mattpocock/skills` (skills.sh). Matt avisa que no hay que combinarlo con el plugin: *"installing both gives you every skill twice"* [1].

**C. `gh skill install`** (GitHub CLI ≥ 2.90). Para Copilot instala en `.agents/skills` (proyecto) o en `~/.copilot/skills` (usuario) [14]. El repo de Matt organiza las skills en `skills/engineering/` y `skills/productivity/`, así que conviene pasar la ruta exacta, por ejemplo `gh skill install mattpocock/skills skills/productivity/grilling`. La ayuda de `gh` dice que la ruta exacta también evita recorrer todo el árbol [14].

**Recomendación para el workshop: vendorizar.** Copiar al repo base, en `.github/skills/`, solo las carpetas `grilling`, `domain-modeling`, `grill-with-docs` y, si se quiere, `tdd`. La licencia es MIT [13]. Ventajas: el alumno no instala nada, todos trabajan con la misma versión durante el directo, no aparecen 27 skills que distraigan y no hay que activar `chat.plugins.enabled`. La vía A queda como "para casa".

## 3. Dependencias

- **`/setup-matt-pocock-skills`**: se ejecuta una vez por repo. Pregunta por el issue tracker (GitHub, GitLab, Markdown local u otro), por las etiquetas de triage y por la estructura de docs. Escribe `docs/agents/*.md` y un bloque `## Agent skills` en `AGENTS.md`/`CLAUDE.md` [7].
- **Dependencia dura vs blanda** (ADR 0001 del repo) [8]:
  - *Dura*: `to-tickets`, `to-spec` y `triage` no funcionan bien sin el setup (tracker y etiquetas). `wayfinder` también exige el tracker: *"If not, tell the user to run `/setup-matt-pocock-skills`"* [15].
  - *Blanda*: `tdd`, `diagnosing-bugs` e `improve-codebase-architecture` funcionan sin setup. Solo leen `GLOSSARY.md` y los ADR si existen.
- **`gh` CLI autenticado**: solo hace falta con el tracker de GitHub [7]. El tracker Markdown local (`.scratch/`) lo evita.
- **`grilling`, `grill-me`, `domain-modeling` y `grill-with-docs` no necesitan setup ni `gh`.** `domain-modeling` crea o edita `GLOSSARY.md` y `docs/adr/` en el repo [6][1].
- **`tdd`** necesita un proyecto con runner de tests funcionando. La skill no instala nada [16].

## 4. Subconjunto didáctico para juniors (~30–40 min)

Criterios: que no requiera setup, que no requiera `gh`, que el resultado se vea en pocos minutos y que encaje con el hilo del Engineering Reviewer (entender el repo base y su vocabulario).

1. **`grilling`** (o `/grill-me`). Una entrevista por rondas con preguntas numeradas, cada una con la respuesta recomendada; contestar "yes" acepta la recomendación [6]. Matt la presenta como su skill más popular [1]. Ilustra bien el problema de "el agente no hizo lo que quería".
2. **`domain-modeling`**, a través de `/grill-with-docs`, que llama a `grilling` y a `domain-modeling` [6]. Deja como producto visible un `GLOSSARY.md` y algún ADR del repo base. Matt la describe como *"the single coolest technique in this repo"* [1]. Además alimenta las lecciones posteriores (docs y diagramas).
3. **`tdd`** (opcional, o para casa). Ciclo red-green por cortes verticales. Antes de escribir tests pide acordar las *seams* con el usuario [16].

Fuera de la lección, o solo mencionadas: `wayfinder`, `to-tickets`, `to-spec`, `triage` e `implement`/`implement-spec` (por la dependencia dura del tracker y de `gh`, y porque usan subagentes y flujos largos), y `code-review` (usa subagentes en paralelo, lo que es caro para la cuota Free). Una mención a `wayfinder` sirve para contar que este mismo workshop se diseñó con ese flujo.

## 5. Copilot Free / Student

- **Free**: agent mode incluido, Copilot CLI incluido en todos los planes, MCP incluido, solo modelo "Auto" y 2000 completions al mes. El resto de uso va contra una cuota limitada de *GitHub AI Credits* cuya cifra no publica la página de planes [9].
- **Student**: gratuito para estudiantes verificados. Incluye agent mode y code review, también con modelo "Auto" [9].
- No hay restricción documentada de skills ni plugins por plan [2][3][4]. Las restricciones de plugins vienen de políticas de empresa: *"Enterprise admins can centrally control which plugins and marketplaces are available"* [4]. Esto no afecta a cuentas personales.
- **Implicación práctica**: un grilling de varias rondas y un `grill-with-docs` que escribe archivos consumen bastantes peticiones. Para Free hay que limitar el ejercicio a 2–3 rondas y avisar de la cuota en la lección 0. Con "Auto" no se puede fijar el modelo, así que el comportamiento puede variar entre alumnos.

## 6. Fricciones conocidas

1. **No hay "Skill tool" en Copilot VS Code.** `grill-me` y `grill-with-docs` contienen solo *"Call the Skill tool with …"* [6]. En el razonamiento de Copilot en VS Code se ha visto: *"There isn't a callable Skill tool in this session, so I'll read the two requested skill files directly"* (issue #1052) [5]. Suele funcionar porque lee los archivos, pero no está garantizado. Un usuario documenta un parche que lo hace más fiable: cambiar el texto a `Use the skills /grilling and /domain-modeling` [5]. Al vendorizar se puede aplicar ese cambio en la copia del workshop, o enseñar directamente `/grilling`.
2. **El grilling "no espera" respuesta.** El issue abierto #1087 (2026-09-16) dice que en Copilot el agente asume que el usuario no está disponible y sigue sin dejarle contestar. El triage de Matt pide más datos y el issue sigue sin resolver [17]. Hay que ensayarlo con el modelo "Auto" de una cuenta Free antes del directo.
3. **Colisión de nombres.** Copilot CLI tiene un `/research` integrado que tapa la skill `research` (#857). Matt no va a renombrarla; la solución es la invocación con prefijo, `/mattpocock-skills:research` [18]. No afecta al subconjunto recomendado.
4. **Duplicados** si se instalan a la vez el plugin y skills.sh [1], o el plugin y la copia vendorizada. En el workshop hay que pedir que no se instale el plugin.
5. **Nombre inválido = fallo silencioso** (`name` distinto de la carpeta) [2]. Hay que tenerlo en cuenta al adaptar o traducir skills.
6. **Las skills están en inglés.** Copilot responderá en el idioma del usuario si se le pide, pero el formato de las preguntas (❓/➡️) y los términos siguen en inglés [6].

## Fuentes

1. README de `mattpocock/skills`: https://github.com/mattpocock/skills/blob/main/README.md
2. VS Code, *Agent Skills*: https://code.visualstudio.com/docs/copilot/customization/agent-skills
3. GitHub Docs, *About agent skills*: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
4. VS Code, *Agent plugins*: https://code.visualstudio.com/docs/copilot/customization/agent-plugins
5. Issue mattpocock/skills#1052 (y comentarios): https://github.com/mattpocock/skills/issues/1052
6. `grill-me`, `grill-with-docs`, `grilling`: https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling, https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me, https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs
7. `setup-matt-pocock-skills/SKILL.md`: https://github.com/mattpocock/skills/blob/main/skills/engineering/setup-matt-pocock-skills/SKILL.md
8. ADR 0001, *hard vs soft dependencies*: https://github.com/mattpocock/skills/blob/main/.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md
9. GitHub Docs, *Plans for GitHub Copilot*: https://docs.github.com/en/copilot/get-started/plans
10. `.agents/invocation.md`: https://github.com/mattpocock/skills/blob/main/.agents/invocation.md
11. GitHub Docs, *Copilot feature matrix*: https://docs.github.com/en/copilot/reference/copilot-feature-matrix
12. ADR 0002, *ship as a Claude Code plugin* (actualizaciones 2026-10-07 y 2026-10-08): https://github.com/mattpocock/skills/blob/main/.agents/adr/0002-ship-as-a-claude-code-plugin.md
13. `.claude-plugin/plugin.json` y `LICENSE`: https://github.com/mattpocock/skills/blob/main/.claude-plugin/plugin.json
14. `gh skill install --help` (GitHub CLI 2.90.0) y GitHub Docs, *Add skills* (Copilot CLI): https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
15. `wayfinder/SKILL.md`: https://github.com/mattpocock/skills/blob/main/skills/engineering/wayfinder/SKILL.md
16. `tdd/SKILL.md`: https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md
17. Issue mattpocock/skills#1087: https://github.com/mattpocock/skills/issues/1087
18. `.out-of-scope/harness-name-collisions.md` e issue #857: https://github.com/mattpocock/skills/blob/main/.out-of-scope/harness-name-collisions.md
