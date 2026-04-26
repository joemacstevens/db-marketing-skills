# HTML Card Template — DB Cover Frames / Title Cards

Use this for title cards, cover frames, and carousel slides in the DB editorial style.

## Style locked
- **Dark background** `#0E0E0E`
- **Oswald Bold 700**, UPPERCASE, tight tracking
- **Red accent tags** `#C4161C` (small label above the headline)
- **White headline** dominates
- **Photo top half** (if used)
- **"EVOLVE INTO GREATNESS" footer** in small caps

## How to use

1. Copy `card.html` → `my-card.html` and swap the placeholder text + image.
2. Render via Playwright at 1080×1920 for a reel cover, or 1080×1080 for carousel/square:
   ```bash
   npx playwright screenshot my-card.html out.png --viewport-size=1080,1920 --full-page
   ```
   Or for high-res PDF-quality (2x scale):
   ```bash
   npx playwright screenshot my-card.html out.png --viewport-size=1080,1920 --device-scale-factor=2
   ```
3. If using for a video: convert to MP4 with ffmpeg:
   ```bash
   ffmpeg -loop 1 -i out.png -c:v libx264 -t 2 -pix_fmt yuv420p -vf scale=1080:1920 card.mp4
   ```

## Reference
The DB editorial carousel template (`~/Projects/db-editorial-template/` on this Mac) is the gold standard for this style — copy it when in doubt.
