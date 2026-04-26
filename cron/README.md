# Cron Heartbeat

Scheduled jobs run on the **Mac mini** at `/Users/noahajeo/...` (and possibly other machines later). This directory is how we surface "what's running, when did it last succeed" inside the OS without having to SSH in.

## Files

- `heartbeat.json` — current state map. One key per job, overwritten on each run. The CLAUDE.md "Right Now" header reads this.
- `heartbeat.jsonl` — append-only history. One JSON object per line per run. For when we want to look back ("did the schedule story actually run last Wednesday?").
- `schema.json` — the contract for both files.

## How writes happen (Mac mini side, Phase E — not built yet)

Each cron job's wrapper script (e.g. `launchd-runner.sh`, `nightly-render.sh`) ends with a small post-step that:

1. Builds a JSON object: `{ job, started_at, finished_at, status, summary, ref }`.
2. Updates `heartbeat.json` (overwrite that job's key).
3. Appends to `heartbeat.jsonl`.
4. Commits both via the GitHub API using a fine-grained PAT scoped to this repo.

The PAT lives in `~/.openclaw/secrets.env` on the Mac mini as `GITHUB_TOKEN_DBE_OS`. Joey and/or Noah create it once, scoped to "contents: read+write" on this repo only.

## Why GitHub API and not local commit?

The Mac mini and Joey's MacBook are different machines. The OS lives wherever the repo is checked out (currently Joey's MacBook). A direct GitHub API write means the Mac mini never has to clone the whole repo — it just patches two files via a single API call per cron run.

## How reads happen (OS side)

The `Right Now` header in `CLAUDE.md` runs:
```bash
jq -r 'to_entries[] | "\(.key): last \(.value.status) at \(.value.last_at)"' cron/heartbeat.json 2>/dev/null
```
on session start. If the file is empty / missing, the section says "no cron data yet."

## Phase E (later) — dashboard artifact

Once the heartbeat file is being written reliably, Phase E builds a Cowork artifact (HTML widget in the sidebar) that polls `heartbeat.json`, shows a green/yellow/red dot per job, and links to the latest `ref` (e.g. the Upload-Post job page or Resend message log).
