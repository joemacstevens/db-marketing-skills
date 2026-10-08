#!/usr/bin/env python3
"""Generate index.html for the 2026-10-08 TRX Toning Tornado story from build/reel.json.

Source: Don's IMG_1867 (Wed 10/7 6:09 PM, 16.1s, 720p30 iPhone HLG, rotation -90), the Pulse studio.
Members on TRX rows, Coach Carlos cueing; he walks through frame at ~12.9-14.2.
Proxy: assets/footage/img1867.mp4 (zscale hable tonemap, 1080x1920 30 fps, -g 15).

Audio: the room is the spine (assets/audio/v-room.m4a, highpass 90 Hz, loudnorm -17, src 0-15.95).
End beat: "We are different" from Different Breed.mp3 (@48.7, "We" at 48.82). No bed under the room:
the gym's own music is already in it.
Story safe area: all text inside y 260-1600.
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GRADE = (ROOT / "build" / "grade.txt").read_text().strip()  # HTML-escaped grade JSON (sweet-science "lite")
R = json.loads((ROOT / "build" / "reel.json").read_text())

F = R["footage"]
END_AT = F["length"]
E = R["end"]
TOTAL = round(END_AT + E["length"], 3)
T, C, CH = R["title"], R["card"], R["chip"]
esc = html.escape


def lane(points):
    return html.escape(json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in points]}]}), quote=True)


caps = []
for c in R["captions"]:
    start = round(c["words"][0][1] - 0.04, 3)
    spans_html = " ".join(f'<span class="w" id="{c["id"]}-w{i}">{esc(w[0])}</span>' for i, w in enumerate(c["words"]))
    caps.append(
        f'      <div id="{c["id"]}" class="clip layer" data-start="{start}" data-duration="{round(c["end"] - start, 3)}" data-track-index="6"><div class="cap">{spans_html}</div></div>'
    )
caps_js = json.dumps({c["id"]: {"end": c["end"], "words": c["words"]} for c in R["captions"]})

ROOM_D = END_AT
HOOK_AT = round(END_AT - 0.12, 3)
HOOK_D = round(TOTAL - HOOK_AT, 3)

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

      .shot {{ position: absolute; inset: 0; overflow: hidden; will-change: transform, filter; }}
      .shot .fr {{ position: absolute; inset: 0; will-change: transform; }}
      .shot video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}

      .layer {{ position: absolute; inset: 0; }}
      .scrim {{ position: absolute; left: 0; right: 0; bottom: 0; height: 900px; opacity: 0; background: linear-gradient(to top, rgba(10,10,10,0.62), rgba(10,10,10,0.32) 55%, rgba(10,10,10,0)); }}

      /* title: lower third, inside the story safe area */
      .title {{ position: absolute; left: 64px; top: 1150px; width: 960px; transform: rotate(-4deg); transform-origin: left center; }}
      .big {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 170px; line-height: 1.0; white-space: nowrap; color: var(--bone); text-shadow: 10px 10px 0 var(--ink); }}
      .hl {{ display: inline-block; background: var(--red); margin-top: 14px; padding: 8px 30px 14px; box-shadow: 12px 12px 0 var(--ink); transform-origin: left center; }}
      .hl .ln {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 76px; line-height: 1.06; letter-spacing: -0.01em; color: var(--bone); white-space: nowrap; }}
      .sub {{ display: inline-block; margin-top: 22px; font-weight: 700; font-size: 34px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.78); padding: 9px 18px; }}

      /* THE MOVE card: lower band (faces are high in this clip) */
      .move {{ position: absolute; left: 64px; top: 1290px; width: 960px; }}
      .move .k {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 32px; letter-spacing: 0.16em; padding: 10px 22px; text-transform: uppercase; }}
      .move .n {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 92px; line-height: 1.02; color: var(--bone); text-shadow: 7px 7px 0 var(--ink); margin-top: 12px; white-space: nowrap; }}
      .move .rule {{ display: block; width: 370px; height: 8px; background: var(--red); margin: 10px 0 12px; transform-origin: left center; }}
      .move .wk {{ display: inline-block; font-weight: 700; font-size: 36px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.74); padding: 9px 18px; }}

      /* coach's cues, word by word */
      .cap {{ position: absolute; left: 36px; right: 36px; top: 1120px; text-align: center; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 60px; line-height: 1.22; color: var(--bone); text-shadow: 5px 5px 0 var(--ink); }}
      .cap .w {{ display: inline-block; padding: 0 9px; margin: 0 -2px; }}

      /* coach chip */
      .chip {{ position: absolute; right: 64px; top: 1360px; display: flex; flex-direction: column; align-items: flex-end; }}
      .chip .nm {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 900; font-style: italic; font-size: 60px; line-height: 1.1; letter-spacing: 0.01em; padding: 8px 26px 12px; box-shadow: 8px 8px 0 var(--ink); }}
      .chip .sb {{ display: inline-block; margin-top: 12px; background: var(--ink); color: var(--bone); font-weight: 700; font-size: 32px; letter-spacing: 0.06em; padding: 9px 18px; }}

      .card {{ position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }}
      .end img {{ display: block; width: 520px; height: 520px; object-fit: contain; }}
      .end .h {{ display: block; margin-top: 56px; font-weight: 700; font-size: 40px; letter-spacing: 0.08em; color: var(--bone); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">

      <!-- footage: IMG_1867, one continuous take -->
      <div class="shot" id="w-main"><div class="fr" id="fr" style="transform-origin: {F['origin']}" data-layout-allow-overflow="">
        <video data-color-grading="{GRADE}" id="v-main" class="clip" src="{R['source']}" data-start="0" data-duration="{END_AT}" data-media-start="{F['ms']}" data-track-index="0" muted playsinline></video>
      </div></div>

      <!-- title -->
      <div id="t-title" class="clip layer" data-start="{T['in']}" data-duration="{round(T['out'] + 0.16 - T['in'], 3)}" data-track-index="2">
        <div class="scrim" id="title-scrim"></div>
        <div class="title" id="title-box" data-layout-allow-overflow="">
          <span class="big" id="title-1" data-layout-allow-overlap="">{esc(T['line1'])}</span>
          <span class="hl" id="title-2" data-layout-allow-overlap=""><span class="ln" data-layout-allow-overlap="">{esc(T['line2'])}</span></span><br>
          <span class="sub" id="title-3" data-layout-allow-overlap="">{esc(T['sub'])}</span>
        </div>
      </div>

      <!-- THE MOVE card -->
      <div id="t-move" class="clip layer" data-start="{C['in']}" data-duration="{round(C['out'] - C['in'], 3)}" data-track-index="3">
        <div class="scrim"></div>
        <div class="move"><span class="k">{esc(C['kicker'])}</span><span class="n">{esc(C['name'])}</span><span class="rule"></span><span class="wk">{esc(C['works'])}</span></div>
      </div>

      <!-- coach's cues (verified on isolated windows, see BRIEF.md) -->
{chr(10).join(caps)}

      <!-- coach chip (only while Carlos is in frame) -->
      <div id="t-chip" class="clip layer" data-start="{CH['in']}" data-duration="{round(CH['out'] - CH['in'], 3)}" data-track-index="5"><div class="chip" id="chip"><span class="nm" id="chip-nm">{esc(CH['name'])}</span><span class="sb" id="chip-sb">{esc(CH['sub'])}</span></div></div>

      <!-- end beat -->
      <div id="t-end" class="clip layer" data-start="{END_AT}" data-duration="{round(TOTAL - END_AT, 3)}" data-track-index="7">
        <div class="card end">
          <img id="end-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <span class="h" id="end-h">{esc(E['handle'])}</span>
        </div>
      </div>

      <!-- audio: room (the spine), then the Different Breed hook on the end beat -->
      <audio id="a-room" src="assets/audio/v-room.m4a" data-start="0" data-duration="{ROOM_D}" data-media-start="0" data-track-index="10" data-volume="1" data-automation="{lane([(0, 0), (0.05, 1), (ROOM_D - 0.2, 1), (ROOM_D, 0)])}"></audio>
      <audio id="a-hook" src="{E['hook_file']}" data-start="{HOOK_AT}" data-duration="{HOOK_D}" data-media-start="{E['hook_src']}" data-track-index="11" data-volume="{E['hook_volume']}" data-automation="{lane([(0, 0), (0.08, 1), (HOOK_D - 0.35, 1), (HOOK_D, 0)])}"></audio>
    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      const CAPS = {caps_js};
      const END = {END_AT};
      const RED = "#e81d1d";
      const CLEAR = "rgba(232,29,29,0)";
      const tl = gsap.timeline({{ paused: true }});

      // slow push on the wrapper, never the video
      tl.fromTo("#fr", {{ scale: {F['zoom']} }}, {{ scale: {F['drift']}, duration: END, ease: "none", immediateRender: true }}, 0);

      // title slam (opacity kept in the to-vars: startAt-only opacity drops on exact frame times)
      const TI = {T['in']}, TO = {T['out']};
      tl.fromTo("#title-scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2 }}, TI);
      tl.fromTo("#title-1", {{ scale: 1.8, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.2, ease: "power4.out" }}, TI + 0.04);
      tl.fromTo("#title-2", {{ scaleX: 0, opacity: 0 }}, {{ scaleX: 1, opacity: 1, duration: 0.24, ease: "expo.out" }}, TI + 0.24);
      tl.fromTo("#title-2 .ln", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.2)" }}, TI + 0.3);
      tl.fromTo("#title-3", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, TI + 0.5);
      tl.fromTo("#title-box", {{ x: 0, opacity: 1, filter: "blur(0px)" }}, {{ x: -1080, opacity: 1, filter: "blur(22px)", duration: 0.16, ease: "power3.in", immediateRender: false }}, TO);
      tl.to("#title-scrim", {{ opacity: 0, duration: 0.14 }}, TO + 0.02);

      // THE MOVE card
      const CI_ = {C['in']}, CO_ = {C['out']};
      tl.fromTo("#t-move .scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "none" }}, CI_);
      tl.fromTo("#t-move .k", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.26, ease: "back.out(2)" }}, CI_);
      tl.fromTo("#t-move .n", {{ y: 60, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power4.out" }}, CI_ + 0.08);
      tl.fromTo("#t-move .rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.36, ease: "expo.out" }}, CI_ + 0.2);
      tl.fromTo("#t-move .wk", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, CI_ + 0.3);
      tl.to("#t-move .move", {{ y: 80, opacity: 0, duration: 0.22, ease: "power3.in" }}, CO_ - 0.24);
      tl.to("#t-move .scrim", {{ opacity: 0, duration: 0.24, ease: "none" }}, CO_ - 0.24);

      // captions: each word arrives as the coach says it, red block rides the active word
      Object.keys(CAPS).forEach((id) => {{
        const words = CAPS[id].words;
        words.forEach((w, i) => {{
          const el = "#" + id + "-w" + i;
          const t = w[1], hero = !!w[2];
          const next = i + 1 < words.length ? words[i + 1][1] : CAPS[id].end;
          tl.fromTo(el, {{ opacity: 0, y: 26, scale: hero ? 1.35 : 1.12 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.16, ease: hero ? "back.out(2.2)" : "power3.out" }}, t);
          tl.fromTo(el, {{ backgroundColor: CLEAR, rotation: 0 }}, {{ backgroundColor: RED, rotation: -2, duration: 0.06, ease: "none" }}, t);
          tl.to(el, {{ backgroundColor: CLEAR, rotation: 0, duration: 0.06, ease: "none" }}, Math.max(t + 0.1, next - 0.02));
        }});
        tl.to("#" + id + " .cap", {{ opacity: 0, duration: 0.12, ease: "none" }}, CAPS[id].end - 0.12);
      }});

      // coach chip
      const HI = {CH['in']}, HO = {CH['out']};
      tl.fromTo("#chip-nm", {{ x: 420, skewX: 12, opacity: 0 }}, {{ x: 0, skewX: 0, opacity: 1, duration: 0.3, ease: "power4.out" }}, HI);
      tl.fromTo("#chip-sb", {{ x: 60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.26, ease: "power3.out" }}, HI + 0.17);
      tl.to("#chip", {{ x: 1080, filter: "blur(18px)", duration: 0.2, ease: "power3.in" }}, HO - 0.22);

      // whip out of the footage into the end beat
      tl.set("#w-main", {{ x: 0, filter: "blur(0px)" }}, 0);
      tl.fromTo("#w-main", {{ x: 0, filter: "blur(0px)" }}, {{ x: -1080, filter: "blur(26px)", duration: 0.18, ease: "power3.in", immediateRender: false }}, END - 0.18);

      // end beat: logo stamps, handle rises
      tl.fromTo("#end-logo", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" }}, END + 0.05);
      tl.fromTo("#end-h", {{ y: 22, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, END + 0.45);
      tl.to("#t-end .card", {{ opacity: 0, duration: 0.25, ease: "none" }}, {TOTAL} - 0.25);

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(doc)
print("wrote index.html", TOTAL, "s")
