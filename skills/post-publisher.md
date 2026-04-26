# Skill: Post Publisher

## Purpose
Publish approved content from the content calendar to Instagram and Facebook via Upload-Post. This is the final step in the content pipeline.

## Prerequisites
- Posts must be in `content-calendar/calendar.json` with status `approved`
- Upload-Post SDK installed (`npm install upload-post`)
- API key in secrets.env

## The Pipeline

```
Agent writes post (social-content / campaign-planner)
    ↓
Post added to calendar as "ready" (content-calendar skill)
    ↓
Joey approves → status becomes "approved"
    ↓
Publisher sends to Upload-Post → status becomes "posted" or "scheduled"
```

## Commands

All run from the `db-marketing-skills-main` directory:

### Review the queue
```bash
node content-calendar/publish.mjs --review
```
Shows all posts by status — what's waiting for approval, what's approved, what's scheduled, what's been posted.

### Dry run (preview without posting)
```bash
node content-calendar/publish.mjs --dry-run
```
Shows exactly what would be posted, to which platforms, with which captions — but doesn't actually post.

### Publish all approved posts due today
```bash
node content-calendar/publish.mjs
```
Finds all `approved` posts with `post_date` ≤ today and posts them immediately.

### Schedule posts for their target date/time
```bash
node content-calendar/publish.mjs --schedule
```
Same as above, but uses Upload-Post's scheduling feature to queue posts at their `post_date` + `post_time` instead of posting immediately.

### Publish a specific post
```bash
node content-calendar/publish.mjs --id 2026-04-15-001
```

## What Happens After Posting

The publish script automatically updates the calendar:
- `status` → `posted` (or `scheduled` or `failed`)
- `posted_at` → timestamp
- `post_result` → API response from Upload-Post

## Agent Workflow

When Joey says **"post it"** or **"send it"** or **"go live"**:

1. Check the calendar for `approved` posts
2. Run `publish.mjs` (or `--schedule` if posts have future dates)
3. Report back what was posted

When Joey says **"what's in the queue?"**:
1. Run `publish.mjs --review`
2. Summarize the output

When Joey says **"approve these"** or **"looks good"**:
1. Update the relevant posts in calendar.json: `status: "approved"`, `approved_at: now`
2. Confirm what was approved and ask if he wants to post now or schedule

## Error Recovery

If a post fails:
- Check `post_result.error` in calendar.json for the reason
- Common fixes: FB caption too long (>255), missing media file, API rate limit
- Fix the issue, set status back to `approved`, and run publish again

## Safety Rules

1. **NEVER publish without approval.** Only `approved` posts can be published.
2. **Always offer a dry run first** when posting multiple items.
3. **Check FB caption length** before approving — must be ≤ 255 chars.
4. **Verify media files exist** at the specified paths before posting.
5. **Credit @veteranwithacamera** — check `credit_videographer` flag. If true, ensure the caption includes credit.
