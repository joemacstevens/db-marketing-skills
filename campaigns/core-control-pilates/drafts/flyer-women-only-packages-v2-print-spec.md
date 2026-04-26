# Print Spec — Women-Only Pilates Flyer v2

Draft: `flyer-women-only-packages-v2.html`
Date: 2026-02-25 (revised)

---

## 1) Trim Size
- **8.5 × 11 inches** (US Letter, portrait)
- Equivalent: 612 × 792 pt | 215.9 × 279.4 mm

## 2) Bleed
- **0.125 in (3.175 mm) on all four sides**
- Total document with bleed: **8.75 × 11.25 in** (630 × 810 pt)
- Hero photo must extend to bleed edge on top, left, and right

## 3) Safe / Live Area
- **0.25 in (6.35 mm) inset from trim** on all sides
- Live area: **8.0 × 10.5 in** (576 × 756 pt)
- All text and critical content must stay within safe area
- Decorative frame rule sits 10 pt inside trim — acceptable if clipped slightly

## 4) Resolution
- **300 DPI minimum** for all raster elements
- Hero photo (`Studio/Image 1.jpg`): verify native resolution ≥ 2550 × 1335 px for full-bleed coverage at 8.5 in wide
- If upscaling needed, use bicubic sharper; avoid going below 250 DPI effective

## 5) Color Mode
- **CMYK** for offset / professional print
- **sRGB** acceptable for digital print (FedEx, Staples, etc.)
- Brand palette CMYK conversions:

| Token            | Hex       | CMYK (approx)          |
|------------------|-----------|------------------------|
| Background Cream | `#F0EEE6` | C:3 M:3 Y:7 K:1       |
| Charcoal Text    | `#1A1714` | C:60 M:58 Y:60 K:75   |
| Warm Taupe       | `#8B7768` | C:25 M:35 Y:40 K:25   |
| Bronze Accent    | `#A07050` | C:18 M:42 Y:58 K:14   |
| Cocoa Accent     | `#603020` | C:30 M:65 Y:75 K:50   |
| Divider          | `#D9D1C7` | C:8 M:10 Y:14 K:5     |

## 6) Typography

| Role       | Font                  | Weight   | Size (pt) | Tracking    |
|------------|-----------------------|----------|-----------|-------------|
| Eyebrow    | Montserrat            | 600      | 8.5       | +380        |
| Headline   | Cormorant Garamond    | 600      | 48        | +15         |
| Subhead    | Lora Italic           | 400      | 12.5      | +20         |
| Vibe strip | Montserrat            | 500      | 8.5       | +60         |
| Body       | Lora                  | 400      | 11.5      | normal      |
| Info label | Montserrat            | 600      | 6         | +250        |
| Pricing $  | Montserrat            | 700      | 22        | normal      |
| Price desc | Montserrat            | 500      | 9         | normal      |
| Sched day  | Montserrat            | 600      | 12        | normal      |
| Sched time | Lora                  | 400      | 10        | normal      |
| CTA        | Montserrat            | 700      | 11        | +200        |
| Contact    | Lora                  | 400      | 9.5       | normal      |
| Brand mark | Montserrat            | 600      | 7         | +320        |
| Foot note  | Lora Italic           | 400      | 8         | normal      |

## 7) Layout Zones (top to bottom)

1. **Hero photo** — full bleed top/left/right, ~47% of page height (5.3 in)
2. **Headline overlay** — positioned at 3.65 in from top, over cream gradient fade
3. **Triple-diamond divider** — transition to content
4. **Vibe strip** — single line, diamond-separated
5. **Body copy** — centered, max 4.8 in wide
6. **Info strip** — 3-cell consolidated band (pricing × 2 + schedule), bordered top/bottom
7. **CTA** — "Book Your Spot" in tracked caps (text only, no button)
8. **Contact** — phone + address on one line
9. **Brand footer** — brand mark + grip socks note

## 8) Hero Photo Spec
- Source: `Studio/Image 1.jpg`
- Crop: center-weighted, slight upward shift (object-position ~35% from top)
- The photo shows the full studio: mats, rings, LED mirrors, warm walls
- Bottom 3 in of the hero fades to cream via gradient overlay for headline readability
- Photo extends into bleed on all edges (top, left, right; bottom fades)

## 9) Decorative Elements
- **Frame rule**: 0.75 pt warm taupe, 10 pt inset from trim on all sides
- **Corner diamonds**: bronze ◆ at four corners of frame rule
- **Dividers**: 0.5 pt rules flanking diamond characters
- **Vibe separators**: open diamonds ◇ in bronze

## 10) Export Checklist

### For Professional Print (offset/digital press)
- [ ] Export as PDF/X-1a or PDF/X-4
- [ ] Color mode: CMYK
- [ ] Include 0.125 in bleed on all sides
- [ ] Embed all fonts (Cormorant Garamond, Montserrat, Lora)
- [ ] Flatten transparency if required by printer
- [ ] Verify hero photo ≥ 300 DPI at print size
- [ ] Add trim marks and registration marks
- [ ] Total ink coverage ≤ 300% (check dark areas of hero)
- [ ] Proof on-screen at 100% before sending

### For Quick / Digital Print (Staples, FedEx, etc.)
- [ ] Export as high-quality PDF (300 DPI, sRGB)
- [ ] Include bleed if printer supports it, otherwise trim to 8.5 × 11
- [ ] Select "heavy" or "cardstock" paper (80–100 lb cover recommended)
- [ ] Matte or satin finish preferred (matches brand aesthetic)

### For Digital Share (social, email)
- [ ] Export as PNG at 2550 × 3300 px (300 DPI equivalent)
- [ ] Or JPEG at 95% quality, sRGB
- [ ] Crop to trim (no bleed) for digital
- [ ] File size target: < 3 MB for email, < 5 MB for print-quality share

### Final QA
- [ ] Heading reads "Women-Only Pilates"
- [ ] Class times: Sunday 8 am / Thursday 8 pm
- [ ] Pricing: 5 Classes for $100 / 10 Classes for $180
- [ ] Phone: (201) 250-6576
- [ ] Address: The Core, 418 Cedar Lane, Teaneck, NJ
- [ ] Grip socks note present
- [ ] No placeholder text anywhere
- [ ] Studio photo displays correctly (no stretching, no pixelation)
- [ ] All text within safe area
- [ ] Frame rule and diamonds render cleanly
