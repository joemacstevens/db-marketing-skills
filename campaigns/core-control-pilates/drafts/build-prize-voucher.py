#!/usr/bin/env python3
"""
Pilates by Menukhah — Free Class Prize Voucher
5x7 gift certificate card for Ezrah Moms Night Out raffle.
Cream/gold/clay branding. Congratulatory tone.
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
HERO = os.path.join(BASE, "Studio", "Copy of gym_1_14_26--4.jpg")
QR = os.path.join(BASE, "brandkit-seed", "menukhah", "Whats App QR Code.png")
OUT_PDF = os.path.join(BASE, "drafts", "prize-voucher-free-class.pdf")
OUT_PNG = os.path.join(BASE, "drafts", "prize-voucher-free-class.png")

# 5x7 landscape (wider than tall) + bleed
BLEED = 0.125 * inch
W = 7 * inch + 2 * BLEED
H = 5 * inch + 2 * BLEED

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

def diamond(c, x, y, sz, color=GOLD):
    c.setFillColor(color)
    p = c.beginPath()
    p.moveTo(x, y + sz)
    p.lineTo(x + sz, y)
    p.lineTo(x, y - sz)
    p.lineTo(x - sz, y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

def diamond_rule(c, y, color=GOLD, rule_w=100, gap=10):
    mid = W / 2
    c.setStrokeColor(color); c.setLineWidth(0.4)
    c.line(mid - rule_w, y, mid - gap, y)
    c.line(mid + gap, y, mid + rule_w, y)
    diamond(c, mid - 3.5, y, 3, color)
    diamond(c, mid + 3.5, y, 3, color)


# ── Build ──────────────────────────────────────────────
c = canvas.Canvas(OUT_PDF, pagesize=(W, H))
c.setTitle("Pilates by Menukhah — Free Class Voucher")

# ── Linen background ──────────────────────────────────
c.setFillColor(LINEN)
c.rect(0, 0, W, H, fill=1, stroke=0)

# ── Studio photo strip along bottom ──────────────────
strip_h = H * 0.22
img = Image.open(HERO)
iw, ih = img.size
crop_ratio = W / strip_h
if iw / ih > crop_ratio:
    new_w = int(ih * crop_ratio)
    max_left = iw - new_w
    left = max_left
    cropped = img.crop((left, 0, left + new_w, ih))
else:
    new_h = int(iw / crop_ratio)
    top = (ih - new_h) // 2
    cropped = img.crop((0, top, iw, top + new_h))

# Bake the gradient fade directly into the image pixels (no PDF banding)
import numpy as np
cropped_rgb = cropped.convert("RGB")
arr = np.array(cropped_rgb, dtype=np.float32)
h_px, w_px = arr.shape[:2]
fade_zone = int(h_px * 0.40)  # top 40% of the strip fades to linen
linen_rgb = np.array([250, 246, 240], dtype=np.float32)  # #FAF6F0

for row in range(fade_zone):
    # row 0 = top of image = should be fully linen
    # row fade_zone = transition done = fully photo
    frac = row / fade_zone  # 0 at top, 1 at bottom of fade
    alpha = frac ** 1.4      # ease-in curve
    arr[row] = arr[row] * alpha + linen_rgb * (1 - alpha)

faded = Image.fromarray(arr.astype(np.uint8))
crop_path = os.path.join(BASE, "drafts", ".temp_voucher.jpg")
faded.save(crop_path, "JPEG", quality=98)
c.drawImage(crop_path, 0, 0, width=W, height=strip_h)

# ── Gold double-line frame ────────────────────────────
frame_in = BLEED + 14
c.setStrokeColor(GOLD_LIGHT); c.setLineWidth(0.4)
c.rect(frame_in, frame_in, W - 2*frame_in, H - 2*frame_in, fill=0, stroke=1)
frame_in2 = frame_in + 4
c.setLineWidth(0.25)
c.rect(frame_in2, frame_in2, W - 2*frame_in2, H - 2*frame_in2, fill=0, stroke=1)

# Corner accents
corner_len = 16
c.setStrokeColor(GOLD); c.setLineWidth(0.7)
for cx_c, cy_c, dx, dy in [
    (frame_in, H - frame_in, 1, -1),
    (W - frame_in, H - frame_in, -1, -1),
    (frame_in, frame_in, 1, 1),
    (W - frame_in, frame_in, -1, 1),
]:
    c.line(cx_c, cy_c, cx_c + corner_len * dx, cy_c)
    c.line(cx_c, cy_c, cx_c, cy_c + corner_len * dy)

# ── Content ───────────────────────────────────────────
y = H - frame_in2 - 32

# Brand name — small, elegant
centered(c, "Pilates by Menukhah", y, "Jura-Light", 16, WARM_GRAY)
y -= 22

# Diamond rule
diamond_rule(c, y, GOLD, rule_w=80, gap=10)
y -= 26

# Congratulations
centered(c, "Congratulations!", y, "Lora-Italic", 28, COCOA)
y -= 28

# Prize
centered(c, "You've won", y, "Jura-Light", 14, WARM_GRAY)
y -= 30

# BIG prize line
centered(c, "One Free Class", y, "Jura-Light", 42, COCOA)
y -= 22

# Small diamond accent
diamond(c, W/2, y, 3, CLAY)
y -= 20

# Details
centered(c, "Redeem at either class time:", y, "Lora-Italic", 11, WARM_GRAY)
y -= 20

centered(c, "Sunday 8am  \u00b7  Thursday 8pm", y, "Jura-Medium", 14, CHARCOAL)
y -= 22

# Location
centered(c, "The Core, 418 Cedar Lane, Teaneck NJ", y, "Jura-Light", 11, WARM_GRAY)
y -= 14
centered(c, "(201) 250 6576", y, "Jura-Medium", 11, CHARCOAL)

# ── QR code — bottom right, well above the photo strip ──
qr_sz = 48
qr_x = W - frame_in2 - qr_sz - 14
qr_y = strip_h + 30

# Upscale QR for crispness
qr_img = Image.open(QR).convert("RGBA")
qr_upscaled = qr_img.resize((qr_img.width * 4, qr_img.height * 4), Image.NEAREST)
qr_crisp_path = os.path.join(BASE, "drafts", ".temp_qr_voucher.png")
qr_upscaled.save(qr_crisp_path, "PNG")

c.setFillColor(WHITE)
c.roundRect(qr_x - 3, qr_y - 3, qr_sz + 6, qr_sz + 6, 3, fill=1, stroke=0)
c.setStrokeColor(GOLD_LIGHT); c.setLineWidth(0.3)
c.roundRect(qr_x - 3, qr_y - 3, qr_sz + 6, qr_sz + 6, 3, fill=0, stroke=1)
c.drawImage(qr_crisp_path, qr_x, qr_y, width=qr_sz, height=qr_sz,
            preserveAspectRatio=True, anchor='c')

c.setFont("Jura-Medium", 7); c.setFillColor(COCOA)
lbl = "Join WhatsApp"
c.drawString(qr_x + qr_sz/2 - c.stringWidth(lbl, "Jura-Medium", 7)/2,
             qr_y - 10, lbl)

# ── Grip socks note — small, bottom left above photo ──
c.setFont("Lora-Italic", 7.5); c.setFillColor(WARM_GRAY)
c.drawString(frame_in2 + 14, strip_h + 14,
             "Grip socks required \u2014 available for purchase")

# ── Trim marks ─────────────────────────────────────────
c.setStrokeColor(Color(0.8, 0.8, 0.8, 0.4)); c.setLineWidth(0.25)
m = 10
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
