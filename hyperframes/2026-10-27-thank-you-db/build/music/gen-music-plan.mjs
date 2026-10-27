#!/usr/bin/env node
/**
 * gen-music-plan.mjs — ElevenLabs Music: prompt mode OR composition-plan mode.
 *
 * Usage:
 *   node gen-music-plan.mjs <request.json> <out.mp3>
 *
 * request.json holds ONE of:
 *   { "prompt": "...", "music_length_ms": 32000, "force_instrumental": true }
 *   { "composition_plan": { "chunks": [ ... ] } }              // music_v2 shape
 *   { "composition_plan": { "positive_global_styles": [...], "sections": [...] } }  // music_v1 shape
 * Optional keys: "model_id" (default music_v2), "output_format" (default mp3_44100_192),
 *   "respect_sections_durations" (v1 plans only), "seed".
 *
 * Behaviour:
 *  - Loads ELEVENLABS_API_KEY from ~/Projects/utilities/claude-secrets/.env.openclaw-secrets
 *    (same as scripts/generate-music.mjs). The key is never printed.
 *  - On 400 bad_prompt / bad_composition_plan it saves the error body to <out>.error.json and,
 *    if the body carries detail.data.prompt_suggestion / composition_plan_suggestion, resubmits that
 *    suggestion VERBATIM once. The request actually used is written to <out>.request-used.json.
 *  - On 429 (concurrent_limit_exceeded / rate) it backs off and retries (max 6 tries).
 *  - Keep at most 2 of these running at once (account concurrency cap).
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const SECRETS_FILE = path.join(os.homedir(), 'Projects/utilities/claude-secrets/.env.openclaw-secrets');
function loadSecretsEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const i = s.indexOf('=');
    const k = s.slice(0, i).trim();
    const v = s.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadSecretsEnv(SECRETS_FILE);

const [reqFile, outFile] = process.argv.slice(2);
if (!reqFile || !outFile) {
  console.error('Usage: gen-music-plan.mjs <request.json> <out.mp3>');
  process.exit(1);
}
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY in secrets file.');
  process.exit(1);
}

const req = JSON.parse(fs.readFileSync(reqFile, 'utf8'));
const tag = path.basename(outFile);
const outputFormat = req.output_format || 'mp3_44100_192';

function buildBody(r) {
  const body = { model_id: r.model_id || 'music_v2' };
  if (r.composition_plan) {
    body.composition_plan = r.composition_plan;
    if (r.respect_sections_durations !== undefined) body.respect_sections_durations = r.respect_sections_durations;
  } else if (r.prompt) {
    body.prompt = r.prompt;
    if (r.music_length_ms) body.music_length_ms = r.music_length_ms;
    if (r.force_instrumental !== undefined) body.force_instrumental = r.force_instrumental;
  } else {
    throw new Error('request JSON needs "prompt" or "composition_plan"');
  }
  if (r.seed !== undefined) body.seed = r.seed;
  return body;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(body) {
  let wait = 8000;
  for (let i = 0; i < 6; i++) {
    const t0 = Date.now();
    const resp = await fetch(`https://api.elevenlabs.io/v1/music?output_format=${outputFormat}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) {
      const txt = await resp.text();
      console.error(`[music ${tag}] 429, retry in ${wait / 1000}s: ${txt.slice(0, 200)}`);
      await sleep(wait);
      wait = Math.min(wait * 1.7, 60000);
      continue;
    }
    if (!resp.ok) return { ok: false, status: resp.status, text: await resp.text() };
    const buf = Buffer.from(await resp.arrayBuffer());
    return { ok: true, buf, secs: (Date.now() - t0) / 1000 };
  }
  return { ok: false, status: 429, text: 'gave up after repeated 429s' };
}

(async () => {
  let body = buildBody(req);
  const mode = body.composition_plan ? 'composition_plan' : 'prompt';
  console.error(`[music ${tag}] mode=${mode} model=${body.model_id} → ${outFile}`);
  let res = await call(body);

  if (!res.ok && res.status === 400) {
    fs.writeFileSync(outFile + '.error.json', res.text);
    let err = null;
    try { err = JSON.parse(res.text); } catch {}
    const data = err?.detail?.data || {};
    if (mode === 'prompt' && data.prompt_suggestion) {
      console.error(`[music ${tag}] bad_prompt → resubmitting prompt_suggestion verbatim`);
      body = { ...body, prompt: data.prompt_suggestion };
      res = await call(body);
    } else if (mode === 'composition_plan' && data.composition_plan_suggestion) {
      console.error(`[music ${tag}] bad_composition_plan → resubmitting composition_plan_suggestion verbatim`);
      body = { ...body, composition_plan: data.composition_plan_suggestion };
      res = await call(body);
    }
  }

  if (!res.ok) {
    console.error(`[music ${tag}] ElevenLabs error ${res.status}: ${String(res.text).slice(0, 1500)}`);
    fs.writeFileSync(outFile + '.error.json', String(res.text));
    process.exit(2);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, res.buf);
  fs.writeFileSync(outFile.replace(/\.mp3$/, '') + '.request-used.json', JSON.stringify(body, null, 2));
  console.error(`[music ${tag}] saved ${(res.buf.length / 1024).toFixed(1)} KB in ${res.secs.toFixed(1)}s`);
})().catch((e) => { console.error(`[music ${tag}] ${e.message || e}`); process.exit(1); });
