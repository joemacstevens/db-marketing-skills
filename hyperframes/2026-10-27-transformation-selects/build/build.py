#!/usr/bin/env python3
"""Write index.html from build/cuts.json: every bite back to back, a short black breath between rows,
and a label per bite (row + who, what, source file + source TC). Run build/cut.py first.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SET = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--set=")), "")  # selects-<SET>.json, cuts-<SET>.json
BREATH = 0.3  # black between different people (rows); bites of the same row hard-cut
W, H = 720, 1280


def esc(s):
    return html.escape(s.replace("→", "to"))


def main():
    cuts = json.load(open(os.path.join(ROOT, "build/cuts" + (f"-{SET}" if SET else "") + ".json")))
    t, prev_row, items, tweens = 0.0, None, [], []
    for n, c in enumerate(cuts, 1):
        new_row = c["row"] != prev_row
        if prev_row is not None and new_row:
            t += BREATH
        s, d = round(t, 3), c["dur"]
        i = c["id"]
        trk = n % 2
        tc = f"{c['in']:.1f}–{c['in'] + d:.1f}s"
        name = re.sub(r"_20\d\d-\d\d-\d\d$", "", os.path.splitext(c["file"])[0])  # drop ext + copy-date suffix
        items.append(
            f'      <video id="v-{i}" class="clip" src="assets/footage/{i}.mp4" data-start="{s}" data-duration="{d:.3f}" '
            f'data-media-start="0" data-track-index="{trk}" muted playsinline></video>\n'
            f'      <audio id="a-{i}" src="assets/audio/{i}.wav" data-start="{s}" data-duration="{d:.3f}" '
            f'data-media-start="0" data-track-index="{10 + trk}" data-volume="1"></audio>\n'
            f'      <div id="lab-{i}" class="clip lab" data-start="{s}" data-duration="{d:.3f}" data-track-index="20" '
            f'data-track-kind="graphics">\n'
            f'        <div class="num">#{esc(c["row"])} · {esc(c["who"])}</div>\n'
            f'        <div class="what">{esc(c["what"])}</div>\n'
            f'        <div class="src">{n}/{len(cuts)} · {esc(name)} · {tc}</div>\n'
            f'      </div>')
        if new_row:
            tweens.append(f'      tl.from("#lab-{i} .num", {{ x: -36, opacity: 0, duration: 0.35, ease: "power3.out" }}, {s});\n'
                          f'      tl.from("#lab-{i} .what", {{ x: -36, opacity: 0, duration: 0.35, ease: "power3.out" }}, {s + 0.08:.3f});')
        t += d
        prev_row = c["row"]
    total = round(t, 3)
    doc = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width={W}, height={H}">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-Book.otf"); font-weight: 400; }}
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-Bold.otf"); font-weight: 700; }}
      :root {{ --ink: #0a0a0a; --red: #e81d1d; --bone: #f6f2ec; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: var(--ink); }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink); font-family: "NORD", sans-serif; }}
      video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      .lab {{ position: absolute; inset: 0; z-index: 5; }}
      .num, .what {{ position: absolute; left: 40px; color: var(--bone); text-transform: uppercase; padding: 8px 14px; line-height: 1.1; }}
      .num {{ top: 72px; background: var(--red); font-weight: 700; font-size: 24px; letter-spacing: 0.08em; }}
      .what {{ top: 120px; background: rgba(10, 10, 10, 0.78); font-weight: 400; font-size: 21px; letter-spacing: 0.06em; }}
      .src {{ position: absolute; left: 40px; bottom: 76px; color: rgba(246, 242, 236, 0.82); background: rgba(10, 10, 10, 0.6); font-size: 19px; letter-spacing: 0; padding: 6px 10px; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{W}" data-height="{H}">
{chr(10).join(items)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tweens)}
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
    open(os.path.join(ROOT, "index.html"), "w").write(doc)
    print(f"index.html: {len(cuts)} bites, {total:.1f}s")


if __name__ == "__main__":
    main()
