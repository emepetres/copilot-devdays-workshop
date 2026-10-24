// Docling for the mod: install it with uv, find its server and check its models.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';

export const DOCLING_VERSION = '3.3.0';
export const DOCLING_MCP = `docling-mcp[local]==${DOCLING_VERSION}`;
// Downloaded from Hugging Face on the first conversion, with the weights file that proves
// the download finished. The OCR models ship with the package.
const MODELS = {
  'docling-project/docling-layout-heron': 'model.safetensors',
  'docling-project/docling-models': 'model_artifacts/tableformer/accurate/tableformer_accurate.safetensors',
};

// On Linux, uv resolves PyTorch with CUDA (~2.8 GiB) unless told otherwise.
export function installArgs(platform = process.platform) {
  return ['tool', 'install', DOCLING_MCP, ...(platform === 'linux' ? ['--torch-backend', 'cpu'] : [])];
}

export function missingModels(env = process.env, home = homedir()) {
  // Same lookup as huggingface_hub.
  const hfHome = env.HF_HOME || join(env.XDG_CACHE_HOME || join(home, '.cache'), 'huggingface');
  const hub = env.HF_HUB_CACHE || join(hfHome, 'hub');
  return Object.entries(MODELS)
    .filter(([model, weights]) => !hasWeights(join(hub, `models--${model.replace('/', '--')}`, 'snapshots'), weights))
    .map(([model]) => model);
}

function hasWeights(snapshots, weights) {
  return existsSync(snapshots) && readdirSync(snapshots).some((snapshot) => existsSync(join(snapshots, snapshot, weights)));
}

// Where the official installer puts uv, which may not be on PATH yet in this shell.
function uvInstallDir(env = process.env, home = homedir()) {
  return env.UV_INSTALL_DIR || env.XDG_BIN_HOME || join(home, '.local', 'bin');
}

// Adds uv and the tools it installs to the PATH of this process (and of what it spawns).
export function addUvToPath() {
  prependToPath(uvInstallDir());
  const bin = uv(['tool', 'dir', '--bin']);
  if (bin) prependToPath(bin);
}

function prependToPath(dir) {
  // On Windows the variable is usually spelled Path.
  const key = Object.keys(process.env).find((k) => k.toUpperCase() === 'PATH') ?? 'PATH';
  process.env[key] = [dir, process.env[key]].filter(Boolean).join(delimiter);
}

// Runs uv's official installer, showing its output. True if it succeeded.
export function installUv() {
  const [command, args] = process.platform === 'win32'
    ? ['powershell', ['-NoProfile', '-ExecutionPolicy', 'ByPass', '-Command', 'irm https://astral.sh/uv/install.ps1 | iex']]
    : ['sh', ['-c', 'if command -v curl >/dev/null 2>&1; then curl -LsSf https://astral.sh/uv/install.sh | sh; '
      + 'else wget -qO- https://astral.sh/uv/install.sh | sh; fi']];
  return spawnSync(command, args, { stdio: 'inherit' }).status === 0;
}

// Installs docling-mcp, showing uv's output. True if it succeeded.
export function installDocling() {
  return spawnSync('uv', installArgs(), { stdio: 'inherit' }).status === 0;
}

// stdout of uv, or undefined if uv is missing or fails.
export function uv(args) {
  const { status, stdout } = spawnSync('uv', args, { encoding: 'utf8' });
  return status === 0 ? stdout.trim() : undefined;
}

export function uvVersion() {
  return uv(['--version'])?.match(/^uv (\S+)/)?.[1];
}

export function doclingInstalled() {
  return (uv(['tool', 'list']) ?? '').split(/\r?\n/).includes(`docling-mcp v${DOCLING_VERSION}`);
}

// Absolute path of docling-mcp-server, or undefined if it is not installed.
export function serverPath() {
  const bin = uv(['tool', 'dir', '--bin']);
  if (!bin) return;
  const server = join(bin, process.platform === 'win32' ? 'docling-mcp-server.exe' : 'docling-mcp-server');
  return existsSync(server) ? server : undefined;
}
