# Skill: Schedule Announcer

## Purpose
Generate daily/weekly schedule content for Different Breed — stories, posts, and graphics showing what's coming up.

## Before You Start
Read these brand context files:
- `brand-context/schedule.md`
- `brand-context/coaches-and-staff.md`
- `brand-context/voice-and-tone.md`
- `brand-context/posting-rules.md`

## Content Types

### "Tomorrow's Classes" (Daily Story)
- Posted as Instagram/FB **Story** (not Reel)
- Shows tomorrow's class lineup
- Include: class name, time, coach
- DB visual style (dark bg, red accents)
- Published via Upload-Post as Story

### "This Week at DB" (Weekly Post)
- Overview of the week's full schedule
- Good for Sunday or Monday posting
- Can be carousel (one slide per day) or single graphic
- Include booking link for Pilates classes

### Schedule Change Alert
- When classes are cancelled, moved, or added
- Higher urgency — use 🚨 or ⚡ energy
- Clear: what changed, when, what to do instead

### Special Class Highlight
- When a specific class deserves extra promotion
- Deeper dive on what the class involves
- Coach spotlight element built in

## MindBody Integration
When available, query the MindBody API for live schedule data:
```
Site ID: 706438
Endpoint: /public/v6/class/classes
API Key env: MINDBODY_API_KEY_DBE
```

If API is unavailable, use the known schedule from `brand-context/schedule.md` as fallback.

## Output Format

### For Stories
```
### Story Graphic
[HTML/CSS design file — use creative-designer skill for production]

### Caption (optional, for story text)
[Short, punchy — schedule stories are mostly visual]
```

### For Posts
```
### Instagram Caption
[Full schedule with DB voice]

### Facebook Caption (≤255 chars)
[Condensed version]

### Visual Direction
[What the graphic should show]
```

## Quality Checklist
- [ ] All times accurate?
- [ ] Correct coaches listed for each class?
- [ ] Pilates booking link included where relevant?
- [ ] Posted as STORY (not Reel) for daily schedule?
- [ ] Both IG + FB versions?
