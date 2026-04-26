#!/usr/bin/env node
/**
 * Veo video generator — direct Google Gemini API.
 *
 * Reads a batch of prompts from a JSON file, kicks off generation for each,
 * polls the long-running operations, downloads the results.
 *
 * Usage:
 *   node scripts/generate-veo.mjs <prompts.json>
 *
 * Input JSON shape:
 *   {
 *     "model": "veo-3.0-fast-generate-001",          // optional, default shown
 *     "output_dir": "campaigns/the-coliseum/raw",    // required
 *     "default_params": {                            // optional — merged into each clip
 *       "durationSeconds": 8,
 *       "aspectRatio": "9:16",
 *       "sampleCount": 1
 *     },
 *     "clips": [
 *       { "id": "phase-01-A-arena", "prompt": "..." },
 *       { "id": "phase-01-B-iron", "prompt": "...", "params": { "durationSeconds": 4 } },
 *       ...
 *     ]
 *   }
 *
 * Outputs:
 *   <output_dir>/<id>.mp4   for each clip
 *   <output_dir>/_manifest.json   record of what was generated, when, which op
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const SECRETS = "/Users/joestevens/.claude/secrets/.env.openclaw-secrets";

function loadKey() {
  const txt = readFileSync(SECRETS, "utf8");
  const m = txt.match(/^GEMINI_API_KEY=(.*)$/m);
  if (!m) throw new Error("GEMINI_API_KEY not found in secrets");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

async function startGen(key, model, prompt, params) {
  const url = `${API_BASE}/models/${model}:predictLongRunning?key=${key}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      durationSeconds: 8,
      aspectRatio: "9:16",
      sampleCount: 1,
      ...params,
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`startGen failed: ${JSON.stringify(json)}`);
  return json.name; // operation name
}

async function pollOp(key, opName, maxAttempts = 60, sleepMs = 10000) {
  for (let i = 1; i <= maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, sleepMs));
    const res = await fetch(`${API_BASE}/${opName}?key=${key}`);
    const json = await res.json();
    if (json.error) throw new Error(`poll error: ${JSON.stringify(json.error)}`);
    if (json.done) return json;
    process.stdout.write(`    poll ${i}: still working...\r`);
  }
  throw new Error(`polling timed out after ${maxAttempts} attempts`);
}

async function downloadVideo(key, uri, outPath) {
  const res = await fetch(uri, { headers: { "x-goog-api-key": key } });
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  return buf.length;
}

async function generateClip(key, model, clip, defaults, outDir) {
  const id = clip.id;
  const prompt = clip.prompt;
  const params = { ...defaults, ...(clip.params || {}) };
  const outPath = resolve(outDir, `${id}.mp4`);

  if (existsSync(outPath) && !process.env.FORCE) {
    console.log(`  [${id}] already exists — skipping (set FORCE=1 to regenerate)`);
    return { id, status: "skipped", path: outPath };
  }

  console.log(`  [${id}] starting → ${model}`);
  const opName = await startGen(key, model, prompt, params);
  console.log(`    op=${opName}`);

  const op = await pollOp(key, opName);
  const samples = op.response?.generateVideoResponse?.generatedSamples || [];
  if (!samples.length) throw new Error(`no samples returned for ${id}: ${JSON.stringify(op)}`);
  const uri = samples[0].video?.uri;
  if (!uri) throw new Error(`no video uri for ${id}`);

  const bytes = await downloadVideo(key, uri, outPath);
  console.log(`  [${id}] ✓ ${(bytes / 1024).toFixed(0)} KB → ${outPath}`);

  return { id, status: "ok", path: outPath, bytes, prompt, params, op: opName };
}

async function main() {
  const promptsPath = process.argv[2];
  if (!promptsPath) {
    console.error("usage: node generate-veo.mjs <prompts.json>");
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(promptsPath, "utf8"));
  const model = config.model || "veo-3.0-fast-generate-001";
  const outDir = resolve(config.output_dir);
  const defaults = config.default_params || {};

  console.log(`\n─── Veo Generation ────────────────────────────`);
  console.log(`  model:     ${model}`);
  console.log(`  output:    ${outDir}`);
  console.log(`  defaults:  ${JSON.stringify(defaults)}`);
  console.log(`  clips:     ${config.clips.length}`);
  console.log(``);

  const key = loadKey();
  const manifest = {
    run_started: new Date().toISOString(),
    model,
    output_dir: outDir,
    results: [],
  };

  for (const clip of config.clips) {
    try {
      const result = await generateClip(key, model, clip, defaults, outDir);
      manifest.results.push(result);
    } catch (err) {
      console.error(`  [${clip.id}] ✗ ${err.message}`);
      manifest.results.push({ id: clip.id, status: "error", error: err.message });
    }
  }

  manifest.run_completed = new Date().toISOString();
  const manifestPath = resolve(outDir, "_manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const ok = manifest.results.filter((r) => r.status === "ok").length;
  const skip = manifest.results.filter((r) => r.status === "skipped").length;
  const err = manifest.results.filter((r) => r.status === "error").length;
  console.log(`\n─── Done: ${ok} generated, ${skip} skipped, ${err} errors ─────────`);
  console.log(`   manifest: ${manifestPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
