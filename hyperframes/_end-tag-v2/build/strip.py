#!/usr/bin/env python3
"""Frame strip of a render: python3 build/strip.py <video> <out.jpg> <first tag frame in the video> [label]"""
import subprocess
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SHOTS = [(0, "cut in"), (2, "WE"), (12, "ARE"), (25, "BOOM / DIFFERENT"), (27, "flash decay"), (50, "BREED."),
         (75, "hold"), (90, "downbeat / logo"), (101, "tagline"), (149, "last frame")]


def main(video, out, first, label=""):
    W, H, TW, TH = 1080, 1920, 270, 480
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", video, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    pad, bar = 6, 64
    sheet = Image.new("RGB", (len(SHOTS) * (TW + pad) + pad, TH + bar + pad + (34 if label else 0)), (28, 28, 28))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 17)
    except OSError:
        font = ImageFont.load_default()
    top = 34 if label else 0
    if label:
        d.text((pad, 8), label, fill=(235, 235, 235), font=font)
    for i, (f, what) in enumerate(SHOTS):
        x = pad + i * (TW + pad)
        im = Image.fromarray(fr[min(first + f, len(fr) - 1)]).resize((TW, TH), Image.LANCZOS)
        sheet.paste(im, (x, top))
        for y in (250, 1920 - 340):   # phone safe-zone guides
            d.line([(x, top + y * TH / H), (x + TW, top + y * TH / H)], fill=(0, 170, 200))
        d.text((x + 4, top + TH + 8), f"f{f:03d}  {f / 30:.2f}s", fill=(255, 210, 0), font=font)
        d.text((x + 4, top + TH + 32), what, fill=(220, 220, 220), font=font)
    sheet.save(out, quality=88)
    print(out, sheet.size)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4] if len(sys.argv) > 4 else "")
