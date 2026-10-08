#!/usr/bin/env python3
"""Generate index.html for the Blue Collar 2026 Day One finisher reel (v2).

v1 was cut as "Morning Crew ep. 3"; Joey confirmed 10/8 that IMG_1820 is Blue Collar fight
camp Day 1 (the finisher, five minutes after the 6:02-7:02 AM Day 1 clips) and the coach
counting is Coach P (Pablo: red DB tee, white beanie, blue shorts), not Don.

Source: IMG_1820 (Tue 10/6 7:07 AM, 720p30 HLG, portrait), tonemapped (hable)
proxy at assets/footage/img1820.mp4. Early class on the turf, a row of members on mats
with dumbbells. Three rounds on Coach P's clock:
  src 0.0-5.4   dumbbell toe touch (legs straight up, reach the bell to the toes), count "...seven, eight, nine, ten"
  src 8.5-21.6  dumbbell floor press ("Ready, and work time, work, one, two...")
  src 30.3-43.7 dumbbell V-ups ("...work, one ... nine, and time")

Natural sync everywhere: every audio clip plays the same source range as its picture,
so Coach P's count and the room music stay with the footage (march-cut style, no bed under
the room audio). The anthem hook only lands on the end tag.

Words (WHAT): whisper small.en + medium.en on 8 isolated windows, Parakeet on the full
clip. "Ready, and work time, work, one" agreed on every engine. The V-up coaching line
("don't let your feet touch the ...") never settled on its last word, so nothing of
Coach P's speech is burned in. Text on screen = title, three THE MOVE labels, COACH P chip.
Times (WHEN): Parakeet word starts cross-checked against the RMS envelope; segment
cuts sit in gaps between counts (src 5.5, 15.1, 32.4).
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GRADE = (ROOT / "build" / "grade.txt").read_text().strip()  # HTML-escaped canonical grade JSON

# (id, src_in, src_out) in reel order; reel time accumulates
SEGS = [
    ("toe", 0.0, 5.5),     # opener + title + toe touches, count to ten, "we got time"
    ("press", 8.5, 15.1),  # "ready, and work time, work, one, two, three, four"
    ("vups", 32.4, 43.66), # "one ... nine, and time" (clip end)
]
starts = []
t = 0.0
for _, a, b in SEGS:
    starts.append(round(t, 2))
    t += b - a
END_AT = round(t, 2)       # end tag
TOTAL = round(END_AT + 3.2, 2)
CUTS = starts[1:]          # reel times of the two footage cuts

OPEN_D = 1.5
T_IN, T_OUT = 1.5, 3.0     # title card over footage (45 frames)

# THE MOVE labels: (id, n, name lines, works line, reel in, reel out)
MOVES = [
    ("m1", "01", ["DUMBBELL", "TOE TOUCH"], "Upper abs · core", 3.05, starts[1] - 0.12),
    ("m2", "02", ["DUMBBELL", "FLOOR PRESS"], "Chest · shoulders · triceps", starts[1] + 1.6, starts[2] - 0.15),
    ("m3", "03", ["DUMBBELL", "V-UPS"], "Abs · hip flexors", starts[2] + 0.35, starts[2] + 4.6),
]


# COACH P chip: reel 17.0-20.4 = src 37.3-40.7 ("five, (feet) to the ground, six, don't let your feet touch...")
CHIP_IN, CHIP_OUT = 17.0, 20.4


def lane(points):
    return html.escape(json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in points]}]}), quote=True)


# V-ups ran ~3 dB under the first two rounds (Coach P farther from the phone)
SEG_VOL = {"toe": 1.0, "press": 1.0, "vups": 1.41}

videos, audio = [], []
for i, (sid, a, b) in enumerate(SEGS):
    d = round(b - a, 2)
    videos.append(
        f'        <video data-color-grading="{GRADE}" id="v-{sid}" class="clip" src="assets/footage/img1820.mp4" data-start="{starts[i]}" '
        f'data-duration="{d}" data-media-start="{a}" data-track-index="{i % 2}" muted playsinline></video>'
    )
    fin = 0.0 if i == 0 else 0.05
    fout = 0.06 if i < len(SEGS) - 1 else 0.1  # keep "and time" whole
    g = SEG_VOL[sid]  # gain lives in the lane: the renderer ignores data-volume once a volume lane exists
    pts = [(0, 0), (fin, g), (d - fout, g), (d, 0)] if fin else [(0, g), (d - fout, g), (d, 0)]
    audio.append(
        f'      <audio id="a-{sid}" src="assets/audio/room-1820.m4a" data-start="{starts[i]}" data-duration="{d}" data-media-start="{a}" '
        f'data-track-index="{10 + i % 2}" data-volume="1" data-automation="{lane(pts)}"></audio>'
    )

HOOK_AT = round(END_AT - 0.15, 2)   # "We" (song 48.96) lands as the logo stamps
HOOK_D = round(TOTAL - HOOK_AT, 2)
HOOK_G = 0.57   # hook sat ~8 dB over the room audio at 1.0
audio.append(
    f'      <audio id="a-hook" src="assets/audio/different-breed-song.mp3" data-start="{HOOK_AT}" data-duration="{HOOK_D}" data-media-start="48.8" '
    f'data-track-index="12" data-volume="1" data-automation="{lane([(0, 0), (0.15, HOOK_G), (HOOK_D - 0.45, HOOK_G), (HOOK_D, 0)])}"></audio>'
)

moves_html = []
for mid, n, name, works, a, b in MOVES:
    lines = "".join(f'<span class="ln" data-layout-allow-overlap="">{html.escape(x)}</span>' for x in name)
    moves_html.append(
        f'      <div id="t-{mid}" class="clip layer" data-start="{round(a, 2)}" data-duration="{round(b - a, 2)}" data-track-index="{3 + MOVES.index((mid, n, name, works, a, b)) % 2}">'
        f'<div class="scrim" id="{mid}-scrim"></div>'
        f'<div class="move" id="{mid}-box" data-layout-allow-overflow=""><span class="k">THE MOVE · {n}/03</span>'
        f'<span class="n">{lines}</span><span class="rule"></span><span class="wk">{html.escape(works)}</span></div></div>'
    )

moves_js = ",\n".join(f'        ["{mid}", {round(a, 2)}, {round(b - a, 2)}]' for mid, _, _, _, a, b in MOVES)

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
      .shot .punch, .shot .push {{ position: absolute; inset: 0; will-change: transform, filter; }}
      .shot video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      .flash {{ position: absolute; inset: 0; box-shadow: inset 0 0 0 0 var(--red); opacity: 0; }}

      .layer {{ position: absolute; inset: 0; }}
      .shade {{ position: absolute; inset: 0; background: rgba(10, 10, 10, 0.4); }}

      /* title */
      .title {{ position: absolute; left: 64px; top: 392px; width: 960px; transform: rotate(-3deg); transform-origin: left center; }}
      .title .kick {{ display: inline-block; background: var(--ink); color: var(--bone); font-weight: 700; font-size: 30px; letter-spacing: 0.18em; padding: 8px 20px; text-transform: uppercase; }}
      .big {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 104px; line-height: 1.0; white-space: nowrap; color: var(--bone); text-shadow: 9px 9px 0 var(--ink); margin-top: 8px; }}
      .hl {{ display: inline-block; background: var(--red); margin-top: 8px; padding: 6px 26px 12px; box-shadow: 9px 9px 0 var(--ink); transform-origin: left center; }}
      .hl .ln {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 84px; line-height: 1.05; letter-spacing: -0.01em; white-space: nowrap; color: var(--bone); }}

      /* THE MOVE labels (top third, over the gym, clear of the mats) */
      .scrim {{ position: absolute; left: 0; right: 0; top: 0; height: 820px; background: linear-gradient(to bottom, rgba(10,10,10,0.62) 0%, rgba(10,10,10,0.45) 55%, rgba(10,10,10,0) 100%); }}
      .move {{ position: absolute; left: 72px; top: 230px; width: 940px; }}
      .move .k {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 32px; letter-spacing: 0.16em; padding: 10px 22px; }}
      .move .n {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 104px; line-height: 0.9; color: var(--bone); text-shadow: 8px 8px 0 var(--ink); margin-top: 18px; }}
      .move .n .ln {{ display: block; line-height: 1.02; white-space: nowrap; }}
      .move .rule {{ display: block; width: 370px; height: 8px; background: var(--red); margin: 20px 0 16px; transform-origin: left center; }}
      .move .wk {{ display: inline-block; font-weight: 700; font-size: 36px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.74); padding: 9px 18px; }}

      /* COACH P chip: right of him at the top of frame while his count is the main sound */
      .chip {{ position: absolute; left: 330px; top: 250px; }}
      .chip .nm {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 64px; line-height: 1.1; padding: 10px 28px 14px; box-shadow: 8px 8px 0 var(--ink); transform-origin: left center; white-space: nowrap; }}

      .card {{ position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }}
      .end img {{ display: block; width: 560px; height: 560px; object-fit: contain; }}
      .end .lock {{ display: block; width: 820px; height: auto; margin-top: 56px; }}
      .end .h {{ display: block; margin-top: 54px; font-weight: 400; font-size: 36px; letter-spacing: 0.2em; color: var(--steel); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">

      <!-- footage (tracks 0-1): IMG_1820, three natural-sync segments -->
      <div class="shot" id="w-main"><div class="punch" id="punch" data-layout-allow-overflow=""><div class="push" id="push" data-layout-allow-overflow="">
{chr(10).join(videos)}
      </div></div><div class="flash" id="flash"></div></div>

      <!-- title (45 frames, after 1.5s of clean footage) -->
      <div id="t-title" class="clip layer" data-start="{T_IN}" data-duration="{round(T_OUT - T_IN, 2)}" data-track-index="2">
        <div class="shade" id="title-shade" style="opacity: 0"></div>
        <div class="title" id="title-box" data-layout-allow-overflow="">
          <span class="kick" id="title-k">Blue Collar 2026</span>
          <span class="big" id="title-1" data-layout-allow-overlap="">DAY ONE</span>
          <span class="hl" id="title-2" data-layout-allow-overlap=""><span class="ln" data-layout-allow-overlap="">FINISHER</span></span>
        </div>
      </div>

      <!-- THE MOVE labels -->
{chr(10).join(moves_html)}

      <!-- COACH P chip (he's on screen top-left, counting the V-ups) -->
      <div id="t-coach" class="clip layer" data-start="{CHIP_IN}" data-duration="{round(CHIP_OUT - CHIP_IN, 2)}" data-track-index="5">
        <div class="chip" id="chip-box"><span class="nm" id="chip-nm">Coach P</span></div>
      </div>

      <!-- end tag -->
      <div id="t-end" class="clip layer" data-start="{END_AT}" data-duration="{round(TOTAL - END_AT, 2)}" data-track-index="6">
        <div class="card end">
          <img id="end-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <img class="lock" id="end-lock" src="assets/brand/lockup-absolutely-different-white.png" alt="What we do is absolutely different">
          <span class="h" id="end-h">@DBELITEFITNESS</span>
        </div>
      </div>

      <!-- audio (track 10+): room audio in natural sync, hook on the end tag -->
{chr(10).join(audio)}
    </div>

    <script>
      const MOVES = [
{moves_js}
      ];
      const CUTS = {json.dumps(CUTS)};

      const tl = gsap.timeline({{ paused: true }});

      // slow push across the footage (inner wrapper, never the timed video)
      tl.fromTo("#push", {{ scale: 1.0 }}, {{ scale: 1.07, duration: {END_AT}, ease: "none" }}, 0);

      // segment cuts: quick blur dip + punch + red edge flash
      tl.set("#punch", {{ scale: 1, filter: "blur(0px)" }}, 0);
      tl.set("#flash", {{ opacity: 0 }}, 0);
      CUTS.forEach((c) => {{
        tl.fromTo("#punch", {{ scale: 1.0, filter: "blur(0px)" }}, {{ scale: 1.05, filter: "blur(16px)", duration: 0.1, ease: "power2.in", immediateRender: false }}, c - 0.1);
        tl.fromTo("#punch", {{ scale: 1.05, filter: "blur(16px)" }}, {{ scale: 1.0, filter: "blur(0px)", duration: 0.2, ease: "power3.out", immediateRender: false }}, c);
        tl.fromTo("#flash", {{ opacity: 1, boxShadow: "inset 0 0 0 24px #e81d1d" }}, {{ opacity: 0, boxShadow: "inset 0 0 0 0px #e81d1d", duration: 0.3, ease: "power2.out", immediateRender: false }}, c);
      }});

      // title: slam in, hold, whip out
      tl.fromTo("#title-shade", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.14 }}, {T_IN});
      tl.fromTo("#title-k", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" }}, {T_IN} + 0.02);
      tl.fromTo("#title-1", {{ scale: 1.8, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.2, ease: "power4.out" }}, {T_IN} + 0.06);
      tl.fromTo("#title-2", {{ scaleX: 0, opacity: 0 }}, {{ scaleX: 1, opacity: 1, duration: 0.24, ease: "expo.out" }}, {T_IN} + 0.2);
      tl.fromTo("#title-box", {{ x: 0, filter: "blur(0px)" }}, {{ x: -1100, filter: "blur(22px)", duration: 0.16, ease: "power3.in", immediateRender: false }}, {T_OUT} - 0.17);
      tl.fromTo("#title-shade", {{ opacity: 1 }}, {{ opacity: 0, duration: 0.14, immediateRender: false }}, {T_OUT} - 0.15);

      // THE MOVE: kicker pops, name rises, rule draws, works line slides; lifts out
      MOVES.forEach(([id, at, dur]) => {{
        tl.fromTo("#" + id + "-scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "none" }}, at);
        tl.fromTo("#" + id + "-box .k", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.26, ease: "back.out(2)" }}, at + 0.02);
        tl.fromTo("#" + id + "-box .n", {{ y: 60, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power4.out" }}, at + 0.1);
        tl.fromTo("#" + id + "-box .rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.36, ease: "expo.out" }}, at + 0.22);
        tl.fromTo("#" + id + "-box .wk", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, at + 0.32);
        tl.fromTo("#" + id + "-box", {{ y: 0, opacity: 1 }}, {{ y: -80, opacity: 0, duration: 0.22, ease: "power3.in", immediateRender: false }}, at + dur - 0.24);
        tl.fromTo("#" + id + "-scrim", {{ opacity: 1 }}, {{ opacity: 0, duration: 0.24, ease: "none", immediateRender: false }}, at + dur - 0.24);
      }});

      // COACH P chip
      tl.fromTo("#chip-nm", {{ scaleX: 0, opacity: 0 }}, {{ scaleX: 1, opacity: 1, duration: 0.3, ease: "expo.out" }}, {CHIP_IN} + 0.02);
      tl.fromTo("#chip-box", {{ x: 0, opacity: 1, filter: "blur(0px)" }}, {{ x: -700, opacity: 1, filter: "blur(16px)", duration: 0.18, ease: "power3.in", immediateRender: false }}, {CHIP_OUT} - 0.2);

      // whip out of the footage into the end tag
      tl.set("#w-main", {{ x: 0, filter: "blur(0px)" }}, 0);
      tl.fromTo("#w-main", {{ x: 0, filter: "blur(0px)" }}, {{ x: -1080, filter: "blur(26px)", duration: 0.18, ease: "power3.in", immediateRender: false }}, {END_AT} - 0.18);

      // end tag: logo stamps, lockup and handle rise
      const E = {END_AT};
      tl.fromTo("#end-logo", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" }}, E + 0.05);
      tl.fromTo("#end-lock", {{ y: 26, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power3.out" }}, E + 0.5);
      tl.fromTo("#end-h", {{ y: 22, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, E + 0.8);
      tl.fromTo("#t-end .card", {{ opacity: 1 }}, {{ opacity: 0, duration: 0.3, ease: "none", immediateRender: false }}, {TOTAL} - 0.3);

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(ROOT / "index.html").write_text(doc)
print("wrote index.html", TOTAL, "s; segments at", starts, "end tag", END_AT)
