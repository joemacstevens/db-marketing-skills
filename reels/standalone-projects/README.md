# reels/standalone-projects/

Self-contained Remotion projects that haven't (yet) been ported into the unified `reels/` project. Each has its own `package.json`, its own Remotion version, and its own `src/`.

## Why they're here instead of folded into `reels/src/`

Each works as-is. Porting their compositions into the unified project would mean rewriting their imports to use the OS's central `BrandStyles.ts` and the cinematic-effects library — useful eventually, but risky for projects that are already shipping. Leaving them standalone lets the OS reference them without rewriting them.

## Current standalone projects

| Folder | What it is | Remotion version | Status |
|---|---|---|---|
| `inbody-reel/` | Standalone reel for InBody scan promotion. Has its own brandkit, public/, and out/ folders. Render: `cd inbody-reel && npm run render` → `out/inbody-reel.mp4`. | Remotion 4.0.267 | Standalone, working |
| `weekly-highlights/` | Joey's "gold standard" 45-second Instagram Reel — multi-segment (intro → boxing → circuit → pilates → testimonial → end card). The blueprint many other reels copy from. | Remotion 4.0.441 | Standalone, working — actively used for weekly reels |

## Future port plan (TODO, not blocking)

When the unified `reels/` project is ready to absorb a composition from here:

1. Pick the standalone project to port (e.g. `weekly-highlights/`).
2. Read its `src/<Composition>.tsx`.
3. Re-create as `reels/src/<Composition>.tsx`, swapping its local color/font constants for `reels/src/components/BrandStyles.ts` imports and any stylized text effects for components from `reels/src/cinematic-effects/`.
4. Register in `reels/src/Root.tsx`.
5. Render-test against the original to confirm output matches.
6. Move the standalone project into `_archive/standalone-projects/<slug>/` with `ARCHIVED.md` noting the new home.

Until that happens, **don't edit the standalone projects** unless re-rendering an existing reel — they're frozen reference implementations.
