---
id: REPLACE-WITH-ID
trigger:
  status: new                # one of: new, contacted, trial-booked
  tags_any: []               # fires if lead has ANY of these tags
  tags_all: []               # AND fires only if lead has ALL of these tags
  delay_hours: 0             # send N hours after captured_at (or after status change)
campaign: null               # campaign slug, or null for global
subject: "REPLACE — short, no clickbait"
preview: "REPLACE — preview text shown in inbox before opening"
from_name: "Joey at Different Breed"
from_email: "joey@differentbreedsportsacademy.com"
---

{{parent_name}},

REPLACE — write the email body here in DB voice. Keep first-touch under 150 words.

— Joey
Different Breed Elite Fitness
