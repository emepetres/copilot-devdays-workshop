// Docling warm-up conversion of the mod (`setup` and `warmup`).
//
// Starts docling-mcp-server over stdio with the same configuration Copilot will use
// in the Engineering Reviewer lesson, converts warmup.pdf (downloading the layout and
// table models on the first run) and checks that OCR reads the control word on the
// scanned page.
//
// It speaks MCP (newline-delimited JSON-RPC) directly, so it needs no dependencies.

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const SERVER_ARGS = ['--transport', 'stdio', 'conversion', 'manipulation'];
const PDF = fileURLToPath(new URL('warmup.pdf', import.meta.url));
// Must match SCAN_LINES in docs/assets/generate-warmup-pdf.py.
const CONTROL_WORD = 'Giralda';
const LOG_LINES = 30;

// Rejects with an error that carries the server's last log lines if anything fails.
export async function convertWarmupPdf(server) {
  const log = [];
  const pending = new Map();
  let nextId = 1;
  let started = Date.now();
  const seconds = () => `${Math.round((Date.now() - started) / 1000)} s`;

  const child = spawn(server, SERVER_ARGS, {
    // COLUMNS widens the server's log, which otherwise wraps at 80 characters.
    env: { ...process.env, DOCLING_MCP_CONVERSION_MODE: 'local', COLUMNS: '160' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const exited = new Promise((_, reject) => {
    child.on('error', (err) => reject(new Error(`Could not start ${server}: ${err.message}`)));
    child.on('exit', (code) => reject(new Error(`docling-mcp-server stopped unexpectedly (exit code ${code}).`)));
  });
  exited.catch(() => {});
  // Writing to a server that already died fails with EPIPE; `exited` reports it instead.
  child.stdin.on('error', () => {});

  createInterface({ input: child.stderr }).on('line', (line) => {
    log.push(line);
    if (log.length > LOG_LINES) log.shift();
  });

  createInterface({ input: child.stdout }).on('line', (line) => {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return; // Not JSON-RPC: ignore stray output.
    }
    const call = pending.get(msg.id);
    if (!call) return;
    pending.delete(msg.id);
    if (msg.error) call.reject(new Error(msg.error.message));
    else call.resolve(msg.result);
  });

  const send = (message) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...message }) + '\n');

  function request(method, params) {
    const id = nextId++;
    const response = new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      send({ id, method, params });
    });
    return Promise.race([response, exited]);
  }

  async function callTool(name, args) {
    const result = await request('tools/call', { name, arguments: args });
    const text = (result.content ?? []).map((c) => c.text ?? '').join('\n');
    if (result.isError) throw new Error(text || `The ${name} tool failed.`);
    return { structured: result.structuredContent, text };
  }

  try {
    await request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'docling-warmup', version: '1.0.0' },
    });
    send({ method: 'notifications/initialized' });
    console.log(`✔ docling-mcp-server started (${seconds()})`);

    console.log('⏳ Converting warmup.pdf. The first time it downloads ~510 MB of models and can take several minutes...');
    started = Date.now();
    const conversion = await callTool('convert_document_into_docling_document', { source: PDF });
    const documentKey = conversion.structured?.document_key ?? JSON.parse(conversion.text).document_key;
    console.log(`✔ PDF converted (${seconds()})`);

    const search = await callTool('search_for_text_in_document_anchors', {
      document_key: documentKey,
      text: CONTROL_WORD,
    });
    // The "not found" message also echoes the search text, so look for exact matches instead.
    const result = search.structured?.result ?? search.text;
    if (!result.includes('Found exact text matches')) {
      throw new Error(`OCR did not find the control word "${CONTROL_WORD}" on the scanned page.`);
    }
    console.log(`✔ OCR of the scanned page: "${CONTROL_WORD}" found`);
  } catch (err) {
    if (log.length > 0) err.message += `\n\nLast lines of the docling-mcp-server log:\n\n${log.join('\n')}`;
    throw err;
  } finally {
    child.kill();
  }
}
