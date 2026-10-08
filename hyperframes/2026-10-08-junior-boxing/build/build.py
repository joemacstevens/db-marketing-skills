#!/usr/bin/env python3
"""Generate index.html for the 2026-10-08 "Junior Boxing" reel from build/reel.json.

Source: CJ's IMG_7884 (Wed 10/7 4:18 PM, 4K 120 fps SDR, rotation -90) and IMG_7885 (4:20 PM, 720p30,
iMessage copy). Kids class on the outdoor lot, Coach Don teaching hands up, footwork, the 1-2 and the roll.
Proxies: assets/footage/img7884.mp4 (1080x1920 30 fps, -g 15), img7885.mp4 (720x1280 30 fps, -g 15),
img7884-slow-4680.mp4 (src 46.8-47.9 at 1/4 speed from the native 120 fps frames).

Audio: Don's voice is the spine. Each shot's room audio is its own level-matched file
(assets/audio/v-<shot>.m4a, -20 LUFS, highpass 80 Hz), cut to the shot's exact source window.
Three D's v2 (from 10.0s) is a bed at 0.2 under the voice, up to 0.7 on the slow-mo, fades
before the end tag, then the "Give me DEDICATION" hook (46.7) lands on the end tag. No carve.
"""
import html
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GRADE = (ROOT / "build" / "grade.txt").read_text().strip()  # HTML-escaped grade JSON
R = json.loads((ROOT / "build" / "reel.json").read_text())

SRCS = R["sources"]
END_AT = R["end"]["at"]
TOTAL = round(END_AT + R["end"]["length"], 3)
SHOTS = R["shots"]
for i, s in enumerate(SHOTS):
    nxt = SHOTS[i + 1]["at"] if i + 1 < len(SHOTS) else END_AT
    s["dur"] = round(nxt - s["at"], 3)

# no source moment twice (map slow-mo back to real source time: slow t -> 46.8 + t/4)
def real(s):
    if s["src"] == "a_slow":
        return ("a", 46.8 + s["ms"] / 4, 46.8 + (s["ms"] + s["dur"]) / 4)
    return (s["src"], s["ms"], s["ms"] + s["dur"])

spans = sorted(real(s) + (s["id"],) for s in SHOTS)
for a, b in zip(spans, spans[1:]):
    if a[0] == b[0]:
        assert a[2] <= b[1] + 1e-6, f"source overlap {a} {b}"
LIMIT = {"a": 64.6, "b": 23.3}
for s in spans:
    assert s[2] <= LIMIT[s[0]], f"past end of clip {s}"


def lane(points):
    return html.escape(json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in points]}]}), quote=True)


esc = html.escape

videos = []
for i, s in enumerate(SHOTS):
    origin = s.get("origin", "50% 50%")
    videos.append(
        f'        <div class="fr" id="fr-{s["id"]}" style="transform-origin: {origin}" data-layout-allow-overflow="">'
        f'<video data-color-grading="{GRADE}" id="v-{s["id"]}" class="clip" src="{SRCS[s["src"]]}" data-start="{s["at"]}" data-duration="{s["dur"]}" '
        f'data-media-start="{s["ms"]}" data-track-index="{i % 2}" muted playsinline></video></div>'
    )

T = R["title"]
E = R["end"]
B = R["bed"]

# ── audio ──
audio = []
for k, s in enumerate(s for s in SHOTS if s.get("voice")):
    d = s["dur"]
    audio.append(
        f'      <audio id="a-v-{s["id"]}" src="assets/audio/v-{s["id"]}.m4a" data-start="{s["at"]}" data-duration="{d}" data-media-start="0" '
        f'data-track-index="{10 + k}" data-volume="1" data-automation="{lane([(0, 0), (0.04, 1), (d - 0.05, 1), (d, 0)])}"></audio>'
    )

slow = next(s for s in SHOTS if s["src"] == "a_slow")
SU, SO = slow["at"], slow["at"] + slow["dur"]
BED_END = round(END_AT + 0.1, 3)
under, opn = B["under"], B["open"]
bed_pts = [(0, 0), (0.12, under), (SU - 0.05, under), (SU + 0.2, opn), (SO - 0.2, opn), (SO + 0.05, under),
           (END_AT - 0.35, under), (BED_END, 0)]
audio.append(
    f'      <audio id="a-bed" src="{B["file"]}" data-start="0" data-duration="{BED_END}" data-media-start="{B["src"]}" data-track-index="16" '
    f'data-volume="1" data-automation="{lane(bed_pts)}"></audio>'
)
HOOK_AT = round(END_AT - 0.15, 3)
HOOK_D = round(TOTAL - HOOK_AT, 3)
audio.append(
    f'      <audio id="a-hook" src="{E["hook_file"]}" data-start="{HOOK_AT}" data-duration="{HOOK_D}" data-media-start="{E["hook_src"]}" data-track-index="17" '
    f'data-volume="{E["hook_volume"]}" data-automation="{lane([(0, 0), (0.15, 1), (HOOK_D - 0.45, 1), (HOOK_D, 0)])}"></audio>'
)

# ── cards ──
cards = []
for i, c in enumerate(R["cards"]):
    cards.append(
        f'      <div id="t-{c["id"]}" class="clip layer" data-start="{c["in"]}" data-duration="{round(c["out"] - c["in"], 3)}" data-track-index="{3 + i % 2}">\n'
        f'        <div class="scrim"></div>\n'
        f'        <div class="move"><span class="k">{esc(c["kicker"])}</span><span class="n">{esc(c["name"])}</span><span class="rule"></span><span class="wk">{esc(c["works"])}</span></div>\n'
        f'      </div>'
    )

# ── captions ──
caps = []
for c in R["captions"]:
    start = round(c["words"][0][1] - 0.04, 3)
    spans_html = " ".join(f'<span class="w" id="{c["id"]}-w{i}">{esc(w[0])}</span>' for i, w in enumerate(c["words"]))
    caps.append(
        f'      <div id="{c["id"]}" class="clip layer" data-start="{start}" data-duration="{round(c["end"] - start, 3)}" data-track-index="6"><div class="cap">{spans_html}</div></div>'
    )

CH = R["chip"]
shots_js = json.dumps([{k: s[k] for k in ("id", "at", "dur", "tx", "zoom", "drift")} for s in SHOTS])
cards_js = json.dumps([{"id": c["id"], "in": c["in"], "out": c["out"]} for c in R["cards"]])
caps_js = json.dumps({c["id"]: {"end": c["end"], "words": c["words"]} for c in R["captions"]})

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
      .shot .punch, .shot .fr {{ position: absolute; inset: 0; will-change: transform; }}
      .shot video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      .flash {{ position: absolute; inset: 0; box-shadow: inset 0 0 0 0 var(--red); opacity: 0; }}

      .layer {{ position: absolute; inset: 0; }}
      .shade {{ position: absolute; inset: 0; background: rgba(10, 10, 10, 0.4); }}
      .scrim {{ position: absolute; left: 0; right: 0; top: 0; height: 640px; opacity: 0; background: linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(10,10,10,0.34) 55%, rgba(10,10,10,0)); }}

      /* title */
      .title {{ position: absolute; left: 64px; top: 1060px; width: 940px; transform: rotate(-4deg); transform-origin: left center; }}
      .big {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 150px; line-height: 1.0; white-space: nowrap; color: var(--bone); text-shadow: 10px 10px 0 var(--ink); }}
      .hl {{ display: inline-block; background: var(--red); margin-top: 18px; padding: 8px 34px 16px; box-shadow: 12px 12px 0 var(--ink); transform-origin: left center; }}
      .hl .ln {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 140px; line-height: 1.04; letter-spacing: -0.02em; color: var(--bone); white-space: nowrap; }}

      /* THE MOVE card */
      .move {{ position: absolute; left: 64px; top: 104px; width: 960px; }}
      .move .k {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 32px; letter-spacing: 0.16em; padding: 10px 22px; text-transform: uppercase; }}
      .move .n {{ display: block; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 92px; line-height: 1.02; color: var(--bone); text-shadow: 7px 7px 0 var(--ink); margin-top: 14px; white-space: nowrap; }}
      .move .rule {{ display: block; width: 370px; height: 8px; background: var(--red); margin: 12px 0 12px; transform-origin: left center; }}
      .move .wk {{ display: inline-block; font-weight: 700; font-size: 36px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--bone); background: rgba(10, 10, 10, 0.74); padding: 9px 18px; }}

      /* Don's words, word by word */
      .cap {{ position: absolute; left: 36px; right: 36px; top: 1250px; text-align: center; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 58px; line-height: 1.22; color: var(--bone); text-shadow: 5px 5px 0 var(--ink); }}
      .cap .w {{ display: inline-block; padding: 0 9px; margin: 0 -2px; }}

      /* coach chip */
      .chip {{ position: absolute; left: 64px; top: 1390px; display: flex; flex-direction: column; align-items: flex-start; }}
      .chip .nm {{ display: inline-block; background: var(--red); color: var(--bone); font-weight: 900; font-style: italic; font-size: 60px; line-height: 1.1; letter-spacing: 0.01em; padding: 8px 26px 12px; box-shadow: 8px 8px 0 var(--ink); }}
      .chip .sb {{ display: inline-block; margin-top: 12px; background: var(--ink); color: var(--bone); font-weight: 700; font-size: 30px; letter-spacing: 0.16em; padding: 9px 18px; text-transform: uppercase; }}

      .card {{ position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }}
      .end img {{ display: block; width: 560px; height: 560px; object-fit: contain; }}
      .end .lock {{ display: block; width: 820px; height: auto; margin-top: 56px; }}
      .end .h {{ display: block; margin-top: 54px; font-weight: 400; font-size: 36px; letter-spacing: 0.2em; color: var(--steel); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1080" data-height="1920">

      <!-- footage: {len(SHOTS)} shots from IMG_7884 / IMG_7885, each source moment used once -->
      <div class="shot" id="w-main"><div class="punch" id="punch" data-layout-allow-overflow="">
{chr(10).join(videos)}
      </div><div class="flash" id="flash"></div></div>

      <!-- title -->
      <div id="t-title" class="clip layer" data-start="{T['in']}" data-duration="{round(T['out'] + 0.16 - T['in'], 3)}" data-track-index="2">
        <div class="shade" id="title-shade" style="opacity: 0"></div>
        <div class="title" id="title-box" data-layout-allow-overflow="">
          <span class="big" id="title-1" data-layout-allow-overlap="">{esc(T['line1'])}</span>
          <span class="hl" id="title-2" data-layout-allow-overlap=""><span class="ln" data-layout-allow-overlap="">{esc(T['line2'])}</span></span>
        </div>
      </div>

      <!-- THE MOVE cards -->
{chr(10).join(cards)}

      <!-- Don's calls (verified on isolated windows, see BRIEF.md) -->
{chr(10).join(caps)}

      <!-- coach chip -->
      <div id="t-chip" class="clip layer" data-start="{CH['in']}" data-duration="{round(CH['out'] - CH['in'], 3)}" data-track-index="5"><div class="chip" id="chip"><span class="nm" id="chip-nm">{esc(CH['name'])}</span><span class="sb" id="chip-sb">{esc(CH['sub'])}</span></div></div>

      <!-- end tag -->
      <div id="t-end" class="clip layer" data-start="{END_AT}" data-duration="{round(TOTAL - END_AT, 3)}" data-track-index="7">
        <div class="card end">
          <img id="end-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <img class="lock" id="end-lock" src="assets/brand/lockup-absolutely-different-white.png" alt="What we do is absolutely different">
          <span class="h" id="end-h">@DBELITEFITNESS</span>
        </div>
      </div>

      <!-- audio (track 10+): Don's voice per shot, Three D's bed, Three D's hook on the end tag -->
{chr(10).join(audio)}
    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      const SHOTS = {shots_js};
      const CARDS = {cards_js};
      const CAPS = {caps_js};
      const END = {END_AT};
      const RED = "#e81d1d";
      const CLEAR = "rgba(232,29,29,0)";
      const tl = gsap.timeline({{ paused: true }});

      // per-shot framing: static punch-in plus a slow push (wrapper, never the video)
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

      // title slam (opacity kept in the to-vars: startAt-only opacity drops on exact frame times)
      const TI = {T['in']}, TO = {T['out']};
      tl.fromTo("#title-shade", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.16 }}, TI);
      tl.fromTo("#title-1", {{ scale: 1.8, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.2, ease: "power4.out" }}, TI + 0.04);
      tl.fromTo("#title-2", {{ scaleX: 0, opacity: 0 }}, {{ scaleX: 1, opacity: 1, duration: 0.24, ease: "expo.out" }}, TI + 0.26);
      tl.fromTo("#title-2 .ln", {{ scale: 1.5, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.22, ease: "back.out(2.2)" }}, TI + 0.32);
      tl.fromTo("#title-box", {{ x: 0, opacity: 1, filter: "blur(0px)" }}, {{ x: -1080, opacity: 1, filter: "blur(22px)", duration: 0.16, ease: "power3.in", immediateRender: false }}, TO);
      tl.to("#title-shade", {{ opacity: 0, duration: 0.14 }}, TO + 0.02);

      // THE MOVE cards: kicker pops, name rises, rule draws, works line; exit up
      CARDS.forEach((c) => {{
        const id = "#t-" + c.id;
        tl.fromTo(id + " .scrim", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2, ease: "none" }}, c.in);
        tl.fromTo(id + " .k", {{ scale: 0, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.26, ease: "back.out(2)" }}, c.in);
        tl.fromTo(id + " .n", {{ y: 60, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power4.out" }}, c.in + 0.08);
        tl.fromTo(id + " .rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.36, ease: "expo.out" }}, c.in + 0.2);
        tl.fromTo(id + " .wk", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, c.in + 0.3);
        tl.to(id + " .move", {{ y: -80, opacity: 0, duration: 0.22, ease: "power3.in" }}, c.out - 0.24);
        tl.to(id + " .scrim", {{ opacity: 0, duration: 0.24, ease: "none" }}, c.out - 0.24);
      }});

      // captions: each word arrives as Don says it, red block rides the active word
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
      const CI = {CH['in']}, CO = {CH['out']};
      tl.fromTo("#chip-nm", {{ x: -420, skewX: -12, opacity: 0 }}, {{ x: 0, skewX: 0, opacity: 1, duration: 0.3, ease: "power4.out" }}, CI);
      tl.fromTo("#chip-sb", {{ x: -60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.26, ease: "power3.out" }}, CI + 0.17);
      tl.to("#chip", {{ x: -1080, filter: "blur(18px)", duration: 0.2, ease: "power3.in" }}, CO - 0.22);

      // whip out of the footage into the end tag
      tl.set("#w-main", {{ x: 0, filter: "blur(0px)" }}, 0);
      tl.fromTo("#w-main", {{ x: 0, filter: "blur(0px)" }}, {{ x: -1080, filter: "blur(26px)", duration: 0.18, ease: "power3.in", immediateRender: false }}, END - 0.18);

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
print("wrote index.html", TOTAL, "s; shots", [(s["id"], s["at"], s["src"], s["ms"], s["dur"]) for s in SHOTS])
