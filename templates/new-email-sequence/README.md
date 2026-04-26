# New Email Sequence Template

Sequences live at `leads/sequences/<id>.md`. They are markdown files with frontmatter that `skills/lead-followup.md` reads to decide when to fire and what to send.

## Copy to:

```bash
cp templates/new-email-sequence/sequence-template.md leads/sequences/<your-id>.md
```

Then edit the frontmatter (trigger conditions) and the body (the email itself).

## Voice rules

- Read `brand-context/voice-and-tone.md` first.
- DB voice: gritty, motivational, coach talking to athletes. Never corporate.
- Sign as a real person (Joey, a coach), never "the team."
- First-touch ≤ 150 words. Followups can be shorter.

## Mustache vars available

`{{parent_name}}`, `{{parent_email}}`, `{{athlete_name}}`, `{{athlete_age}}`, `{{package}}`, `{{campaign}}`, `{{trial_date}}`, `{{coach_name}}`

See `leads/sequences/camp-welcome.md` for a fully-built example.
