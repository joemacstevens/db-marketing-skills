#!/usr/bin/env node
/**
 * ig-audio-search.mjs — Search the Instagram audio Meta exposes to third-party
 * publishers (via bundle.social), so we know BEFORE cutting a reel whether a
 * track can be attached natively by API or needs the manual in-app handoff.
 *
 * Usage:
 *   node scripts/ig-audio-search.mjs                       # trending music
 *   node scripts/ig-audio-search.mjs "Drake" "Can't Hold Us"
 *   node scripts/ig-audio-search.mjs --type original "boxing"
 *   node scripts/ig-audio-search.mjs --labels "Travis Scott"   # label tracks only
 *   node scripts/ig-audio-search.mjs --json "Drake"            # raw results
 *   node scripts/ig-audio-search.mjs --preview <audio_id> "Champions"
 *                                  # saves the preview audio to music/ig-previews/
 *
 * Environment:
 *   Reads ~/Projects/utilities/claude-secrets/.env.openclaw-secrets for
 *   BUNDLE_SOCIAL_API_KEY and (optional) BUNDLE_SOCIAL_TEAM_ID. Without a team
 *   ID it uses the "Different Breed" team on the key's org.
 *
 * Reading the output:
 *   [LABEL]   real licensed release (Drake, Macklemore...). No preview URL, so
 *             it can't be auditioned or beat-matched here. Attach by audio_id.
 *   [LIBRARY] Meta Sound Collection production music. Has a preview URL, so
 *             --preview works and cuts can be timed to it.
 *   The catalog is NOT the full in-app creator library. Classics (Eminem,
 *   Kendrick, Eye of the Tiger) are absent as of 2026-09-20. A miss here means
 *   "post by hand in the app", not "track doesn't exist".
 *
 * Read-only. Searching publishes nothing and uses none of the 20 posts/month.
 * @dbelitefitness must stay connected via the FACEBOOK method or search 400s.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const API = 'https://api.bundle.social/api/v1';
const SECRETS_FILE = path.join(
  os.homedir(),
  'Projects/utilities/claude-secrets/.env.openclaw-secrets'
);
const PREVIEW_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../music/ig-previews'
);

function loadSecretsEnv(file) {
  if (!fs.existsSync(file)) {
    console.error(`[ig-audio] Secrets file not found: ${file}`);
    return;
  }
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

const apiKey = process.env.BUNDLE_SOCIAL_API_KEY;
if (!apiKey) {
  console.error('[ig-audio] BUNDLE_SOCIAL_API_KEY missing from secrets file.');
  process.exit(1);
}

// CLI args
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const option = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return null;
  const [, v] = args.splice(i, 2);
  return v;
};

const asJson = flag('--json');
const labelsOnly = flag('--labels');
const previewId = option('--preview');
const typeArg = option('--type') || 'music';
const audioType = typeArg.startsWith('orig') ? 'original_sound' : 'music';
const queries = args.length ? args : [null]; // null = trending feed

async function api(pathname, params) {
  const url = new URL(API + pathname);
  for (const [k, v] of Object.entries(params || {})) {
    if (v != null) url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: { 'x-api-key': apiKey } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${body.message || res.statusText}`);
  }
  return body;
}

async function resolveTeamId() {
  if (process.env.BUNDLE_SOCIAL_TEAM_ID) return process.env.BUNDLE_SOCIAL_TEAM_ID;
  const { items = [] } = await api('/team');
  const team = items.find((t) => /different breed/i.test(t.name)) || items[0];
  if (!team) throw new Error('No teams on this bundle.social key.');
  return team.id;
}

const isLabel = (a) => a.audio_type === 'music' && !a.download_url;

function fmtDuration(ms) {
  const s = Math.round(Number(ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function printResults(query, audio) {
  console.log(`\n== ${query ?? 'trending'} (${audioType}) — ${audio.length} result${audio.length === 1 ? '' : 's'}`);
  for (const a of audio) {
    const kind = a.audio_type !== 'music' ? 'SOUND  ' : isLabel(a) ? 'LABEL  ' : 'LIBRARY';
    const who = a.display_artist || (a.ig_username ? `@${a.ig_username}` : '?');
    console.log(`  [${kind}] ${a.title} | ${who} | ${fmtDuration(a.duration_in_ms)} | ${a.audio_id}`);
  }
}

async function savePreview(track) {
  if (!track.download_url) {
    console.error(`[ig-audio] "${track.title}" is a label track. Meta gives no preview URL. Audition it in the IG app.`);
    return;
  }
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const slug = `${track.title}-${track.display_artist || track.ig_username || 'ig'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const out = path.join(PREVIEW_DIR, `${slug}-${track.audio_id}.mp4`);
  const res = await fetch(track.download_url);
  if (!res.ok) throw new Error(`preview download failed: ${res.status}`);
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log(`[ig-audio] Preview saved: ${out}`);
}

const teamId = await resolveTeamId();
const all = [];

for (const q of queries) {
  try {
    const { audio = [] } = await api('/misc/instagram/audio', {
      teamId,
      audioType,
      searchQuery: q,
    });
    const shown = labelsOnly ? audio.filter(isLabel) : audio;
    all.push(...shown.map((a) => ({ query: q, ...a })));
    if (!asJson) printResults(q, shown);
  } catch (err) {
    console.error(`[ig-audio] "${q ?? 'trending'}" failed: ${err.message}`);
    process.exitCode = 1;
  }
}

if (asJson) console.log(JSON.stringify(all, null, 2));

if (previewId) {
  const track = all.find((a) => a.audio_id === previewId);
  if (!track) {
    console.error(`[ig-audio] ${previewId} not in these results. Pass the query that returns it alongside --preview.`);
    process.exitCode = 1;
  } else {
    await savePreview(track);
  }
}
