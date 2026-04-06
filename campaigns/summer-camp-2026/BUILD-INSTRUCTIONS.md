# Summer Camp 2026 — Build Instructions for Claude Code

## What Needs to Be Built

### 1. Print Flyers (HTML/CSS → Playwright screenshot → PDF)

**Full Size (8.5x11 portrait — 2550x3300 at 300 DPI)**
- File: `output/flyer-full.html`
- Screenshot: `output/flyer-full.png`
- Design brief: See CAMPAIGN-PLAN.md → Print Materials → Section 1

**Half Size (5.5x4.25 — 1650x1275 at 300 DPI)**
- File: `output/flyer-half.html`
- Screenshot: `output/flyer-half.png`
- Condensed version — same vibe, tighter layout, key info only
- Must include: camp name, ages, dates, pricing summary (full camp + weekly), URL/QR, DB logo

**Both flyers should:**
- Use DB brand colors: black #0E0E0E, red #C4161C, white #FFFFFF, charcoal #1C1C1C
- Use bold sans-serif fonts (Oswald or Bebas Neue for headlines, Inter for body)
- Feel like a fight poster meets elite sports academy — NOT a generic kids camp flyer
- Include a hero photo from last year's camp
- Include QR code or URL for the landing page

**Photo assets available at:**
- `/Volumes/Ajeo/Projects/Different Breed/Media Library/2025/Gym_7_7_25/Photos/`
- `/Volumes/Ajeo/Projects/Different Breed/Media Library/2025/Gym_7_9_25/`
- `/Volumes/Ajeo/Projects/Different Breed/Media Library/2025/Gym_7_18_25/Photos/`

**Screenshot commands:**
```bash
# Full size flyer (8.5x11 at 300 DPI)
npx playwright screenshot --viewport-size="2550,3300" output/flyer-full.html output/flyer-full.png

# Half size flyer
npx playwright screenshot --viewport-size="1650,1275" output/flyer-half.html output/flyer-half.png
```

### 2. Social Squares (1080x1080)

**Announcement square:**
- File: `output/social-announcement.html`
- "DB SUMMER CAMP IS BACK" — bold, dark, camp photo background

**Pricing square:**
- File: `output/social-pricing.html`
- Clean pricing breakdown with early bird callout

```bash
npx playwright screenshot --viewport-size="1080,1080" --device-scale-factor=2 output/social-announcement.html output/social-announcement.png
```

### 3. Landing Page

**File:** `landing-page/index.html` (self-contained, single HTML file with inline CSS/JS)

**The landing page should include:**
- Hero section with camp photos + "DB SUMMER CAMP 2026" headline
- What's included (activities list with icons or bold formatting)
- Pricing table (all tiers, early bird deadline highlighted)
- Photo gallery section (grid of last year's camp photos)
- "Why Different Breed?" section — not babysitting, athlete development
- Registration CTA (link to MindBody or contact form)
- Coach info / trust signals
- Mobile-responsive
- DB brand styling throughout

**Brand assets:**
- Logo files: `/Volumes/Ajeo/Projects/Different Breed/Brand Kit/Different-Breed-Final-Logos/`
- Colors: See `brand-context/visual-style-guide.md`
- Fonts: Oswald (Google Fonts) for headlines, Inter for body

**Important:** This is a standalone page, not part of the main DB website. It should work as a single HTML file that can be hosted anywhere (Vercel, Netlify, or even just opened in a browser).

## Build Order (Priority)
1. **Full flyer** (8.5x11) — Don wants print materials first
2. **Half flyer** (5.5x4.25) — same session, derive from full
3. **Social squares** — needed for Phase 1 posts this week
4. **Landing page** — needed before social campaign ramps up

## Reference Files
- `CAMPAIGN-PLAN.md` — full copy, messaging, social calendar
- `brand-context/visual-style-guide.md` — colors, fonts, photo direction
- `brand-context/voice-and-tone.md` — how DB sounds
- `brand-context/summer-camp-2026.md` — all camp details and pricing
