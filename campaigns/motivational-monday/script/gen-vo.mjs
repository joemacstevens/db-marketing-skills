#!/usr/bin/env node
/**
 * gen-vo.mjs — Motivational Monday VO renderer (ElevenLabs TTS, any voice + settings).
 *
 * Usage:
 *   node gen-vo.mjs --voice <voice_id> --text-file <script.txt> --out <out.mp3> \
 *     [--model eleven_multilingual_v2] [--stability 0.3] [--similarity 0.8] \
 *     [--style 0.65] [--speed 0.92] [--no-boost]
 *
 * Text file may contain SSML <break time="0.8s"/> tags (honored by eleven_multilingual_v2).
 * Key: ELEVENLABS_API_KEY from ~/Projects/utilities/claude-secrets/.env.openclaw-secrets
 * (scoped key: /v1/user + /v1/models 401, TTS + /v1/voices + /v1/shared-voices work).
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const SECRETS = path.join(os.homedir(), 'Projects/utilities/claude-secrets/.env.openclaw-secrets');
if (fs.existsSync(SECRETS)) {
  for (const line of fs.readFileSync(SECRETS, 'utf8').split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const i = s.indexOf('=');
    const k = s.slice(0, i).trim();
    if (!(k in process.env)) process.env[k] = s.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
}

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const voice = opt('voice');
const textFile = opt('text-file');
const out = opt('out');
if (!voice || !textFile || !out) {
  console.error('Usage: gen-vo.mjs --voice <id> --text-file <file> --out <out.mp3> [options]');
  process.exit(1);
}
const text = fs.readFileSync(textFile, 'utf8').trim();
const model = opt('model', 'eleven_multilingual_v2');
const voice_settings = {
  stability: Number(opt('stability', '0.3')),
  similarity_boost: Number(opt('similarity', '0.8')),
  style: Number(opt('style', '0.65')),
  use_speaker_boost: !args.includes('--no-boost'),
};
const speed = opt('speed');
if (speed) voice_settings.speed = Number(speed);

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('Missing ELEVENLABS_API_KEY');
  process.exit(1);
}

console.log(`[vo] voice=${voice} model=${model} settings=${JSON.stringify(voice_settings)} -> ${out}`);
const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
  body: JSON.stringify({ text, model_id: model, voice_settings }),
});
if (!resp.ok) {
  console.error(`[vo] ElevenLabs error ${resp.status}: ${await resp.text()}`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const buf = Buffer.from(await resp.arrayBuffer());
fs.writeFileSync(out, buf);
console.log(`[vo] saved ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
