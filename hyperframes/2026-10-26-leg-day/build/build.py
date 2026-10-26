#!/usr/bin/env python3
"""Leg Day (Don drop 10/23-10/25, slug 2026-10-26-leg-day). Women's lower-body PT session with Coach Don, Sat 10/24.
One client throughout (name NOT confirmed, so none on screen). Don films, so he's only in the title connector.

Music: Tinashe "Too Easy" (song lane for this reel). Grid measured here on the kick band of the ElevenLabs
instrumental stem, NOT the cutmap (its 138.35 was wrong): 135.5 BPM, beat P = 0.442804 s, beat k at
0.125 + k * P, downbeats at k % 4 == 0. Vocal stem + whisper small.en/medium.en: verse 1 (14-27 s) and verse 2
(56-69 s) carry "freaky girls", "drop it like it's hot", "this shit is loud", so they stay out.
Window = beats 61-104 (27.136-46.177 s): enters in the breath after "loud" (27.08-27.27 s gap), the clean hook
("I feel like a celebrity ... make it look so easy", beats 64-96), then the first two bars of the drop (wordless
chops). Lyrics never go on screen. End card: DB's "We are Different Breed" hook (different-breed-song.mp3 @48.8).

Picture: 4K HLG iPhone (rotation -90), scaled to 1080x1920 FIRST, then hable tonemap (scripts/hdr-tonemap.sh chain),
30 fps. Grade = house Sample cinematic (hyperframes/_grades/sample-cinematic.json), applied with
`hyperframes media-treatment` at the end of this script.

  python3 build/build.py            # preps footage (once), writes index.html, applies the grade
  npm run check && npm run render -- -o renders/leg-day-v1-raw.mp4
"""
import html
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RAW = os.path.normpath(os.path.join(ROOT, "../../don-drops/2026-10-25/raw"))
GRADE_FILE = os.path.normpath(os.path.join(ROOT, "../_grades/sample-cinematic.json"))
P = 0.442804
B0 = 0.125
BEAT = P
song_t = lambda k: B0 + k * P
OPEN = 1.5                              # opener runs 0-1.5 s; beat 64 (hook downbeat) lands exactly there
OFF = round(song_t(64) - OPEN, 4)       # reel t = song time - OFF
t_of = lambda k: round(song_t(k) - OFF, 3)
SONG_IN_K = 61                          # bed enters in the breath after "loud"
SONG = "assets/audio/song-too-easy.mp3"
HOOK = "assets/audio/different-breed-song.mp3"
HOOK_SRC = 48.8
HOOK_GAIN = 1.9                         # the DB song sits ~7 dB under the Tinashe master; +5.6 dB so the end card does not drop out
CONTENT = t_of(68)
END = t_of(104)
END_LEN = 3.8
TOTAL = round(END + END_LEN, 3)
HANDLE = 0.3
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
      "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")

CLIP = {
    "sq": "84393108-5C96-400D-AD10-F5C8AB847081.mov",   # barbell back squat, side/front angle (8.3 s)
    "bss": "A27BD779-7886-4C2F-B74C-5C887D5E26E7.mov",  # Bulgarian split squat, front view (11.7 s)
    # 3ABDBFF7 (split squat, 3/4 rear) left out: the front angle covers the move, so no rear-on shot
    "le": "8A304F7D-30A8-4B63-9043-F3E79FA936AE.mov",   # leg extension, side (16.3 s)
    "vc": "2E7D9C30-4D6F-43D8-9CC1-7C50F20DE320.mov",   # VersaClimber, 120 fps, profile window only
}
# (clip, raw media start, beats, note). None = title card. Opener length is OPEN seconds, not beats.
SHOTS = [
    ("sq", 0.95, None, "OPENER: wide rack shot, she sits the squat down and drives up (no type)"),
    (None, 0, 4, "TITLE: LEG DAY. with Coach Don (hook downbeat, beats 64-68)"),
    ("sq", 3.50, 4, "BACK SQUAT rep, closer: down to depth ~4.3, up by 5.3"),
    ("sq", 6.25, 4, "BACK SQUAT rep 2: depth ~6.9, standing 7.75"),
    ("bss", 1.00, 4, "BULGARIAN SPLIT SQUAT front view: top -> bottom 2.0 -> drive up"),
    ("bss", 8.20, 4, "BULGARIAN SPLIT SQUAT rep: bottom ~8.9 -> top ~9.9"),
    ("le", 1.20, 4, "LEG EXTENSION side: knees extend to lockout ~2.0-2.75"),
    ("le", 13.60, 4, "LEG EXTENSION rep, camera drifts closer at the end"),
    ("vc", 2.45, 4, "VERSACLIMBER profile, face visible, 0.6x (2.45-3.51, cut before it turns rear-on)"),
    # drop (beats 96-104), wordless chops: quick recap, no type
    ("bss", 5.95, 2, "drop: split squat drive out of the bottom"),
    ("le", 8.25, 2, "drop: leg extension to lockout"),
    ("bss", 3.55, 1, "drop: split squat front, sinking into the rep the last shot finishes (cutaway)"),
    ("le", 11.75, 1, "drop: leg extension rising (one beat)"),
    ("bss", 4.00, 2, "drop: split squat bottom -> standing tall into the end card"),
]


def esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


SPEED = {"vc": 0.6}   # the climber is 120 fps: 0.6x keeps the 1-bar shot inside the profile window (2.45-3.51)


def prep(i, clip, ms, length):
    sp = SPEED.get(clip, 1)
    out = os.path.join(ROOT, f"assets/footage/s{i:02d}_{clip}_{ms:.2f}{'' if sp == 1 else f'_x{sp}'}.mp4")
    pre = min(HANDLE, ms)
    if not os.path.exists(out):
        vf = ("" if sp == 1 else f"setpts=PTS/{sp},") + f"fps=30,scale=1080:1920:flags=lanczos,{TM},unsharp=5:5:0.6:5:5:0,setsar=1"   # v3: light luma sharpen
        ff(["-ss", f"{ms - pre:.3f}", "-t", f"{(length + HANDLE) * sp + pre:.3f}", "-i", os.path.join(RAW, CLIP[clip]),
            "-an", "-vf", vf, "-r", "30", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p",
            "-g", "15", "-keyint_min", "15", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", out])
        print("prepped", out)
    return round(pre / sp, 3), out


def cn(id_, text, size, extra="", red=False):
    return f'<span class="cn{" red" if red else ""}" id="{id_}" style="font-size:{size}px;{extra}">{html.escape(text)}</span>'


def pw(id_, text, wdth, track, lh, red=False, italic=False, size=None, mx=970, fit=None, extra="", cls=""):
    attrs = f'data-fit="{fit}"' if fit else f'data-size="{size}" data-max="{mx}"'
    return (f'<div class="pw{" red" if red else ""}{" it" if italic else ""} fit {cls}" id="{id_}" {attrs} '
            f'style="font-stretch:{wdth}%;letter-spacing:{track}em;line-height:{lh};{extra}" '
            f'data-layout-allow-overflow="">{html.escape(text)}</div>')


def scrim(where="bottom", h=800, a=0.7):
    if where == "top":
        return (f'<div class="scrim" style="top:0;bottom:auto;height:{h}px;'
                f'background:linear-gradient(to bottom, rgba(11,11,12,{a}), rgba(11,11,12,0))"></div>')
    return f'<div class="scrim" style="height:{h}px;background:linear-gradient(to top, rgba(11,11,12,{a}), rgba(11,11,12,0))"></div>'


# move cards: (key, first shot index, beats, connector, PUNCH, tag, layout). Placement checked on snapshots:
# never over her face, hands or working legs.
MOVES = [
    # she squats center-left, plates + feet own the bottom: stack top-right over the banner and back wall
    ("sq", 2, 8, "barbell", "BACK SQUAT", "Quads · Glutes · Core", dict(side="right", top=210, mx=700, scrim="top")),
    # front foot lands center-right low, rear foot on the bench left: stack bottom-left over the bench base
    ("bs", 4, 8, "bulgarian", "SPLIT SQUAT", "Quads · Glutes · Balance", dict(side="left", top=1490, mx=500, scrim="bottom")),
    # seated right of center, shins + pad sweep left at mid-height: stack bottom-left under her shoes
    ("le", 6, 8, "leg", "EXTENSION", "Quads", dict(side="left", top=1440, mx=640, scrim="bottom")),
    # she climbs center-right; the bare wall left of the machine takes a vertical climb (kit placement)
    ("vc", 8, 4, "on the", "VERSACLIMBER", "Legs · Lungs · Grip", dict(climb=True)),
]


def shot_starts():
    t, out = 0.0, []
    for clip, ms, beats, note in SHOTS:
        length = OPEN if beats is None else beats * BEAT
        out.append((round(t, 3), round(length, 3)))
        t += length
    return out


def type_frames():
    F, A = {}, []
    add = lambda sel, kind, t, **x: A.append({"sel": sel, "kind": kind, "t": round(t, 3), **x})
    starts = shot_starts()

    # title card on ink, beats 64-68
    t0 = OPEN
    F["title"] = (t0, CONTENT, f'''<div class="abs" style="inset:0;background:var(--endbg)"></div>
        <div class="tagrow" id="ti-tag" style="top:330px;left:60px"><span class="sq"></span><span class="tag">Different Breed</span><span class="rl" style="width:90px;height:2.5px"></span><span class="tag">Personal Training</span></div>
        <div class="col" style="left:56px;top:640px">
          {pw("ti-p1", "LEG", 125, -0.02, 0.84, size=420, mx=960)}
          {pw("ti-p2", "DAY.", 62, -0.03, 0.80, red=True, size=520, mx=965, extra="margin-top:10px")}
          {cn("ti-c", "with Coach Don", 120, "margin-top:44px;margin-left:8px")}
        </div>''')
    add("#ti-tag", "fade", t0)
    add("#ti-p1", "punch", t0 + 0.03, origin="0% 50%")
    add("#ti-p2", "punch", t0 + BEAT, origin="0% 50%")
    add("#ti-c", "conn", t0 + 0.6)

    for n, (key, si, beats, conn, punch, tag, L) in enumerate(MOVES):
        a = starts[si][0]
        b = round(a + beats * BEAT, 3)
        hit = BEAT if beats >= 8 else 0.2   # punch on beat 2; a one-bar card lands sooner so the tag reads
        if L.get("climb"):
            # VERSACLIMBER climbs the left edge in red (the frame's one red); connector + tag sit under it, left of her feet
            F[key] = (a, b, f'''<div class="scrim" style="top:0;bottom:0;left:0;right:auto;width:520px;height:auto;background:linear-gradient(to right, rgba(11,11,12,0.72), rgba(11,11,12,0))"></div>
        {pw(f"{key}-p", punch, 62, -0.02, 0.82, size=330, mx=1180, red=True, cls="vclimb", extra="position:absolute;left:40px;top:250px")}
        <div class="col" style="left:44px;top:1430px">
          {cn(f"{key}-c", conn, 104, "line-height:0.9")}
          <div class="col" id="{key}-tag" style="position:relative;margin-top:22px;gap:10px">{"".join(f'<span class="tag">{html.escape(w.strip())}</span>' for w in tag.split("·"))}</div>
        </div>''')
            add(f"#{key}-p", "climb", a + 0.03)
            add(f"#{key}-c", "conn", a + 0.12)
            add(f"#{key}-tag", "fade", a + 0.35)
            continue
        right = L["side"] == "right"
        side = "right:58px;align-items:flex-end" if right else "left:60px"
        rule = '<span class="sq"></span>' if n % 2 == 0 else '<span class="rl red" style="width:110px;height:5px"></span>'
        tagrow = (f'<span class="tag">{html.escape(tag)}</span>{rule}' if right
                  else f'{rule}<span class="tag">{html.escape(tag)}</span>')
        F[key] = (a, b, f'''{scrim(L["scrim"], 760, 0.74)}
        <div class="col" style="{side};top:{L["top"]}px">
          {cn(f"{key}-c", conn, 110, "line-height:0.9;margin-left:8px")}
          {pw(f"{key}-p", punch, 100 if len(punch) <= 10 else 70, -0.03, 0.84, size=200, mx=L["mx"], extra="margin-top:8px")}
          <div class="row" id="{key}-tag" style="margin-top:24px;gap:20px;align-items:center">{tagrow}</div>
        </div>''')
        add(f"#{key}-c", "conn", a + 0.06)
        add(f"#{key}-p", "punch", a + hit, origin=("100% 50%" if right else "0% 50%"))
        add(f"#{key}-tag", "fade", a + hit + 0.25)

    end = f'''<div class="endcard" id="f7">
          <div class="row" style="justify-content:space-between"><span class="tag" style="color:rgba(255,255,255,0.8)">Leg Day</span><span class="tag" style="color:rgba(255,255,255,0.8)">Personal Training</span></div>
          <div class="col rel">
            <img id="f7-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness" style="width:330px;height:330px;object-fit:contain;margin-bottom:90px;margin-left:-20px">
            {cn("f7-c", "What we do is", 135, "line-height:0.95")}
            {pw("f7-p1", "ABSOLUTELY", 62, -0.025, 0.82, size=210, extra="margin-top:25px")}
            {pw("f7-p2", "DIFFERENT.", 125, -0.01, 0.9, red=True, size=120, extra="margin-top:10px")}
          </div>
          <div class="row" id="f7-h" style="align-items:center;gap:20px"><span class="rl" style="width:70px;height:5px"></span><span class="tag" style="font-size:30px;letter-spacing:0.14em;text-transform:none">@dbelitefitness</span></div>
        </div>'''
    hb = 0.16  # "We" lands 0.16 s into the hook
    add("#f7-logo", "fade", END + 0.02)
    add("#f7-c", "conn", END + hb)
    add("#f7-p1", "punch", END + 0.7, origin="0% 50%")
    add("#f7-p2", "punch", END + 1.25, origin="0% 50%")
    add("#f7-h", "fade", END + 1.5)
    return F, A, end


def main():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    shots_html, slots, log = [], [], []
    for i, ((clip, ms, beats, note), (t, length)) in enumerate(zip(SHOTS, shot_starts())):
        if clip:
            off, path = prep(i, clip, ms, length)
            shots_html.append(
                f'      <!-- s{i:02d} {clip} @{ms}: {html.escape(note)} -->\n'
                f'      <div class="shot" id="w{i}"><div class="push" data-layout-allow-overflow="">'
                f'<video id="v{i}" class="clip" src="{os.path.relpath(path, ROOT)}" '
                f'data-start="{t:.3f}" data-duration="{length:.3f}" data-media-start="{off:.3f}" '
                f'data-track-index="{i % 2}" muted playsinline></video></div></div>')
            slots.append({"i": i, "a": t, "b": round(t + length, 3)})
            sp = SPEED.get(clip, 1)
            log.append(f"{t:6.2f}-{t + length:6.2f}  {CLIP[clip]:44} in {ms:6.2f} out {ms + length * sp:6.2f}"
                       f"{'' if sp == 1 else f' x{sp}'}  {note}")
        else:
            log.append(f"{t:6.2f}-{t + length:6.2f}  {'(title card)':44}  {note}")
    last = shot_starts()[-1]
    assert abs(last[0] + last[1] - END) < 0.01, (last, END)
    assert abs(shot_starts()[2][0] - CONTENT) < 0.01

    F, A, end_html = type_frames()
    layers = []
    for n, (k, (a, b, body)) in enumerate(F.items()):
        layers.append(f'      <div id="t-{k}" class="clip layer" data-start="{a:.3f}" data-duration="{b - a:.3f}" '
                      f'data-track-index="{4 + (0 if k == "title" else n % 2)}">{body}</div>')

    # song: beats 61-104, enters at t_of(61), tail rings 0.25 s under the hook; hook fades over its last 0.6 s
    s_in = t_of(SONG_IN_K)
    sd = round(END + 0.25 - s_in, 3)
    song_pts = [{"t": 0, "v": 0}, {"t": 0.02, "v": 1}, {"t": round(END - s_in - 0.03, 3), "v": 1}, {"t": sd, "v": 0}]
    hook_pts = [{"t": 0, "v": 0}, {"t": 0.03, "v": 1}, {"t": round(END_LEN - 0.6, 3), "v": 1}, {"t": END_LEN, "v": 0}]
    audio = [
        f'      <audio id="a-song" src="{SONG}" data-start="{s_in:.3f}" data-duration="{sd:.3f}" data-media-start="{song_t(SONG_IN_K):.3f}" '
        f'data-track-index="30" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": song_pts}]})}"></audio>',
        f'      <audio id="a-hook" src="{HOOK}" data-start="{END:.3f}" data-duration="{END_LEN:.3f}" data-media-start="{HOOK_SRC}" '
        f'data-track-index="31" data-volume="{HOOK_GAIN}" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": hook_pts}]})}"></audio>',
    ]

    rep = {"%TOTAL%": f"{TOTAL}", "%END%": f"{END}", "%END_DUR%": f"{END_LEN:.3f}",
           "%SHOTS%": "\n".join(shots_html), "%TYPE%": "\n".join(layers), "%ENDCARD%": end_html,
           "%AUDIO%": "\n".join(audio), "%SLOTS%": json.dumps(slots), "%ANIMS%": json.dumps(A)}
    page = open(os.path.join(HERE, "template.html")).read()
    for k, v in rep.items():
        page = page.replace(k, v)
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    open(os.path.join(HERE, "shotlist.txt"), "w").write("\n".join(log) + "\n")

    # house grade on every footage <video> (Sample cinematic, MEDIUM)
    grading = open(GRADE_FILE).read().replace("\n", "").replace(" ", "")
    subprocess.run(["npx", "--yes", "hyperframes@0.8.200", "media-treatment", "--project", ROOT, "--file", "index.html",
                    "--selector", "video.clip", "--apply", "--grading", grading], check=True)
    print("\n".join(log))
    print(f"index.html: {len(slots)} shots, song beats {SONG_IN_K}-104 ({song_t(SONG_IN_K):.3f}-{song_t(104):.3f}) "
          f"enters t={s_in}, content {CONTENT}s, end card {END}s, total {TOTAL}s")


if __name__ == "__main__":
    main()
