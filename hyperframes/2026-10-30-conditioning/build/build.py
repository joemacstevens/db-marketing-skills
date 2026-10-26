#!/usr/bin/env python3
"""Saturday Conditioning (Don drop 10/23-10/25, slug 2026-10-30-conditioning). Personal-training conditioning
work from Sat 10/24 (+ the Fri 10/23 ball slams). Opener (sled drag, no type) -> SATURDAY CONDITIONING title ->
six move blocks with a red move chip + works line -> faster build into the chorus -> house end card.

Music: Victony "SLICK" (song lane for this reel). Grid measured here on the kick band: 110.0 BPM,
beat 0.54545 s, phase 0.030; 16-beat sections at 43.666 (chant) / 61.121 (chorus, after a one-beat stop at 60.57).
Song window 40.394 -> 64.94: last bar of the verse under opener + title, the chant section under the move blocks,
the stop beat, then 7 beats of the chorus. Whisper (medium.en, word level): the first profanity is "she ..." at
65.28, so the bed is out by 65.10. End card: bed fades, "We are Different Breed" hook (48.8).

Footage: 4K HLG clips get scale -> hable tonemap. 720p clips come from the Topaz topaz_video 1080p upscales in
don-drops/2026-10-25/upscaled/ (already SDR bt709, not tonemapped again). Every <video> gets the Sample cinematic
grade afterwards via `npx hyperframes media-treatment` (see build/make.sh).

  bash build/make.sh            # preps footage (once), writes index.html, applies the grade
  npm run check && npm run render -- -o renders/cond-v1-raw.mp4
"""
import html
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DROP = os.path.abspath(os.path.join(ROOT, "../../don-drops/2026-10-25"))
RAW, UP = os.path.join(DROP, "raw"), os.path.join(DROP, "upscaled")
BEAT = 0.54545
SONG = "assets/audio/song-slick.mp3"
HOOK = "assets/audio/different-breed-song.mp3"
SONG_IN = 40.394          # beat 74 = 43.666 (chant downbeat) - 6 beats
OPEN_B, TITLE_B = 3, 3
HANDLE = 0.3
SHARP_HLG, SHARP_UP = 0.6, 0.6
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
      "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")

# name -> (path, kind, window start in raw-clip seconds). kind "hlg" = 4K HLG raw, "up" = upscaled SDR window.
CLIP = {
    "bike": (os.path.join(RAW, "6FFEB08B-384E-415B-93F3-E4BB732348BE.mov"), "hlg", 0),
    "slide": (os.path.join(RAW, "3BCC5C9F-63AD-469A-9F21-FCF9E6F57CDD.mov"), "hlg", 0),
    "tread": (os.path.join(RAW, "F1D1601F-D2FA-49F0-97F1-F5D46460B15F.mov"), "hlg", 0),
    "sled": (os.path.join(UP, "IMG_2481-test.mp4"), "up", 0),
    "kb": (os.path.join(UP, "cond-2478.mp4"), "up", 5.45),
    "lunge": (os.path.join(UP, "cond-1818.mp4"), "up", 0),
    "slam": (os.path.join(UP, "cond-2434.mp4"), "up", 0),
}
SRC = {"bike": "6FFEB08B", "slide": "3BCC5C9F", "tread": "F1D1601F", "sled": "IMG_2481",
       "kb": "IMG_2478", "lunge": "IMG_1818", "slam": "IMG_2434"}

# (clip, raw-clip in-point s, beats, note). Back to back from 0; slot 1 is the title card.
SHOTS = [
    ("sled", 0.05, OPEN_B, "OPENER: backward sled drag, close, leaning into the straps"),
    (None, 0, TITLE_B, "TITLE: SATURDAY CONDITIONING"),
    # chant section (43.666): six move blocks, 2+2 beats each
    ("bike", 1.00, 2, "AIR BIKE: man in black tank, coach in blue beside him"),
    ("bike", 5.00, 2, "air bike, second window"),
    ("sled", 1.95, 2, "SLED DRAG: walking backward, straps taut"),
    ("sled", 4.30, 2, "sled drag, sled + plate slides into frame"),
    ("kb", 5.95, 2, "SINGLE-LEG SWING: cap client, hinge -> swing"),
    ("kb", 9.20, 2, "single-leg swing, next rep"),
    ("lunge", 2.90, 2, "WALKING LUNGE: barbell, green plates, side-on"),
    ("lunge", 4.80, 2, "walking lunge, next steps"),
    ("slide", 12.05, 2, "SLIDER LUNGE: cap client, side angle, down into the lunge"),
    ("slide", 14.45, 2, "slider lunge, next rep"),
    ("slam", 1.40, 2, "BALL SLAM: overhead -> slam (Fri 10/23)"),
    ("slam", 3.00, 2, "ball slam, next rep"),
    # build (no type), busier toward the stop beat
    ("tread", 2.00, 2, "treadmill run, cap client"),
    ("bike", 8.00, 1, "air bike"),
    ("sled", 6.20, 1, "sled close with plate"),
    ("lunge", 7.20, 1, "walking lunge"),
    ("slam", 4.60, 1, "ball slam"),
    ("kb", 7.60, 1, "single-leg swing"),
    ("bike", 3.20, 1, "air bike (the stop beat 60.57)"),
    # chorus 61.121: one beat each
    ("sled", 7.40, 1, "sled drag wide"),
    ("kb", 10.90, 1, "swing up"),
    ("lunge", 0.40, 1, "lunge, plate fills the frame"),
    ("bike", 9.80, 1, "air bike"),
    ("tread", 5.50, 1, "treadmill"),
    ("sled", 3.30, 1, "sled drag close"),
    ("slam", 0.20, 1, "ball slam, last hit before the end card"),
]
TOTAL_B = sum(s[2] for s in SHOTS)
CONTENT_START = round((OPEN_B + TITLE_B) * BEAT, 3)
END = round(TOTAL_B * BEAT, 3)            # end card + hook start (song 64.94)
HOOK_AT = END
TOTAL = round(END + 4.4, 3)

# move labels: first shot index, chip lines, works line, side (l/r), vertical anchor css, scrim edge, works max width.
# Placement per kit §5: over floor/wall negative space, off faces and working hands, never the same spot twice running.
MOVES = [
    dict(i=2, chip=["AIR BIKE"], works="works legs, lungs and arms", side="l", v="bottom:330px", scrim="bottom", mw=900),
    dict(i=4, chip=["SLED", "DRAG"], works="works quads, back and grip", side="l", v="top:290px",
         scrim="top", mw=440, alpha=0.8, csize=76),
    dict(i=6, chip=["SINGLE-LEG SWING"], works="works glutes, hamstrings and core", side="r", v="bottom:300px",
         scrim="bottom", mw=1000, size=104, csize=70),
    dict(i=8, chip=["WALKING", "LUNGE"], works="works quads, glutes and core", side="l", v="bottom:330px",
         scrim="bottom", mw=900),
    dict(i=10, chip=["SLIDER", "LUNGE"], works="works glutes, quads and hips", side="l", v="top:560px", scrim="left",
         mw=400),
    dict(i=12, chip=["BALL", "SLAM"], works="works core, shoulders and lats", side="l", v="bottom:330px",
         scrim="bottom", mw=560),
]


def esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def prep(name, ms, length):
    path, kind, w0 = CLIP[name]
    out = os.path.join(ROOT, f"assets/footage/{name}_{ms:.2f}_{round(length / BEAT)}.mp4")
    rel = ms - w0                                   # in-point inside the source file
    pre = min(HANDLE, rel)
    if not os.path.exists(out):
        # light sharpen after scale/tonemap (Joey 10/25: v2 read soft); gentler on the Topaz upscales
        vf = (f"scale=1080:1920:flags=lanczos,{TM},setsar=1,unsharp=5:5:{SHARP_HLG}:5:5:0" if kind == "hlg"
              else f"scale=1080:1920:flags=lanczos,setsar=1,unsharp=5:5:{SHARP_UP}:5:5:0")
        ff(["-ss", f"{rel - pre:.3f}", "-t", f"{length + pre + HANDLE:.3f}", "-i", path, "-an", "-vf", vf,
            "-r", "30", "-g", "15", "-keyint_min", "15", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", out])
        print("prepped", out)
    return pre, out


def cn(id_, text, size, extra=""):
    return f'<span class="cn" id="{id_}" style="font-size:{size}px;{extra}">{html.escape(text)}</span>'


def pw(id_, text, wdth, track, lh, red=False, size=None, mx=970, extra=""):
    return (f'<div class="pw{" red" if red else ""} fit" id="{id_}" data-size="{size}" data-max="{mx}" '
            f'style="font-stretch:{wdth}%;letter-spacing:{track}em;line-height:{lh};{extra}" '
            f'data-layout-allow-overflow="">{html.escape(text)}</div>')


def scrim(edge, a=0.55, size=760):
    side = {"top": f"top:0;left:0;right:0;height:{size}px", "bottom": f"bottom:0;left:0;right:0;height:{size}px",
            "left": "top:0;bottom:0;left:0;width:620px"}[edge]
    to = {"top": "bottom", "bottom": "top", "left": "right"}[edge]
    return f'<div class="abs" style="{side};background:linear-gradient(to {to}, rgba(11,11,12,{a}), rgba(11,11,12,0))"></div>'


def starts():
    t, out = 0.0, []
    for sh in SHOTS:
        out.append(round(t, 3))
        t += sh[2] * BEAT
    return out


def type_frames():
    F, A = {}, []
    add = lambda sel, kind, t, **x: A.append({"sel": sel, "kind": kind, "t": round(t, 3), **x})
    st = starts()

    t0 = OPEN_B * BEAT
    F["title"] = (t0, CONTENT_START, f'''<div class="abs" style="inset:0;background:var(--endbg)"></div>
        <div class="tagrow" id="ti-tag" style="top:330px;left:60px"><span class="sq"></span><span class="tag">Different Breed</span><span class="rl" style="width:90px;height:2.5px"></span><span class="tag">Elite Fitness</span></div>
        <div class="col" style="left:56px;top:690px">
          {pw("ti-p1", "SATURDAY", 125, -0.02, 0.86, size=190, mx=960)}
          {pw("ti-p2", "CONDITIONING.", 62, -0.03, 0.80, red=True, size=330, mx=965, extra="margin-top:14px")}
          {cn("ti-c", "in Teaneck", 118, "margin-top:40px;margin-left:8px")}
        </div>''')
    add("#ti-tag", "fade", t0)
    add("#ti-p1", "punch", t0 + 0.03, origin="0% 50%")
    add("#ti-p2", "punch", t0 + BEAT, origin="0% 50%")
    add("#ti-c", "conn", t0 + 1.4 * BEAT)

    for k, m in enumerate(MOVES):
        a = st[m["i"]]
        b = st[m["i"] + 2]
        right = m["side"] == "r"
        place = ("right:56px;align-items:flex-end;" if right else "left:56px;") + m["v"] + ";"
        origin = "100% 50%" if right else "0% 50%"
        chip = "<br>".join(html.escape(x) for x in m["chip"])
        wd = 100 if max(len(x) for x in m["chip"]) < 12 else 72
        F[f"m{k}"] = (a, b, f'''{scrim(m["scrim"], m.get("alpha", 0.65), 860)}
        <div class="col" style="{place}">
          <div class="chip" id="m{k}-chip"><span class="pw" style="font-size:{m.get("size", 140)}px;font-stretch:{wd}%;letter-spacing:0;line-height:0.95;display:block;{"text-align:right;" if right else ""}">{chip}</span></div>
          {cn(f"m{k}-c", m["works"], m.get("csize", 84), f"margin-top:20px;white-space:normal;max-width:{m['mw']}px;" + ("text-align:right;" if right else ""))}
        </div>''')
        add(f"#m{k}-chip", "punch", a + 0.03, origin=origin)
        add(f"#m{k}-c", "conn", a + 0.75 * BEAT)

    # end card: house lockup (kit 7.07)
    endB = f'''<div class="endcard" id="eb">
          <div class="row" style="justify-content:space-between"><span class="tag" style="color:rgba(255,255,255,0.8)">Saturday Conditioning</span><span class="tag" style="color:rgba(255,255,255,0.8)">Teaneck, NJ</span></div>
          <div class="col rel">
            <img id="eb-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness" style="width:330px;height:330px;object-fit:contain;margin-bottom:90px;margin-left:-20px">
            {cn("eb-c", "What we do is", 135, "line-height:0.95")}
            {pw("eb-p1", "ABSOLUTELY", 62, -0.025, 0.82, size=210, extra="margin-top:25px")}
            {pw("eb-p2", "DIFFERENT.", 125, -0.01, 0.9, red=True, size=120, extra="margin-top:10px")}
          </div>
          <div class="row" id="eb-h" style="align-items:center;gap:20px"><span class="rl red" style="width:70px;height:5px"></span><span class="tag" style="font-size:30px;letter-spacing:0.14em;text-transform:none">@dbelitefitness</span></div>
        </div>'''
    add("#eb-logo", "fade", END + 0.02)
    add("#eb-c", "conn", END + 0.2)
    add("#eb-p1", "punch", END + 2 * BEAT, origin="0% 50%")
    add("#eb-p2", "punch", END + 3 * BEAT, origin="0% 50%")
    add("#eb-h", "fade", END + 3 * BEAT + 0.2)
    return F, A, endB


def main():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    shots_html, slots, t, log = [], [], 0.0, []
    for i, (clip, ms, beats, note) in enumerate(SHOTS):
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
            log.append(f"{t:6.2f}-{t + length:6.2f}  song {SONG_IN + t:6.2f}  {SRC[clip]:9} in {ms:6.2f} out {ms + length:6.2f}  {note}")
        else:
            log.append(f"{t:6.2f}-{t + length:6.2f}  song {SONG_IN + t:6.2f}  {'(title)':9}                    {note}")
        t += length
    assert abs(t - END) < 0.01, (t, END)

    F, A, endB = type_frames()
    layers = []
    for k, (a, b, body) in F.items():
        layers.append(f'      <div id="t-{k}" class="clip layer" data-start="{a:.3f}" data-duration="{b - a:.3f}" '
                      f'data-track-index="4">{body}</div>')
    layers.append(f'      <div id="t-endB" class="clip layer" data-start="{END:.3f}" data-duration="{TOTAL - END:.3f}" '
                  f'data-track-index="6">{endB}</div>')

    # bed: song window to the end-card downbeat, out by song 65.10 (profanity at 65.28)
    bed_d = round(HOOK_AT + 0.16, 3)
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
    print(f"index.html: {len(slots)} shots, content {CONTENT_START}s, end card {END}s, total {TOTAL}s, "
          f"song {SONG_IN} -> {SONG_IN + HOOK_AT + 0.16:.2f}")


if __name__ == "__main__":
    main()
