#!/usr/bin/env node
// Find best portrait-oriented (2160x3840) opener clips, excluding already-used
import { readFileSync } from "fs";
const IDX = "/Volumes/Ajeo/Projects/Different Breed/Media Library/_index/videos.json";
const used = new Set([
  "2026/gym_3_30_26/Video/C4838.MP4",
  "2026/gym_3_30_26/Video/C4850.MP4",
  "2026/gym_3_30_26/Video/C4837.MP4",
  "2026/gym_3_30_26/Video/C4815.MP4",
  "2026/gym_3_30_26/Video/C4823.MP4",
  "2026/gym_3_30_26/Video/C4818.MP4",
  "2026/gym_3_30_26/Video/C4806.MP4",
  "2026/gym_3_30_26/Video/C4817.MP4",
  "2026/gym_3_30_26/Video/C4846.MP4", // current opener, replacing
]);

const videos = JSON.parse(readFileSync(IDX, "utf8")).videos
  .filter((v) => v.path.startsWith("2026/gym_3_30_26/") && v.scoring_version === "v2-gemini")
  .filter((v) => v.resolution?.w < v.resolution?.h) // portrait
  .filter((v) => !used.has(v.path))
  .filter((v) => v.usage_flags?.approved && !v.usage_flags?.avoid);

const energyMap = { high: 1.0, medium: 0.6, low: 0.2 };

const ranked = videos.map((v) => {
  let score = v.quality_score ?? 0;
  score += (v.content_fit?.social_reel ?? 0) * 5;
  score += (energyMap[v.energy_level] ?? 0.4) * 3;
  score += (v.cut_friendly ?? 0.5) * 4;
  // opener bonuses
  if (v.framing === "wide" || v.framing === "mixed") score += 3;
  if ((v.people_count ?? 0) >= 3) score += 2;
  if (v.activity_type === "class" || v.activity_type === "strength_conditioning") score += 2;
  if (v.text_safe_zones?.center) score += 1;
  return { v, score };
}).sort((a, b) => b.score - a.score);

console.log(`Portrait candidates: ${videos.length}\n`);
ranked.slice(0, 8).forEach(({ v, score }) => {
  const bcr = v.best_clip_range;
  console.log(`${v.filename}  score=${score.toFixed(1)}  q${v.quality_score} ${v.energy_level} ${v.framing}  people=${v.people_count}`);
  console.log(`  ${v.action_description?.slice(0, 100)}`);
  console.log(`  window ${bcr?.start_sec}-${bcr?.end_sec}s: ${bcr?.description?.slice(0, 90)}`);
  console.log();
});
