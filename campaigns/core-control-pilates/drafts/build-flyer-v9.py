#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v9
v7 editorial flow + modern bold type + warm organic palette
No web components. Breathing, flowing, organic.
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
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v9.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v9.png")

TRIM_W = 8.5 * inch
TRIM_H = 11 * inch
BLEED = 0.125 * inch
W = TRIM_W + 2 * BLEED
H = TRIM_H + 2 * BLEED
SAFE_L = BLEED + 0.35 * inch
SAFE_R = W - BLEED - 0.35 * inch

# ── Warm organic palette ───────────────────────────────
LINEN       = HexColor("#FAF6F0")
WARM_SAND   = HexColor("#E8DDD0")
CHARCOAL    = HexColor("#2A2522")
CLAY        = HexColor("#B5654A")   # warm terracotta
RICH_BROWN  = HexColor("#5C3D2E")   # deep warm brown
DUSTY_ROSE  = HexColor("#C4908A")   # soft blush
WARM_GRAY   = HexColor("#8A7E76")
SAND_DARK   = HexColor("#A69584")

# ── Fonts ──────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("Outfit", os.path.join(FONTS, "Outfit-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Outfit-Bold", os.path.join(FONTS, "Outfit-Bold.ttf")))
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


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah")

# ── Linen background ──────────────────────────────────
c.setFillColor(LINEN)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Full-bleed studio photo — top 52% ─────────────────
img = Image.open(HERO)
iw, ih = img.size

img_zone_h = H * 0.52
crop_ratio = W / img_zone_h
if iw/ih > crop_ratio:
    new_w = int(ih * crop_ratio)
    left = (iw - new_w) // 2
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    new_h = int(iw / crop_ratio)
    top = int(ih * 0.08)
    cropped = img.crop((0, top, iw, min(top + new_h, ih)))

img_y = H - img_zone_h
crop_path = os.path.join(BASE, "drafts", ".temp_v9.jpg")
cropped.save(crop_path, "JPEG", quality=95)
c.drawImage(crop_path, 0, img_y, width=W, height=img_zone_h)

# Warm gradient fade into linen
steps = 50
fade_h = img_zone_h * 0.22
for i in range(steps):
    frac = i / steps
    strip_h = fade_h / steps + 0.5
    y_pos = img_y + fade_h * (1 - frac)
    alpha = frac ** 1.2 * 0.97
    c.setFillColor(Color(0.98, 0.965, 0.94, alpha))
    c.rect(0, y_pos, W, strip_h, fill=1, stroke=0)

# ── Text flows organically below ──────────────────────
y = img_y - 2

# ── HEADLINE — big, bold, modern ──────────────────────
centered(c, "Pilates by", y, "Outfit-Bold", 46, CHARCOAL)
y -= 48
centered(c, "Menukhah", y, "Outfit-Bold", 46, CHARCOAL)
y -= 20

# Warm clay accent line (short, organic weight)
c.setStrokeColor(CLAY)
c.setLineWidth(2.5)
c.line(W/2 - 30, y, W/2 + 30, y)
y -= 22

# ── SUBHEAD ────────────────────────────────────────────
centered(c, "Women-Only Pilates", y, "Outfit", 20, CLAY)
y -= 24

# ── Tagline ────────────────────────────────────────────
centered(c, "Build strength, mobility, and confidence", y, "Lora-Italic", 13, WARM_GRAY)
y -= 17
centered(c, "in a private boutique setting.", y, "Lora-Italic", 13, WARM_GRAY)
y -= 20

# ── Vibe line — simple, flowing ────────────────────────
centered(c, "Women Only  \u00b7  Beginner Friendly  \u00b7  Private Studio  \u00b7  Small Groups",
         y, "InstrumentSans", 9.5, SAND_DARK)
y -= 24

# ── Pricing — bold, clean, no cards ───────────────────
mid = W / 2
gap = 12

# Price 1
right_t(c, "5 Classes", mid - gap, y, "Outfit", 17, CHARCOAL)
left_t(c, "$100", mid + gap, y, "Outfit-Bold", 20, CLAY)
y -= 28

# Price 2
right_t(c, "10 Classes", mid - gap, y, "Outfit", 17, CHARCOAL)
left_t(c, "$180", mid + gap, y, "Outfit-Bold", 20, CLAY)
y -= 28

# ── Schedule ───────────────────────────────────────────
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Outfit-Bold", 14, CHARCOAL)
y -= 30

# ── CTA — warm clay pill ──────────────────────────────
cta = "Book Your Spot"
cta_font = "Outfit-Bold"
cta_sz = 15
cta_pw = c.stringWidth(cta, cta_font, cta_sz) + 56
cta_ph = 38
cta_x = (W - cta_pw) / 2
cta_y = y - cta_ph / 2

c.setFillColor(RICH_BROWN)
c.roundRect(cta_x, cta_y, cta_pw, cta_ph, cta_ph/2, fill=1, stroke=0)
c.setFont(cta_font, cta_sz)
c.setFillColor(LINEN)
c.drawString((W - c.stringWidth(cta, cta_font, cta_sz))/2, cta_y + 12, cta)

y = cta_y - 26

# ── Footer: contact + QR ──────────────────────────────
left_t(c, "(201) 250 6576", SAFE_L, y, "Outfit-Bold", 12, CHARCOAL)
y_l2 = y - 16
left_t(c, "The Core, 418 Cedar Lane, Teaneck, NJ", SAFE_L, y_l2, "Outfit", 10, WARM_GRAY)
y_l3 = y_l2 - 15
left_t(c, "Grip socks required \u2014 available for purchase", SAFE_L, y_l3, "Lora-Italic", 9, WARM_GRAY)

# QR
qr_sz = 70
qr_x = SAFE_R - qr_sz
qr_y = y - qr_sz + 20

c.setFillColor(HexColor("#FFFFFF"))
c.roundRect(qr_x - 4, qr_y - 4, qr_sz + 8, qr_sz + 8, 4, fill=1, stroke=0)
c.setStrokeColor(WARM_SAND); c.setLineWidth(0.6)
c.roundRect(qr_x - 4, qr_y - 4, qr_sz + 8, qr_sz + 8, 4, fill=0, stroke=1)
c.drawImage(QR, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

c.setFont("Outfit-Bold", 8); c.setFillColor(CLAY)
lbl = "Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "Outfit-Bold", 8)/2,
             qr_y - 13, lbl)

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
