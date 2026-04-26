# Manychat — Starter Configuration Design

**Status:** Proposal. 2026-04-26.
**Context:** Joey's Manychat Pro account exists but is essentially empty. This doc is the v1 buildout proposal — what custom fields, tags, flows, and growth tools to set up so the IG DM channel becomes a real lead-capture surface that flows into `leads/leads.json`.
**Companion doc:** `manychat.md` (the integration overview / how leads land in `leads.json` once this is built).

## Design principles

1. **Manychat mirrors `leads/schema.json`.** Field names, tag stems, and status flow match what the OS expects, so the wiring is trivial later.
2. **Start small.** Three flows, not thirty. We can add more once we see what real DMs look like.
3. **Approval gate at every send.** AI Step is allowed for greetings and FAQ deflection only. Anything that quotes price, books a trial, or follows up after 24 hours bounces to Joey first.
4. **One source of truth per fact.** When a lead's status changes in `leads.json` (e.g. enrolled), the OS pushes that tag back to Manychat so the IG side stays in sync. Don't track status in two places.

---

## 1. Custom Fields (Subscriber-level)

These map 1:1 to `leads/schema.json`. Build them in **Manychat → Settings → Audience → Custom Fields**.

| Manychat field | Type | Maps to `leads.json` | Captured by |
|---|---|---|---|
| `parent_name` | Text | `parent_name` | Camp/class qualifier flows |
| `parent_phone` | Phone | `parent_phone` | Camp/class qualifier flows |
| `parent_email` | Email | `parent_email` | Camp/class qualifier flows |
| `athlete_name` | Text | `athlete_name` | Camp/class qualifier flows |
| `athlete_age` | Number | `athlete_age` | Camp/class qualifier flows |
| `package_interest` | Text | `package` (e.g. "full", "weekly", "drop-in") | Camp qualifier |
| `dm_origin_topic` | Text | first item in `interest[]` | Default greeting |
| `mindbody_client_id` | Text | `mindbody_client_id` (set by webhook callback once enrolled) | OS → Manychat sync |

**Bot-level fields** (not subscriber): none for v1.

---

## 2. Tag taxonomy

Build under **Manychat → Settings → Audience → Tags**. Use prefixes so tags sort cleanly in the UI.

### Source tags (how the lead arrived)
- `src-comment-trigger` — replied to a post comment with a keyword
- `src-story-mention` — tagged `@differentbreedsportsacademy` in their own story
- `src-keyword` — keyword-triggered DM ("camp", "pilates", "kids boxing", "schedule", "join", "trial")
- `src-link-click` — entered via a `m.me/` or `manychat.com/` link on a landing page or bio
- `src-manual` — Joey added them via the Manychat UI

### Interest tags (what they're here for)
- `interest-camp`
- `interest-pilates` (this is Core Control Pilates including the women-only Sunday class)
- `interest-kids-boxing`
- `interest-adult-boxing`
- `interest-general` (browsing, not yet sure)

### Status tags (mirror `leads.json` status)
- `status-new` (default — set when first DM received)
- `status-qualified` (gave name + phone via a qualifier flow)
- `status-trial-booked` (booked a trial class — set by OS webhook back to Manychat)
- `status-enrolled` (handoff to MindBody — set by OS)
- `status-lost` (cold for 30+ days, or explicit opt-out)

### Special tags
- `parent-of-athlete` (vs. self-interested)
- `do-not-message` (opt-out — respect this in EVERY flow)
- `human-handoff` (AI Step gave up; Joey owns the conversation)
- `vip-referral` (came from a known partner account — see `coaches.json` `partner_accounts_to_watch_for_tags`)

---

## 3. Flows (start with these 4)

### Flow 1 — Default Greeting

**Trigger:** Default Reply (anything not caught by a more specific trigger).

**Shape:**
```
1. Greet by name if known. "Hey {{first_name}} — appreciate you reaching out to Different Breed."
2. Quick replies (single-select):
   - 🥊 Boxing for my kid           → set tag interest-kids-boxing, branch to Flow 3 (class qualifier)
   - 🥊 Adult boxing / sparring      → set tag interest-adult-boxing,  branch to Flow 3
   - 🧘 Core Control Pilates         → set tag interest-pilates,        branch to Flow 3
   - ☀️ Summer Camp                  → set tag interest-camp,           branch to Flow 2 (camp qualifier)
   - 💬 Just have a question         → branch to Flow 4 (AI Step / human handoff)
3. If none picked within 12 hours, send one nudge: "Still want to chat? Tap one above."
```

Set `dm_origin_topic` to the chosen branch.

### Flow 2 — Camp Qualifier

**Trigger:** Tag `interest-camp` set (manually or by Flow 1).

**Shape:**
```
1. "DB Summer Camp 2026 — 9 weeks, ages 11–16. We push hard, we push smart. Want me to grab the details?"
2. If yes: capture parent_name, parent_phone, parent_email, athlete_name, athlete_age (one question each, with validation).
3. Show package summary (Full $3,015 / 4-Week Block / Weekly $420 / Daily / Single Drop-in) and capture package_interest.
4. Set tag status-qualified. Fire External Request (webhook) → Vercel /api/manychat-webhook → leads/leads.json append.
5. Reply: "You're in for the next step. Joey or Don will text you within 24 hours to walk you through orientation."
```

### Flow 3 — Class Qualifier (kids-boxing / pilates / adult-boxing — same shape)

```
1. Confirm interest: "Awesome — {{class_name}} runs {{schedule_excerpt}}. Want to book a trial?"
2. Capture parent_name (or just name if adult), phone, email, athlete_name + age if interest-kids-boxing.
3. Set tag status-qualified. Fire webhook.
4. Reply: "Got it. We'll reach out today with a trial slot."
```

### Flow 4 — AI Step / Human Handoff

**Trigger:** Quick-reply "Just have a question" OR no qualifier matched.

**Shape:**
```
1. Manychat AI Step (see §5 below). Knowledge base: brand context + schedule + camp facts.
2. AI tries 1–3 turns. If user satisfied, it can offer "Want me to grab a coach?"
3. On AI low confidence, on user request, or on price/booking question:
     - Set tag human-handoff
     - Route to the right coach based on interest tags (see Handoff Routing table below)
     - Send the coach a Manychat notification (push via Manychat mobile app, or email if they're not on the app)
     - Reply to user: "Pulling in a coach — back to you within a few hours."
```

#### Handoff Routing

Manychat checks the most-recent `interest-*` tag and routes accordingly. **Notification channel runs in two phases** (interim → steady state) because the coaches don't have the Manychat mobile app yet:

**Interim (this week, until coaches install the app):**
ALL handoffs → email to Don at `LEAD_NOTIFY_EMAIL` (already on file in `landing-page/.env.local`). Don dispatches to the right coach manually via text/group chat. This uses infrastructure already in place and avoids needing to collect coach emails before the buildout starts.

**Steady state (once CJ, Glenda, Don install the Manychat app):**
Push notification per interest tag, per the table below. Email as silent fallback.

| Interest tag | Steady-state target | IG handle | Notes |
|---|---|---|---|
| `interest-pilates` | **CJ** | @cjbean122 | Lead Pilates coach — only program with a dedicated point-of-contact for now. |
| `interest-camp` | **Don** (fallback) | @the_4_corners | Owner-operated; Don already owns the form-lead loop. |
| `interest-kids-boxing` | **Don** (fallback) | @the_4_corners | Glenda is the lead coach but not yet the formal handoff target. Don dispatches manually as needed. |
| `interest-adult-boxing` | **Don** (fallback) | @the_4_corners | Coach Dred listed as `[CANDIDATE]` in `coaches-and-staff.md` but not promoted to handoff target yet. |
| `interest-general` / unknown | **Don** (fallback) | @the_4_corners | Default catchall. |
| Tag `vip-referral` set | **Don** | @the_4_corners | VIP referrals (from partner accounts in `coaches.json`) — Don decides escalation. |

**Routing rule, simplified:** Pilates → CJ. Everything else → Don. We tighten per-program routing once each program has a confirmed point-of-contact.

The notification email format:
```
Subject: 🥊 DM handoff — {{first_name}} ({{interest_*}}) — needs reply

Lead: {{first_name}} {{last_name}} (IG: @{{ig_handle}})
Interest: {{interest_*}}
Captured: {{captured_at}}
Phone: {{parent_phone}} (if given)

Last 3 messages:
> ...
> ...
> ...

Open in Manychat: {{conversation_url}}

—
Routed by Manychat handoff. Reply directly in Manychat (or hand off to the right coach).
```

**To switch from interim → steady state**, edit one Manychat action: replace "Send Email" with "Send Notification (push)" routed by the tag table. Schedule that swap when Joey confirms all three coaches have the app installed and signed in.

---

## 4. Growth tools (entry points)

Under **Manychat → Automation → Growth Tools**.

| Growth tool | What it triggers | Default tag set |
|---|---|---|
| Comment Auto-Reply on IG posts | Keyword in comment ("CAMP", "INFO", "PILATES", "BOXING") | `src-comment-trigger` + matching `interest-*` |
| Story Mention reply | Anyone mentions `@differentbreedsportsacademy` in their story | `src-story-mention` |
| DM Keyword trigger | "camp", "pilates", "kids boxing", "schedule", "join", "trial" | `src-keyword` + matching `interest-*` |
| Manychat Landing Page link | Use on the bio link, on Vercel landing pages as fallback | `src-link-click` |

For each post that promotes a class or the camp, the corresponding caption should end with a "Drop CAMP / drop PILATES below for the details" line so the comment auto-reply has something to catch.

---

## 5. AI Step configuration

Manychat's AI Step uses OpenAI under the hood. Configure it inside Flow 4.

**Knowledge base** (paste these into the AI Step's reference text — Manychat caps the size, so keep tight):
- A condensed version of `brand-context/voice-and-tone.md` — DB voice rules, gritty/motivational/no-fluff
- The schedule from `brand-context/schedule.md` — class times, coaches, booking link
- Summer Camp 2026 facts from `brand-context/summer-camp-2026.md` — ages, dates, packages, prices
- Posting rules: tag the videographer when his footage is cited, etc. (Less important for DMs but informs tone.)

**Persona prompt:**
```
You are the AI assistant for Different Breed Elite Fitness, a boxing and fitness gym in NJ. 
Speak like a coach talking to an athlete — gritty, motivational, no corporate fluff. 
Never quote prices unless they're in the knowledge base verbatim.
Never book a trial yourself — defer to a coach by setting the human-handoff tag.
If you don't know, say so and offer to pull in a coach.
Always credit @veteranwithacamera if asked who shoots our reels.
Keep replies under 60 words.
```

**Fallback rules:**
- If user asks about pricing not in the knowledge base → human handoff
- If user wants to book → human handoff
- If 3 turns pass without resolving → human handoff
- If user types "stop" / "unsubscribe" / "remove me" → set `do-not-message` tag, end conversation politely

---

## 6. Webhook receiver — where it lives

**Recommendation: Vercel function in the `landing-page/` project.**

Path: `landing-page/api/manychat-webhook.js`

Why Vercel and not the Mac mini:
- The camp landing page already runs Vercel functions (`api/register.js`) for the form. Same infra, same env-var conventions, same deploy command.
- Vercel functions are public HTTPS by default — Manychat's External Request action just needs a URL.
- Mac mini is fine for cron jobs (it's already there, reliable on Joey's local network) but webhook receivers want a public URL. Vercel is the natural choice.

What the function does:
1. Verify HMAC signature on the payload (using `MANYCHAT_WEBHOOK_SECRET` env var — to be set when the flow gets built).
2. Map Manychat custom fields → `leads/schema.json` shape.
3. Dedupe against `leads.json` by `parent_phone` or `parent_email`.
4. Append (or update) — implementation matches whatever we pick for Q1's "how does Vercel write to `leads.json`" sub-question (GitHub API commit being the leading candidate).
5. Return `{ ok: true }` so Manychat marks the External Request as successful.

---

## 7. Phased buildout

| Phase | Work | Owner |
|---|---|---|
| **D.1 (today)** | Joey reads this design, marks anything he disagrees with. | Joey |
| **D.2** | Joey (or Claude via the Manychat API once the proxy lets us in) creates the custom fields and tags from §1 + §2. ~30 min in the UI; ~15 min via API. | Joey or Claude |
| **D.3** | Joey builds Flow 1 (Default Greeting) in the Manychat UI. Tests with own IG DM. | Joey |
| **D.4** | Joey builds Flow 2 (Camp Qualifier). Tests. | Joey |
| **D.5** | Claude writes `landing-page/api/manychat-webhook.js`. Sets HMAC secret. Wires Flow 2's External Request to it. End-to-end test → confirm a lead lands in `leads.json`. | Claude |
| **D.6** | Joey builds Flow 3 (Class Qualifier) and Flow 4 (handoff skeleton — without AI Step yet). | Joey |
| **D.7** | Build the AI Step (§5): paste condensed knowledge base, set persona prompt, configure handoff fallback rules. Test by DMing with edge cases (price questions, "talk to a coach", off-topic). | Joey + Claude |
| **D.8** | Turn on growth tools §4. First real DMs start landing as leads. | Joey |
| **D.9** | **Backfill existing Manychat subscribers** into `leads.json` as `source: "manychat"`, `status: "lost"` (cold), preserving Manychat subscriber id as `channel_ref`. Pull via the Manychat API once the sandbox proxy is sorted, or Joey runs `manychat-audit.sh` (extended with a `/subscriber/findByName` pass) on his Mac. | Claude (script) + Joey (run) |
| **D.10** | OS → Manychat sync: when `leads.json` status changes to `enrolled`, hit Manychat API to set the corresponding tag on the subscriber. | Claude |

---

## 8. Sub-questions — answered 2026-04-26

1. ~~**AI Step or no AI Step in v1?**~~ → **Yes, AI Step in v1.** Built in step D.7.
2. ~~**Comment auto-reply keyword style?**~~ → **Industry standard / ALL-CAPS prompts** (`Drop CAMP below for the details`). Already what §4 + caption-line guidance assumes.
3. ~~**Human handoff target?**~~ → **Don as default + per-class routing** (CJ for pilates, Glenda for kids boxing). See Handoff Routing table in §3 Flow 4.
4. ~~**Backfill existing subscribers?**~~ → **Yes**, into `leads.json` as `source: "manychat"`, `status: "lost"`. Step D.9.

## 9. Still open

- ~~**Adult-boxing handoff target.**~~ → **Don for now (confirmed).** Phase B's brand-context merge can revisit promoting Coach Dred to the canonical roster.
- ~~**Coach notification channel.**~~ → **Two-phase plan (confirmed):** interim = all handoffs to Don's email (`LEAD_NOTIFY_EMAIL`, already on file). Steady state = Manychat app push per interest tag once CJ, Glenda, Don install the app. Joey is advising the coaches to install it this week. Swap is a one-action edit in Manychat — no design rework.
