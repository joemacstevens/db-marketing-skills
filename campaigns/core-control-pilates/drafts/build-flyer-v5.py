#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v5
Close-crop editorial image, warm tones
Headline: Pilates by Menukhah
Subhead: Women-Only Pilates
Includes WhatsApp QR code
"""

import os, subprocess
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
HERO = os.path.join(BASE, "drafts", "nanobanana-output", "artistic_closeup_editorial_photo.png")
QR = os.path.join(BASE, "brandkit-seed", "menukhah", "Whats App QR Code.png")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v5.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v5.png")

W, H = letter

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
    if tracking > 0:
        total = sum(c.stringWidth(ch, font, size) + tracking for ch in text) - tracking
        x = (W - total) / 2
        for ch in text:
            c.drawString(x, y, ch)
            x += c.stringWidth(ch, font, size) + tracking
    else:
        c.drawString((W - c.stringWidth(text, font, size)) / 2, y, text)

def left_text(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, text)

def right_text(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x - c.stringWidth(text, font, size), y, text)

def rule(c, y, length=36, color=BRONZE, width=0.4):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(W/2 - length/2, y, W/2 + length/2, y)

def diamond(c, x, y, sz=2.2, color=BRONZE):
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(x, y+sz); p.lineTo(x+sz, y); p.lineTo(x, y-sz); p.lineTo(x-sz, y); p.close()
    c.drawPath(p, fill=1, stroke=0)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=letter)
c.setTitle("Pilates by Menukhah")

# ── Cream background ───────────────────────────────────
c.setFillColor(CREAM)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Outer frame ────────────────────────────────────────
fr = 0.38 * inch
c.setStrokeColor(BRONZE)
c.setLineWidth(0.4)
c.rect(fr, fr, W-2*fr, H-2*fr, fill=0, stroke=1)
c.setStrokeColor(DIVIDER)
c.setLineWidth(0.2)
c.rect(fr+3, fr+3, W-2*fr-6, H-2*fr-6, fill=0, stroke=1)

# Corner diamonds
co = fr + 10
for cx, cy in [(co, H-co), (W-co, H-co), (co, co), (W-co, co)]:
    diamond(c, cx, cy, sz=1.8, color=BRONZE)

# ── Top-down layout ────────────────────────────────────
y = H - 0.7 * inch
margin = 0.65 * inch

# ── HEADLINE: Pilates by Menukhah ──────────────────────
centered(c, "Pilates by Menukhah", y, "Italiana", 48, CHARCOAL)
y -= 16
rule(c, y, length=52, color=BRONZE, width=0.35)
y -= 20

# ── SUBHEAD ────────────────────────────────────────────
centered(c, "WOMEN-ONLY PILATES", y, "InstrumentSans-Bold", 11, COCOA, tracking=3.5)
y -= 18

# ── Tagline ────────────────────────────────────────────
centered(c, "Strength, mobility, and confidence in a private boutique setting.",
         y, "Lora-Italic", 10, TAUPE)
y -= 16

# ── Vibe points ────────────────────────────────────────
centered(c, "Women Only  \u00b7  Beginner Friendly  \u00b7  Private Studio  \u00b7  Small Groups",
         y, "InstrumentSans", 7.5, SOFT_BROWN, tracking=0.8)
y -= 16

# ── Hero image (wide landscape crop, centered) ─────────
img = Image.open(HERO)
iw, ih = img.size

# Wide landscape crop from square: take full width, crop to middle band
photo_margin = 0.58 * inch
photo_w = W - 2 * photo_margin
target_h = 260  # generous height
target_ratio = photo_w / target_h

# Crop to landscape from the square
new_h = int(iw / target_ratio)
top_offset = max(0, (ih - new_h) // 2)
cropped = img.crop((0, top_offset, iw, top_offset + new_h))

photo_h = target_h
photo_x = photo_margin
photo_y = y - photo_h

# Ivory backing
c.setFillColor(IVORY)
c.rect(photo_x - 3, photo_y - 3, photo_w + 6, photo_h + 6, fill=1, stroke=0)

# Bronze frame
c.setStrokeColor(BRONZE)
c.setLineWidth(0.5)
c.rect(photo_x - 1, photo_y - 1, photo_w + 2, photo_h + 2, fill=0, stroke=1)

crop_path = os.path.join(BASE, "drafts", ".temp_v5.jpg")
cropped.save(crop_path, "JPEG", quality=95)
c.drawImage(crop_path, photo_x, photo_y, width=photo_w, height=photo_h)

y = photo_y - 16
rule(c, y, length=40, color=BRONZE, width=0.3)
y -= 20

# ── Pricing ────────────────────────────────────────────
centered(c, "CLASS PACKAGES", y, "InstrumentSans-Bold", 8.5, BRONZE, tracking=2.5)
y -= 20

mid = W / 2
gap = 10
right_text(c, "5 Classes", mid - gap, y, "Lora", 12, CHARCOAL)
left_text(c, "$100", mid + gap, y, "InstrumentSans-Bold", 12.5, COCOA)
c.setFillColor(DIVIDER)
c.circle(mid, y + 4, 1, fill=1, stroke=0)
y -= 18
right_text(c, "10 Classes", mid - gap, y, "Lora", 12, CHARCOAL)
left_text(c, "$180", mid + gap, y, "InstrumentSans-Bold", 12.5, COCOA)
y -= 20

# ── Schedule ───────────────────────────────────────────
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Lora", 10, BODY)
y -= 20

# ── CTA button ─────────────────────────────────────────
cta = "Book Your Spot"
cta_font = "InstrumentSans-Bold"
cta_sz = 10
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 40
cta_ph = 24
cta_x = (W - cta_pw) / 2
cta_y = y - cta_ph/2

c.setFillColor(COCOA)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)
c.setFont(cta_font, cta_sz)
c.setFillColor(IVORY)
c.drawString((W - c.stringWidth(cta, cta_font, cta_sz))/2, cta_y + 7.5, cta)

y = cta_y - 18

# ── Bottom: Contact left, QR right ─────────────────────
contact_x = margin + 6

left_text(c, "(201) 250 6576", contact_x, y, "InstrumentSans", 8.5, BODY)
y_line2 = y - 12
left_text(c, "The Core, 418 Cedar Lane, Teaneck, NJ", contact_x, y_line2,
          "InstrumentSans", 8, TAUPE)
y_line3 = y_line2 - 13
left_text(c, "Grip socks required \u2014 available for purchase", contact_x, y_line3,
          "Lora-Italic", 7, TAUPE)

# QR code — right side
qr_sz = 56
qr_x = W - margin - qr_sz - 6
qr_y_top = y + 4
qr_y = qr_y_top - qr_sz

# White backing
c.setFillColor(HexColor("#FFFFFF"))
c.rect(qr_x - 3, qr_y - 3, qr_sz + 6, qr_sz + 6, fill=1, stroke=0)
c.setStrokeColor(BRONZE)
c.setLineWidth(0.35)
c.rect(qr_x - 1, qr_y - 1, qr_sz + 2, qr_sz + 2, fill=0, stroke=1)
c.drawImage(QR, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

# QR label
c.setFont("InstrumentSans", 6)
c.setFillColor(TAUPE)
lbl = "Scan to Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "InstrumentSans", 6)/2,
             qr_y - 10, lbl)

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
