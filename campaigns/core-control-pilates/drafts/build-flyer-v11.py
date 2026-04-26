#!/usr/bin/env python3
"""
Pilates by Menukhah — Flyer v11
PORTRAIT. Cream background, gold frame, studio photo band in middle.
Elegant boutique style inspired by "Find Your Flow" flyer layout.
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
OUT_PDF = os.path.join(BASE, "drafts", "flyer-women-only-packages-v11.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "flyer-women-only-packages-v11.png")

# 8.5x11 portrait + bleed
TRIM_W = 8.5 * inch
TRIM_H = 11 * inch
BLEED = 0.125 * inch
W = TRIM_W + 2 * BLEED
H = TRIM_H + 2 * BLEED
SAFE = 0.4 * inch
SL = BLEED + SAFE
SR = W - BLEED - SAFE

# ── Colors ─────────────────────────────────────────────
LINEN     = HexColor("#FAF6F0")
WHITE     = HexColor("#FFFFFF")
CLAY      = HexColor("#E08A5E")
BRONZE    = HexColor("#A07050")
GOLD      = HexColor("#B8964E")
GOLD_LIGHT = HexColor("#D4B978")
CHARCOAL  = HexColor("#2A2522")
COCOA     = HexColor("#5C3D2E")
WARM_GRAY = HexColor("#8A7E76")
DIVIDER   = HexColor("#D9D1C7")

# ── Fonts ──────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("Jura-Light", os.path.join(FONTS, "Jura-Light.ttf")))
pdfmetrics.registerFont(TTFont("Jura-Medium", os.path.join(FONTS, "Jura-Medium.ttf")))
pdfmetrics.registerFont(TTFont("Lora", os.path.join(FONTS, "Lora-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Italic", os.path.join(FONTS, "Lora-Italic.ttf")))
pdfmetrics.registerFont(TTFont("Lora-Bold", os.path.join(FONTS, "Lora-Bold.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONTS, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONTS, "InstrumentSans-Bold.ttf")))

def centered(c, text, y, font, size, color=CHARCOAL):
    c.setFont(font, size); c.setFillColor(color)
    c.drawString(W/2 - c.stringWidth(text, font, size)/2, y, text)

def diamond_rule(c, y, color=GOLD, rule_w=140, gap=12):
    """Draw a horizontal rule with diamond ornaments in the center."""
    mid = W / 2
    # Lines
    c.setStrokeColor(color); c.setLineWidth(0.5)
    c.line(mid - rule_w, y, mid - gap, y)
    c.line(mid + gap, y, mid + rule_w, y)
    # Diamonds
    sz = 3.5
    c.setFillColor(color)
    for dx in [-4, 4]:
        cx_d = mid + dx
        p = c.beginPath()
        p.moveTo(cx_d, y + sz)
        p.lineTo(cx_d + sz, y)
        p.lineTo(cx_d, y - sz)
        p.lineTo(cx_d - sz, y)
        p.close()
        c.drawPath(p, fill=1, stroke=0)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah")

# ── Linen background ──────────────────────────────────
c.setFillColor(LINEN)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Gold double-line frame ────────────────────────────
frame_in = BLEED + 18
c.setStrokeColor(GOLD_LIGHT); c.setLineWidth(0.4)
c.rect(frame_in, frame_in, W - 2*frame_in, H - 2*frame_in, fill=0, stroke=1)
frame_in2 = frame_in + 5
c.setLineWidth(0.25)
c.rect(frame_in2, frame_in2, W - 2*frame_in2, H - 2*frame_in2, fill=0, stroke=1)

# Corner accents (small L-shaped marks at each corner of outer frame)
corner_len = 20
c.setStrokeColor(GOLD); c.setLineWidth(0.8)
for cx_c, cy_c, dx, dy in [
    (frame_in, H - frame_in, 1, -1),
    (W - frame_in, H - frame_in, -1, -1),
    (frame_in, frame_in, 1, 1),
    (W - frame_in, frame_in, -1, 1),
]:
    c.line(cx_c, cy_c, cx_c + corner_len * dx, cy_c)
    c.line(cx_c, cy_c, cx_c, cy_c + corner_len * dy)

# ── TOP SECTION — headline + tagline ──────────────────
y = H - frame_in2 - 50  # start well inside the frame

centered(c, "Pilates by", y, "Jura-Light", 52, COCOA)
y -= 54
centered(c, "Menukhah", y, "Jura-Light", 52, COCOA)
y -= 24

# Tagline
centered(c, "Strength, balance & peace of mind", y, "Lora-Italic", 15, WARM_GRAY)
y -= 24

# Diamond rule
diamond_rule(c, y, GOLD, rule_w=120, gap=12)
y -= 20

# ── STUDIO PHOTO — full-width band, inset within frame ──
photo_h = H * 0.36
photo_y = y - photo_h

img = Image.open(HERO)
iw, ih = img.size

# Crop for wide landscape band, shifted right to show mirrors
photo_inset_w = W - 2 * (frame_in2 + 1)
crop_ratio = photo_inset_w / photo_h
if iw / ih > crop_ratio:
    new_w = int(ih * crop_ratio)
    max_left = iw - new_w
    left = max_left  # all the way right for mirrors
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    new_h = int(iw / crop_ratio)
    top = (ih - new_h) // 2
    cropped = img.crop((0, top, iw, top + new_h))

enhancer = ImageEnhance.Brightness(cropped)
cropped = enhancer.enhance(1.05)

crop_path = os.path.join(BASE, "drafts", ".temp_v11.jpg")
cropped.save(crop_path, "JPEG", quality=98)
# Inset photo within the gold frame
photo_x = frame_in2 + 1
photo_w = W - 2 * (frame_in2 + 1)
c.drawImage(crop_path, photo_x, photo_y, width=photo_w, height=photo_h)

# Thin gold lines framing the photo top and bottom
c.setStrokeColor(GOLD_LIGHT); c.setLineWidth(0.5)
c.line(photo_x, photo_y + photo_h, photo_x + photo_w, photo_y + photo_h)
c.line(photo_x, photo_y, photo_x + photo_w, photo_y)

# ── QR on photo — bottom right (upscaled for crispness) ──
qr_sz = 64
qr_x = SR - qr_sz - 8
qr_y = photo_y + 14

# Upscale QR with nearest-neighbor to keep pixels sharp
qr_img = Image.open(QR).convert("RGBA")
qr_upscaled = qr_img.resize((qr_img.width * 4, qr_img.height * 4), Image.NEAREST)
qr_crisp_path = os.path.join(BASE, "drafts", ".temp_qr_crisp.png")
qr_upscaled.save(qr_crisp_path, "PNG")

# Label above QR
c.setFont("InstrumentSans", 9.5); c.setFillColor(WHITE)
lbl1 = "Scan to join"
lbl2 = "WhatsApp group"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl1, "InstrumentSans", 9.5)/2,
             qr_y + qr_sz + 20, lbl1)
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl2, "InstrumentSans", 9.5)/2,
             qr_y + qr_sz + 8, lbl2)

# White pad behind QR
c.setFillColor(WHITE)
c.roundRect(qr_x - 4, qr_y - 4, qr_sz + 8, qr_sz + 8, 4, fill=1, stroke=0)
c.drawImage(qr_crisp_path, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

# ── BOTTOM SECTION — info below photo ────────────────
y = photo_y - 18

# Diamond rule
diamond_rule(c, y, GOLD, rule_w=120, gap=12)
y -= 28

# Brand name
centered(c, "PILATES BY MENUKHAH", y, "Jura-Medium", 26, COCOA)
y -= 26

# Subhead
centered(c, "Women-Only  \u00b7  Beginner Friendly", y, "Lora-Italic", 13, WARM_GRAY)
y -= 28

# ── Pricing — prominent and clean ─────────────────────
c.setFont("Jura-Light", 17); c.setFillColor(CHARCOAL)
c.drawString(W/2 - 20 - c.stringWidth("5 Classes", "Jura-Light", 17), y, "5 Classes")
c.setFont("Jura-Medium", 22); c.setFillColor(CLAY)
c.drawString(W/2 + 20, y, "$100")
y -= 30

c.setFont("Jura-Light", 17); c.setFillColor(CHARCOAL)
c.drawString(W/2 - 20 - c.stringWidth("10 Classes", "Jura-Light", 17), y, "10 Classes")
c.setFont("Jura-Medium", 22); c.setFillColor(CLAY)
c.drawString(W/2 + 20, y, "$180")
y -= 30

# ── Contact ───────────────────────────────────────────
centered(c, "(201) 250 6576", y, "Jura-Medium", 13, CHARCOAL)
y -= 18
centered(c, "The Core, 418 Cedar Lane, Teaneck, NJ", y, "Jura-Light", 11, WARM_GRAY)
y -= 20

# Schedule
centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Jura-Medium", 13, CHARCOAL)
y -= 18

# Diamond rule
diamond_rule(c, y, GOLD, rule_w=100, gap=12)
y -= 22

# Grip socks
centered(c, "Grip socks required \u2014 available for purchase", y,
         "Lora-Italic", 10, CLAY)

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

for tmp in [crop_path, qr_crisp_path]:
    if os.path.exists(tmp):
        os.remove(tmp)

subprocess.run(["sips", "-s", "format", "png", "--resampleWidth", "3300",
                 OUT_PDF, "--out", OUT_PNG], capture_output=True)
if os.path.exists(OUT_PNG):
    print(f"PNG saved: {OUT_PNG}")

print("Done!")
