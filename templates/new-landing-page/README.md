# New Landing Page Template

**Use for:** any new DB landing page — a class (e.g. Core Control Pilates), a campaign (e.g. Summer Camp 2026), or the main gym site.

The earlier `Different Breed Elite Fittness Site/` and other main-gym attempts are being archived as false starts. They are not a precedent — start fresh from this scaffold.

## Copy to:

```bash
cp -r templates/new-landing-page landing-page/<page-slug>
```

## Files

- `index.html` — single-file page (HTML + inline CSS + light JS). Use cinematic-effects components from `cinematic-site-components/` if you want hero animations.
- `api/register.js` — Vercel serverless function. Mirror `landing-page/api/register.js` (Summer Camp) — MindBody enroll + Resend ping + write to `leads/leads.json`.
- `assets/`, `photos/` — page-specific media.
- `.env.local` — secrets (gitignored). Copy needed vars from `landing-page/.env.local`.
- `vercel.json` — deploy config.

## Deploy

See `skills/landing-page-deploy.md` (TBD — will be written in Phase D). For now, mimic Summer Camp:
```bash
cd landing-page/<page-slug> && vercel --prod --yes --scope joemacstevens-projects
```
