---
title: "Extra prerequisites"
---

Do this after *[Exercise 0 · Prerequisites][ex0]*, at home, before the workshop.

**Goal:** install Docling, download its models and bring in the material for the mod lessons, so everything is ready on the day.

Plan for **about 30 minutes** and **about 1.5 GB of downloads**.

> [!CAUTION]
> **Don't leave this for the day of the workshop.** Docling downloads ~800 MB of Python packages and models. With the whole room sharing the venue wifi there is no time for it, and without Docling you can't do *[The Engineering Reviewer with Docling MCP](../engineering-reviewer/)*.

Pick **one** of the two routes. Both start with the repo you created from the template in Exercise 0, and both end with the same `check`.

| Route | What it is | Recommended? |
|---|---|---|
| [Local, without a container](#route-a-local-without-a-container) | VS Code on your own computer, with the repo cloned | **Yes**: faster, and nothing to lose if a codespace stops |
| [Codespaces](#route-b-codespaces) | The codespace from Exercise 0, as the base workshop does | Works too |

> [!NOTE]
> These steps have been tested on **Windows 11**. The macOS (Apple Silicon) steps have not been verified end to end yet. If something doesn't match on your Mac, open an issue in the [workshop repo][workshop-issues].

## Copilot plan and model

The workshop needs the same Copilot plans as the base workshop: **Student, Pro, Pro+, Business or Enterprise**. **Copilot Free is not supported.** If you are a student, apply for the [GitHub Student Developer Pack][student-pack], which includes Copilot Student. Verification can take a few days, so do it as soon as possible.

> [!IMPORTANT]
> Always pick the **Auto** model in the chat, **even when a base exercise asks for another one**. Exercise 2 asks for Claude Sonnet 4.5, which has been retired. The whole workshop has been tested with *Auto*, and it is the only option with Copilot Student.

## Route A: local, without a container

Every command runs in a terminal: **Windows Terminal** (PowerShell) on Windows or **Terminal** on macOS. After installing each tool, **open a new terminal** so that its `PATH` is up to date.

### 1. VS Code

Install or update [VS Code][vscode] to version **1.112 or later**. Check it in **Help** > **About** (on macOS, **Code** > **About Visual Studio Code**). Copilot Chat is built in: open the **Chat** view from the Copilot icon in the title bar and sign in with your GitHub account.

### 2. Git and Node.js

Tailspin Toys needs **Node.js 22.13 or later**, because it uses the `node:sqlite` module.

1. Check what you have:

   ```shell
   git --version
   node --version
   ```

2. If `git` is missing, install it from [git-scm.com][git]. On macOS you can also run `xcode-select --install`.
3. If `node` is missing or older than **22.13**, download the **LTS** version from the [Node.js download page][node-download] and run the installer with the default options. On Windows, keep **Add to PATH** checked.
4. Open a new terminal and run `node --version` again.

### 3. GitHub CLI (`gh`)

*[Matt Pocock's workflow](../pocock-workflow/)* uses `gh` to read and label the issues of your repo.

1. Install it:

   ```powershell
   # Windows
   winget install --id GitHub.cli
   ```

   ```shell
   # macOS
   brew install gh
   ```

   If you don't use `winget` or Homebrew, download the installer from [cli.github.com][gh-cli].

2. Open a new terminal and sign in. Accept the defaults (**GitHub.com**, **HTTPS**, authenticate Git with your GitHub credentials and log in with a web browser):

   ```shell
   gh auth login
   ```

### 4. Clone your repo

Clone the repo you created in Exercise 0 into a **short path** and open it in VS Code. Replace `YOUR_USER/YOUR_REPO` with the repository path you noted down in Exercise 0:

```powershell
# Windows: a short folder, such as C:\dev
mkdir C:\dev -Force
cd C:\dev
gh repo clone YOUR_USER/YOUR_REPO
cd YOUR_REPO
code .
```

```shell
# macOS
mkdir -p ~/dev && cd ~/dev
gh repo clone YOUR_USER/YOUR_REPO
cd YOUR_REPO
code .
```

When VS Code asks whether you trust the authors of the folder, answer **Yes, I trust the authors**. In Restricted Mode the MCP servers of `.vscode/mcp.json` don't start.

### 5. App dependencies and the Playwright browser

Open the integrated terminal of VS Code (**Terminal** > **New Terminal**) and run:

```shell
npm install
npx playwright install chromium
```

The second command downloads the Chromium (~300 MB) that Copilot uses in *[Exercise 3 · Playwright MCP][ex3]*.

You can check that the app works with `npm run dev`: it shows the Tailspin Toys catalog at <http://localhost:4321>. Stop it with <kbd>Ctrl</kbd>+<kbd>C</kbd>.

### 6. Run `setup`

Go on to [Set up the mod](#set-up-the-mod).

## Route B: Codespaces

1. Do Exercise 0 as it is: your codespace already has Node, git and `gh`.
2. Open the terminal of your codespace (**Terminal** > **New Terminal**) and go on to [Set up the mod](#set-up-the-mod).

> [!WARNING]
> **Use this same codespace on the day of the workshop, and don't rebuild it.** Docling and its models are installed in your home folder, outside `/workspaces`, so a new or rebuilt codespace loses them. A codespace that stops after a while of inactivity keeps them: just open it again from the **Code** > **Codespaces** tab of your repo.

## Set up the mod

The mod has a small command-line tool that does everything in one go. From the root of your repo, in the VS Code terminal, run:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 setup
```

It works the same in PowerShell, bash and zsh. `setup`:

1. **Copies the material** of every mod lesson (skills, documents, diagrams…) to its place in your repo. Leave it uncommitted: each lesson tells you when to commit it. It never overwrites a file you already have.
2. **Installs [`uv`][uv]** with its official installer, if you don't have it. `uv` installs Python tools; you don't need Python.
3. **Installs [Docling MCP][docling-mcp]** `3.3.0`, the exact version of the workshop. On Linux and Codespaces it installs the CPU build of PyTorch, to avoid ~2.8 GB of GPU libraries.
4. **Runs a warm-up conversion**: it starts `docling-mcp-server` with the same configuration Copilot will use, converts a two-page PDF and checks that OCR reads a control word on its scanned page. This downloads Docling's models.

| Step | Download | Approximate time |
|---|---|---|
| `uv` | ~20 MB | seconds |
| Docling MCP (Python, PyTorch for CPU and dependencies) | ~300 MB (~1 GB installed) | 1–5 min |
| Docling models, during the warm-up | ~510 MB | 1–10 min |

The warm-up shows no progress while it downloads: **let it finish**. When it is done you will see:

```text
Docling warm-up
✔ docling-mcp-server started (1 s)
⏳ Converting warmup.pdf. The first time it downloads ~510 MB of models and can take several minutes...
✔ PDF converted (74 s)
✔ OCR of the scanned page: "Giralda" found

✅ Setup finished. Restart VS Code (close every window) so it picks up the new PATH,
then run check from its terminal.
```

**Restart VS Code**, closing every window, so that it finds `docling-mcp-server` on its `PATH`. In Codespaces, reload the window instead: open the Command Palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) and run **Developer: Reload Window**.

> [!TIP]
> If Windows PowerShell refuses to run `npx` because *running scripts is disabled on this system*, use `npx.cmd` with the same arguments.

## Enable agent plugins

*[Matt Pocock's workflow](../pocock-workflow/)* installs Matt Pocock's skills as an agent plugin, which needs a setting:

1. Open the settings with <kbd>Ctrl</kbd>+<kbd>,</kbd> (on macOS, <kbd>Cmd</kbd>+<kbd>,</kbd>).
2. Search for `chat.plugins.enabled` and check the box.

## Final check

Open a **new** terminal in VS Code, at the root of your repo, and run:

```shell
npx -y github:emepetres/copilot-devdays-workshop#mod-v1 check
```

**You are ready when every line is green:**

```text
✅ Node 22.20.0
✅ uv 0.9.24
✅ docling-mcp 3.3.0
✅ Docling models
✅ Lesson material

docling-mcp-server: C:\Users\you\.local\bin\docling-mcp-server.exe

All set for the workshop.
```

Each ❌ says what to run to fix it. Keep the `docling-mcp-server` path at hand: if VS Code can't find the server in the Docling lesson, you will use that path. If something goes wrong on the day, `check` is the first thing we will ask you to run.

<details>
<summary>If something fails</summary>

- **`uv` is installed but the terminal can't find it, or the warm-up says `docling-mcp-server is not installed`**: close **every** terminal (also the one in VS Code), open a new one and run `setup` again. It doesn't repeat what is already done.
- **The download stops halfway**: run the warm-up again. The models already downloaded are not downloaded again:

  ```shell
  npx -y github:emepetres/copilot-devdays-workshop#mod-v1 warmup
  ```

- **`WinError 206`, `FileNotFoundError` or very long paths on Windows**: see [Long paths on Windows](#long-paths-on-windows).
- **OCR doesn't find the control word**: copy the error and the log lines the command prints, and open an issue in the [workshop repo][workshop-issues].
- **Mac with an Intel processor**: PyTorch no longer publishes builds for Intel Macs, so Docling may not install. If that happens, tell us at the workshop: you will do the Docling lesson in pairs with someone who has it working.
- **`npx github:` doesn't work at all**: you can still copy the material with `npx -y degit@3.10.1 --force emepetres/copilot-devdays-workshop/mod/lessons/<lesson>#mod-v1 .` for each lesson (`pocock`, `images`, `docling`, `extra`), and install Docling by hand with `uv tool install "docling-mcp[local]==3.3.0"` (on Linux and Codespaces, add `--torch-backend cpu`).

</details>

### Long paths on Windows

Windows limits paths to 260 characters by default, and some Python packages and Docling models have very deep paths. To avoid problems:

- Clone the repo into a short path, such as `C:\dev\tailspin-toys`, not into a deeply nested folder.
- Leave `uv` and Hugging Face in their default folders: don't change `UV_CACHE_DIR`, `HF_HOME` or `HF_HUB_CACHE`.
- If you still see `WinError 206` or `FileNotFoundError` with very long paths, enable long paths. Open PowerShell **as administrator**, run these two commands, restart your computer and run `setup` again:

  ```powershell
  New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
  git config --global core.longpaths true
  ```

## Summary

You are ready for the workshop. You have:

- the tools of your route: VS Code, Node.js, git and `gh`, or your codespace;
- the material of the mod lessons in your repo, uncommitted;
- Docling installed and its models downloaded;
- agent plugins enabled and the *Auto* model in mind;
- `check` all green.

On the day of the workshop you will start with *[Exercise 1 · Custom instructions][ex1]*.

## Resources

- [GitHub Copilot plans][copilot-plans]
- [Node.js download][node-download]
- [Installing `uv`][uv-install]
- [Docling MCP][docling-mcp]

[ex0]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/0-prerequisites/
[ex1]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/1-custom-instructions/
[ex3]: https://github-samples.github.io/copilot-workshops/real-world-development/vscode/3-mcp/
[student-pack]: https://education.github.com/pack
[copilot-plans]: https://github.com/features/copilot/plans
[vscode]: https://code.visualstudio.com/
[git]: https://git-scm.com/downloads
[node-download]: https://nodejs.org/en/download
[gh-cli]: https://cli.github.com/
[uv]: https://docs.astral.sh/uv/
[uv-install]: https://docs.astral.sh/uv/getting-started/installation/
[docling-mcp]: https://github.com/docling-project/docling-mcp
[workshop-issues]: https://github.com/emepetres/copilot-devdays-workshop/issues
