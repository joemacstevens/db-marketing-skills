#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v6
Full-bleed image, large readable text, print-safe margins
No midriff, warm tones, WhatsApp QR
"""

import os, subprocess
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

# ── Paths ──────────────────────────────────────────────
BASE = "/Users/joestevens/Projects/Pilates-by-Menukhah"
FONTS = "/Users/joestevens/.claude/skills/canvas-design/canvas-fonts"
HERO = os.path.join(BASE, "drafts", "nanobanana-output", "editorial_fitness_photograph_sli.png")
QR = os.path.join(BASE, "brandkit-seed", "menukhah", "Whats App QR Code.png")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v6.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v6.png")

# 8.5 x 11 with 0.125" bleed on all sides
TRIM_W = 8.5 * inch   # 612
TRIM_H = 11 * inch     # 792
BLEED = 0.125 * inch    # 9
W = TRIM_W + 2 * BLEED  # 630
H = TRIM_H + 2 * BLEED  # 810

# Print safe area: 0.3" inside trim on all sides
SAFE = 0.3 * inch
SAFE_L = BLEED + SAFE
SAFE_R = W - BLEED - SAFE
SAFE_T = H - BLEED - SAFE
SAFE_B = BLEED + SAFE
SAFE_W = SAFE_R - SAFE_L

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
pdfmetrics.registerFont(TTFont("Lora-Bold", os.path.join(FONTS, "Lora-Bold.ttf")))
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

def hrule(c, y, length=50, color=BRONZE, width=0.5):
    c.setStrokeColor(color); c.setLineWidth(width)
    c.line(W/2 - length/2, y, W/2 + length/2, y)

def diamond(c, x, y, sz=2.5, color=BRONZE):
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(x, y+sz); p.lineTo(x+sz, y); p.lineTo(x, y-sz); p.lineTo(x-sz, y); p.close()
    c.drawPath(p, fill=1, stroke=0)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah")

# ── Cream background (full bleed) ──────────────────────
c.setFillColor(CREAM)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Full-bleed hero image (top ~52% of page) ──────────
img = Image.open(HERO)
iw, ih = img.size

# Image spans full width, bleeds to top and sides
img_display_w = W  # full bleed width
img_target_h = H * 0.52  # about 52% of page

# Crop image to landscape to fill this area
crop_ratio = img_display_w / img_target_h
img_ratio = iw / ih
if img_ratio > crop_ratio:
    new_w = int(ih * crop_ratio)
    left = (iw - new_w) // 2
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    new_h = int(iw / crop_ratio)
    top = int(ih * 0.05)
    cropped = img.crop((0, top, iw, min(top + new_h, ih)))

img_y = H - img_target_h
crop_path = os.path.join(BASE, "drafts", ".temp_v6.jpg")
cropped.save(crop_path, "JPEG", quality=95)
c.drawImage(crop_path, 0, img_y, width=W, height=img_target_h)

# Subtle gradient fade at bottom of image into cream
steps = 30
fade_h = img_target_h * 0.18
from reportlab.lib.colors import Color
for i in range(steps):
    frac = i / steps
    strip_h = fade_h / steps + 0.5
    y_pos = img_y + fade_h * (1 - frac)
    alpha = frac * 0.95
    # Blend toward cream
    r = 0.94 * alpha + (1 - alpha) * 0.5
    g = 0.93 * alpha + (1 - alpha) * 0.5
    b = 0.90 * alpha + (1 - alpha) * 0.5
    c.setFillColor(Color(0.94, 0.93, 0.90, alpha))
    c.rect(0, y_pos, W, strip_h, fill=1, stroke=0)

# ── Text zone starts below image ───────────────────────
y = img_y - 8

# ── HEADLINE: Pilates by Menukhah (big!) ───────────────
centered(c, "Pilates by Menukhah", y, "Italiana", 52, CHARCOAL)
y -= 14

# Bronze rule
hrule(c, y, length=70, color=BRONZE, width=0.5)
y -= 22

# ── SUBHEAD ────────────────────────────────────────────
centered(c, "WOMEN-ONLY PILATES", y, "InstrumentSans-Bold", 15, COCOA, tracking=4)
y -= 22

# ── Tagline ────────────────────────────────────────────
centered(c, "Build strength, mobility, and confidence", y, "Lora-Italic", 13, TAUPE)
y -= 17
centered(c, "in a private boutique setting.", y, "Lora-Italic", 13, TAUPE)
y -= 22

# ── Vibe points ────────────────────────────────────────
centered(c, "Women Only  \u00b7  Beginner Friendly  \u00b7  Private Studio  \u00b7  Small Groups",
         y, "InstrumentSans", 10, SOFT_BROWN, tracking=1.2)
y -= 20

# ── Thin rule ──────────────────────────────────────────
hrule(c, y, length=50, color=DIVIDER, width=0.3)
y -= 22

# ── Pricing (large and prominent) ──────────────────────
centered(c, "CLASS PACKAGES", y, "InstrumentSans-Bold", 11, BRONZE, tracking=3)
y -= 26

mid = W / 2
gap = 14
right_t(c, "5 Classes", mid - gap, y, "Lora", 16, CHARCOAL)
left_t(c, "$100", mid + gap, y, "InstrumentSans-Bold", 17, COCOA)
c.setFillColor(DIVIDER); c.circle(mid, y + 5.5, 1.3, fill=1, stroke=0)
y -= 24
right_t(c, "10 Classes", mid - gap, y, "Lora", 16, CHARCOAL)
left_t(c, "$180", mid + gap, y, "InstrumentSans-Bold", 17, COCOA)
y -= 26

# ── Schedule ───────────────────────────────────────────
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Lora", 13, BODY)
y -= 26

# ── CTA button ─────────────────────────────────────────
cta = "Book Your Spot"
cta_font = "InstrumentSans-Bold"
cta_sz = 13
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 50
cta_ph = 30
cta_x = (W - cta_pw) / 2
cta_y = y - cta_ph / 2

c.setFillColor(COCOA)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)
c.setFont(cta_font, cta_sz)
c.setFillColor(IVORY)
c.drawString((W - c.stringWidth(cta, cta_font, cta_sz))/2, cta_y + 9, cta)

y = cta_y - 22

# ── Bottom: Contact left + QR right ────────────────────
left_t(c, "(201) 250 6576", SAFE_L, y, "InstrumentSans", 11, BODY)
y -= 16
left_t(c, "The Core, 418 Cedar Lane, Teaneck, NJ", SAFE_L, y, "InstrumentSans", 10, TAUPE)
y -= 16
left_t(c, "Grip socks required \u2014 available for purchase", SAFE_L, y, "Lora-Italic", 9, TAUPE)

# QR — right side, vertically centered with contact block
qr_sz = 65
qr_x = SAFE_R - qr_sz
qr_y = y + 4  # bottom of QR
qr_top = qr_y + qr_sz

# White backing
c.setFillColor(HexColor("#FFFFFF"))
c.rect(qr_x - 3, qr_y - 3, qr_sz + 6, qr_sz + 6, fill=1, stroke=0)
c.setStrokeColor(BRONZE); c.setLineWidth(0.4)
c.rect(qr_x - 1, qr_y - 1, qr_sz + 2, qr_sz + 2, fill=0, stroke=1)
c.drawImage(QR, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

# QR label
c.setFont("InstrumentSans", 7.5); c.setFillColor(TAUPE)
lbl = "Scan to Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "InstrumentSans", 7.5)/2,
             qr_y - 11, lbl)

# ── Trim marks (for print, show on screen) ─────────────
c.setStrokeColor(HexColor("#CCCCCC"))
c.setLineWidth(0.25)
mark = 12
# Top-left
c.line(BLEED, H - BLEED, BLEED - mark, H - BLEED)
c.line(BLEED, H - BLEED, BLEED, H - BLEED + mark)
# Top-right
c.line(W - BLEED, H - BLEED, W - BLEED + mark, H - BLEED)
c.line(W - BLEED, H - BLEED, W - BLEED, H - BLEED + mark)
# Bottom-left
c.line(BLEED, BLEED, BLEED - mark, BLEED)
c.line(BLEED, BLEED, BLEED, BLEED - mark)
# Bottom-right
c.line(W - BLEED, BLEED, W - BLEED + mark, BLEED)
c.line(W - BLEED, BLEED, W - BLEED, BLEED - mark)

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
