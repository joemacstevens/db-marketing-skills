#!/usr/bin/env python3
"""Builds index.html for "Blue Collar Boxing: Youth" (Coach Ali's kids, Sat 10/18/26).

  python3 build/build.py --media      # footage proxies + coach-lines.wav + bed, then index.html
  python3 build/build.py               # index.html only
  npx --yes hyperframes@0.8.159 check
  npx --yes hyperframes@0.8.159 render --quiet -o renders/youth-ali-vN-raw.mp4
  then master: plain gain to -14 LUFS + alimiter

Source: cousin Joe's iPhone clips (texted 10/18 1:40 PM, "Some video of Coach Alli with the kids blue collar"),
shot Sat 10/18 12:48-1:23 PM in the DB ring. Raw: main checkout `Blue Collar 2026/Ali Kids 10-18/IMG_62xx.MOV`,
1080p30 HLG HDR (tonemapped here). IMG_6206 + IMG_6208 are vertical (rotation -90), the rest landscape.
IMG_6208 = Ali on the mitts with a 13-year-old girl (Joey 10/20: she's a kid, keep her in).
Template: hyperframes/2026-10-17-black-vs-red (worktree clever-napier-49c768).
Frames:
  vert     : vertical phone clip, full screen.
  window45 : 4:5 crop of the full height around cx, 1080x1350 at y=285, over the same clip blurred + darkened.
cx: one value or [[source_time, cx], ...] keys (linear between keys), as a fraction of the source width.
Audio: Coach Ali's callouts straight off the phone mic (natural sync, level-matched), Blue Collar Heavy bed ducked
under him, Blue Collar tag with the "Fight time" hook, then the picture-only DB tag (feedback_blue-collar-end-tag).
Quotes: what = whisper medium.en on isolated windows, when = Parakeet. Off-camera "six-year-old" line in IMG_6206
21.0-23.6 is NOT used (not Ali, age unknown). IMG_6213 "Good combination" is followed by a possible "damn": window
ends at 4.45.
"""
import html
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC_ROOT = "/Users/joestevens/Projects/Different Breed/Blue Collar 2026/Ali Kids 10-18"


def src_path(clip):
    return os.path.join(SRC_ROOT, f"IMG_{clip[3:]}.MOV")


BED_SONG = "assets/audio/blue-collar-heavy.mp3"
BED_STEM = "assets/audio/bc-heavy-instrumental.mp3"
BED_FILE = "assets/audio/bc-heavy-instrumental-bed.wav"
BED_HIT = 26.94     # song time that lands on the title (reel 1.5)
BED_AT0 = 0
BED_VOL = 1.4
BED_DUCK = 0.18
HOOK_FILE = "assets/audio/blue-collar-heavy.mp3"
HOOK_SRC = 7.60
HOOK_LEAD = 0.08
HOOK_VOL = 1.4
GRADE = {"intensity": 1, "adjust": {"contrast": 0.2, "highlights": -0.15, "whites": 0.02, "blacks": -0.1,
                                     "vibrance": 0.25, "saturation": 0.03}}

# ── Coach Ali's lines: source windows that play (reel `at` = when the window starts) ──
# The opener J-cuts "Hit like a truck, dude" (IMG_6206 9.3, Ali's back fills the frame there) over the same
# kid working with him at src 11.4; everything else is in sync with its own picture.
LINES = [
    {"clip": "IMG6206", "src": [9.20, 10.75], "at": 0.20},
    {"clip": "IMG6196", "src": [1.76, 3.60], "at": 3.36},
    {"clip": "IMG6206", "src": [15.70, 17.60], "at": 6.10},
    {"clip": "IMG6213", "src": [3.55, 4.45], "at": 9.35},
    {"clip": "IMG6196", "src": [21.20, 22.95], "at": 14.70},
    {"clip": "IMG6210", "src": [14.75, 16.05], "at": 18.55},
    {"clip": "IMG6206", "src": [25.35, 26.55], "at": 21.25},
]
LINE_TARGET = -15.0
VOICE = [[l["at"], round(l["at"] + l["src"][1] - l["src"][0], 3)] for l in LINES]


def reel_of(clip, t):
    for l in LINES:
        if l["clip"] == clip and l["src"][0] - 0.01 <= t <= l["src"][1] + 0.01:
            return round(l["at"] + t - l["src"][0], 3)
    raise ValueError(f"{clip} {t} not in a line window")


FOOT_END = 23.40
CTA_LEN = 0
END = round(FOOT_END + CTA_LEN, 3)
END_LEN = 3.2                      # Blue Collar tag
END2 = round(END + END_LEN, 3)     # DB tag
DB_LEN = 2.3
TOTAL = round(END2 + DB_LEN, 3)

TONEMAP = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
           "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")


def tonemap_vf(path):
    trc = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer",
                          "-of", "default=nk=1:nw=1", path], capture_output=True, text=True).stdout.strip()
    return TONEMAP if trc in ("arib-std-b67", "smpte2084") else "format=yuv420p"


# at = reel time the shot is fully on; src = source time at `at`; tx = transition INTO the shot
#   cut (hard cut + brightness pop), xf (crossfade `d`), wipe (red-edge wipe 0.3 s), whip (blur whip).
# Picks checked frame by frame at 0.5 s: no misses, no kid getting tagged clean, no stoppages.
SHOTS = [
    {"clip": "IMG6206", "at": 0.00, "src": 11.40, "frame": "vert", "tx": "cut",
     "what": "OPENER: red-headgear kid working with Ali, Ali facing camera; title over it from 1.5"},
    {"clip": "IMG6196", "at": 3.00, "src": 1.40, "frame": "window45", "cx": 0.55, "tx": "whip",
     "what": "sparring, red vs gold headgear, Ali walks in: 'Only jab and hook.'"},
    {"clip": "IMG6206", "at": 5.40, "src": 15.00, "frame": "vert", "tx": "cut",
     "what": "Ali + the kid up close (name chip): 'Good. Good shot.'"},
    {"clip": "IMG6213", "at": 8.40, "src": 2.60, "frame": "window45", "cx": 0.68, "tx": "cut",
     "what": "red headgear vs grey shirt on the ropes: 'Good combination.'"},
    {"clip": "IMG6208", "at": 10.60, "src": 0.40, "frame": "vert", "tx": "wipe",
     "what": "the 13-year-old on Ali's mitts, DB logo on the floor"},
    {"clip": "IMG6196", "at": 13.10, "src": 19.60, "frame": "window45",
     "cx": [[19.6, 0.60], [20.5, 0.52], [21.0, 0.42], [22.0, 0.48], [22.9, 0.46]], "tx": "cut",
     "what": "Ali watching the exchange: 'Good job, both of you.'"},
    {"clip": "IMG6208", "at": 16.40, "src": 6.60, "frame": "vert", "tx": "cut",
     "what": "her combos on the mitts"},
    {"clip": "IMG6210", "at": 18.40, "src": 14.60, "frame": "window45", "cx": 0.62, "tx": "cut",
     "what": "blue gloves vs white gloves trading, wide (v2: 22.6-25 was a blurry zoom): 'Be ready to counter.'"},
    {"clip": "IMG6206", "at": 20.90, "src": 25.00, "frame": "vert", "tx": "cut",
     "what": "CLOSER: the kid lets it go on Ali, 'Jab, jab, two.'"},
]
WIPE = 0.30

TITLE = {"at": 1.50, "out": 3.00}
CHIPS = [
    {"at": 5.46, "out": 8.34, "name": "Coach Ali", "team": "Blue Collar", "kind": "red"},
]

CAPS = [
    ["IMG6206", 9.28, 10.75, "Hit like a truck, dude."],
    ["IMG6196", 1.84, 3.60, "Only jab and hook."],
    ["IMG6206", 16.96, 17.60, "Good shot."],
    ["IMG6213", 3.60, 4.45, "Good combination."],
    ["IMG6196", 21.28, 22.95, "Good job, both of you."],
    ["IMG6210", 14.80, 16.05, "Be ready to counter."],
    ["IMG6206", 25.44, 26.55, "Jab, jab, two."],
]


def esc(obj):
    return html.escape(json.dumps(obj, separators=(",", ":")), quote=True)


def run(cmd):
    subprocess.run(cmd, check=True)


def dur_of(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                capture_output=True, text=True).stdout)


def spans():
    out = []
    for i, s in enumerate(SHOTS):
        lead = s.get("d", 0) if s["tx"] == "xf" else (WIPE if s["tx"] == "wipe" else 0)
        start = s["at"] - lead
        end = SHOTS[i + 1]["at"] if i + 1 < len(SHOTS) else FOOT_END
        out.append({"i": i, "start": round(start, 3), "end": round(end, 3), "lead": lead,
                    "src_in": round(s["src"] - lead, 3), "src_out": round(s["src"] + (end - s["at"]), 3)})
    return out


def cx_expr(cx, W, CW, t0):
    keys = [[0.0, cx]] if not isinstance(cx, list) else [[t - t0, c] for t, c in cx]
    px = lambda c: max(0.0, min(W - CW, c * W - CW / 2))
    expr = f"{px(keys[-1][1]):.1f}"
    for (ta, ca), (tb, cb) in reversed(list(zip(keys, keys[1:]))):
        a, b = px(ca), px(cb)
        expr = f"if(lt(t\\,{tb:.3f})\\,{a:.1f}+({b - a:.1f})*(t-{ta:.3f})/{tb - ta:.3f}\\,{expr})"
    if len(keys) > 1:
        expr = f"if(lt(t\\,{keys[0][0]:.3f})\\,{px(keys[0][1]):.1f}\\,{expr})"
    return expr


ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", "15", "-keyint_min", "15", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"]


def proxy_name(i, s):
    return f"s{i:02d}-{s['clip'].lower()}"


def make_media():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    for sp, s in zip(spans(), SHOTS):
        src = s.get("file") or src_path(s["clip"])
        assert os.path.exists(src), f"missing {src} (is the Ajeo drive mounted?)"
        ss = max(0.0, sp["src_in"] - 0.5)
        dur = sp["src_out"] + 0.5 - ss
        name = proxy_name(sp["i"], s)
        dst = os.path.join(ROOT, f"assets/footage/{name}.mp4")
        spec = json.dumps([src, ss, dur, s["frame"], s.get("cx")])
        stamp = dst + ".spec"
        if os.path.exists(dst) and os.path.exists(stamp) and open(stamp).read() == spec:
            print(f"skip {name} (proxy up to date)")
            continue
        if s["frame"] == "vert":
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an",
                 "-vf", f"{tonemap_vf(src)},scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,"
                        f"crop=1080:1920,fps=30", *ENC, dst])
        elif s["frame"] == "wide":
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an",
                 "-vf", f"{tonemap_vf(src)},scale=1080:608:flags=lanczos,setsar=1,fps=30", *ENC, dst])
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an",
                 "-vf", f"{tonemap_vf(src)},scale=270:480:force_original_aspect_ratio=increase,crop=270:480,"
                        "gblur=sigma=14:steps=3,eq=brightness=-0.26:saturation=0.45,scale=1080:1920:flags=bicubic,fps=30",
                 *ENC[:5], "22", *ENC[6:], dst.replace(".mp4", "-bg.mp4")])
        elif s["frame"] == "window45":
            W, H = [int(x) for x in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                    "stream=width,height", "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip().splitlines()[0].split(",")[:2]]
            cw = int(round(H * 0.8 / 2) * 2)
            tm = tonemap_vf(src)
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an",
                 "-vf", f"{tm},crop={cw}:{H}:'{cx_expr(s.get('cx', 0.5), W, cw, ss)}':0,scale=1080:1350:flags=lanczos,fps=30",
                 *ENC, dst])
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an",
                 "-vf", f"{tm},scale=270:480:force_original_aspect_ratio=increase,crop=270:480,gblur=sigma=10:steps=3,"
                        "eq=brightness=-0.32:saturation=0.3,scale=1080:1920:flags=bicubic,fps=30",
                 *ENC[:5], "22", *ENC[6:], dst.replace(".mp4", "-bg.mp4")])
        else:
            sw = 3414
            run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an",
                 "-vf", f"scale={sw}:1920:flags=lanczos,crop=1080:1920:'{cx_expr(s['cx'], sw, 1080, ss)}':0,fps=30",
                 *ENC, dst])
        open(stamp, "w").write(spec)
        print(f"ok {name} ({s['frame']}) src {sp['src_in']:.2f}-{sp['src_out']:.2f}")


def make_lines():
    """The coaches' lav audio, each window level-matched, butted end to end at its reel time."""
    inputs, chains = [], []
    tmp = os.path.join(ROOT, "assets/audio/_lines")
    os.makedirs(tmp, exist_ok=True)
    for k, l in enumerate(LINES):
        a, b = l["src"]
        sl = os.path.join(tmp, f"line{k}.wav")
        run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", src_path(l["clip"]),
             "-vn", "-ac", "1", "-ar", "48000", sl])
        meas = subprocess.run(["ffmpeg", "-nostdin", "-i", sl, "-af", "ebur128", "-f", "null", "-"],
                              capture_output=True, text=True).stderr
        lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", meas)[-1])
        gain = LINE_TARGET - lufs
        inputs += ["-i", sl]
        chains.append(f"[{k}:a]highpass=f=70,volume={gain:.2f}dB,afade=t=in:d=0.03,afade=t=out:st={b - a - 0.06:.3f}:d=0.06,"
                      f"adelay={int(round(l['at'] * 1000))}:all=1[l{k}]")
        print(f"   line {k} {l['clip']} {a}-{b}: {lufs:.1f} LUFS -> gain {gain:+.1f} dB at reel {l['at']:.3f}")
    out = os.path.join(ROOT, "assets/audio/coach-lines.wav")
    fc = ";".join(chains) + ";" + "".join(f"[l{k}]" for k in range(len(LINES))) + \
        f"amix=inputs={len(LINES)}:normalize=0:duration=longest,apad=whole_dur={FOOT_END + 0.3:.3f}[out]"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[out]",
         "-t", f"{FOOT_END + 0.3:.3f}", "-ac", "1", "-ar", "48000", out])
    print(f"ok assets/audio/coach-lines.wav ({dur_of(out):.2f}s)")


def make_bed():
    """full song for the opener, then the instrumental from BED_HIT (which lands on the title at reel 1.5)"""
    pre = 1.5
    out = os.path.join(ROOT, BED_FILE)
    # the stem drops out for ~0.2 s at 46.9 (a vocal-only beat in the song); it fell on a pause in Dred's line (reel
    # ~21.4) and left a dead spot, so 46.80-47.15 is replaced with the same beat one bar earlier (bar = 1.618 s)
    bar, h0, h1 = 1.618, 46.80, 47.15
    segs = [(0, BED_HIT - pre, BED_HIT), (1, BED_HIT, h0), (1, h0 - bar, h1 - bar), (1, h1, BED_HIT + 26)]
    chains = []
    for k, (inp, a, b) in enumerate(segs):
        chains.append(f"[{inp}:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,"
                      f"afade=t=out:st={b - a - 0.008:.3f}:d=0.008[s{k}]")
    fc = ";".join(chains) + ";" + "".join(f"[s{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[out]"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", os.path.join(ROOT, BED_SONG), "-i", os.path.join(ROOT, BED_STEM),
         "-filter_complex", fc, "-map", "[out]", "-ar", "48000", "-ac", "2", out])
    print(f"ok {BED_FILE} ({dur_of(out):.2f}s)")


def main():
    if "--media" in sys.argv or "--bed" in sys.argv:
        make_bed()
    if "--media" in sys.argv:
        make_media()
    if "--media" in sys.argv or "--lines" in sys.argv:
        make_lines()

    shots_html, slots = [], []
    for sp, s in zip(spans(), SHOTS):
        i, name = sp["i"], proxy_name(sp["i"], s)
        src = f"assets/footage/{name}.mp4"
        ms = sp["src_in"] - max(0.0, sp["src_in"] - 0.5)
        d = sp["end"] - sp["start"]
        assert ms + d <= dur_of(os.path.join(ROOT, src)) + 0.01, f"shot {i} runs past its proxy"
        win = s["frame"] in ("window45", "wide")
        bg = (f'<video id="vb{i}" class="clip bgv" src="assets/footage/{name}-bg.mp4" data-start="{sp["start"]:.3f}" '
              f'data-duration="{d:.3f}" data-media-start="{ms:.3f}" data-track-index="{20 + i % 2}" '
              f'muted playsinline></video>') if win else ""
        shots_html.append(
            f'      <!-- {s["clip"]} src {sp["src_in"]:.2f}-{sp["src_out"]:.2f}: {html.escape(s["what"])} -->\n'
            f'      <div class="shot{" win" if s["frame"] == "window45" else ""}{" win wide" if s["frame"] == "wide" else ""}" id="w{i}">{bg}<div class="push" data-layout-allow-overflow="">'
            f'<video data-color-grading="{esc(GRADE)}" id="v{i}" class="clip" src="{src}" '
            f'data-start="{sp["start"]:.3f}" data-duration="{d:.3f}" data-media-start="{ms:.3f}" '
            f'data-track-index="{i % 2}" muted playsinline></video></div></div>')
        slots.append({"a": round(s["at"], 3), "s": sp["start"], "b": sp["end"], "tx": s["tx"], "lead": sp["lead"],
                      "win": win, "head": False})

    chips_html = []
    for n, c in enumerate(CHIPS):
        chips_html.append(
            f'      <div id="t-chip{n}" class="clip layer" data-start="{c["at"]:.3f}" data-duration="{c["out"] - c["at"]:.3f}" '
            f'data-track-index="{4 + n % 2}"><div class="chip" id="chip{n}-box">'
            f'<span class="nm" id="chip{n}-nm" data-layout-allow-overflow="">{html.escape(c["name"])}</span>'
            f'<span class="tm {c["kind"]}" id="chip{n}-tm" data-layout-allow-overflow="">{html.escape(c["team"])}</span></div></div>')

    caps_html, cap_t = [], []
    for n, (clip, a, b, text) in enumerate(CAPS):
        ra, rb = reel_of(clip, a), reel_of(clip, b)
        cap_t.append([ra, rb])
        caps_html.append(
            f'      <div id="t-cap{n}" class="clip layer" data-start="{ra:.3f}" data-duration="{rb - ra:.3f}" '
            f'data-track-index="{7 + n % 2}"><div class="cap"><span id="cap{n}" data-layout-allow-overflow="">'
            f'{html.escape(text)}</span></div></div>')

    # P's three windows butt end to end (3.00-9.95): merge touching windows first, or the gate's fade points overlap
    # and go out of time order (v1 render played 4.1-8.0 about 10 dB down)
    merged = []
    for a, b in VOICE:
        if merged and a - merged[-1][1] < 0.3:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    lines_dur = FOOT_END + 0.3
    R = 0.06
    pts = [{"t": 0, "v": 0}]
    for a, b in merged:
        pts += [{"t": round(max(0, a - R), 3), "v": 0}, {"t": round(a, 3), "v": 1}, {"t": round(b, 3), "v": 1},
                {"t": round(b + R, 3), "v": 0}]
    pts.append({"t": lines_dur, "v": 0})
    assert all(p["t"] <= q["t"] for p, q in zip(pts, pts[1:])), "lines lane out of order"
    lines_auto = {"version": 1, "lanes": [{"target": "volume", "points": pts}]}
    # bed: full under opener/title, the night bridge and the CTA; 20% under the coaches; out as the hook lands
    bp = [{"t": 0, "v": 0}, {"t": 0.05, "v": BED_VOL}]
    for a, b in merged:
        bp += [{"t": round(a - 0.12, 3), "v": BED_VOL}, {"t": round(a + 0.05, 3), "v": BED_VOL * BED_DUCK},
               {"t": round(b - 0.05, 3), "v": BED_VOL * BED_DUCK}, {"t": round(b + 0.2, 3), "v": BED_VOL}]
    # the coaches run right up to the end tag now: drop any "back up to full" point that lands past the tag
    bp = [p for p in bp if p["t"] < END - 0.3]
    bp += [{"t": round(END - 0.25, 3), "v": bp[-1]["v"]}, {"t": round(END - 0.02, 3), "v": 0}, {"t": round(END, 3), "v": 0}]
    assert all(p["t"] <= q["t"] for p, q in zip(bp, bp[1:])), "bed lane out of order"
    bed_auto = {"version": 1, "lanes": [{"target": "volume", "points": bp}]}
    hook_at = END - HOOK_LEAD
    hook_len = TOTAL - hook_at
    hook_auto = {"version": 1, "lanes": [{"target": "volume", "points": [
        {"t": 0, "v": 0}, {"t": 0.08, "v": HOOK_VOL}, {"t": hook_len - 0.6, "v": HOOK_VOL}, {"t": hook_len, "v": 0}]}]}
    rep = {
        "%TOTAL%": f"{TOTAL}", "%END%": f"{END}", "%END_DUR%": f"{END_LEN:.3f}",
        "%END2%": f"{END2}", "%END2_DUR%": f"{DB_LEN:.3f}",
        "%FOOT_END%": f"{FOOT_END}", "%CTA_DUR%": f"{CTA_LEN:.3f}",
        "%SHOTS%": "\n".join(shots_html), "%CHIPS%": "\n".join(chips_html), "%CAPS%": "\n".join(caps_html),
        "%SLOTS%": json.dumps(slots), "%CHIP_T%": json.dumps([[c["at"], c["out"]] for c in CHIPS]),
        "%CAP_T%": json.dumps(cap_t), "%WIPE%": f"{WIPE}",
        "%LINES_DUR%": f"{lines_dur:.3f}", "%LINES_AUTO%": esc(lines_auto),
        "%BED_SRC%": BED_FILE, "%BED_IN%": f"{BED_AT0}", "%BED_DUR%": f"{END:.3f}", "%BED_AUTO%": esc(bed_auto),
        "%HOOK_FILE%": HOOK_FILE, "%HOOK_IN%": f"{HOOK_SRC}", "%HOOK_AT%": f"{hook_at:.3f}", "%HOOK_DUR%": f"{hook_len:.3f}",
        "%HOOK_AUTO%": esc(hook_auto),
        "%TITLE_AT%": f"{TITLE['at']}", "%TITLE_OUT%": f"{TITLE['out']}", "%TITLE_DUR%": f"{TITLE['out'] - TITLE['at']:.3f}",
    }
    page = TEMPLATE
    for k, v in rep.items():
        page = page.replace(k, v)
    left = re.findall(r"%[A-Z0-9_]+%", page)
    assert not left, f"unreplaced {left}"
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    print(f"wrote index.html: footage out {FOOT_END}, end tag {END}, total {TOTAL}s")
    for sp, s in zip(spans(), SHOTS):
        print(f"  {sp['start']:6.2f}-{sp['end']:6.2f} (full {s['at']:5.2f}) {s['clip']} src {sp['src_in']:6.2f}-{sp['src_out']:6.2f} "
              f"{s['frame']:8s} {s['tx']:4s} {s['what']}")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-Book.otf"); font-weight: 400; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-Bold.otf"); font-weight: 700; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-BoldItalic.otf"); font-weight: 700; font-style: italic; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-Black.otf"); font-weight: 900; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-BlackItalic.otf"); font-weight: 900; font-style: italic; }
      :root { --ink: #0a0a0a; --red: #e81d1d; --bone: #f6f2ec; --steel: #b8b2a8; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: var(--ink); }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink); font-family: "NORD", sans-serif; }

      .shot { position: absolute; inset: 0; overflow: hidden; will-change: transform, filter, opacity; }
      .shot .push { position: absolute; inset: 0; will-change: transform; }
      .shot video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .shot.win .push { inset: auto; left: 0; top: 285px; width: 1080px; height: 1350px; box-shadow: 0 -18px 40px rgba(10,10,10,0.55), 0 18px 40px rgba(10,10,10,0.55); }
      .shot.win.wide .push { top: 656px; height: 608px; }
      .wipebar { position: absolute; top: 0; left: 0; width: 34px; height: 1920px; background: var(--red); box-shadow: 0 0 0 6px var(--ink); opacity: 0; }
      .vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 70% at 50% 45%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.5) 100%); }
      .layer { position: absolute; inset: 0; }

      /* title: BLACK TEAM vs RED TEAM over the darkened opener */
      .shade { position: absolute; inset: 0; background: rgba(10, 10, 10, 0.55); opacity: 0; }
      .title { position: absolute; left: 0; right: 0; top: 560px; text-align: center; }
      .title .eye { display: inline-block; color: var(--bone); font-weight: 700; font-size: 34px; letter-spacing: 0.3em; text-transform: uppercase; }
      .title .t { display: block; width: max-content; margin: 26px auto 0; font-weight: 900; font-style: italic; font-size: 124px; line-height: 1.04; text-transform: uppercase; white-space: nowrap; padding: 6px 40px 16px; transform: skewX(-6deg); }
      .title .bk { background: var(--ink); color: var(--bone); box-shadow: 12px 12px 0 var(--bone); }
      .title .rd { background: var(--red); color: var(--bone); box-shadow: 12px 12px 0 var(--ink); }
      .title .vs { display: block; margin: 22px auto 0; color: var(--bone); font-weight: 900; font-style: italic; font-size: 84px; line-height: 1.04; }

      /* coach chip: name + team tag, lower band above the captions */
      .chip { position: absolute; left: 56px; top: 1130px; transform: skewX(-6deg); transform-origin: left top; white-space: nowrap; }
      .chip .nm { display: inline-block; vertical-align: top; background: var(--bone); color: var(--ink); font-weight: 900; font-style: italic; font-size: 52px; line-height: 1.08; letter-spacing: 0.02em; text-transform: uppercase; padding: 8px 24px 12px; }
      .chip .tm { display: inline-block; vertical-align: top; font-weight: 900; font-style: italic; font-size: 52px; line-height: 1.08; letter-spacing: 0.02em; text-transform: uppercase; padding: 8px 24px 12px; }
      .chip .tm.black { background: var(--ink); color: var(--bone); box-shadow: 8px 8px 0 var(--bone); }
      .chip .tm.red { background: var(--red); color: var(--bone); box-shadow: 8px 8px 0 var(--ink); }

      /* captions: the coach's exact words, one phrase at a time */
      .cap { position: absolute; left: 60px; right: 60px; top: 1290px; text-align: center; }
      .cap span { display: inline-block; max-width: 960px; color: var(--bone); font-weight: 900; font-style: italic; font-size: 70px; line-height: 1.08; text-transform: uppercase; background: rgba(10,10,10,0.78); padding: 8px 26px 14px; box-shadow: 8px 8px 0 var(--red); }

      /* THAT NIGHT bridge */
      .night { position: absolute; left: 0; right: 0; top: 800px; text-align: center; }
      .night .t { display: inline-block; color: var(--bone); background: var(--ink); font-weight: 900; font-style: italic; font-size: 132px; line-height: 1.04; text-transform: uppercase; padding: 6px 40px 16px; box-shadow: 12px 12px 0 var(--red); transform: skewX(-6deg); }

      /* CTA card */
      .card { position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .cta .eye { color: var(--steel); font-weight: 700; font-size: 34px; letter-spacing: 0.3em; text-transform: uppercase; }
      .cta .t { display: block; width: max-content; margin: 26px auto 0; font-weight: 900; font-style: italic; font-size: 110px; line-height: 1.04; text-transform: uppercase; white-space: nowrap; padding: 6px 36px 14px; transform: skewX(-6deg); }
      .cta .bk { background: var(--bone); color: var(--ink); box-shadow: 10px 10px 0 var(--red); }
      .cta .rd { background: var(--red); color: var(--bone); box-shadow: 10px 10px 0 var(--bone); }
      .cta .vs { display: block; margin: 18px auto 0; color: var(--bone); font-weight: 900; font-style: italic; font-size: 70px; line-height: 1.04; }
      .cta .fd { display: block; margin-top: 90px; color: var(--bone); font-weight: 900; font-style: italic; font-size: 96px; line-height: 1.04; letter-spacing: 0.02em; text-transform: uppercase; }
      .cta .dt { display: inline-block; margin-top: 18px; color: var(--red); font-weight: 900; font-size: 52px; line-height: 1.1; letter-spacing: 0.14em; text-transform: uppercase; }

      /* end tag */
      /* Blue Collar end tag: circular logo, Fight Day date */
      .end img { display: block; width: 600px; height: 600px; object-fit: cover; clip-path: circle(49.5% at 50% 50%); }
      .end .fd { display: block; margin-top: 64px; color: var(--bone); font-weight: 900; font-style: italic; font-size: 112px; line-height: 1.04; letter-spacing: 0.02em; text-transform: uppercase; }
      .end .dt { display: inline-block; margin-top: 20px; color: var(--red); font-weight: 900; font-size: 56px; line-height: 1.1; letter-spacing: 0.14em; text-transform: uppercase; }
      /* DB tag, after the Blue Collar tag */
      .dbt img { display: block; width: 560px; height: 560px; object-fit: contain; }
      .dbt .lock { display: block; width: 820px; height: auto; margin-top: 56px; }
      .dbt .h { display: block; margin-top: 54px; font-weight: 400; font-size: 36px; letter-spacing: 0.2em; color: var(--steel); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%TOTAL%" data-width="1080" data-height="1920">

      <!-- ─── footage: Coach Ali's kids, Sat 10/18 ─── -->
%SHOTS%
      <div class="vig"></div>
      <div class="wipebar" id="wipebar"></div>

      <!-- ─── title (over the opener) ─── -->
      <div id="t-title" class="clip layer" data-start="%TITLE_AT%" data-duration="%TITLE_DUR%" data-track-index="2">
        <div class="shade" id="title-shade"></div>
        <div class="title" id="title-box">
          <span class="eye" id="title-eye" data-layout-allow-overflow="">Blue Collar Boxing</span>
          <span class="t bk" id="title-bk" data-layout-allow-overflow="">Youth</span>
          <span class="t rd" id="title-rd" data-layout-allow-overflow="">Fight camp</span>
        </div>
      </div>

      <!-- ─── coach chips ─── -->
%CHIPS%


      <!-- ─── captions: the coaches' exact words ─── -->
%CAPS%

      <!-- ─── end tag ─── -->
      <div id="t-end" class="clip layer" data-start="%END%" data-duration="%END_DUR%" data-track-index="9">
        <div class="card end">
          <img id="end-logo" src="assets/brand/blue-collar-logo.jpg" alt="Blue Collar Boxing">
          <span class="fd" id="end-fd" data-layout-allow-overflow="">Fight Day</span>
          <span class="dt" id="end-dt" data-layout-allow-overflow="">Sunday &middot; Nov 22</span>
        </div>
      </div>

      <!-- ─── DB tag (picture only; the Blue Collar song keeps playing) ─── -->
      <div id="t-db" class="clip layer" data-start="%END2%" data-duration="%END2_DUR%" data-track-index="17">
        <div class="card dbt">
          <img id="db-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <img class="lock" id="db-lock" src="assets/brand/lockup-absolutely-different-white.png" alt="What we do is absolutely different">
          <span class="h" id="db-h">@DBELITEFITNESS</span>
        </div>
      </div>

      <!-- ─── audio: Blue Collar Heavy bed, Coach Ali's callouts, Fight time hook on the Blue Collar tag ─── -->
      <audio id="a-bed" src="%BED_SRC%" data-start="0" data-duration="%BED_DUR%" data-media-start="%BED_IN%" data-track-index="12" data-volume="1" data-automation="%BED_AUTO%"></audio>
      <audio id="a-lines" src="assets/audio/coach-lines.wav" data-start="0" data-duration="%LINES_DUR%" data-media-start="0" data-track-index="10" data-volume="1" data-automation="%LINES_AUTO%"></audio>
      <audio id="a-hook" src="%HOOK_FILE%" data-start="%HOOK_AT%" data-duration="%HOOK_DUR%" data-media-start="%HOOK_IN%" data-track-index="11" data-volume="1" data-automation="%HOOK_AUTO%"></audio>
    </div>

    <script>
      // Blue Collar Boxing: Youth (generated by build/build.py, do not hand-edit).
      const SLOTS = %SLOTS%;
      const CHIP_T = %CHIP_T%;
      const CAP_T = %CAP_T%;
      const WIPE = %WIPE%;

      const tl = gsap.timeline({ paused: true });
      tl.set(".shot", { x: 0, y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px) brightness(1)" }, 0);
      tl.set("#wipebar", { x: 1080, opacity: 0 }, 0);

      SLOTS.forEach((s, i) => {
        const w = "#w" + i;
        const p = w + " .push";
        const d = s.b - s.s;
        if (s.win) {
          tl.set(w, { visibility: "hidden" }, 0);
          tl.set(w, { visibility: "visible" }, s.s);
          tl.set(w, { visibility: "hidden" }, s.b);
        }
        // light push only (no over-zoom on Adrian's landscape camera); talking heads barely move
        const P = s.head ? [1.0, 1.02] : [1.0, 1.04];
        tl.fromTo(p, { scale: P[0] }, { scale: P[1], duration: d, ease: "none", immediateRender: false }, s.s);
        if (i === 0) return;
        if (s.tx === "xf") {
          tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: s.lead, ease: "power1.inOut", immediateRender: false }, s.s);
        } else if (s.tx === "wipe") {
          tl.fromTo(w, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: WIPE, ease: "power3.inOut", immediateRender: false }, s.s);
          tl.fromTo("#wipebar", { x: 1080, opacity: 1 }, { x: -34, opacity: 1, duration: WIPE, ease: "power3.inOut", immediateRender: false }, s.s);
          tl.set("#wipebar", { opacity: 0 }, s.a + 0.01);
        } else if (s.tx === "whip") {
          const dir = i % 2 ? 1 : -1;
          tl.fromTo("#w" + (i - 1), { x: 0, filter: "blur(0px) brightness(1)" }, { x: -1080 * dir, filter: "blur(24px) brightness(1)", duration: 0.14, ease: "power3.in", immediateRender: false }, s.a - 0.14);
          tl.fromTo(w, { x: 1080 * dir, filter: "blur(24px) brightness(1)" }, { x: 0, filter: "blur(0px) brightness(1)", duration: 0.18, ease: "power3.out", immediateRender: false }, s.a);
        } else {
          tl.fromTo(w, { filter: "blur(0px) brightness(1.4)" }, { filter: "blur(0px) brightness(1)", duration: 0.2, ease: "power2.out", immediateRender: false }, s.a);
        }
      });

      // ── title: eyebrow, BLACK TEAM slams from the left, VS pops, RED TEAM slams from the right; whip out ──
      tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.12 }, %TITLE_AT%);
      tl.fromTo("#title-eye", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.2, ease: "power3.out" }, %TITLE_AT%);
      tl.fromTo("#title-bk", { x: -900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.22, ease: "expo.out" }, %TITLE_AT% + 0.04);
      tl.fromTo("#title-rd", { x: 900, opacity: 0 }, { x: 0, opacity: 1, duration: 0.22, ease: "expo.out" }, %TITLE_AT% + 0.26);
      tl.fromTo("#title-box", { x: 0, opacity: 1, filter: "blur(0px)" }, { x: -1080, opacity: 1, filter: "blur(22px)", duration: 0.16, ease: "power3.in" }, %TITLE_OUT% - 0.16);
      tl.to("#title-shade", { opacity: 0, duration: 0.16, ease: "none" }, %TITLE_OUT% - 0.16);

      // ── coach chips ──
      CHIP_T.forEach(([a, b], n) => {
        const id = "#chip" + n;
        tl.fromTo(id + "-nm", { x: -600, opacity: 0 }, { x: 0, opacity: 1, duration: 0.24, ease: "expo.out" }, a);
        tl.fromTo(id + "-tm", { x: -300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.24, ease: "expo.out" }, a + 0.12);
        tl.fromTo(id + "-box", { x: 0, opacity: 1 }, { x: -1100, opacity: 1, duration: 0.16, ease: "power3.in" }, b - 0.16);
      });

      // ── captions: each phrase pops in on its first word ──
      CAP_T.forEach(([a, b], n) => {
        tl.fromTo("#cap" + n, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.08, ease: "power2.out" }, a);
      });


      // ── CTA: the two teams stack, then the date lands ──

      // ── end tag ──
      tl.fromTo("#end-logo", { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" }, %END% + 0.02);
      // "Fight time" -> FIGHT DAY slams; "Fight time" again (~1.7) -> the date
      tl.fromTo("#end-fd", { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(1.8)" }, %END% + 0.56);
      tl.fromTo("#end-dt", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24, ease: "power3.out" }, %END% + 1.68);
      tl.fromTo("#db-logo", { scale: 0.86, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, %END2% + 0.03);
      tl.fromTo("#db-lock", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, %END2% + 0.3);
      tl.fromTo("#db-h", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, %END2% + 0.55);
      tl.to("#t-db .card", { opacity: 0, duration: 0.3, ease: "none" }, %TOTAL% - 0.32);

      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""

if __name__ == "__main__":
    main()
