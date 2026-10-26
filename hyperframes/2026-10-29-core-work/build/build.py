#!/usr/bin/env python3
"""Blue Collar Pilates (v4 of slug 2026-10-29-core-work), Don drop 10/23-10/25. Joey 10/25: this floor-core
footage is the Blue Collar fight camp Pilates session, so it's a Blue Collar reel (camp ends at Fight Day, Sun Nov 22).
v1-v3 (IKEBE 3000 "CORE WORK" cut) are reproducible with build/build_core_v3.py.

Footage: all 720p iMessage copies (HLG, rotation -90), upscaled per window through Topaz (don-drops/2026-10-25/
upscale.sh, 1080x1920 SDR bt709, already tonemapped), light unsharp in prep (v3), Sample cinematic v3 grade applied
after this script by build/grade.sh.

  python3 build/build.py final      # bed + footage + index.html
  bash build/grade.sh && npm run check && npm run render -- -o renders/bc-pilates-v4-raw.mp4
  bash build/master.sh renders/bc-pilates-v4-raw.mp4 renders/bc-pilates-v4.mp4   # -14 LUFS, -1 dBTP

Music: Blue Collar Heavy (Blue Collar 2026 campaign song, Suno, 148.3 BPM, beat 0.40458, bar 1.618), Blue Collar
style per feedback_blue-collar-end-tag. Grid anchored on the 26.94 slam-in (downbeat). Bed (make_bed):
  full song 25.44-26.94 under the opener (vocal-only stop-time hole in the stem: "All you know is get it, boy"),
  instrumental stem 26.94-33.413 (title slams on 26.94, body from beat 4 = 28.558),
  splice bar 5 -> bar 9: the stem's bars 5-8 (33.4-39.9) lose kick + bass (hats only, ~11 dB down), so the body
  jumps to 39.887 (beat 32, next 8-bar phrase) on a cut,
  stem 39.887-46.80, the 46.80-47.15 dropout patched with the same beat one bar earlier (as Black vs Red),
  stem 47.15 -> end of body (beat 68 = 54.451).
End: double tag. Blue Collar tag (circle logo, FIGHT DAY, SUNDAY . NOV 22) on the full-song vocal hook from 7.60
("Fight time, get 'em", Fight at 7.68), then the DB tag picture-only while the song keeps running. No "We are
Different Breed" hook on Blue Collar.
"""
import html
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WT = os.path.dirname(os.path.dirname(ROOT))
DROP = os.path.join(WT, "don-drops/2026-10-25")
PROXY = ("/private/tmp/claude-501/-Users-joestevens-Projects-Different-Breed--claude-worktrees-photo-content-color-"
         "grading-5a56af/c0c6191e-59df-4ae3-b987-2c0bc651193d/scratchpad/core/prox")
MODE = sys.argv[1] if len(sys.argv) > 1 else "final"
BEAT = 60 / 148.3
SLAM = 26.94
SONG_FULL = "assets/audio/song-bc-heavy.mp3"
SONG_STEM = "assets/audio/song-bc-heavy-instrumental.mp3"
BED = "assets/audio/song-bc-bed.wav"
OPEN_S = 1.5
OPEN_B, TITLE_B, CONTENT_B = OPEN_S / BEAT, 4, 48
HOOK_SRC, HOOK_LEAD, HOOK_VOL = 7.60, 0.08, 1.0
STEM_GAIN_DB = 1.5   # stem sat ~1 dB under the hook/opener in v4 raw; whole mix is mastered to -14 LUFS after render
BC_TAG, DB_TAG = 3.2, 2.3
HANDLE = 0.1
SHARP = float(os.environ.get("SHARP", "0.6"))  # v3: light unsharp on the Topaz files (final mode only)

# Topaz windows (clip, start, end), 0.15 s handles each side of what the cut uses.
WINDOWS = {
    "w2442a": ("IMG_2442", 35.75, 37.70), "w2442b": ("IMG_2442", 30.25, 33.57), "w2442c": ("IMG_2442", 21.65, 23.98),
    "w2442d": ("IMG_2442", 19.35, 20.67), "w2442e": ("IMG_2442", 25.85, 26.66), "w2442f": ("IMG_2442", 6.75, 8.07),
    "w2441a": ("IMG_2441", 3.85, 6.18), "w2441b": ("IMG_2441", 13.45, 14.77), "w2441c": ("IMG_2441", 8.85, 12.66),
    "w2505a": ("IMG_2505", 2.35, 4.68), "w2505b": ("IMG_2505", 9.35, 10.67), "w2505c": ("IMG_2505", 12.35, 13.16),
    "w2505d": ("IMG_2505", 22.35, 23.16),
    "w2506a": ("IMG_2506", 6.85, 8.17), "w2506b": ("IMG_2506", 10.35, 11.16),
    "w2514a": ("IMG_2514", 21.45, 24.29),
}
# (window, source in-point s, beats, card key or None, what). Back to back from 0; slot 1 is the title card.
# Body beats: cuts at 0 5 7 12 | 17 19 22 27 29 31 33-39 (burst) 40 42 48. Beat 12 is the bed splice.
SHOTS = [
    ("w2442a", 35.90, OPEN_B, None, "OPENER: full room, two rows of single-leg bridges, coach at the back"),
    (None, 0, TITLE_B, None, "TITLE: BLUE COLLAR PILATES"),
    ("w2441a", 4.00, 5, "plank", "Fri: tracking down the row, forearm planks on the ball"),
    ("w2441b", 13.60, 2, None, "Fri: front-on, high plank with hands on the ball"),
    ("w2441c", 9.00, 5, "rollout", "Fri: row of men rolling the ball out, arms long"),
    ("w2505a", 2.50, 5, "plate", "Sun: woman in white top pushing the bumper plate in a plank"),
    ("w2506a", 7.00, 2, None, "Sun: woman in grey + woman in blue, plate push"),
    ("w2505b", 9.45, 3, None, "Sun: white top, long plank reach behind the plate"),
    ("w2442c", 21.80, 5, "bridge", "Fri: man in black, single-leg bridge, foot on the ball"),
    ("w2442b", 32.40, 2, None, "Fri: man in white tee, single-leg bridge close"),
    ("w2442f", 6.90, 2, None, "Fri: coach in black claps it up over the room"),
    ("w2442d", 19.50, 2, None, "Fri: wide row bridging"),
    # burst, 1 beat each
    ("w2441c", 11.10, 1, None, "Fri: rollout, second rep"),
    ("w2505c", 12.50, 1, None, "Sun: white top drives the plate"),
    ("w2442b", 30.40, 1, None, "Fri: single-leg bridge, leg to the ceiling"),
    ("w2506b", 10.50, 1, None, "Sun: grey top, plate push"),
    ("w2505d", 22.50, 1, None, "Sun: white top + partner, plate push"),
    ("w2442e", 26.00, 1, None, "Fri: bridges, wide"),
    ("w2441c", 12.00, 1, None, "Fri: man in navy, high plank, hand on the ball"),
    ("w2442b", 31.00, 2, None, "Fri: man in black shorts, single-leg bridge, leg up"),
    ("w2514a", 21.60, 6, "reach", "Sun: cooldown, foam-roller reach, gym behind"),
]
CARDS = {
    "plank": ("BALL PLANK", "works your", "CORE · SHOULDERS · GLUTES", "bl"),
    "rollout": ("BALL ROLLOUT", "works your", "ABS · LATS · SHOULDERS", "bl"),
    "plate": ("PLATE PUSH", "works your", "CORE · SHOULDERS · ARMS", "bl"),
    "bridge": ("SINGLE-LEG BRIDGE", "works your", "GLUTES · HAMSTRINGS · CORE", "bl"),
    "reach": ("ROLLER REACH", "opens up your", "LATS · UPPER BACK · SHOULDERS", "tl"),
}
CONTENT_START = round(OPEN_S + TITLE_B * BEAT, 3)
END = round(OPEN_S + (TITLE_B + CONTENT_B) * BEAT, 3)
END2 = round(END + BC_TAG, 3)
TOTAL = round(END2 + DB_TAG, 3)
SPLICE_FROM, SPLICE_TO = SLAM + 16 * BEAT, SLAM + 32 * BEAT     # bar 5 -> bar 9


def esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def source(win, ms):
    clip, ws, we = WINDOWS[win]
    if MODE == "proxy":
        return os.path.join(PROXY, f"{clip}.mp4"), ms, 0.0, 999.0
    return os.path.join(DROP, "upscaled", f"core-{win}.mp4"), ms - ws, 0.0, we - ws


def prep(i, win, ms, length):
    tag = f"{MODE}_sh{SHARP:g}" if MODE == "final" and SHARP > 0 else MODE
    out = os.path.join(ROOT, f"assets/footage/{tag}_{win}_{ms:.2f}_{round(length / BEAT)}.mp4")
    src, t, lo, hi = source(win, ms)
    pre = min(HANDLE, t - lo)
    post = min(HANDLE, hi - (t + length))
    assert post >= -0.02, (win, ms, length, hi, t)
    if not os.path.exists(out):
        ff(["-ss", f"{t - pre:.3f}", "-t", f"{length + pre + max(post, 0):.3f}", "-i", src, "-an",
            "-vf", "scale=1080:1920:flags=lanczos,setsar=1" + (f",unsharp=5:5:{SHARP:g}:5:5:0" if tag != MODE else ""),
            "-r", "30", "-g", "15", "-keyint_min", "15", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", out])
        print("prepped", out)
    return pre, out


def make_bed():
    """full song under the opener, stem from the slam, bars 5-8 skipped, 46.80-47.15 patched one bar earlier"""
    bar, h0, h1 = 4 * BEAT, 46.80, 47.15
    body_end = SPLICE_TO + (END - (OPEN_S + (SPLICE_FROM - SLAM)))
    segs = [(0, SLAM - OPEN_S, SLAM), (1, SLAM, SPLICE_FROM), (1, SPLICE_TO, h0), (1, h0 - bar, h1 - bar),
            (1, h1, body_end + 0.6)]
    chains = []
    for k, (inp, a, b) in enumerate(segs):
        gain = STEM_GAIN_DB if inp == 1 else 0.0
        chains.append(f"[{inp}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,volume={gain}dB,"
                      f"afade=t=in:d=0.008,afade=t=out:st={b - a - 0.008:.3f}:d=0.008[s{k}]")
    fc = ";".join(chains) + ";" + "".join(f"[s{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[out]"
    ff(["-i", os.path.join(ROOT, SONG_FULL), "-i", os.path.join(ROOT, SONG_STEM), "-filter_complex", fc,
        "-map", "[out]", "-c:a", "pcm_s16le", os.path.join(ROOT, BED)])
    reel_splice = OPEN_S + (SPLICE_FROM - SLAM)
    print(f"bed: splice at reel {reel_splice:.3f} (body beat {(reel_splice - CONTENT_START) / BEAT:.2f}), "
          f"body ends at stem {body_end:.3f}")


def cn(id_, text, size, extra=""):
    return f'<span class="cn" id="{id_}" style="font-size:{size}px;{extra}">{html.escape(text)}</span>'


def pw(id_, text, wdth, track, lh, red=False, size=None, mx=970, extra=""):
    return (f'<div class="pw{" red" if red else ""} fit" id="{id_}" data-size="{size}" data-max="{mx}" '
            f'style="font-stretch:{wdth}%;letter-spacing:{track}em;line-height:{lh};{extra}" '
            f'data-layout-allow-overflow="">{html.escape(text)}</div>')


def type_frames():
    F, A = {}, []
    add = lambda sel, kind, t, **x: A.append({"sel": sel, "kind": kind, "t": round(t, 3), **x})

    # title: one red word (WORK.), tag row uses white rules only
    t0 = OPEN_S
    F["title"] = (t0, CONTENT_START, f'''<div class="abs" style="inset:0;background:var(--endbg)"></div>
        <div class="tagrow" id="ti-tag" style="top:330px;left:60px"><span class="rl" style="width:20px;height:20px"></span><span class="tag">Different Breed</span><span class="rl" style="width:90px;height:2.5px"></span><span class="tag">Elite Fitness</span></div>
        <div class="col" style="left:56px;top:690px">
          {pw("ti-p1", "BLUE COLLAR", 100, -0.02, 0.86, size=300, mx=960)}
          {pw("ti-p2", "PILATES.", 62, -0.03, 0.80, red=True, size=430, mx=965, extra="margin-top:14px")}
          {cn("ti-c", "fight camp", 110, "margin-top:44px;margin-left:8px")}
        </div>''')
    add("#ti-tag", "fade", t0)
    add("#ti-p1", "punch", t0 + 0.03, origin="0% 50%")
    add("#ti-p2", "punch", t0 + BEAT, origin="0% 50%")
    add("#ti-c", "conn", t0 + 1.5 * BEAT)

    # THE MOVE cards: red rule is the frame's one red; name + works line in white
    t = 0.0
    for i, (win, ms, beats, card, _) in enumerate(SHOTS):
        a, b = t, t + beats * BEAT
        t = b
        if not card:
            continue
        name, conn, works, where = CARDS[card]
        k = f"m{i}"
        if where == "bl":
            pos = "left:60px;bottom:250px"
            scrim = ('<div class="abs" style="left:0;right:0;bottom:0;height:900px;'
                     'background:linear-gradient(to top, rgba(11,11,12,0.86), rgba(11,11,12,0))"></div>')
        else:
            pos = "left:60px;top:230px"
            scrim = ('<div class="abs" style="left:0;right:0;top:0;height:820px;'
                     'background:linear-gradient(to bottom, rgba(11,11,12,0.78), rgba(11,11,12,0))"></div>')
        F[k] = (a, b, f'''{scrim}
        <div class="col" style="{pos}">
          <div class="tagrow" id="{k}-tag" style="position:relative;gap:20px"><span class="rl red" style="width:70px;height:6px"></span><span class="tag">The move</span></div>
          {pw(k + "-p", name, 100 if len(name) < 13 else 72, -0.015, 0.9, size=170, mx=940, extra="margin-top:26px")}
          {cn(k + "-c", conn, 78, "margin-top:22px;margin-left:4px")}
          <div class="tag" id="{k}-w" style="margin-top:16px;margin-left:4px;font-size:34px;letter-spacing:0.16em;color:#fff">{html.escape(works)}</div>
        </div>''')
        add(f"#{k}-tag", "fade", a + 0.02)
        add(f"#{k}-p", "punch", a + 0.05, origin="0% 50%")
        add(f"#{k}-c", "conn", a + 0.5 * BEAT)
        add(f"#{k}-w", "fade", a + BEAT)

    # double end tag. 1) Blue Collar tag: one red (the date). FIGHT DAY on the first "Fight time", date on the second
    endA = f'''<div class="endcard" id="ea" style="align-items:center;justify-content:center">
          <img id="ea-logo" src="assets/brand/blue-collar-logo.jpg" alt="Blue Collar Boxing" style="width:600px;height:600px;object-fit:cover;clip-path:circle(49.5% at 50% 50%)">
          {pw("ea-p1", "FIGHT DAY", 100, -0.01, 0.9, size=190, mx=880, extra="margin-top:70px;text-align:center")}
          {pw("ea-p2", "SUNDAY · NOV 22", 100, 0.12, 1.0, red=True, size=70, mx=760, extra="margin-top:26px;text-align:center")}
        </div>'''
    add("#ea-logo", "pop", END + 0.05)
    add("#ea-p1", "punch", END + 0.56)
    add("#ea-p2", "punch", END + 1.68)
    # 2) DB tag, picture only (house lockup, kit 7.07), one red (DIFFERENT.)
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
    return F, A, endA, endB


def main():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    make_bed()
    shots_html, slots, t, log, used = [], [], 0.0, [], {}
    for i, (win, ms, beats, card, note) in enumerate(SHOTS):
        length = beats * BEAT
        if win:
            off, path = prep(i, win, ms, length)
            shots_html.append(
                f'      <!-- s{i:02d} {win} @{ms}: {html.escape(note)} -->\n'
                f'      <div class="shot" id="w{i}"><div class="push" data-layout-allow-overflow="">'
                f'<video id="v{i}" class="clip" src="{os.path.relpath(path, ROOT)}" '
                f'data-start="{t:.3f}" data-duration="{length:.3f}" data-media-start="{off:.3f}" '
                f'data-track-index="{i % 2}" muted playsinline></video></div></div>')
            slots.append({"i": i, "a": round(t, 3), "b": round(t + length, 3)})
            clip = WINDOWS[win][0]
            log.append(f"{t:6.2f}-{t + length:6.2f}  {clip:9} in {ms:6.2f} out {ms + length:6.2f}  [{win}] {note}")
            used.setdefault(win, []).append((ms, ms + length))
        else:
            log.append(f"{t:6.2f}-{t + length:6.2f}  {'(title card)':9}  {note}")
        t += length
    assert abs(t - END) < 0.01, (t, END)
    for w, spans in used.items():
        _, ws, we = WINDOWS[w]
        lo, hi = min(s[0] for s in spans), max(s[1] for s in spans)
        assert ws <= lo - 0.1 + 1e-6 or ws == 0, (w, ws, lo)
        assert we >= hi - 0.02, (w, we, hi)

    F, A, endA, endB = type_frames()
    layers = []
    for k, (a, b, body) in F.items():
        layers.append(f'      <div id="t-{k}" class="clip layer" data-start="{a:.3f}" data-duration="{b - a:.3f}" '
                      f'data-track-index="4">{body}</div>')
    layers.append(f'      <div id="t-endA" class="clip layer" data-start="{END:.3f}" data-duration="{END2 - END:.3f}" '
                  f'data-track-index="5">{endA}</div>')
    layers.append(f'      <div id="t-endB" class="clip layer" data-start="{END2:.3f}" data-duration="{TOTAL - END2:.3f}" '
                  f'data-track-index="6">{endB}</div>')

    # bed to the end of the body, out in 20 ms; the hook (full song from 7.60) carries both tags
    bed_d = round(END + 0.02, 3)
    bed_pts = [{"t": 0, "v": 1}, {"t": round(END - 0.02, 3), "v": 1}, {"t": bed_d, "v": 0}]
    hook_at = round(END - HOOK_LEAD, 3)
    hook_d = round(TOTAL - hook_at, 3)
    hook_pts = [{"t": 0, "v": 0}, {"t": 0.08, "v": HOOK_VOL}, {"t": round(hook_d - 0.6, 3), "v": HOOK_VOL}, {"t": hook_d, "v": 0}]
    audio = [
        f'      <audio id="a-bed" src="{BED}" data-start="0" data-duration="{bed_d:.3f}" data-media-start="0" '
        f'data-track-index="30" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": bed_pts}]})}"></audio>',
        f'      <audio id="a-hook" src="{SONG_FULL}" data-start="{hook_at:.3f}" data-duration="{hook_d:.3f}" data-media-start="{HOOK_SRC}" '
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
    print(f"[{MODE}] index.html: {len(slots)} shots, body {CONTENT_START}s, BC tag {END}s, DB tag {END2}s, total {TOTAL}s")
    if MODE == "final":
        tot = sum(we - ws for _, ws, we in WINDOWS.values())
        print(f"Topaz footage: {tot:.2f} s over {len(WINDOWS)} windows")


if __name__ == "__main__":
    main()
