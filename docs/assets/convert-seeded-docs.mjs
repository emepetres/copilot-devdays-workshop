// Converts the documents with the seeded inconsistencies 4–6 with Docling (the Markdown the
// Engineering Reviewer can fall back on) and checks that the seeded text survives the
// conversion, including the OCR of the scan.
//
//     node docs/assets/convert-seeded-docs.mjs mod/lessons/docling
//
// Reads `docs/requirements.pdf` and `docs/meeting-minutes.pdf` of that folder and writes the
// Markdown to its `docs/reviews/_docling/`. Starts docling-mcp-server over stdio in local mode,
// like `mod/warmup/warmup.mjs`, but with the `generation` group, which owns the Markdown export.
// Speaks MCP directly, so it needs no dependencies.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, resolve } from "node:path";

const SERVER = "docling-mcp-server";
const SERVER_ARGS = ["--transport", "stdio", "conversion", "generation"];

// Must match the seeded text in generate-requisitos-pdf.py and generate-acta-scan.py,
// and the answer key in docs/inconsistencias-sembradas.md.
const DOCUMENTS = [
  {
    pdf: "requirements.pdf",
    markdown: "requirements.md",
    expected: [
      "A game can belong to several categories", // 4
      "The catalog updates in real time", // 5
    ],
  },
  {
    pdf: "meeting-minutes.pdf",
    markdown: "meeting-minutes.md",
    expected: [
      "scale of 1 to 10", // 6
      "Implemented in sprint 14", // 6
    ],
  },
];

const root = process.argv[2];
if (!root) {
  console.error("Uso: node docs/assets/convert-seeded-docs.mjs <carpeta con docs/, como mod/lessons/docling>");
  process.exit(2);
}
const docsDir = join(resolve(root), "docs");
const outDir = join(docsDir, "reviews", "_docling");
for (const { pdf } of DOCUMENTS) {
  if (!existsSync(join(docsDir, pdf))) {
    console.error(`❌ No existe ${join(docsDir, pdf)}. Genéralo antes con docs/assets/generate-*.py.`);
    process.exit(1);
  }
}

const pending = new Map();
let nextId = 1;

const server = spawn(SERVER, SERVER_ARGS, {
  env: { ...process.env, DOCLING_MCP_CONVERSION_MODE: "local" },
  stdio: ["pipe", "pipe", "ignore"],
});

server.on("error", (err) => {
  const hint = err.code === "ENOENT" ? ` Instálalo como en los Extra prerequisites: uv tool install "docling-mcp[local]==3.3.0".` : "";
  console.error(`❌ No se pudo arrancar ${SERVER}: ${err.message}.${hint}`);
  process.exit(1);
});

server.on("exit", (code) => {
  for (const { reject } of pending.values()) {
    reject(new Error(`${SERVER} se ha cerrado inesperadamente (código ${code}).`));
  }
});

createInterface({ input: server.stdout }).on("line", (line) => {
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

function send(message) {
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
}

function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ id, method, params });
  });
}

async function callTool(name, args) {
  const result = await request("tools/call", { name, arguments: args });
  const text = (result.content ?? []).map((c) => c.text ?? "").join("\n");
  if (result.isError) throw new Error(text || `La herramienta ${name} ha fallado.`);
  return { structured: result.structuredContent, text };
}

// Docling may break a sentence across lines or table cells.
const normalize = (text) => text.replace(/\s+/g, " ");

let failed = false;
try {
  await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "convert-seeded-docs", version: "1.0.0" },
  });
  send({ method: "notifications/initialized" });
  mkdirSync(outDir, { recursive: true });

  for (const doc of DOCUMENTS) {
    const conversion = await callTool("convert_document_into_docling_document", {
      source: join(docsDir, doc.pdf),
    });
    const documentKey = conversion.structured?.document_key ?? JSON.parse(conversion.text).document_key;
    const exported = await callTool("export_docling_document_to_markdown", { document_key: documentKey });
    const markdown = exported.structured?.markdown ?? JSON.parse(exported.text).markdown;
    writeFileSync(join(outDir, doc.markdown), markdown.trimEnd() + "\n", "utf-8");
    console.log(`✔ ${doc.pdf} → docs/reviews/_docling/${doc.markdown}`);

    for (const phrase of doc.expected) {
      if (normalize(markdown).includes(phrase)) {
        console.log(`  ✔ «${phrase}»`);
      } else {
        console.error(`  ❌ No aparece «${phrase}»`);
        failed = true;
      }
    }
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  failed = true;
} finally {
  server.kill();
}
process.exit(failed ? 1 : 0);
