# Video & Photo Intelligence Guide

> Reference doc for processing, analyzing, classifying, and selecting media assets.
> Use this when you need to work with raw photos/videos from the gym or any client.

## LIVE INDEX (use this first!)

The media library has been fully indexed by an automated Gemini 2.0 Flash pipeline. **Before doing any manual analysis, check the index:**

| File | Location | Records |
|------|----------|---------|
| `_index/photos.json` | Media Library root | 2,325 photos — fully scored and tagged |
| `_index/videos.json` | Media Library root | 940 videos — 310 fully analyzed, 630 with metadata |
| `_index/summary.json` | Media Library root | Run stats and totals |

**Query instructions and field definitions:** See `skills/media-library.md`

**Re-indexing new media:** Run `bash _pipeline/run.sh` from the Media Library directory. Dashboard at http://localhost:8888.

The manual workflow below is still useful for **one-off processing** of fresh drops or assets not yet in the library.

---

## Overview: The Manual Media Intelligence Flow (for fresh/unindexed assets)

```
Raw media (HEIC/JPG/MOV/MP4) arrives
    ↓
Step 1: Ingest & Convert (HEIC → JPEG, HDR → SDR)
    ↓
Step 2: Analyze (vision model describes each asset)
    ↓
Step 3: Classify & Score (category, quality 1-10, usability)
    ↓
Step 4: Manifest (structured JSON for agent-friendly selection)
    ↓
Step 5: Select (query manifest for best assets matching a brief)
    ↓
Step 6: Drop files into Media Library folder → run indexer to add to the live index
```

---

## Step 1: Ingest & Convert

### HEIC → JPEG (macOS `sips`)
Vision models can't read HEIC. Always convert first:

```bash
# Single file
sips -s format jpeg input.heic --out output.jpg

# Batch convert all HEIC in a directory
for f in *.heic *.HEIC; do
  [ -f "$f" ] && sips -s format jpeg "$f" --out "${f%.*}.jpg"
done
```

### Video: Check codec & resolution
```bash
# Get video info
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4 | jq '.streams[] | {codec_name, width, height, duration, bit_rate}'
```

### HDR → SDR (if needed)
Some iPhone videos are HEVC with HDR HLG. For processing:
```bash
# Simple tonemap (works on most ffmpeg builds)
ffmpeg -i input.mov -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709:t=bt709:m=bt709,tonemap=hable,format=yuv420p" -c:v libx264 -crf 18 output.mp4
```
**Note:** Mac mini ffmpeg may not have `zscale` — check with `ffmpeg -filters | grep zscale`. If unavailable, use the MacBook or skip tonemap (most vision models handle HDR fine).

---

## Step 2: Analyze with Vision

### Option A: Gemini via CLI (preferred for batch)
```bash
# Analyze a single image
gemini --prompt "Describe this image in detail. Include: what's happening, who's visible, the setting, lighting quality, composition quality, and any text/logos visible." --image /path/to/photo.jpg
```

### Option B: Extract video frames → analyze
```bash
# Extract 1 frame per second
ffmpeg -i input.mp4 -vf fps=1 /tmp/frames/frame_%04d.jpg

# Extract 1 frame every 5 seconds (for longer videos)
ffmpeg -i input.mp4 -vf fps=1/5 /tmp/frames/frame_%04d.jpg

# Extract a single frame at a specific timestamp
ffmpeg -i input.mp4 -ss 00:00:15 -frames:v 1 /tmp/frame_15s.jpg

# Extract keyframes only (fast, good coverage)
ffmpeg -i input.mp4 -vf "select=eq(pict_type\,I)" -vsync vfr /tmp/frames/keyframe_%04d.jpg
```

### Option C: Node.js vision analysis script
```javascript
import { readFileSync, writeFileSync, readdirSync } from 'fs';

// For each image, call vision model with classification prompt
const CLASSIFY_PROMPT = `Analyze this gym/fitness image. Return JSON:
{
  "description": "2-3 sentence description of what's happening",
  "category": "boxing|pilates|training|kids|group_class|b_roll|portrait|facility|event",
  "subjects": ["who's visible - coach name if recognizable, or 'members'"],
  "action": "what's happening (sparring, stretching, posing, etc.)",
  "energy_level": "high|medium|low",
  "composition_quality": 1-10,
  "lighting_quality": 1-10,
  "usability_score": 1-10,
  "usability_notes": "why this score - blur, framing, expression issues",
  "best_for": ["reel_thumbnail", "carousel", "story", "website_hero", "quote_card_bg"],
  "text_visible": "any overlay text or signage",
  "equipment_visible": ["heavy_bag", "ring", "reformer", "dumbbells", etc.]
}`;
```

---

## Step 3: Classification Categories

### Photo Categories
| Category | Description | Example |
|----------|-------------|---------|
| `boxing` | Boxing training, sparring, bag work | Members hitting pads |
| `pilates` | Reformer, mat, Core Control classes | Class on reformers |
| `training` | General fitness, TRX, circuit, HIIT | Members doing burpees |
| `kids` | Kids Boxing program, youth activities | Kids with gloves |
| `group_class` | Any class with multiple members | Full class shot |
| `b_roll` | Facility, atmosphere, detail shots | Equipment close-up |
| `portrait` | Individual coach/member spotlight | Coach posing |
| `facility` | Gym interior, exterior, signage | Front entrance |
| `event` | Special events, competitions, parties | Birthday celebration |

### Video Categories
| Category | Description |
|----------|-------------|
| `training_clip` | Members working out (best for reels) |
| `coaching_moment` | Coach instructing/correcting form |
| `sparring` | Ring work, pad work, partner drills |
| `class_overview` | Wide shot of full class in action |
| `b_roll` | Atmosphere, transitions, detail shots |
| `testimonial` | Member speaking to camera |
| `promo` | Edited/branded content |

### Quality Scoring (1-10)
- **9-10:** Hero content. Perfect composition, great action, sharp, well-lit. Use for website, key posts.
- **7-8:** Strong content. Minor issues but very usable. Great for reels, carousels, stories.
- **5-6:** Decent. Usable for stories, background, or with cropping/editing.
- **3-4:** Marginal. Blur, bad angle, poor lighting. Only if nothing else available.
- **1-2:** Unusable. Delete-tier.

---

## Step 4: Build a Manifest

### Photo Manifest (photos.jsonl)
One JSON object per line:
```jsonl
{"file":"IMG_7113.jpg","path":"/Volumes/Ajeo/Projects/Different Breed/Media Library/2026-03/IMG_7113.jpg","category":"boxing","subjects":["members"],"action":"sparring in ring","quality":9,"best_for":["carousel","reel_thumbnail"],"date":"2026-03-18","analyzed":"2026-03-20T02:30:00Z"}
{"file":"IMG_7253.jpg","path":"/Volumes/Ajeo/Projects/Different Breed/Media Library/2026-03/IMG_7253.jpg","category":"boxing","subjects":["members"],"action":"heavy bag work","quality":8,"best_for":["story","carousel"],"date":"2026-03-18","analyzed":"2026-03-20T02:30:00Z"}
```

### Video Manifest (_manifest.json)
```json
[
  {
    "file": "IMG_4901.MOV",
    "path": "/path/to/file",
    "duration_s": 62,
    "resolution": "3840x2160",
    "codec": "hevc",
    "category": "boxing",
    "subjects": ["members", "Coach Dredd"],
    "action": "sparring session with corrections",
    "energy": "high",
    "quality": 9,
    "best_for": ["reel", "highlight"],
    "highlights": [
      {"ts": "0:05-0:12", "desc": "Clean combo on heavy bag"},
      {"ts": "0:30-0:38", "desc": "Coach correcting stance"}
    ],
    "date": "2026-03-24",
    "analyzed": "2026-03-26T14:00:00Z"
  }
]
```

---

## Step 5: Select Assets for a Brief

### Query pattern: "I need 5 boxing action shots for a carousel"
```javascript
import { readFileSync } from 'fs';

const manifest = readFileSync('photos.jsonl', 'utf8')
  .trim().split('\n')
  .map(line => JSON.parse(line));

// Filter and sort
const picks = manifest
  .filter(p => p.category === 'boxing' && p.quality >= 7)
  .filter(p => p.best_for.includes('carousel'))
  .sort((a, b) => b.quality - a.quality)
  .slice(0, 5);

console.log(picks.map(p => `${p.file} (${p.quality}/10) — ${p.action}`));
```

### Query pattern: "Find me a hero clip for a reel about boxing"
```javascript
const videos = JSON.parse(readFileSync('_manifest.json', 'utf8'));

const heroClip = videos
  .filter(v => v.category === 'boxing' && v.quality >= 8)
  .filter(v => v.best_for.includes('reel'))
  .sort((a, b) => b.quality - a.quality)[0];

console.log(`Best: ${heroClip.file} (${heroClip.duration_s}s) — ${heroClip.action}`);
console.log('Highlights:', heroClip.highlights);
```

---

## Video Processing Recipes

### Extract a clip from a longer video
```bash
# Cut from 0:05 to 0:12 without re-encoding (fast)
ffmpeg -ss 5 -i input.mp4 -t 7 -c copy clip.mp4

# Cut with re-encode (ensures clean cuts + enables filters)
ffmpeg -ss 5 -i input.mp4 -t 7 -c:v libx264 -crf 18 -c:a aac clip.mp4
```

### Create a 9:16 vertical crop from landscape
```bash
ffmpeg -i input.mp4 -vf "crop=ih*9/16:ih" -c:v libx264 -crf 18 vertical.mp4
```

### Downscale 4K to 1080p (for faster processing)
```bash
ffmpeg -i input_4k.mp4 -vf "scale=1920:1080" -c:v libx264 -crf 20 output_1080p.mp4

# Downscale to 540p (for vision analysis — saves tokens)
ffmpeg -i input.mp4 -vf "scale=960:540" -c:v libx264 -crf 23 output_540p.mp4
```

### Concatenate clips into a reel
```bash
# Create a file list
echo "file 'clip1.mp4'" > list.txt
echo "file 'clip2.mp4'" >> list.txt
echo "file 'clip3.mp4'" >> list.txt

# Concat (clips must have same codec/resolution)
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
```

### Add music under a video
```bash
# Mix music at 15% volume under original audio
ffmpeg -i video.mp4 -i music.mp3 \
  -filter_complex "[1:a]volume=0.15[music];[0:a][music]amix=inputs=2:duration=first[out]" \
  -map 0:v -map "[out]" -c:v copy -c:a aac output.mp4
```

### Duck music during voiceover
```bash
# Music at 100% normally, drops to 15% when VO plays
ffmpeg -i video.mp4 -i music.mp3 -i voiceover.mp3 \
  -filter_complex "[1:a]volume=0.15[ducked];[2:a][ducked]amix=inputs=2[out]" \
  -map 0:v -map "[out]" -c:v copy -c:a aac output.mp4
```

---

## Caption & Voiceover Pipeline

### Generate voiceover with ElevenLabs
```bash
# DB default voice: qVpGLzi5EhjW3WGVhOa9
# Using the sag CLI:
sag --voice qVpGLzi5EhjW3WGVhOa9 "Your voiceover text here" --out vo.mp3
```

### Transcribe for word-level captions (Whisper)
**ALWAYS use Whisper for timing. Never manually estimate.**
```bash
/opt/homebrew/bin/whisper --model tiny --word_timestamps True --output_format json vo.mp3
# Output: vo.json with word-level timestamps
```

### Whisper output format (word timestamps)
```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": " Every Tuesday at 6:15",
      "words": [
        {"word": "Every", "start": 0.0, "end": 0.3},
        {"word": "Tuesday", "start": 0.35, "end": 0.7},
        {"word": "at", "start": 0.75, "end": 0.85},
        {"word": "6:15", "start": 0.9, "end": 1.2}
      ]
    }
  ]
}
```

---

## Photo Production Pipelines

### Carousel: HTML/CSS → Playwright Screenshot
```bash
# 1. Create HTML file (1080x1080 design)
# 2. Screenshot at 2x scale
npx playwright screenshot --viewport-size="1080,1080" --device-scale-factor=2 slide.html slide.png

# Result: 2160x2160 PNG
```

### Flyer: HTML → Screenshot → Upscale
```bash
# 1. HTML at 8.5x11 proportions (2550x3300 at 300 DPI)
npx playwright screenshot --viewport-size="2550,3300" design.html flyer.png

# 2. Upscale to 4K via Nano Banana Pro (preserves text/layout)
# (Use image generation model with edit mode)
```

---

## DB-Specific Media Locations

| Location | What | Access |
|----------|------|--------|
| `/Volumes/Ajeo/Projects/Different Breed/Media Library/` | Photo archive (~2,000 images) | Ajeo SMB share (Mac mini) |
| `~/Downloads/` (Mac mini) | Joey's fresh media drops | Direct filesystem |
| `/Users/joestevens/Projects/` (MacBook) | Active editing projects | SSH `joestevens@100.68.252.34` |
| Google Drive `PostSchedule/` | Schedule automation output | Google Drive on Mac mini |

## DB Coach Recognition

When analyzing media, match these coaches:
- **Don Stevens** — Owner, tall, frequently in DB branded gear
- **Coach Dredd** — Boxing coach
- **Coach Carlos** — Full Body Igniter / circuit training
- **Glenda** (@gfitbyglenda) — Kids Boxing, often with young fighters
- **Joe** (@joebutta25) — Kids Boxing
- **Ali** (@sun_of_yah) — Kids Boxing
- **CJ** (@cjbean122) — Pilates (Core Control)
- **Nessa** (@ohsonessaa) — Pilates (Core Control)

## Videographer Credit Rule
Any content using footage from **@veteranwithacamera** MUST credit him in the post. Check with Joey if unsure about footage source.

---

## Full Processing Example: "Joey drops 15 files"

```bash
#!/bin/bash
# 1. Convert HEIC to JPEG
for f in *.heic *.HEIC; do
  [ -f "$f" ] && sips -s format jpeg "$f" --out "${f%.*}.jpg"
done

# 2. Separate photos and videos
mkdir -p photos videos
mv *.jpg *.jpeg *.JPG *.JPEG photos/ 2>/dev/null
mv *.mp4 *.mov *.MOV *.MP4 videos/ 2>/dev/null

# 3. Get video info
for f in videos/*; do
  echo "=== $(basename $f) ==="
  ffprobe -v quiet -print_format json -show_format -show_streams "$f" | \
    jq '{file: .format.filename, duration: .format.duration, size_mb: (.format.size|tonumber/1048576|round), streams: [.streams[]|{codec: .codec_name, res: "\(.width)x\(.height)"}]}'
done

# 4. Extract 1 frame per video for vision analysis
mkdir -p /tmp/analysis-frames
for f in videos/*; do
  name=$(basename "$f" | sed 's/\.[^.]*$//')
  ffmpeg -i "$f" -ss 5 -frames:v 1 "/tmp/analysis-frames/${name}_sample.jpg" -y 2>/dev/null
done

# 5. Now analyze all photos + sample frames with vision model
# 6. Build manifest JSON
# 7. Report to Joey: "Here's what you've got: X boxing clips, Y training, Z photos..."
```

---

## Secrets & API Keys

All keys live in `/Users/noahajeo/.openclaw/workspace/secrets.env`:
```bash
source /Users/noahajeo/.openclaw/workspace/secrets.env
# $UPLOAD_POST_API_KEY — for posting (see UPLOAD-POST-GUIDE.md)
# ElevenLabs voice for DB: qVpGLzi5EhjW3WGVhOa9
```

## Related Docs
- `UPLOAD-POST-GUIDE.md` — How to post to social media
- `brand-context/visual-style-guide.md` — DB brand colors/fonts
- `brand-context/coaches-and-staff.md` — Full coach roster + handles
- `brand-context/posting-rules.md` — Platform-specific rules
