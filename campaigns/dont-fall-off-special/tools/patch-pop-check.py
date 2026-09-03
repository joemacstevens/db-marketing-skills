#!/usr/bin/env python3
"""Patched-pixel area per frame + biggest frame-to-frame jumps (pop detector)."""
import os, sys
import numpy as np
from PIL import Image

ORIG, PATCHED = sys.argv[1], sys.argv[2]
frames = sorted(f for f in os.listdir(ORIG) if f.endswith(".png"))
areas = []
for fn in frames:
    o = np.asarray(Image.open(os.path.join(ORIG, fn)).convert("L"), dtype=np.float32)
    p = np.asarray(Image.open(os.path.join(PATCHED, fn)).convert("L"), dtype=np.float32)
    areas.append(int((np.abs(p - o) > 2).sum()))
a = np.array(areas, dtype=np.float32)
rel = np.abs(np.diff(a)) / np.clip((a[1:] + a[:-1]) / 2, 1, None)
worst = np.argsort(rel)[::-1][:6]
print(f"min area: {a.min():.0f} at frame {int(a.argmin())+1}  (0 would mean the patch vanished)")
print(f"mean area: {a.mean():.0f}, max area: {a.max():.0f}")
print("biggest relative frame-to-frame area jumps:")
for i in worst:
    print(f"  f{i+1}->f{i+2}: {a[i]:.0f} -> {a[i+1]:.0f}  ({rel[i]*100:.0f}%)")
