# Skill: Landing Page Deploy

**Status:** STUB. Documents the existing Summer Camp deploy flow as a first-class skill (Phase A); other class/camp pages will follow the same pattern (Phase D).

## Scope

This skill covers any DB landing page — class, campaign, or main gym. The earlier `Different Breed Elite Fittness Site/` and other main-gym attempts are being archived as false starts; they are not the basis for the next main-gym page. Start any new page from `templates/new-landing-page/`.

## Convention

Each page lives at `landing-page/<slug>/`:

```
landing-page/<slug>/
├── index.html          # single-file page (HTML + inline CSS + light JS)
├── api/
│   └── register.js     # Vercel serverless function (MindBody enroll + Resend ping + leads.json append)
├── assets/             # page-specific media
├── photos/
├── .env.local          # secrets (gitignored)
└── vercel.json         # deploy config
```

(Today, the only page is Summer Camp 2026 living directly under `landing-page/` rather than `landing-page/summer-camp-2026/`. Phase B will move it into the slug-folder convention.)

## Deploy command

```bash
cd landing-page/<slug>
vercel --prod --yes --scope joemacstevens-projects
```

Project name on Vercel is `db-<slug>`. Domain mapping done in the Vercel dashboard (e.g. `summer.differentbreedsportsacademy.com`).

## Required env vars

(See `landing-page/.env.local` for the camp page — same vars apply to any class/camp page that enrolls into MindBody.)

- `MINDBODY_API_KEY_DBE`
- `MINDBODY_SITE_ID` (706438)
- `MINDBODY_STAFF_USER`, `MINDBODY_STAFF_PASS`
- `MINDBODY_<CLASS>_ID` — the class schedule id this page enrolls into
- `LEAD_NOTIFY_EMAIL` (Don's email)
- `RESEND_API_KEY`
- `LEADS_INGEST_URL` (Phase D — where to POST the lead so it lands in `leads/leads.json`)

## Pre-flight checklist

Before running `vercel --prod`:

1. `index.html` opens cleanly in a browser, all images load.
2. Form posts succeed against the test endpoint with `MINDBODY_DRY_RUN=true`.
3. Resend test email lands in Don's inbox.
4. Brand context check: page sounds like DB (read `brand-context/voice-and-tone.md` first).

## Phase D additions

- Generalize `api/register.js` into a shared module so each new class page doesn't have to duplicate the MindBody+Resend+leads.json logic.
- Add CI step that lints all landing pages on every push.
