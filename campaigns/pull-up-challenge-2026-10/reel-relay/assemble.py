# Relay cut: one running count 1..27 passed between four lifters, every rep top landing on a hit of
# "Till I Collapse" (instrumental). Each rep shown is that lifter's REAL Nth rep, so the count is honest:
# Amanda tops out at 6, April at 10, Roberto at 25, Ahmed finishes 27.
#
# Song grid (aubioonset on the instrumental): drop 57.33; stomp-stomp-CLAP every 1.4003s.
#   odd reps land on the CLAP, even reps on the first STOMP; cuts sit on the second stomp (the "and"),
#   so every top is on a hit and every cut is on a hit. Output t=0 is song 54.33 (riser under hook + title).
#
# Writes assets/video/relay.mp4 (1080x1920/30, no audio) + timing.json for index.html.
import json, subprocess

FPS, W, H = 30, 1080, 1920
SONG0 = 54.33
CLAP0, STOMP0, P, AND = 58.856, 59.578, 1.4003, 0.349

def beat(k):  # output time of rep k's top
    if k >= 26:  # Ahmed's finish: 26 and 27 each get two beats (~real speed), both on claps
        return beat(25) + P * (k - 25)
    s = CLAP0 + P * (k - 1) / 2 if k % 2 else STOMP0 + P * (k - 2) / 2
    return s - SONG0

# Rep tops in source seconds. Amanda = Don's count -0.2s (lag checked on frames). April = motion-detected
# (reel-april). Men = Don's count, refined by eye on frame grids for every rep that's on screen.
TOPS = {
    "amanda": {1: 5.16, 2: 6.68, 3: 8.44, 4: 11.16, 5: 14.25, 6: 17.95},
    "april": dict(enumerate([1.2, 3.4, 6.1, 9.1, 11.7, 14.5, 17.4, 20.5, 27.2, 35.6], 1)),
    "roberto": {10: 10.54, 11: 11.68, 12: 12.88, 13: 14.1, 14: 15.4, 15: 16.72, 16: 17.92, 17: 19.2,
                18: 20.75, 19: 23.55, 20: 25.4, 21: 28.1, 22: 31.4, 23: 35.6, 24: 40.2, 25: 48.05},
    "ahmed": {12: 12.86, 13: 14.40, 14: 15.76, 15: 17.05, 16: 18.35, 17: 19.95, 18: 21.44, 19: 22.8,
              20: 24.45, 21: 26.33, 22: 27.92, 23: 29.6, 25: 33.2, 26: 34.85, 27: 36.75},
}
NAMES = {"amanda": "Amanda", "april": "April", "roberto": "Roberto", "ahmed": "Ahmed"}
MAX = {"amanda": 6, "april": 10, "roberto": 25, "ahmed": 27}

CHUNKS = [("amanda", 1, 2), ("april", 3, 4), ("amanda", 5, 6), ("april", 7, 10), ("roberto", 11, 12),
          ("ahmed", 13, 14), ("roberto", 15, 16), ("ahmed", 17, 18), ("roberto", 19, 20), ("ahmed", 21, 22),
          ("roberto", 23, 25), ("ahmed", 26, 27)]

def ease(u):  # half linear, half smoothstep: tops "stick" on the hit
    return 0.5 * u + 0.5 * u * u * (3 - 2 * u)

# Build the output->source map as (out_t0, out_t1, who, fn(out_t)->src)
segs = []
HOOK = (0.0, 3.0, "ahmed", lambda t: 3.6 + t)  # 1.5s hook + title card, Ahmed's early reps at 1x
segs.append(HOOK)
for ci, (who, a, b) in enumerate(CHUNKS):
    tops = TOPS[who]
    last = ci == len(CHUNKS) - 1
    pts = [(beat(k), tops[k]) for k in range(a, b + 1)]
    start = 3.0 if ci == 0 else segs[-1][1]  # chunk 1 opens on the drop: Amanda grips and goes at 1x
    # chunk end edge
    if last:
        end = pts[-1][0] + 1.1
    elif CHUNKS[ci + 1][1] == 26:
        end = beat(25) + 0.70  # Roberto's 25 on the clap, cut on the next stomp
    else:
        end = beat(b) + AND
    def make(pts=pts, start=start, end=end, tops=tops, a=a, b=b, ci=ci, last=last, who=who):
        def f(t):
            if t <= pts[0][0]:
                if ci == 0:
                    return tops[a] - (pts[0][0] - t)
                prev = tops.get(a - 1, tops[a] - (tops[a + 1] - tops[a]))
                beat_gap = P / 2 if not (who == "ahmed" and a == 26) else P
                u = 1 - (pts[0][0] - t) / beat_gap
                return prev + (tops[a] - prev) * ease(u)
            if t >= pts[-1][0]:
                if last or b == MAX[who]:  # a lifter's final rep plays out at 1x (April's hold, Roberto's 25)
                    return pts[-1][1] + (t - pts[-1][0])
                nxt = tops.get(b + 1, tops[b] + (tops[b] - tops[b - 1]))
                gap = P if b == 25 else P / 2
                u = (t - pts[-1][0]) / gap
                return tops[b] + (nxt - tops[b]) * ease(u)
            for (t0, s0), (t1, s1) in zip(pts, pts[1:]):
                if t0 <= t <= t1:
                    return s0 + (s1 - s0) * ease((t - t0) / (t1 - t0))
        return f
    segs.append((start, end, who, make()))

TAIL_END = segs[-1][1]
TOTAL = round(TAIL_END + 4.4, 2)  # CTA over the held frame, then the DB end card
N = round(TOTAL * FPS)

# Which source frame each output frame needs
need = []
for i in range(N):
    t = i / FPS
    for (t0, t1, who, f) in segs:
        if t0 <= t < t1:
            need.append((who, max(0, round(f(t) * FPS))))
            break
    else:
        need.append(need[-1])  # hold last frame under the end card

# Decode each source once per contiguous run, keep only needed frames, pipe to encoder
enc = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16",
                        "-preset", "slow", "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
                        "-color_trc", "bt709", "-colorspace", "bt709", "assets/video/relay.mp4"],
                       stdin=subprocess.PIPE)
FS = W * H * 3
i = 0
while i < N:
    who = need[i][0]
    j = i
    while j < N and need[j][0] == who:
        j += 1
    idx = [need[k][1] for k in range(i, j)]
    lo, hi = min(idx), max(idx)
    dec = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{lo / FPS:.4f}", "-i",
                            f"build/proxy/{who}.mp4", "-frames:v", str(hi - lo + 1), "-f", "rawvideo",
                            "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    want, frames, last = set(idx), {}, None
    for n in range(lo, hi + 1):
        buf = dec.stdout.read(FS)
        if len(buf) < FS:
            break
        last = buf
        if n in want:
            frames[n] = buf
    dec.wait()
    for n in idx:
        enc.stdin.write(frames.get(n, last))
    print(f"{who:8s} out {i / FPS:6.2f}-{j / FPS:6.2f}  src {lo / FPS:6.2f}-{hi / FPS:6.2f}  ({hi - lo + 1}f -> {j - i}f)")
    i = j
enc.stdin.close(); enc.wait()

timing = {
    "total": TOTAL, "song0": SONG0, "drop": 3.0,
    "reps": [{"n": k, "t": round(beat(k), 3)} for k in range(1, 28)],
    "chunks": [{"who": NAMES[w], "max": MAX[w], "from": a, "to": b, "start": round(s[0], 3), "end": round(s[1], 3)}
               for (w, a, b), s in zip(CHUNKS, segs[1:])],
    "tailEnd": round(TAIL_END, 3),
}
json.dump(timing, open("timing.json", "w"), indent=1)
print("total", TOTAL, "s; rep 27 at", timing["reps"][-1]["t"])
