# Different Breed — AI Operating System
## Reorganization Plan (Inventory + Proposal, no files moved yet)

**Date:** 2026-04-26
**Author:** Claude (Cowork)
**Goal:** Turn the existing `db-marketing-skills-main` project into a single "AI OS" that runs all Different Breed marketing — reels, landing pages, posts, emails — and adds a thin lead-capture / CRM layer for landing-page and IG-DM leads.
**Scope of this doc:** Plan + Phase A executed. Phases B-E are still proposal only.

---

## v1.1 Amendments (Joey's feedback, 2026-04-26)

1. **Archive the main-gym false starts; keep building main-gym pages on a clean slate.** Every prior attempt at a main-gym landing page has been a false start, including the SvelteKit project in `Different Breed Elite Fittness Site/`. Disposition for that folder changes from "keep as its own project" to **archive in full**. This is a clean-up, NOT a moratorium — when we build the next main-gym page, it starts from `templates/new-landing-page/` and uses the same skill stack as class and campaign pages. (Earlier draft of v1.1 mistakenly framed this as "no main-gym landing pages allowed" — corrected.)
2. **Manychat Pro is the IG DM lead channel.** Joey has a Manychat Pro account for DB. The lead-capture skill treats Manychat as a first-class source alongside the form. Integration stub is in `leads/integrations/manychat.md`. (Earlier draft called it "MiniChat" — corrected.)
3. **Pilates by Menukhah is a sub-brand class, not a separate brand.** It's the women-only Core Control Pilates class on the MindBody schedule. Treat it like any other DB class: parent brand voice + visuals, with a class-specific landing page at `Corecontrollandingpage/`. The `Pilates-by-Menukhah/` sibling folder (flyer work) folds into a class-asset bucket — it does NOT need its own brand context separate from DB's.

## Archive staging convention

The Ajeo external drive (`/Volumes/Ajeo/Projects/Different Breed/_archive/`) is the long-term archive but it isn't reachable from Claude's sandbox. So every archival move goes through a workspace staging area first:

- **Staging area:** `/Different Breed/_archive/`
- **Convention:** every folder moved here gets an `ARCHIVED.md` with date + reason + successor (if any).
- **Flush:** Joey drags `/Different Breed/_archive/` to Ajeo periodically. Single Finder operation; fully reversible until then.

## Phase A — Done (2026-04-26)

- ✅ Rewrote `CLAUDE.md` as the control panel (Right Now header, Lead Pipeline section, Cron table, Campaign Index, sub-brands section, updated skills list).
- ✅ Scaffolded `leads/` — README, schema.json, empty leads.json, sequences/ with placeholder camp-welcome.md, integrations/manychat.md.
- ✅ Scaffolded `templates/` — new-campaign, new-landing-page (covers class, campaign, AND main gym pages), new-reel, new-email-sequence.
- ✅ Scaffolded `campaigns/_archive/` with README explaining the convention.
- ✅ Manychat API key stashed in gitignored `.env.local`. Audit script ready at `leads/integrations/manychat-audit.sh` — blocked on sandbox reaching `api.manychat.com` (proxy allowlist update hasn't propagated to this session).

Nothing inside `` has been moved or deleted in Phase A. Purely additive.

## Phase C.5 — Done (2026-04-26): recipes-vs-bytes split

Joey's call: bytes don't belong in the OS. Same principle that already governs photo storage (Ajeo holds, OS queries the index) extended to video.

**Convention added to `skills/reel-factory.md` and `reels/fcp-projects/README.md`:**
- OS = recipes (`.fcpxml`, `.tsx`, `package.json`, briefs, edit guides, analysis JSON, thumbnails, music)
- Ajeo = bytes (raw clips, rendered finals, photo originals, Remotion `public/` clips after wrap)
- Active project = raw stays local. Wrapped = bytes go to Ajeo + `WHERE-IS-IT.md` in the emptied directory.

**Bytes staged for Ajeo (~19 GB):**
- `kids-boxing/raw-clips/` + 3 rendered `.m4v` (5.6 GB)
- `sparring/Reel-1-The-Team/*.MP4` + `public/` + `out/` (~6.5 GB)
- `sparring/Reel-2-Work-Ethic/*.MP4` + `public/` + `out/` (~6 GB)
- `inbody-reel/{client_videos,out,public,InBody-assets}` (~97 MB)
- `reels/out/` — all 33 unified-project rendered outputs

`reels/` went from ~25 GB → ~3 GB (and another 3.2 GB of `node_modules` Joey will delete on his Mac — sandbox couldn't due to macOS perms).

**WHERE-IS-IT.md** dropped in each emptied directory with: staged path, future Ajeo path, reopen instructions.

**`/Different Breed/NEXT-ON-MAC.md`** now lists the things Joey needs to do locally: flush `_archive/` to Ajeo (~25 GB total), nuke node_modules (~3.2 GB), restart Cowork to pick up the Manychat allowlist if needed.

## Phase C — Done (2026-04-26): standalone reel projects folded in

- ✅ C.1 FCP projects: `Kids-Boxing/` (5.7 GB) → `reels/fcp-projects/kids-boxing/`. `db-sparring-reels/` (13 GB) → `reels/fcp-projects/sparring/`. New `reels/fcp-projects/README.md` documents the convention (raw clips stay with project for FCP; flush to Ajeo when projects wrap).
- ✅ C.2 Standalone Remotion projects: `Different-Breed-Inbody-Reel/` (752 MB) → `reels/standalone-projects/inbody-reel/`. `db-weekly-highlights/` (1.1 GB) → `reels/standalone-projects/weekly-highlights/`. Each preserves its own `package.json` and Remotion version. New `reels/standalone-projects/README.md` lays out the future port plan (re-create as compositions in the unified `reels/src/` using BrandStyles + cinematic-effects).
- ✅ C.3 Pilates-by-Menukhah (258 MB): folded into `campaigns/core-control-pilates/` as an active flyer-production campaign. New `STATUS.md` written. CLAUDE.md Campaign Index updated. The separate `Corecontrollandingpage/` (its own nested git repo) remains untouched but cross-referenced from the campaign STATUS.
- ✅ Manychat handoff routing simplified: only Pilates → CJ; everything else → Don. Both `manychat-design.md` and `manychat-codex-phase2.md` updated.

**Workspace top level: down to 3 entries** — exactly the pre-hoist target state from §3:
```
/Different Breed/
├── _archive/                       (~6 GB staged for Ajeo flush — false starts + db-reel-kit)
├── AI-OS-REORG-PLAN.md
└──         (the OS — ready to hoist)
```

All 15 skill paths in CLAUDE.md still resolve. 16 compositions in `reels/src/` untouched. Phase F (hoist) is now possible.

## Phase B — Done (2026-04-26): db-reel-kit absorbed

- ✅ B.1 Scripts: copied `generate-vo.mjs`, `post-reel.mjs`, `whisper-captions.sh` to `scripts/`. Skipped `fetch-schedule.mjs` (superseded).
- ✅ B.2 Brand assets: `brand-kit/` now has `brand.json`, 3 PNG logos, 3 SVG logos, Nord Minimal font ZIP. **First time `brand-kit/` has actual brand identity assets.**
- ✅ B.3 Coaches: `coaches-and-staff.md` grew from 41 → 65 lines. Added Adult Boxing (Coach Dred as `[CANDIDATE]` pending Joey confirmation), partner accounts to watch, Pilates schedule + booking URL embedded with each coach.
- ✅ B.4 Hashtags: `brand-context/hashtags.json` copied (verbatim). Structured by topic (boxing_adult / kids_boxing / pilates / community / mindset).
- ✅ B.5 Style guide: `visual-style-guide.md` grew from 71 → 232 lines. Resolved Oswald-vs-NORD conflict in favor of Oswald (matches `brand.json` and the actual Remotion components). Added Layout, Motion, Editorial Voice, Music & Audio, Captions, End Card, Topic-Specific Notes, Lessons Learned.
- ✅ B.6 Templates: BRIEF-TEMPLATE.md and FCP-EDIT-GUIDE-TEMPLATE.md added to `templates/new-reel/`. New `templates/html-card/` for cover-frame work.
- ✅ B.7 Reel factory skill: `skills/reel-factory.md` expanded from stub → 222-line full skill (3 pipelines, Upload-Post details, 11-step workflow, pre-publish checklist, gotchas).
- ✅ B.8 Husk archived: `db-reel-kit/` → `_archive/db-reel-kit/` with `ARCHIVED.md` migration map. Workspace top level: 8 → 7 active folders.

All 15 skill paths in CLAUDE.md still resolve. Both new JSON files validate. Phase B is reversible — every change is in the working tree, no deletions.

## Phase A.5 — Done (2026-04-26): false-start archives

- ✅ Created `/Different Breed/_archive/` staging area with README explaining the convention.
- ✅ Moved `Different Breed Elite Fittness Site/` → `_archive/` (616 MB SvelteKit main-gym false start; ARCHIVED.md notes successor path).
- ✅ Moved `Different Breed March Madness/` → `_archive/` (8 MB one-off PDF; no follow-up planned).

Workspace top level is now down from 10 folders to 8 (plus `_archive/` and `AI-OS-REORG-PLAN.md`).

## Phase B — Concrete merge plan for `db-reel-kit/`

Inventory done 2026-04-26. Status: NOT executed yet. Below is the file-by-file merge map.

### Scripts (4 files, no name collisions)

| `db-reel-kit/scripts/` file | Action | Destination | Notes |
|---|---|---|---|
| `fetch-schedule.mjs` | **Skip** — supersede | — | `scripts/fetch-mindbody-schedule.mjs` already does the same job and is purpose-built for the OS (outputs Remotion-shaped props, not raw API). The db-reel-kit version was a fallback for sandbox-mapped API keys. Document the difference in scripts/README.md. |
| `generate-vo.mjs` | **Copy as-is** | `scripts/generate-vo.mjs` | ElevenLabs voice-over (DB house voice). NOT the same as existing `generate-veo.mjs` (Google Veo video gen). Distinct services, both keepers. |
| `post-reel.mjs` | **Copy as-is** | `scripts/post-reel.mjs` | Upload-Post SDK reel publisher. No equivalent in main. |
| `whisper-captions.sh` | **Copy as-is** | `scripts/whisper-captions.sh` | Word-level caption generation via Whisper. No equivalent. |

### Brand assets (no overlap with current `brand-kit/`)

`brand-kit/` currently has only video assets (strength-conditioning hero clips) + one music file. **No logos, no fonts, no brand.json.** Everything in `db-reel-kit/brand/` is net-new.

| File | Action | Destination |
|---|---|---|
| `brand/brand.json` | **Copy** | `brand-kit/brand.json` (canonical structured brand definition — colors, fonts, voice id, video specs, editorial rules) |
| `brand/logos/*.png` (3 files @3x) | **Copy** | `brand-kit/logos/` |
| `brand/logos/svg/*.svg` (3 files) | **Copy** | `brand-kit/logos/svg/` |
| `brand/fonts/nord-minimal-display-headline-logo-typeface.zip` | **Copy** | `brand-kit/fonts/` |

### Reference (small but high-value content)

| File | Action | Destination |
|---|---|---|
| `reference/coaches.json` | **Merge then drop** | Source of truth stays `brand-context/coaches-and-staff.md` (per the plan). The .json's structured data (handles, schedule mapping, partner accounts to watch) gets folded into the .md as a structured reference appendix. |
| `reference/hashtags.json` | **Copy** | `brand-context/hashtags.json` (well-structured by topic; extends the rules in `brand-context/posting-rules.md`. Add a one-line cross-reference between the two.) |
| `reference/house-style.md` (148 lines) | **Merge** | Into `brand-context/visual-style-guide.md` (currently 71 lines). House-style covers cinematography, captions, music, end-card rules — extends visual-style-guide which is more about colors/fonts/logos. |
| `reference/briefs/_TEMPLATE.md` | **Copy** | `templates/new-reel/BRIEF-TEMPLATE.md` |

### Templates

| File | Action | Destination |
|---|---|---|
| `templates/remotion-starter/` | **Archive** | `_archive/db-reel-kit/templates/remotion-starter/`. The OS already has `reels/` as a fully-developed Remotion project with 14 cinematic effects and BrandStyles.ts. The starter is a minimal seed; no point keeping both. Note in `templates/new-reel/README.md` that the active reel project is `reels/`. |
| `templates/fcp-edit-guide-template.md` | **Copy** | `templates/new-reel/FCP-EDIT-GUIDE-TEMPLATE.md` |
| `templates/html-card-template/` | **Copy** | `templates/html-card/` (this is for one-off poster/title-card creation; cross-reference from `skills/creative-designer.md`) |

### Source docs

| File | Action |
|---|---|
| `db-reel-kit/README.md` (12 KB) | **Mine for content** → expand `skills/reel-factory.md` from stub to full skill. The README is the source material for the three pipelines (Remotion / FCP / HTML+Playwright), house style notes, and the Upload-Post publishing flow. |
| `db-reel-kit/AGENTS.md` (2.6 KB) | **Mine for content** → fold into either `skills/reel-factory.md` or `CLAUDE.md` orchestration section. |

### Final disposition

Once all the above is merged and verified, move `db-reel-kit/` itself to `_archive/db-reel-kit/` with an ARCHIVED.md noting which contents went where.

## Phase F — Hoist (new, final phase)

After Phases B + C are done and only `` and the `_archive/` are left in `/Different Breed/`, hoist the OS up one level so the workspace folder IS the OS root.

### Pre-hoist state (target)

```
/Different Breed/
├── _archive/                       ← staged archives (db-reel-kit, false starts, FCP source folders)
├── AI-OS-REORG-PLAN.md
└──         ← the OS
    ├── CLAUDE.md
    ├── brand-context/
    ├── skills/
    ├── leads/
    ├── templates/
    ├── campaigns/
    ├── reels/
    ├── scripts/
    └── ... (everything else)
```

### Post-hoist state

```
/Different Breed/                    ← IS the OS now
├── _archive/                        ← stays (workspace-level staging)
├── AI-OS-REORG-PLAN.md              ← stays
├── CLAUDE.md                        ← hoisted up
├── brand-context/                   ← hoisted up
├── skills/                          ← hoisted up
├── leads/                           ← hoisted up
├── templates/                       ← hoisted up
├── campaigns/                       ← hoisted up
├── reels/                           ← hoisted up
├── scripts/                         ← hoisted up
└── ... (everything else from )
```

### How

1. `git mv` every top-level entry from `` to `/Different Breed/`. This preserves git history and is reversible.
2. Move `.git/` to `/Different Breed/.git/` so the workspace IS the repo. (Rename the existing `db-marketing-skills-main` repo on GitHub to `db-os` or similar at the same time.)
3. Update `.gitignore` and merge into a top-level `.gitignore`.
4. Update absolute paths in any docs that reference `...` — they become `/Different Breed/...`.
5. Sanity check: `git status` clean, `git log --oneline` shows full history, all skill paths in CLAUDE.md still resolve (run the same verification I ran in Phase A).
6. Delete the now-empty `` shell.

### Why save it for last

If we hoist before absorbing, we have the worst of both worlds: a flat workspace polluted with sibling reel-kit folders. Doing the absorbs first leaves us with a clean two-folder workspace (`` + `_archive/`) that's trivial to flatten in one pass.

---

## 1. TL;DR

You already have ~80% of the OS built. `db-marketing-skills-main` is the hub: brand context, 11 skills, a 100+ entry content calendar, a working Remotion reel project with 14 cinematic effects, a live Vercel landing page, and a working MindBody-enrollment form that emails Don through Resend. Everything else under `/Different Breed/` is either (a) a sibling reel project that should fold into the hub or (b) one-off campaign archives.

The work to "build the OS" is therefore four things, in order:

1. **Promote the hub.** Make `CLAUDE.md` the single control panel — it already links to skills; expand it to also list active campaigns, leads, and "what's running on the cron."
2. **Absorb the sibling reel folders** as either archived references or imported into `reels/` and `campaigns/`.
3. **Add the lead pipeline layer** — three new skills (`lead-capture`, `lead-followup`, `landing-page-deploy`) and a `leads/` directory that becomes the central state file (the way `content-calendar/calendar.json` is for posts).
4. **Document the cron-running automations** so you can see at a glance what's live (the daily schedule story is already running on the Mac mini (`/Users/noahajeo/...`), but it's not visible from the OS).

**You don't need a database.** MindBody is already the source of truth for enrolled members. Resend handles outbound email. Lead state can live in `leads/leads.json` mirroring the calendar.json pattern. If/when you want a dashboard or member-facing portal, *then* add Supabase. Not before.

---

## 2. What You Already Have (current state, verified)

### The hub: ``

| Component | What it is | Status |
|---|---|---|
| `brand-context/` | 8 markdown files — voice, visual, coaches, schedule, audiences, posting rules, content examples, summer-camp-2026 facts | Current as of Apr 22 |
| `skills/` | 11 skills (social, designer, schedule-announcer, schedule-pipeline, campaign-planner, analytics, media-library, content-calendar, post-publisher, cinematic-effects, email-campaign) | All written; some richer than others |
| `campaigns/` | 3 folders: summer-camp-2026 (active), jack-jill-2026-04-18 (in production), the-coliseum (placeholder) | Active workflow |
| `content-calendar/calendar.json` | 20 posts tracked (v1.0, profile `dbelitefitness`, `America/New_York`), status flow draft → ready → approved → posted | Working pipeline |
| `landing-page/` | Summer Camp 2026 site, deployed to Vercel at `summer.differentbreedsportsacademy.com`, with `api/register.js` serverless form handler | Live |
| `reels/` | Remotion 4.0.448 project, 14 cinematic effects (Phase 1 + 2), 13+ reel compositions, BrandStyles.ts | Production |
| `scripts/` | MindBody fetch, schedule render orchestrator, ElevenLabs VO, batch calendar-add scripts, launchd runner | Daily schedule story is automated on cron |
| `cinematic-site-components/` | 30 HTML modules from RoboLabs + IMPLEMENTATION-PLAN | Reference / source-of-inspiration |
| `brand-kit/`, `print/`, `Corecontrollandingpage/`, `output/` | Supporting assets and generated content | Active |

### Sibling folders under `/Different Breed/`

| Folder | What it is | Recommendation |
|---|---|---|
| `Different Breed Elite Fittness Site` | Next.js project, the **main gym website**, currently being rebuilt around a custom MindBody schedule UI (replacing the iframe widget) | **Keep as its own project.** Link from OS but don't absorb — it's a real Next.js app, not a skill output. |
| `Different Breed March Madness` | Single PDF flyer | Archive |
| `Different-Breed-Inbody-Reel` | Standalone Remotion reel project | Fold into `reels/` as one more composition; archive the standalone folder |
| `Kids-Boxing` | FCP edit + 5.6 GB raw clips for a 30s reel that's already delivered | Archive raw to external drive, keep the FCP project as a reference under `reels/fcp-projects/` |
| `Pilates-by-Menukhah` | Separate brand (Menukhah's Pilates) flyer work | **Keep separate** — it's a different brand. Link from OS as a "satellite project." |
| `db-marketing-skills-main` | The hub (above) | **Promote to top-level OS** |
| `db-reel-kit` | The "reel factory" template — house-style guide, scripts, brand assets, three production pipelines (Remotion / FCP / HTML+Playwright) | Merge contents into hub: scripts → `scripts/`, house-style → `brand-context/`, templates → `templates/` |
| `db-sparring-reels` | Two completed FCP sparring reels with raw footage | Archive raw, keep FCP project as reference |
| `db-weekly-highlights` | A working 45-second weekly Remotion reel — referenced as the **gold standard** in db-reel-kit | Fold into `reels/` as `WeeklyHighlights.tsx` (or recreate with Phase 1/2 effects) |

### What's wired up externally

- **MindBody** (Site ID 706438) — class scheduling, client records, enrollment. Source of truth for members.
- **Upload-Post SDK** — publishing to IG/FB/Threads under `dbelitefitness`.
- **ElevenLabs** — VO with house voice `qVpGLzi5EhjW3WGVhOa9`.
- **Resend** — transactional email. Currently only fires the "new lead → Don" ping from the Summer Camp form. A separate `db-email-kit` lives on the Mac mini at `~/.openclaw/workspace/db-email-kit` and is what `skills/email-campaign.md` actually sends through (this repo writes the brief + copy + template; the kit sends).
- **Vercel** — landing-page hosting + serverless form handler.
- **Ajeo external drive** — `/Volumes/Ajeo/Projects/Different Breed/Media Library/` with 2,471 photos and 2,395 videos, fully Gemini-indexed with quality scores.

### What's NOT wired up yet (the gaps)

- **No central leads store.** The Summer Camp form emails Don but doesn't write a leads file. Lost-lead recovery is manual.
- **No IG-DM ingestion.** DMs aren't pulled anywhere; today they live only in Joey's phone.
- **No follow-up sequences wired to leads.** The `db-email-kit` on the Mac mini can send, and `skills/email-campaign.md` documents how to author a campaign — but no sequence is *triggered* by lead state today. Welcome flows, 24-hour follow-ups, and win-backs are still manual.
- **No CRM-style timeline per person.** No "what has this parent seen / opened / replied to."
- **No visible OS-level dashboard.** You have to go look at calendar.json, the Vercel project, the cron on the Mac mini to know what's running.

---

## 3. Proposed OS Structure (top-level under ``)

Same hub, lightly reorganized. Bold = new or significantly changed. Italics = mostly unchanged.

```

├── CLAUDE.md                  ← THE CONTROL PANEL (rewritten, see §4)
├── PASSDOWN.md                ← What's mid-flight today
├── README.md                  ← Public-facing intro
│
├── brand-context/             ← Single source of truth for "who DB is"
│   └── (existing 8 files + absorbed house-style.md, coaches.json from db-reel-kit)
│
├── skills/                    ← What Claude can DO
│   ├── (existing 11 skills)
│   ├── lead-capture.md        ← NEW: form handlers, IG DM intake, leads.json schema
│   ├── lead-followup.md       ← NEW: Resend sequences, tag-based triggers
│   ├── landing-page-deploy.md ← NEW: vercel deploy flow as a first-class skill
│   └── reel-factory.md        ← NEW: absorbed from db-reel-kit (Remotion / FCP / HTML pipelines)
│
├── campaigns/                 ← One folder per campaign, each self-contained
│   ├── summer-camp-2026/      (active)
│   ├── jack-jill-2026-04-18/  (in production)
│   ├── the-coliseum/          (scheduled)
│   └── _archive/              ← NEW: completed campaigns
│       ├── march-madness-2026/
│       └── kids-boxing-reel-2026-03/
│
├── content-calendar/
│   └── calendar.json          ← Existing posts pipeline
│
├── leads/                     ← NEW: the CRM layer
│   ├── leads.json             ← Central state file, mirrors calendar.json pattern
│   ├── schema.json
│   ├── ingest-form.mjs        ← Called by landing-page/api/register.js
│   ├── ingest-dm.mjs          ← Manual CLI for now: paste DM → categorize
│   └── sequences/             ← Resend templates per campaign
│       ├── camp-welcome.md
│       ├── camp-followup-24h.md
│       └── trial-class-invite.md
│
├── landing-page/              ← Camp page (existing). Future pages live alongside.
│   └── summer-camp-2026/
│       └── (existing index.html, api/, assets/, photos/)
│
├── reels/                     ← Single Remotion project, all reels live here
│   ├── src/cinematic-effects/ (existing)
│   ├── src/                   (existing compositions + absorbed:
│   │                            WeeklyHighlights.tsx, InbodyReel.tsx, KidsBoxing.tsx)
│   └── fcp-projects/          ← NEW: archive .fcpxml files, link to external raw
│
├── templates/                 ← NEW: scaffolds for new things
│   ├── new-campaign/          (folder skeleton)
│   ├── new-landing-page/
│   ├── new-reel/
│   └── new-email-sequence/
│
├── scripts/                   ← Existing + absorbed from db-reel-kit
│
├── cinematic-site-components/ ← Reference, unchanged
├── brand-kit/                 ← Unchanged
├── print/                     ← Unchanged
└── output/                    ← Unchanged (gitignored)
```

**What changes structurally:**

- `leads/` is the new big addition — the CRM half of the OS.
- `templates/` formalizes "how to start a new campaign / landing page / reel" so Claude doesn't reinvent the folder shape every time.
- `landing-page/` becomes a parent that holds one folder per page (today it's just summer-camp; soon there will be more).
- `reels/` absorbs the standalone reel projects so there's only one Remotion project to maintain.
- `campaigns/_archive/` is where finished campaigns go to rest, so the live `campaigns/` list stays scannable.

---

## 4. The Control Panel — `CLAUDE.md` outline

Today's CLAUDE.md is a great "manual." For an OS, it should also be a **dashboard** — what's live, what's in flight, who's on cron, what the inboxes look like. Proposed new sections (additions in **bold**, existing in italics):

```
# Different Breed Elite Fitness — AI Operating System

## Right Now (refresh on every session)
**Active campaigns:** Summer Camp 2026 (Phase 1 live), Jack & Jill 2026-04-18 (preview pending)
**On cron:** Daily schedule story (Mac mini @ Noah's, 12:01 AM ET)
**Open leads:** {count from leads/leads.json with status=new}
**Posts ready for approval:** {count from calendar.json with status=ready}
**Last deploy:** {git log of landing-page/}

## How This Works
*(existing section — minor edits)*

## Brand Context
*(existing section)*

## Skills
*(existing list + 4 new skills marked NEW)*

## Lead Pipeline (NEW)
- Form leads → landing-page/api/register.js → MindBody enroll + Resend ping Don + leads/leads.json append
- IG DM leads → manual paste via skills/lead-capture.md → leads/leads.json
- Followup → skills/lead-followup.md drives Resend sequences keyed off leads.json status
- Status flow: new → contacted → trial-booked → enrolled | lost

## Campaign Index
*(table: name, status, owner, key URL, key dates — generated from campaigns/*/STATUS.md)*

## Cron / Automated Jobs (NEW)
| Job | Where it runs | Schedule | Last success |
| daily-schedule-story | Mac mini @ Noah's | 0 1 * * * ET | (read from log) |

## Rules
*(existing — unchanged)*

## Orchestration
*(existing — extend with the lead-capture flow)*
```

The "Right Now" header at the top means every time you (or Claude) open the OS, you can see the state of the world without digging.

---

## 5. New Skills to Add (CRM v1)

### `skills/lead-capture.md`
- **Schema for `leads/leads.json`** — see `leads/schema.json` (already scaffolded). Sources include `form`, `manychat`, `ig-dm-manual`, `fb-dm-manual`, `walk-in`, `referral`, `phone`.
- **Form ingestion** — `landing-page/<page>/api/register.js` is updated to also POST the lead to `leads/ingest-form.mjs` (or write directly to leads.json if running on the same box).
- **Manychat ingestion** — Manychat Pro flow tags a subscriber as `dm-lead-*` → External Request webhook → `leads/ingest-dm.mjs` dedupes and appends. Stub: `leads/integrations/manychat.md`.
- **Manual ingestion** — Claude prompt: paste an IG/FB DM thread or "Joey gave me a name at the front desk."

### `skills/lead-followup.md`
- **Sequences live in `leads/sequences/*.md`** — each is a markdown file with subject + body + send-after-days metadata.
- **Tag-driven triggers** — when a lead is tagged `camp-interested-no-signup`, Claude pulls the matching sequence and sends via Resend.
- **Approval gate** — same as the post pipeline. Claude drafts the email, you approve, Claude sends.
- **History writeback** — every send appends to `leads[].history[]` so the timeline is preserved.

### `skills/landing-page-deploy.md`
- Currently the deploy flow lives in PASSDOWN.md and people's heads. Make it a real skill: which folder, which Vercel scope, which env vars to check, what to do when a build fails.
- Documents the convention: every landing page lives at `landing-page/<page-name>/`, each has its own `vercel.json` and `.env.local`.

### `skills/reel-factory.md`
- Absorb the contents of `db-reel-kit/README.md`. Documents the three production pipelines (Remotion / FCP / HTML+Playwright), when to use each, and links to templates.

---

## 6. Sibling Folders — Disposition

| Folder | Disposition | Notes |
|---|---|---|
| `Different Breed Elite Fittness Site` | **Archive in full (v1.1 update)** | SvelteKit main-gym site rebuild. Per Joey: this folder is a false start that should be cleaned out — but the next main-gym page is absolutely on the table; it just starts fresh from `templates/new-landing-page/`. Move to external-drive archive (`/Volumes/Ajeo/.../_archive/`). |
| `Different Breed March Madness` | **Archive** → `campaigns/_archive/march-madness-2026/` | Just a PDF. |
| `Different-Breed-Inbody-Reel` | **Fold into `reels/`** as `src/InbodyReel.tsx`. Move brandkit/ contents into central brand-kit if anything's missing. Archive the standalone folder. |
| `Kids-Boxing` | **Move FCP project** to `reels/fcp-projects/kids-boxing/`. **Move 5.6 GB raw clips** to external drive (Ajeo). Keep `clip-analysis.json` in the repo. |
| `Pilates-by-Menukhah` | **Sub-brand class, not separate (v1.1 update).** This is the women-only Core Control Pilates class on the MindBody schedule. Fold flyer assets into `campaigns/` or `output/` as class-marketing material; reference the class page at `Corecontrollandingpage/`. No separate brand context needed. |
| `db-marketing-skills-main` | **The OS** | Promote. |
| `db-reel-kit` | **Absorb** — scripts → `scripts/`, brand → `brand-kit/` (verify nothing newer in there), templates → `templates/`, reference docs → `brand-context/` (house-style.md, coaches.json), house-style merged into `brand-context/visual-style-guide.md`. Then archive. |
| `db-sparring-reels` | **Move FCP projects** to `reels/fcp-projects/sparring/`. Raw → external drive. |
| `db-weekly-highlights` | **Re-import** as `reels/src/WeeklyHighlights.tsx` so the gold-standard reel is alongside the Phase 1/2 effects. Then archive the standalone. |

---

## 7. Phased Migration (no moves yet — proposed order when you green-light)

**Phase A — Promote the hub (low risk, ~1 session)**
- Rewrite `CLAUDE.md` with the new "Right Now" header and the cron/lead/campaign sections (data is faked initially; Phase D wires it in for real).
- Create `templates/`, `leads/`, `campaigns/_archive/` as empty scaffolds with READMEs.
- No file moves yet — just new structure.

**Phase B — Absorb db-reel-kit (~1 session)**
- Diff `db-reel-kit/brand/` against `brand-kit/`. Copy anything newer.
- Move `db-reel-kit/scripts/` into `scripts/` (rename to avoid collisions).
- Merge `db-reel-kit/reference/house-style.md` into `brand-context/visual-style-guide.md`.
- Merge `db-reel-kit/reference/coaches.json` against `brand-context/coaches-and-staff.md` (the .md is the human source; .json should derive from it).
- Write `skills/reel-factory.md` from the README.
- Verify nothing breaks. Then move `db-reel-kit/` itself to an `_archive_external/` outside the repo.

**Phase C — Fold standalone reels (~1 session)**
- Re-create `db-weekly-highlights` and `Different-Breed-Inbody-Reel` as compositions inside `reels/src/` using BrandStyles.ts and the Phase 1/2 effects where appropriate.
- Move FCP-based projects (Kids-Boxing, db-sparring-reels) to `reels/fcp-projects/` with clip-analysis.json kept and raw clips offloaded.
- Archive standalone folders.

**Phase D — Build the lead pipeline (~2 sessions)**
- Write `leads/schema.json` and `leads/leads.json` (empty initial state).
- Write `skills/lead-capture.md` and `skills/lead-followup.md`.
- Update `landing-page/summer-camp-2026/api/register.js` to also write the lead to `leads/leads.json` (or POST to a small ingestion endpoint we run locally).
- Write the first 2-3 Resend sequences as markdown templates under `leads/sequences/`.
- Backfill: process all known Summer Camp form submissions from Don's email into leads.json so we start with real data.

**Phase E — Wire the dashboard (~1 session)**
- Make the "Right Now" header in CLAUDE.md actually pull live counts via small bash one-liners that Claude runs on session start.
- Optionally: create a Cowork artifact (`mcp__cowork__create_artifact`) that re-renders these counts and the campaign index as a real visual dashboard you open in the sidebar each morning.

---

## 8. Open Questions for Joey (need answers before I start moving files)

1. ~~**Lead-capture write path**~~ — **resolved 2026-04-26 (Joey):** `leads/leads.json` is the write target for now. Implementation sub-questions still open for Phase D: (a) does the Vercel function commit to the repo via the GitHub API? (b) or is there a small ingestion endpoint somewhere with disk access to the file? (c) or does a cron on the Mac mini pull from a queue (Resend webhook? Vercel KV?) and write the file? Pick when wiring Phase D — destination is settled.

2. ~~**Manychat ingestion**~~ — **reframed 2026-04-26 (Joey):** API key on file. Joey's Manychat is essentially empty, so there are no existing conventions to inherit — instead, Claude proposes the v1 buildout (custom fields, tags, flows, growth tools, AI Step config, webhook receiver location) in `leads/integrations/manychat-design.md`. Joey reviews/edits, then we build together (some via UI, some via API once the sandbox proxy is sorted). Webhook receiver location decided in the design: Vercel function in `landing-page/api/manychat-webhook.js`. The remaining sub-questions (AI Step yes/no for v1, comment-trigger keyword style, handoff routing, subscriber backfill) are scoped at the bottom of the design doc and don't block buildout.

3. ~~**Pilates-by-Menukhah**~~ — **resolved (v1.1):** sub-brand class, not separate.

4. ~~**Different Breed Elite Fittness Site**~~ — **resolved (v1.1):** archive in full, false start.

5. ~~**Archive location**~~ — **resolved 2026-04-26 (Joey):** Ajeo external drive at `/Volumes/Ajeo/Projects/Different Breed/_archive/`. Workflow stays as documented: stage in workspace `/Different Breed/_archive/` first (Claude's sandbox can't reach Ajeo), then Joey flushes via Finder drag or rsync when convenient.

6. ~~**Cron visibility**~~ — **resolved 2026-04-26 (Joey):** worth doing. Scaffold added at `cron/` (README, schema.json, empty heartbeat.json). CLAUDE.md "Right Now" header now reads `cron/heartbeat.json` on session start. **Mac-mini-side change still needed:** Joey or Noah adds a 10-line post-step to `launchd-runner.sh` (and similar wrappers) that PATCHes `cron/heartbeat.json` and appends to `cron/heartbeat.jsonl` via the GitHub API using a fine-grained PAT (`GITHUB_TOKEN_DBE_OS` in `~/.openclaw/secrets.env`). See `cron/README.md` for the full design.

---

## What I'll do next (when you approve)

When you say go, I'll start with **Phase A** — rewrite CLAUDE.md and scaffold `leads/`, `templates/`, `campaigns/_archive/` — because it's reversible and gives you the new shape to react to before we touch any actual content.
