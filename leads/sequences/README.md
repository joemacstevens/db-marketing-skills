# Lead Followup Sequences

Each sequence is one markdown file with frontmatter that describes when it fires and a body that's the email itself. `skills/lead-followup.md` reads these.

## Frontmatter shape

```yaml
---
id: camp-welcome
trigger:
  status: new                # any of: new, contacted, trial-booked
  tags_any: [camp]           # fires if lead has ANY of these tags
  tags_all: []               # AND fires only if lead has ALL of these tags
  delay_hours: 0             # send N hours after captured_at
campaign: summer-camp-2026   # optional — restricts to one campaign
subject: "Welcome to DB Camp — what happens next"
preview: "Don will text you within 24 hours. Here's what to expect."
from_name: "Joey at Different Breed"
from_email: "joey@differentbreedsportsacademy.com"
---
```

## Body conventions

- DB voice (gritty, motivational, coach-to-athlete) — read `brand-context/voice-and-tone.md` before writing.
- Mustache vars: `{{parent_name}}`, `{{athlete_name}}`, `{{package}}`, `{{trial_date}}`.
- Always sign as a real coach, never "the team."
- Keep under 150 words for first-touch. Followups can be shorter.

## Today's sequences

(Phase D will populate. Currently only this README and the welcome placeholder below.)
