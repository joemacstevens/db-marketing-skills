#!/usr/bin/env python3
"""Write index.html for "Thank You, Different Breed" from build/cuts.json (run build/cut.py first).

Every segment plays back to back with hard cuts. Graphics land on the spoken word: GRAPHICS gives each one's
segment and the source time of its word (Parakeet, see build/words.py), converted here to composition time.
Sound is one pre-mixed file (build/mix.py: the voices over the ducked bed), so the video clips stay muted.
Numbers roll like an odometer (transform-only tweens, so any frame renders the same when seeked).
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1080, 1920
END_CARD = 2.47
TALLY_MAX = 177

# (kind, segment, source time of the word it lands on, options)
GRAPHICS = [
    ("down", "01b", 8.20, {"n": 5, "sub": "in 3 weeks", "tally": 5}),
    ("down", "02", 13.76, {"n": 15, "sub": "in under 2 months", "tally": 20}),
    ("strike", "03", (71.28, 72.96), {"old": 185, "n": 160, "lost": 25, "tally": 45}),
    ("tag", "04a", 4.72, {"text": "2 years ago"}),
    ("down", "04b", 10.82, {"n": 30, "sub": "in a year and a half", "tally": 75}),
    ("down", "05", 10.98, {"n": 40, "sub": "since last year", "tally": 115}),
    ("strike", "06", (35.08, 36.60), {"old": 224, "n": 184, "lost": 40, "tally": 155}),
    ("tag", "07a", 14.20, {"text": "Before"}),
    ("tag", "07b", 17.94, {"text": "Now", "red": True, "left": 640}),
    ("tag", "08a", 0.40, {"text": "Last year's jeans"}),
    ("say", "08b", (16.80, 17.28), {"words": ["Losing", "inches"]}),
    ("down", "09a", 6.04, {"n": 22, "sub": "", "tally": 177}),
    ("down", "09b", 9.72, {"n": 50, "label": "Cholesterol", "minus": True, "sub": "points lower"}),
    ("say", "09c", (15.02, 15.90, 16.22), {"words": ["Thank you,", "Different", "Breed"]}),
]
TITLE = (0.2, 3.6, "Changing", "lives", "One pound at a time")  # over Don's question (Joey 10/27): says what this is
PUSH = {"04a": 1.06, "06": 1.12, "07a": 1.05, "07b": 1.05}  # slow push-ins: wide shot + the before/after reveals


def esc(s):
    return html.escape(s)


def odo(value, spins=1, blank=False):
    """Digit columns for an odometer. Each strip is [blank?] 0-9 repeated (spins + 1) times."""
    cols = []
    for ch in str(value):
        cells = ([""] if blank else []) + [str(d) for d in range(10)] * (spins + 1)
        strip = "".join(f"<i>{c or '&nbsp;'}</i>" for c in cells)
        cols.append(f'<span class="col"><span class="strip" data-cells="{len(cells)}">{strip}</span></span>')
    return "".join(cols)


def roll(sel, value, t, spins=1, blank=False, dur=0.5):
    """Tweens that stop each digit strip of `sel` on `value` (last digit lands last)."""
    out, digits = [], str(value)
    cells = (1 if blank else 0) + 10 * (spins + 1)
    for i, ch in enumerate(digits):
        k = (1 if blank else 0) + 10 * spins + int(ch)
        out.append(f'      tl.fromTo("{sel} .col:nth-child({i + 1}) .strip", {{ yPercent: 0 }}, '
                   f'{{ yPercent: {-100 * k / cells:.4f}, duration: {dur + 0.12 * i:.2f}, '
                   f'ease: "power3.out" }}, {t:.3f});')
    return out


def main():
    cuts = json.load(open(os.path.join(ROOT, "build/cuts.json")))
    start, t = {}, 0.0
    for c in cuts:
        start[c["id"]] = (round(t, 3), c)
        t += c["dur"]
    voice_end = round(t, 3)
    total = round(voice_end + END_CARD, 3)

    def at(seg, src_t):
        s, c = start[seg]
        return round(s + src_t - c["in"], 3)

    def seg_end(seg):
        s, c = start[seg]
        return round(s + c["dur"], 3)

    media, gfx, tw = [], [], []
    for n, c in enumerate(cuts):
        s, i = start[c["id"]][0], c["id"]
        media.append(
            f'      <div class="inner" id="in-{i}"><video id="v-{i}" class="clip" src="assets/footage/{i}.mp4" '
            f'data-start="{s}" data-duration="{c["dur"]:.3f}" data-media-start="0" data-track-index="{n % 2}" '
            f'muted playsinline></video></div>')
        if i in PUSH:
            tw.append(f'      tl.fromTo("#in-{i}", {{ scale: 1 }}, {{ scale: {PUSH[i]}, duration: {c["dur"]:.3f}, '
                      f'ease: "none" }}, {s});')

    # Scrims under the graphics so white type reads over bright walls (footage only, not the end card)
    gfx.append(f'      <div id="scrim" class="clip" data-start="0" data-duration="{voice_end}" data-track-index="19"></div>')

    # Title over the opening question; clears after the camera flips to her
    t_in, t_out, a, b, tag = TITLE
    gfx.append(f'      <div id="title" class="clip gfx" data-start="{t_in}" data-duration="{t_out - t_in:.3f}" data-track-index="23">\n'
               f'        <div class="ttl"><span class="t1">{esc(a)}</span><span class="t2">{esc(b)}</span>'
               f'<div class="t3">{esc(tag)}</div></div>\n      </div>')
    tw.append(f'      tl.from("#title .t1", {{ y: 70, opacity: 0, duration: 0.4, ease: "power3.out" }}, {t_in});')
    tw.append(f'      tl.from("#title .t2", {{ y: 70, opacity: 0, duration: 0.4, ease: "power3.out" }}, {t_in + 0.12:.3f});')
    tw.append(f'      tl.from("#title .t3", {{ clipPath: "inset(0% 100% 0% 0%)", duration: 0.35, ease: "power2.out" }}, {t_in + 0.45:.3f});')
    tw.append(f'      tl.to("#title .ttl", {{ y: -40, opacity: 0, duration: 0.25, ease: "power2.in" }}, {t_out - 0.25:.3f});')

    # The weight bar: label left, rolling total right, red fill. Appears with the first number.
    first_tally = next(at(g[1], g[2]) for g in GRAPHICS if g[3].get("tally"))
    gfx.append(
        f'      <div id="tally" class="clip" data-start="{first_tally - 0.05:.3f}" '
        f'data-duration="{voice_end - first_tally + 0.05:.3f}" data-track-index="20">\n'
        f'        <div class="row"><span class="lbl">Pounds down</span><span class="tnum">{odo(177, 0, True)}</span></div>\n'
        f'        <div class="bar"><b></b></div>\n'
        f'      </div>')
    tw.append(f'      tl.from("#tally", {{ y: -30, opacity: 0, duration: 0.35, ease: "power3.out" }}, {first_tally - 0.05:.3f});')
    prev_total = 0
    for k, (kind, seg, when, o) in enumerate(GRAPHICS):
        gid = f"g{k:02d}"
        t0 = at(seg, when if not isinstance(when, tuple) else when[0])
        s0 = round(t0 - 0.05, 3)
        d = round(seg_end(seg) - s0, 3)
        clip = f'class="clip gfx" data-start="{s0}" data-duration="{d}" data-track-index="{21 + k % 2}"'
        if kind == "down":
            label = o.get("label", "Down")
            minus = '<span class="minus">−</span>' if o.get("minus") else ""
            unit = "" if o.get("label") else '<span class="unit">lbs</span>'
            sub = f'<div class="sub">{esc(o["sub"])}</div>' if o.get("sub") else ""
            gfx.append(f'      <div id="{gid}" {clip}>\n        <div class="call"><div class="tagr">{esc(label)}</div>'
                       f'<div class="num">{minus}<span class="odo">{odo(o["n"])}</span>{unit}</div>{sub}</div>\n      </div>')
            tw.append(f'      tl.from("#{gid} .tagr", {{ x: -60, opacity: 0, duration: 0.25, ease: "power3.out" }}, {s0});')
            tw.append(f'      tl.from("#{gid} .num", {{ scale: 1.18, transformOrigin: "0% 100%", duration: 0.45, ease: "back.out(2)" }}, {s0});')
            tw += roll(f"#{gid} .odo", o["n"], s0, spins=1, dur=0.42)
            if o.get("sub"):
                tw.append(f'      tl.from("#{gid} .sub", {{ y: 20, opacity: 0, duration: 0.3, ease: "power2.out" }}, {s0 + 0.35:.3f});')
        elif kind == "strike":
            t1 = at(seg, when[1])
            gfx.append(f'      <div id="{gid}" {clip}>\n        <div class="call"><div class="old">{o["old"]}<s></s></div>'
                       f'<div class="num"><span class="odo">{odo(o["n"])}</span></div>'
                       f'<div class="tagr">Down {o["lost"]} lbs</div></div>\n      </div>')
            tw.append(f'      tl.from("#{gid} .old", {{ x: -50, opacity: 0, duration: 0.3, ease: "power3.out" }}, {s0});')
            tw.append(f'      tl.from("#{gid} .old s", {{ scaleX: 0, transformOrigin: "0% 50%", duration: 0.22, ease: "power2.in" }}, {t1 - 0.15:.3f});')
            tw.append(f'      tl.to("#{gid} .old", {{ opacity: 0.55, duration: 0.2 }}, {t1:.3f});')
            tw.append(f'      tl.from("#{gid} .num", {{ y: -60, opacity: 0, duration: 0.35, ease: "back.out(1.8)" }}, {t1 - 0.05:.3f});')
            tw += roll(f"#{gid} .odo", o["n"], t1 - 0.05, spins=1, dur=0.42)
            tw.append(f'      tl.from("#{gid} .tagr", {{ x: -60, opacity: 0, duration: 0.25, ease: "power3.out" }}, {t1 + 0.3:.3f});')
            t0 = t1
        elif kind == "tag":
            cls = "tag red" if o.get("red") else "tag"
            pos = f' style="left: {o["left"]}px"' if o.get("left") else ""  # under the photo it names
            gfx.append(f'      <div id="{gid}" {clip}>\n        <div class="{cls}"{pos}>{esc(o["text"])}</div>\n      </div>')
            tw.append(f'      tl.from("#{gid} .tag", {{ scale: 0.6, opacity: 0, transformOrigin: "0% 100%", duration: 0.3, ease: "back.out(2.2)" }}, {s0});')
        elif kind == "say":
            words = "".join(f'<span class="w{j} {"red" if j else ""}">{esc(w)}</span>'
                            for j, w in enumerate(o["words"]))
            gfx.append(f'      <div id="{gid}" {clip}>\n        <div class="say">{words}</div>\n      </div>')
            for j, wt in enumerate(when):
                tw.append(f'      tl.from("#{gid} .w{j}", {{ y: 40, opacity: 0, duration: 0.28, ease: "power3.out" }}, {at(seg, wt) - 0.05:.3f});')
        if o.get("tally"):
            # roll the total and grow the bar on the word
            tw += tally_roll(prev_total, o["tally"], t0)
            tw.append(f'      tl.to("#tally .bar b", {{ scaleX: {o["tally"] / TALLY_MAX:.4f}, duration: 0.5, ease: "power3.out" }}, {t0:.3f});')
            prev_total = o["tally"]

    # End card
    gfx.append(
        f'      <div id="end" class="clip" data-start="{voice_end}" data-duration="{END_CARD}" data-track-index="30">\n'
        f'        <div class="total"><span class="odo">{odo(TALLY_MAX)}</span></div>\n'
        f'        <div class="lbs">Pounds down</div>\n'
        f'        <div class="ty">Thank you,<br><span>Different Breed</span></div>\n'
        f'        <img class="logo" src="assets/db-logo.png" alt="">\n'
        f'        <div class="line">What we do is absolutely different</div>\n'
        f'      </div>')
    e = voice_end
    tw += roll("#end .odo", TALLY_MAX, e, spins=1, dur=0.6)
    tw.append(f'      tl.from("#end .lbs", {{ opacity: 0, y: 16, duration: 0.3 }}, {e + 0.2:.3f});')
    tw.append(f'      tl.from("#end .ty", {{ opacity: 0, y: 24, duration: 0.35, ease: "power3.out" }}, {e + 0.35:.3f});')
    tw.append(f'      tl.from("#end .logo", {{ opacity: 0, scale: 0.85, duration: 0.35, ease: "power3.out" }}, {e + 0.6:.3f});')
    tw.append(f'      tl.from("#end .line", {{ opacity: 0, duration: 0.3 }}, {e + 0.8:.3f});')

    media.append(f'      <audio id="mix" src="assets/mix.wav" data-start="0" data-duration="{total}" data-media-start="0" '
                 f'data-track-index="10" data-volume="1"></audio>')
    doc = TEMPLATE.format(W=W, H=H, total=total, media="\n".join(media), gfx="\n".join(gfx), tweens="\n".join(tw))
    open(os.path.join(ROOT, "index.html"), "w").write(doc)
    json.dump({"voice_end": voice_end, "total": total,
               "segments": {k: {"start": v[0], "dur": v[1]["dur"]} for k, v in start.items()}},
              open(os.path.join(ROOT, "build/timeline.json"), "w"), indent=2)
    print(f"index.html: {len(cuts)} segments, voice ends {voice_end}s, total {total}s")


def tally_roll(prev, value, t):
    """Roll the three tally columns (blank cell first, so leading digits stay empty) from prev to value."""
    out = []
    a, b = f"{prev:>3}", f"{value:>3}"
    for i, (pa, ch) in enumerate(zip(a, b)):
        if pa == ch:
            continue
        k = 0 if ch == " " else 1 + int(ch)
        k0 = 0 if pa == " " else 1 + int(pa)
        out.append(f'      tl.fromTo("#tally .tnum .col:nth-child({i + 1}) .strip", {{ yPercent: {-100 * k0 / 11:.4f} }}, '
                   f'{{ yPercent: {-100 * k / 11:.4f}, duration: 0.5, ease: "power3.out", immediateRender: false }}, {t:.3f});')
    return out


TEMPLATE = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width={W}, height={H}">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "Oswald"; src: url("assets/fonts/Oswald-VariableFont_wght.ttf"); font-weight: 200 700; }}
      :root {{ --ink: #0E0E0E; --red: #C4161C; --white: #FFFFFF; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: var(--ink); }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink);
              font-family: "Oswald", sans-serif; color: var(--white); text-transform: uppercase; }}
      .inner {{ position: absolute; inset: 0; transform-origin: 50% 45%; }}
      video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      #scrim {{ position: absolute; inset: 0; z-index: 4; pointer-events: none;
               background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 42%,
                           rgba(0,0,0,0.62) 78%, rgba(0,0,0,0.7) 100%); }}
      .gfx, #tally {{ position: absolute; inset: 0; z-index: 5; pointer-events: none; }}
      .col {{ display: inline-block; height: 1em; overflow: hidden; vertical-align: top; width: 0.56em; text-align: center; }}
      .strip {{ display: block; }}
      .strip i {{ display: block; height: 1em; line-height: 1em; font-style: normal; }}

      #tally .row, #tally .bar {{ position: absolute; left: 80px; right: 80px; }}
      #tally .row {{ top: 214px; display: flex; justify-content: space-between; align-items: flex-end;
                    font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.6); }}
      #tally .lbl {{ font-size: 40px; letter-spacing: 0.08em; line-height: 1; }}
      #tally .tnum {{ font-size: 64px; line-height: 1; }}
      #tally .bar {{ top: 290px; height: 14px; border-radius: 7px; background: rgba(14,14,14,0.55);
                    box-shadow: 0 0 0 2px rgba(255,255,255,0.35); overflow: hidden; }}
      #tally .bar b {{ display: block; height: 100%; background: var(--red); transform: scaleX(0); transform-origin: 0 50%; }}

      .call {{ position: absolute; left: 80px; bottom: 430px; text-shadow: 0 4px 24px rgba(0,0,0,0.55); }}
      .tagr {{ display: inline-block; background: var(--red); font-weight: 700; font-size: 58px; letter-spacing: 0.06em;
               line-height: 1; padding: 14px 22px 10px; text-shadow: none; }}
      .num {{ font-weight: 700; font-size: 330px; line-height: 0.92; letter-spacing: -0.02em; display: flex; align-items: flex-end; }}
      .num .minus {{ margin-right: 0.04em; }}
      .num .unit {{ font-size: 110px; line-height: 1.25; margin-left: 18px; letter-spacing: 0.02em; }}
      .sub {{ font-weight: 500; font-size: 62px; letter-spacing: 0.05em; line-height: 1; }}
      .old {{ position: relative; display: inline-block; font-weight: 700; font-size: 190px; line-height: 0.95; }}
      .old s {{ position: absolute; left: -4%; right: -4%; top: 44%; height: 16px; background: var(--red);
               transform: rotate(-8deg); text-decoration: none; }}
      .tag {{ position: absolute; left: 80px; bottom: 470px; background: var(--white); color: var(--ink);
              font-weight: 700; font-size: 84px; letter-spacing: 0.05em; line-height: 1; padding: 18px 30px 12px; }}
      .tag.red {{ background: var(--red); color: var(--white); }}
      .ttl {{ position: absolute; left: 80px; right: 80px; bottom: 430px; font-weight: 700; text-shadow: 0 4px 24px rgba(0,0,0,0.6); }}
      .ttl .t1, .ttl .t2 {{ display: block; font-size: 190px; line-height: 0.9; letter-spacing: -0.01em; }}
      .ttl .t2 {{ color: var(--red); }}
      .ttl .t3 {{ display: inline-block; margin-top: 22px; background: var(--white); color: var(--ink); font-size: 66px;
                 letter-spacing: 0.05em; line-height: 1; padding: 16px 26px 11px; text-shadow: none; clip-path: inset(0% 0% 0% 0%); }}
      .say {{ position: absolute; left: 80px; right: 120px; bottom: 430px; font-weight: 700; font-size: 170px; line-height: 0.92;
              text-shadow: 0 4px 24px rgba(0,0,0,0.6); }}
      .say span {{ display: block; }}
      .say .red {{ color: var(--red); }}

      #end {{ position: absolute; inset: 0; z-index: 8; background: var(--ink); display: flex; flex-direction: column;
             align-items: center; justify-content: center; text-align: center; padding-bottom: 80px; }}
      #end .total {{ font-weight: 700; font-size: 300px; line-height: 1; }}
      #end .lbs {{ color: var(--red); font-weight: 700; font-size: 72px; letter-spacing: 0.1em; margin-top: 4px; }}
      #end .ty {{ font-weight: 700; font-size: 104px; line-height: 0.98; margin-top: 70px; }}
      #end .ty span {{ color: var(--red); }}
      #end .logo {{ width: 230px; height: 230px; margin-top: 70px; }}
      #end .line {{ font-weight: 500; font-size: 40px; letter-spacing: 0.08em; margin-top: 26px; opacity: 0.8; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{W}" data-height="{H}">
{media}
{gfx}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
{tweens}
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""


if __name__ == "__main__":
    main()
