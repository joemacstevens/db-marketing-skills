#!/usr/bin/env python3
"""Tile head crops from a video at many timestamps into one contact sheet."""
import subprocess, sys, tempfile, os
from PIL import Image, ImageDraw

video, out = sys.argv[1], sys.argv[2]
times = [float(t) for t in sys.argv[3:]] or [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 7.0, 8.5, 10.0, 11.0, 11.6, 11.95]

tiles = []
with tempfile.TemporaryDirectory() as td:
    for i, t in enumerate(times):
        f = os.path.join(td, f"f{i}.png")
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(t),
                        "-i", video, "-frames:v", "1",
                        "-vf", "crop=620:520:230:60,scale=310:-1", f], check=True)
        im = Image.open(f).convert("RGB")
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 66, 24], fill=(0, 0, 0))
        d.text((6, 5), f"{t}s", fill=(255, 255, 255))
        tiles.append(im)

cols = 4
rows = (len(tiles) + cols - 1) // cols
w, h = tiles[0].size
sheet = Image.new("RGB", (cols * w, rows * h), (20, 20, 20))
for i, im in enumerate(tiles):
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
sheet.save(out)
print(f"sheet: {len(tiles)} tiles -> {out}")
