#!/usr/bin/env node
/**
 * Append 3 Jack & Jill reels to content-calendar/calendar.json
 * as approved, ready to publish.
 */
import { readFileSync, writeFileSync } from "fs";

const CAL = "/Users/joestevens/Projects/db-marketing-skills-main/content-calendar/calendar.json";
const cal = JSON.parse(readFileSync(CAL, "utf8"));

const nowIso = new Date().toISOString();
const today = "2026-04-18";
const FB_PAGE = "100873874674621";
const OUT = "/Users/joestevens/Projects/db-marketing-skills-main/campaigns/jack-jill-2026-04-18/output";

const reels = [
  {
    id: "2026-04-18-003",
    campaign: "jack-jill-2026-04-18",
    content_type: "event_recap",
    post_time: "19:30",
    title: "A Day of Dedication (25s recap)",
    ig_caption:
      "One day. One family. One standard.\n\nJack & Jill of America — Bergen-Passaic Chapter brought their families to Different Breed for a wellness Saturday. Kids in the ring. Parents on the straps. Everybody moved.\n\nDedication isn't a word. It's what we do.\n\n🙏 Jack & Jill Bergen-Passaic · Coach Tara · @joebutta25 · @sun_of_yah\n\n#DifferentBreed #JackAndJill #EvolveIntoGreatness #FamilyFitness #TeaneckNJ",
    fb_caption:
      "One day. One family. One standard. Jack & Jill of America — Bergen-Passaic Chapter brought their families to Different Breed for a wellness Saturday. Kids in the ring. Parents on the straps. Everybody moved. 🙏",
    hashtags: [
      "#DifferentBreed",
      "#JackAndJill",
      "#EvolveIntoGreatness",
      "#FamilyFitness",
      "#TeaneckNJ",
    ],
    media_path: `${OUT}/jj-day-of-dedication-25s.mp4`,
    coach_tags: ["@joebutta25", "@sun_of_yah"],
    notes:
      "Jack & Jill × DB wellness Saturday recap. 26s dual-VO reel (Berto + Tonya). Music: We Major instrumental. Closes on native 'Dedication!' group cheer audio + scramble title.",
  },
  {
    id: "2026-04-18-004",
    campaign: "jack-jill-2026-04-18",
    content_type: "kids_boxing",
    post_time: "19:45",
    title: "Raised Different (15s kids reel)",
    ig_caption:
      "Raised different.\n\nJack & Jill kids picked up the gloves today. Hands up. Feet moving. No excuses.\n\nFuture's in good hands. 👊\n\n@joebutta25 · @sun_of_yah · Jack & Jill Bergen-Passaic\n\n#KidsBoxing #DifferentBreed #NextGen #RaisedDifferent #TeaneckNJ",
    fb_caption:
      "Raised different. Jack & Jill kids picked up the gloves today. Hands up. Feet moving. No excuses. Future's in good hands. 👊",
    hashtags: [
      "#KidsBoxing",
      "#DifferentBreed",
      "#NextGen",
      "#RaisedDifferent",
      "#TeaneckNJ",
    ],
    media_path: `${OUT}/jj-kids-next-gen-15s.mp4`,
    coach_tags: ["@joebutta25", "@sun_of_yah"],
    notes:
      "Jack & Jill kids-focused compilation reel. JustWork15-template-locked: slate + 5 clips + end card. Music: Touch It instrumental. 5 cuts: boy jab on DB logo → ring combos → sprint leap → girl power-punch → explosive class sprint.",
  },
  {
    id: "2026-04-18-005",
    campaign: "jack-jill-2026-04-18",
    content_type: "adult_class",
    post_time: "20:00",
    title: "Train Together, Different (22s Pulse reel)",
    ig_caption:
      "That's what different looks like.\n\nWhile the kids trained on the floor, the parents hit the straps in Pulse. TRX. Zumba. Real work, together.\n\nDifferent Breed isn't just for the athletes — it's for the people raising them.\n\n🙏 Jack & Jill Bergen-Passaic\n\n#PulseStudio #DifferentBreed #TRX #Zumba #JackAndJill #FamilyFitness",
    fb_caption:
      "That's what different looks like. While the kids trained on the floor, the parents hit the straps in Pulse — TRX, Zumba, real work, together.",
    hashtags: [
      "#PulseStudio",
      "#DifferentBreed",
      "#TRX",
      "#Zumba",
      "#JackAndJill",
      "#FamilyFitness",
    ],
    media_path: `${OUT}/jj-train-together-22s.mp4`,
    coach_tags: [],
    notes:
      "Jack & Jill × DB Pulse studio (adult) reel. 22s Tonya VO. Music: Seven Nation Army instrumental. Beat flow: Pulse slate → TRX leopard → TRX tricep → 'They trained.' (red emphasis) → J&J shirt 'Together.' → Zumba joy → coach arms-up swell → group photo closer.",
  },
];

for (const r of reels) {
  cal.posts.push({
    id: r.id,
    status: "approved",
    campaign: r.campaign,
    content_type: r.content_type,
    post_date: today,
    post_time: r.post_time,
    platforms: ["instagram", "facebook"],
    ig_caption: r.ig_caption,
    fb_caption: r.fb_caption,
    hashtags: r.hashtags,
    media_type: "video",
    media_paths: [r.media_path],
    media_query: null,
    instagram_options: {
      media_type: "REELS",
      first_comment: null,
    },
    facebook_options: {
      facebookPageId: FB_PAGE,
    },
    coach_tags: r.coach_tags,
    credit_videographer: false,
    notes: r.notes,
    created_at: nowIso,
    approved_at: nowIso,
  });
}

cal.last_updated = nowIso;
writeFileSync(CAL, JSON.stringify(cal, null, 2));
console.log(`Added ${reels.length} reels as approved. New calendar size: ${cal.posts.length}.`);
for (const r of reels) console.log(`  ${r.id} — ${r.title}`);
