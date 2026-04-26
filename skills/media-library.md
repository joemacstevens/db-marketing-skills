# Skill: Media Library Selector

## Purpose
Query the Different Breed media library index to find the best photos and videos for any content need — social posts, campaigns, website, reels, stories, or print materials.

## The Index
The media library lives at `/Volumes/Ajeo/Projects/Different Breed/Media Library/` and has been fully indexed using Gemini 2.0 Flash vision AI. Every photo and video has been analyzed, scored, tagged, and classified.

### Index Files (source of truth)
| File | What | Records |
|------|------|---------|
| `_index/photos.json` | Full photo manifest with Gemini metadata | 2,325 photos |
| `_index/videos.json` | Full video manifest with Gemini metadata | 940 videos |
| `_index/summary.json` | Run stats, model version, totals | — |
| `_index/photos.jsonl` | Streaming format (one record per line) | 2,325 |
| `_index/videos.jsonl` | Streaming format (one record per line) | 940 |

### Photo Record Fields
```
id, path, filename, taken_at, source, dimensions {w, h}
subject[]          — tags: boxing, sparring, gym, ring, athletes, fitness, training, etc.
people_count       — number of people visible
faces_visible      — boolean
brand_elements[]   — DB logo, Title Boxing, signage, etc.
scene_type         — action | lifestyle | portrait | class | facility | product | unknown
quality_score      — 0-10 (Gemini-assessed)
quality_notes[]    — observations about lighting, composition, blur
website_fit        — {hero: 0-1, class_page: 0-1, coach_page: 0-1, testimonial: 0-1}
usage_flags        — {approved: bool, needs_review: bool, avoid: bool}
model              — "gemini-2.0-flash"
```

### Video Record Fields
```
id, path, filename, taken_at
duration_seconds, resolution {w, h}, file_size_bytes, codec, fps, has_audio
subject[]          — tags (same as photos)
activity_type      — boxing | pilates | class | event | promo | training | facility | other
people_count       — number of people visible
coaches_visible[]  — names of identified coaches (Glenda, Joe, Ali, CJ, Nessa)
energy_level       — high | medium | low
quality_score      — 0-10 (Gemini-assessed)
quality_notes[]    — observations about stability, framing, audio quality
content_fit        — {social_reel: 0-1, social_story: 0-1, website_hero: 0-1,
                      website_background: 0-1, highlight_reel: 0-1, testimonial: 0-1}
usage_flags        — {approved: bool, needs_review: bool, avoid: bool}
key_moments[]      — [{timestamp_sec, description}] notable moments in the video
transcript_summary — summary of any speech/dialogue (or null)
model              — "gemini-2.0-flash" (null = metadata only, not vision-analyzed)
```

## How to Use

### Step 1: Load the index
```javascript
import { readFileSync } from 'fs';
const MEDIA_ROOT = '/Volumes/Ajeo/Projects/Different Breed/Media Library';

const photoIndex = JSON.parse(readFileSync(`${MEDIA_ROOT}/_index/photos.json`, 'utf8'));
const videoIndex = JSON.parse(readFileSync(`${MEDIA_ROOT}/_index/videos.json`, 'utf8'));

const photos = photoIndex.photos;  // array of 2,325 records
const videos = videoIndex.videos;  // array of 940 records
```

### Step 2: Query by need
Use the fields to filter and rank. Always prefer `approved: true` and `avoid: false`.

## Common Queries

### "I need 5 high-energy boxing shots for a carousel"
```javascript
const picks = photos
  .filter(p => p.usage_flags.approved && !p.usage_flags.avoid)
  .filter(p => p.subject.includes('boxing') && p.scene_type === 'action')
  .filter(p => p.quality_score >= 7)
  .sort((a, b) => b.quality_score - a.quality_score)
  .slice(0, 5);
```

### "Find a hero video for the website"
```javascript
const hero = videos
  .filter(v => v.usage_flags.approved && v.model !== null)
  .filter(v => v.content_fit.website_hero >= 0.7)
  .sort((a, b) => b.content_fit.website_hero - a.content_fit.website_hero)[0];
```

### "What Pilates content do we have?"
```javascript
const pilatesPhotos = photos.filter(p =>
  p.subject.includes('pilates') || p.scene_type === 'class'
);
const pilatesVideos = videos.filter(v =>
  v.activity_type === 'pilates' || v.subject.includes('pilates')
);
```

### "Best clips for an Instagram Reel"
```javascript
const reelClips = videos
  .filter(v => v.usage_flags.approved && v.model !== null)
  .filter(v => v.content_fit.social_reel >= 0.6)
  .filter(v => v.energy_level === 'high')
  .sort((a, b) => b.content_fit.social_reel - a.content_fit.social_reel)
  .slice(0, 10);
```

### "Find content featuring Coach Glenda"
```javascript
const glendaVideos = videos.filter(v =>
  v.coaches_visible.includes('Glenda')
);
const glendaPhotos = photos.filter(p =>
  p.subject.some(s => s.toLowerCase().includes('glenda'))
);
```

### "What are our best facility/space shots?"
```javascript
const facilityPhotos = photos
  .filter(p => p.scene_type === 'facility' && p.quality_score >= 6)
  .sort((a, b) => b.website_fit.hero - a.website_fit.hero);
```

### "Summer camp content from 2025"
```javascript
const campPhotos = photos.filter(p =>
  p.path.includes('2025') &&
  (p.subject.includes('kids') || p.subject.includes('youth') || p.path.toLowerCase().includes('camp'))
);
```

## Selection Rules

1. **NEVER use `avoid: true` assets.** They were flagged as unusable by Gemini.
2. **Prefer `approved: true`** — these passed quality and content checks.
3. **Quality floor: 6+** for social posts, **7+** for website/hero use, **8+** for print.
4. **Variety matters.** Don't pick 5 shots from the same session. Spread across `taken_at` dates and folders.
5. **Check `brand_elements`** — photos with visible DB branding are gold for marketing.
6. **For video: check `model` field.** If `model` is null, the video has basic metadata but wasn't fully analyzed — use it only as a fallback.
7. **Credit @veteranwithacamera** on any post using professional footage.

## Resolving File Paths

Index paths are relative to the media library root. To get an absolute path:
```javascript
const absolutePath = `${MEDIA_ROOT}/${record.path}`;
// e.g. "/Volumes/Ajeo/Projects/Different Breed/Media Library/March 30, 2026/IMG_4567.jpg"
```

## Index Stats (as of April 13, 2026)

### Photos
- **2,325 total** — fully analyzed by Gemini
- **2,049 approved** for use
- **Scene types:** action (1,354), class (393), lifestyle (270), portrait (168), facility (117)
- **Quality range:** 2.0–8.0, average 6.5

### Videos
- **940 total** (310 fully analyzed, 630 with metadata only — reanalysis in progress)
- **Activity types:** training (171), class (91), facility (39), event (6)
- **Total duration:** ~7.9 hours of footage
- **Quality range:** 4.0–8.0, average 6.4

## When to Use This Skill

- **social-content** is generating a post → use this to find the right photo/video
- **campaign-planner** needs visual assets → use this to check what's available
- **creative-designer** needs a hero image → use this to find top-scoring assets
- **schedule-announcer** needs class imagery → query by scene_type and subject
- Any time someone says "what photos do we have of..." or "find me a video for..."

## Keeping the Index Fresh

The indexer pipeline lives at `Media Library/_pipeline/`. To re-index new media:
```bash
cd "/Volumes/Ajeo/Projects/Different Breed/Media Library/_pipeline"
bash run.sh                # index any new photos/videos
bash run.sh --reanalyze    # re-process previously skipped videos (720p downscale)
```
Dashboard at http://localhost:8888 during runs.
