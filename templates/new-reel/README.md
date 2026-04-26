# New Reel Template

Two paths — pick the right one for the brief.

## Path A — Remotion (preferred)

Use when the reel is structured (titles, schedule cards, animated text, brand effects, voiceover sync).

1. Add a new composition file to `reels/src/` — copy from an existing one like `JustWork15.tsx` or `WhatPeopleSay30.tsx`.
2. Register it in `reels/src/Root.tsx`.
3. Pull cinematic effects from `reels/src/cinematic-effects/` — see `skills/cinematic-effects.md` for the lookup table.
4. Use `reels/src/components/BrandStyles.ts` for colors, fonts, dimensions, safe zones.
5. Preview: `cd reels && npm run studio`
6. Render: `cd reels && npx remotion render src/index.ts <CompositionId> out/<filename>.mp4`

## Path B — Final Cut Pro

Use when the reel is mostly raw footage cut to music (sparring, kids boxing, gym energy montages).

1. Create `reels/fcp-projects/<reel-slug>/` with `.fcpxml`, `raw-clips/` (gitignored, store raw on Ajeo external drive), `analysis/clip-analysis.json`, `frames/` (thumbnails).
2. Use the FCP edit guide from `db-reel-kit` (being absorbed into `skills/reel-factory.md` in Phase B).

## Path C — HTML + Playwright

For title cards or quick posters that aren't worth a Remotion composition. See `skills/creative-designer.md`.

## Then

- Add the published reel to `content-calendar/calendar.json` with `media_type: "video"` and the file path under `media_paths`.
- Tag the videographer (`@veteranwithacamera`) if any of his footage is used.
