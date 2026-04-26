#!/usr/bin/env node
/**
 * generate-vo.mjs — ElevenLabs TTS with the DB default voice.
 *
 * Usage:
 *   node scripts/generate-vo.mjs "Script text here" [output.mp3]
 *
 * Reads ELEVENLABS_API_KEY from:
 *   ~/Projects/utilities/claude-secrets/.env.openclaw-secrets
 *
 * DB default voice: qVpGLzi5EhjW3WGVhOa9
 * Tone: confident, direct, coach-in-your-ear.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const SECRETS_FILE = path.join(
  os.homedir(),
  'Projects/utilities/claude-secrets/.env.openclaw-secrets'
);
const DB_VOICE_ID = 'qVpGLzi5EhjW3WGVhOa9';

function loadSecretsEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const idx = s.indexOf('=');
    const k = s.slice(0, idx).trim();
    const v = s.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1');
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadSecretsEnv(SECRETS_FILE);

const script = process.argv[2];
const outFile = process.argv[3] || path.join('voiceover', `vo-${Date.now()}.mp3`);

if (!script) {
  console.error('Usage: generate-vo.mjs "Script text" [outfile.mp3]');
  process.exit(1);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error('Missing ELEVENLABS_API_KEY in secrets file.');
  process.exit(1);
}

(async () => {
  console.log(`[vo] voice=${DB_VOICE_ID} len=${script.length} → ${outFile}`);

  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${DB_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.55,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`[vo] ElevenLabs error ${resp.status}:`, err);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(outFile, buf);
  console.log(`[vo] ✅ Saved ${outFile} (${(buf.length / 1024).toFixed(1)} KB)`);
})();
