#!/usr/bin/env node
/**
 * ScheduleReel Background Clip Picker
 *
 * Queries the DB media library index, picks 4 action clips that work as
 * text backgrounds, and copies them to reels/public/sched-bg-{1..4}.mp4.
 *
 * Mode: deterministic per-date shuffle. Same date always yields the same
 * 4 clips (so re-renders are idempotent). Avoids clips used in the last
 * N days (history window) so members don't see duplicates day-over-day.
 *
 * Usage:
 *   node src/schedule/pickBackgroundClips.mjs                  # today, ET
 *   node src/schedule/pickBackgroundClips.mjs --date=YYYY-MM-DD
 *   node src/schedule/pickBackgroundClips.mjs --window=7       # look-back days
 */

import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  existsSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REELS_ROOT = resolve(__dirname, "..", "..");
const PUBLIC_DIR = resolve(REELS_ROOT, "public");
const MANIFEST = resolve(__dirname, "background-manifest.json");
const HISTORY = resolve(__dirname, "background-history.json");
const MEDIA_ROOT = "/Volumes/Ajeo/Projects/Different Breed/Media Library";
const VIDEO_INDEX = `${MEDIA_ROOT}/_index/videos.json`;

const NUM_CLIPS = 4;

// ─── args ───
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? true];
    })
);

function todayInET() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  return `${y}-${m}-${d}`;
}

const DATE = args.date || todayInET();
const HISTORY_WINDOW = Number(args.window ?? 7);

if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

// ─── deterministic seeded RNG from a date string ───
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const rng = mulberry32(hashString(`db-schedule-${DATE}`));

// ─── history ───
function loadHistory() {
  if (!existsSync(HISTORY)) return { runs: [] };
  return JSON.parse(readFileSync(HISTORY, "utf8"));
}
function recentPaths(hist, date, window) {
  const d = new Date(`${date}T00:00:00-04:00`).getTime();
  const cutoff = d - window * 24 * 60 * 60 * 1000;
  const recent = new Set();
  for (const run of hist.runs) {
    if (run.date === date) continue; // same date re-run: idempotent
    const runDate = new Date(`${run.date}T00:00:00-04:00`).getTime();
    if (runDate > cutoff) {
      for (const clip of run.clips) recent.add(clip.source_path);
    }
  }
  return recent;
}

// ─── load library + filter candidates ───
const videos = JSON.parse(readFileSync(VIDEO_INDEX, "utf8")).videos;

const candidates = videos
  .filter((v) => v.usage_flags?.approved && !v.usage_flags?.avoid && v.model)
  .filter((v) => v.quality_score >= 7)
  .filter((v) => (v.content_fit?.website_background ?? 0) >= 0.5)
  .filter((v) => v.energy_level === "high" || v.energy_level === "medium")
  .filter((v) => v.duration_seconds >= 4)
  .filter((v) => v.activity_type !== "facility")
  .filter((v) => v.people_count >= 2);

if (candidates.length < NUM_CLIPS) {
  console.error(`Only ${candidates.length} candidates — loosen filters.`);
  process.exit(1);
}

// Drop recently used
const history = loadHistory();
const recent = recentPaths(history, DATE, HISTORY_WINDOW);
let pool = candidates.filter((v) => !recent.has(v.path));
if (pool.length < NUM_CLIPS) {
  console.warn(
    `History would over-filter (${pool.length} left). Ignoring history for this run.`
  );
  pool = candidates;
}

// ─── deterministic shuffle ───
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const shuffled = shuffle(pool);

// Diversify across activity_type — at most 2 per type
const picked = [];
const typeCounts = {};
for (const c of shuffled) {
  const t = c.activity_type || "other";
  if ((typeCounts[t] || 0) >= 2) continue;
  picked.push(c);
  typeCounts[t] = (typeCounts[t] || 0) + 1;
  if (picked.length >= NUM_CLIPS) break;
}
if (picked.length < NUM_CLIPS) {
  for (const c of shuffled) {
    if (picked.includes(c)) continue;
    picked.push(c);
    if (picked.length >= NUM_CLIPS) break;
  }
}

// ─── copy + write manifest + append history ───
console.log(`\nPicked ${picked.length} background clips for ${DATE}:\n`);
const manifest = { date: DATE, generated_at: new Date().toISOString(), clips: [] };

picked.forEach((clip, i) => {
  const n = i + 1;
  const dest = resolve(PUBLIC_DIR, `sched-bg-${n}.mp4`);
  const src = `${MEDIA_ROOT}/${clip.path}`;
  copyFileSync(src, dest);

  const row = {
    slot: n,
    filename: `sched-bg-${n}.mp4`,
    source_path: clip.path,
    quality_score: clip.quality_score,
    energy_level: clip.energy_level,
    activity_type: clip.activity_type,
    duration_seconds: clip.duration_seconds,
    people_count: clip.people_count,
    website_background: clip.content_fit?.website_background,
    key_moment: clip.key_moments?.[0]?.description || null,
  };
  manifest.clips.push(row);

  console.log(
    `  [${n}] q${clip.quality_score} ${clip.energy_level} ${clip.activity_type} ${clip.people_count}p ${clip.duration_seconds.toFixed(1)}s`
  );
  console.log(`       src: ${clip.path}`);
});

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

// Append to history (keep last 60 runs)
history.runs = [
  { date: DATE, clips: manifest.clips.map(({ slot, source_path }) => ({ slot, source_path })) },
  ...history.runs.filter((r) => r.date !== DATE),
].slice(0, 60);
writeFileSync(HISTORY, JSON.stringify(history, null, 2));

console.log(`\nManifest: ${MANIFEST}`);
console.log(`History : ${HISTORY} (${history.runs.length} runs tracked)\n`);
