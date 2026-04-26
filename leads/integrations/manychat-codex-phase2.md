# Manychat Phase 2 — Codex Playbook

**Audience:** A computer-use agent (Codex) with browser + terminal access on Joey's Mac.
**Mission:** Take Joey's Manychat from "Phase 1 done (custom fields, tags, default greeting, camp qualifier)" → "Phase 2 done (class qualifier, handoff with email-to-Don, AI Step, growth tools, backfill export)."
**Source of truth for design:** `leads/integrations/manychat-design.md` in this repo. This playbook is self-contained — every value, prompt, and field name you need is below.
**Approval gate:** None of the flows you build should be set "live" until Joey reviews. Save as draft. The playbook flags every step that requires Joey's eyes before publish.

---

## Step 0 — Verify Phase 1 baseline (run before anything else)

Open Terminal on Joey's Mac and run:

```bash
bash '/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/leads/integrations/manychat-audit.sh'
```

This dumps the current Manychat structural state (flows, tags, custom fields, growth tools, OTN topics, widgets) to:

```
/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/leads/integrations/manychat-audit-raw/<timestamp>/
```

The folder is gitignored. Open `_INDEX.json` in that folder and confirm:

- `page_getCustomFields.json` — should contain the 8 custom fields listed in §A below. If any are missing, build them in Step 1A before continuing.
- `page_getTags.json` — should contain the tags listed in §A below. Missing → build in Step 1B.
- `page_getFlows.json` — should contain "Default Greeting" and "Camp Qualifier" (or names close to those). If neither exists, you're not in "Phase 1 done" state — stop and tell Joey.

**Save the audit folder path** — you'll re-run the audit at the end (Step 6) to verify your work.

---

## §A — Reference: what should already exist (Phase 1)

If any of this is missing, build it before moving on. UI path: **Manychat → Settings → Audience**.

### Custom Fields (subscriber-level)

| Name | Type |
|---|---|
| `parent_name` | Text |
| `parent_phone` | Phone |
| `parent_email` | Email |
| `athlete_name` | Text |
| `athlete_age` | Number |
| `package_interest` | Text |
| `dm_origin_topic` | Text |
| `mindbody_client_id` | Text |

### Tags

Source: `src-comment-trigger`, `src-story-mention`, `src-keyword`, `src-link-click`, `src-manual`
Interest: `interest-camp`, `interest-pilates`, `interest-kids-boxing`, `interest-adult-boxing`, `interest-general`
Status: `status-new`, `status-qualified`, `status-trial-booked`, `status-enrolled`, `status-lost`
Special: `parent-of-athlete`, `do-not-message`, `human-handoff`, `vip-referral`

---

## Step 1 — Backfill any missing fields/tags

If the Step 0 audit showed missing items from §A, build them now. UI:

1. **Manychat → Settings → Audience → Custom User Fields → + New Custom Field**.
   - Enter the name **exactly** (case + underscores must match). Pick the type from the table.
   - Repeat for each missing field.
2. **Manychat → Settings → Audience → Tags → + New Tag**.
   - Enter the tag name exactly. No description needed.
   - Repeat.

Verify by re-running Step 0's audit on just `page_getCustomFields` and `page_getTags`.

---

## Step 2 — Build Flow 3: Class Qualifier

UI path: **Automation → Flows → + New Flow → Name it: `Class Qualifier`**.

This flow has THREE near-identical branches (one per non-camp class). Build it as a single flow with a branch step at the top.

### 2A. Trigger

Set trigger: **Tag Applied** → fires when ANY of these tags is set:
- `interest-pilates`
- `interest-kids-boxing`
- `interest-adult-boxing`

### 2B. Branch step

Add a **Condition** block right after the trigger:
- If user has tag `interest-pilates` → branch P
- Else if user has tag `interest-kids-boxing` → branch K
- Else if user has tag `interest-adult-boxing` → branch B

### 2C. Branch P — Pilates qualifier

Send messages in order:

1. **Message:** `Core Control Pilates with CJ — small classes, no fluff. Want to book a trial?`
2. **Quick replies:** `Yes, book me` / `Just info for now`
3. If `Yes, book me`:
   a. **User Input → Text** → save to `parent_name` → prompt: `What name should we book it under?`
   b. **User Input → Phone** → save to `parent_phone` → prompt: `Best phone for a text reminder?`
   c. **User Input → Email** → save to `parent_email` → prompt: `Email for the booking confirmation?`
   d. **Action → Set Field** → `dm_origin_topic` = `pilates`
   e. **Action → Set Tag** → `status-qualified`
   f. **External Request** → see §C below
   g. **Message:** `Got it, {{first_name}}. CJ will text you today with a trial slot.`
4. If `Just info for now`:
   a. **Action → Set Tag** → `interest-general` (so Flow 4 picks them up later)
   b. **Message:** `Cool — schedule's at pilates.differentbreedsportsacademy.com. Holler when you're ready.`

### 2D. Branch K — Kids Boxing qualifier

Same shape as 2C but with this messaging and the extra athlete fields:

1. **Message:** `Kids Boxing — Mon & Wed at 4 PM with Glenda. Want to book a trial for your kid?`
2. **Quick replies:** `Yes, book a trial` / `Send me the schedule`
3. If `Yes, book a trial`:
   a. Capture `parent_name` (Text, prompt: `Your name?`)
   b. Capture `parent_phone` (Phone, prompt: `Best number to reach you?`)
   c. Capture `parent_email` (Email, prompt: `Email for the booking confirmation?`)
   d. Capture `athlete_name` (Text, prompt: `What's your kid's name?`)
   e. Capture `athlete_age` (Number, prompt: `How old?`)
   f. **Set Field** → `dm_origin_topic` = `kids-boxing`
   g. **Set Tag** → `status-qualified` AND `parent-of-athlete`
   h. **External Request** → §C
   i. **Message:** `You're locked in. Glenda will text you today with the next class slot.`
4. If `Send me the schedule`:
   a. **Set Tag** → `interest-general`
   b. **Message:** `Mon & Wed at 4 PM. Pull up to 1234 [insert real address from brand-context if known], we'll get you set.`

### 2E. Branch B — Adult Boxing qualifier

Same as 2D but:
- Coach references go to "Don" not "Glenda"
- Prompt 1: `Adult boxing — sparring nights and tech sessions. Want to come check it out?`
- Skip the athlete_name and athlete_age captures (it's the user themselves)
- Set Tag: `status-qualified` (no `parent-of-athlete`)
- `dm_origin_topic` = `adult-boxing`

### 2F. Save as DRAFT

**Do NOT publish.** Set the flow's status to Draft. Joey reviews before going live.

---

## Step 3 — Build Flow 4: Handoff (interim email-to-Don design)

UI path: **Automation → Flows → + New Flow → Name it: `Handoff`**.

### 3A. Trigger

Set trigger: **Tag Applied** → fires when tag `human-handoff` is set.

(Other flows — including the AI Step in Step 4 — will set this tag when they want to escalate.)

### 3B. Steps

1. **Action → Send Email** (this is the v1 interim notification — single email to Don who dispatches manually).
   - **To:** Joey's `LEAD_NOTIFY_EMAIL` value. **Codex: get this value by reading `/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/landing-page/.env.local` line that starts with `LEAD_NOTIFY_EMAIL=`.** Do not paste it into any other doc or tracked file.
   - **Subject:** `🥊 DM handoff — {{first_name}} ({{dm_origin_topic}}) — needs reply`
   - **Body** (paste verbatim, keep the mustache variables literal — Manychat will substitute):
     ```
     Lead: {{first_name}} {{last_name}} (IG: @{{ig_username}})
     Interest: {{dm_origin_topic}}
     Captured: {{date_now}}
     Phone: {{parent_phone}} (if given)
     Email: {{parent_email}} (if given)

     Last 3 messages from the user:
     > {{last_input_text}}

     Open in Manychat: https://app.manychat.com/fb{{page_id}}/cms/conversations/{{user_id}}

     —
     Routed by Manychat handoff. Reply directly in Manychat (or hand off to the right coach).
     Steady-state routing (when the coaches install Manychat):
       interest-pilates → CJ (@cjbean122) — only program with a dedicated POC
       Everything else → Don (@the_4_corners) — fallback until per-program POCs confirmed
     ```
2. **Message** (sent to the IG user, not Don):
   - `Pulling in a coach — back to you within a few hours.`
3. **Action → Send Notification (Manychat in-app)** — send to Joey's account as a backup notification so he sees it even if email goes to spam. Subject: same as the email.

### 3C. Save as DRAFT.

---

## Step 4 — Configure the AI Step (inside Flow 4)

UI path: open Flow 4 (the Handoff flow you just built) → **+ Step → AI Step** at the very top, before the trigger condition.

Wait — that's the wrong place. Re-do: AI Step lives in a SEPARATE flow that PRECEDES Flow 4.

### 4A. Build a new flow: `AI Triage`

UI: **Automation → Flows → + New Flow → Name: `AI Triage`**.

Trigger: **Default Reply** (or whatever Phase 1 used for its catchall) → set this only if there's no existing default-reply trigger that would conflict. If there IS one, edit that flow instead and add the AI Step before its current first message.

### 4B. Add the AI Step

Inside `AI Triage`:

1. **+ Step → AI Step**
2. **Persona / Instructions** (paste verbatim):
   ```
   You are the AI assistant for Different Breed Elite Fitness, a boxing and fitness gym in NJ.
   Speak like a coach talking to an athlete — gritty, motivational, no corporate fluff.
   Never quote prices unless they are in the knowledge base verbatim.
   Never book a trial yourself — defer to a coach by setting the human-handoff tag.
   If you don't know, say so and offer to pull in a coach.
   Always credit @veteranwithacamera if asked who shoots our reels.
   Keep replies under 60 words.
   ```
3. **Knowledge Base** — paste this composed snippet (it's a condensed version of brand-context that fits Manychat's AI Step character cap; do NOT paste the full files):
   ```
   Different Breed Elite Fitness — boxing + fitness gym, North Bergen NJ.
   Tagline: Evolve Into Greatness. IG: @differentbreedsportsacademy.

   Schedule (always check pilates.differentbreedsportsacademy.com for live booking):
   - Kids Boxing: Mon & Wed 4 PM (Coach Glenda @gfitbyglenda)
   - Core Control Pilates with CJ (@cjbean122): Wed 7:15 PM, Fri 5:30 AM, Sun 8 AM (Women Only), Sun 10:30 AM
   - Pilates with Nessa (@ohsonessaa): Wed 9 AM
   - Adult boxing / sparring: ask a coach for current slots

   Summer Camp 2026 — ages 11–16, 9 weeks.
   Packages: Full Camp $3,015 / 4-Week Block $1,460 / Weekly $420 / Daily $84 / Drop-in $110.

   Owner: Don Sommerville (Golden Gloves champ, @the_4_corners).

   Voice rules: motivational, direct, coach-to-athlete. Never corporate.
   When user asks pricing not in this doc → set human-handoff.
   When user wants to book → set human-handoff.
   When user says stop/unsubscribe/remove me → set do-not-message tag, end politely.
   ```
4. **Fallback rules** — Manychat AI Step UI lets you configure when to escalate. Set:
   - "If AI confidence < 0.6" → action: Set Tag `human-handoff` → Go To: Flow 4 Handoff
   - "If user message contains any of: price, cost, how much, book, sign up, register, schedule a trial" → Set Tag `human-handoff` → Go To Flow 4
   - "If user asks for human/coach" → Set Tag `human-handoff` → Go To Flow 4
   - Max turns before forced handoff: 3

### 4C. Save as DRAFT.

---

## Step 5 — Growth Tools (4 entry points)

UI path: **Automation → Growth Tools → + New Growth Tool**.

Build all four. Save each as DRAFT (Manychat calls this "Inactive") until Joey activates.

### 5A. Comment Auto-Reply on IG posts

- Type: **Instagram → Comments**
- Trigger keywords (case-insensitive): `CAMP`, `INFO`, `PILATES`, `BOXING`, `KIDS BOXING`
- Action when matched:
  - Send a private DM: `Hey {{first_name}} — got you. Tap below to keep going.`
  - Set tag based on keyword:
    - `CAMP` or `INFO` → `interest-camp` + `src-comment-trigger`
    - `PILATES` → `interest-pilates` + `src-comment-trigger`
    - `BOXING` (alone) → `interest-adult-boxing` + `src-comment-trigger`
    - `KIDS BOXING` → `interest-kids-boxing` + `src-comment-trigger`
  - Trigger: subsequent flow fires automatically because the interest tag matches Flow 2 / Flow 3's tag-applied trigger.
- Apply to: **All eligible posts** (or specific posts if Manychat lets you scope it; Joey can refine later).

### 5B. Story Mention Reply

- Type: **Instagram → Story Mentions**
- Action: send DM `Appreciate the love, {{first_name}} 🥊 — what brings you to DB today?` with quick replies (Camp / Pilates / Kids Boxing / Adult Boxing / Just Saying Hi).
- Each quick reply sets the matching `interest-*` tag + `src-story-mention`.

### 5C. DM Keyword Trigger

- Type: **Instagram → Keywords**
- Trigger keywords (case-insensitive): `camp`, `pilates`, `kids boxing`, `schedule`, `join`, `trial`
- Action: set the matching `interest-*` tag + `src-keyword`. (`schedule`, `join`, `trial` → `interest-general`; let AI Triage figure it out from there.)

### 5D. Manychat Landing Page link

- Type: **Manychat Landing Page**
- Title: `Different Breed — Talk to Us`
- Action: set tag `src-link-click`. Send the same Default Greeting message as Flow 1.
- Joey will paste the resulting URL in the IG bio and on Vercel landing pages as a fallback contact.

---

## Step 6 — Re-run audit and verify

Open Terminal again and re-run:

```bash
bash '/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/leads/integrations/manychat-audit.sh'
```

A new timestamped folder appears. Open its `_INDEX.json` and confirm:

- `page_getFlows.json` now contains: Default Greeting (Phase 1), Camp Qualifier (Phase 1), Class Qualifier (you built), Handoff (you built), AI Triage (you built).
- `page_getGrowthTools.json` contains 4+ entries.
- All custom fields and tags from §A are present.

If anything is missing, fix it. If everything is present, leave the audit folder in place and tell Joey: "Phase 2 buildout done, all flows in DRAFT, ready for review. Audit folder: <path>."

---

## §C — External Request shape (for Flows 2 + 3 webhook step)

This is for the `External Request` block in qualifier flows. Configure each one identically:

- **URL:** `https://summer.differentbreedsportsacademy.com/api/manychat-webhook` (placeholder — the receiver isn't built yet; this URL will 404 until Claude ships Step D.5. **It's OK to set the URL to a placeholder for now**; Manychat will retry. Joey: tell Claude when this is up.)
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `X-Manychat-Signature: {{webhook_signature}}` (Manychat fills this)
- **Body** (JSON):
  ```json
  {
    "subscriber_id": "{{user_id}}",
    "ig_username": "{{ig_username}}",
    "first_name": "{{first_name}}",
    "last_name": "{{last_name}}",
    "parent_name": "{{parent_name}}",
    "parent_phone": "{{parent_phone}}",
    "parent_email": "{{parent_email}}",
    "athlete_name": "{{athlete_name}}",
    "athlete_age": "{{athlete_age}}",
    "package_interest": "{{package_interest}}",
    "dm_origin_topic": "{{dm_origin_topic}}",
    "captured_at": "{{date_now}}"
  }
  ```
- **On failure:** Manychat retries automatically. Don't set a fallback action — the email-to-Don in Flow 4 is the safety net.

---

## §D — Subscriber backfill (export step)

This is partially manual. Run after Step 6 succeeds.

1. **Manychat → Audience → All Subscribers** → click **Export**.
2. Choose CSV format. Include columns: subscriber_id, first_name, last_name, ig_username, phone, email, subscribed_at, last_interaction, all custom fields, all tags.
3. Save the export to `/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/leads/integrations/manychat-audit-raw/<timestamp>/subscribers-export.csv`.
4. Tell Claude the file is ready. Claude will write a small script that reads the CSV and appends each subscriber to `leads/leads.json` with `source: "manychat"`, `status: "lost"`, `channel_ref: <subscriber_id>`. Each existing IG conversation that hasn't engaged in 30+ days = a cold lead worth re-engaging in a future campaign.

---

## §E — Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| "Flow trigger conflicts with another flow" when saving | A Phase 1 flow has overlapping triggers | Open the conflicting flow, change trigger from "Default Reply" to "Tag Applied: interest-camp" (or similar), then retry |
| AI Step says "Pro feature required" | The account isn't on a tier with AI Step | Stop and tell Joey — may need to upgrade or use a Smart Reply block instead |
| External Request returns 404 in Manychat logs | Webhook receiver not yet built | Expected — Claude builds it in step D.5. Manychat retries automatically. |
| `manychat-audit.sh` returns HTTP 401 on every endpoint | Wrong API key | Re-check `/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/.env.local` — `MANYCHAT_API_KEY=3501534:...` |
| Custom field "Type" picker doesn't show "Phone" or "Email" | Older Manychat UI variant | Pick "Text" and Joey can convert later — captures still work |

---

## §F — What Codex should NOT do

- **Don't publish anything.** All flows save as Draft. Joey publishes after review.
- **Don't change Phase 1 flows.** If a Phase 1 flow ("Default Greeting", "Camp Qualifier") has issues, flag them in the final report rather than editing.
- **Don't pull subscriber-level data into any tracked file.** The CSV export from Step §D is fine because the destination folder is gitignored.
- **Don't paste the API key, the LEAD_NOTIFY_EMAIL value, or any subscriber PII into a tracked file or chat message.** Read those values from `.env.local` and the export CSV; reference them by env var name everywhere else.
- **Don't try to wire OS → Manychat sync (D.10).** That's a separate phase requiring API writes; out of scope for this playbook.

---

## Final report Codex should produce

A short text report Joey can scan in 2 minutes:

```
Phase 2 buildout — done <date>.

Flows built (status: DRAFT):
- Class Qualifier (3 branches: pilates / kids-boxing / adult-boxing)
- Handoff (sends email to LEAD_NOTIFY_EMAIL + Manychat in-app notification to Joey)
- AI Triage (with persona + KB + 3-rule fallback to Handoff)

Growth tools built (status: INACTIVE):
- Comment auto-reply on IG (5 keywords)
- Story mention reply (5 quick replies)
- DM keyword trigger (6 keywords)
- Manychat landing page (URL: <paste from Manychat>)

Audit dump location: <path from Step 6>

Open items / things Joey should check:
- <any failure modes encountered>
- <any conflicts with Phase 1 flows>
- <Codex's confidence that the AI Step persona prompt landed correctly>
```
