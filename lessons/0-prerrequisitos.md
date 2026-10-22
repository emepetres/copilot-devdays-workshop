---
title: "Lección 0 · Prerrequisitos"
---

**Objetivo:** llegar con todo instalado, tu repo creado desde la plantilla del workshop y los modelos de Docling ya descargados.

Esta lección se hace **en casa, antes del workshop**. Cuenta con **unos 45 minutos** y unos **1,5 GB de descargas**.

> [!CAUTION]
> **No la dejes para el día del workshop.** Docling descarga ~800 MB entre paquetes de Python y modelos. Con 40 personas compartiendo la wifi del evento no da tiempo, y sin Docling no podrás hacer la [lección 6](../6-engineering-reviewer/).

En esta lección:

- activarás GitHub Copilot en tu cuenta y prepararás VS Code.
- instalarás Git, Node.js y la CLI de GitHub (`gh`).
- crearás tu repo a partir de la plantilla del workshop y lo dejarás funcionando en local.
- instalarás el navegador de Playwright y Docling, y harás una **conversión de calentamiento** para descargar sus modelos.

Todos los comandos se ejecutan en una terminal: **Windows Terminal** (PowerShell) en Windows o **Terminal** en macOS. Tras instalar cada herramienta, **abre una terminal nueva** para que se actualice el `PATH`.

> [!NOTE]
> Estas instrucciones se han probado en **Windows 11**. Los pasos de **macOS** (Apple Silicon) aún no se han verificado de principio a fin. Si algo no cuadra en tu Mac, abre una issue en el [repo del workshop][workshop-issues].

## 1. Cuenta de GitHub con Copilot

Necesitas una cuenta de GitHub con Copilot activado. **No hace falta ningún plan de pago**: el workshop está pensado para **Copilot Free** y **Copilot Student**.

1. Si no tienes cuenta, [crea una cuenta de GitHub][github-signup].
2. Activa Copilot en [github.com/settings/copilot][copilot-settings]:
   - Si eres estudiante, solicita el [GitHub Student Developer Pack][student-pack], que incluye **Copilot Student**. La verificación puede tardar unos días, así que hazlo cuanto antes.
   - Si no, activa **Copilot Free**.

> [!NOTE]
> Copilot Free y Student solo permiten la **selección automática de modelo** (*Auto*). Todo el workshop está probado con *Auto*.

## 2. VS Code y Copilot Chat

1. Instala o actualiza [VS Code][vscode] a la versión **1.112 o posterior**. Compruébalo en **Help** > **About** (en macOS, **Code** > **About Visual Studio Code**).
2. Copilot y Copilot Chat vienen integrados en VS Code. Abre la vista **Chat** desde el icono de Copilot de la barra de título e **inicia sesión con tu cuenta de GitHub**.
3. Escribe `Hola` en el chat y confirma que responde.
4. Activa los **plugins de agente**, que usarás en la [lección 3](../3-flujo-matt-pocock/) para instalar las skills de Matt Pocock:
   1. Abre la configuración con <kbd>Ctrl</kbd>+<kbd>,</kbd> (en macOS, <kbd>Cmd</kbd>+<kbd>,</kbd>).
   2. Busca `chat.plugins.enabled` y marca la casilla.

## 3. Git y Node.js

La app del workshop, Tailspin Toys, necesita **Node.js 22.13 o posterior**, porque usa el módulo `node:sqlite`.

1. Comprueba qué tienes instalado:

   ```shell
   git --version
   node --version
   ```

2. Si `git` no existe, instálalo desde [git-scm.com][git]. En macOS también puedes ejecutar `xcode-select --install`.
3. Si `node` no existe o su versión es anterior a la **22.13**, descarga la versión **LTS** desde la [página de descarga de Node.js][node-download] y ejecuta el instalador con las opciones predeterminadas. En Windows, deja marcada la opción **Add to PATH**.
4. Abre una terminal nueva y vuelve a ejecutar `node --version`.

## 4. CLI de GitHub (`gh`)

Copilot usa `gh` en varias lecciones para leer y crear issues de tu repo.

1. Instálala:

   ```powershell
   # Windows
   winget install --id GitHub.cli
   ```

   ```shell
   # macOS
   brew install gh
   ```

   Si no usas `winget` ni Homebrew, descarga el instalador desde [cli.github.com][gh-cli].

2. Abre una terminal nueva e inicia sesión. Acepta las opciones por defecto (**GitHub.com**, **HTTPS**, autenticar Git con tus credenciales de GitHub e iniciar sesión con el navegador):

   ```shell
   gh auth login
   ```

3. Comprueba que has iniciado sesión:

   ```shell
   gh auth status
   ```

## 5. Tu repo desde la plantilla del workshop

Trabajarás con tu propia copia de Tailspin Toys, creada desde la **plantilla del workshop**. No es un *fork*: se crea con **Use this template**.

1. Abre [github.com/emepetres/tailspin-toys-devdays][template].
2. Pulsa **Use this template** > **Create a new repository**.
3. Elige tu usuario como propietario, ponle un nombre (por ejemplo, `tailspin-toys`) y pulsa **Create repository**. Puede ser público o privado.
4. Espera **un minuto**. Al crear el repo, un workflow de GitHub Actions genera el **backlog de issues** y después hace un commit de limpieza. Comprueba que aparecen las issues en la pestaña **Issues** de tu repo.

> [!TIP]
> También puedes crearlo desde la terminal: `gh repo create tailspin-toys --template emepetres/tailspin-toys-devdays --private`. Igualmente, espera a que aparezcan las issues antes de clonarlo.

5. Clona el repo en una **ruta corta** y ábrelo en VS Code. Cambia `TU_USUARIO` por tu usuario de GitHub:

   ```powershell
   # Windows: una carpeta corta, como C:\dev
   mkdir C:\dev -Force
   cd C:\dev
   gh repo clone TU_USUARIO/tailspin-toys
   cd tailspin-toys
   code .
   ```

   ```shell
   # macOS
   mkdir -p ~/dev && cd ~/dev
   gh repo clone TU_USUARIO/tailspin-toys
   cd tailspin-toys
   code .
   ```

6. Cuando VS Code pregunte si confías en los autores de la carpeta, responde **Yes, I trust the authors**. Ver [Workspace Trust](#workspace-trust).
7. Abre la terminal integrada de VS Code (**Terminal** > **New Terminal**) e instala las dependencias:

   ```shell
   npm install
   ```

8. Arranca la app y abre <http://localhost:4321> en el navegador. Deberías ver el catálogo de juegos de Tailspin Toys. Para pararla, pulsa <kbd>Ctrl</kbd>+<kbd>C</kbd> en la terminal.

   ```shell
   npm run dev
   ```

## 6. Navegador de Playwright

En la [lección 5](../5-playwright-mcp/), Copilot prueba la app en un navegador con Playwright. Descarga ahora su Chromium (~300 MB). Desde la carpeta del repo:

```shell
npx playwright install chromium
```

## 7. Docling y la conversión de calentamiento

[Docling][docling] convierte PDFs y documentos escaneados (con OCR) para que el agente los lea por partes, gastando muchos menos tokens. Lo usarás en la [lección 6](../6-engineering-reviewer/) a través de su servidor MCP. Es el paso más pesado de la lección:

| Qué | Descarga | Tiempo aproximado |
|---|---|---|
| `uv` | ~20 MB | segundos |
| `docling-mcp` (Python, PyTorch para CPU y dependencias) | ~300 MB (~1 GB instalado) | 1–5 min |
| Modelos de Docling, en la primera conversión | ~510 MB | 2–10 min |

Los tiempos dependen de tu conexión y de tu equipo. Los mínimos se midieron con fibra y un ordenador de sobremesa.

### Instala `uv`

[`uv`][uv] instala herramientas de Python. No necesitas tener Python: `uv` descarga el suyo.

```powershell
# Windows
winget install --id astral-sh.uv
```

```shell
# macOS
brew install uv
```

Si no usas `winget` ni Homebrew, sigue la [guía de instalación de `uv`][uv-install]. Abre una terminal nueva y comprueba que funciona con `uv --version`.

### Instala Docling MCP

Instala la versión exacta que usa el workshop, con el extra `[local]`, que permite convertir documentos en tu equipo sin un servidor externo:

```shell
uv tool install "docling-mcp[local]==3.3.0"
```

Si al final `uv` avisa de que su carpeta de ejecutables no está en el `PATH`, ejecuta `uv tool update-shell` y abre una terminal nueva.

### Haz la conversión de calentamiento

La plantilla incluye un PDF de calentamiento, `scripts/docling-warmup/calentamiento.pdf`, con una página de texto y una página escaneada. Convertirlo descarga los modelos de layout, de tablas y de OCR.

Desde la carpeta del repo, ejecuta:

```shell
npm run docling:warmup
```

El script arranca `docling-mcp-server` con la misma configuración que usará Copilot en la lección 6 (por `stdio` y con `DOCLING_MCP_CONVERSION_MODE=local`), convierte el PDF y busca en la página escaneada una palabra que solo se puede leer con OCR. La primera vez tarda varios minutos y, durante la descarga, no muestra progreso: **déjalo terminar**. Al final verás:

```text
✔ docling-mcp-server arrancado (2 s)
⏳ Convirtiendo calentamiento.pdf. La primera vez descarga ~510 MB de modelos y puede tardar varios minutos...
✔ PDF convertido (92 s)
✔ OCR de la página escaneada: «Giralda» encontrada

✅ Docling está listo. document_key: 2521dddac0a6a3c282fd752144f50498
```

Los modelos quedan en la caché de Hugging Face de tu usuario (`~/.cache/huggingface`). Si lo vuelves a ejecutar, ya no descarga nada y solo tarda lo que cuesta convertir.

> [!WARNING]
> **Mac con procesador Intel**: PyTorch ya no publica versiones para Mac Intel, así que Docling puede no instalarse. Si te pasa, avisa en el workshop: harás la lección 6 en pareja con alguien que lo tenga funcionando.

<details>
<summary>Si el script falla</summary>

- **`No se encuentra docling-mcp-server`**: ejecuta `uv tool update-shell`, cierra **todas** las terminales (también la de VS Code) y vuelve a probar. Si sigue fallando, comprueba que la instalación terminó con `uv tool list`.
- **`WinError 206`, `FileNotFoundError` o rutas muy largas en Windows**: ver [Rutas largas en Windows](#rutas-largas-en-windows).
- **El OCR no encuentra la palabra de control**: copia el error y las líneas del log que muestra el script y abre una issue en el [repo del workshop][workshop-issues].
- **Se corta la descarga**: vuelve a ejecutar `npm run docling:warmup`. Los modelos que ya se descargaron no se repiten.

</details>

## 8. Avisos

### Workspace Trust

VS Code abre las carpetas que no conoce en **modo restringido**. En ese modo no arrancan los servidores MCP de `.vscode/mcp.json`, que usarás en las lecciones 5 y 6. Si al abrir el repo respondiste que no confiabas en él, abre la paleta de comandos (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>; en macOS, <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>), ejecuta **Workspaces: Manage Workspace Trust** y pulsa **Trust**.

### Rutas largas en Windows

Windows limita las rutas a 260 caracteres por defecto, y algunos paquetes de Python y modelos de Docling tienen rutas muy profundas. Para evitar problemas:

- Clona el repo en una ruta corta, como `C:\dev\tailspin-toys`, y no en una carpeta muy anidada.
- Deja `uv` y Hugging Face en sus carpetas por defecto: no cambies `UV_CACHE_DIR` ni `HF_HOME`.
- Si aun así ves `WinError 206` o `FileNotFoundError` con rutas larguísimas, activa las rutas largas. Abre PowerShell **como administrador**, ejecuta estos dos comandos y reinicia el equipo:

  ```powershell
  New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
  git config --global core.longpaths true
  ```

## Comprobación final

Abre una terminal **nueva** en la carpeta de tu repo y ejecuta estos comandos. **Si ves lo de la columna derecha en todos, estás listo** para el workshop.

| Comando | Qué deberías ver |
|---|---|
| `git --version` | `git version …` |
| `node --version` | `v22.13` o posterior |
| `gh auth status` | `Logged in to github.com account TU_USUARIO` |
| `gh issue list` | El backlog de issues de tu repo, entre ellas *Allow users to sort the game list* |
| `uv tool list` | `docling-mcp v3.3.0` |
| `npm run docling:warmup` | `✅ Docling está listo. document_key: …` |

Y en VS Code:

- La versión es la **1.112 o posterior** y el chat de Copilot responde.
- `chat.plugins.enabled` está activado.
- La carpeta del repo es de confianza: no aparece **Restricted Mode** en la barra de estado.
- `npm run dev` muestra el catálogo en <http://localhost:4321>.

## Resumen y pasos siguientes

Ya tienes el entorno preparado. En esta lección:

- has activado Copilot y preparado VS Code.
- has instalado Git, Node.js y `gh`.
- has creado tu repo desde la plantilla del workshop y lo has arrancado en local.
- has instalado Playwright y Docling, y has descargado los modelos de Docling.

El día del workshop empezarás por la [lección 1: Custom instructions](../1-custom-instructions/).

## Recursos

- [Planes de GitHub Copilot][copilot-plans]
- [Descargar Node.js][node-download]
- [Crear un repositorio a partir de una plantilla][template-docs]
- [Instalación de `uv`][uv-install]
- [Docling MCP][docling-mcp]

[github-signup]: https://github.com/signup
[copilot-settings]: https://github.com/settings/copilot
[copilot-plans]: https://github.com/features/copilot/plans
[student-pack]: https://education.github.com/pack
[vscode]: https://code.visualstudio.com/
[git]: https://git-scm.com/downloads
[node-download]: https://nodejs.org/en/download
[gh-cli]: https://cli.github.com/
[template]: https://github.com/emepetres/tailspin-toys-devdays
[template-docs]: https://docs.github.com/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template
[docling]: https://docling-project.github.io/docling/
[docling-mcp]: https://github.com/docling-project/docling-mcp
[uv]: https://docs.astral.sh/uv/
[uv-install]: https://docs.astral.sh/uv/getting-started/installation/
[workshop-issues]: https://github.com/emepetres/copilot-devdays-workshop/issues
