#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

const calPath = "content-calendar/calendar.json";
const cal = JSON.parse(readFileSync(calPath, "utf8"));

const today = "2026-04-18";
const seq = String(cal.posts.filter((p) => p.id.startsWith(today)).length + 1).padStart(3, "0");

const ig_caption = `No fluff. No shortcuts. Just work.

🎥 @veteranwithacamera

#DifferentBreed #JustWork #TrainDifferent #NJFitness #EvolveIntoGreatness`;

const fb_caption = `No fluff. No shortcuts. Just work. 🎥 @veteranwithacamera`;

const now = new Date().toISOString();
const post = {
  id: `${today}-${seq}`,
  status: "approved",
  campaign: null,
  content_type: "motivational",
  post_date: today,
  post_time: "17:00",
  platforms: ["instagram", "facebook"],
  ig_caption,
  fb_caption,
  hashtags: ["#DifferentBreed","#JustWork","#TrainDifferent","#NJFitness","#EvolveIntoGreatness"],
  media_type: "video",
  media_paths: [
    "/Users/joestevens/Projects/db-marketing-skills-main/output/2026-04-18-just-work-reel/just-work-15-v2.mp4",
  ],
  media_query: "top-40 q8+ library clips, compilation_analysis deep pass; 5 diverse subjects: medicine ball throw, rowing pull, sled drive, pilates leg press, pilates rings group",
  instagram_options: { media_type: "REELS", first_comment: null },
  facebook_options: {},
  coach_tags: [],
  credit_videographer: true,
  notes: "Just Work v2 — 15s template reel. Seven Nation Army instrumental. Cinematic transitions: 2-frame white impact flash + 8-frame GlitchEffect on each cut. Slate + EndCard typography locked as template for future Just Work reels.",
  created_at: now,
  approved_at: now,
  posted_at: null,
  post_result: null,
};

cal.posts.push(post);
cal.last_updated = now;
writeFileSync(calPath, JSON.stringify(cal, null, 2));
console.log(`Approved: ${post.id}  IG:${ig_caption.length}  FB:${fb_caption.length}/255  tags:${post.hashtags.length}/5`);
