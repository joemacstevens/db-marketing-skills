#!/usr/bin/env python3
"""v10: temporally-smoothed deglow.

Pass 1: detect up to 2 crown spots per frame + ring-median color per spot.
Pass 2: build left/right trajectories, interpolate gaps, gaussian-smooth
        position, radius, and base color over time.
Pass 3: apply the deglow with the smoothed parameters.

Stills-stable AND motion-stable: geometry/color can no longer jitter.
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageFilter

IN_DIR, OUT_DIR = sys.argv[1], sys.argv[2]
frames = sorted(f for f in os.listdir(IN_DIR) if f.endswith(".png"))
N = len(frames)

def detect(im):
    W, H = im.size
    small = im.resize((W // 4, H // 4), Image.BILINEAR)
    a = np.asarray(small, dtype=np.float32)
    band = a[: int(a.shape[0] * 0.5)]
    r, g, b = band[..., 0], band[..., 1], band[..., 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    skin = (r > 110) & (r > g) & (g > b) & ((r - b) > 30)
    if skin.sum() < 200:
        return []
    rows = skin.sum(axis=1)
    ys = np.where(rows >= 6)[0]
    if not len(ys):
        return []
    yTop, headW = int(ys[0]), int(rows.max())
    crownLimit = yTop + 0.42 * headW
    thr = np.percentile(lum[skin], 94.0)
    hot = skin & (lum > thr)
    lab = np.zeros(hot.shape, dtype=np.int32)
    comps, nid = [], 0
    hs, ws = hot.shape
    for yy in range(hs):
        for xx in range(ws):
            if hot[yy, xx] and lab[yy, xx] == 0:
                nid += 1
                stack = [(yy, xx)]; lab[yy, xx] = nid; pix = []
                while stack:
                    y0, x0 = stack.pop(); pix.append((y0, x0))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            y1, x1 = y0 + dy, x0 + dx
                            if 0 <= y1 < hs and 0 <= x1 < ws and hot[y1, x1] and lab[y1, x1] == 0:
                                lab[y1, x1] = nid; stack.append((y1, x1))
                comps.append(pix)
    good = []
    for c in comps:
        if len(c) < 10:
            continue
        cy = sum(p[0] for p in c) / len(c)
        if cy > crownLimit:
            continue
        good.append(c)
    good.sort(key=len, reverse=True)
    out = []
    for c in good[:2]:
        ys2 = [p[0] for p in c]; xs2 = [p[1] for p in c]
        cy, cx = sum(ys2) / len(ys2), sum(xs2) / len(xs2)
        rr = math.sqrt(len(c) / math.pi) * 2.4 + 8
        out.append((cx * 4, cy * 4, rr * 4))
    return out

def ring_color(im, cx, cy, r):
    W, H = im.size
    ring = []
    for ang in range(0, 360, 5):
        for rr in (r + 14, r + 28):
            x, y = int(cx + rr * math.cos(math.radians(ang))), int(cy + rr * math.sin(math.radians(ang)))
            if 0 <= x < W and 0 <= y < H:
                ring.append(im.getpixel((x, y)))
    if not ring:
        return (170.0, 120.0, 95.0)
    ring.sort(key=lambda c: 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2])
    return tuple(float(v) for v in ring[len(ring) // 2])

# ── Pass 1: detect everything ────────────────────────────────────────────
raw = {}  # t -> list of (cx, cy, r, (R,G,B))
for t, fn in enumerate(frames):
    im = Image.open(os.path.join(IN_DIR, fn)).convert("RGB")
    dets = []
    for cx, cy, r in detect(im):
        dets.append((cx, cy, r, ring_color(im, cx, cy, r * 1.45)))
    raw[t] = dets
    if t % 60 == 0:
        print(f"detect {t}/{N}", flush=True)

# ── Pass 2: trajectories (L/R by x), interpolate, smooth ─────────────────
COLS = 7  # cx, cy, r, R, G, B, valid
traj = np.full((2, N, COLS), np.nan)
lastL, lastR = None, None
for t in range(N):
    dets = sorted(raw[t], key=lambda d: d[0])
    if len(dets) == 2:
        pair = [(0, dets[0]), (1, dets[1])]
    elif len(dets) == 1:
        d = dets[0]
        refL = lastL if lastL is not None else -1e9
        refR = lastR if lastR is not None else 1e9
        side = 0 if abs(d[0] - refL) <= abs(d[0] - refR) else 1
        pair = [(side, d)]
    else:
        pair = []
    for side, d in pair:
        cx, cy, r, col = d
        traj[side, t] = (cx, cy, r, col[0], col[1], col[2], 1.0)
        if side == 0:
            lastL = cx
        else:
            lastR = cx

def interp_smooth(series):
    v = ~np.isnan(series)
    if v.sum() < 4:
        return None
    idx = np.arange(N)
    filled = np.interp(idx, idx[v], series[v])
    k = np.exp(-0.5 * (np.arange(-10, 11) / 4.0) ** 2)
    k /= k.sum()
    pad = np.pad(filled, 10, mode="edge")
    return np.convolve(pad, k, mode="valid")

smoothed = []
for side in range(2):
    ch = [interp_smooth(traj[side, :, c]) for c in range(6)]
    smoothed.append(None if any(c is None for c in ch) else ch)

# ── Pass 3: apply with smoothed params ───────────────────────────────────
def deglow(im, cx, cy, r, base):
    W, H = im.size
    x0, y0 = max(0, int(cx - r)), max(0, int(cy - r))
    x1, y1 = min(W, int(cx + r)), min(H, int(cy + r))
    if x1 - x0 < 8 or y1 - y0 < 8:
        return
    base = np.array(base, dtype=np.float32)
    bl = 0.299 * base[0] + 0.587 * base[1] + 0.114 * base[2]
    box = im.crop((x0, y0, x1, y1))
    rgb = np.asarray(box, dtype=np.float32)
    lum = 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]
    sigma = max(10.0, r * 0.24)
    smooth = np.asarray(
        Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(sigma)), dtype=np.float32)
    glow = np.clip(smooth - bl, 0.0, None)
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.hypot(xx - cx, yy - cy)
    soft = np.clip((r - d) / (r * 0.25), 0.0, 1.0)
    rr_, gg_, bb_ = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    skinpx = (rr_ > 100) & (rr_ > gg_) & (gg_ > bb_) & ((rr_ - bb_) > 22)
    w = np.clip(glow / 22.0, 0.0, 1.0) * 0.97
    inner = np.clip((r * 0.72 - d) / (r * 0.2), 0.0, 1.0)
    w = np.maximum(w, 0.3 * inner)
    w = w * soft * skinpx.astype(np.float32)
    out = np.clip(rgb * (1 - w[..., None]) + base[None, None, :] * w[..., None], 0, 255).astype(np.uint8)
    im.paste(Image.fromarray(out), (x0, y0))

for t, fn in enumerate(frames):
    im = Image.open(os.path.join(IN_DIR, fn)).convert("RGB")
    for side in range(2):
        if smoothed[side] is None:
            continue
        cx, cy, r = smoothed[side][0][t], smoothed[side][1][t], smoothed[side][2][t]
        base = (smoothed[side][3][t], smoothed[side][4][t], smoothed[side][5][t])
        deglow(im, cx, cy, r * 1.45, base)
        deglow(im, cx, cy, r * 1.45, base)
    im.save(os.path.join(OUT_DIR, fn))
    if t % 60 == 0:
        print(f"apply {t}/{N}", flush=True)
print(f"done: {N} frames")
