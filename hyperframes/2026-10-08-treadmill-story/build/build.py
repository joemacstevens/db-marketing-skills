#!/usr/bin/env python3
"""Generate index.html for the 2026-10-08 treadmill sprints STORY from build/reel.json.

Source: IMG_1878 (filmed and sent by Don, Thu 10/8 9:39 AM, 720p30 HLG, rotation -90), tonemapped
(zscale hable) SDR proxy at assets/footage/img1878.mp4 (720x1280, -g 15). Two women sprinting side by
side on the treadmills, one continuous shot. Cloned from 2026-10-08-sweet-science.

Audio: no room audio (gym-speaker music only). DB anthem stems under the footage (instrumental full,
vocal stem low), then the full anthem mix on the end beat so "We are Different Breed" lands on the logo.
Grade: "lite" correction (A2 over-saturates this footage family).
Story safe zone: all text inside y 260-1600.
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GRADE = (ROOT / "build" / "grade.txt").read_text().strip()  # HTML-escaped grade JSON
R = json.loads((ROOT / "build" / "reel.json").read_text())

SRC = R["source"]
END_AT = R["end"]["at"]
END_LEN = R["end"]["length"]
TOTAL = round(END_AT + END_LEN, 3)
SHOTS = R["shots"]
for i, s in enumerate(SHOTS):
    nxt = SHOTS[i + 1]["at"] if i + 1 < len(SHOTS) else END_AT
    s["dur"] = round(nxt - s["at"], 3)

# no source moment twice
spans = sorted((s["ms"], s["ms"] + s["dur"], s["id"]) for s in SHOTS)
for a, b in zip(spans, spans[1:]):
    assert a[1] <= b[0] + 1e-3, f"source overlap {a} {b}"
assert spans[-1][1] <= R["source_len"], "past end of clip"


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

M = R["move"]
MU = R["music"]
SONG0 = MU["song_at_reel0"]
FOOT_END = round(END_AT + 0.04, 3)
VO = R["vo"]
D = MU["duck"]
# VO speech windows in story time
WIN = [(round(c["at"] + c["speech"][0] - c["media"], 3), round(c["at"] + c["speech"][1] - c["media"], 3)) for c in VO["clips"]]
inst_lane = [(0, 0), (0.05, 1)]
voc_lane = [(0, 0), (0.05, 1)]
for a, b in WIN:
    inst_lane += [(a - 0.14, 1), (a - 0.02, D), (b + 0.05, D), (b + 0.2, 1)]
    voc_lane += [(a - 0.2, 1), (a - 0.06, 0), (b + 0.05, 0), (b + 0.2, 1)]
inst_lane = [pt for pt in inst_lane if pt[0] < END_AT - 0.06] + [(END_AT - 0.06, inst_lane[-1][1] if inst_lane[-1][0] < END_AT - 0.06 else D), (FOOT_END, 0)]
voc_lane = [pt for pt in voc_lane if pt[0] < END_AT - 0.06] + [(END_AT - 0.06, voc_lane[-1][1] if voc_lane[-1][0] < END_AT - 0.06 else 0), (FOOT_END, 0)]
end_lane = [(0, 0), (0.03, 1), (END_LEN - 0.5, 1), (END_LEN, 0)]
F = MU["fill"]
FILL_LEN = 0.86
fill_lane = [(0, 0), (0.03, 1), (FILL_LEN - 0.08, 1), (FILL_LEN, 0)]
audio = [
    f'      <audio id="a-inst" src="{MU["inst"]}" data-start="0" data-duration="{FOOT_END}" data-media-start="{SONG0}" data-track-index="10" data-volume="{MU["inst_volume"]}" '
    f'data-automation="{lane(inst_lane)}"></audio>',
    f'      <audio id="a-voc" src="{MU["voc"]}" data-start="0" data-duration="{FOOT_END}" data-media-start="{SONG0}" data-track-index="11" data-volume="{MU["voc_volume"]}" '
    f'data-automation="{lane(voc_lane)}"></audio>',
    f'      <audio id="a-end" src="{MU["end_mix"]}" data-start="{END_AT}" data-duration="{END_LEN}" data-media-start="{MU["end_song_at"]}" data-track-index="12" data-volume="{MU["end_volume"]}" '
    f'data-automation="{lane(end_lane)}"></audio>',
    f'      <audio id="a-fill" src="{F["src"]}" data-start="{END_AT}" data-duration="{FILL_LEN}" data-media-start="{F["song_at"]}" data-track-index="13" data-volume="{F["volume"]}" '
    f'data-automation="{lane(fill_lane)}"></audio>',
]
for i, c in enumerate(VO["clips"]):
    vl = [(0, 0), (0.03, 1), (c["dur"] - 0.06, 1), (c["dur"], 0)]
    audio.append(f'      <audio id="a-vo{i}" src="{VO["file"]}" data-start="{c["at"]}" data-duration="{c["dur"]}" data-media-start="{c["media"]}" data-track-index="{14 + i}" data-volume="{VO["volume"]}" '
                 f'data-automation="{lane(vl)}"></audio>')

CAPS = R.get("captions", [])
cap_html = []
cap_js = []
for ci, c in enumerate(CAPS):
    st = round(c["words"][0][1] - 0.04, 3)
    en = c["end"]
    sp = " ".join(f'<span class="cw" id="c{ci}-w{wi}" data-layout-allow-overlap="">{esc(w)}</span>' for wi, (w, _) in enumerate(c["words"]))
    cap_html.append(f'      <div id="t-cap{ci}" class="clip layer" data-start="{st}" data-duration="{round(en - st, 3)}" data-track-index="7"><div class="cap" id="cap{ci}">{sp}</div></div>')
    cap_js.append([f"c{ci}", [t for _, t in c["words"]], en])

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
      /* low band scrim behind the move card (story UI covers top ~250 and bottom ~300) */
      .scrim {{ position: absolute; left: 0; right: 0; top: 880px; height: 600px; background: linear-gradient(to bottom, rgba(10,10,10,0), rgba(10,10,10,0.55) 28%, rgba(10,10,10,0.55) 72%, rgba(10,10,10,0)); }}

      /* THE MOVE card (house style), sits on the treadmill arm, clear of faces and feet */
      .move {{ position: absolute; left: 64px; top: 1000px; width: 960px; }}
      .move .k {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 32px; letter-spacing: 0.16em; padding: 10px 22px; text-transform: uppercase; }}
      .move .n {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 104px; line-height: 0.96; color: var(--bone); text-shadow: 8px 8px 0 var(--ink); margin-top: 16px; white-space: nowrap; }}
      .move .n .ln {{ display: block; }}
      .move .rule {{ display: block; width: 420px; height: 8px; background: var(--red); margin: 18px 0 14px; transform-origin: left center; }}
      .move .wk {{ display: inline-block; font-weight: 700; font-size: 34px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.78); padding: 8px 16px; }}

      /* VO captions (sweet-science style), under the move card, inside the story safe zone */
      .cap {{ position: absolute; left: 60px; right: 60px; top: 1400px; text-align: center; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 60px; line-height: 1.18; color: var(--bone); text-shadow: 6px 6px 0 var(--ink); }}
      .cap .cw {{ display: inline-block; padding: 2px 12px 6px; margin: 0 0 8px; background: rgba(10, 10, 10, 0.62); }}

      .card {{ position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }}
      .end img {{ display: block; width: 560px; height: 560px; object-fit: contain; }}
      .end .lock {{ display: block; width: 820px; height: auto; margin-top: 56px; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">

      <!-- footage: one source, {len(SHOTS)} shots, source runs straight through, each moment used once -->
      <div class="shot" id="w-main"><div class="punch" id="punch" data-layout-allow-overflow="">
{chr(10).join(videos)}
      </div><div class="flash" id="flash"></div></div>

      <!-- THE MOVE -->
      <div id="t-move" class="clip layer" data-start="{M['in']}" data-duration="{round(M['out'] - M['in'], 3)}" data-track-index="3">
        <div class="scrim" id="t-move-scrim"></div>
        <div class="move" id="move-box"><span class="k">{esc(M['kicker'])}</span><span class="n">{''.join(f'<span class="ln">{esc(x)}</span>' for x in M['name'])}</span><span class="rule"></span><span class="wk">{esc(M['works'])}</span></div>
      </div>

      <!-- VO captions (word-timed from the take) -->
{chr(10).join(cap_html)}

      <!-- end beat: logo + lockup -->
      <div id="t-end" class="clip layer" data-start="{END_AT}" data-duration="{END_LEN}" data-track-index="6">
        <div class="card end">
          <img id="end-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <img class="lock" id="end-lock" src="assets/brand/lockup-absolutely-different-white.png" alt="What we do is absolutely different">
        </div>
      </div>

      <!-- audio (track 10+): anthem stems under the footage (ducked under the VO, vocal stem out), full anthem hook + 2-beat instrumental fill on the end beat, one-take VO -->
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
        }}
      }});

      // THE MOVE: kicker pops, name rises, rule draws, works line (opacity kept in the to-vars)
      const MI = {M['in']}, MO = {M['out']};
      tl.fromTo("#t-move-scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "none" }}, MI);
      tl.fromTo("#move-box .k", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.26, ease: "back.out(2)" }}, MI);
      tl.fromTo("#move-box .n .ln:nth-child(1)", {{ x: -120, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power4.out" }}, MI + 0.08);
      tl.fromTo("#move-box .n .ln:nth-child(2)", {{ x: -120, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power4.out" }}, MI + 0.2);
      tl.fromTo("#move-box .rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.36, ease: "expo.out" }}, MI + 0.32);
      tl.fromTo("#move-box .wk", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, MI + 0.42);
      tl.fromTo("#move-box", {{ x: 0, opacity: 1 }}, {{ x: -1080, opacity: 1, duration: 0.2, ease: "power3.in", immediateRender: false }}, MO - 0.22);
      tl.to("#t-move-scrim", {{ opacity: 0, duration: 0.22, ease: "none" }}, MO - 0.22);

      // VO captions: words land on the voice, active word gets the red block (opacity in the to-vars)
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

      // whip out of the footage into the end beat
      tl.set("#w-main", {{ x: 0, filter: "blur(0px)" }}, 0);
      tl.fromTo("#w-main", {{ x: 0, filter: "blur(0px)" }}, {{ x: -1080, filter: "blur(26px)", duration: 0.18, ease: "power3.in", immediateRender: false }}, END - 0.18);

      // end beat: logo stamps on the hook, lockup rises as the beat slams back in
      tl.fromTo("#end-logo", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.36, ease: "back.out(1.8)" }}, END + 0.05);
      tl.fromTo("#end-lock", {{ y: 26, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, END + 0.62);
      tl.to("#t-end .card", {{ opacity: 0, duration: 0.3, ease: "none" }}, {TOTAL} - 0.3);

      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(doc)
print("wrote index.html", TOTAL, "s; shots", [(s["id"], s["at"], s["ms"], s["dur"]) for s in SHOTS])
