# Where are the unified reels/out/ renders?

All 33 rendered outputs from the unified `reels/` Remotion project have been staged for Ajeo. Per the convention: rendered finals belong in the media library, not the OS source tree.

## Staged at (workspace, awaiting flush)
```
/Users/joestevens/Projects/Different Breed/_archive/media-to-ajeo/db-marketing-skills-main/reels/out/
├── danny-final-preview/
├── danny-preview/
├── jw-preview/
├── schedule-stills/
├── stills/
├── wps-stills/
└── ... (all 33 directories)
```

## Final destination
```
/Volumes/Ajeo/Projects/Different Breed/_archive/media-to-ajeo/db-marketing-skills-main/reels/out/
```

Eventually these should be promoted into the **canonical media library** index at `/Volumes/Ajeo/Projects/Different Breed/Media Library/` so `skills/media-library.md` queries can find them by quality_score / activity_type / coaches_visible.

## What stayed in `reels/`
- `src/` — 16 compositions + components + cinematic-effects
- `public/` — brand assets and clips referenced by compositions
- `package.json`, `tsconfig.json`
- `fcp-projects/`, `standalone-projects/`

## How to render new output
```bash
cd reels
npx remotion render src/index.ts <CompositionId> out/<filename>.mp4
```
The `out/` directory will be re-created on first render. Move new finals to Ajeo periodically (or wire a post-render step that does it automatically — TODO for Phase E).

**Archived 2026-04-26.**
