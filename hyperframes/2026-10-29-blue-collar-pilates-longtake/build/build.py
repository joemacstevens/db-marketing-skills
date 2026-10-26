#!/usr/bin/env python3
"""Blue Collar Pilates, LONG-TAKE alternate (slug 2026-10-29-blue-collar-pilates-longtake). Joey 10/25: "longer with
less cuts, a different style", built on the coaching moments. The hype cut is 2026-10-29-core-work v4 (untouched).

Four long takes, the coach's raw voice carrying it (feedback_reel-coach-moment-audio): source audio at 1.5 gain, no
isolation, the Blue Collar Heavy instrumental under it ducked to 20% under speech and back to 100% between lines.
Lower-third captions of the coach's exact words (whisper medium.en for WHAT, Parakeet for WHEN; words the engines
disagree on are left out of the captions, see UNVERIFIED). Same v3 look: Topaz 1080p windows, light unsharp,
Sample cinematic v3 grade (build/grade.sh). Ends on the Blue Collar double tag, same as v4.

  python3 build/build.py            # coach track + bed + footage + index.html
  bash build/grade.sh && npm run check && npm run render -- -o renders/longtake-v1-raw.mp4
  bash build/master.sh renders/longtake-v1-raw.mp4 renders/longtake-v1.mp4    # -14 LUFS, -1 dBFS

Bed (Blue Collar Heavy instrumental stem, 148.3 BPM, grid from the 26.94 slam): slams in on the title at reel 1.5,
then bar-aligned splices around the stem's holes: 26.94-33.41 | 39.89-56.07 (46.80-47.15 patched a bar earlier)
| 59.31-73.06 | 78.73-. Opener is the coach alone ("Nice, good.").
"""
import html
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WT = os.path.dirname(os.path.dirname(ROOT))
DROP = os.path.join(WT, "don-drops/2026-10-25")
RAW = os.path.join(DROP, "raw")
BEAT = 60 / 148.3
BAR = 4 * BEAT
SLAM = 26.94
SONG_FULL = "assets/audio/song-bc-heavy.mp3"
SONG_STEM = "assets/audio/song-bc-heavy-instrumental.mp3"
BED = "assets/audio/song-bc-bed-longtake.wav"
COACH = "assets/audio/coach-lines.wav"
OPEN_S = 1.5
TITLE_S = 4 * BEAT
COACH_GAIN = 1.5
DUCK, DUCK_RAMP, GAP_MIN = 0.2, 0.2, 1.0
HOOK_SRC, HOOK_LEAD, HOOK_VOL = 7.60, 0.08, 1.0
BC_TAG, DB_TAG = 3.2, 2.3
HANDLE = 0.1
SHARP = 0.6

# Topaz windows (clip, start, end) = don-drops/2026-10-25/upscaled/lt-<key>.mp4
WINDOWS = {
    "2441a": ("IMG_2441", 0.0, 1.65), "2441b": ("IMG_2441", 2.95, 5.85), "2442a": ("IMG_2442", 7.83, 27.10),
    "2505a": ("IMG_2505", 17.8, 28.9), "2506a": ("IMG_2506", 3.35, 10.45),
}
# Takes: (clip, audio in, audio out, [(picture window, picture src in, picture src out)], label, note).
# Picture runs back to back over the take's audio; take 0's picture hides under the title card 1.5-3.118.
TAKES = [
    ("IMG_2441", 0.0, 5.70, [("2441a", 0.0, OPEN_S), (None, OPEN_S, OPEN_S + TITLE_S), ("2441b", OPEN_S + TITLE_S, 5.70)],
     "plank", "Fri: 'Nice, good' over the row setting up, then the row of ball planks"),
    ("IMG_2442", 7.98, 25.60, [("2442a", 7.98, 23.90), ("2442a", 25.25, 26.95)],
     "bridge", "Fri: the single-leg bridge set, coach counting it down. Picture jumps 23.9 -> 25.25 past a whip pan"),
    ("IMG_2505", 17.95, 28.75, [("2505a", 17.95, 28.75)],
     "plate", "Sun: plate push, 'hard push... that's what I'm talking about'"),
    ("IMG_2506", 3.50, 10.30, [("2506a", 3.50, 10.30)],
     None, "Sun: two women on the plates, 'good job ladies, wow' + clapping"),
]
# Captions: (clip, raw start, text). Shown until the next caption's start (or end + 0.6), within the take.
# Starts are Parakeet word starts; the 2442 countdown starts were checked against the speech-band energy onsets.
CAPS = [
    ("IMG_2442", 8.00, "Bring your right leg up."),
    ("IMG_2442", 9.84, "Hold it there."),
    ("IMG_2442", 10.96, "Hold that right leg up."),
    ("IMG_2442", 12.48, "Balance, balance."),
    ("IMG_2442", 15.36, "Hold it."),
    ("IMG_2442", 15.85, "Five."),
    ("IMG_2442", 17.55, "Four."),
    ("IMG_2442", 19.55, "Three."),
    ("IMG_2442", 21.58, "Two."),
    ("IMG_2442", 24.02, "One. Tiny pulse."),
    ("IMG_2505", 18.24, "Give it a hard push, hard push, hard push."),
    ("IMG_2505", 21.60, "Push up. Good."),
    ("IMG_2505", 23.20, "Hard push, hard push. Good."),
    ("IMG_2505", 26.08, "That's what I'm talking about."),
    ("IMG_2505", 27.92, "Good."),
    ("IMG_2506", 5.36, "Good, good job, ladies."),
    ("IMG_2506", 7.36, "Wow, wow."),
]
CAP_END = {"IMG_2442": 25.40, "IMG_2505": 28.72, "IMG_2506": 8.88}
UNVERIFIED = [
    "IMG_2441 3.4-5.6 'Everyone, hike up' (medium full clip) / 'type up' (Parakeet) / 'wake up' (medium window): no caption",
    "IMG_2442 14.2-15.4 'Right leg up/out, good' (engines split): left out, caption resumes at 'Hold it.'",
    "IMG_2442 24.5 tiny pulse (Parakeet, small.en, medium on the mix) vs tiny pulses (medium full clip): captioned pulse",
    "IMG_2505 21.0 'Crawl' (medium) / 'Call' (Parakeet) / 'strong'/'Go' (windows): caption starts at 'Push up.'",
]
CARDS = {
    "plank": ("BALL PLANK", "works your", "CORE · SHOULDERS · GLUTES"),
    "bridge": ("SINGLE-LEG BRIDGE", "works your", "GLUTES · HAMSTRINGS · CORE"),
    "plate": ("PLATE PUSH", "works your", "CORE · SHOULDERS · ARMS"),
}


def esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def take_starts():
    t, out = 0.0, []
    for clip, a, b, *_ in TAKES:
        out.append(t)
        t += b - a
    return out, t


STARTS, END = take_starts()
END = round(END, 3)
END2 = round(END + BC_TAG, 3)
TOTAL = round(END2 + DB_TAG, 3)


def reel_of(clip, raw_t):
    for (c, a, b, *_), s in zip(TAKES, STARTS):
        if c == clip and a - 0.01 <= raw_t <= b + 0.01:
            return s + raw_t - a
    raise ValueError((clip, raw_t))


def speech_spans():
    """Parakeet word spans in reel time, merged when the gap is under GAP_MIN"""
    pk = "/private/tmp/claude-501/-Users-joestevens-Projects-Different-Breed--claude-worktrees-photo-content-color-grading-5a56af/c0c6191e-59df-4ae3-b987-2c0bc651193d/scratchpad/core/lt"
    spans = []
    for (clip, a, b, *_), s in zip(TAKES, STARTS):
        words = json.load(open(os.path.join(pk, f"{clip}.parakeet.json")))["words"]
        for w in words:
            ws, we = max(w["start"], a), min(w["end"], b)
            if we > ws:
                spans.append([s + ws - a, s + we - a])
    spans.sort()
    merged = []
    for x in spans:
        if merged and x[0] - merged[-1][1] < GAP_MIN:
            merged[-1][1] = max(merged[-1][1], x[1])
        else:
            merged.append(x)
    return merged


def make_coach_track():
    chains, labels = [], []
    for k, ((clip, a, b, *_), s) in enumerate(zip(TAKES, STARTS)):
        d = b - a
        chains.append(f"[{k}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                      f"volume={COACH_GAIN},afade=t=in:d=0.03,afade=t=out:st={d - 0.04:.3f}:d=0.04[c{k}]")
        labels.append(f"[c{k}]")
    fc = ";".join(chains) + ";" + "".join(labels) + f"concat=n={len(TAKES)}:v=0:a=1[out]"
    args = []
    for clip, *_ in TAKES:
        args += ["-i", os.path.join(RAW, f"{clip}.mov")]
    ff(args + ["-filter_complex", fc, "-map", "[out]", "-c:a", "pcm_s16le", os.path.join(ROOT, COACH)])


def make_bed():
    """stem from the slam (title at reel 1.5) to the end of the takes, bar-aligned around the holes"""
    need = END - OPEN_S + 0.6
    h0, h1 = 46.80, 47.15
    k = lambda n: SLAM + n * BEAT
    plan = [(SLAM, k(16)), (k(32), h0), (h0 - BAR, h1 - BAR), (h1, k(72)), (k(80), k(114)), (k(128), k(128) + 30)]
    segs, got = [], 0.0
    for a, b in plan:
        take = min(b - a, need - got)
        if take <= 0:
            break
        segs.append((a, a + take))
        got += take
    chains = []
    for i, (a, b) in enumerate(segs):
        chains.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
                      f"afade=t=in:d=0.008,afade=t=out:st={b - a - 0.008:.3f}:d=0.008[s{i}]")
    fc = ";".join(chains) + ";" + "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[out]"
    ff(["-i", os.path.join(ROOT, SONG_STEM), "-filter_complex", fc, "-map", "[out]", "-c:a", "pcm_s16le",
        os.path.join(ROOT, BED)])
    seams = []
    t = OPEN_S
    for a, b in segs[:-1]:
        t += b - a
        seams.append(round(t, 2))
    print("bed segments:", [(round(a, 3), round(b, 3)) for a, b in segs], "seams at reel", seams)


def prep(win, a, b):
    clip, ws, we = WINDOWS[win]
    src = os.path.join(DROP, "upscaled", f"lt-{win}.mp4")
    t, length = a - ws, b - a
    pre = min(HANDLE, t)
    post = min(HANDLE, (we - ws) - (t + length))
    assert post >= -0.02, (win, a, b)
    out = os.path.join(ROOT, f"assets/footage/lt_sh{SHARP:g}_{win}_{a:.2f}_{b:.2f}.mp4")
    if not os.path.exists(out):
        ff(["-ss", f"{t - pre:.3f}", "-t", f"{length + pre + max(post, 0):.3f}", "-i", src, "-an",
            "-vf", f"scale=1080:1920:flags=lanczos,setsar=1,unsharp=5:5:{SHARP:g}:5:5:0",
            "-r", "30", "-g", "15", "-keyint_min", "15", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", out])
        print("prepped", os.path.basename(out))
    return pre, out


def cn(id_, text, size, extra=""):
    return f'<span class="cn" id="{id_}" style="font-size:{size}px;{extra}">{html.escape(text)}</span>'


def pw(id_, text, wdth, track, lh, red=False, size=None, mx=970, extra=""):
    return (f'<div class="pw{" red" if red else ""} fit" id="{id_}" data-size="{size}" data-max="{mx}" '
            f'style="font-stretch:{wdth}%;letter-spacing:{track}em;line-height:{lh};{extra}" '
            f'data-layout-allow-overflow="">{html.escape(text)}</div>')


def type_frames():
    F, A = {}, []
    add = lambda sel, kind, t, **x: A.append({"sel": sel, "kind": kind, "t": round(t, 3), **x})

    t0, t1 = OPEN_S, OPEN_S + TITLE_S
    F["title"] = (t0, t1, f'''<div class="abs" style="inset:0;background:var(--endbg)"></div>
        <div class="tagrow" id="ti-tag" style="top:330px;left:60px"><span class="rl" style="width:20px;height:20px"></span><span class="tag">Different Breed</span><span class="rl" style="width:90px;height:2.5px"></span><span class="tag">Elite Fitness</span></div>
        <div class="col" style="left:56px;top:690px">
          {pw("ti-p1", "BLUE COLLAR", 100, -0.02, 0.86, size=300, mx=960)}
          {pw("ti-p2", "PILATES.", 62, -0.03, 0.80, red=True, size=430, mx=965, extra="margin-top:14px")}
          {cn("ti-c", "inside fight camp", 104, "margin-top:44px;margin-left:8px")}
        </div>''')
    add("#ti-tag", "fade", t0)
    add("#ti-p1", "punch", t0 + 0.03, origin="0% 50%")
    add("#ti-p2", "punch", t0 + BEAT, origin="0% 50%")
    add("#ti-c", "conn", t0 + 1.5 * BEAT)

    # move label: one per take, top-left (captions own the lower third), first ~3.5 s of the take's picture
    for n, ((clip, a, b, pics, label, _), s) in enumerate(zip(TAKES, STARTS)):
        if not label:
            continue
        name, conn, works = CARDS[label]
        la = s + (OPEN_S + TITLE_S if n == 0 else 0.0)
        lb = min(s + (b - a), la + 3.6)
        k = f"m{n}"
        F[k] = (la, lb, f'''<div class="abs" style="left:0;right:0;top:0;height:760px;background:linear-gradient(to bottom, rgba(11,11,12,0.8), rgba(11,11,12,0))"></div>
        <div class="col" style="left:60px;top:200px">
          <div class="tagrow" id="{k}-tag" style="position:relative;gap:20px"><span class="rl red" style="width:70px;height:6px"></span><span class="tag">The move</span></div>
          {pw(k + "-p", name, 100 if len(name) < 13 else 72, -0.015, 0.9, size=150, mx=900, extra="margin-top:22px")}
          {cn(k + "-c", conn, 70, "margin-top:18px;margin-left:4px")}
          <div class="tag" id="{k}-w" style="margin-top:14px;margin-left:4px;font-size:32px;letter-spacing:0.16em;color:#fff">{html.escape(works)}</div>
        </div>''')
        add(f"#{k}-tag", "fade", la + 0.02)
        add(f"#{k}-p", "punch", la + 0.05, origin="0% 50%")
        add(f"#{k}-c", "conn", la + 0.3)
        add(f"#{k}-w", "fade", la + 0.55)

    # captions: lower third, white Archivo, dark scrim, no red (the label owns the frame's red)
    caps = []
    for i, (clip, rs, text) in enumerate(CAPS):
        nxt = CAPS[i + 1] if i + 1 < len(CAPS) and CAPS[i + 1][0] == clip else None
        re_ = nxt[1] if nxt else CAP_END[clip] + 0.6
        ta, tb = next((a, b) for (c, a, b, *_) in TAKES if c == clip)
        ca, cb = reel_of(clip, rs), reel_of(clip, min(re_, CAP_END[clip] + 0.6, tb - 0.05))
        caps.append((f"c{i}", ca, cb, text))
        add(f"#c{i}-t", "fadeonly", ca)
    return F, A, caps


def end_tags(A):
    add = lambda sel, kind, t, **x: A.append({"sel": sel, "kind": kind, "t": round(t, 3), **x})
    endA = f'''<div class="endcard" id="ea" style="align-items:center;justify-content:center">
          <img id="ea-logo" src="assets/brand/blue-collar-logo.jpg" alt="Blue Collar Boxing" style="width:600px;height:600px;object-fit:cover;clip-path:circle(49.5% at 50% 50%)">
          {pw("ea-p1", "FIGHT DAY", 100, -0.01, 0.9, size=190, mx=880, extra="margin-top:70px;text-align:center")}
          {pw("ea-p2", "SUNDAY · NOV 22", 100, 0.12, 1.0, red=True, size=70, mx=760, extra="margin-top:26px;text-align:center")}
        </div>'''
    add("#ea-logo", "pop", END + 0.05)
    add("#ea-p1", "punch", END + 0.56)
    add("#ea-p2", "punch", END + 1.68)
    endB = f'''<div class="endcard" id="eb">
          <div class="row" style="justify-content:space-between"><span class="tag" style="color:rgba(255,255,255,0.8)">Different Breed</span><span class="tag" style="color:rgba(255,255,255,0.8)">Teaneck, NJ</span></div>
          <div class="col rel">
            <img id="eb-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness" style="width:330px;height:330px;object-fit:contain;margin-bottom:90px;margin-left:-20px">
            {cn("eb-c", "What we do is", 135, "line-height:0.95")}
            {pw("eb-p1", "ABSOLUTELY", 62, -0.025, 0.82, size=210, extra="margin-top:25px")}
            {pw("eb-p2", "DIFFERENT.", 125, -0.01, 0.9, red=True, size=120, extra="margin-top:10px")}
          </div>
          <div class="row" id="eb-h" style="align-items:center;gap:20px"><span class="rl" style="width:70px;height:5px"></span><span class="tag" style="font-size:30px;letter-spacing:0.14em;text-transform:none">@dbelitefitness</span></div>
        </div>'''
    add("#eb-logo", "fade", END2 + 0.02)
    add("#eb-c", "conn", END2 + 0.2)
    add("#eb-p1", "punch", END2 + 0.5, origin="0% 50%")
    add("#eb-p2", "punch", END2 + 0.8, origin="0% 50%")
    add("#eb-h", "fade", END2 + 1.0)
    return endA, endB


def main():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    make_coach_track()
    make_bed()

    shots, slots, log, i = [], [], [], 0
    for (clip, a, b, pics, label, note), s in zip(TAKES, STARTS):
        log.append(f"TAKE {s:6.2f}-{s + b - a:6.2f}  {clip} audio {a:.2f}-{b:.2f}  {note}")
        t = s
        for win, pa, pb in pics:
            d = pb - pa
            if win:
                off, path = prep(win, pa, pb)
                shots.append(
                    f'      <!-- s{i:02d} {clip} @{pa:.2f}-{pb:.2f} -->\n'
                    f'      <div class="shot" id="w{i}"><div class="push" data-layout-allow-overflow="">'
                    f'<video id="v{i}" class="clip" src="{os.path.relpath(path, ROOT)}" '
                    f'data-start="{t:.3f}" data-duration="{d:.3f}" data-media-start="{off:.3f}" '
                    f'data-track-index="{i % 2}" muted playsinline></video></div></div>')
                slots.append({"i": i, "a": round(t, 3), "b": round(t + d, 3)})
                log.append(f"   {t:6.2f}-{t + d:6.2f}  picture {clip} {pa:.2f}-{pb:.2f}")
                i += 1
            else:
                log.append(f"   {t:6.2f}-{t + d:6.2f}  (title card)")
            t += d
        assert abs(t - (s + b - a)) < 0.01

    F, A, caps = type_frames()
    endA, endB = end_tags(A)
    layers = []
    for k, (a, b, body) in F.items():
        layers.append(f'      <div id="t-{k}" class="clip layer" data-start="{a:.3f}" data-duration="{b - a:.3f}" '
                      f'data-track-index="{4 if k == "title" else 5}">{body}</div>')
    for n, (k, a, b, text) in enumerate(caps):
        layers.append(
            f'      <div id="t-{k}" class="clip layer" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="{7 + n % 2}">'
            f'<div class="abs" style="left:0;right:0;bottom:0;height:640px;background:linear-gradient(to top, rgba(11,11,12,0.72), rgba(11,11,12,0))"></div>'
            f'<div class="center" style="bottom:330px;top:auto"><div class="capt" id="{k}-t" data-layout-allow-overflow="">{html.escape(text)}</div></div></div>')
        log.append(f"   cap {a:6.2f}-{b:6.2f}  {text}")
    layers.append(f'      <div id="t-endA" class="clip layer" data-start="{END:.3f}" data-duration="{END2 - END:.3f}" '
                  f'data-track-index="10">{endA}</div>')
    layers.append(f'      <div id="t-endB" class="clip layer" data-start="{END2:.3f}" data-duration="{TOTAL - END2:.3f}" '
                  f'data-track-index="11">{endB}</div>')

    # bed: in at the title slam (reel 1.5), 20% under speech, 100% in gaps >= 1 s, out at END
    spans = speech_spans()
    pts = []
    def lvl(t):
        for a, b in spans:
            if a - 0.15 <= t <= b + 0.3:
                return DUCK
        return 1.0
    t, step = OPEN_S, 0.05
    prev = None
    while t <= END + 1e-6:
        v = lvl(t)
        if v != prev:
            if prev is not None:
                pts.append({"t": round(t - OPEN_S - DUCK_RAMP, 3), "v": prev})
            pts.append({"t": round(t - OPEN_S, 3), "v": v})
            prev = v
        t += step
    bed_d = round(END - OPEN_S + 0.02, 3)
    pts.append({"t": round(END - OPEN_S - 0.02, 3), "v": prev})
    pts.append({"t": bed_d, "v": 0})
    pts = [p for j, p in enumerate(pts) if j == 0 or p["t"] > pts[j - 1]["t"]]
    hook_at = round(END - HOOK_LEAD, 3)
    hook_d = round(TOTAL - hook_at, 3)
    hook_pts = [{"t": 0, "v": 0}, {"t": 0.08, "v": HOOK_VOL}, {"t": round(hook_d - 0.6, 3), "v": HOOK_VOL}, {"t": hook_d, "v": 0}]
    audio = [
        f'      <audio id="a-coach" src="{COACH}" data-start="0" data-duration="{END:.3f}" data-media-start="0" data-track-index="29" data-volume="1"></audio>',
        f'      <audio id="a-bed" src="{BED}" data-start="{OPEN_S}" data-duration="{bed_d:.3f}" data-media-start="0" '
        f'data-track-index="30" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": pts}]})}"></audio>',
        f'      <audio id="a-hook" src="{SONG_FULL}" data-start="{hook_at:.3f}" data-duration="{hook_d:.3f}" data-media-start="{HOOK_SRC}" '
        f'data-track-index="31" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": hook_pts}]})}"></audio>',
    ]

    rep = {"%TOTAL%": f"{TOTAL}", "%SHOTS%": "\n".join(shots), "%TYPE%": "\n".join(layers),
           "%AUDIO%": "\n".join(audio), "%SLOTS%": json.dumps(slots), "%ANIMS%": json.dumps(A)}
    page = open(os.path.join(HERE, "template.html")).read()
    for k, v in rep.items():
        page = page.replace(k, v)
    page = page.replace("</style>", "      .capt { font-family: \"DB Archivo\"; font-weight: 800; font-stretch: 92%; font-size: 74px; line-height: 1.12; "
                        "color: var(--white); text-align: center; max-width: 940px; white-space: normal; }\n    </style>", 1)
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    open(os.path.join(ROOT, "build/shotlist.txt"), "w").write("\n".join(log) + "\n")
    print("\n".join(log))
    print("speech spans (reel):", [(round(a, 2), round(b, 2)) for a, b in spans])
    print(f"takes end {END}s, BC tag {END2}s, total {TOTAL}s; Topaz {sum(e - s for _, s, e in WINDOWS.values()):.2f}s")


if __name__ == "__main__":
    main()
