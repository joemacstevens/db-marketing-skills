# Templates

Folder skeletons for the four things we make repeatedly:

| Template | When to use |
|---|---|
| `new-campaign/` | Starting a new multi-week marketing campaign (camp, challenge, seasonal promo) |
| `new-landing-page/` | Building any new landing page — class, campaign, or main gym. The prior main-gym attempts are being archived; future ones start from this scaffold. |
| `new-reel/` | Adding a new Remotion reel composition |
| `new-email-sequence/` | Adding a new tag/status-triggered Resend sequence under `leads/sequences/` |

## How to use

```bash
# Copy the skeleton into the right place, e.g. for a new campaign:
cp -r templates/new-campaign campaigns/<new-campaign-slug>
```

Each skeleton's own README explains the files inside and what to fill in.

## What's NOT a template

- **One-off PDFs / flyers** — just create them in `output/<date>/`.

## A note on the main gym site

The `Different Breed Elite Fittness Site/` folder is being archived because every attempt inside it was a false start. That's a clean-up, not a moratorium — when we build the next main-gym page, it starts here, from `new-landing-page/`.
