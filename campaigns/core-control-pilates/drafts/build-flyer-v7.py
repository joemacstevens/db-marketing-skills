#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v7
Full-bleed close-crop teaser pose, large readable text, print bleed
"""

import os, subprocess
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

# ── Paths ──────────────────────────────────────────────
BASE = "/Users/joestevens/Projects/Pilates-by-Menukhah"
FONTS = "/Users/joestevens/.claude/skills/canvas-design/canvas-fonts"
HERO = os.path.join(BASE, "Studio", "Image 1.jpg")
QR = os.path.join(BASE, "brandkit-seed", "menukhah", "Whats App QR Code.png")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v7-studio.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v7-studio.png")

# 8.5x11 with 0.125" bleed
TRIM_W = 8.5 * inch
TRIM_H = 11 * inch
BLEED = 0.125 * inch
W = TRIM_W + 2 * BLEED
H = TRIM_H + 2 * BLEED

SAFE = 0.3 * inch
SAFE_L = BLEED + SAFE
SAFE_R = W - BLEED - SAFE

# ── Colors ─────────────────────────────────────────────
CREAM      = HexColor("#F0EEE6")
IVORY      = HexColor("#F7F4EE")
CHARCOAL   = HexColor("#1A1714")
TAUPE      = HexColor("#8B7768")
BRONZE     = HexColor("#A07050")
COCOA      = HexColor("#603020")
SOFT_BROWN = HexColor("#705040")
DIVIDER    = HexColor("#D9D1C7")
BODY       = HexColor("#3E332B")

# ── Fonts ──────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("Italiana", os.path.join(FONTS, "Italiana-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Lora", os.path.join(FONTS, "Lora-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(FONTS, "Lora-Italic.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONTS, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONTS, "InstrumentSans-Bold.ttf")))

# ── Helpers ────────────────────────────────────────────
def centered(c, text, y, font, size, color=CHARCOAL, tracking=0):
    c.setFont(font, size)
    c.setFillColor(color)
    mid = W / 2
    if tracking > 0:
        total = sum(c.stringWidth(ch, font, size) + tracking for ch in text) - tracking
        x = mid - total / 2
        for ch in text:
            c.drawString(x, y, ch)
            x += c.stringWidth(ch, font, size) + tracking
    else:
        c.drawString(mid - c.stringWidth(text, font, size) / 2, y, text)

def left_t(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size); c.setFillColor(color); c.drawString(x, y, text)

def right_t(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size); c.setFillColor(color)
    c.drawString(x - c.stringWidth(text, font, size), y, text)

def hrule(c, y, length=60, color=BRONZE, width=0.5):
    c.setStrokeColor(color); c.setLineWidth(width)
    c.line(W/2 - length/2, y, W/2 + length/2, y)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah")

# ── Cream background ───────────────────────────────────
c.setFillColor(CREAM)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Full-bleed hero image — close crop, top 55% ───────
img = Image.open(HERO)
iw, ih = img.size

img_zone_h = H * 0.55
img_zone_w = W

# Close crop: focus on the torso/core area of the pose
# The image is square — crop to a wide landscape band focused on the mid-body
crop_ratio = img_zone_w / img_zone_h
img_ratio = iw / ih

if img_ratio > crop_ratio:
    # Image wider — crop sides
    new_w = int(ih * crop_ratio)
    left = (iw - new_w) // 2
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    # Image taller — crop to middle band (skip head area, focus on torso+legs)
    new_h = int(iw / crop_ratio)
    # Center crop vertically for the studio shot
    top = int(ih * 0.10)
    bottom = top + new_h
    if bottom > ih:
        bottom = ih
        top = ih - new_h
    cropped = img.crop((0, top, iw, bottom))

img_y = H - img_zone_h
crop_path = os.path.join(BASE, "drafts", ".temp_v7.jpg")
cropped.save(crop_path, "JPEG", quality=95)
c.drawImage(crop_path, 0, img_y, width=W, height=img_zone_h)

# Gradient fade at bottom of image into cream
steps = 40
fade_h = img_zone_h * 0.2
for i in range(steps):
    frac = i / steps
    strip_h = fade_h / steps + 0.5
    y_pos = img_y + fade_h * (1 - frac)
    alpha = frac ** 1.3 * 0.95
    c.setFillColor(Color(0.94, 0.93, 0.90, alpha))
    c.rect(0, y_pos, W, strip_h, fill=1, stroke=0)

# ── Text zone ──────────────────────────────────────────
y = img_y - 4

# ── HEADLINE ───────────────────────────────────────────
centered(c, "Pilates by Menukhah", y, "Italiana", 54, CHARCOAL)
y -= 16
hrule(c, y, length=70, color=BRONZE, width=0.45)
y -= 24

# ── SUBHEAD ────────────────────────────────────────────
centered(c, "WOMEN-ONLY PILATES", y, "InstrumentSans-Bold", 16, COCOA, tracking=4)
y -= 24

# ── Tagline ────────────────────────────────────────────
centered(c, "Build strength, mobility, and confidence", y, "Lora-Italic", 14, TAUPE)
y -= 18
centered(c, "in a private boutique setting.", y, "Lora-Italic", 14, TAUPE)
y -= 20

# ── Vibe points ────────────────────────────────────────
centered(c, "Women Only  \u00b7  Beginner Friendly  \u00b7  Private Studio  \u00b7  Small Groups",
         y, "InstrumentSans", 10, SOFT_BROWN, tracking=1)
y -= 18
hrule(c, y, length=50, color=DIVIDER, width=0.3)
y -= 22

# ── Pricing ────────────────────────────────────────────
centered(c, "CLASS PACKAGES", y, "InstrumentSans-Bold", 11, BRONZE, tracking=3)
y -= 28

mid = W / 2
gap = 14
right_t(c, "5 Classes", mid - gap, y, "Lora", 17, CHARCOAL)
left_t(c, "$100", mid + gap, y, "InstrumentSans-Bold", 18, COCOA)
c.setFillColor(DIVIDER); c.circle(mid, y + 6, 1.5, fill=1, stroke=0)
y -= 26
right_t(c, "10 Classes", mid - gap, y, "Lora", 17, CHARCOAL)
left_t(c, "$180", mid + gap, y, "InstrumentSans-Bold", 18, COCOA)
y -= 26

# ── Schedule ───────────────────────────────────────────
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Lora", 14, BODY)
y -= 26

# ── CTA ────────────────────────────────────────────────
cta = "Book Your Spot"
cta_font = "InstrumentSans-Bold"
cta_sz = 14
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 52
cta_ph = 32
cta_x = (W - cta_pw) / 2
cta_y = y - cta_ph / 2

c.setFillColor(COCOA)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)
c.setFont(cta_font, cta_sz)
c.setFillColor(IVORY)
c.drawString((W - c.stringWidth(cta, cta_font, cta_sz))/2, cta_y + 10, cta)

y = cta_y - 22

# ── Contact left + QR right ────────────────────────────
left_t(c, "(201) 250 6576", SAFE_L, y, "InstrumentSans", 11, BODY)
y_l2 = y - 15
left_t(c, "The Core, 418 Cedar Lane, Teaneck, NJ", SAFE_L, y_l2, "InstrumentSans", 10, TAUPE)
y_l3 = y_l2 - 14
left_t(c, "Grip socks required \u2014 available for purchase", SAFE_L, y_l3, "Lora-Italic", 9, TAUPE)

# QR
qr_sz = 68
qr_x = SAFE_R - qr_sz
qr_y = y - qr_sz + 16

c.setFillColor(HexColor("#FFFFFF"))
c.rect(qr_x - 3, qr_y - 3, qr_sz + 6, qr_sz + 6, fill=1, stroke=0)
c.setStrokeColor(BRONZE); c.setLineWidth(0.4)
c.rect(qr_x - 1, qr_y - 1, qr_sz + 2, qr_sz + 2, fill=0, stroke=1)
c.drawImage(QR, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

c.setFont("InstrumentSans", 8); c.setFillColor(TAUPE)
lbl = "Scan to Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "InstrumentSans", 8)/2,
             qr_y - 12, lbl)

# ── Trim marks ─────────────────────────────────────────
c.setStrokeColor(HexColor("#CCCCCC")); c.setLineWidth(0.25)
m = 12
for bx, by in [(BLEED, H-BLEED), (W-BLEED, H-BLEED), (BLEED, BLEED), (W-BLEED, BLEED)]:
    dx = -m if bx < W/2 else m
    dy = m if by > H/2 else -m
    c.line(bx, by, bx + dx, by)
    c.line(bx, by, bx, by + dy)

# ── Save ───────────────────────────────────────────────
c.save()
print(f"PDF saved: {OUT_PDF}")

if os.path.exists(crop_path):
    os.remove(crop_path)

subprocess.run(["sips", "-s", "format", "png", "--resampleWidth", "2550",
                 OUT_PDF, "--out", OUT_PNG], capture_output=True)
if os.path.exists(OUT_PNG):
    print(f"PNG saved: {OUT_PNG}")

print("Done!")
