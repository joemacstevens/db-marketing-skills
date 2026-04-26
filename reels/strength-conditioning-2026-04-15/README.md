# Strength & Conditioning Feature Reel — April 15, 2026

## Deliverables
| File | Format | Duration | Size |
|------|--------|----------|------|
| `strength-conditioning-30s.mp4` | 1080x1920 @ 30fps | 30s | ~64 MB |
| `strength-conditioning-15s.mp4` | 1080x1920 @ 30fps | 15s | ~28 MB |
| `caption.md` | IG + FB captions | — | — |

## Music
**Hans Zimmer — Gurney Battle (Dune: Part Two)**
- Source: `brand-kit/music/gurney-battle-hans-zimmer.mp3`
- Volume: 90% with fade-in (1s) and fade-out (1.3s)

## Clips Used

### Primary: gym_4_15_26 shoot (7 of 10 clips)
| Slot | Source | Trim | Role |
|------|--------|------|------|
| sc-01-hero | C4930.MP4 | 2s for 4s | Beat 1 — slate background, step + boxing class |
| sc-02-realwork | C4927.MP4 | 1s for 4s | Beat 2 — "Real gym. Real work." hero |
| sc-05-drive | C4928.MP4 | 0s for 4s | Beat 5 — text background, class wide |
| sc-07-grind | C4925.MP4 | 14s for 4s | Beat 7 — close-up boxing combo |
| sc-08-text2 | C4924.MP4 | 2s for 4s | Beat 8 — text background, step aerobics |
| sc-09-motion | C4931.MP4 | 0s for 4s | Beat 9 — "DIFFERENT BREED" scramble |
| sc-10-climax | C4928.MP4 | 22s for 5s | Beat 10 — coach instruction, long hold |

### Supplemental: 2026 strict-strength clips (3 of 10 clips)
| Slot | Source | Trim | Role |
|------|--------|------|------|
| sc-03-explosive | atoya-putting-in-work (Feb 14) | 3s for 4s | Beat 3 — barbell squat |
| sc-04-load | IMG_5209.mov (Apr 12) | 1s for 4s | Beat 4 — sled push |
| sc-06-mid2 | C4688.MP4 (Mar 4) | 0s for 4s | Beat 6 — TRX class |

## Beat Timeline (30s version)
```
0-2.5s   Beat 1: Slate — "STRENGTH & CONDITIONING" title
2.5-5.3s Beat 2: Hero — "Real gym. Real work."
5.3-7.7s Beat 3: Barbell squat (pure visual)
7.7-10s  Beat 4: Sled push (pure visual)
10-13s   Beat 5: "EVERY REP. EARNED." text overlay
13-15.3s Beat 6: TRX (pure visual)
15.3-17.7s Beat 7: Boxing combo close-up (pure visual)
17.7-20.7s Beat 8: "DISCIPLINE · DESIRE · DEDICATION"
20.7-24s Beat 9: "DIFFERENT BREED" text scramble
24-27.3s Beat 10: Coach instruction (climax hold)
27.3-30s Beat 11: End card — logo + "Evolve Into Greatness"
```

## Cinematic Effects Used
- **TextScramble** — "DIFFERENT BREED" reveal (Beat 9)
- **KineticMarquee** — scrolling text strip on end card
- **VideoBeat** — Ken Burns push + cinematic grade (vignette, contrast, desat) on all clips
- **Spring-animated** typography for text reveals

## Composition Files
- `reels/src/StrengthConditioning30.tsx` — 30s reel (900 frames)
- `reels/src/StrengthConditioning15.tsx` — 15s story cutdown (450 frames)
- Registered in `reels/src/Root.tsx` under "Strength-Conditioning" folder

## Notes
- **S&C class at DB:** The April 15 shoot captures a group conditioning class combining step aerobics, boxing combos with light weights, and circuit drills — DB's take on functional S&C.
- **Supplemental clips** (barbell squats, sled push, TRX) round out the full range of strength work at the gym.
- **Coach identification:** No specific S&C coach identified in schedule.md. The indexer tags show an instructor but no named coach match. Flag for Joey to confirm.
- **Videographer credit:** @veteranwithacamera credited in both IG and FB captions per posting rules.
- **Indexer status:** 10/37 gym_4_15_26 clips were indexed at time of selection. Additional clips may yield better options — consider re-running pick-clips.py after full indexing.

## Re-rendering
```bash
cd reels
npx remotion render src/index.ts StrengthConditioning30 ../reels/strength-conditioning-2026-04-15/strength-conditioning-30s.mp4
npx remotion render src/index.ts StrengthConditioning15 ../reels/strength-conditioning-2026-04-15/strength-conditioning-15s.mp4
```
