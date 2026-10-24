import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../mod/cli.mjs', import.meta.url));
const LESSONS = fileURLToPath(new URL('../mod/lessons', import.meta.url));
const SKILL = '.github/skills/implement-lite/SKILL.md';

function run(args, cwd = tmpdir()) {
  const { status, stdout, stderr } = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
  return { status, stdout, stderr, output: stdout + stderr };
}

function tailspinRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'tailspin-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'tailspin-toys' }));
  return dir;
}

test('without arguments, prints usage and fails', () => {
  const { status, output } = run([]);
  assert.notEqual(status, 0);
  assert.match(output, /Usage:/);
  assert.match(output, /lesson <pocock\|images\|docling\|extra>/);
});

test('--help prints usage and succeeds', () => {
  const { status, stdout } = run(['--help']);
  assert.equal(status, 0);
  assert.match(stdout, /Usage:/);
});

test('an unknown lesson name is reported with usage and fails', () => {
  const { status, output } = run(['lesson', 'nope'], tailspinRepo());
  assert.notEqual(status, 0);
  assert.match(output, /Unknown lesson: nope/);
  assert.match(output, /Usage:/);
});

test('outside the root of Tailspin Toys, refuses to copy and says why', () => {
  const dir = mkdtempSync(join(tmpdir(), 'other-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'something-else' }));
  const { status, stderr } = run(['lesson', 'pocock'], dir);
  assert.notEqual(status, 0);
  assert.match(stderr, /root of your Tailspin Toys repo/);
  assert.deepEqual(readdirSync(dir), ['package.json']);
});

test("copies the lesson's material to its place in the repo and lists it", () => {
  const dir = tailspinRepo();
  const { status, stdout } = run(['lesson', 'pocock'], dir);
  assert.equal(status, 0);
  assert.equal(readFileSync(join(dir, SKILL), 'utf8'), readFileSync(join(LESSONS, 'pocock', SKILL), 'utf8'));
  assert.match(stdout, /copied\s+\.github\/skills\/implement-lite\/SKILL\.md/);
});

test('never overwrites a file the attendee already has, and warns about it', () => {
  const dir = tailspinRepo();
  mkdirSync(join(dir, '.github/skills/implement-lite'), { recursive: true });
  writeFileSync(join(dir, SKILL), 'my own edits');
  const { status, output } = run(['lesson', 'pocock'], dir);
  assert.equal(status, 0);
  assert.equal(readFileSync(join(dir, SKILL), 'utf8'), 'my own edits');
  assert.match(output, /\.github\/skills\/implement-lite\/SKILL\.md.*already exists/);
});

test('running it again changes nothing and reports the material as up to date', () => {
  const dir = tailspinRepo();
  run(['lesson', 'pocock'], dir);
  const { status, output } = run(['lesson', 'pocock'], dir);
  assert.equal(status, 0);
  assert.match(output, /up to date\s+\.github\/skills\/implement-lite\/SKILL\.md/);
  assert.doesNotMatch(output, /not overwritten/);
});
