# Skill: Lead Followup

**Status:** STUB. Scaffold built (2026-04-26 Phase A), full implementation in Phase D.

## Purpose

Run sequenced followup on leads in `leads/leads.json` using the Resend-based `db-email-kit` on the Mac mini.

## How sequences work

Each sequence is a markdown file under `leads/sequences/<id>.md` with frontmatter that defines its trigger (status + tags + delay) and a body template with mustache vars. See `leads/sequences/README.md`.

## Loop (Phase D — pseudocode)

```
for each lead in leads.json where status != enrolled and status != lost:
  for each sequence in leads/sequences/*.md:
    if sequence.trigger matches lead and sequence.id not in lead.history:
      render(sequence.body, lead) -> draft
      present draft to Joey for approval
      on approval:
        send via db-email-kit (~/.openclaw/workspace/db-email-kit on Mac mini)
        append history entry { kind: "email-sent", ref: <resend-msg-id>, summary: sequence.subject }
        if sequence sets a status_after, update lead.status
```

## Approval gate

Same rule as posts. **Nothing sends without Joey's explicit go-ahead.** Claude renders the email, shows it, waits.

## Two-way sync (Phase D, optional)

When a sequence sends, also tag the matching Manychat subscriber so the IG side stays consistent. (Requires Manychat API key from Joey.)

## Today

This skill doesn't run autonomously yet. Joey can ask: "Draft the welcome email for any new camp leads." Claude reads leads.json, finds matching leads, renders `leads/sequences/camp-welcome.md`, and presents the drafts.
