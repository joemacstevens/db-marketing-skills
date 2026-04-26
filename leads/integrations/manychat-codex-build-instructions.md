# Codex Build Instructions — ManyChat IG Lead Capture

**For:** Codex agent with computer-use, executing on Joey's Mac.
**Goal:** Build the IG comment trigger and the lead-capture flow in ManyChat. Data layer (tags + custom fields) is already set up via API — do NOT recreate those.
**Estimated time:** 30–60 min interactive.

---

## 0. What's already done — do not redo

The ManyChat data layer was already built via the public API. Verify these exist before starting the UI work; if any are missing, stop and tell Joey.

### Account

- **Page:** Different Breed Elite Fitness & Sports
- **Username:** DifferentBreedEliteFitness
- **Page ID:** 100873874674621
- **Plan:** Pro (confirmed)
- **Login:** https://app.manychat.com — Joey will log in himself; do not handle credentials.

### Tags already created (13)

Process: `dm-lead`, `qualified`, `dm-source-comment`
Interest: `interest-camp`, `interest-kids-boxing`, `interest-pilates`, `interest-adult-boxing`, `interest-general`
Status: `status-new`, `status-contacted`, `status-trial-booked`, `status-enrolled`, `status-lost`

### Custom user fields already created (4)

| Name | Type | Used for |
|---|---|---|
| `athlete_name` | text | The kid's name in kids programs |
| `athlete_age` | number | Athlete age in years |
| `interest` | text | Primary interest slug (e.g. `kids-boxing`) |
| `source_campaign` | text | Which IG post/campaign (slug, e.g. `apr-2026-kids-camp`) |

### Built-in fields you can use directly (no creation needed)

`first_name`, `last_name`, `full_name`, `email`, `phone`, `gender`, `profile_pic`, `locale`, `timezone`, `language`, `last_input_text`, `last_growth_tool_name`

---

## 1. The build — high level

You're building two things:

1. **IG Comment Auto-Reply growth tool** — Triggers on any IG post when someone comments the keyword `INFO`. Opens a DM, applies the `dm-lead` and `dm-source-comment` tags, and starts the flow below.

2. **Lead Capture Flow** — A single flow with branching by interest. Captures interest, athlete info (if relevant), and ends with a booking link. Final state: lead has `qualified` and `status-new` tags plus `interest` field set.

---

## 2. Flow Architecture — build this exact tree

```
START
  │
  ├─ Apply tag: dm-lead
  ├─ Apply tag: dm-source-comment
  ├─ Set field: source_campaign = "ig-comment-info-2026-04"
  │
  ▼
[MESSAGE 1 — Welcome + Quick Replies]
  │
  ▼
  Branch on user's quick-reply choice:
    ├─ "Kids Boxing"   → KIDS_BOXING_PATH
    ├─ "Adult Boxing"  → ADULT_BOXING_PATH
    ├─ "Pilates"       → PILATES_PATH
    ├─ "Summer Camp"   → CAMP_PATH
    └─ "Just looking"  → GENERAL_PATH

KIDS_BOXING_PATH:
  - Set field: interest = "kids-boxing"
  - Apply tag: interest-kids-boxing
  - [MESSAGE — ask child's name → User Input → save to athlete_name]
  - [MESSAGE — ask child's age → User Input (number) → save to athlete_age]
  - GOTO BOOK_GENERAL

ADULT_BOXING_PATH:
  - Set field: interest = "adult-boxing"
  - Apply tag: interest-adult-boxing
  - GOTO BOOK_GENERAL

PILATES_PATH:
  - Set field: interest = "pilates"
  - Apply tag: interest-pilates
  - GOTO BOOK_PILATES

CAMP_PATH:
  - Set field: interest = "camp"
  - Apply tag: interest-camp
  - [MESSAGE — ask child's name → User Input → save to athlete_name]
  - [MESSAGE — ask child's age → User Input (number) → save to athlete_age]
  - GOTO BOOK_GENERAL

GENERAL_PATH:
  - Set field: interest = "general"
  - Apply tag: interest-general
  - GOTO BOOK_GENERAL

BOOK_PILATES:
  - [MESSAGE — booking link, pilates URL]
  - Apply tags: qualified, status-new
  - END

BOOK_GENERAL:
  - [MESSAGE — booking link, general URL]
  - Apply tags: qualified, status-new
  - END
```

---

## 3. Exact message copy

Use these strings verbatim. Emojis included intentionally.

### Welcome message (after IG comment trigger fires)

```
Hey {{first_name}}! 👊 Thanks for reaching out.

Quick Q — which program caught your eye?
```

**Quick replies** (5 buttons, in this order):
1. `🥊 Kids Boxing`
2. `🥊 Adult Boxing`
3. `🧘 Pilates`
4. `☀️ Summer Camp`
5. `👀 Just looking`

### Ask child's name (kids boxing + camp paths)

```
Love it 💪 What's your child's name?
```

(Use a User Input node, save the response to custom field `athlete_name`, type: text.)

### Ask child's age (kids boxing + camp paths)

```
Got it. And how old are they?
```

(Use a User Input node, save the response to `athlete_age`, type: number. Add validation: 4–17. On invalid input retry once with: `Just a number from 4 to 17 — how old are they?`)

### Booking message — Pilates path

```
Perfect — Core Control Pilates is one of our favorites. Here's where to grab a spot 👇

🔗 pilates.differentbreedsportsacademy.com

You'll see the schedule and can book directly. We'll be in touch to make sure you're all set! 🧘
```

### Booking message — All other paths (kids boxing, adult boxing, camp, general)

```
Perfect — here's the link to get started 👇

🔗 differentbreedsportsacademy.com

You'll see all classes and can book directly. We'll be in touch shortly to make sure you're all set. Train different! 🥊
```

---

## 4. Step-by-step UI build

### 4A. Open ManyChat and verify account

1. Open Chrome, navigate to `https://app.manychat.com`.
2. Wait for Joey to log in if not already.
3. Confirm top-left page selector reads **Different Breed Elite Fitness & Sports**. If a different page is shown, switch to it before doing anything.
4. Take a screenshot for Joey.

### 4B. Verify the data layer (do not skip)

1. In left nav, go to **Settings → Tags**. Confirm all 13 tags listed in §0 are present. If any are missing, STOP and tell Joey.
2. Go to **Settings → Fields → User Fields**. Confirm all 4 custom fields from §0 are present. If missing, STOP.
3. Screenshot both for Joey.

### 4C. Build the flow first (then wire trigger to it)

1. Left nav → **Automation → Flows** (or "Flows" depending on UI version).
2. Click **+ New Flow**.
3. Name it: `IG Lead Capture v1`.
4. Channel: select **Instagram**.
5. Click **Create**.

You'll land in Flow Builder with one empty starter node. From here, build the tree per §2 using these node types:

| Logical step | ManyChat node type |
|---|---|
| Send a message + quick replies | "Send Message" with Quick Replies |
| Branch on quick reply | Each Quick Reply has its own outgoing connector to the next node |
| Set a custom field value | "Action" node → "Set Custom Field" |
| Apply a tag | "Action" node → "Add Tag" |
| Ask user for input + save | "User Input" node, configured to save to a specific custom field |
| End / final message | "Send Message" (no outgoing connectors) |

**Build order recommendation** (build the trunk first, branches second):

1. Configure the start node: add 3 actions — Add Tag `dm-lead`, Add Tag `dm-source-comment`, Set Field `source_campaign` = `ig-comment-info-2026-04`.
2. Add the welcome message node with the 5 quick replies (copy from §3).
3. From each quick-reply, drag a connector to a placeholder node — gives you 5 branches stubbed.
4. Build each branch top-down per §2. For Kids Boxing and Camp: add the User Input nodes for `athlete_name` then `athlete_age`. Other branches go straight to the booking message.
5. Build the two booking endings (`BOOK_PILATES` and `BOOK_GENERAL`). Wire the `qualified` and `status-new` tag actions BEFORE the final message so they fire even if the user doesn't reply.
6. Save flow. Look for any red error icons on nodes — fix before moving on.

**Validation in Flow Builder:**

- Every quick reply must connect to a downstream node (no dangling).
- Every User Input must specify the target custom field and type.
- Every tag action must reference a tag that exists.
- The final two booking messages should have NO outgoing connectors.

Screenshot the saved flow for Joey before continuing.

### 4D. Build the IG Comment Auto-Reply trigger

1. Left nav → **Automation → Instagram → Comments** (label may vary slightly: "Comment Reply", "Comment Auto-Reply", or under "Growth Tools → Instagram Comment").
2. Click **+ New Comment Reply** (or equivalent).
3. Name: `IG Comment - INFO keyword`.
4. **Posts to monitor:** select **All eligible posts** (or "All Posts" depending on UI).
5. **Trigger keyword:** `INFO` (uppercase). If there's a "match" mode, choose **contains** or **exact** — prefer **contains** so `info`, `Info`, `INFO!` all trigger.
6. **Reply in comments:** turn this OFF if it asks (we want the bot to DM only, not public-reply).
7. **Send DM:** turn ON. Set the DM to **Open existing flow** → select `IG Lead Capture v1`.
8. Save and **enable** the trigger (toggle to active/on).

### 4E. Smoke test

1. Joey opens IG on his phone, navigates to any DB post.
2. Comments the word `INFO` from a *different* IG account (his personal, or have a coach do it).
3. Within ~30 seconds, that account should receive a DM with the welcome message.
4. Run through one full path (e.g. Kids Boxing → kid's name → kid's age → receives booking link).
5. Back in ManyChat, find that subscriber: **Audience → Subscribers**. Confirm:
   - Tags applied: `dm-lead`, `dm-source-comment`, `interest-kids-boxing`, `qualified`, `status-new`.
   - Field `interest` = `kids-boxing`.
   - Field `athlete_name` and `athlete_age` set.
   - Field `source_campaign` = `ig-comment-info-2026-04`.
6. Screenshot the subscriber detail for Joey.

If anything fails, do NOT keep clicking — screenshot the error state and report to Joey.

---

## 5. Things that can go wrong + what to do

| Symptom | Likely cause | Action |
|---|---|---|
| IG account not connected in ManyChat | Joey hasn't authorized IG | Stop. Joey needs to go Settings → Instagram → Connect. |
| "Posts to monitor" greyed out | IG Professional Account not linked, or post permissions missing | Stop. Joey re-authorizes in Settings. |
| Tag dropdown empty | Logged into wrong page | Stop. Switch page (top-left selector). |
| Quick reply count limit | ManyChat caps quick replies at 5 — that's why we have exactly 5 | OK by design. |
| User Input doesn't save to field | Forgot to set "Save reply to" config | Edit the node, set target field. |
| Comment trigger doesn't fire on test | (a) Trigger disabled, (b) tested from same IG that owns the page (self-comments don't trigger), (c) post is too old | Verify all three. Test from a separate IG account. |
| 24-hour Messaging Window error | Instagram Graph API rule — bot can't initiate cold; this only sends after the user comments | Should not block this build because comment counts as opt-in. |

---

## 6. Out of scope for this build (do not attempt)

- Webhook → `leads/leads.json` integration (Phase D — wire after this build is stable).
- Multi-source attribution (story replies, bio link, FB Messenger) — separate growth tools, build after this works.
- Drip / nurture sequences — separate task once we have leads flowing.
- Member comms broadcast tagging — separate task.

---

## 7. When done, report back to Joey with:

1. Screenshot of saved flow in Flow Builder.
2. Screenshot of comment trigger config (enabled).
3. Screenshot of test subscriber detail showing all expected tags + fields populated.
4. Any deviations from this doc (e.g. UI label was different, you used "exact" match instead of "contains", etc.).

---

## Appendix: Field/tag IDs (for any API debugging)

```
Tags:
  dm-lead                86253344
  qualified              86253345
  dm-source-comment      86253346
  interest-camp          86253347
  interest-kids-boxing   86253348
  interest-pilates       86253349
  interest-adult-boxing  86253350
  interest-general       86253351
  status-new             86253352
  status-contacted       86253353
  status-trial-booked    86253354
  status-enrolled        86253355
  status-lost            86253356

Custom fields:
  athlete_name      14525432  (text)
  athlete_age       14525433  (number)
  interest          14525434  (text)
  source_campaign   14525435  (text)
```
