# Skill: Creative Designer

## Purpose
Generate visual marketing assets for Different Breed using HTML/CSS → screenshot pipeline.

## Before You Start
Read these brand context files:
- `brand-context/visual-style-guide.md`
- `brand-context/voice-and-tone.md`

## Production Pipeline
1. **Design** in HTML/CSS (self-contained, single file)
2. **Screenshot** via Playwright at target resolution (1080x1080 at 2x scale = 2160x2160)
3. **Upscale** via Nano Banana Pro `--resolution 4K` for production quality
4. **Export** as PNG to `output/` folder

## Asset Types

### Instagram Carousel (Editorial Template)
- **Style:** Bold magazine-cover — dark bg, condensed uppercase, red accent tags
- **Layout:** Photo fills top ~60%, text/info bottom ~40%
- **Typography:** Oswald condensed uppercase for headlines
- **Footer:** "EVOLVE INTO GREATNESS" bar
- **Size:** 1080x1080 per slide (2x for retina)
- **Max slides:** 10

### Story Graphics (1080x1920)
- Schedule announcements
- Event promos
- Quick motivational quotes
- Behind-the-scenes teasers

### Quote Cards (1080x1080)
- Don quotes or motivational lines
- Dark background, bold typography
- Red accent elements
- Minimal — text is the hero

### Announcement Graphics
- New class, schedule change, event
- Clear hierarchy: WHAT → WHEN → WHERE → CTA
- DB red for emphasis on key info

## Color Usage in Designs
```css
:root {
  --db-black: #0E0E0E;
  --db-charcoal: #1C1C1C;
  --db-red: #C4161C;
  --db-white: #FFFFFF;
  --db-gray: #8E8E8E;
}
```

## Typography in Designs
```css
/* Headlines */
font-family: 'Oswald', 'NORD', sans-serif;
text-transform: uppercase;
font-weight: 700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 400;
```

## HTML Template Skeleton
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1080px;
      background: #0E0E0E;
      color: #FFFFFF;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }
    /* Add design-specific styles */
  </style>
</head>
<body>
  <!-- Design content -->
</body>
</html>
```

## Screenshot Command
```bash
# Using Playwright
npx playwright screenshot --viewport-size="1080,1080" --device-scale-factor=2 input.html output.png

# Upscale for production
npx nano-banana-pro --resolution 4K --edit output.png output-4k.png
```

## Quality Checklist
- [ ] Uses DB color palette only?
- [ ] Typography matches brand (Oswald headlines, Inter body)?
- [ ] Red used sparingly for accent/emphasis?
- [ ] "EVOLVE INTO GREATNESS" footer on carousels?
- [ ] Correct dimensions for target platform?
- [ ] Text readable at mobile size?
- [ ] Would look good next to DB's existing feed?
