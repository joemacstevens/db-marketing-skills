#!/usr/bin/env python3
"""
Pilates by Menukhah — Women-Only Pilates Flyer v4
Equinox-style full-bleed editorial layout
Dark/moody hero photo with text overlay at bottom
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

# ── Paths ──────────────────────────────────────────────
BASE = "/Users/joestevens/Projects/Pilates-by-Menukhah"
FONTS = "/Users/joestevens/.claude/skills/canvas-design/canvas-fonts"
HERO = os.path.join(BASE, "drafts", "nanobanana-output", "editorial_fitness_photograph_dra.png")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v4.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v4.png")

# ── Page ───────────────────────────────────────────────
W, H = letter  # 612 x 792 pt

# ── Colors ─────────────────────────────────────────────
WHITE = HexColor("#F7F4EE")  # warm ivory white
CREAM = HexColor("#F0EEE6")
BRONZE = HexColor("#A07050")
COCOA = HexColor("#603020")
TAUPE = HexColor("#8B7768")

# ── Register fonts ─────────────────────────────────────
pdfmetrics.registerFont(TTFont("Italiana", os.path.join(FONTS, "Italiana-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONTS, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONTS, "InstrumentSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Lora", os.path.join(FONTS, "Lora-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(FONTS, "Lora-Italic.ttf")))
pdfmetrics.registerFont(TTFont("WorkSans", os.path.join(FONTS, "WorkSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("WorkSans-Bold", os.path.join(FONTS, "WorkSans-Bold.ttf")))

# ── Helpers ────────────────────────────────────────────
def draw_text(c, text, x, y, font, size, color=WHITE, tracking=0):
    c.setFont(font, size)
    c.setFillColor(color)
    if tracking > 0:
        for ch in text:
            c.drawString(x, y, ch)
            x += c.stringWidth(ch, font, size) + tracking
    else:
        c.drawString(x, y, text)

def draw_centered(c, text, y, font, size, color=WHITE, tracking=0):
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


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=letter)
c.setTitle("Pilates by Menukhah — Women-Only Pilates")

# ── Full-bleed hero photo ──────────────────────────────
# Load and crop to fill page
img = Image.open(HERO)
iw, ih = img.size
page_ratio = W / H  # 0.773
img_ratio = iw / ih

if img_ratio > page_ratio:
    # Image wider than page — crop sides
    new_w = int(ih * page_ratio)
    left = (iw - new_w) // 2
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    # Image taller — crop top/bottom (keep upper portion for the pose)
    new_h = int(iw / page_ratio)
    cropped = img.crop((0, 0, iw, new_h))

crop_path = os.path.join(BASE, "drafts", ".temp_hero_crop.png")
cropped.save(crop_path, "PNG", quality=95)

# Draw full-bleed
c.drawImage(crop_path, 0, 0, width=W, height=H)

# ── Dark gradient overlay at bottom ────────────────────
# Multiple translucent black rectangles for smooth gradient
gradient_height = H * 0.55  # bottom 55% of page
steps = 60
for i in range(steps):
    frac = i / steps
    y_pos = gradient_height * (1 - frac)
    strip_h = gradient_height / steps + 1
    # Opacity ramps from 0 at top to ~0.82 at bottom
    alpha = frac ** 1.6 * 0.85
    c.setFillColor(Color(0.04, 0.03, 0.02, alpha))
    c.rect(0, y_pos, W, strip_h, fill=1, stroke=0)

# ── Solid dark at very bottom for text legibility ──────
c.setFillColor(Color(0.04, 0.03, 0.02, 0.88))
c.rect(0, 0, W, H * 0.22, fill=1, stroke=0)

# ── Text layout ────────────────────────────────────────
margin_l = 0.65 * inch
margin_r = W - 0.65 * inch

# ── Brand name (top left, subtle) ──────────────────────
draw_text(c, "PILATES BY MENUKHAH", margin_l, H - 0.6 * inch,
          "InstrumentSans", 8, Color(0.97, 0.96, 0.93, 0.75), tracking=3.5)

# ── Main headline (bottom area, large and bold) ────────
y = H * 0.34

draw_text(c, "Women-Only", margin_l, y, "Italiana", 52, WHITE)
y -= 54
draw_text(c, "Pilates", margin_l, y, "Italiana", 52, WHITE)
y -= 32

# ── Tagline ────────────────────────────────────────────
draw_text(c, "Strength, mobility, and confidence", margin_l, y,
          "Lora-Italic", 12, Color(0.85, 0.82, 0.78, 0.9))
y -= 16
draw_text(c, "in a private boutique setting.", margin_l, y,
          "Lora-Italic", 12, Color(0.85, 0.82, 0.78, 0.9))
y -= 28

# ── Thin rule ──────────────────────────────────────────
c.setStrokeColor(Color(0.63, 0.44, 0.31, 0.6))  # bronze, translucent
c.setLineWidth(0.4)
c.line(margin_l, y, margin_l + 80, y)
y -= 22

# ── Info line: vibe + schedule ─────────────────────────
draw_text(c, "Women Only  \u00b7  Beginner Friendly  \u00b7  Private Studio  \u00b7  Small Groups",
          margin_l, y, "InstrumentSans", 7.5, Color(0.75, 0.72, 0.68, 0.85), tracking=0.8)
y -= 22

# ── Pricing (prominent) ───────────────────────────────
draw_text(c, "5 Classes  $100", margin_l, y, "InstrumentSans-Bold", 12, WHITE)
# Separator
sep_x = margin_l + c.stringWidth("5 Classes  $100", "InstrumentSans-Bold", 12) + 16
c.setFillColor(Color(0.63, 0.44, 0.31, 0.7))
c.circle(sep_x, y + 4, 1.5, fill=1, stroke=0)
# Second price
draw_text(c, "10 Classes  $180", sep_x + 16, y, "InstrumentSans-Bold", 12, WHITE)
y -= 20

# ── Schedule ───────────────────────────────────────────
draw_text(c, "Sunday 8am  \u00b7  Thursday 8pm", margin_l, y,
          "InstrumentSans", 9, Color(0.85, 0.82, 0.78, 0.8), tracking=0.5)
y -= 26

# ── CTA + Contact (bottom strip) ──────────────────────
draw_text(c, "Book Your Spot", margin_l, y, "InstrumentSans-Bold", 11,
          HexColor("#D4A574"))  # warm gold
# Contact on same line, right-aligned
contact = "(201) 250 6576  \u00b7  418 Cedar Lane, Teaneck, NJ"
c.setFont("InstrumentSans", 8)
cw = c.stringWidth(contact, "InstrumentSans", 8)
draw_text(c, contact, margin_r - cw, y + 1, "InstrumentSans", 8,
          Color(0.7, 0.67, 0.63, 0.7))
y -= 16

# ── Grip socks (very subtle) ──────────────────────────
draw_text(c, "Grip socks required \u2014 available for purchase", margin_l, y,
          "Lora-Italic", 7, Color(0.6, 0.57, 0.53, 0.6))

# ── Save ───────────────────────────────────────────────
c.save()
print(f"PDF saved: {OUT_PDF}")

# Clean temp
if os.path.exists(crop_path):
    os.remove(crop_path)

# PNG export
import subprocess
subprocess.run([
    "sips", "-s", "format", "png",
    "--resampleWidth", "2550",
    OUT_PDF, "--out", OUT_PNG
], capture_output=True)
if os.path.exists(OUT_PNG):
    print(f"PNG saved: {OUT_PNG}")

print("Done!")
