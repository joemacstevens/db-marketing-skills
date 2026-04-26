# Journal — Pilates by Menukhah
## 2026-02-25
- Project initialized.

## 2026-02-25 (Brand kit + Claude setup)
- Added mini brand kit v1 with approved objectives.
- Added CLAUDE.md with exact flyer scope and constraints.
- Confirmed no image-swap requirement for this phase.
- Established two-target output: package flyer remake + Chinese auction flyer.

## 2026-02-25 (Full brand kit build)
- Built operational brand kit files from seed flyers + studio images.
- Added palette analysis + production color tokens (`brandkit/colors.json`).
- Added type system with exact-match caveat + high-confidence alternatives.
- Added font source links and refreshed CLAUDE references.

## 2026-02-25 (Women-Only Packages flyer v1 — rewrite)
- Rewrote `drafts/flyer-women-only-packages-v1.md` — full spec with final copy blocks, detailed ASCII layout diagram, color/type mapping tables, print specifications (5x7 trim, 0.125" bleed, CMYK/sRGB export notes).
- Rewrote `drafts/flyer-women-only-packages-v1.html` — complete visual mockup matching seed flyer aesthetic:
  - Decorative double-rule border with bronze corner diamond ornaments
  - Headline zone: Cormorant Garamond 600, italic Lora subhead, triple-diamond divider
  - Hero studio photo zone: bronze-framed placeholder (aspect 16:10), ~38% of flyer height
  - 2x2 diamond-bullet vibe grid (Women Only / Beginner Friendly / Private Studio / Small Groups)
  - Pricing card on surface ivory with per-class cost breakdown ($100/5, $180/10)
  - Schedule block with diamond-flanked label
  - Full brand footer: tracked brand name, tagline, contact info, CTA pill button, QR placeholder, grip socks italic note
- All CSS custom properties sourced from `brandkit/colors.json`. Typography follows `brandkit/type-system.md`.
- **Why rewrite:** Previous v1 used flat gradient hero and app-card layout that didn't match the seed flyers' print aesthetic (framed photo, ornamental borders, diamond motifs). New version closely mirrors the established brand look.
- **Next actions:**
  - Swap hero placeholder for actual studio photo
  - Generate and embed QR code (confirm booking URL first)
  - Browser review for visual balance and spacing
  - Export print PDF (5x7 w/ bleed) and digital PNG (1500x2100)
  - Begin Draft Flyer #2 (Chinese auction)

## 2026-02-25 (Women-Only Packages flyer v1 — polish pass)
- **What changed:**
  - Enhanced `drafts/flyer-women-only-packages-v1.html`:
    - Added crosshatch background texture on outer frame and footer to match seed flyers' subtle diagonal pattern
    - Added brand eyebrow ("Pilates by Menukhah") above headline in tracked Montserrat
    - Tightened spacing and font sizes throughout for better 5:7 ratio density
    - Improved hero placeholder gradients (warmer, more depth, closer to actual studio look)
    - Refined hero aspect ratio to 16:9.5 for tighter studio framing
  - Updated `drafts/flyer-women-only-packages-v1.md`:
    - Added brand eyebrow to copy blocks
    - Refined layout diagram to match HTML structure
    - Tightened typography mapping with exact sizes
- **Why:** Bringing HTML closer to the seed flyers' visual texture and density. First pass was clean but lacked the crosshatch background and proper hierarchy layering.
- **Next actions:**
  - Open HTML in browser, screenshot, compare against seed flyers side by side
  - Swap hero gradient for actual studio photo
  - Confirm QR booking URL target
  - Export to print PDF and digital PNG
  - Begin Draft Flyer #2 (Chinese auction)

## 2026-02-25 (Women-Only Packages flyer — PRINT-FIRST v2)
- **What changed:**
  - Created `drafts/flyer-women-only-packages-v2.html` — complete redesign as print-first composition:
    - Target: 8.5 × 11 in, 0.125 in bleed, 0.25 in safe margins
    - Real studio photo (`Studio/Image 1.jpg`) as full-bleed hero (~42% of page), no placeholders
    - Headline overlaid on hero bottom via cream gradient fade (not a separate section)
    - Removed all web patterns: no card shadows, no rounded cards, no hover states, no button-style CTA
    - Vibe points collapsed to single horizontal strip (not 2×2 grid)
    - Pricing uses pure typographic treatment with center divider rule (no card background)
    - CTA is tracked uppercase text, not a pill button
    - Thin decorative frame rule with bronze corner diamonds — classic print framing
    - `@page` rule and `@media print` overrides for direct browser-to-PDF export
    - Trim marks shown as dashed overlay on screen, hidden in print
  - Created `drafts/flyer-women-only-packages-v2-print-spec.md`:
    - Full dimensional specs (trim, bleed, safe area)
    - CMYK color conversions for all brand tokens
    - Typography table with point sizes and tracking values
    - Layout zone breakdown (11 zones top to bottom)
    - Hero photo crop and resolution requirements
    - Export checklists for: professional print, quick/digital print, digital share
    - Final QA checklist against COPY-BRIEF.md requirements
- **Why:** v1 had a web/app-card aesthetic (rounded cards, box shadows, pill buttons, gradient placeholder). v2 is designed as a print flyer first — single composed surface, full-bleed photography, typographic hierarchy, thin rule framing.
- **Next actions:**
  - Open v2 HTML in browser, verify photo loads and layout proportions
  - Compare against seed flyers for brand alignment
  - Export test PDF via browser print (8.75 × 11.25 with bleed)
  - Confirm hero photo resolution is sufficient for 300 DPI at 8.5 in width
  - Begin Draft Flyer #2 (Chinese auction)

## 2026-02-25 (v2 print polish pass)
- **What changed:**
  - Added `print-color-adjust: exact` / `-webkit-print-color-adjust: exact` to `.page` so backgrounds and hero gradient render in browser PDF export
  - Consolidated duplicate `@media print` blocks into one — now handles box-shadow removal, page sizing to `8.75in × 11.25in`, trim mark hiding, and watermark hiding in a single rule
- **Why:** Ensures browser Print → PDF produces correct output without missing backgrounds or duplicate style overrides.
- **Next actions:**
  - Open v2 HTML in browser, verify photo + layout at actual size
  - Export test PDF via Print dialog (8.75 × 11.25)
  - Verify `Studio/Image 1.jpg` native resolution ≥ 2550 px wide for 300 DPI
  - Begin Draft Flyer #2 (Chinese auction)

## 2026-02-25 (v2 print-first revision — layout overhaul)
- **What changed:**
  - Rewrote `drafts/flyer-women-only-packages-v2.html` with true print-first structure:
    - Switched from pixel-based (`--page-w: 816px`) to inch-based sizing (`width: 8.75in`) — native print units throughout
    - Enlarged hero photo from 445px to 5.3in (~47% of page) for stronger visual impact
    - Moved headline overlay to fixed position (top: 3.65in) for precise print placement
    - Consolidated pricing + schedule into a single 3-cell info strip with thin rule borders — replaces separate "Pricing Section" and "Schedule" with independent section labels and dividers
    - Removed bottom diamond divider — fewer visual sections, cleaner scan
    - `print-color-adjust` moved to `body` for broader browser support
    - Trim guide as separate `.trim-guide` div (easier to toggle) instead of `::before` pseudo-element
    - Frame corner diamonds moved inside `.frame` as child spans
  - Updated `drafts/flyer-women-only-packages-v2-print-spec.md`:
    - Layout zones revised from 11 to 9 (matches consolidated structure)
    - Typography table updated with exact pt sizes from revised CSS
    - Hero spec updated: 5.3in height, 3in gradient fade
- **Why:** Previous v2 still had web-like section stacking (separate pricing block, separate schedule block, multiple dividers). The revised version reads as a single composed print surface with one consolidated info band — closer to professional print flyer convention.
- **Next action:**
  - Open v2 in browser and verify proportions at 100%
  - Export test PDF (8.75 × 11.25 in, no scaling)
  - Begin Chinese auction flyer (Flyer B)

## 2026-02-25 (Women-Only Packages flyer — v2.1 polish)
- **What changed:**
  - Created `drafts/flyer-women-only-packages-v2.1.html` — polish pass on v2 to read as a true printed flyer:
    - Consolidated layout from ~6 small sections into **3 clear visual zones**: Hero+Headline (48%), Info (37%), CTA+Footer (15%)
    - Removed web artifacts: vibe-strip chips, triple-diamond dividers, corner diamond ornaments, filled-circle dot separators
    - Vibe descriptors (Women Only, Beginner Friendly, etc.) folded into body copy sentence instead of tag-like strip
    - Headline scaled up: 52px → 68px, tighter line-height (0.94) for stronger print impact
    - Hero gradient lengthened to 70% for smoother photo-to-cream dissolve
    - Info zone vertically centered via flexbox for natural whitespace distribution
    - Wider pricing column gap (8px → 24px), wider body copy bottom margin (22px → 30px)
    - Dividers simplified to single thin rules (52px, 36px) — no decorative gems
    - Frame rule softened: 0.75px solid → 0.5px at 30% opacity
    - Brand footer uses flanked-rule pattern for quiet sign-off
  - Rewrote `drafts/flyer-women-only-packages-v2.1-notes.md` with full design rationale, zone breakdown, and export notes
  - All required copy preserved per COPY-BRIEF.md; print specs (@page, @media print, trim marks) retained
- **Why:** v2 was structurally print-first but still had web-card visual habits (chip strip, ornamental dividers, small headline). v2.1 strips those back to three bold zones with real whitespace and typographic hierarchy that reads like a printed piece.
- **Next actions:**
  - Open v2.1 in browser, compare side-by-side with v2
  - Verify photo loads and gradient transition looks clean
  - Export test PDF (8.75 × 11.25)
  - Begin Draft Flyer #2 (Chinese auction)

## 2026-03-06 (Women-Only Packages flyer — v12 pricing update)
- **What changed:**
  - Created `drafts/build-flyer-v12.py` — updated pricing per Menukhah's request (Mar 5 iMessage):
    - Single Class: $25
    - Intro 5-Pack: $100
    - 5-Class Pack: $115
    - 10-Class Pack: $180
  - Photo band reduced from 36% to 33% to accommodate 4 pricing rows (was 2)
  - Font sizes and spacing slightly tightened in bottom section for clean fit
  - Generated `flyer-women-only-packages-v12.pdf` + `.png`
  - Updated `COPY-BRIEF.md` with new 4-tier pricing structure
- **Why:** Menukhah clarified that $100/5 is intro pricing only; regular 5-pack is $115, and single drop-in class is $25. Needed all four tiers visible on flyer.
- **Next actions:**
  - Send v12 to Menukhah for review
  - Apply same pricing update to Chinese auction flyer when created
