#!/usr/bin/env node
/**
 * Rank gym_3_30_26 clips and pick best for each of the 9 reel beats.
 * Outputs a JSON selection to scripts/danny-clip-selection.json
 */
import { readFileSync, writeFileSync } from "fs";

const IDX = "/Volumes/Ajeo/Projects/Different Breed/Media Library/_index/videos.json";
const videos = JSON.parse(readFileSync(IDX, "utf8")).videos.filter(
  (v) => v.path.startsWith("2026/gym_3_30_26/") && v.scoring_version === "v2-gemini"
);

console.log(`Loaded ${videos.length} gym_3_30_26 clips`);

// Composite score: quality + social_reel + energy + cut_friendly + Danny presence
function baseScore(v) {
  const qs = v.quality_score ?? 0;
  const reel = v.content_fit?.social_reel ?? 0;
  const energyMap = { high: 1.0, medium: 0.6, low: 0.2 };
  const energy = energyMap[v.energy_level] ?? 0.4;
  const cut = v.cut_friendly ?? 0.5;
  const approved = v.usage_flags?.approved ? 1 : 0;
  const avoid = v.usage_flags?.avoid ? 1 : 0;
  if (avoid) return -999;
  if (!approved) return -100;
  return qs + reel * 5 + energy * 3 + cut * 4;
}

// Beat matchers — each returns a bonus for clips matching the role
const ROLES = {
  open: {
    desc: "Wide class shot — opening, people visible, step platforms / group energy",
    match: (v) => {
      let b = 0;
      if (v.framing === "wide" || v.framing === "mixed") b += 3;
      if ((v.people_count ?? 0) >= 3) b += 2;
      if (v.activity_type === "strength_conditioning" || v.activity_type === "class") b += 2;
      if (v.text_safe_zones?.center) b += 1;
      return b;
    },
  },
  danny: {
    desc: "Close on Danny coaching — his face/presence visible, medium framing",
    match: (v) => {
      let b = 0;
      if ((v.coaches_visible || []).includes("Danny")) b += 5;
      if (v.action_description?.toLowerCase().includes("coach")) b += 2;
      if (v.framing === "medium" || v.framing === "close") b += 2;
      if ((v.people_count ?? 0) >= 1 && (v.people_count ?? 0) <= 4) b += 1;
      return b;
    },
  },
  power: {
    desc: "Explosive action — squat, jump, swing, press, lift",
    match: (v) => {
      let b = 0;
      const a = v.action_description?.toLowerCase() || "";
      if (/squat|jump|swing|press|explosive|kettlebell|deadlift|clean|snatch|power|lift/.test(a)) b += 4;
      if (v.energy_level === "high") b += 2;
      if (v.framing === "medium" || v.framing === "close") b += 1;
      return b;
    },
  },
  discipline: {
    desc: "Loaded carry / grind / sustained effort — sled, carry, hold, push",
    match: (v) => {
      let b = 0;
      const a = v.action_description?.toLowerCase() || "";
      if (/sled|carry|push|drag|hold|plank|grind|row|battle rope|battle-rope/.test(a)) b += 4;
      if (v.energy_level === "high" || v.energy_level === "medium") b += 1;
      return b;
    },
  },
  athletes: {
    desc: "Group shot / class formation — multiple bodies working",
    match: (v) => {
      let b = 0;
      if ((v.people_count ?? 0) >= 3) b += 3;
      if (v.framing === "wide" || v.framing === "mixed") b += 2;
      if (v.activity_type === "class" || v.activity_type === "strength_conditioning") b += 1;
      return b;
    },
  },
  earned: {
    desc: "Hero strong action — peak moment, text-safe center, highlight-reel fit",
    match: (v) => {
      let b = 0;
      if ((v.content_fit?.highlight_reel ?? 0) >= 0.7) b += 3;
      if (v.text_safe_zones?.center) b += 2;
      if (v.energy_level === "high") b += 2;
      if ((v.quality_score ?? 0) >= 7) b += 2;
      return b;
    },
  },
  grind: {
    desc: "Hard work — fatigue, sweat, effort visible, medium/close",
    match: (v) => {
      let b = 0;
      const a = v.action_description?.toLowerCase() || "";
      if (/grind|fatigue|rep|round|circuit|burpee|sprint|conditioning/.test(a)) b += 3;
      if (v.framing === "close" || v.framing === "medium") b += 2;
      if (v.energy_level === "high") b += 1;
      return b;
    },
  },
  door: {
    desc: "Wide class / entrance feel — evokes 'walk through the door'",
    match: (v) => {
      let b = 0;
      if (v.framing === "wide") b += 3;
      if ((v.people_count ?? 0) >= 3) b += 2;
      if ((v.content_fit?.website_hero ?? 0) >= 0.5) b += 1;
      return b;
    },
  },
  climax: {
    desc: "Strong sustained hero action — longest cut, text-safe, climax-worthy",
    match: (v) => {
      let b = 0;
      const bcr = v.best_clip_range;
      const windowLen = bcr ? (bcr.end_sec - bcr.start_sec) : 2;
      if (windowLen >= 3) b += 2;
      if ((v.quality_score ?? 0) >= 7) b += 2;
      if (v.text_safe_zones?.center) b += 3;
      if ((v.content_fit?.highlight_reel ?? 0) >= 0.7) b += 2;
      if (v.energy_level === "high") b += 1;
      return b;
    },
  },
};

const used = new Set();
const selections = {};

// Greedy pass — each role picks its highest-scoring not-yet-used clip
for (const [role, spec] of Object.entries(ROLES)) {
  const ranked = videos
    .filter((v) => !used.has(v.path))
    .map((v) => ({
      v,
      score: baseScore(v) + spec.match(v),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  if (!top) {
    console.error(`No candidate for ${role}!`);
    continue;
  }
  used.add(top.v.path);
  selections[role] = {
    path: top.v.path,
    filename: top.v.filename,
    score: Number(top.score.toFixed(2)),
    quality_score: top.v.quality_score,
    energy_level: top.v.energy_level,
    framing: top.v.framing,
    camera_motion: top.v.camera_motion,
    action: top.v.action_description,
    coaches: top.v.coaches_visible,
    best_clip_range: top.v.best_clip_range,
    duration_seconds: top.v.duration_seconds,
    text_safe_zones: top.v.text_safe_zones,
  };
}

console.log("\n=== Selections ===\n");
for (const [role, pick] of Object.entries(selections)) {
  const bcr = pick.best_clip_range;
  console.log(
    `${role.padEnd(11)} ${pick.filename}  [${bcr?.start_sec ?? "?"}-${bcr?.end_sec ?? "?"}s]  q${pick.quality_score} ${pick.energy_level} ${pick.framing}`
  );
  console.log(`              ${pick.action?.slice(0, 90) ?? ""}`);
  if (bcr?.description) console.log(`              window: ${bcr.description.slice(0, 90)}`);
  console.log();
}

const outPath = "scripts/danny-clip-selection.json";
writeFileSync(outPath, JSON.stringify(selections, null, 2));
console.log(`Written: ${outPath}`);
