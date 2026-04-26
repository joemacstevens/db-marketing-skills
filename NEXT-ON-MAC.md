# Next steps to run on Joey's Mac

Things Claude couldn't do from inside the sandbox but Joey can do locally in Terminal. Each is independent — pick whatever order.

## 1. Flush staged archive to Ajeo (~25 GB)

`/Different Breed/_archive/` currently holds:
- `Different Breed Elite Fittness Site/` (616 MB false start)
- `Different Breed March Madness/` (8 MB PDF)
- `db-reel-kit/` (absorbed husk)
- `media-to-ajeo/` (~19 GB of raw clips + rendered outputs)

Move to Ajeo:
```bash
rsync -av --remove-source-files \
  "/Users/joestevens/Projects/Different Breed/_archive/" \
  "/Volumes/Ajeo/Projects/Different Breed/_archive/" && \
find "/Users/joestevens/Projects/Different Breed/_archive/" -type d -empty -delete
```

Or just drag `_archive/` to the Ajeo location in Finder. Same result.

## 2. Delete locked node_modules in reel projects (~3.2 GB)

Sandbox couldn't delete these (macOS execute-only perms on some npm binaries). On the Mac:
```bash
find "/Users/joestevens/Projects/Different Breed/reels" \
  -name node_modules -type d -prune -exec rm -rf {} +
```

The top-level `.gitignore` already covers `node_modules` — they won't get tracked. They regenerate on `npm install`.

## 3. (Optional) Restart Cowork to pick up the Manychat allowlist

Earlier the sandbox proxy was still blocking `api.manychat.com` even though the allowlist was supposedly updated. Closing and reopening Cowork should re-read the allowlist. Then I can run the Manychat audit script directly instead of you running it on your Mac.

## 4. Run the hoist (Phase F) — one script

Sandbox can't acquire git's index lock (some macOS sandboxd policy on `.git/`) and `git add -A` exceeds the 45-second sandbox timeout on this size repo. So Phase F runs locally instead. One command:

```bash
bash "/Users/joestevens/Projects/Different Breed/hoist.sh"
```

What it does:
1. Removes any stale `.git/index.lock`
2. Sets git author identity if missing
3. Commits all uncommitted Phase A-C.5 work as one clean commit
4. Moves `.git/` and all OS contents from `` up one level
5. Updates root `.gitignore` (adds `_archive/` and itself)
6. Strips `` from absolute paths in .md files (sed)
7. Commits "Phase F: hoist"
8. Verifies all 15 skill paths still resolve, prints the new top-level layout

Reversible up to step 4. After step 4, recovery is `git reset --hard HEAD~2` then manual reverse moves — possible but annoying. Look at what it's about to do before running. Tell me when it's done and we resume.

## 5. (When Codex is done with Phase 2) Tell Claude

The Manychat Phase 2 buildout is delegated to Codex per `leads/integrations/manychat-codex-phase2.md`. When it finishes, ping me — I'll write the Vercel webhook receiver (`landing-page/api/manychat-webhook.js`) so leads start landing in `leads/leads.json` for real.
