import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { installArgs, missingModels } from '../mod/docling.mjs';

const LAYOUT = 'docling-project/docling-layout-heron';
const TABLES = 'docling-project/docling-models';

// The weights file of each model, as huggingface_hub leaves it in a snapshot.
const WEIGHTS = {
  [LAYOUT]: 'model.safetensors',
  [TABLES]: 'model_artifacts/tableformer/accurate/tableformer_accurate.safetensors',
};

// A Hugging Face hub cache holding a snapshot of each of `models`, with its weights unless `weights` is false.
function hubCache(dir, models, { weights = true } = {}) {
  for (const model of models) {
    const snapshot = join(dir, `models--${model.replace('/', '--')}`, 'snapshots', 'abc123');
    mkdirSync(snapshot, { recursive: true });
    writeFileSync(join(snapshot, 'config.json'), '{}');
    if (weights) {
      mkdirSync(dirname(join(snapshot, WEIGHTS[model])), { recursive: true });
      writeFileSync(join(snapshot, WEIGHTS[model]), 'weights');
    }
  }
  return dir;
}

test('installs the exact docling-mcp version with the local extra', () => {
  assert.deepEqual(installArgs('win32'), ['tool', 'install', 'docling-mcp[local]==3.3.0']);
  assert.deepEqual(installArgs('darwin'), ['tool', 'install', 'docling-mcp[local]==3.3.0']);
});

test('on Linux (and Codespaces) asks for the CPU build of PyTorch, to skip ~2.8 GiB of CUDA', () => {
  assert.deepEqual(installArgs('linux'), ['tool', 'install', 'docling-mcp[local]==3.3.0', '--torch-backend', 'cpu']);
});

test('finds the layout and table models in the default Hugging Face cache', () => {
  const home = mkdtempSync(join(tmpdir(), 'home-'));
  assert.deepEqual(missingModels({}, home), [LAYOUT, TABLES]);
  hubCache(join(home, '.cache', 'huggingface', 'hub'), [LAYOUT]);
  assert.deepEqual(missingModels({}, home), [TABLES]);
  hubCache(join(home, '.cache', 'huggingface', 'hub'), [TABLES]);
  assert.deepEqual(missingModels({}, home), []);
});

test('a model whose download never finished is still missing', () => {
  const home = mkdtempSync(join(tmpdir(), 'home-'));
  mkdirSync(join(home, '.cache', 'huggingface', 'hub', 'models--docling-project--docling-models', 'blobs'), { recursive: true });
  assert.deepEqual(missingModels({}, home), [LAYOUT, TABLES]);
});

test('honours HF_HOME and, above it, HF_HUB_CACHE', () => {
  const home = mkdtempSync(join(tmpdir(), 'home-'));
  const hfHome = mkdtempSync(join(tmpdir(), 'hf-home-'));
  hubCache(join(hfHome, 'hub'), [LAYOUT, TABLES]);
  assert.deepEqual(missingModels({ HF_HOME: hfHome }, home), []);

  const hubCacheDir = hubCache(mkdtempSync(join(tmpdir(), 'hf-hub-')), [LAYOUT]);
  assert.deepEqual(missingModels({ HF_HOME: hfHome, HF_HUB_CACHE: hubCacheDir }, home), [TABLES]);
});

test('a snapshot whose weights never downloaded is still missing', () => {
  const home = mkdtempSync(join(tmpdir(), 'home-'));
  hubCache(join(home, '.cache', 'huggingface', 'hub'), [LAYOUT]);
  hubCache(join(home, '.cache', 'huggingface', 'hub'), [TABLES], { weights: false });
  assert.deepEqual(missingModels({}, home), [TABLES]);
});
