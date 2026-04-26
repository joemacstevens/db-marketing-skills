#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

const calPath = "content-calendar/calendar.json";
const cal = JSON.parse(readFileSync(calPath, "utf8"));

const today = "2026-04-17";
const todayPosts = cal.posts.filter((p) => p.id.startsWith(today));
const seq = String(todayPosts.length + 1).padStart(3, "0");

const ig_caption = `This isn't a class. It's a standard.

Strength & Conditioning with Coach Danny (@danielwilson78) — where every rep, every round, is earned.

No fluff. No shortcuts. Just work.

🗓 Thursdays · 6:00 PM
🗓 Saturdays · 10:00 AM

Walk through the door. Train different.

📍 Teaneck, NJ
🔗 Book: differentbreedsportsacademy.com

🎥 @veteranwithacamera

#DifferentBreed #StrengthAndConditioning #TrainDifferent #NJFitness #EvolveIntoGreatness`;

const fb_caption = `Strength & Conditioning with Coach Danny (@danielwilson78). No fluff. No shortcuts. Just work. Thursdays 6PM · Saturdays 10AM. Teaneck, NJ. Walk through the door — train different. 🎥 @veteranwithacamera`;

if (fb_caption.length > 255) {
  console.error(`FB caption too long: ${fb_caption.length} chars`);
  process.exit(1);
}

const now = new Date().toISOString();
const post = {
  id: `${today}-${seq}`,
  status: "approved",
  campaign: null,
  content_type: "class_promo",
  post_date: today,
  post_time: "17:00",
  platforms: ["instagram", "facebook"],
  ig_caption,
  fb_caption,
  hashtags: [
    "#DifferentBreed",
    "#StrengthAndConditioning",
    "#TrainDifferent",
    "#NJFitness",
    "#EvolveIntoGreatness",
  ],
  media_type: "reel",
  media_paths: [
    "/Users/joestevens/Projects/db-marketing-skills-main/output/2026-04-17-danny-sc-reel/danny-sc-30.mp4",
  ],
  media_query: "gym_3_30_26 Danny S&C clips — Gemini best_clip_range selection; 9-beat cinematic reel with VO + We Major instrumental",
  instagram_options: { media_type: "REEL", first_comment: null },
  facebook_options: {},
  coach_tags: ["@danielwilson78"],
  credit_videographer: true,
  notes:
    "Strength & Conditioning — Coach Danny reel. 30s cinematic w/ ElevenLabs VO + Kanye 'We Major' instrumental. Schedule sourced from MindBody API (Thu 6PM, Sat 10AM). Source footage: 2026/gym_3_30_26/Video.",
  created_at: now,
  approved_at: now,
  posted_at: null,
  post_result: null,
};

cal.posts.push(post);
cal.last_updated = now;
writeFileSync(calPath, JSON.stringify(cal, null, 2));
console.log(`Added + approved: ${post.id}`);
console.log(`FB caption length: ${fb_caption.length} / 255`);
console.log(`IG caption length: ${ig_caption.length}`);
console.log(`Hashtags: ${post.hashtags.length} / 5`);
