#!/usr/bin/env python3
"""Builds index.html for a Motivational Monday reel. Everything week-specific lives in build/week.json.

Pipeline (see campaigns/motivational-monday/TEMPLATE.md):
  bash build/make-proxies.sh            # footage proxies from week.json "clips"
  python3 build/vo-words.py ...          # VO word onsets -> build/vo-words.json
  python3 build/build.py                 # bed cut + index.html + carve (EQ lanes only)
  npx hyperframes check

Time specs in week.json: a number (reel seconds), "b:N" (beat N of the music grid), "w:I" (VO word I onset - 0.03).
Shape (fixed every week): footage opener 0-~1.5, title slam over the same shot, VO from vo.at with word-by-word
captions on a dark plate, 2-3 hit words slammed big, the music drop right after the last VO word, a short VO-free
montage, then the house end tag with the "We are Different Breed" hook.
"""
import html
import json
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
W = json.load(open(os.path.join(HERE, "week.json")))
VO = W["vo"]
MUS = W["music"]
WORDS = json.load(open(os.path.join(ROOT, VO["words"])))  # [[parakeet text, vo-file seconds], ...]
BEAT = MUS["beat"]
LEAD = 0.03  # a cut lands a frame ahead of its word so the new shot carries it


def T(spec):
    if isinstance(spec, (int, float)):
        return float(spec)
    kind, n = spec.split(":")
    if kind == "b":
        return round(MUS.get("beat0", 0.0) + int(n) * BEAT, 3)
    if kind == "w":
        return round(VO["at"] + WORDS[int(n)][1] - LEAD, 3)
    raise ValueError(spec)


def esc(obj):
    return html.escape(json.dumps(obj, separators=(",", ":")), quote=True)


TITLE_AT = T(W["title"]["at"])
DROP = T(MUS["drop"])
END = T(W["end"]["at"])
TOTAL = round(END + W["end"]["length"], 3)
SHOTS = W["shots"]
FRAMES = {c["id"]: c.get("frame", "fill") for c in W["clips"]}
KICK = T(SHOTS[1]["at"])  # first cut after the opener = title out
VO_AT = VO["at"]


def cut_bed():
    """Cut the bed from the full track (sample-accurate decode seek, WAV so there is no mp3 priming offset)."""
    out = os.path.join(ROOT, "assets/audio/bed.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", os.path.join(ROOT, MUS["file"]), "-ss",
                    f"{MUS['src_at_reel0']:.3f}", "-t", f"{END + 0.25:.3f}", "-ac", "2", "-ar", "44100",
                    out], check=True)
    return "assets/audio/bed.wav"


def main():
    bed_src = cut_bed()
    base_grade = json.load(open(os.path.join(HERE, "grade-lite.json")))

    # ── shots ──
    starts = [T(s["at"]) for s in SHOTS]
    assert starts == sorted(starts), "shots out of order"
    slots = list(zip(starts, starts[1:] + [END]))
    shots_html, slot_js = [], []
    prev_clip = None
    for i, ((a, b), s) in enumerate(zip(slots, SHOTS)):
        clip = s.get("clip")
        assert clip is None or clip != prev_clip, f"same clip back to back at slot {i}"
        prev_clip = clip
        win = FRAMES.get(clip) == "window45"
        slot_js.append({"a": round(a, 3), "b": round(b, 3), "z": s.get("zoom", 1.0), "fx": s.get("fx", ""),
                        "tx": s.get("tx", ""), "fade": s.get("fade_in", 0), "black": clip is None, "win": win})
        if clip is None:
            continue
        g = json.loads(json.dumps(base_grade))
        for k, v in (s.get("grade") or {}).items():
            g["adjust"][k] = v
        src = f"assets/footage/{clip}.mp4"
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                    os.path.join(ROOT, src)], capture_output=True, text=True).stdout)
        assert s["ms"] + (b - a) <= dur + 0.01, f"slot {i} {clip}: ms {s['ms']} + {b - a:.2f}s runs past proxy {dur}"
        # window45: blurred fill (its own proxy, no push) behind a 4:5 window at y=285 that carries the push
        bg = (f'<video id="vb{i}" class="clip bgv" src="assets/footage/{clip}-bg.mp4" data-start="{a:.3f}" '
              f'data-duration="{b - a:.3f}" data-media-start="{s["ms"]:.3f}" data-track-index="{20 + i % 2}" '
              f'muted playsinline></video>') if win else ""
        shots_html.append(
            f'      <div class="shot{" win" if win else ""}" id="w{i}">{bg}<div class="push" data-layout-allow-overflow="">'
            f'<video data-color-grading="{esc(g)}" id="v{i}" class="clip" src="{src}" '
            f'data-start="{a:.3f}" data-duration="{b - a:.3f}" data-media-start="{s["ms"]:.3f}" '
            f'data-track-index="{i % 2}" style="object-position: {s.get("pos", "50% 50%")}" muted playsinline></video>'
            f'</div></div>')

    # ── hits ──
    hits = []
    for n, h in enumerate(W["hits"]):
        hits.append({"id": f"h{n}", "word": h["word"], "text": h["text"], "a": T(h["at"]), "b": T(h["until"]),
                     "style": h["style"]})
    hit_at_word = {h["word"] for h, src in zip(hits, W["hits"]) if src["at"].startswith("w:")}
    hits_html = []
    for h in hits:
        hits_html.append(
            f'      <div id="t-{h["id"]}" class="clip layer" data-start="{h["a"]:.3f}" data-duration="{h["b"] - h["a"]:.3f}" '
            f'data-track-index="8"><div class="hit {h["style"]}"><span class="ht" id="{h["id"]}-t" '
            f'data-layout-allow-overflow="">{html.escape(h["text"])}</span></div></div>')

    # ── captions: chunked, word by word; a chunk that is only an at-the-word hit word is replaced by the slam ──
    groups, wi = [], 0
    for ch in VO["chunks"]:
        grp = []
        for word in ch:
            grp.append((wi, word, round(VO_AT + WORDS[wi][1], 3)))
            wi += 1
        groups.append(grp)
    assert wi == len(WORDS), f"chunks cover {wi} words, VO has {len(WORDS)}"
    script_words = VO["script"].replace("  ", " ").split(" ")
    assert [w for c in VO["chunks"] for w in c] == script_words, "chunks must spell vo.script exactly"
    for c in VO["chunks"]:  # 68px NORD Black Italic: ~14 characters fill the 1000px caption line
        assert len(" ".join(c)) <= 14, f"caption chunk too long for one line: {c}"
    vo_end = round(VO_AT + WORDS[-1][1] + 0.6, 3)
    emph = set(VO.get("emphasis", []))
    caps_html, cap_data, cap_end = [], {}, {}
    for n, grp in enumerate(groups):
        if len(grp) == 1 and grp[0][0] in hit_at_word:
            continue
        start = grp[0][2] - LEAD
        end = groups[n + 1][0][2] - LEAD if n + 1 < len(groups) else min(DROP, vo_end) - 0.02
        cid = f"c{n}"
        cap_end[cid] = round(end, 3)
        spans = " ".join(f'<span class="w" id="{cid}-w{k}">{html.escape(t.upper())}</span>'
                         for k, (_, t, _) in enumerate(grp))
        caps_html.append(f'      <div id="{cid}" class="clip layer" data-start="{start:.3f}" '
                         f'data-duration="{end - start:.3f}" data-track-index="4"><div class="cap">{spans}</div></div>')
        cap_data[cid] = [[t, round(tt - LEAD, 3), t in emph] for _, t, tt in grp]

    # ── audio ──
    lv = MUS["levels"]
    assert abs(lv[-1][0] - END) < 0.1, "music levels should end at the end tag"
    bed_auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": t, "v": v} for t, v in lv]}]}
    hook_len = TOTAL - END + 0.16
    hook_auto = {"version": 1, "lanes": [{"target": "volume", "points": [
        {"t": 0, "v": 0}, {"t": 0.08, "v": 1}, {"t": hook_len - 0.6, "v": 1}, {"t": hook_len, "v": 0}]}]}
    vo_dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                   os.path.join(ROOT, VO["file"])], capture_output=True, text=True).stdout)
    assert VO_AT + vo_dur - 0.3 < DROP + 0.05, f"VO runs into the drop ({VO_AT + vo_dur - 0.3:.2f} vs {DROP})"

    t = W["title"]
    page = TEMPLATE
    rep = {
        "%TOTAL%": f"{TOTAL}",
        "%SHOTS%": "\n".join(shots_html),
        "%CAPS%": "\n".join(caps_html),
        "%HITS%": "\n".join(hits_html),
        "%END%": f"{END}",
        "%END_DUR%": f"{TOTAL - END:.3f}",
        "%BED_SRC%": bed_src,
        "%BED_DUR%": f"{END + 0.02:.3f}",
        "%BED_AUTO%": esc(bed_auto),
        "%VO_SRC%": VO["file"],
        "%VO_AT%": f"{VO_AT}",
        "%VO_DUR%": f"{vo_dur:.3f}",
        "%VO_VOL%": f"{VO.get('volume', 1.4)}",
        "%HOOK_SRC%": W["end"]["hook_file"],
        "%HOOK_IN%": f"{W['end']['hook_src']}",
        "%HOOK_AT%": f"{END - 0.16:.3f}",
        "%HOOK_DUR%": f"{hook_len:.3f}",
        "%HOOK_AUTO%": esc(hook_auto),
        "%CAPTIONS%": json.dumps(cap_data),
        "%CAP_END%": json.dumps(cap_end),
        "%SLOTS%": json.dumps(slot_js),
        "%HITS_JS%": json.dumps([{k: h[k] for k in ("id", "a", "b", "style")} for h in hits]),
        "%DROP%": f"{DROP}",
        "%BEAT%": f"{BEAT}",
        "%TITLE_AT%": f"{TITLE_AT}",
        "%TITLE_DUR%": f"{KICK - TITLE_AT:.3f}",
        "%KICK%": f"{KICK}",
        "%T_KICKER%": html.escape(t["kicker"]),
        "%T_SUB%": html.escape(t["sub"]),
        "%T_L1%": html.escape(t["line1"]),
        "%T_L2%": html.escape(t["line2"]),
        "%MUSIC_NOTE%": MUS.get("_credit", ""),
    }
    page = TEMPLATE
    for k, v in rep.items():
        page = page.replace(k, v)
    left = re.findall(r"%[A-Z0-9_]+%", page)
    assert not left, f"unreplaced {left}"
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    print(f"wrote index.html: {len(slots)} slots, total {TOTAL}s, title {TITLE_AT}, kick {KICK}, drop {DROP}, "
          f"end {END}, VO {VO_AT}-{VO_AT + vo_dur:.2f}")
    for i, ((a, b), s) in enumerate(zip(slots, SHOTS)):
        print(f"  {i:2d} {a:6.3f}-{b:6.3f} ({b - a:.2f}s) {s.get('clip') or 'BLACK':8s} ms {s.get('ms', 0):.2f}  "
              f"{s.get('note', '')}")
    for h in hits:
        print(f"  hit {h['text']:7s} {h['a']:.3f}-{h['b']:.3f} ({h['style']})")
    carve_bed()


def carve_bed():
    """Carve EQ room for the VO in the bed, then drop carve's level lane: the explicit duck lane already sets the
    balance and the two stack (It's Just Work 10/3). EQ lanes only."""
    subprocess.run(["node", os.path.expanduser("~/.agents/skills/hyperframes-audio/scripts/carve.mjs"), "--comp",
                    os.path.join(ROOT, "index.html"), "--bed", "a-bed", "--voice", "a-vo"], check=True,
                   capture_output=True)
    path = os.path.join(ROOT, "index.html")
    h = open(path).read()
    tag = re.search(r'<audio id="a-bed"[^>]*>', h).group(0)
    chain = json.loads(html.unescape(re.search(r'data-fx-chain="([^"]*)"', tag).group(1)))
    level = [n["id"] for n in chain["nodes"] if n["type"] == "gain" and n.get("fromCarve")]
    for n in chain["nodes"]:
        if n["id"] in level:
            n["params"]["gain"] = 0
    auto = json.loads(html.unescape(re.search(r'data-automation="([^"]*)"', tag).group(1)))
    auto["lanes"] = [l for l in auto["lanes"] if l["target"] not in {"fx." + i + ".gain" for i in level}]
    new = re.sub(r'data-fx-chain="[^"]*"', lambda m: f'data-fx-chain="{esc(chain)}"', tag)
    new = re.sub(r'data-automation="[^"]*"', lambda m: f'data-automation="{esc(auto)}"', new)
    open(path, "w").write(h.replace(tag, new))
    print(f"carved bed: EQ lanes {len(auto['lanes']) - 1}, level lane(s) {level} removed")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-Book.otf"); font-weight: 400; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-Bold.otf"); font-weight: 700; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-Black.otf"); font-weight: 900; }
      @font-face { font-family: "NORD"; src: url("assets/fonts/NORD-BlackItalic.otf"); font-weight: 900; font-style: italic; }
      :root { --ink: #0a0a0a; --red: #e81d1d; --bone: #f6f2ec; --steel: #b8b2a8; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: var(--ink); }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink); font-family: "NORD", sans-serif; }

      .shot { position: absolute; inset: 0; overflow: hidden; will-change: transform, filter, opacity; }
      .shot .push { position: absolute; inset: 0; will-change: transform; }
      .shot video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      /* window45: 4:5 window (1080x1350) at y=285 over the blurred fill; the push scales the window only */
      .shot.win .push { inset: auto; left: 0; top: 285px; width: 1080px; height: 1350px; box-shadow: 0 -18px 40px rgba(10,10,10,0.55), 0 18px 40px rgba(10,10,10,0.55); }
      .flash { position: absolute; inset: 0; background: var(--bone); opacity: 0; pointer-events: none; }
      .vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 70% at 50% 45%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.55) 100%); }
      .layer { position: absolute; inset: 0; }

      /* title */
      .shade { position: absolute; inset: 0; background: rgba(10, 10, 10, 0.5); opacity: 0; }
      .title { position: absolute; left: 64px; top: 470px; width: 952px; }
      .title .k { display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 30px; letter-spacing: 0.16em; text-transform: uppercase; padding: 10px 22px; box-shadow: 6px 6px 0 var(--ink); transform-origin: left center; }
      .title .l1 { display: block; margin-top: 26px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 104px; line-height: 0.95; white-space: nowrap; color: var(--bone); text-shadow: 8px 8px 0 var(--ink); }
      .title .l2 { display: block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 186px; line-height: 0.95; white-space: nowrap; color: var(--red); text-shadow: 10px 10px 0 var(--ink); }

      /* captions */
      .cap { position: absolute; left: 40px; right: 40px; top: 1050px; text-align: center; font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 68px; line-height: 1.22; white-space: nowrap; color: var(--bone); text-shadow: 4px 4px 0 var(--ink); }
      .cap .w { display: inline-block; padding: 0 14px; margin: 0 -2px; background: rgba(10, 10, 10, 0.66); }

      /* hit words */
      .hit { position: absolute; left: 0; right: 0; top: 760px; text-align: center; }
      .hit .ht { display: inline-block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; white-space: nowrap; line-height: 1; }
      .hit.black .ht { font-size: 250px; color: var(--red); text-shadow: 0 0 60px rgba(232, 29, 29, 0.55); }
      .hit.block .ht { font-size: 176px; color: var(--bone); background: var(--red); padding: 10px 40px 26px 30px; box-shadow: 12px 12px 0 var(--ink); }
      .hit.drop .ht { font-size: 196px; color: var(--bone); background: var(--red); padding: 10px 40px 26px 30px; box-shadow: 12px 12px 0 var(--ink); }

      /* end tag */
      .card { position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .end img { display: block; width: 560px; height: 560px; object-fit: contain; }
      .end .lock { display: block; width: 820px; margin-top: 56px; }
      .end .h { display: block; margin-top: 54px; font-weight: 400; font-size: 36px; letter-spacing: 0.2em; color: var(--steel); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%TOTAL%" data-width="1080" data-height="1920">

      <!-- ─── footage (tracks 0/1, one shot per cell; a BLACK slot is an empty gap over the ink root) ─── -->
%SHOTS%
      <div class="vig"></div>
      <div class="flash" id="flash"></div>

      <!-- ─── title ─── -->
      <div id="t-title" class="clip layer" data-start="%TITLE_AT%" data-duration="%TITLE_DUR%" data-track-index="2">
        <div class="shade" id="title-shade"></div>
        <div class="title" id="title-box">
          <span class="k" id="title-k" data-layout-allow-overflow="">%T_KICKER% · %T_SUB%</span>
          <span class="l1" id="title-1" data-layout-allow-overlap="" data-layout-allow-overflow="">%T_L1%</span>
          <span class="l2" id="title-2" data-layout-allow-overlap="" data-layout-allow-overflow="">%T_L2%</span>
        </div>
      </div>

      <!-- ─── captions (VO, word by word) ─── -->
%CAPS%

      <!-- ─── hit words ─── -->
%HITS%

      <!-- ─── end tag ─── -->
      <div id="t-end" class="clip layer" data-start="%END%" data-duration="%END_DUR%" data-track-index="6">
        <div class="card end">
          <img id="end-logo" src="assets/brand/db-logo.png" alt="Different Breed Elite Fitness">
          <img class="lock" id="end-lock" src="assets/brand/lockup-absolutely-different-white.png" alt="What we do is absolutely different">
          <span class="h" id="end-h">@DBELITEFITNESS</span>
        </div>
      </div>

      <!-- ─── audio ─── -->
      <audio id="a-bed" src="%BED_SRC%" data-start="0" data-duration="%BED_DUR%" data-media-start="0" data-track-index="10" data-volume="1" data-automation="%BED_AUTO%"></audio>
      <audio id="a-vo" src="%VO_SRC%" data-start="%VO_AT%" data-duration="%VO_DUR%" data-media-start="0" data-track-index="12" data-volume="%VO_VOL%"></audio>
      <audio id="a-hook" src="%HOOK_SRC%" data-start="%HOOK_AT%" data-duration="%HOOK_DUR%" data-media-start="%HOOK_IN%" data-track-index="13" data-volume="1" data-automation="%HOOK_AUTO%"></audio>
    </div>

    <script>
      // Motivational Monday (generated by build/build.py from build/week.json, do not hand-edit).
      // Music: %MUSIC_NOTE%
      const CAPTIONS = %CAPTIONS%;
      const CAP_END = %CAP_END%;
      const SLOTS = %SLOTS%;
      const HITS = %HITS_JS%;
      const DROP = %DROP%;
      const BEAT = %BEAT%;

      const tl = gsap.timeline({ paused: true });
      const RED = "#e81d1d";
      const CLEAR = "rgba(10,10,10,0.66)";

      tl.set(".shot", { x: 0, y: 0, opacity: 1, filter: "blur(0px) brightness(1)" }, 0);

      // ── shots: slow push; impact cuts land with a punch-in + shake; after the drop every cut punches ──
      SLOTS.forEach((s, i) => {
        if (s.black) return;
        const w = "#w" + i + " .push";
        const d = s.b - s.a;
        // window45 shots (landscape 4K in a 4:5 window) get a much lighter push: 1.0 -> 1.03, punch-in <= 1.08
        const P = s.win ? { from: 1.0, to: 1.03, punch: 1.08, land: 1.0 } : { from: 1.02, to: 1.1, punch: 1.22, land: 1.04 };
        // window45 wrappers are untimed divs (videos can't nest in a timed element), so their seam box-shadow
        // would paint over every other shot all reel long: show the wrapper only during its own slot
        if (s.win) {
          tl.set("#w" + i, { visibility: "hidden" }, 0);
          tl.set("#w" + i, { visibility: "visible" }, s.a);
          tl.set("#w" + i, { visibility: "hidden" }, s.b);
        }
        if (s.fx === "impact") {
          tl.fromTo(w, { scale: s.z * P.punch }, { scale: s.z * P.land, duration: Math.min(0.3, d), ease: "expo.out" }, s.a);
          if (d > 0.45) tl.to(w, { scale: s.z * P.to, duration: d - 0.3, ease: "none" }, s.a + 0.3);
          tl.fromTo("#w" + i, { x: -24, y: 10 }, { x: 0, y: 0, duration: 0.32, ease: "elastic.out(1.2, 0.3)", immediateRender: false }, s.a);
        } else {
          tl.fromTo(w, { scale: s.z * P.from }, { scale: s.z * P.to, duration: d, ease: "none" }, s.a);
        }
        if (i === 0) return;
        const prev = SLOTS[i - 1];
        if (s.fade) {
          tl.fromTo("#w" + i, { opacity: 0 }, { opacity: 1, duration: s.fade, ease: "power2.out", immediateRender: false }, s.a);
        } else if (s.tx === "whip" && !prev.black) {
          const dir = i % 2 ? 1 : -1;
          tl.fromTo("#w" + (i - 1), { x: 0, filter: "blur(0px) brightness(1)" }, { x: -1080 * dir, filter: "blur(24px) brightness(1)", duration: 0.14, ease: "power3.in", immediateRender: false }, s.a - 0.14);
          tl.fromTo("#w" + i, { x: 1080 * dir, filter: "blur(24px) brightness(1)" }, { x: 0, filter: "blur(0px) brightness(1)", duration: 0.18, ease: "power3.out", immediateRender: false }, s.a);
        } else {
          tl.fromTo("#w" + i, { filter: "blur(0px) brightness(1.5)" }, { filter: "blur(0px) brightness(1)", duration: 0.22, ease: "power2.out", immediateRender: false }, s.a);
        }
        if (s.fx === "impact" && Math.abs(s.a - DROP) < 0.05) {
          tl.fromTo("#flash", { opacity: 0.9 }, { opacity: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, s.a);
        }
      });

      // ── title slam (over the opener) ──
      tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.16 }, %TITLE_AT%);
      tl.fromTo("#title-k", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.24, ease: "expo.out" }, %TITLE_AT%);
      tl.fromTo("#title-1", { scale: 1.9, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.26, ease: "power4.out" }, %TITLE_AT% + 0.04);
      tl.fromTo("#title-2", { scale: 2.2, opacity: 0, rotation: -9 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.3, ease: "power4.out" }, %TITLE_AT% + %BEAT% / 2);
      tl.fromTo("#title-box", { x: 0, filter: "blur(0px)" }, { x: -1080, filter: "blur(22px)", duration: 0.16, ease: "power3.in" }, %KICK% - 0.16);
      tl.to("#title-shade", { opacity: 0, duration: 0.16, ease: "none" }, %KICK% - 0.16);

      // ── captions: each word arrives as it's said; the red block rides the active word, emphasis words keep it ──
      for (const [id, words] of Object.entries(CAPTIONS)) {
        words.forEach(([text, t, hero], i) => {
          const el = "#" + id + "-w" + i;
          const next = i + 1 < words.length ? words[i + 1][1] : CAP_END[id];
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: "none" }, t);
          tl.fromTo(el, { y: 26, scale: hero ? 1.35 : 1.12 }, { y: 0, scale: 1, duration: 0.16, ease: hero ? "back.out(2.2)" : "power3.out" }, t);
          tl.fromTo(el, { backgroundColor: CLEAR, rotation: 0 }, { backgroundColor: RED, rotation: -2, duration: 0.001, ease: "none" }, t);
          if (!hero) tl.to(el, { backgroundColor: CLEAR, rotation: 0, duration: 0.06, ease: "none" }, Math.max(t + 0.08, next - 0.02));
        });
      }

      // ── hit words ──
      HITS.forEach((h) => {
        const el = "#" + h.id + "-t";
        if (h.style === "black") {
          // lights out: the word glows in on black and flickers once like a tube light
          tl.fromTo(el, { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power4.out" }, h.a);
          tl.to(el, { opacity: 0.25, duration: 0.03, ease: "none" }, h.a + 0.24);
          tl.to(el, { opacity: 1, duration: 0.03, ease: "none" }, h.a + 0.3);
          tl.to(el, { opacity: 0, scale: 0.94, duration: 0.12, ease: "power2.in" }, h.b - 0.12);
        } else {
          tl.fromTo(el, { scale: 2.3, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.22, ease: "power4.out" }, h.a);
          tl.fromTo("#t-" + h.id, { x: -18, y: 8 }, { x: 0, y: 0, duration: 0.3, ease: "elastic.out(1.2, 0.3)", immediateRender: false }, h.a + 0.18);
          tl.to(el, { x: 1080, filter: "blur(18px)", duration: 0.14, ease: "power3.in" }, h.b - 0.14);
        }
      });

      // ── end tag: logo stamps, lockup and handle rise ──
      tl.fromTo("#end-logo", { scale: 1.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.8)" }, %END% + 0.02);
      tl.fromTo("#end-lock", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.34, ease: "power3.out" }, %END% + 0.45);
      tl.fromTo("#end-h", { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, %END% + 0.75);
      tl.to("#t-end .card", { opacity: 0, duration: 0.3, ease: "none" }, %TOTAL% - 0.32);

      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""

if __name__ == "__main__":
    main()
