---
workflow: general-video
flow: automation
storyboard: no
format: 1920x1080 @ 30fps, muted (no audio track)
duration: 24.2s
---

# Blue Collar Boxing, Day 1: lobby TV cut

16:9 cut of BC 2026 Day 1 for the lobby TV (Fire Stick, plays muted on loop, renders 960x540). Built from Joey's
approved storyboard. No audio: Coach P's lines are burned in as captions (100px NORD Black Italic on an ink plate,
red COACH P chip). Move labels top-left say what the move is. Lands on an ink card: DB logo, DAY ONE DONE,
FIGHT NIGHT / NOVEMBER 22 (steel). No QR (registration status unconfirmed).

Portrait clips run three across (638px columns, 3px ink gutters, cover-cropped from 720x1280 so only ~54px of
height is lost). Landscape clips go full frame (lanczos 1280x720 -> 1920x1080 in the proxy). IMG_7839 was shot
sideways and is rotated with `transpose=2` in the proxy. All footage carries the MM grade-lite
(`build/grade-lite.json`: contrast 0.25, highlights -0.2, blacks -0.12, vibrance 0.22) plus a slow 1.0 -> 1.06 push.

## Shot table

Source: `/Users/joestevens/Projects/Different Breed/Blue Collar 2026/Day 1/`. Proxies: `bash build/make-proxies.sh`.

| Reel (s) | Section | Layout | Source window (source seconds) | On screen |
|---|---|---|---|---|
| 0.00-3.48 | OPEN | full | IMG_7836 0.4-3.88 (pad work under the Desire wall) | kicker BLUE COLLAR BOXING, DAY 1 (1 in red block) |
| 3.00-5.50 | ROPE col 1 | 3-up | IMG_7827 0.4-2.9 (rope under Discipline sign) | label JUMP ROPE |
| 5.50-8.30 | ROPE col 1 | 3-up | IMG_7826 27.0-29.8 (woman, close) | caption COACH P "…TWO, ONE, GO!" (3.35-7.95) |
| 3.00-8.30 | ROPE col 2 | 3-up | IMG_7830 40.4-45.7 (rope under Desire/Dedication wall) | |
| 3.00-5.70 | ROPE col 3 | 3-up | IMG_7826 22.2-24.9 (grey tank) | |
| 5.70-8.30 | ROPE col 3 | 3-up | IMG_7826 32.1-34.7 (orange hat) | |
| 8.00-12.16 | SHADOW | 3-up | IMG_7833 1.0-5.16 / IMG_7834 14.0-18.16 / IMG_7832 1.0-5.16 | label SHADOWBOXING; caption COACH P "LEFT, RIGHT, LEFT, RIGHT, / NONSTOP." (8.35-11.9) |
| 11.90-14.10 | PADS | full | IMG_7837 0.2-2.4 (braided man into orange-hat's pads) | label PAD WORK (12.25-16.6) |
| 13.80-17.00 | PADS | 3-up | IMG_7835 78.3-81.5 (grey hoodie, blue gloves) / 87.5-90.7 (blue beanie, pink gloves, body protector) / 99.5-102.7 (two women on pads) | |
| 16.80-20.40 | IRON | full | IMG_7839 12.9-16.5, rotated (group dumbbell press) | label DUMBBELL CURLS; caption COACH P "PUSH IT UP, PUSH IT UP." (17.2-19.95; spoken at src 13.4-15.8 = reel 17.3-19.7) |
| 19.95-24.20 | CARD | ink | DB logo | DAY ONE DONE (DONE red), FIGHT NIGHT ▪ NOVEMBER 22 |

Transitions: columns wipe up over the open (3.0), per-column cut flashes in the rope B phase (5.5 / 5.7), push left
rope -> shadow (8.0), blur whip shadow -> pads (11.84), pad columns drop in alternating top/bottom (13.8), red bar
wipe pads -> iron (16.5-17.1), ink fade up to the card (19.95). Card content fades out over the last 0.3s so the loop
back to the open is clean.

Caption text is limited to the verified Coach P lines. The IMG_7830 push-up call (~57-59s) is not captioned and the
optional PUSH-UPS beat was left out.

## Renders

- `renders/bc-day1-lobby-v1.mp4`: master, `npx --yes hyperframes@0.8.115 render --quality delivery --fps 30`
- `renders/bc-day1-lobby-v1-tv.mp4`: Fire Stick copy (libx264 crf 23, yuv420p, faststart, no audio)

## 10/6 review fixes (main session)

- "DAY 1" read as "DAY I" in NORD (its 1 is a plain bar): title and card now say DAY ONE / DAY ONE DONE.
- IMG_7839 12.8-16.4 is dumbbell CURLS, not an overhead press (checked frame by frame): label now DUMBBELL CURLS. Same fix in the social cut.
