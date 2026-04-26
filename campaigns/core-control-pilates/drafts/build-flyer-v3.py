#!/usr/bin/env python3
"""
Pilates by Menukhah — Women-Only Pilates Flyer v3
Design philosophy: Warm Stillness
Output: 8.5x11 print-ready PDF + PNG

Refinement pass: better vertical space budget, nothing cut off,
generous breathing room throughout.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

# ── Paths ──────────────────────────────────────────────
BASE = "/Users/joestevens/Projects/Pilates-by-Menukhah"
FONTS = "/Users/joestevens/.claude/skills/canvas-design/canvas-fonts"
PHOTO = os.path.join(BASE, "Studio", "Image 1.jpg")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v3.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v3.png")

# ── Page ───────────────────────────────────────────────
W, H = letter  # 612 x 792 pt

# ── Brand colors ───────────────────────────────────────
BG_CREAM      = HexColor("#F0EEE6")
SURFACE_IVORY = HexColor("#F7F4EE")
CHARCOAL      = HexColor("#1A1714")
WARM_TAUPE    = HexColor("#8B7768")
BRONZE        = HexColor("#A07050")
COCOA         = HexColor("#603020")
SOFT_BROWN    = HexColor("#705040")
DIVIDER       = HexColor("#D9D1C7")
BODY_TEXT     = HexColor("#3E332B")

# ── Register fonts ─────────────────────────────────────
pdfmetrics.registerFont(TTFont("Italiana", os.path.join(FONTS, "Italiana-Regular.ttf")))
pdfmetrics.registerFont(TTFont("CrimsonPro", os.path.join(FONTS, "CrimsonPro-Regular.ttf")))
pdfmetrics.registerFont(TTFont("CrimsonPro-Italic", os.path.join(FONTS, "CrimsonPro-Italic.ttf")))
pdfmetrics.registerFont(TTFont("Lora", os.path.join(FONTS, "Lora-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(FONTS, "Lora-Italic.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Bold", os.path.join(FONTS, "Lora-Bold.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONTS, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONTS, "InstrumentSans-Bold.ttf")))

# ── Helpers ────────────────────────────────────────────
def draw_centered(c, text, y, font, size, color=CHARCOAL, tracking=0):
    c.setFont(font, size)
    c.setFillColor(color)
    if tracking > 0:
        total_w = sum(c.stringWidth(ch, font, size) + tracking for ch in text) - tracking
        x = (W - total_w) / 2
        for ch in text:
            c.drawString(x, y, ch)
            x += c.stringWidth(ch, font, size) + tracking
    else:
        tw = c.stringWidth(text, font, size)
        c.drawString((W - tw) / 2, y, text)

def draw_right(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x - c.stringWidth(text, font, size), y, text)

def draw_left(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, text)

def short_rule(c, y, length=36, color=BRONZE, width=0.5):
    cx = W / 2
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(cx - length/2, y, cx + length/2, y)

def diamond(c, x, y, sz=2.5, color=BRONZE):
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(x, y + sz)
    p.lineTo(x + sz, y)
    p.lineTo(x, y - sz)
    p.lineTo(x - sz, y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=letter)
c.setTitle("Pilates by Menukhah — Women-Only Pilates")
c.setAuthor("Pilates by Menukhah")

# Background
c.setFillColor(BG_CREAM)
c.rect(0, 0, W, H, fill=1, stroke=0)

# Outer frame
frame = 0.42 * inch
c.setStrokeColor(BRONZE)
c.setLineWidth(0.4)
c.rect(frame, frame, W - 2*frame, H - 2*frame, fill=0, stroke=1)

# Inner frame
c.setStrokeColor(DIVIDER)
c.setLineWidth(0.2)
c.rect(frame+3, frame+3, W-2*frame-6, H-2*frame-6, fill=0, stroke=1)

# ── VERTICAL LAYOUT (top-down, y decreasing) ──────────
y = H - 0.78 * inch

# ── Brand name ─────────────────────────────────────────
draw_centered(c, "PILATES BY MENUKHAH", y, "InstrumentSans", 8, WARM_TAUPE, tracking=4.2)
# Flanking diamonds
bw = sum(c.stringWidth(ch, "InstrumentSans", 8) + 4.2 for ch in "PILATES BY MENUKHAH") - 4.2
cx = W / 2
diamond(c, cx - bw/2 - 12, y + 3, sz=2, color=BRONZE)
diamond(c, cx + bw/2 + 12, y + 3, sz=2, color=BRONZE)
y -= 16

# Rule
short_rule(c, y, length=48, color=BRONZE, width=0.35)
y -= 32

# ── Headline ───────────────────────────────────────────
draw_centered(c, "Women-Only", y, "Italiana", 54, CHARCOAL)
y -= 56
draw_centered(c, "Pilates", y, "Italiana", 54, CHARCOAL)
y -= 22

# ── Tagline (single line) ─────────────────────────────
draw_centered(c, "Strength, mobility, and confidence in a private boutique setting.", y, "Lora-Italic", 10.5, WARM_TAUPE)
y -= 20

# Rule
short_rule(c, y, length=32, color=DIVIDER, width=0.3)
y -= 16

# ── Vibe points ────────────────────────────────────────
draw_centered(c, "Women Only  \u00b7  Beginner Friendly  \u00b7  Private Studio  \u00b7  Small Groups", y, "InstrumentSans", 7.5, SOFT_BROWN, tracking=1)
y -= 22

# ── Studio photo ───────────────────────────────────────
# Constrain to a landscape strip — max height ~210pt for space budget
photo_margin_lr = 0.9 * inch
photo_w = W - 2 * photo_margin_lr  # ~482pt

img = Image.open(PHOTO)
iw, ih = img.size  # 4032 x 2688
natural_h = photo_w * (ih / iw)  # ~321pt
max_photo_h = 210
photo_h = min(natural_h, max_photo_h)

photo_x = photo_margin_lr
photo_y = y - photo_h

# Subtle ivory backing
c.setFillColor(SURFACE_IVORY)
c.rect(photo_x - 3, photo_y - 3, photo_w + 6, photo_h + 6, fill=1, stroke=0)

# Bronze frame
c.setStrokeColor(BRONZE)
c.setLineWidth(0.5)
c.rect(photo_x - 1, photo_y - 1, photo_w + 2, photo_h + 2, fill=0, stroke=1)

# Crop the photo to fill the constrained area (center crop)
# We need to create a cropped version for proper fill
crop_ratio = photo_w / photo_h
img_ratio = iw / ih
if img_ratio > crop_ratio:
    # Image is wider — crop sides
    new_w = int(ih * crop_ratio)
    left = (iw - new_w) // 2
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    # Image is taller — crop top/bottom
    new_h = int(iw / crop_ratio)
    top = (ih - new_h) // 2
    cropped = img.crop((0, top, iw, top + new_h))

# Save temp cropped image
crop_path = os.path.join(BASE, "drafts", ".temp_crop.jpg")
cropped.save(crop_path, "JPEG", quality=95)

c.drawImage(crop_path, photo_x, photo_y, width=photo_w, height=photo_h)

y = photo_y - 20

# ── Rule under photo ───────────────────────────────────
short_rule(c, y, length=40, color=BRONZE, width=0.35)
y -= 22

# ── Pricing ────────────────────────────────────────────
draw_centered(c, "CLASS PACKAGES", y, "InstrumentSans-Bold", 8.5, BRONZE, tracking=2.8)
y -= 22

# Side-by-side pricing
mid = W / 2
gap = 10

draw_right(c, "5 Classes", mid - gap, y, "Lora", 12.5, CHARCOAL)
draw_left(c, "$100", mid + gap, y, "InstrumentSans-Bold", 13, COCOA)
y -= 4

# Separator dot
c.setFillColor(DIVIDER)
c.circle(mid, y + 8, 1, fill=1, stroke=0)

y -= 16
draw_right(c, "10 Classes", mid - gap, y, "Lora", 12.5, CHARCOAL)
draw_left(c, "$180", mid + gap, y, "InstrumentSans-Bold", 13, COCOA)
y -= 22

# ── Schedule ───────────────────────────────────────────
draw_centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Lora", 10.5, BODY_TEXT)
y -= 22

# ── CTA button ─────────────────────────────────────────
cta = "Book Your Spot"
cta_font = "InstrumentSans-Bold"
cta_sz = 10.5
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 44
cta_ph = 26
cta_x = (W - cta_pw) / 2
cta_y = y - cta_ph / 2 - 1

c.setFillColor(COCOA)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)

c.setFont(cta_font, cta_sz)
c.setFillColor(SURFACE_IVORY)
c.drawString((W - c.stringWidth(cta, cta_font, cta_sz))/2, cta_y + 8.5, cta)

y = cta_y - 18

# ── Contact ────────────────────────────────────────────
draw_centered(c, "(201) 250 6576", y, "InstrumentSans", 8.5, BODY_TEXT, tracking=0.8)
y -= 13
draw_centered(c, "The Core, 418 Cedar Lane, Teaneck, NJ", y, "InstrumentSans", 8, WARM_TAUPE, tracking=0.5)
y -= 16

# ── Grip socks ─────────────────────────────────────────
draw_centered(c, "Grip socks required \u2014 available for purchase", y, "Lora-Italic", 7.5, WARM_TAUPE)

# ── Corner diamonds (subtle, at frame corners) ────────
corner_offset = frame + 12
diamond(c, corner_offset, H - corner_offset, sz=2, color=BRONZE)
diamond(c, W - corner_offset, H - corner_offset, sz=2, color=BRONZE)
diamond(c, corner_offset, corner_offset, sz=2, color=BRONZE)
diamond(c, W - corner_offset, corner_offset, sz=2, color=BRONZE)

# ── Save ───────────────────────────────────────────────
c.save()
print(f"PDF saved: {OUT_PDF}")

# Clean up temp file
if os.path.exists(crop_path):
    os.remove(crop_path)

# ── PNG conversion ─────────────────────────────────────
import subprocess
subprocess.run([
    "sips", "-s", "format", "png",
    "--resampleWidth", "2550",
    OUT_PDF, "--out", OUT_PNG
], capture_output=True)
if os.path.exists(OUT_PNG):
    print(f"PNG saved: {OUT_PNG}")
else:
    print("PNG: open PDF in Preview and export manually for best quality")

print("Done!")
