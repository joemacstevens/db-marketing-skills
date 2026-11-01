#!/usr/bin/env python3
"""DB reel END TAG v2, the "slam" tag (Joey 10/28: "too polished ... go into a slam thing to match the music").

Black gritty card, the hook of DB's own song ("Different Breed.mp3", the "We are Different Breed" chorus) drives it:

  tag frame  2  WE         slams on the sung "We"      (stop-time: the band drops out for "We ... are")
  tag frame 12  ARE        slams on "are"
  tag frame 25  DIFFERENT  slams on the BOOM (drum hit + "Dif-"): big frame jolt, scale punch, 4-frame red flash
  tag frame 50  BREED.     (red) slams on "Breed"
  tag frame 90  smash cut on the downbeat (band back in): DB logo cuts on with a jolt + scale punch
  tag frame 94+ "What we do is / ABSOLUTELY DIFFERENT." fades up under the logo, then @dbelitefitness
  tag 5.00 s    end. Under the logo the song crossfades to its instrumental stem (no second "We are" sung under the
                tagline) and radio-fades to the end.

Use from any project build.py (see README.md):

  import sys; sys.path.insert(0, "<worktree>/hyperframes/_end-tag-v2"); import endtag_v2 as et2
  et2.install(ROOT)                                   # copies the tail stem, grain, logo, song into assets/
  tag_html, tag_s, hook_at_end = et2.end_tag_v2(A, END)  # appends "kf" anims to A
  TOTAL = END + tag_s
  audio += et2.hook_audio(END, pre=0.55)              # replaces the old a-hook element
  page = et2.patch_page(page)                         # after the template substitution, before writing index.html

Timing is locked to the house hook alignment every DB reel already uses (song 48.80 at END - 0.08, i.e. song 48.88 at
END, 0.55 s fade-in under the closer), so swapping end_tag() for this leaves everything before END untouched.
"""
import html
import json
import os
import random
import shutil

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
F = 1 / FPS

# ---- audio --------------------------------------------------------------------------------------------------------
SONG = "assets/audio/song-different-breed.mp3"      # == main checkout music/Different Breed.mp3 (48 kHz stereo)
TAIL = "assets/audio/song-endtag-v2-tail.wav"       # instrumental stem, song 51.50-54.30 (see README "Stems")
SONG_SRC, SONG_LEAD = 48.80, 0.08                   # house alignment: song 48.80 plays at END - 0.08 ...
SONG_AT_END = round(SONG_SRC + SONG_LEAD, 3)        # ... so song 48.88 plays at tag frame 0
TAIL_T0 = 51.50                                     # song time at tail-file 0 (sample-aligned to the mix, lag 1/48k)

# Measured hook, song seconds (ElevenLabs two-stem split of 40-60 s, stems lag the mix by 1105 samples @ 44.1k and
# are corrected here; whisper medium.en + Parakeet on the vocal stem, pitch / spectral tilt for syllable edges, RMS +
# onsets on the instrumental stem). Both engines hear "Breed" as "please"/"bleed": it is "We are Different Breed".
HOOK = {
    "hey": 48.395,       # held ad-lib on the beat before "We"; the band stops here (stop-time)
    "we_w": 48.845,      # "We" acoustic onset (the /w/ glide)
    "we": 48.935,        # "We" vowel (p-centre; Parakeet word start, stem-corrected)
    "are": 49.295,       # "are" onset (vowel, sharp)
    "boom": 49.725,      # drum BOOM attack, band back in (small pickup flam 49.62-49.69)
    "dif": 49.750,       # "Dif-" /d/ burst, 25 ms after the boom
    "breed": 50.555,     # "Breed" release of the /b/ (held to ~51.42, gone by 51.66)
    "downbeat": 51.880,  # next bar's downbeat, band full
    "we2": 52.255,       # second "We are Different Breed" starts: must not be heard under the tagline
    "boom2": 53.155,     # its boom
}
XFADE = (51.74, 51.82)      # song -> instrumental tail (song time): after "Breed" has rung out, before the downbeat
TAIL_OUT = (52.60, 53.86)   # instrumental fade-out (song time): a radio fade through boom2 (-5 dB by then) to the end

# ---- picture ------------------------------------------------------------------------------------------------------
DUR = 5.0                   # tag length, seconds (the tagline gets ~1.9 s, the downbeat logo needs 3.0)
N = round(DUR * FPS)        # 150 frames
# impact frame (tag frame whose 1/30 s contains the onset; WE uses the vowel since "We" opens on a glide)
HIT = {"we": 2, "are": 12, "dif": 25, "breed": 50, "logo": 90}
SWITCH = HIT["logo"]        # words -> logo smash cut
TL1, TL2, HANDLE = 94, 98, 104   # tagline line 1 / line 2 / handle start frames (fade + 30 px rise, kit §8)
SAFE_TOP, SAFE_BOTTOM = 250, 340


def _check_hits():
    for k, key in (("we", "we"), ("are", "are"), ("dif", "boom"), ("breed", "breed"), ("logo", "downbeat")):
        f = (HOOK[key] - SONG_AT_END) * FPS
        assert abs(f - HIT[k]) < 1.0, (k, f, HIT[k])


_check_hits()


# ---- per-frame curves (every animated property is a pure function of the tag frame) -------------------------------
class _Tracks:
    def __init__(self):
        self.t = {}

    def prop(self, sel, name, init):
        return self.t.setdefault(sel, {}).setdefault(name, [init] * N)


def _slam(T, sel, hit, k=3, s0=1.5, blur=9):
    """giant ghost -> settles to 1.0 exactly on `hit` (ease-in, accelerating into the surface)"""
    op, sc, fl = T.prop(sel, "opacity", 0), T.prop(sel, "scale", s0), T.prop(sel, "filter", "blur(0px)")
    for f in range(N):
        if f < hit - k:
            op[f], sc[f], fl[f] = 0, s0, "blur(0px)"
        elif f < hit:
            p = (f - (hit - k)) / k
            op[f], sc[f], fl[f] = round(0.35 + 0.5 * p, 3), round(s0 + (1 - s0) * p * p, 4), f"blur({blur * (1 - p):.1f}px)"
        else:
            op[f], sc[f], fl[f] = 1, 1, "blur(0px)"


SHAKE = [(1, -0.7), (-0.75, 0.55), (0.4, -0.3), (-0.15, 0.1)]       # diagonal jolt (the template's slam shake, scaled)
STOMP = [(0.25, 1), (-0.2, -0.7), (0.1, 0.35), (0, -0.12)]       # mostly vertical: the full-width lines never crop


def _jolt(T, sel, hit, a, pattern=SHAKE):
    x, y = T.prop(sel, "x", 0), T.prop(sel, "y", 0)
    for i, (px, py) in enumerate(pattern):
        if hit + i < N:
            x[hit + i] = round(x[hit + i] + a * px, 2)
            y[hit + i] = round(y[hit + i] + a * py, 2)


def _punch(T, sel, hit, s):
    sc = T.prop(sel, "scale", 1)
    for i, k in enumerate([1, 0.55, 0.25, 0.08]):
        if hit + i < N:
            sc[hit + i] = round(sc[hit + i] * (1 + (s - 1) * k), 4)


def _flash(T, sel, hit, levels=(0.85, 0.5, 0.22, 0.08)):
    op = T.prop(sel, "opacity", 0)
    for i, v in enumerate(levels):
        op[hit + i] = v


def _rise(T, sel, start, n=8, rise=30):
    """kit §8 connector motion: fade + rise 30 px over 8 frames, power2.out"""
    op, y = T.prop(sel, "opacity", 0), T.prop(sel, "y", rise)
    for f in range(N):
        p = min(max((f - start) / n, 0), 1)
        e = 1 - (1 - p) ** 2
        op[f], y[f] = round(e, 3), round(rise * (1 - e), 2)


def _fade(T, sel, start, n=6):
    op = T.prop(sel, "opacity", 0)
    for f in range(N):
        op[f] = round(min(max((f - start) / n, 0), 1), 3)


def _tracks():
    T = _Tracks()
    # phase 1: WE / ARE / DIFFERENT / BREED.
    _slam(T, "#et2-we", HIT["we"], k=2)              # the card opens mid-slam: "We" is sung 2 frames in
    _slam(T, "#et2-are", HIT["are"])
    _slam(T, "#et2-dif", HIT["dif"], k=4, s0=1.6, blur=12)
    _slam(T, "#et2-breed", HIT["breed"], k=4, s0=1.6, blur=12)
    for sel, hit, a in (("#et2-stack", HIT["we"], 10), ("#et2-stack", HIT["are"], 12)):
        _jolt(T, sel, hit, a)
    _jolt(T, "#et2-stack", HIT["dif"], 36, STOMP)     # THE BOOM
    _punch(T, "#et2-stack", HIT["dif"], 1.06)
    _flash(T, "#et2-flash", HIT["dif"])
    _jolt(T, "#et2-stack", HIT["breed"], 22, STOMP)
    _punch(T, "#et2-stack", HIT["breed"], 1.035)
    # phase 2: logo cuts on with the downbeat, tagline fades up under it
    _jolt(T, "#et2-p2s", SWITCH, 24)
    _punch(T, "#et2-p2s", SWITCH, 1.10)
    _rise(T, "#et2-tl1", TL1)
    _rise(T, "#et2-tl2", TL2)
    _fade(T, "#et2-h", HANDLE)
    # grain: a fresh random offset every frame (seeded, so every render is identical)
    rnd = random.Random(1028)
    gx, gy = T.prop("#et2-grain", "x", 0), T.prop("#et2-grain", "y", 0)
    for f in range(N):
        gx[f], gy[f] = rnd.randrange(0, 512), rnd.randrange(0, 512)
    return T.t


def _anims(END):
    """one GSAP keyframes tween per element (values per frame, linear between), starting at END. Trailing frames that
    no longer change are trimmed; the last value holds."""
    out = []
    for sel, props in _tracks().items():
        last = 0
        for vals in props.values():
            for f in range(N - 1, 0, -1):
                if vals[f] != vals[f - 1]:
                    last = max(last, f)
                    break
        last = max(last, 1)
        out.append({"sel": sel, "kind": "kf", "t": round(END, 4), "d": round(last * F, 5),
                    "kf": {k: v[:last + 1] for k, v in props.items()}})
    return out


# ---- markup -------------------------------------------------------------------------------------------------------
CSS = """
      /* end tag v2 (hyperframes/_end-tag-v2/endtag_v2.py) */
      .et2-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 90% 62% at 50% 46%, #131313 0%, #0b0b0b 58%, #040404 100%); }
      .et2-flash { position: absolute; inset: 0; background: var(--accent); opacity: 0; }
      .et2-grain { position: absolute; left: -512px; top: -512px; width: 2104px; height: 2944px; background-image: url("assets/brand/et2-grain.png"); background-size: 512px 512px; opacity: 0.10; }
      .et2-zone { position: absolute; left: 0; width: 1080px; top: 250px; height: 1330px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .et2-stack { display: flex; flex-direction: column; align-items: center; }
      .et2-w { display: inline-block; opacity: 0; }
      .et2-h { position: absolute; left: 0; width: 1080px; top: 1500px; display: flex; justify-content: center; align-items: center; gap: 20px; opacity: 0; }
"""

KF_JS = """const el = m.sel;
          if (m.kind === "kf") {
            // end tag v2: per-frame keyframes (values evenly spaced at 1/30 s, linear between), see _end-tag-v2
            tl.to(el, { keyframes: Object.assign({ easeEach: "none" }, m.kf), duration: m.d, ease: "none" }, m.t);
            return;
          }"""


def _pw(id_, inner, wdth, track, lh, size, mx, red=False, extra=""):
    return (f'<div class="pw fit{" red" if red else ""}" id="{id_}" data-size="{size}" data-max="{mx}" '
            f'style="font-stretch:{wdth}%;letter-spacing:{track}em;line-height:{lh};{extra}" '
            f'data-layout-allow-overflow="">{inner}</div>')


def _w(id_, text):
    return f'<span class="et2-w" id="{id_}" data-layout-allow-overflow="">{html.escape(text)}</span>'


def end_tag_v2(A, END, track=10):
    """Append this tag's anim entries ("kf" kind, needs patch_page) to A and return (html, seconds, hook_media_start).

    html: four clip layers (bg + flash, words, logo + tagline, grain) on tracks track..track+3, END -> END + seconds.
    seconds: the tag length (5.0): TOTAL = END + seconds.
    hook_media_start: song time that must be playing at END (48.88). hook_audio() builds exactly that.
    """
    s = round(SWITCH * F, 4)
    words = f'''<div class="et2-zone"><div class="et2-stack" id="et2-stack" data-layout-allow-overflow="">
          {_pw("et2-l1", _w("et2-we", "WE") + " " + _w("et2-are", "ARE"), 125, -0.01, 0.86, 220, 840)}
          {_pw("et2-l2", _w("et2-dif", "DIFFERENT"), 62, -0.02, 0.84, 340, 980, extra="margin-top:22px")}
          {_pw("et2-l3", _w("et2-breed", "BREED."), 96, -0.015, 0.86, 320, 980, red=True, extra="margin-top:22px")}
        </div></div>'''
    logo = f'''<div class="et2-zone" style="justify-content:flex-start;padding-top:170px"><div class="et2-stack" id="et2-p2s" data-layout-allow-overflow="">
          <img id="et2-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness" style="width:620px;height:620px;object-fit:contain">
          <span class="cn" id="et2-tl1" style="font-size:118px;margin-top:44px;opacity:0">What we do is</span>
          {_pw("et2-tl2", "ABSOLUTELY DIFFERENT.", 62, -0.02, 0.86, 140, 900, extra="margin-top:16px;opacity:0")}
        </div></div>
        <div class="et2-h" id="et2-h"><span class="rl" style="width:64px;height:4px"></span><span class="tag" style="font-size:30px;letter-spacing:0.14em;text-transform:none;color:rgba(255,255,255,0.85)">@dbelitefitness</span></div>'''
    layers = [
        (f"t-et2-bg", END, DUR, '<div class="et2-bg"></div><div class="et2-flash" id="et2-flash"></div>'),
        (f"t-et2-words", END, s, words),
        (f"t-et2-logo", END + s, DUR - s, logo),
        (f"t-et2-grain", END, DUR, '<div class="et2-grain" id="et2-grain" data-layout-allow-overflow=""></div>'),
    ]
    body = "\n".join(
        f'      <div id="{id_}" class="clip layer" data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="{track + i}">{h}</div>'
        for i, (id_, a, d, h) in enumerate(layers))
    A.extend(_anims(END))
    return body, DUR, SONG_AT_END


def _esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def hook_audio(END, pre=0.55, track=31, song=SONG, tail=TAIL):
    """The two <audio> elements for the tag. The song element is the old a-hook exactly up to END (same src, start,
    media-start and fade-in points as every v1 end card), then crossfades to the instrumental tail."""
    start = round(END - SONG_LEAD - pre, 3)
    rel = lambda song_t: round(END + (song_t - SONG_AT_END) - start, 3)   # song time -> seconds into the song element
    song_d = rel(XFADE[1])
    song_pts = [{"t": 0, "v": 0}, {"t": round(pre * 0.8, 3), "v": 0.6}, {"t": pre, "v": 1.0},
                {"t": rel(XFADE[0]), "v": 1.0}, {"t": song_d, "v": 0}]
    t_start = round(END + XFADE[0] - SONG_AT_END, 3)
    t_d = round(END + DUR - t_start, 3)
    tr = lambda song_t: round(song_t - XFADE[0], 3)
    tail_pts = [{"t": 0, "v": 0}, {"t": tr(XFADE[1]), "v": 1.0}, {"t": tr(TAIL_OUT[0]), "v": 1.0},
                {"t": tr(TAIL_OUT[1]), "v": 0}, {"t": t_d, "v": 0}]
    return "\n".join([
        f'      <audio id="a-hook" src="{song}" data-start="{start:.3f}" data-duration="{song_d:.3f}" data-media-start="{SONG_SRC - pre:.2f}" '
        f'data-track-index="{track}" data-volume="1" data-automation="{_esc({"version": 1, "lanes": [{"target": "volume", "points": song_pts}]})}"></audio>',
        f'      <audio id="a-hook-tail" src="{tail}" data-start="{t_start:.3f}" data-duration="{t_d:.3f}" data-media-start="{XFADE[0] - TAIL_T0:.3f}" '
        f'data-track-index="{track + 1}" data-volume="1" data-automation="{_esc({"version": 1, "lanes": [{"target": "volume", "points": tail_pts}]})}"></audio>',
    ])


def patch_page(page):
    """Add the tag's CSS and the "kf" anim kind to a page built from the DB kit template (any build/template.html in
    hyperframes/ since 10/18 has both anchors)."""
    a, b = "</style>", "const el = m.sel;"
    assert page.count(b) == 1 and a in page, "template anchors not found: is this the DB kit template?"
    if "et2-bg" in page.split(a, 1)[0]:
        return page
    page = page.replace(a, CSS + "    " + a, 1)
    return page.replace(b, KF_JS, 1)


def install(root):
    """copy the tag's assets into a project (skips files already there)"""
    for rel in (TAIL, "assets/brand/et2-grain.png", "assets/brand/db-logo.png", SONG):
        dst = os.path.join(root, rel)
        if not os.path.exists(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(os.path.join(HERE, rel), dst)


def timing_report(END=0.0):
    """human-readable map of every hit (reel seconds / reel frame) for logs"""
    rows = []
    for k, key in (("we", "we"), ("are", "are"), ("dif", "boom"), ("breed", "breed"), ("logo", "downbeat")):
        sung = END + HOOK[key] - SONG_AT_END
        rows.append(f"{k:6s} sung {HOOK[key]:.3f} -> reel {sung:7.3f}  impact frame {round(END * FPS) + HIT[k]} "
                    f"({END + HIT[k] * F:7.3f}, {1000 * (END + HIT[k] * F - sung):+4.0f} ms)")
    return "\n".join(rows)


if __name__ == "__main__":
    print(timing_report())
