# Where are the Reel-1-The-Team bytes?

Raw .MP4 clips, `public/`, and `out/` have been staged for the Ajeo external drive.

## Staged at (workspace, awaiting flush)
```
/Users/joestevens/Projects/Different Breed/_archive/media-to-ajeo/reels/fcp-projects/sparring/Reel-1-The-Team/
├── *.MP4                  (raw camera files: C4754, C4755, C4756, C4757, C4758, C4760)
├── public/                (Remotion public/ — additional clips and assets)
└── out/                   (rendered outputs)
```

## Final destination
```
/Volumes/Ajeo/Projects/Different Breed/_archive/media-to-ajeo/reels/fcp-projects/sparring/Reel-1-The-Team/
```

## To reopen this project
1. Mount Ajeo.
2. Copy the `.MP4` files + `public/` back into this directory.
3. Re-link in FCP if the `.fcpxml` (in the parent `sparring/` directory) references them by path.
4. `npm install` to regenerate node_modules.
5. `npm start` for Remotion preview.

## What stayed
- `src/` — Remotion source (the recipe)
- `package.json`, `package-lock.json`, `tsconfig.json`
- `node_modules/` — could not delete due to macOS perms; Joey can `rm -rf node_modules` on Mac and it'll regenerate on next `npm install`

**Archived 2026-04-26.**
