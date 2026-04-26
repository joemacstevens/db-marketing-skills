# DB Reel — FCP Edit Guide Template

> Copy this file to `reference/briefs/YYYY-MM-DD-topic.md` and fill it in for every reel Joey cuts in Final Cut Pro.

**Date:** YYYY-MM-DD
**Topic:** (e.g. "Sparring Night — Coach Dred")
**Target length:** 30 / 45 seconds
**Pipeline:** Final Cut Pro (human edit)
**Editor:** Joey

## Footage source
- Raw clip folder: `raw-clips/YYYY-MM-DD-topic/`
- **Reminder:** COPY real files, DO NOT symlink from SMB. FCP beach-balls on symlinks.
- Source shoot: (date + location)
- Videographer: `@veteranwithacamera` — credit in caption.

## FCP project settings
- Resolution: **1080×1920** (vertical 9:16)
- FPS: **30**
- Codec: ProRes 422 (for editing), H.264 for export
- Audio: 48kHz stereo

## Clip order

| # | Clip | Timecode (in-out) | Duration | Notes |
|---|------|-------------------|----------|-------|
| 1 |      |                   |          | Establisher — wide gym shot |
| 2 |      |                   |          |  |
| 3 |      |                   |          |  |
| 4 |      |                   |          |  |
| 5 |      |                   |          | Closer / payoff |
| 6 |      |                   |          | End card (2s) |

**Total target:** ___ seconds

## Music
- Track: (file in `music/` or TBD)
- BPM: 
- Match cuts to beats: yes / no
- Duck under VO: ___%

## Voice over (if any)
- Script (VO): 
  > 
- Voice: ElevenLabs `qVpGLzi5EhjW3WGVhOa9` (DB default)
- Generated file: `voiceover/YYYY-MM-DD-topic.mp3`

## Captions
- Burned-in? Yes (always)
- Source: Whisper word-level timed (`scripts/whisper-captions.sh`)
- Style: Oswald Bold 700, white, red `#C4161C` on key words, drop shadow

## End card
- Logo: `brand/logos/Evolve-into-greatness-DB-white-red@3x.png`
- Duration: 2 seconds
- Transition in: fade 0.3s

## Post copy

### Instagram caption (no length limit)
```
[Hook line]

[Body — what's happening, who's in it]

Evolve Into Greatness.

@differentbreedsportsacademy @<coach> @veteranwithacamera

#DifferentBreed #EvolveIntoGreatness #<topic1> #<topic2> #<topic3>
```

### Facebook caption (≤255 chars — trim if needed)
```

```

### Tags (coaches in frame)
- 
- 

### Hashtags (5 max)
- #DifferentBreed
- #EvolveIntoGreatness
- 
- 
- 

## Review checklist (before sending to Joey for approval)
- [ ] 9:16 vertical, 30fps
- [ ] IG safe zones respected (top 220px, bottom 330px clear of critical text)
- [ ] Captions word-level timed
- [ ] End card present (2s hold)
- [ ] Music doesn't overpower VO (ducked to ~15%)
- [ ] Videographer credited if his footage is used
- [ ] Correct coaches tagged
- [ ] 5 or fewer hashtags
- [ ] FB caption ≤255 chars
- [ ] Photos/footage match the topic (no mixing)
- [ ] Exported to `output/<topic>-v1.mp4` in H.264

## Joey approval
- [ ] Preview sent to Joey
- [ ] Changes requested: 
- [ ] Approved to post

## Published
- [ ] Posted via `scripts/post-reel.mjs`
- IG URL: 
- FB URL: 
- Notes / lessons: 
