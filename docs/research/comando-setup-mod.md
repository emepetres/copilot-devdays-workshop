# Comando multiplataforma para traer el material del mod e instalar Docling

Investigación de la issue [#31](https://github.com/emepetres/copilot-devdays-workshop/issues/31), del [mapa #29](https://github.com/emepetres/copilot-devdays-workshop/issues/29). Fecha: 2026-10-24.

## Pregunta

¿Con qué mecanismo puede un asistente, con **un comando** que se escriba igual en PowerShell (Windows), bash/zsh (macOS, Linux) y Codespaces:

- (a) en los **prerrequisitos extra**, copiar a su repo **todo** el material del **mod** desde una carpeta de este repo fijada a una etiqueta, e instalar `docling-mcp[local]==3.3.0` con `uv` y hacer la conversión de calentamiento;
- (b) en cada **lección propia**, copiar solo el material de esa lección?

## Respuesta corta

Un **CLI de Node sin dependencias** dentro de este repo, ejecutado con `npx` directamente desde una etiqueta de GitHub:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 setup
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson docling
```

El comando se escribe igual en PowerShell 5.1/7, bash y zsh, y solo exige Node, npm y git, que ya tiene cualquiera que pueda arrancar Tailspin Toys. Como plan B para la copia, sin Docling, va `npx -y degit@3.10.1 --force …#mod-v1 .`, que se ha probado aquí.

Hay un hallazgo que obliga a cambiar el comando de instalación en Linux, y por tanto en **Codespaces**: `uv tool install "docling-mcp[local]==3.3.0"` resuelve allí el PyTorch **con CUDA**, unos **2,8 GiB** de ruedas de más. Hay que añadir `--torch-backend cpu`, que `uv tool install` admite desde uv 0.10.

## 1. Qué garantiza ya el workshop base

| Herramienta | Codespace / dev container de la base | Local sin contenedor (lo que recomienda el ponente) |
|---|---|---|
| Node.js ≥ 22.13 y npm | Sí. Imagen `mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm` [1] | Sí, en la práctica: `package.json` exige `"node": ">=22.13"` (`node:sqlite`) para arrancar la app [2] |
| git | Sí (imagen base) | Sí: hace falta para clonar el repo |
| `gh` | Sí. Feature `ghcr.io/devcontainers/features/github-cli:1` [1] | **No**: los prerrequisitos base no lo piden [3] |
| Python | No hace falta (lo pone `uv`) | No garantizado |
| `uv` | **No** | **No** |
| Chromium de Playwright | Sí (`postCreateCommand`) [1] | No (`npm run test:e2e:install`) |

Los prerrequisitos base solo piden crear el repo desde la plantilla, abrir un Codespace (o *Reopen in Container* en local) y comprobar Copilot Chat [3]. No instalan nada por su cuenta: todo lo pone el dev container. Commits consultados: `github-samples/copilot-workshops@35c69f6` y `github-samples/tailspin-toys@a0f74a8`.

**Consecuencia:** el único denominador común fiable es **Node + npm + git**. `gh` queda descartado como requisito del comando (en local no está garantizado), y `uv` lo tiene que instalar el propio setup.

## 2. Opciones comparadas

| Opción | Un solo comando igual en PS y bash | Requisitos | Subcarpeta + etiqueta | Instala Docling | Riesgos |
|---|---|---|---|---|---|
| **A. `npx github:<repo>#<tag> <subcomando>`** (CLI propio) | **Sí** | Node, npm, git | Sí: el paquete es el repo en la etiqueta; el CLI elige qué copiar | **Sí**, en el mismo comando | Hay que mantener ~150 líneas. La primera ejecución tarda ~20 s (npm descarga el repo). Requiere `package.json` en la raíz |
| B. `npx degit` / `tiged` | Sí para la **copia** | Node, npm | Sí (`owner/repo/sub#tag`) | **No**: hace falta un segundo comando | Paquete de terceros descargado en tiempo de ejecución. No admite SHA corto. Sin `--force` aborta si la carpeta no está vacía |
| C. `gh` (`gh api`, `gh repo clone`) | No (copiar la subcarpeta exige comandos de shell distintos) | `gh` autenticado | Indirecto | No | `gh` no está garantizado en local |
| D. `curl` + `tar` / script remoto (`irm … \| iex`, `curl … \| sh`) | **No**: dos comandos distintos | curl/tar (Windows 10+ los trae) | Sí (tarball de codeload + `--strip-components`) | Sí, si el script lo hace | Dos scripts que mantener (PS y sh). En PowerShell, `curl` es un alias de `Invoke-WebRequest` (5.1) y la tubería binaria nativa no funciona en 5.1. Copiar y pegar `iex` asusta a un público junior |
| E. `git clone --sparse` + copiar | No | git | Sí | No | Muchos pasos y `cp`/`Copy-Item` distintos |

### Experimentos realizados (Windows 11, Node 26.1, npm 11.14)

- **degit 3.10.1 y tiged 2.12.8**: `npx -y degit@3.10.1 --force docling-project/docling-mcp/docs#v3.3.0 .` copia la subcarpeta de esa etiqueta en ~3 s y **fusiona** sus archivos con los que ya hay: no borra nada. Sin `--force`, aborta con `destination directory is not empty`. Con un SHA corto (`#a28b180`) falla con `could not find commit hash`, así que hay que usar una **etiqueta o rama**. Funciona igual en **pwsh 7** y en **Windows PowerShell 5.1**: el `#` dentro de un argumento no inicia un comentario.
- **`npx github:owner/repo#tag`**: `npx -y github:piuccio/cowsay#v1.5.0 hola` descarga el repo en esa etiqueta, instala sus dependencias y ejecuta su `bin` en ~20 s. Con una etiqueta inexistente, sale sin error visible, así que el CLI debe imprimir siempre algo. **No se ha probado todavía con este repo** (hace falta el `package.json` en la raíz): ver §6.
- **Resolución de `docling-mcp[local]==3.3.0` para Linux x86_64** (`uv pip compile --python-platform x86_64-manylinux_2_28 --python-version 3.12`): sin opciones, arrastra `torch==2.14.1`, `triton` y 15 paquetes `nvidia-*` (cuBLAS, cuDNN, NCCL…), que suman **~2.861 MiB** según los tamaños de PyPI. Con `--torch-backend cpu` se resuelve `torch==2.14.1+cpu` sin `nvidia-*` ni `triton`. OpenCV es `opencv-python-headless`, así que no necesita `libGL` en el contenedor.
- **`--torch-backend` en `uv tool install`**: no existe en uv 0.9.0, y sí en 0.10.0, 0.11.0, 0.12.0 y 0.13.5 (la última, según `uv tool install --help`). La guía de PyTorch de uv aún dice que solo está en la interfaz `uv pip` [5], pero el `--help` lo contradice.

### Por qué A y no B

- **Un solo comando** para (a) que copia **e** instala Docling, y el mismo para (b), cambiando solo el subcomando. Con B, el setup son dos comandos y el segundo depende de que el primero haya traído el script.
- **Sin dependencias de terceros en tiempo de ejecución.** Con B, cada asistente ejecuta la última publicación de un paquete npm ajeno (degit ha sacado 13 versiones desde julio de 2026), aunque se fije la versión.
- **Mensajes en inglés y comprobaciones** pensadas para juniors: que estás en la raíz de Tailspin Toys, que no se sobrescribe nada sin avisar, qué se ha copiado, y qué hacer si falla.
- **El script de calentamiento no tiene que copiarse al repo del asistente.** Se ejecuta desde el paquete, así que ni hay que tocar el `package.json` de la base ni el **Engineering Reviewer** lo encuentra en el repo.
- B sigue siendo un buen **plan B** para la copia, y se ha comprobado que funciona.

## 3. Diseño propuesto

### Estructura en este repo

```text
package.json            # raíz: name, bin, "files": ["mod"], engines node >=22.13, sin dependencias ni scripts
mod/
  cli.mjs               # el CLI (Node puro: fs.cpSync, child_process)
  warmup/
    calentamiento.pdf   # (en inglés: regenerado, ver idioma del mod)
    warmup.mjs          # el de la plantilla retirada, adaptado
  lessons/              # una carpeta por lección propia; dentro, rutas tal cual en el repo del asistente
    pocock/.github/skills/implement-lite/SKILL.md
    images/docs/architecture.png
    docling/docs/requisitos.pdf
    docling/docs/acta-reunion.pdf
    docling/docs/reviews/_docling/*.md
    extra/reviewer/…
```

La etiqueta (`mod-v1`) se crea tras el ensayo y es la que citan los prerrequisitos extra y las lecciones. Si hay que corregir algo, se publica `mod-v2` y se actualizan los enlaces: nunca se mueve una etiqueta publicada, porque npx guarda en caché lo que ya descargó.

### Subcomandos

| Comando | Qué hace |
|---|---|
| `setup` | `lesson` de todas las lecciones, luego instala `uv` si falta, después Docling y por último `warmup` |
| `lesson <nombre>` | Copia `mod/lessons/<nombre>/` a la raíz del repo |
| `warmup` | Vuelve a hacer la conversión de calentamiento (por si se cortó) |

### Lógica de `setup`

1. **Comprobar dónde está**: la carpeta actual tiene un `package.json` con `"name": "tailspin-toys"`. Si no, sale con el mensaje "Run this from the root of your Tailspin Toys repo". `npx` conserva el directorio de trabajo.
2. **Copiar** cada lección con `fs.cpSync(src, cwd, { recursive: true, force: false, errorOnExist: false })` y listar lo copiado. Si un archivo ya existe, lo deja como está y avisa.
3. **`uv`**: si `uv --version` falla, se lanza el instalador oficial [4]. En Windows es `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`, y en macOS/Linux, `curl -LsSf https://astral.sh/uv/install.sh | sh`. Después se antepone `~/.local/bin` (en Windows, `%USERPROFILE%\.local\bin`) al `PATH` **del proceso**, porque la terminal actual no lo verá hasta reabrirse. Si `uv` existe pero es < 0.10 y estamos en Linux, se pide actualizarlo: `uv self update` solo sirve para instalaciones del instalador oficial; con winget o brew, se actualiza con ellos [4].
4. **Docling**: `uv tool install "docling-mcp[local]==3.3.0"`, más `--torch-backend cpu` en Linux. En Windows y macOS, PyPI ya sirve PyTorch para CPU, y así no cambia lo medido en [#5](https://github.com/emepetres/copilot-devdays-workshop/issues/5). Después, `uv tool update-shell`.
5. **Calentamiento**: se antepone `uv tool dir --bin` al `PATH` del proceso y se ejecuta `warmup.mjs`. Arranca `docling-mcp-server --transport stdio conversion manipulation` con `DOCLING_MCP_CONVERSION_MODE=local`, convierte el PDF y busca la palabra de control del OCR. Es la misma lógica que la plantilla retirada.
6. **Cierre**: muestra la lista de comprobación (`uv tool list` → `docling-mcp v3.3.0`, documento convertido) y avisa de **reiniciar VS Code** para que el servidor MCP encuentre `docling-mcp-server` en el `PATH`.

### Boceto de los comandos para los asistentes

Prerrequisitos extra (en casa), en la terminal integrada de VS Code y desde la raíz del repo:

```powershell
# Windows (PowerShell)
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 setup
```

```shell
# macOS, Linux y Codespaces (bash/zsh)
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 setup
```

En cada lección propia, para quien siga el workshop después:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 lesson docling
```

Plan B si `npx github:` falla (por ejemplo, por un proxy que bloquea git). Solo copia el material:

```shell
npx -y degit@3.10.1 --force emepetres/copilot-devdays-workshop/mod/lessons/docling#mod-v1 .
```

Si Windows PowerShell responde `running scripts is disabled on this system`, se escribe `npx.cmd` en lugar de `npx`. El mismo problema afectaría a `npm install` en la base, así que quien ejecuta la app en local ya lo tiene resuelto.

## 4. Codespaces

- **Coste**: las cuentas personales Free incluyen **120 h de cómputo** (multiplicadas por núcleos: 60 h en una máquina de 2 núcleos) y **15 GB-mes** de almacenamiento [6]. Docling con PyTorch para CPU añade ~1 GB instalado y ~510 MB de modelos ([#5](https://github.com/emepetres/copilot-devdays-workshop/issues/5)). **Sin `--torch-backend cpu` serían ~3 GB más.**
- **Persistencia**: `uv` instala en `~/.local` y los modelos van a `~/.cache/huggingface`, fuera de `/workspaces`. Sobreviven a que el Codespace se pare, pero **no** a un *rebuild*. Hay que avisar: "usa el **mismo** Codespace el día del workshop y no lo reconstruyas".
- La red de un Codespace es la de un centro de datos, así que la descarga no es el cuello de botella. Lo que pesa es la **CPU** (2 núcleos), sobre todo el OCR.

## 5. Sin verificar: para el ensayo

| Qué | Mejor evidencia disponible | Cómo verificarlo |
|---|---|---|
| Tiempo de `setup` y de la conversión con OCR en un Codespace de **2 núcleos** | En escritorio i7: instalación ~55 s, PDF de 9 págs. 22–32 s, página escaneada ~31 s ([#5](https://github.com/emepetres/copilot-devdays-workshop/issues/5)). En un portátil, ×2–4. En 2 vCPU es de esperar lo mismo o peor | Cronometrar `setup` en un Codespace de 2 núcleos recién creado |
| Que `docling-mcp-server` esté en el `PATH` de VS Code dentro de Codespaces tras `uv tool update-shell` | En Debian, `~/.profile` añade `~/.local/bin` si existe en un shell de login. No consta qué hace el servidor de VS Code | Tras `setup`, recargar la ventana y arrancar el MCP de Docling. Si no lo encuentra, poner en `mcp.json` la ruta absoluta o `"command": "uv", "args": ["tool","run","--from","docling-mcp[local]==3.3.0","docling-mcp-server",…]` |
| `chat.plugins.enabled` en VS Code dentro de Codespaces (web y escritorio) | Es un ajuste normal de VS Code y los Codespaces usan el mismo VS Code. No se ha probado | Activarlo en el Codespace e instalar las skills de Matt Pocock |
| Que Copilot lea `docs/architecture.png` del workspace en Codespaces (web y escritorio) | Sin evidencia específica de Codespaces | Lanzar la skill `review-diagram` en el Codespace. Plan B: adjuntar la imagen al chat |
| Que `npx github:emepetres/copilot-devdays-workshop#<etiqueta>` funcione con este repo (empaquetado de `files`, `bin` en Windows/macOS/Linux, `cwd` correcto) | Probado con otro repo (`piuccio/cowsay`), no con este | Spike de 10 min: rama con `package.json` y `mod/cli.mjs` mínimos, `npx -y github:…#rama lesson x` en Windows, macOS y Codespace |
| `--torch-backend cpu` en `uv tool install` real (no solo `pip compile`) en Linux, y que Docling funcione con `torch+cpu` | La resolución es correcta. La instalación no se ha ejecutado en Linux | Hacerlo dentro del Codespace del ensayo |
| `npx` con la directiva de ejecución `Restricted` de Windows | Aquí la directiva es `RemoteSigned` | En un Windows limpio |
| macOS (Apple Silicon) de principio a fin | La lección 0 retirada no se verificó en macOS | En el ensayo |

## 6. Siguientes pasos que se derivan

1. Spike del CLI (§5, fila 5) antes de escribir las lecciones propias.
2. Regenerar el PDF de calentamiento en inglés y llevar `warmup.mjs` a `mod/warmup/`, con mensajes en inglés.
3. En la lección de Docling, el `mcp.json` debe usar la misma configuración que `warmup.mjs` (`--transport stdio conversion manipulation`, `DOCLING_MCP_CONVERSION_MODE=local`).
4. Crear la etiqueta `mod-v1` después del ensayo y anotarla en la portada junto con el commit de la base ensayado.

## Fuentes

1. `github-samples/tailspin-toys`, [`.devcontainer/devcontainer.json`](https://github.com/github-samples/tailspin-toys/blob/a0f74a8d1b10d16db9921855746f7ebc410e2f85/.devcontainer/devcontainer.json) (commit `a0f74a8`).
2. `github-samples/tailspin-toys`, [`package.json`](https://github.com/github-samples/tailspin-toys/blob/a0f74a8d1b10d16db9921855746f7ebc410e2f85/package.json).
3. `github-samples/copilot-workshops`, [`docs/real-world-development/vscode/0-prerequisites.md`](https://github.com/github-samples/copilot-workshops/blob/35c69f6c039f073a46cce8891f21eecdfc1fa339/docs/real-world-development/vscode/0-prerequisites.md) (commit `35c69f6`).
4. uv, [Installation](https://docs.astral.sh/uv/getting-started/installation/): instaladores oficiales, ruta `~/.local/bin` y `uv self update` solo para el instalador oficial.
5. uv, [Using uv with PyTorch](https://github.com/astral-sh/uv/blob/main/docs/guides/integration/pytorch.md) (§ *Automatic backend selection*), y `uv tool install --help` de uv 0.9.0, 0.10.0 y 0.13.5 (ejecutado con `uvx uv@<versión>`).
6. GitHub Docs, [GitHub Codespaces billing](https://docs.github.com/en/billing/concepts/product-billing/github-codespaces).
7. PyPI JSON API: [`torch` 2.14.1](https://pypi.org/pypi/torch/2.14.1/json) (dependencias `nvidia-*` en Linux) y [`docling-mcp` 3.3.0](https://pypi.org/pypi/docling-mcp/3.3.0/json) (extra `local` → `docling-slim[standard]`).
8. npm: [`degit`](https://www.npmjs.com/package/degit) 3.10.1 (Rich-Harris/degit) y [`tiged`](https://www.npmjs.com/package/tiged) 2.12.8. npm docs, [`npx`](https://docs.npmjs.com/cli/commands/npx) y [package spec](https://docs.npmjs.com/cli/using-npm/package-spec) (`github:owner/repo#ref`).
9. Plantilla retirada `emepetres/tailspin-toys-devdays`, `scripts/docling-warmup/warmup.mjs`, y la investigación de Docling en [#5](https://github.com/emepetres/copilot-devdays-workshop/issues/5).
