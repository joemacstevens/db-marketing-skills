#!/usr/bin/env python3
"""Generate index.html for the 2026-10-08 "Sweet Science" reel (v3) from build/reel.json.

Source: IMG_1868 (filmed and sent by Don, Wed 10/7 7:16 PM, 720p30 HLG, rotation -90), tonemapped
(zscale hable) SDR proxy at assets/footage/img1868.mp4 (720x1280, -g 15). Coach P's Sweet Science
class doing banded footwork: mini band at the ankles, boxing stance, single-file line down the turf,
Coach P out front at the end.

Audio (v3): no room audio. DB anthem stems, reel 0 = song 31.3: instrumental under everything (ducked
-12 dB under the house-voice VO), vocal stem in only after the VO, so the anthem's pre-chorus runs
into "We are Different Breed" (song 48.96 = reel 17.66) on the end tag. One continuous VO take.
Grade: "lite" correction (A2 turned the turf neon and skin orange in grade-compare).
v2 (Blue Collar labels, room audio) is snapshotted in build-v2.py + reel-v2.json.
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GRADE = (ROOT / "build" / "grade.txt").read_text().strip()  # HTML-escaped grade JSON
R = json.loads((ROOT / "build" / "reel.json").read_text())

SRC = R["source"]
END_AT = R["end"]["at"]
TOTAL = round(END_AT + R["end"]["length"], 3)
SHOTS = R["shots"]
for i, s in enumerate(SHOTS):
    nxt = SHOTS[i + 1]["at"] if i + 1 < len(SHOTS) else END_AT
    s["dur"] = round(nxt - s["at"], 3)

# no source moment twice
spans = sorted((s["ms"], s["ms"] + s["dur"], s["id"]) for s in SHOTS)
for a, b in zip(spans, spans[1:]):
    assert a[1] <= b[0] + 1e-6, f"source overlap {a} {b}"
assert spans[-1][1] <= 29.13, "past end of clip"


def lane(points):
    return html.escape(json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in points]}]}), quote=True)


esc = html.escape

videos = []
for i, s in enumerate(SHOTS):
    origin = s.get("origin", "50% 50%")
    videos.append(
        f'        <div class="fr" id="fr-{s["id"]}" style="transform-origin: {origin}" data-layout-allow-overflow="">'
        f'<video data-color-grading="{GRADE}" id="v-{s["id"]}" class="clip" src="{SRC}" data-start="{s["at"]}" data-duration="{s["dur"]}" '
        f'data-media-start="{s["ms"]}" data-track-index="{i % 2}" muted playsinline></video></div>'
    )

T = R["title"]
M = R["move"]
H = R.get("how")
MU = R["music"]
VO = R["vo"]
CAPS = R.get("captions", [])
E = R["end"]
C = R["chip"]

SONG0 = MU["song_at_reel0"]
VO_AT = VO["at"]
VO_END = round(VO_AT + VO["speech_end"], 3)
D = MU["duck"]
inst_lane = [(0, 0), (0.06, 1), (VO_AT - 0.12, 1), (VO_AT + 0.05, D), (VO_END + 0.02, D), (VO_END + 0.25, 1), (TOTAL - 0.45, 1), (TOTAL, 0)]
voc_lane = [(0, 0), (VO_END + 0.02, 0), (VO_END + 0.12, 1), (TOTAL - 0.45, 1), (TOTAL, 0)]
vo_dur = round(VO["speech_end"] + 0.35, 3)
audio = [
    f'      <audio id="a-inst" src="{MU["inst"]}" data-start="0" data-duration="{TOTAL}" data-media-start="{SONG0}" data-track-index="10" data-volume="{MU["inst_volume"]}" '
    f'data-automation="{lane(inst_lane)}"></audio>',
    f'      <audio id="a-voc" src="{MU["voc"]}" data-start="0" data-duration="{TOTAL}" data-media-start="{SONG0}" data-track-index="11" data-volume="{MU["voc_volume"]}" '
    f'data-automation="{lane(voc_lane)}"></audio>',
    f'      <audio id="a-vo" src="{VO["file"]}" data-start="{VO_AT}" data-duration="{vo_dur}" data-media-start="0" data-track-index="12" data-volume="{VO["volume"]}"></audio>',
]

cap_html = []
cap_js = []
for ci, c in enumerate(CAPS):
    st = round(VO_AT + c["words"][0][1] - 0.04, 3)
    en = round(VO_AT + c["end"], 3)
    spans = " ".join(f'<span class="cw" id="c{ci}-w{wi}" data-layout-allow-overlap="">{esc(w)}</span>' for wi, (w, _) in enumerate(c["words"]))
    cap_html.append(f'      <div id="t-cap{ci}" class="clip layer" data-start="{st}" data-duration="{round(en - st, 3)}" data-track-index="7"><div class="cap" id="cap{ci}">{spans}</div></div>')
    cap_js.append([f"c{ci}", [round(VO_AT + t, 3) for _, t in c["words"]], en])

HOW_JS = ""
HOW_HTML = ""
if H:
    HOW_JS = ("      // how-line, line by line\n"
              f'      tl.fromTo("#t-how-scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "none" }}, {H["in"]});\n'
              + "".join(f'      tl.fromTo("#how-{i}", {{ x: -60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.26, ease: "power3.out" }}, {round(H["in"] + 0.05 + i * 0.22, 3)});\n' for i in range(len(H["lines"])))
              + f'      tl.to("#how-box", {{ y: -80, opacity: 0, duration: 0.22, ease: "power3.in" }}, {round(H["out"] - 0.24, 3)});\n'
              + f'      tl.to("#t-how-scrim", {{ opacity: 0, duration: 0.24, ease: "none" }}, {round(H["out"] - 0.24, 3)});\n')
    HOW_HTML = (f'      <div id="t-how" class="clip layer" data-start="{H["in"]}" data-duration="{round(H["out"] - H["in"], 3)}" data-track-index="4">'
                f'<div class="scrim" id="t-how-scrim"></div><div class="how" id="how-box">'
                + ''.join(f'<span class="ln" id="how-{i}">{esc(x)}</span>' for i, x in enumerate(H["lines"])) + '</div></div>')
shots_js = json.dumps([{k: s[k] for k in ("id", "at", "dur", "tx", "zoom", "drift")} for s in SHOTS])

doc = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-Book.otf"); font-weight: 400; }}
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-Bold.otf"); font-weight: 700; }}
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-Black.otf"); font-weight: 900; }}
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-BlackItalic.otf"); font-weight: 900; font-style: italic; }}
      :root {{ --ink: #0a0a0a; --red: #e81d1d; --bone: #f6f2ec; --steel: #b8b2a8; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: var(--ink); }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink); font-family: "NORD", sans-serif; }}

      /* footage: 720x1280 -> exact 1.5x cover */
      .shot {{ position: absolute; inset: 0; overflow: hidden; will-change: transform, filter; }}
      .shot .punch, .shot .fr {{ position: absolute; inset: 0; will-change: transform; }}
      .shot video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      .flash {{ position: absolute; inset: 0; box-shadow: inset 0 0 0 0 var(--red); opacity: 0; }}

      .layer {{ position: absolute; inset: 0; }}
      .shade {{ position: absolute; inset: 0; background: rgba(10, 10, 10, 0.42); }}
      .scrim {{ position: absolute; left: 0; right: 0; top: 0; height: 760px; background: linear-gradient(to bottom, rgba(10,10,10,0.62), rgba(10,10,10,0.38) 55%, rgba(10,10,10,0)); }}

      /* title, Don's words */
      .title {{ position: absolute; left: 64px; top: 120px; width: 940px; transform: rotate(-4deg); transform-origin: left center; }}
      .big {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 108px; line-height: 1.0; white-space: nowrap; color: var(--bone); text-shadow: 9px 9px 0 var(--ink); }}
      .tk {{ display: inline-block; background: var(--ink); color: var(--bone); font-weight: 700; font-size: 34px; letter-spacing: 0.16em; padding: 10px 20px; text-transform: uppercase; margin-bottom: 14px; border-left: 10px solid var(--red); }}
      .hl {{ display: inline-block; background: var(--red); margin-top: 16px; padding: 6px 30px 14px; box-shadow: 12px 12px 0 var(--ink); transform-origin: left center; }}
      .hl .ln {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 124px; line-height: 1.04; letter-spacing: -0.02em; color: var(--bone); white-space: nowrap; }}

      /* THE MOVE card (house style, TRX / It's Just Work editions) */
      .move {{ position: absolute; left: 64px; top: 96px; width: 960px; }}
      .move .k {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 32px; letter-spacing: 0.16em; padding: 10px 22px; text-transform: uppercase; }}
      .move .n {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 76px; line-height: 0.9; color: var(--bone); text-shadow: 7px 7px 0 var(--ink); margin-top: 14px; white-space: nowrap; }}
      .move .n .ln {{ display: inline; line-height: 1.02; }}
      .move .rule {{ display: block; width: 370px; height: 8px; background: var(--red); margin: 14px 0 12px; transform-origin: left center; }}
      .move .wk {{ display: inline-block; font-weight: 700; font-size: 34px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.74); padding: 8px 16px; }}

      /* how-line */
      .how {{ position: absolute; left: 64px; top: 110px; width: 960px; }}
      .how .ln {{ display: table; font-weight: 700; font-size: 44px; line-height: 1.0; letter-spacing: 0.02em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.78); padding: 12px 20px 14px; margin-bottom: 8px; border-left: 10px solid var(--red); }}

      /* VO captions */
      .cap {{ position: absolute; left: 70px; right: 70px; top: 1130px; text-align: center; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 66px; line-height: 1.18; color: var(--bone); text-shadow: 6px 6px 0 var(--ink); }}
      .cap .cw {{ display: inline-block; padding: 2px 12px 6px; margin: 0 0 8px; background: rgba(10, 10, 10, 0.62); }}

      /* coach chip (house style, junior-boxing COACH DON chip) */
      .chip {{ position: absolute; left: 64px; top: 1390px; display: flex; flex-direction: column; align-items: flex-start; }}
      .chip .nm {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 900; font-style: italic; font-size: 60px; line-height: 1.1; letter-spacing: 0.01em; padding: 8px 26px 12px; box-shadow: 8px 8px 0 var(--ink); text-transform: uppercase; }}
      .chip .sb {{ display: inline-block; margin-top: 12px; background: var(--ink); color: var(--bone); font-weight: 700; font-size: 30px; letter-spacing: 0.16em; padding: 9px 18px; text-transform: uppercase; }}

      .card {{ position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }}
      .end img {{ display: block; width: 560px; height: 560px; object-fit: contain; }}
      .end .lock {{ display: block; width: 820px; height: auto; margin-top: 56px; }}
      .end .h {{ display: block; margin-top: 54px; font-weight: 400; font-size: 36px; letter-spacing: 0.2em; color: var(--steel); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">

      <!-- footage: one source, {len(SHOTS)} shots, each source moment used once -->
      <div class="shot" id="w-main"><div class="punch" id="punch" data-layout-allow-overflow="">
{chr(10).join(videos)}
      </div><div class="flash" id="flash"></div></div>

      <!-- title: "The sweet science" (Don's caption) -->
      <div id="t-title" class="clip layer" data-start="{T['in']}" data-duration="{round(T['out'] + 0.16 - T['in'], 3)}" data-track-index="2">
        <div class="shade" id="title-shade" style="opacity: 0"></div>
        <div class="title" id="title-box" data-layout-allow-overflow="">
          <span class="tk" id="title-k" data-layout-allow-overlap="">{esc(T['kicker'])}</span>
          <span class="big" id="title-1" data-layout-allow-overlap="">{esc(T['line1'])}</span>
          <span class="hl" id="title-2" data-layout-allow-overlap=""><span class="ln" data-layout-allow-overlap="">{esc(T['line2'])}</span></span>
        </div>
      </div>

      <!-- THE MOVE -->
      <div id="t-move" class="clip layer" data-start="{M['in']}" data-duration="{round(M['out'] - M['in'], 3)}" data-track-index="3">
        <div class="scrim" id="t-move-scrim"></div>
        <div class="move" id="move-box"><span class="k">{esc(M['kicker'])}</span><span class="n">{' '.join(f'<span class="ln">{esc(x)}</span>' for x in M['name'])}</span><span class="rule"></span><span class="wk">{esc(M['works'])}</span></div>
      </div>

{HOW_HTML}

      <!-- VO captions (word-timed from the isolated take) -->
{chr(10).join(cap_html)}

      <!-- coach chip -->
      <div id="t-chip" class="clip layer" data-start="{C['in']}" data-duration="{round(C['out'] - C['in'], 3)}" data-track-index="5"><div class="chip" id="chip"><span class="nm" id="chip-nm">{esc(C['name'])}</span><span class="sb" id="chip-sb">{esc(C['sub'])}</span></div></div>

      <!-- end tag -->
      <div id="t-end" class="clip layer" data-start="{END_AT}" data-duration="{round(TOTAL - END_AT, 3)}" data-track-index="6">
        <div class="card end">
          <img id="end-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <img class="lock" id="end-lock" src="assets/brand/lockup-absolutely-different-white.png" alt="What we do is absolutely different">
          <span class="h" id="end-h">@DBELITEFITNESS</span>
        </div>
      </div>

      <!-- audio (track 10+): room song unbroken under the footage, DB hook on the end tag -->
{chr(10).join(audio)}
    </div>

    <script>
      const SHOTS = {shots_js};
      const END = {END_AT};
      const tl = gsap.timeline({{ paused: true }});

      // per-shot framing: static punch-in plus a slow push across the shot (wrapper, never the video)
      SHOTS.forEach((s) => {{
        tl.fromTo("#fr-" + s.id, {{ scale: s.zoom }}, {{ scale: s.drift, duration: s.dur, ease: "none", immediateRender: true }}, s.at);
      }});

      // transitions into each shot
      tl.set("#punch", {{ scale: 1, x: 0, filter: "blur(0px)" }}, 0);
      tl.set("#flash", {{ opacity: 0 }}, 0);
      SHOTS.forEach((s) => {{
        const t = s.at;
        if (s.tx === "impact") {{
          tl.fromTo("#punch", {{ scale: 1.08 }}, {{ scale: 1.0, duration: 0.45, ease: "power3.out", immediateRender: false }}, t);
          tl.fromTo("#flash", {{ opacity: 1, boxShadow: "inset 0 0 0 26px #e81d1d" }}, {{ opacity: 0, boxShadow: "inset 0 0 0 0px #e81d1d", duration: 0.3, ease: "power2.out", immediateRender: false }}, t);
        }} else if (s.tx === "whip") {{
          tl.fromTo("#punch", {{ x: 0, scale: 1, filter: "blur(0px)" }}, {{ x: -260, scale: 1.4, filter: "blur(22px)", duration: 0.1, ease: "power3.in", immediateRender: false }}, t - 0.1);
          tl.fromTo("#punch", {{ x: 260, scale: 1.4, filter: "blur(22px)" }}, {{ x: 0, scale: 1, filter: "blur(0px)", duration: 0.16, ease: "power3.out", immediateRender: false }}, t);
        }}
      }});

      // title slam
      const TI = {T['in']}, TO = {T['out']};
      tl.fromTo("#title-shade", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.16 }}, TI);
      tl.fromTo("#title-k", {{ x: -60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.2, ease: "power3.out" }}, TI);
      tl.fromTo("#title-1", {{ scale: 1.8, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.2, ease: "power4.out" }}, TI + 0.04);
      tl.fromTo("#title-2", {{ scaleX: 0, opacity: 0 }}, {{ scaleX: 1, opacity: 1, duration: 0.24, ease: "expo.out" }}, TI + 0.26);
      tl.fromTo("#title-2 .ln", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.2)" }}, TI + 0.32);
      tl.fromTo("#title-box", {{ x: 0, opacity: 1, filter: "blur(0px)" }}, {{ x: -1080, opacity: 1, filter: "blur(22px)", duration: 0.16, ease: "power3.in", immediateRender: false }}, TO);
      tl.to("#title-shade", {{ opacity: 0, duration: 0.14 }}, TO + 0.02);

      // THE MOVE: kicker pops, name rises, rule draws, works line
      const MI = {M['in']}, MO = {M['out']};
      tl.fromTo("#move-box .k", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.26, ease: "back.out(2)" }}, MI);
      tl.fromTo("#move-box .n", {{ y: 60, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power4.out" }}, MI + 0.08);
      tl.fromTo("#move-box .rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.36, ease: "expo.out" }}, MI + 0.2);
      tl.fromTo("#move-box .wk", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, MI + 0.3);
      tl.fromTo("#t-move-scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "none" }}, MI);
      tl.to("#move-box", {{ y: -80, opacity: 0, duration: 0.22, ease: "power3.in" }}, MO - 0.24);
      tl.to("#t-move-scrim", {{ opacity: 0, duration: 0.24, ease: "none" }}, MO - 0.24);

{HOW_JS}
      // VO captions: words land on the voice, active word gets the red block
      const CAPS = {json.dumps(cap_js)};
      CAPS.forEach(([id, times, end]) => {{
        times.forEach((t, i) => {{
          const el = "#" + id + "-w" + i;
          const next = i + 1 < times.length ? times[i + 1] : end;
          tl.fromTo(el, {{ opacity: 0, y: 22, scale: 1.12 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.14, ease: "power3.out" }}, t);
          tl.fromTo(el, {{ backgroundColor: "rgba(10,10,10,0.62)" }}, {{ backgroundColor: "rgba(232,29,29,1)", duration: 0.05, ease: "none" }}, t);
          tl.to(el, {{ backgroundColor: "rgba(10,10,10,0.62)", duration: 0.05, ease: "none" }}, Math.max(t + 0.07, next - 0.02));
        }});
      }});

      // coach chip
      const CI = {C['in']}, CO = {C['out']};
      tl.fromTo("#chip-nm", {{ x: -420, skewX: -12, opacity: 0 }}, {{ x: 0, skewX: 0, opacity: 1, duration: 0.3, ease: "power4.out" }}, CI);
      tl.fromTo("#chip-sb", {{ x: -60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.26, ease: "power3.out" }}, CI + 0.17);

      // whip out of the footage into the end tag
      tl.set("#w-main", {{ x: 0, filter: "blur(0px)" }}, 0);
      tl.fromTo("#w-main", {{ x: 0, filter: "blur(0px)" }}, {{ x: -1080, filter: "blur(26px)", duration: 0.18, ease: "power3.in", immediateRender: false }}, END - 0.18);
      tl.fromTo("#chip", {{ x: 0, opacity: 1 }}, {{ x: -1080, opacity: 1, duration: 0.18, ease: "power3.in", immediateRender: false }}, END - 0.18);

      // end tag: logo stamps, lockup and handle rise
      tl.fromTo("#end-logo", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" }}, END + 0.05);
      tl.fromTo("#end-lock", {{ y: 26, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power3.out" }}, END + 0.5);
      tl.fromTo("#end-h", {{ y: 22, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, END + 0.8);
      tl.to("#t-end .card", {{ opacity: 0, duration: 0.3, ease: "none" }}, {TOTAL} - 0.3);

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(doc)
print("wrote index.html", TOTAL, "s; shots", [(s["id"], s["at"], s["ms"], s["dur"]) for s in SHOTS])
