#!/usr/bin/env python3
"""Friday 10/23 6 AM personal-training session with Coach Don (one member, six moves). Posts 10/28.

Song: Victoria Monét "Reach Out". Grid measured here on the kick band of the ElevenLabs instrumental stem:
107.00 BPM, beat 0.560748 s, beat k at k*P - 0.0007, downbeats at k = 3 (mod 4). The chorus slams back in at beat 79
(44.298 s) after a 3-beat instrumental dropout (76-78), so: opener on beats 73-75, title on the dropout, content from
the "Reach out" downbeat for 32 beats (8 bars of chorus, beats 79-110), end card on the 111 breakdown, bed fades and
the "We are Different Breed" hook (48.8) lands on the house lockup. Vocal stem (whisper medium) is clean all song.

Footage: Don's iPhone, all rotation -90 portrait. 4K HLG 120 fps (SkiErg, curl, press, crunch) get scale-then-hable
tonemap. IMG_2439 / IMG_2440 are 720p30 HLG: Topaz-upscaled windows (don-drops/2026-10-25/upscaled/pt1023-*, already
SDR bt709, NOT re-tonemapped). One speed ramp: SkiErg drive-down (120 fps frames remapped along one speed curve).
Grade: Sample cinematic house grade applied afterwards with `hyperframes media-treatment` (see README in build/).

  python3 build/build.py            # preps footage (once) + writes index.html (ungraded)
  then the media-treatment line in build/run.sh, then check + render
"""
import glob
import html
import json
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DROP = os.path.abspath(os.path.join(ROOT, "../../don-drops/2026-10-25"))
RAW = os.path.join(DROP, "raw")
UP = os.path.join(DROP, "upscaled")
BEAT = 60 / 107.0
SONG = "assets/audio/song-reach-out.mp3"
HOOK = "assets/audio/different-breed-song.mp3"
SONG_IN = round(73 * BEAT - 0.0007, 3)      # 40.934; content starts on beat 79 = 44.298
OPEN_B, TITLE_B, CONTENT_B = 3, 3, 32
HANDLE = 0.3
SHARP = "unsharp=5:5:0.6:5:5:0"   # v3: light luma sharpen after tonemap/scale (Joey: v2 looked soft)
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
      "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
ENC = ["-r", "30", "-g", "15", "-keyint_min", "15", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
       "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-movflags", "+faststart"]

# key -> (raw file, upscaled windows [(name, window start)] or None)
CLIP = {
    "ski": ("4B6B23E9-4625-457C-8789-F1B4D1AA0ECF.mov", None),
    "curl": ("1E0CFFEF-7C40-4B6A-8BC3-19F866164100.mov", None),
    "press": ("BCAEA6F2-6613-4B42-AEF0-A80B27BB4668.mov", None),
    "crunch": ("8224C6A0-1BEE-4729-8D0C-F7C366D999C9.mov", None),
    "fly": ("IMG_2439.mov", [("pt1023-2439", 8.9, 4.88)]),
    "slam": ("IMG_2440.mov", [("pt1023-2440a", 0.6, 3.24), ("pt1023-2440b", 7.26, 7.47)]),
}
# SkiErg ramp: speed knots on SOURCE time (s, speed). Real speed through the reach, down to 0.28x through the
# drive (ponytail whip), back to 1x as she rises.
RAMP = [(1.45, 1.0), (2.02, 1.0), (2.12, 0.28), (2.48, 0.28), (2.60, 1.0), (4.0, 1.0)]

# (clip, source in, beats, move index or None, note). Back to back from 0; slot 1 is the title card.
SHOTS = [
    ("slam", 12.55, OPEN_B, None, "OPENER: med ball overhead, slam lands on the dropout (~14.15)"),
    (None, 0, TITLE_B, None, "TITLE: 6 AM. 1-ON-1."),
    ("ski", "ramp", 5, 0, "SkiErg: reach on the drop, 0.28x through the drive-down"),
    ("curl", 0.40, 3, 1, "cable curl, one full rep"),
    ("press", 8.60, 6, 2, "cable overhead press: lockout, lower, press, lockout 11.5"),
    ("fly", 9.40, 3, 3, "cable chest fly, side"),
    ("fly", 11.60, 3, 3, "cable chest fly, front, face"),
    ("crunch", 1.00, 4, 4, "tabletop crunch on the red bench"),
    ("slam", 1.10, 4, 5, "med ball slam, side angle, ball lands on content beat 27 (2.78)"),
    ("slam", 7.76, 4, 5, "med ball slam, front angle, ball lands ~9.45 one beat before the end card"),
]
# THE MOVE cards (exercise + works line). pos = where the card sits on that shot.
MOVES = [
    ("SKIERG", "works back, shoulders and legs", "top"),
    ("CABLE CURL", "works biceps", "bottom"),
    ("CABLE OVERHEAD PRESS", "works shoulders, triceps and core", "bottom"),
    ("CABLE CHEST FLY", "works chest", "top"),
    ("TABLETOP CRUNCH", "works core", "top"),
    ("MED BALL SLAM", "works core, shoulders and legs", "top"),
]
MAXW = {3: 700}   # chest fly card narrower, keeps clear of her head
CONTENT_START = round((OPEN_B + TITLE_B) * BEAT, 3)
END = round((OPEN_B + TITLE_B + CONTENT_B) * BEAT, 3)
END_A = round(END + 4 * BEAT, 3)          # card A 4 beats; lockup gets >2 s after its last word
HOOK_AT = round(END + 2 * BEAT, 3)
TOTAL = round(HOOK_AT + 4.4, 3)


def esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def ramp_map(n_out):
    """output frame i (30 fps) -> source time, integrating dt = ds / speed along RAMP."""
    def speed(s):
        for (a, va), (b, vb) in zip(RAMP, RAMP[1:]):
            if a <= s <= b:
                return va + (vb - va) * (s - a) / (b - a)
        return RAMP[-1][1]
    out, s, t, ds = [], RAMP[0][0], 0.0, 1 / 2400
    for i in range(n_out):
        target = i / 30
        while t < target:
            t += ds / speed(s)
            s += ds
        out.append(s)
    return out


def prep_ramp(length):
    out = os.path.join(ROOT, "assets/footage/ski_ramp.mp4")
    if os.path.exists(out):
        return 0.0, out
    fr = os.path.join(ROOT, "build/_ramp_frames")
    shutil.rmtree(fr, ignore_errors=True)
    os.makedirs(fr)
    a = RAMP[0][0]
    ff(["-ss", f"{a:.3f}", "-t", "2.6", "-i", os.path.join(RAW, CLIP["ski"][0]), "-an",
        "-vf", f"fps=120,scale=1080:1920:flags=lanczos,{TM},{SHARP}", "-q:v", "2", os.path.join(fr, "f%05d.jpg")])
    frames = sorted(glob.glob(os.path.join(fr, "f*.jpg")))
    n_out = int(round((length + HANDLE) * 30))
    lst = os.path.join(fr, "list.txt")
    with open(lst, "w") as f:
        for s in ramp_map(n_out):
            k = min(len(frames) - 1, int(round((s - a) * 120)))
            f.write(f"file '{frames[k]}'\nduration {1 / 30:.6f}\n")
    ff(["-f", "concat", "-safe", "0", "-i", lst, "-vf", "setsar=1", "-fps_mode", "cfr", *ENC, out])
    shutil.rmtree(fr, ignore_errors=True)
    print("prepped ramp", out)
    return 0.0, out


def prep(clip, ms, length):
    if ms == "ramp":
        return prep_ramp(length)
    out = os.path.join(ROOT, f"assets/footage/{clip}_{ms:.2f}_{round(length / BEAT)}.mp4")
    raw, ups = CLIP[clip]
    pre = min(HANDLE, ms)
    src, ss, vf = os.path.join(RAW, raw), ms - pre, f"scale=1080:1920:flags=lanczos,{TM},{SHARP},setsar=1"
    for name, w0, wd in ups or []:
        up = os.path.join(UP, name + ".mp4")
        if w0 <= ms - pre and ms + length + HANDLE <= w0 + wd and os.path.exists(up):
            src, ss, vf = up, ms - pre - w0, f"scale=1080:1920:flags=lanczos,{SHARP},setsar=1"   # already SDR bt709
            out = out.replace(".mp4", "_topaz.mp4")
            break
    else:
        if ups:
            print(f"WARNING {clip}@{ms}: no Topaz window, using 720p raw")
    if not os.path.exists(out):
        ff(["-ss", f"{ss:.3f}", "-t", f"{length + pre + HANDLE:.3f}", "-i", src, "-an", "-vf", vf, *ENC, out])
        print("prepped", out)
    return pre, out


def cn(id_, text, size, extra=""):
    return f'<span class="cn" id="{id_}" style="font-size:{size}px;{extra}">{html.escape(text)}</span>'


def pw(id_, text, wdth, track, lh, red=False, size=None, mx=970, extra=""):
    return (f'<div class="pw{" red" if red else ""} fit" id="{id_}" data-size="{size}" data-max="{mx}" '
            f'style="font-stretch:{wdth}%;letter-spacing:{track}em;line-height:{lh};{extra}" '
            f'data-layout-allow-overflow="">{html.escape(text)}</div>')


def type_frames(move_spans):
    F, A = {}, []
    add = lambda sel, kind, t, **x: A.append({"sel": sel, "kind": kind, "t": round(t, 3), **x})

    t0 = OPEN_B * BEAT
    F["title"] = (t0, CONTENT_START, f'''<div class="abs" style="inset:0;background:var(--endbg)"></div>
        <div class="tagrow" id="ti-tag" style="top:330px;left:60px"><span class="sq"></span><span class="tag">Friday</span><span class="rl" style="width:90px;height:2.5px"></span><span class="tag">Personal Training</span></div>
        <div class="col" style="left:56px;top:690px">
          {pw("ti-p1", "6 AM.", 125, -0.02, 0.86, size=330, mx=960)}
          {pw("ti-p2", "1-ON-1.", 62, -0.03, 0.80, red=True, size=430, mx=965, extra="margin-top:14px")}
          {cn("ti-c", "with Coach Don", 120, "margin-top:40px;margin-left:8px")}
        </div>''')
    add("#ti-tag", "fade", t0)
    add("#ti-p1", "punch", t0 + 0.03, origin="0% 50%")
    add("#ti-p2", "punch", t0 + BEAT, origin="0% 50%")
    add("#ti-c", "conn", t0 + 1.4 * BEAT)

    # THE MOVE cards: number tag (red square = the one red), exercise punch, works connector. Scrim on that edge.
    for m, (a, b) in move_spans.items():
        name, works, pos = MOVES[m]
        k = f"m{m}"
        edge = "top:0" if pos == "top" else "bottom:0"
        grad = "to bottom" if pos == "top" else "to top"
        place = "top:250px" if pos == "top" else "bottom:330px"
        F[k] = (a, b, f'''<div class="abs" style="left:0;right:0;{edge};height:760px;background:linear-gradient({grad}, rgba(11,11,12,0.62), rgba(11,11,12,0))"></div>
        <div class="col" style="left:60px;{place}">
          <div class="tagrow" id="{k}-tag" style="position:relative;gap:18px"><span class="sq"></span><span class="tag">{m + 1:02d} / {len(MOVES):02d}</span></div>
          {pw(k + "-p", name, 100 if len(name) < 12 else 75, -0.01, 0.9, size=150, mx=MAXW.get(m, 900), extra="margin-top:18px")}
          {cn(k + "-c", works, 70, "margin-top:14px;margin-left:4px")}
        </div>''')
        add(f"#{k}-tag", "fade", a + 0.02)
        add(f"#{k}-p", "punch", a + 0.04, origin="0% 50%")
        add(f"#{k}-c", "conn", a + 0.35)

    endA = f'''<div class="endcard" id="ea">
          <div class="row" style="justify-content:space-between"><span class="tag" style="color:rgba(255,255,255,0.8)">Different Breed</span><span class="tag" style="color:rgba(255,255,255,0.8)">Elite Fitness</span></div>
          <div class="col rel">
            {pw("ea-p1", "PERSONAL", 125, -0.02, 0.86, size=220, mx=940)}
            {pw("ea-p2", "TRAINING.", 62, -0.03, 0.80, red=True, size=400, mx=940, extra="margin-top:10px")}
            {cn("ea-c", "one-on-one with Coach Don", 96, "margin-top:44px;margin-left:8px")}
          </div>
          <div class="row" style="align-items:center;gap:20px"><span class="rl" style="width:20px;height:20px"></span><span class="tag" style="font-size:30px;letter-spacing:0.14em;text-transform:none">@dbelitefitness</span></div>
        </div>'''
    add("#ea-p1", "punch", END + 0.02, origin="0% 50%")
    add("#ea-p2", "punch", END + 0.75 * BEAT, origin="0% 50%")
    add("#ea-c", "conn", END + 1.4 * BEAT)

    endB = f'''<div class="endcard" id="eb">
          <div class="row" style="justify-content:space-between"><span class="tag" style="color:rgba(255,255,255,0.8)">Personal Training</span><span class="tag" style="color:rgba(255,255,255,0.8)">Coach Don</span></div>
          <div class="col rel">
            <img id="eb-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness" style="width:330px;height:330px;object-fit:contain;margin-bottom:90px;margin-left:-20px">
            {cn("eb-c", "What we do is", 135, "line-height:0.95")}
            {pw("eb-p1", "ABSOLUTELY", 62, -0.025, 0.82, size=210, extra="margin-top:25px")}
            {pw("eb-p2", "DIFFERENT.", 125, -0.01, 0.9, red=True, size=120, extra="margin-top:10px")}
          </div>
          <div class="row" id="eb-h" style="align-items:center;gap:20px"><span class="rl red" style="width:70px;height:5px"></span><span class="tag" style="font-size:30px;letter-spacing:0.14em;text-transform:none">@dbelitefitness</span></div>
        </div>'''
    add("#eb-logo", "fade", END_A + 0.02)
    add("#eb-c", "conn", END_A + 0.2)
    add("#eb-p1", "punch", END_A + 1 * BEAT, origin="0% 50%")
    add("#eb-p2", "punch", END_A + 2 * BEAT, origin="0% 50%")
    add("#eb-h", "fade", END_A + 2 * BEAT + 0.2)
    return F, A, endA, endB


def main():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    shots_html, slots, t, log, spans = [], [], 0.0, [], {}
    for i, (clip, ms, beats, move, note) in enumerate(SHOTS):
        length = beats * BEAT
        if clip:
            off, path = prep(clip, ms, length)
            shots_html.append(
                f'      <!-- s{i:02d} {clip} @{ms}: {html.escape(note)} -->\n'
                f'      <div class="shot" id="w{i}"><div class="push" data-layout-allow-overflow="">'
                f'<video id="v{i}" class="clip" src="{os.path.relpath(path, ROOT)}" '
                f'data-start="{t:.3f}" data-duration="{length:.3f}" data-media-start="{off:.3f}" '
                f'data-track-index="{i % 2}" muted playsinline></video></div></div>')
            slots.append({"i": i, "a": round(t, 3), "b": round(t + length, 3)})
            src_out = "ramp" if ms == "ramp" else f"{ms:6.2f}-{ms + length:6.2f}"
            log.append(f"{t:6.2f}-{t + length:6.2f}  {CLIP[clip][0]:42} {src_out:14} {os.path.basename(path):24} {note}")
            if move is not None and move not in spans:   # kit 8: type never outlives its shot
                spans[move] = (t, t + length)
        else:
            log.append(f"{t:6.2f}-{t + length:6.2f}  {'(title card)':42}  {note}")
        t += length
    assert abs(t - END) < 0.01, (t, END)

    F, A, endA, endB = type_frames(spans)
    layers = []
    for k, (a, b, body) in F.items():
        layers.append(f'      <div id="t-{k}" class="clip layer" data-start="{a:.3f}" data-duration="{b - a:.3f}" '
                      f'data-track-index="4">{body}</div>')
    layers.append(f'      <div id="t-endA" class="clip layer" data-start="{END:.3f}" data-duration="{END_A - END:.3f}" '
                  f'data-track-index="5">{endA}</div>')
    layers.append(f'      <div id="t-endB" class="clip layer" data-start="{END_A:.3f}" data-duration="{TOTAL - END_A:.3f}" '
                  f'data-track-index="6">{endB}</div>')

    bed_d = round(HOOK_AT + 0.25, 3)
    bed_pts = [{"t": 0, "v": 0}, {"t": 0.02, "v": 1}, {"t": HOOK_AT, "v": 1}, {"t": bed_d, "v": 0}]
    hook_d = round(TOTAL - HOOK_AT, 3)
    hook_pts = [{"t": 0, "v": 0}, {"t": 0.06, "v": 1}, {"t": round(hook_d - 0.9, 3), "v": 1}, {"t": hook_d, "v": 0}]
    audio = [
        f'      <audio id="a-bed" src="{SONG}" data-start="0" data-duration="{bed_d:.3f}" data-media-start="{SONG_IN:.3f}" '
        f'data-track-index="30" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": bed_pts}]})}"></audio>',
        f'      <audio id="a-hook" src="{HOOK}" data-start="{HOOK_AT:.3f}" data-duration="{hook_d:.3f}" data-media-start="48.8" '
        f'data-track-index="31" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": hook_pts}]})}"></audio>',
    ]

    rep = {"%TOTAL%": f"{TOTAL}", "%SHOTS%": "\n".join(shots_html), "%TYPE%": "\n".join(layers),
           "%AUDIO%": "\n".join(audio), "%SLOTS%": json.dumps(slots), "%ANIMS%": json.dumps(A)}
    page = open(os.path.join(HERE, "template.html")).read()
    for k, v in rep.items():
        page = page.replace(k, v)
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    open(os.path.join(ROOT, "build/shotlist.txt"), "w").write("\n".join(log) + "\n")
    print("\n".join(log))
    print(f"index.html: {len(slots)} shots, song in {SONG_IN}, content {CONTENT_START}s, end {END}s, B {END_A}s, total {TOTAL}s")


if __name__ == "__main__":
    main()
