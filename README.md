# DB Marketing Skills — Different Breed Elite Fitness

Claude Code marketing skills project for [Different Breed Elite Fitness](https://differentbreedelitefitness.com) — a premium fitness brand built around the idea of becoming something greater than you were yesterday.

## What This Is

This repo contains a set of **Claude Code skills** (structured prompt templates + brand context files) that let you generate on-brand marketing content for Different Breed Elite Fitness quickly and consistently.

---

## Project Structure

```
db-marketing-skills/
├── brand/                  # Brand context files (voice, audience, tone, offers)
│   ├── brand_voice.md      # DB's tone, language rules, and writing principles
│   ├── audience.md         # Target customer profiles and pain points
│   └── offers.md           # Programs, pricing, and key selling points
│
├── skills/                 # Marketing content skills (prompt templates)
│   ├── 01-instagram-caption/   # Short-form social captions for IG/FB
│   ├── 02-email-campaign/      # Email sequences and one-off campaigns
│   ├── 03-landing-page-copy/   # Sales page and landing page copy
│   ├── 04-testimonial-story/   # Client success story formatting
│   └── 05-weekly-content-plan/ # 7-day content calendar generation
│
├── output/                 # Generated content (gitignored)
└── README.md               # This file
```

---

## The 5 Skills

| Skill | What It Does |
|-------|-------------|
| **01 - Instagram Caption** | Generates punchy, on-brand IG/FB captions with hooks, body, and CTA |
| **02 - Email Campaign** | Writes full email sequences or one-off campaigns in DB's voice |
| **03 - Landing Page Copy** | Produces full sales/landing page copy for programs and offers |
| **04 - Testimonial Story** | Transforms raw client results into compelling before/after stories |
| **05 - Weekly Content Plan** | Builds a 7-day content calendar with topics, formats, and angles |

---

## How to Use

1. **Open this folder in Claude Code**
   ```
   claude /Users/path/to/db-marketing-skills
   ```

2. **Ask Claude to generate content** using natural language:
   - *"Write 3 Instagram captions for our 6-week transformation challenge"*
   - *"Create a 3-email welcome sequence for new members"*
   - *"Generate a landing page for our strength training program"*
   - *"Write a client success story for Maria — she lost 22 lbs in 8 weeks"*
   - *"Build a content calendar for next week focused on community and results"*

3. **Claude reads the brand context files** automatically and produces content in DB's voice.

4. **Output lands in `output/`** (gitignored — won't pollute the repo).

---

## Brand Quick Reference

- **Name:** Different Breed Elite Fitness (DB)
- **Tagline:** *Evolve into Greatness*
- **Tone:** Motivational, direct, no-fluff — coaching energy, not hype
- **Audience:** Busy adults 25–50 who are serious about changing their body and mindset
- **Colors:** Red + Black (high-energy, premium)

---

## Notes

- Keep brand context files up to date as offers, pricing, or positioning changes
- `output/` is gitignored — commit any content worth keeping elsewhere
- New skills can be added by creating a new folder under `skills/` with a `SKILL.md`
