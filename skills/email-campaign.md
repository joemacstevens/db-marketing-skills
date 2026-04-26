# Skill: DB Email Campaign

**Last updated:** April 9, 2026
**Author:** Copy Agent (Ajeo)

---

## Overview

This skill documents how to build and deliver HTML email campaigns for Different Breed Sports Academy. It covers the full pipeline from brand context read-through to template generation and preview.

The send infrastructure lives on the Mac mini at:
```
~/.openclaw/workspace/db-email-kit
```

---

## Pipeline

```
1. Read Brand Context  →  2. Write Brief  →  3. Write Copy  →  4. Build Template  →  5. Generate Preview  →  6. Screenshot  →  7. Send (via db-email-kit on mini)
```

---

## Step 1 — Read Brand Context (Mandatory First Step)

Always read ALL context files before writing a single word of copy. This avoids pricing errors, voic mismatches, and compliance failures.

SSH to Joey's MacBook (the mini does NOT have these files):
```bash
ssh joestevens@100.68.252.34 "cat ~/Projects/brand-context/voice-and-tone.md"
ssh joestevens@100.68.252.34 "cat ~/Projects/brand-context/summer-camp-2026.md"
ssh joestevens@100.68.252.34 "cat ~/Projects/brand-context/visual-style-guide.md"
ssh joestevens@100.68.252.34 "cat ~/Projects/brand-context/content-examples.md"
ssh joestevens@100.68.252.34 "cat ~/Projects/brand-context/target-audiences.md"
ssh joestevens@100.68.252.34 "cat ~/Projects/brand-context/coaches-and-staff.md"
```

Also read the relevant campaign plan:
```bash
ssh joestevens@100.68.252.34 "cat ~/Projects/campaigns/[campaign-folder]/CAMPAIGN-PLAN.md"
```

---

## Step 2 — Write BRIEF.md

Save to the campaign's output folder on the MacBook. Include:
- Audience description
- Goal (what counts as success)
- Angle (the single most important hook)
- Subject line (primary + alternates)
- Preview text
- Brand rules checklist

---

## Step 3 — Write copy.md

Plain text version of the email. Easier to review and approve than HTML.
- Subject lines (labeled GO / ALTERNATE)
- Preview text
- Full email body with `{{kidName}}` / `{{parentEmail}}` placeholders
- Copy notes explaining decisions

---

## Step 4 — Build template.html

### Technical Requirements
- **Layout:** Table-based (not CSS grid/flex) — required for email client compatibility
- **Styles:** Inline only — no external stylesheets, no `<style>` blocks in body
- **Width:** Max 600px, centered, 100% on mobile
- **Media queries:** Place in `<head>` `<style>` block only (for clients that support them)
- **Images:** Avoid if possible for transactional emails; if used, always set `alt` text

### DB Brand Colors (from visual-style-guide.md — confirmed April 2026)
| Name | Hex | Use |
|------|-----|-----|
| Black (base) | `#0E0E0E` | Body background |
| Charcoal (surface) | `#1C1C1C` | Section alternates, cards |
| Red (accent/CTA) | `#C4161C` | CTA buttons, highlights, rules |
| White | `#FFFFFF` | Body text on dark |
| Gray (muted) | `#8E8E8E` | Secondary text, labels |

> ⚠️ **Do NOT use `#e01e2b`** — that is NOT the DB brand red. Correct value is `#C4161C`.
> ⚠️ **Do NOT use `#0a0a0a`** — background is `#0E0E0E`.

### Required Email Structure
```
1. Hidden preheader (display:none div, padded with zero-width joiners)
2. Wordmark header (DIFFERENT BREED / SPORTS ACADEMY)
3. Red rule divider
4. Hero section (hook headline + date/time subline)
5. Body copy section (charcoal bg)
6. Value bullets section (black bg)
7. CTA button (red, centered, personalized text)
8. Pricing section (charcoal bg, price table)
9. Signoff (black bg, "— Coach Don")
10. Red rule divider
11. Footer: "EVOLVE INTO GREATNESS" + address + unsubscribe
```

### Personalization Placeholders
- `{{kidName}}` — child's first name
- `{{parentEmail}}` — parent email for unsubscribe link

---

## Step 5 — Generate preview.html

Run on the MacBook via SSH:
```bash
ssh joestevens@100.68.252.34 'cd ~/Projects/campaigns/[folder]/email-[name] && node -e "const fs=require(\"fs\");let t=fs.readFileSync(\"template.html\",\"utf8\");t=t.replace(/{{kidName}}/g,\"Jordan\").replace(/{{parentEmail}}/g,\"parent@example.com\");fs.writeFileSync(\"preview.html\",t);console.log(\"preview.html written\");"'
```

---

## Step 6 — Screenshot (preview.png)

```bash
ssh joestevens@100.68.252.34 '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --disable-gpu --screenshot=/Users/joestevens/Projects/campaigns/[folder]/email-[name]/preview.png --window-size=700,1600 --hide-scrollbars --force-device-scale-factor=2 "file:///Users/joestevens/Projects/campaigns/[folder]/email-[name]/preview.html"'
```

Keychain errors in stderr are cosmetic — Chrome still renders and saves the PNG.

---

## Step 7 — Send (Separate Step)

Send infrastructure lives on the Mac mini at `~/.openclaw/workspace/db-email-kit`. Do NOT send from this repo. Always get explicit approval before sending any email.

---

## DB Email Brand Rules (Hard Rules — Never Break)

### Content Rules
1. **Hook required:** "Where Skills Turn to Confidence." must appear in every Summer Camp 2026 email
2. **Counter-narrative available:** "We don't babysit. We build." — use when positioning against generic camps
3. **Don's voice:** Gritty, direct, no corporate fluff. Short sentences. Coach energy. "No gimmicks. Just work."

### Pricing (Summer Camp 2026 — updated 4/7/26)
| Option | Price |
|--------|-------|
| Full Camp (9 weeks) | $3,015 |
| 4-Week Block | $1,460 ($365/wk) |
| Weekly | $420/wk |
| Single Day Drop-In | $110/day |

> ❌ **NEVER reference "$84/day multi-day"** — that tier was removed 4/7/26.

### Schedule Rules
- **Dates:** June 29 – August 28, 2026 | Mon-Fri 9am–3:15pm
- **Ages:** 11–16
- **Pizza Fridays only** — do NOT imply lunch is provided Mon-Thu. Parents pack lunch M-Th.

### Staff Rules
- **NEVER mention Coach Corey** — he is no longer at the gym. Any photo or reference to him must be removed.
- Always credit `@veteranwithacamera` on any content he shot (email footnote or caption)

### Photo Rules (for image-based emails)
- Action shots only — no posed/standing photos
- No photos featuring Coach Corey
- Source from 2025 media library on Ajeo NAS

---

## Output Folder Convention

```
campaigns/[campaign-name]/email-[audience-slug]/
  BRIEF.md
  copy.md
  template.html
  preview.html
  preview.png
```

Example:
```
campaigns/summer-camp-2026/email-returning-parents/
```

---

## Returning Camper Email — Reference

The first implementation of this pipeline was the Summer Camp 2026 returning-parents email (April 9, 2026). Files at:
```
~/Projects/campaigns/summer-camp-2026/email-returning-parents/
```

Subject line used: `Coach Don wants {kidName} back at DB Summer Camp`
