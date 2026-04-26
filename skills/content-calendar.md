# Skill: Content Calendar Manager

## Purpose
Track every piece of content from idea through posting. This is the central state file that connects content planning, media selection, approval, and publishing.

## The Calendar File
**Location:** `content-calendar/calendar.json`
**Schema:** `content-calendar/schema.json`

## Post Lifecycle

```
draft → ready → approved → scheduled → posted
                                    ↘ failed
```

| Status | Who | What it means |
|--------|-----|---------------|
| `draft` | Agent | Post written but may need work. Media may not be selected yet. |
| `ready` | Agent | Post is complete — caption, media, hashtags, platform options all set. Waiting for Joey's approval. |
| `approved` | Joey | Joey reviewed and approved. Ready to schedule or post. |
| `scheduled` | Agent/Script | Queued in Upload-Post with a scheduled date/time. |
| `posted` | System | Live on social media. `posted_at` and `post_result` filled in. |
| `failed` | System | Posting attempted but failed. Check `post_result` for error. |

## How to Use

### Valid `media_type` values
The publisher only understands these five values — anything else will throw:

| `media_type` | Use for | Notes |
|--------------|---------|-------|
| `text`       | Text-only posts | No `media_paths` needed. |
| `photo`      | Single still image | One entry in `media_paths`. |
| `carousel`   | Multi-image IG post | 2+ entries in `media_paths`. |
| `video`      | Any video — **including reels** | Set `instagram_options.media_type: "REELS"` for reels (the default when omitted). |
| `story`      | IG/FB story | Forces `instagramMediaType: "STORIES"`. |

**Do NOT use `"reel"` as a `media_type`** — it's not a recognized value. Reels are published as `media_type: "video"` with `instagram_options.media_type: "REELS"`.

### Adding a new post
When generating content (via social-content, campaign-planner, etc.), add an entry to the calendar:

```javascript
import { readFileSync, writeFileSync } from 'fs';

const calPath = 'content-calendar/calendar.json';
const cal = JSON.parse(readFileSync(calPath, 'utf8'));

// Generate next ID
const today = new Date().toISOString().slice(0, 10);
const todayPosts = cal.posts.filter(p => p.id.startsWith(today));
const seq = String(todayPosts.length + 1).padStart(3, '0');

const newPost = {
  id: `${today}-${seq}`,
  status: "ready",
  campaign: "summer-camp-2026",       // or null
  content_type: "class_promo",
  post_date: "2026-04-15",
  post_time: "09:00",
  platforms: ["instagram", "facebook"],
  ig_caption: "Full IG caption here...\n\n#DifferentBreed #Boxing #NJFitness",
  fb_caption: "Short FB version here (under 255 chars)",
  hashtags: ["#DifferentBreed", "#Boxing", "#NJFitness"],
  media_type: "photo",
  media_paths: ["/Volumes/Ajeo/Projects/Different Breed/Media Library/March 30, 2026/IMG_4567.jpg"],
  media_query: "boxing action, quality>=7, scene_type=action, approved",
  instagram_options: { media_type: "IMAGE", first_comment: null },
  facebook_options: {},
  coach_tags: [],
  credit_videographer: false,
  notes: null,
  created_at: new Date().toISOString(),
  approved_at: null,
  posted_at: null,
  post_result: null
};

cal.posts.push(newPost);
cal.last_updated = new Date().toISOString();
writeFileSync(calPath, JSON.stringify(cal, null, 2));
```

### Checking what needs approval
```javascript
const needsApproval = cal.posts.filter(p => p.status === 'ready');
console.log(`${needsApproval.length} posts waiting for approval`);
```

### Approving posts
When Joey says "approve" or "looks good":
```javascript
post.status = 'approved';
post.approved_at = new Date().toISOString();
```

### Batch approve
```javascript
// Approve all ready posts for a campaign
cal.posts
  .filter(p => p.status === 'ready' && p.campaign === 'summer-camp-2026')
  .forEach(p => {
    p.status = 'approved';
    p.approved_at = new Date().toISOString();
  });
```

## Generating a Review Summary

When Joey asks "what's in the queue?" or "show me what's coming up," generate a human-readable summary:

```
## Content Queue — April 15-21, 2026

### Ready for Approval (3 posts)
1. **Apr 15 @ 9am** — Class Promo (photo)
   IG: "The ring doesn't care about your excuses..."
   FB: "The ring doesn't care. Show up. 🥊"
   Media: March 30 boxing action shot (7.5/10)

2. **Apr 16 @ 6pm** — Coach Spotlight: Glenda (video)
   IG: "Kids Boxing isn't just punches..."
   FB: "Kids Boxing with @gfitbyglenda. Mon/Wed 4PM."
   Media: Reel clip of Glenda teaching (7/10)

3. **Apr 17 @ 12pm** — Motivational (photo)
   ...

### Approved & Scheduled (2 posts)
- Apr 14 @ 9am — Campaign kickoff (scheduled)
- Apr 14 @ 5pm — Behind the scenes (scheduled)

### Posted This Week (4 posts)
- Apr 13 — Motivational Monday ✓
- Apr 12 — Saturday recap ✓
- ...
```

## Rules

1. **Every post MUST go through the calendar.** Don't generate content that bypasses it.
2. **Never post without `approved` status.** Drafts and ready posts are proposals, not live content.
3. **DB content always goes to IG + FB.** Both platforms, every time.
4. **FB caption ≤ 255 chars.** Always check.
5. **Max 5 hashtags on IG.**
6. **Include media paths.** Use the media-library skill to find real assets, not placeholder descriptions.
7. **Credit @veteranwithacamera** — set `credit_videographer: true` if using his footage.
8. **Post dates should avoid clustering.** Spread content across the week. Check existing posts before scheduling.

## Integration with Other Skills

| When using... | Do this with the calendar |
|--------------|--------------------------|
| **social-content** | Add each generated post as a `ready` entry |
| **campaign-planner** | Add all campaign posts as `draft` entries, then refine to `ready` |
| **schedule-announcer** | Add weekly schedule posts as `ready` with `content_type: "schedule"` |
| **media-library** | Populate `media_paths` and `media_query` when selecting assets |
| **post-publisher** | Read `approved` entries, post them, update status to `scheduled`/`posted` |
