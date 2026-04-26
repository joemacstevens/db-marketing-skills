#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v10 (final refinement)
LANDSCAPE. Full-bleed studio. Frosted panel for readability.
Vertically centered content. Big bold text.
"""

import os, subprocess
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageEnhance

BASE = "/Users/joestevens/Projects/Pilates-by-Menukhah"
FONTS = "/Users/joestevens/.claude/skills/canvas-design/canvas-fonts"
HERO = os.path.join(BASE, "Studio", "Copy of gym_1_14_26--4.jpg")
QR = os.path.join(BASE, "brandkit-seed", "menukhah", "Whats App QR Code.png")
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v10.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v10.png")

BLEED = 0.125 * inch
W = 11 * inch + 2 * BLEED
H = 8.5 * inch + 2 * BLEED

SAFE = 0.45 * inch
SL = BLEED + SAFE
SR = W - BLEED - SAFE

# ── Colors ─────────────────────────────────────────────
WHITE     = HexColor("#FFFFFF")
CLAY      = HexColor("#E08A5E")
DEEP_CLAY = HexColor("#C4704B")
CHARCOAL  = HexColor("#2A2522")
LINEN     = HexColor("#FAF6F0")

# ── Fonts ──────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("Jura-Light", os.path.join(FONTS, "Jura-Light.ttf")))
pdfmetrics.registerFont(TTFont("Jura-Medium", os.path.join(FONTS, "Jura-Medium.ttf")))
pdfmetrics.registerFont(TTFont("Outfit", os.path.join(FONTS, "Outfit-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Outfit-Bold", os.path.join(FONTS, "Outfit-Bold.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(FONTS, "Lora-Italic.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONTS, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONTS, "InstrumentSans-Bold.ttf")))

def txt(c, text, x, y, font, size, color=CHARCOAL):
    c.setFont(font, size); c.setFillColor(color); c.drawString(x, y, text)

def centered(c, text, x_center, y, font, size, color=CHARCOAL):
    c.setFont(font, size); c.setFillColor(color)
    c.drawString(x_center - c.stringWidth(text, font, size)/2, y, text)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah")

# ── Full-bleed studio photo ────────────────────────────
img = Image.open(HERO)
iw, ih = img.size

page_ratio = W / H
img_ratio = iw / ih
if img_ratio > page_ratio:
    new_w = int(ih * page_ratio)
    max_left = iw - new_w
    # Shift crop all the way right to reveal maximum mirrors
    left = max_left
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    new_h = int(iw / page_ratio)
    top = (ih - new_h) // 2
    cropped = img.crop((0, top, iw, top + new_h))

enhancer = ImageEnhance.Brightness(cropped)
cropped = enhancer.enhance(1.05)

crop_path = os.path.join(BASE, "drafts", ".temp_v10c.jpg")
cropped.save(crop_path, "JPEG", quality=95)
c.drawImage(crop_path, 0, 0, width=W, height=H)

# ── Light wash — heavier on left (behind panel), lighter on right (show studio) ──
# Left side: darker so panel blends nicely
c.setFillColor(Color(0.10, 0.08, 0.06, 0.40))
c.rect(0, 0, W * 0.44, H, fill=1, stroke=0)
# Right side: lighter wash to let the studio breathe
c.setFillColor(Color(0.10, 0.08, 0.06, 0.18))
c.rect(W * 0.44, 0, W * 0.56, H, fill=1, stroke=0)

# ── Frosted panel — shrink-wrapped to content, vertically centered ──
panel_w = W * 0.40
panel_x = SL

# Size panel to exactly fit content with even breathing room
pad_v = 44          # vertical breathing room top & bottom
pad_h = 34          # horizontal padding
headline_rise = 38  # visual height above first baseline (50pt thin ascender)
content_drop = 286  # total y-travel from first to last baseline (simplified)
bottom_clear = 6    # space below last text descender
panel_h = pad_v + headline_rise + content_drop + bottom_clear + pad_v
panel_y = (H - panel_h) / 2

# Frosted glass: warm dark translucent
c.setFillColor(Color(0.14, 0.11, 0.09, 0.74))
c.roundRect(panel_x, panel_y, panel_w, panel_h, 16, fill=1, stroke=0)

# Subtle border
c.setStrokeColor(Color(1, 1, 1, 0.08))
c.setLineWidth(0.5)
c.roundRect(panel_x, panel_y, panel_w, panel_h, 16, fill=0, stroke=1)

# Content area inside the panel
cx = panel_x + panel_w / 2
lx = panel_x + pad_h
rx = panel_x + panel_w - pad_h

# ── First baseline — content centered vertically in panel ──
y = panel_y + panel_h - pad_v - headline_rise

# ── HEADLINE — thin modern type ───────────────────────
centered(c, "Pilates by", cx, y, "Jura-Light", 50, WHITE)
y -= 52
centered(c, "Menukhah", cx, y, "Jura-Light", 50, WHITE)
y -= 20

# Clay accent bar — delicate
bar_w = 50
c.setFillColor(CLAY)
c.rect(cx - bar_w/2, y, bar_w, 2, fill=1, stroke=0)
y -= 24

# ── SUBHEAD ────────────────────────────────────────────
centered(c, "Women-Only Pilates", cx, y, "Jura-Medium", 18, CLAY)
y -= 28

# ── Tagline ────────────────────────────────────────────
centered(c, "Build strength, mobility & confidence", cx, y,
         "Lora-Italic", 12, Color(0.88, 0.86, 0.83, 1))
y -= 15
centered(c, "in a boutique setting.", cx, y,
         "Lora-Italic", 12, Color(0.88, 0.86, 0.83, 1))
y -= 28

# ── Pricing — clean and airy ─────────────────────────
centered(c, "5 Classes", cx - 38, y, "Jura-Light", 16, WHITE)
centered(c, "$100", cx + 48, y, "Jura-Medium", 22, CLAY)
y -= 30

centered(c, "10 Classes", cx - 38, y, "Jura-Light", 16, WHITE)
centered(c, "$180", cx + 48, y, "Jura-Medium", 22, CLAY)
y -= 28

# ── Schedule ───────────────────────────────────────────
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", cx, y, "Jura-Medium", 13, WHITE)
y -= 30

# ── CTA ────────────────────────────────────────────────
cta = "Book Your Spot"
cta_font = "Jura-Medium"
cta_sz = 14
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 48
cta_ph = 34
cta_x = cx - cta_pw / 2
cta_y = y - cta_ph / 2 + 4

c.setFillColor(CLAY)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)
c.setFont(cta_font, cta_sz); c.setFillColor(WHITE)
c.drawString(cx - c.stringWidth(cta, cta_font, cta_sz)/2, cta_y + 11, cta)

y = cta_y - 22

# ── Contact — minimal ─────────────────────────────────
centered(c, "(201) 250 6576", cx, y, "Jura-Medium", 11, WHITE)
y -= 15
centered(c, "The Core, 418 Cedar Lane, Teaneck NJ", cx, y,
         "Jura-Light", 9, Color(0.82, 0.79, 0.76, 0.9))
y -= 14
centered(c, "Grip socks required", cx, y,
         "Lora-Italic", 8, Color(0.72, 0.69, 0.66, 0.8))

# ── QR — right side, outside the panel, over the studio ──
qr_sz = 72
qr_x = SR - qr_sz
qr_y = BLEED + SAFE + 10

# Frosted backing for the QR so it's scannable
c.setFillColor(Color(0.14, 0.11, 0.09, 0.70))
c.roundRect(qr_x - 12, qr_y - 22, qr_sz + 24, qr_sz + 36, 10, fill=1, stroke=0)
c.setStrokeColor(Color(1, 1, 1, 0.08)); c.setLineWidth(0.5)
c.roundRect(qr_x - 12, qr_y - 22, qr_sz + 24, qr_sz + 36, 10, fill=0, stroke=1)

# White pad behind QR
c.setFillColor(Color(1, 1, 1, 0.95))
c.roundRect(qr_x - 4, qr_y - 4, qr_sz + 8, qr_sz + 8, 5, fill=1, stroke=0)
c.drawImage(QR, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

# Label below QR
c.setFont("InstrumentSans-Bold", 8.5); c.setFillColor(WHITE)
lbl = "Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "InstrumentSans-Bold", 8.5)/2,
             qr_y - 16, lbl)

# ── Trim marks ─────────────────────────────────────────
c.setStrokeColor(Color(0.8, 0.8, 0.8, 0.4)); c.setLineWidth(0.25)
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

subprocess.run(["sips", "-s", "format", "png", "--resampleWidth", "3300",
                 OUT_PDF, "--out", OUT_PNG], capture_output=True)
if os.path.exists(OUT_PNG):
    print(f"PNG saved: {OUT_PNG}")

print("Done!")
