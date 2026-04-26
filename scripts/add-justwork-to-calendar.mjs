#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

const calPath = "content-calendar/calendar.json";
const cal = JSON.parse(readFileSync(calPath, "utf8"));

const today = "2026-04-18";
const todayPosts = cal.posts.filter((p) => p.id.startsWith(today));
const seq = String(todayPosts.length + 1).padStart(3, "0");

const ig_caption = `No fluff. No shortcuts. Just work.

From the kids to the coaches, 5 AM Pilates to Saturday strength — this is what Different Breed looks like on any given day.

Walk through the door. Train different.

📍 Teaneck, NJ
🔗 differentbreedsportsacademy.com

🎥 @veteranwithacamera

#DifferentBreed #JustWork #TrainDifferent #NJFitness #EvolveIntoGreatness`;

const fb_caption = `No fluff. No shortcuts. Just work. This is Different Breed. Teaneck, NJ — walk through the door, train different. 🎥 @veteranwithacamera`;

if (fb_caption.length > 255) {
  console.error(`FB too long: ${fb_caption.length}`);
  process.exit(1);
}

const now = new Date().toISOString();
const post = {
  id: `${today}-${seq}`,
  status: "approved",
  campaign: null,
  content_type: "motivational",
  post_date: today,
  post_time: "12:00",
  platforms: ["instagram", "facebook"],
  ig_caption,
  fb_caption,
  hashtags: ["#DifferentBreed","#JustWork","#TrainDifferent","#NJFitness","#EvolveIntoGreatness"],
  media_type: "video",  // NOT "reel" — publish.mjs silently no-ops on unknown types
  media_paths: [
    "/Users/joestevens/Projects/db-marketing-skills-main/output/2026-04-18-just-work-reel/just-work-15.mp4",
  ],
  media_query: "top-40 q8+ clips library-wide, deep compilation_analysis (peak_impact_moment, hype_factor, beat_drop_suitability), filtered to raw source footage, 5 diverse clips",
  instagram_options: { media_type: "REELS", first_comment: null },
  facebook_options: {},
  coach_tags: [],
  credit_videographer: true,
  notes: "Just Work — 15s compilation reel. Seven Nation Army instrumental. 5 top-scored q8+ clips: kid burst (Apr 11), athlete jump, sled drive, pilates leg press, pilates rings group. Typography verified via still-frame pass before render.",
  created_at: now,
  approved_at: now,
  posted_at: null,
  post_result: null,
};

cal.posts.push(post);
cal.last_updated = now;
writeFileSync(calPath, JSON.stringify(cal, null, 2));
console.log(`Added+approved: ${post.id}`);
console.log(`IG len: ${ig_caption.length}  FB len: ${fb_caption.length}/255  hashtags: ${post.hashtags.length}/5`);
