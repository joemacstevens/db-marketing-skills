# Flyer v2.1 — Design Notes

## Goal
Polish v2 into something that reads as a **printed flyer**, not a webpage.

## What changed from v2

### Structure: 3 visual zones (was ~6 small sections)
- **Zone 1 — Hero + Headline** (~48%): Full-bleed studio photo with long cream gradient dissolve. Headline emerges from the photo bottom. No separate photo/headline sections.
- **Zone 2 — Info** (~37%): Body copy, pricing, schedule. Vertically centered with flexbox. Generous whitespace between elements.
- **Zone 3 — CTA + Footer** (~15%): Single "Book Your Spot" CTA, contact, brand sign-off.

### Removed web artifacts
- **Vibe strip gone**: The `Women Only · Beginner Friendly · Private Studio · Small Groups` chip strip read like website tags. Those descriptors now live inside the body copy sentence instead.
- **Triple-diamond dividers gone**: Replaced with single thin rules (52px and 36px). Quieter, more print-appropriate.
- **Corner diamond ornaments gone**: The `◆` pseudo-elements on the frame rule have been removed. The frame is now a single restrained 0.5px rule.
- **Dot separator simplified**: Schedule uses a middot (`·`) instead of a filled circle (`●`).

### Stronger headline
- Font size: 52px → 68px
- Line-height tightened: 1.02 → 0.94
- More vertical space below (14px margin) before the subhead breathes

### Whitespace improvements
- Info zone uses `flex: 1` with `justify-content: center` — content floats in the vertical middle of whatever space is available
- Wider gap between pricing columns (margin 0 8px → 0 24px)
- Body copy margin-bottom: 22px → 30px
- Zone transitions use simple thin rules instead of decorative dividers

### Brand footer simplified
- Brand name flanked by two short rules (not standalone text)
- Smaller type (7px tracked Montserrat) — unobtrusive sign-off
- Grip socks note at 9px italic — present but quiet

## What was preserved
- Real studio photo (`Studio/Image 1.jpg`)
- All required copy per COPY-BRIEF.md:
  - "Women-Only Pilates" headline
  - Package pricing: 5/$100, 10/$180 with per-class breakdown
  - Class schedule: Sunday 8 am, Thursday 8 pm
  - CTA: "Book Your Spot"
  - Contact: phone + address
  - "Grip socks required — available for purchase"
- Print specs: 8.5×11 trim, 0.125in bleed, `@page` rule, `@media print` overrides
- Trim marks on screen, hidden in print
- Draft watermark on screen, hidden in print
- All brand colors from `brandkit/colors.json`
- Typography from `brandkit/type-system.md` (Cormorant Garamond / Montserrat / Lora)

## Export notes
- **Print**: Browser Print → PDF, page size 8.75 × 11.25 in, margins none
- **Digital**: Screenshot at 2× for ~1632 × 2112 px PNG
- Frame rule and trim marks give visual confirmation of safe area
