#!/usr/bin/env python3
"""Measure temporal flicker ADDED by patching.

In the patched region (where patched differs from original), compare
frame-to-frame change in the patched video vs the original video.
added = patched temporal energy minus original temporal energy; ~0 = no flicker.
"""
import os, sys
import numpy as np
from PIL import Image

ORIG, PATCHED = sys.argv[1], sys.argv[2]
frames = sorted(f for f in os.listdir(ORIG) if f.endswith(".png"))

def load(d, fn):
    return np.asarray(Image.open(os.path.join(d, fn)).convert("L"), dtype=np.float32)

po, pp = load(ORIG, frames[0]), load(PATCHED, frames[0])
tot_o, tot_p, n = 0.0, 0.0, 0
for fn in frames[1:]:
    o, p = load(ORIG, fn), load(PATCHED, fn)
    mask = np.abs(p - o) > 2
    m = mask | (np.abs(pp - po) > 2)
    if m.sum() > 100:
        tot_o += float(np.abs(o - po)[m].mean())
        tot_p += float(np.abs(p - pp)[m].mean())
        n += 1
    po, pp = o, p
print(f"frames measured: {n}")
print(f"original temporal energy in patch region: {tot_o / max(n,1):.2f}")
print(f"patched  temporal energy in patch region: {tot_p / max(n,1):.2f}")
print(f"added flicker: {(tot_p - tot_o) / max(n,1):+.2f}")
