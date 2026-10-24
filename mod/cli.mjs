#!/usr/bin/env node
// CLI of the mod: brings the material of the workshop's own lessons into the
// attendee's Tailspin Toys repo. No dependencies: it must run with `npx github:`.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const LESSONS = ['pocock', 'images', 'docling', 'extra'];
// One folder per lesson, with its files at the paths they take in the attendee's repo.
const LESSONS_DIR = fileURLToPath(new URL('lessons', import.meta.url));

const USAGE = `Usage: npx -y github:emepetres/copilot-devdays-workshop#<ref> <command>

Commands:
  lesson <${LESSONS.join('|')}>  Copy that lesson's material into this repo

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

function lesson(name) {
  if (!LESSONS.includes(name)) return fail(name ? `Unknown lesson: ${name}` : 'Missing lesson name.');
  const target = process.cwd();
  if (!isTailspinRoot(target)) {
    return fail(`This is not the root of your Tailspin Toys repo: ${target}\n`
      + 'cd into the folder that holds its package.json ("name": "tailspin-toys") and run the command again.',
    { usage: false });
  }

  const source = join(LESSONS_DIR, name);
  const files = existsSync(source) ? listFiles(source) : [];
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
else if (command === '--help' || command === '-h' || command === 'help') console.log(USAGE);
else fail(command ? `Unknown command: ${command}` : undefined);
