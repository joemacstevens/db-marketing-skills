#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

const IDX = "/Volumes/Ajeo/Projects/Different Breed/Media Library/_index/videos.json";
const videos = JSON.parse(readFileSync(IDX, "utf8")).videos
  .filter((v) => v.compilation_analysis);

console.log(`Analyzed: ${videos.length}`);

function composite(v) {
  const c = v.compilation_analysis;
  const pim = c.peak_impact_moment || {};
  const hook = pim.hook_strength ?? 0;
  const hype = c.hype_factor ?? 0;
  const drop = c.beat_drop_suitability ?? 0;
  const cin = c.cut_in_quality ?? 0;
  const cout = c.cut_out_quality ?? 0;
  const thumb = c.thumbnail_worthiness ?? 0;
  const mi = c.motion_intensity ?? 0;
  return (
    hype * 5 +
    hook * 4 +
    drop * 3 +
    cin * 2 +
    cout * 2 +
    thumb * 1 +
    mi * 2 +
    (v.quality_score ?? 0) * 0.5
  );
}

function hasBakedText(v) {
  if (v.activity_type === "promo") return true;
  // 4-digit-month-day filenames (0316, 0402, 0507 etc.) are often pre-edited
  if (/^\d{4}(\(\d+\))?\.(mov|mp4)$/i.test(v.filename)) return true;
  // UUID-style filenames (dashed or flat hex, 32+ chars) — typical editor exports
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\./i.test(v.filename)) return true;
  if (/^[a-f0-9]{20,}\.(mov|mp4)$/i.test(v.filename)) return true;
  // Sub-clip exports like "01_C4324_27.00-29.50.mp4" (editor-sliced intermediates)
  if (/^\d{2}_C?\d+_\d+\.\d+-\d+\.\d+\./i.test(v.filename)) return true;
  // Standalone short numeric/letter filenames with no prefix — often edited exports
  if (/^(fit|out|final|edit|clip|v\d+)[\s\(\d\)]*\.(mov|mp4)$/i.test(v.filename)) return true;
  // Check descriptions for overlay/caption/promo markers
  const desc = (v.compilation_analysis?.peak_impact_moment?.description || "") +
    " " + (v.compilation_analysis?.compilation_notes || "") +
    " " + (v.action_description || "");
  if (/\btext overlay\b|\bcaption\b|\bpromotional text\b|\boverlay text\b|\bphone screen\b|\bbefore[- ]and[- ]after\b|\btransformation\b/i.test(desc)) return true;
  // Non-workout moments — reject for a "Just Work" compilation
  if (/\btestimonial\b|\binterview\b|\bposing\b|\bsign(ing|-in)\b|\bholding\b.*\bphone\b|\bpresentation\b|\blobby\b|\blaughs at the camera\b|\bsmiles at the camera\b/i.test(desc)) return true;
  // Clips where subject isn't actively exercising
  if (/\bjacket\b|\bdoor\b|\breception\b|\blockers?\b/i.test(desc)) return true;
  return false;
}

function sessionKey(v) {
  // Rough "session" bucket from parent folder
  const parts = v.path.split("/");
  return parts.slice(0, -1).join("/");
}

const rawClean = videos.filter((v) => !hasBakedText(v));
console.log(`After baked-text filter: ${rawClean.length}`);

const ranked = rawClean
  .map((v) => ({ v, s: composite(v) }))
  .sort((a, b) => b.s - a.s);

console.log("\n=== Top 15 candidates ===");
ranked.slice(0, 15).forEach(({ v, s }, i) => {
  const c = v.compilation_analysis;
  const pim = c.peak_impact_moment || {};
  console.log(
    `${String(i + 1).padStart(2)}. s=${s.toFixed(2)}  q${v.quality_score} ${v.activity_type}  hype=${c.hype_factor} drop=${c.beat_drop_suitability} hook=${pim.hook_strength}  motion=${c.motion_direction}`
  );
  console.log(`    ${v.filename}  (peak@${pim.timestamp_sec}s, ${c.ideal_cut_duration_sec}s)`);
  console.log(`    ${pim.description?.slice(0, 100)}`);
  console.log(`    ${c.compilation_notes?.slice(0, 100)}`);
  console.log();
});

// Pick 4 with variety — no two from same session, activity diversity
const picked = [];
const usedSessions = new Set();
const activityCounts = {};
const MAX_PER_ACTIVITY = 3;

for (const { v } of ranked) {
  if (picked.length >= 5) break;
  const sk = sessionKey(v);
  const act = v.activity_type || "other";
  if (usedSessions.has(sk)) continue;
  if ((activityCounts[act] || 0) >= MAX_PER_ACTIVITY) continue;
  const c = v.compilation_analysis;
  // Reject clips that can't cut well
  if ((c.cut_in_quality ?? 0) < 0.5) continue;
  if ((c.hype_factor ?? 0) < 0.5) continue;
  picked.push(v);
  usedSessions.add(sk);
  activityCounts[act] = (activityCounts[act] || 0) + 1;
}

console.log(`\n=== Selected ${picked.length} clips ===`);
const out = picked.map((v, i) => {
  const c = v.compilation_analysis;
  const pim = c.peak_impact_moment;
  const dur = c.ideal_cut_duration_sec ?? 2.5;
  // Window: center on peak, span +/- dur/2, clamped to clip
  const half = dur / 2;
  const startSec = Math.max(0, pim.timestamp_sec - half);
  const endSec = Math.min(v.duration_seconds ?? pim.timestamp_sec + dur, pim.timestamp_sec + half);
  return {
    idx: i + 1,
    path: v.path,
    filename: v.filename,
    activity: v.activity_type,
    quality: v.quality_score,
    duration_seconds: v.duration_seconds,
    resolution: v.resolution,
    peak: pim,
    motion_direction: c.motion_direction,
    hype_factor: c.hype_factor,
    beat_drop_suitability: c.beat_drop_suitability,
    cut_duration_sec: Number((endSec - startSec).toFixed(2)),
    window_start_sec: Number(startSec.toFixed(2)),
    window_end_sec: Number(endSec.toFixed(2)),
    compilation_notes: c.compilation_notes,
  };
});

out.forEach((p) => {
  console.log(`\n#${p.idx}  ${p.filename}  (${p.activity}, q${p.quality})`);
  console.log(`  trim: ${p.window_start_sec}–${p.window_end_sec}s (${p.cut_duration_sec}s)`);
  console.log(`  peak: ${p.peak.description?.slice(0, 90)}`);
  console.log(`  motion: ${p.motion_direction}, hype=${p.hype_factor}, drop=${p.beat_drop_suitability}`);
});

writeFileSync("scripts/justwork-clip-selection.json", JSON.stringify(out, null, 2));
console.log("\nWritten: scripts/justwork-clip-selection.json");
