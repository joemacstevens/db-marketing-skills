# Skill: Reel Queue Preview

## Purpose
Keep Joey's **Reel Queue** page current. It shows every post queued on Upload-Post for @dbelitefitness as a phone preview (tap to play with sound), grouped by day, with the Eastern post time, a countdown, platforms, captions, and first comment.

- **Live page:** https://claude.ai/artifact/AHVku7EeUcJCA3WxKwY6DL (private to Joey)
- **Builder:** `content-calendar/preview/build.mjs`
- **Template:** `content-calendar/preview/template.html`
- **Output:** `content-calendar/preview/site/` (gitignored, rebuilt every run)

## The rule
**Any time the Upload-Post queue changes, refresh the page in the same session.** That means after:
- `publish.mjs --schedule` (or any script that schedules a post)
- a PATCH that moves a job's time
- a `cancelScheduled` / pulled-back post
- a media or caption swap on a queued job

Also refresh when Joey asks "what's scheduled", "show me the queue", or similar, and hand him the link.

The page fades cards whose time has passed on its own, so it doesn't go wrong when posts go out. It only goes stale when the queue changes. The header turns red ("out of date") if the last sync is over 36 hours old.

## How to refresh

1. **Build.** From the repo root of your current checkout (a worktree is fine):
   ```bash
   node content-calendar/preview/build.mjs
   ```
   It reads Upload-Post's `listScheduled()` (the truth for times) and joins `calendar.json` from the **main checkout** by `post_result.job_id` for the local video file and captions. New reels get transcoded to 540x960 proxies (cached in `~/.cache/db-reel-preview/`, so repeat builds take seconds). Read the printed queue and the **WARNINGS** block:
   - *on Upload-Post but not in calendar.json*: a post was scheduled outside `publish.mjs`. Add or fix the calendar entry.
   - *status=scheduled but NOT queued on Upload-Post*: the job was cancelled or failed. Tell Joey.
   - *local media missing*: the page falls back to Upload-Post's thumbnail. Usually the file lives in a deleted worktree; check the Ajeo archive.

2. **Publish to the same URL.** In a session that didn't create the page, first call Artifact `action: "read"` with the URL, then `action: "list", scope: "files"` with the URL (publishing refuses paths you haven't seen). Then publish:
   - `url`: the live page URL above
   - `file_path`: `content-calendar/preview/site/index.html`
   - `root`: `content-calendar/preview/site`
   - `files`: the `files` object from `content-calendar/preview/site/publish-plan.json` (new reels plus `null` for posted ones)
   - no `icon` (it keeps its calendar icon)

   If the file listing shows `reels/*` files that aren't in the plan's `current` list, add them to `files` as `null`. If the listing is missing files that are in `current`, publish with the plan's `full` map instead. Each publish sends at most 64 MB. If `files` is over that, split it across two publishes to the same URL.

3. **Record it.** Only after the publish succeeds:
   ```bash
   node content-calendar/preview/build.mjs --mark-published
   ```

4. **Tell Joey** in one line: what changed and the link.

## Looking at it locally
Add a `reel-queue` entry to `.claude/launch.json` if it's missing (`python3 -m http.server 8131 --directory content-calendar/preview/site`, port 8131), then `preview_start {name: "reel-queue"}` to check layout or playback before publishing. The built-in browser can't open the artifact URL itself because it isn't signed in to claude.ai.

## Where it can't run
The Mac mini cron (`/Users/noahajeo/...`) has no Artifact tool. Refreshes happen from Joey's Mac in a Claude session. If you can build but can't publish, say so and leave `site/` built.

## Don'ts
- Don't schedule, move, or cancel anything to "fix" what the page shows. The page is read-only. Queue changes still need Joey's approval.
- Don't hand-edit `site/index.html`. Change `template.html` and rebuild.
- Don't commit `site/` (video bytes never go in git).
