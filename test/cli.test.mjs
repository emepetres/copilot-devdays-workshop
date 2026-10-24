import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../mod/cli.mjs', import.meta.url));
const LESSONS = fileURLToPath(new URL('../mod/lessons', import.meta.url));
const SKILL = '.github/skills/implement-lite/SKILL.md';
const DIAGRAM = 'docs/architecture.png';
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// Issue #40: the diagram must stay under 2 MB, so the chat can read it.
const MAX_DIAGRAM_BYTES = 2 * 1024 * 1024;

function run(args, cwd = tmpdir(), env = process.env) {
  const { status, stdout, stderr } = spawnSync(process.execPath, [CLI, ...args], { cwd, env, encoding: 'utf8' });
  return { status, stdout, stderr, output: stdout + stderr };
}

// A machine with Node and nothing else: no uv, no Docling, no Hugging Face cache.
function bareMachine() {
  const home = mkdtempSync(join(tmpdir(), 'home-'));
  const env = Object.fromEntries(Object.entries(process.env)
    .filter(([key]) => !/^(path|hf_home|hf_hub_cache|xdg_cache_home|uv_install_dir|xdg_bin_home|uv_tool_bin_dir)$/i.test(key)));
  return { ...env, PATH: dirname(process.execPath), HOME: home, USERPROFILE: home };
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

test('the images lesson brings the architecture diagram, a PNG under 2 MB', () => {
  const dir = tailspinRepo();
  const { status, stdout } = run(['lesson', 'images'], dir);
  assert.equal(status, 0);
  assert.match(stdout, /copied\s+docs\/architecture\.png/);
  const png = readFileSync(join(dir, DIAGRAM));
  assert.ok(png.equals(readFileSync(join(LESSONS, 'images', DIAGRAM))));
  assert.ok(png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE), 'PNG signature');
  assert.ok(png.length < MAX_DIAGRAM_BYTES, `${png.length} bytes`);
});

test('usage lists setup, warmup and check', () => {
  const { stdout } = run(['--help']);
  assert.match(stdout, /^\s+setup\s/m);
  assert.match(stdout, /^\s+warmup\s/m);
  assert.match(stdout, /^\s+check\s/m);
});

for (const command of ['setup', 'warmup', 'check']) {
  test(`${command} outside the root of Tailspin Toys refuses to run and says why`, () => {
    const dir = mkdtempSync(join(tmpdir(), 'other-'));
    const { status, stderr } = run([command], dir);
    assert.notEqual(status, 0);
    assert.match(stderr, /This is not the root of your Tailspin Toys repo/);
    assert.deepEqual(readdirSync(dir), []);
  });
}

// VS Code only loads a skill whose `name` matches its folder.
test('every skill in the lesson material is named after its folder and has a description', () => {
  const skills = readdirSync(LESSONS, { recursive: true })
    .filter((path) => basename(path) === 'SKILL.md');
  assert.ok(skills.length > 0);
  for (const path of skills) {
    const frontmatter = readFileSync(join(LESSONS, path), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const folder = basename(dirname(path));
    assert.match(frontmatter, new RegExp(`^name: ${folder}$`, 'm'), path);
    assert.match(frontmatter, /^description: \S/m, path);
  }
});

test('check on a machine without Docling reports what is missing and fails', () => {
  const { status, stdout } = run(['check'], tailspinRepo(), bareMachine());
  assert.notEqual(status, 0);
  assert.match(stdout, /✅ Node/);
  assert.match(stdout, /❌ uv/);
  assert.match(stdout, /❌ docling-mcp/);
  assert.match(stdout, /❌ Docling models/);
  assert.match(stdout, /❌ Lesson material/);
});
