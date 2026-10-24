#!/usr/bin/env node
// CLI of the mod: brings the material of the workshop's own lessons into the
// attendee's Tailspin Toys repo. No dependencies: it must run with `npx github:`.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DOCLING_MCP, DOCLING_VERSION, addUvToPath, doclingInstalled, installDocling, installUv, missingModels, serverPath, uv,
  uvVersion,
} from './docling.mjs';
import { convertWarmupPdf } from './warmup/warmup.mjs';

const LESSONS = ['pocock', 'images', 'docling', 'extra'];
// One folder per lesson, with its files at the paths they take in the attendee's repo.
const LESSONS_DIR = fileURLToPath(new URL('lessons', import.meta.url));
const UV_DOCS = 'https://docs.astral.sh/uv/getting-started/installation/';

const USAGE = `Usage: npx -y github:emepetres/copilot-devdays-workshop#<ref> <command>

Commands:
  setup                                 Copy the material of every lesson, install Docling and warm it up
  lesson <${LESSONS.join('|')}>  Copy that lesson's material into this repo
  warmup                                Run the Docling warm-up conversion again
  check                                 Check that everything is ready for the workshop

Run it from the root of your Tailspin Toys repo.`;

function fail(message, { usage = true } = {}) {
  console.error([message, usage && USAGE].filter(Boolean).join('\n\n'));
  process.exitCode = 1;
}

function isTailspinRoot(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).name === 'tailspin-toys';
  } catch {
    return false;
  }
}

// The attendee's repo, or undefined (after reporting it) if we are not at its root.
function tailspinRoot() {
  const target = process.cwd();
  if (isTailspinRoot(target)) return target;
  fail(`This is not the root of your Tailspin Toys repo: ${target}\n`
    + 'cd into the folder that holds its package.json ("name": "tailspin-toys") and run the command again.',
  { usage: false });
}

function lesson(name) {
  if (!LESSONS.includes(name)) return fail(name ? `Unknown lesson: ${name}` : 'Missing lesson name.');
  const target = tailspinRoot();
  if (target) copyLesson(name, target);
}

// Paths of a lesson's material, relative to the root of the attendee's repo.
function lessonFiles(name) {
  const source = join(LESSONS_DIR, name);
  return existsSync(source) ? listFiles(source) : [];
}

function copyLesson(name, target) {
  const source = join(LESSONS_DIR, name);
  const files = lessonFiles(name);
  if (files.length === 0) return console.log(`Lesson ${name} has no material yet. Nothing to copy.`);

  console.log(`Lesson ${name}: copying its material into ${target}`);
  for (const file of files) {
    const src = join(source, file);
    const dest = join(target, file);
    if (existsSync(dest)) {
      if (readFileSync(dest).equals(readFileSync(src))) console.log(`  up to date ${toPosix(file)}`);
      else console.warn(`  kept       ${toPosix(file)} (already exists, not overwritten)`);
      continue;
    }
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`  copied     ${toPosix(file)}`);
  }
}

async function setup() {
  const target = tailspinRoot();
  if (!target) return;
  for (const name of LESSONS) copyLesson(name, target);

  addUvToPath();
  if (!uvVersion()) {
    console.log('\nInstalling uv with its official installer...');
    if (!installUv()) return fail(`Could not install uv. Install it by hand (${UV_DOCS}) and run setup again.`, { usage: false });
    addUvToPath();
  }
  const version = uvVersion();
  if (!version) return fail('uv is installed but this terminal cannot find it. Open a new terminal and run setup again.', { usage: false });
  // --torch-backend in `uv tool install` needs uv 0.10 (research in issue #31).
  if (process.platform === 'linux' && isOlder(version, [0, 10])) {
    return fail(`uv ${version} is too old. Run \`uv self update\` and run setup again.`, { usage: false });
  }

  console.log(`\nInstalling ${DOCLING_MCP} with uv ${version}. It downloads ~300 MB and can take a few minutes...`);
  if (!installDocling()) return fail(`Could not install ${DOCLING_MCP}. Check the uv output above and run setup again.`, { usage: false });
  // So VS Code, once restarted, finds docling-mcp-server on its PATH.
  uv(['tool', 'update-shell']);
  addUvToPath();

  if (!(await runWarmup())) return;
  console.log('\n✅ Setup finished. Restart VS Code (close every window) so it picks up the new PATH,'
    + '\nthen run check from its terminal.');
}

async function warmup() {
  if (!tailspinRoot()) return;
  addUvToPath();
  if (await runWarmup()) console.log('\n✅ Docling is ready.');
}

// True if the warm-up conversion worked; otherwise reports why.
async function runWarmup() {
  const server = serverPath();
  if (!server) {
    fail('docling-mcp-server is not installed. Run setup first.', { usage: false });
    return false;
  }
  console.log('\nDocling warm-up');
  try {
    await convertWarmupPdf(server);
    return true;
  } catch (err) {
    fail(`❌ ${err.message}`, { usage: false });
    return false;
  }
}

function check() {
  const target = tailspinRoot();
  if (!target) return;
  addUvToPath();
  const uvVersionFound = uvVersion();
  const models = missingModels();
  const material = missingMaterial(target);
  const server = serverPath();
  const checks = [
    [!isOlder(process.versions.node, [22, 13]), `Node ${process.versions.node}`, 'needs 22.13 or later. Install the LTS from https://nodejs.org'],
    [uvVersionFound, `uv ${uvVersionFound ?? ''}`.trim(), 'not found. Run setup'],
    [doclingInstalled(), `docling-mcp ${DOCLING_VERSION}`, 'not installed. Run setup'],
    [models.length === 0, 'Docling models', `missing ${models.join(', ')}. Run warmup`],
    [material.length === 0, 'Lesson material', `${material.length} ${material.length === 1 ? 'file' : 'files'} missing, such as ${toPosix(material[0] ?? '')}. Run setup`],
  ];
  for (const [ok, label, hint] of checks) console.log(ok ? `✅ ${label}` : `❌ ${label}: ${hint}`);
  if (server) console.log(`\ndocling-mcp-server: ${server}`);

  if (checks.every(([ok]) => ok)) console.log('\nAll set for the workshop.');
  else {
    console.log('\nNot ready yet: fix each ❌ and run check again.');
    process.exitCode = 1;
  }
}

// Whether a "major.minor.patch" version is older than [major, minor].
function isOlder(version, [major, minor]) {
  const [vMajor, vMinor] = version.split('.').map(Number);
  return vMajor < major || (vMajor === major && vMinor < minor);
}

// Files of every lesson that are not in the attendee's repo. Edited files count as present.
function missingMaterial(target) {
  return LESSONS.flatMap(lessonFiles).filter((file) => !existsSync(join(target, file)));
}

// Paths relative to `dir`, as they end up in the attendee's repo.
function listFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
    .sort();
}

function toPosix(path) {
  return path.split(sep).join('/');
}

const [command, ...args] = process.argv.slice(2);
if (command === 'lesson') lesson(args[0]);
else if (command === 'setup') await setup();
else if (command === 'warmup') await warmup();
else if (command === 'check') check();
else if (command === '--help' || command === '-h' || command === 'help') console.log(USAGE);
else fail(command ? `Unknown command: ${command}` : undefined);
