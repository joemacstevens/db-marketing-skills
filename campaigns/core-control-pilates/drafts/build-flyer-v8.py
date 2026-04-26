#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v8
MODERN take: bold sans-serif, sage green accents, contemporary layout
Same studio photo, same content, fresh energy
"""

import os, subprocess
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

BASE = "/Users/joestevens/Projects/Pilates-by-Menukhah"
FONTS = "/Users/joestevens/.claude/skills/canvas-design/canvas-fonts"
HERO = os.path.join(BASE, "Studio", "Image 1.jpg")
QR = os.path.join(BASE, "brandkit-seed", "menukhah", "Whats App QR Code.png")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v8.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v8.png")

# 8.5x11 + bleed
TRIM_W = 8.5 * inch
TRIM_H = 11 * inch
BLEED = 0.125 * inch
W = TRIM_W + 2 * BLEED
H = TRIM_H + 2 * BLEED
SAFE = 0.35 * inch
SAFE_L = BLEED + SAFE
SAFE_R = W - BLEED - SAFE

# ── Modern palette ─────────────────────────────────────
OFF_WHITE   = HexColor("#FAFAF7")
WARM_WHITE  = HexColor("#F5F3EE")
CHARCOAL    = HexColor("#1C1C1C")
DEEP_GREEN  = HexColor("#2D4A3E")   # forest/sage — bold modern accent
SAGE        = HexColor("#6B8F71")   # lighter sage
TERRACOTTA  = HexColor("#C4704B")   # warm earthy pop
CLAY        = HexColor("#A0583C")
WARM_GRAY   = HexColor("#7A7570")
LIGHT_GRAY  = HexColor("#C8C4BE")
DARK_BG     = HexColor("#1C1C1C")

# ── Fonts (modern, bold) ──────────────────────────────
pdfmetrics.registerFont(TTFont("Outfit", os.path.join(FONTS, "Outfit-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Outfit-Bold", os.path.join(FONTS, "Outfit-Bold.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONTS, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONTS, "InstrumentSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(FONTS, "Lora-Italic.ttf")))
pdfmetrics.registerFont(TTFont("Lora", os.path.join(FONTS, "Lora-Regular.ttf")))
pdfmetrics.registerFont(TTFont("WorkSans", os.path.join(FONTS, "WorkSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("WorkSans-Bold", os.path.join(FONTS, "WorkSans-Bold.ttf")))

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


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah")

# ── Off-white background ───────────────────────────────
c.setFillColor(OFF_WHITE)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Dark green top bar ─────────────────────────────────
bar_h = 52
c.setFillColor(DEEP_GREEN)
c.rect(0, H - bar_h, W, bar_h, fill=1, stroke=0)

# Brand name in the bar — bold, modern
centered(c, "PILATES BY MENUKHAH", H - bar_h + 18, "Outfit-Bold", 16,
         OFF_WHITE, tracking=5)

# ── Studio photo — full bleed below bar ────────────────
img = Image.open(HERO)
iw, ih = img.size

img_top = H - bar_h
img_zone_h = H * 0.48
img_zone_w = W

crop_ratio = img_zone_w / img_zone_h
if iw/ih > crop_ratio:
    new_w = int(ih * crop_ratio)
    left = (iw - new_w) // 2
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    new_h = int(iw / crop_ratio)
    top = int(ih * 0.08)
    cropped = img.crop((0, top, iw, min(top + new_h, ih)))

img_y = img_top - img_zone_h
crop_path = os.path.join(BASE, "drafts", ".temp_v8.jpg")
cropped.save(crop_path, "JPEG", quality=95)
c.drawImage(crop_path, 0, img_y, width=W, height=img_zone_h)

# Thin terracotta accent line below photo
c.setFillColor(TERRACOTTA)
c.rect(0, img_y - 4, W, 4, fill=1, stroke=0)

# ── Content zone ───────────────────────────────────────
y = img_y - 32

# ── Headline — BIG and BOLD ────────────────────────────
# Split into two lines for impact
centered(c, "Women-Only", y, "Outfit-Bold", 48, DEEP_GREEN)
y -= 50
centered(c, "Pilates", y, "Outfit-Bold", 48, DEEP_GREEN)
y -= 26

# Tagline
centered(c, "Build strength, mobility, and confidence in a private boutique setting.",
         y, "Lora-Italic", 12, WARM_GRAY)
y -= 24

# ── Vibe chips — modern pill-style ─────────────────────
chips = ["Women Only", "Beginner Friendly", "Private Studio", "Small Groups"]
chip_font = "InstrumentSans"
chip_sz = 8.5
chip_h = 20
chip_pad = 14
chip_gap = 8

# Calculate total width
chip_widths = [c.stringWidth(ch, chip_font, chip_sz) + chip_pad * 2 for ch in chips]
total_chips_w = sum(chip_widths) + chip_gap * (len(chips) - 1)
cx = (W - total_chips_w) / 2

chip_y = y - chip_h
for i, ch in enumerate(chips):
    cw = chip_widths[i]
    # Pill outline
    c.setStrokeColor(SAGE)
    c.setLineWidth(0.8)
    c.setFillColor(OFF_WHITE)
    c.roundRect(cx, chip_y, cw, chip_h, chip_h/2, fill=1, stroke=1)
    # Text
    c.setFont(chip_font, chip_sz)
    c.setFillColor(DEEP_GREEN)
    c.drawString(cx + chip_pad, chip_y + 6, ch)
    cx += cw + chip_gap

y = chip_y - 24

# ── Pricing — bold and clear ───────────────────────────
# Two side-by-side pricing cards
card_w = (SAFE_R - SAFE_L - 16) / 2
card_h = 52
card_y = y - card_h

# Left card: 5 classes
lx = SAFE_L
c.setFillColor(WARM_WHITE)
c.roundRect(lx, card_y, card_w, card_h, 8, fill=1, stroke=0)
c.setStrokeColor(LIGHT_GRAY); c.setLineWidth(0.5)
c.roundRect(lx, card_y, card_w, card_h, 8, fill=0, stroke=1)
centered_x = lx + card_w / 2
c.setFont("Outfit-Bold", 22); c.setFillColor(TERRACOTTA)
t = "$100"
c.drawString(centered_x - c.stringWidth(t, "Outfit-Bold", 22)/2, card_y + 26, t)
c.setFont("InstrumentSans", 10); c.setFillColor(WARM_GRAY)
t2 = "5 Classes"
c.drawString(centered_x - c.stringWidth(t2, "InstrumentSans", 10)/2, card_y + 10, t2)

# Right card: 10 classes
rx = SAFE_L + card_w + 16
c.setFillColor(DEEP_GREEN)
c.roundRect(rx, card_y, card_w, card_h, 8, fill=1, stroke=0)
centered_x2 = rx + card_w / 2
c.setFont("Outfit-Bold", 22); c.setFillColor(OFF_WHITE)
t = "$180"
c.drawString(centered_x2 - c.stringWidth(t, "Outfit-Bold", 22)/2, card_y + 26, t)
c.setFont("InstrumentSans", 10); c.setFillColor(HexColor("#B8D4BC"))
t2 = "10 Classes"
c.drawString(centered_x2 - c.stringWidth(t2, "InstrumentSans", 10)/2, card_y + 10, t2)

y = card_y - 22

# ── Schedule ───────────────────────────────────────────
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Outfit-Bold", 14, CHARCOAL)
y -= 28

# ── CTA — bold green pill ─────────────────────────────
cta = "BOOK YOUR SPOT"
cta_font = "Outfit-Bold"
cta_sz = 14
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 56
cta_ph = 36
cta_x = (W - cta_pw) / 2
cta_y = y - cta_ph / 2

c.setFillColor(TERRACOTTA)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)
c.setFont(cta_font, cta_sz)
c.setFillColor(OFF_WHITE)
c.drawString((W - c.stringWidth(cta, cta_font, cta_sz))/2, cta_y + 12, cta)

y = cta_y - 24

# ── Footer: contact + QR ──────────────────────────────
left_t(c, "(201) 250 6576", SAFE_L, y, "Outfit-Bold", 12, CHARCOAL)
y_l2 = y - 15
left_t(c, "The Core, 418 Cedar Lane, Teaneck, NJ", SAFE_L, y_l2, "InstrumentSans", 10, WARM_GRAY)
y_l3 = y_l2 - 14
left_t(c, "Grip socks required \u2014 available for purchase", SAFE_L, y_l3, "Lora-Italic", 9, WARM_GRAY)

# QR
qr_sz = 68
qr_x = SAFE_R - qr_sz
qr_y = y - qr_sz + 18

c.setFillColor(HexColor("#FFFFFF"))
c.roundRect(qr_x - 4, qr_y - 4, qr_sz + 8, qr_sz + 8, 6, fill=1, stroke=0)
c.setStrokeColor(LIGHT_GRAY); c.setLineWidth(0.5)
c.roundRect(qr_x - 4, qr_y - 4, qr_sz + 8, qr_sz + 8, 6, fill=0, stroke=1)
c.drawImage(QR, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

c.setFont("InstrumentSans-Bold", 7.5); c.setFillColor(DEEP_GREEN)
lbl = "Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "InstrumentSans-Bold", 7.5)/2,
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
