# reels/fcp-projects/

Final Cut Pro reel projects. Each subfolder is a self-contained FCP project — `.fcpxml`, raw clips, music, optional analysis/frames metadata. See `skills/reel-factory.md` for the FCP pipeline.

## Convention

```
reels/fcp-projects/<slug>/
├── <slug>.fcpxml
├── raw-clips/                ← REAL files only (no symlinks — FCP beach-balls)
├── analysis/clip-analysis.json   ← optional, scene breakdown
├── frames/                    ← optional, thumbnails for selection
├── EDIT-GUIDE.md              ← optional, copy from templates/new-reel/FCP-EDIT-GUIDE-TEMPLATE.md
└── *.m4v / *.mp4              ← rendered outputs
```

## Current projects

| Slug | What it is | Status | Raw size |
|---|---|---|---|
| `kids-boxing/` | 30s Kids Boxing reel — `Kids Boxing Reel.fcpxml` + 9 raw clips, three rendered variants (-30s, -30s-true, -30s-proper-width). | Delivered | ~5.6 GB |
| `sparring/` | Two-reel project (`Reel-1-The-Team/`, `Reel-2-Work-Ethic/`) with shared brandkit, EDIT-GUIDE.md, two music tracks. | Delivered | ~13 GB |

## Raw-clip storage — the wrapped-vs-active rule

**Active projects:** raw clips live with the project so FCP can find them. (Symlinks to SMB shares beach-ball FCP — never use them.)

**Wrapped projects:** move bytes (`raw-clips/`, `public/`, `out/`, rendered `.m4v`) into `/Different Breed/_archive/media-to-ajeo/<original-path>/`. Joey flushes `_archive/` to `/Volumes/Ajeo/Projects/Different Breed/_archive/` periodically. Leave a `WHERE-IS-IT.md` in the emptied project directory pointing to the Ajeo location.

The `.fcpxml`, EDIT-GUIDE, analysis, and frames stay in the OS forever — those are the recipe.

Both `kids-boxing/` and `sparring/` (here as of 2026-04-26) are wrapped. Their bytes are staged in `_archive/media-to-ajeo/` waiting for the next Ajeo flush. To reopen either, follow the steps in their `WHERE-IS-IT.md`.

See `skills/reel-factory.md` for the full recipes-vs-bytes convention.
