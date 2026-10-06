#!/usr/bin/env python3
"""Builds index.html for Blue Collar Day 1, Cut B "Nonstop", from build/reel.json.

  python3 build/make-proxies.py          # footage proxies + room-audio cuts
  python3 build/build.py [--no-music]    # index.html (--no-music: stems silent, for the IG in-app-sound copy)
  npx --yes hyperframes@0.8.115 check

Shape: Coach P opener 0-1.79, title slams over the countdown rope shot, "GO!" lands with the drums at 3.8,
coach callouts play on their own clips (vocal stem out, instrumental ducked), pad flurry on every 2 beats when
the full kit enters at 11.94, push-up call + stomp hit, "push it up", last look, house end tag + DB song hook.
Patterns (title/caption/hit CSS, window wrapper visibility, whip/impact) are lifted from
hyperframes/2026-10-05-motivational-monday/build/build.py.
"""
import html
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timing import END, R, ROOT, T, TOTAL, reel_of, slots  # noqa: E402

NO_MUSIC = "--no-music" in sys.argv
HANDLE = 0.3
LEAD = 0.03


def esc(obj):
    return html.escape(json.dumps(obj, separators=(",", ":")), quote=True)


def dur_of(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                 os.path.join(ROOT, path)], capture_output=True, text=True).stdout)


def main():
    grade = json.load(open(os.path.join(ROOT, "build/grade-lite.json")))
    S = slots()

    # ── shots ──
    shots_html, slot_js, room_html = [], [], []
    prev = None
    for i, (s, a, b) in enumerate(S):
        assert s["src"] != prev or s["ms"] != S[i - 1][0]["ms"], f"same shot back to back at {s['id']}"
        prev = s["src"]
        win = s.get("frame") == "win11"
        src = f"assets/footage/{s['id']}.mp4"
        assert HANDLE + (b - a) <= dur_of(src) + 0.02, f"{s['id']} runs past its proxy"
        slot_js.append({"a": a, "b": b, "fx": s.get("fx", ""), "tx": s.get("tx", ""), "win": win})
        bg = (f'<video id="vb{i}" class="clip bgv" src="assets/footage/{s["id"]}-bg.mp4" data-start="{a:.3f}" '
              f'data-duration="{b - a:.3f}" data-media-start="{HANDLE}" data-track-index="{20 + i % 2}" '
              f'muted playsinline></video>') if win else ""
        shots_html.append(
            f'      <div class="shot{" win" if win else ""}" id="w{i}">{bg}<div class="push" data-layout-allow-overflow="">'
            f'<video data-color-grading="{esc(grade)}" id="v{i}" class="clip" src="{src}" data-start="{a:.3f}" '
            f'data-duration="{b - a:.3f}" data-media-start="{HANDLE}" data-track-index="{i % 2}" muted playsinline>'
            f'</video></div></div>')
        if s.get("room"):
            r0 = s["room"].get("from", a)
            wav = f"assets/audio/room-{s['id']}.wav"
            room_html.append(
                f'      <audio id="r-{s["id"]}" src="{wav}" data-start="{r0:.3f}" data-duration="{dur_of(wav):.3f}" '
                f'data-media-start="0" data-track-index="{14 + len(room_html) % 2}" '
                f'data-volume="{s["room"].get("gain", 1.5)}"></audio>')

    # ── coach captions: word by word, chunk replaces chunk ──
    caps_html, cap_data, cap_end, cap_first = [], {}, {}, []
    n = 0
    for c in R["captions"]:
        chunks = c["chunks"]
        for k, ch in enumerate(chunks):
            assert len(" ".join(w for w, _ in ch)) <= 14, f"caption chunk too long: {ch}"
            start = reel_of(c["shot"], ch[0][1]) - LEAD
            end = (reel_of(c["shot"], chunks[k + 1][0][1]) - LEAD) if k + 1 < len(chunks) else reel_of(c["shot"], c["end"])
            cid = f"c{n}"
            n += 1
            spans = " ".join(f'<span class="w" id="{cid}-w{j}">{html.escape(w)}</span>' for j, (w, _) in enumerate(ch))
            chip = '<span class="who" data-layout-allow-overflow="">Coach P</span>'
            if k == 0:
                cap_first.append(cid)
            caps_html.append(f'      <div id="{cid}" class="clip layer" data-start="{start:.3f}" '
                             f'data-duration="{end - start:.3f}" data-track-index="4"><div class="cap">{chip}'
                             f'<div class="line">{spans}</div></div></div>')
            cap_data[cid] = [[w, round(reel_of(c["shot"], t) - LEAD, 3)] for w, t in ch]
            cap_end[cid] = round(end, 3)

    # ── hits + move labels ──
    hits = [{"id": f"h{k}", "text": h["text"], "a": T(h["at"]), "b": T(h["until"]), "style": h["style"]}
            for k, h in enumerate(R["hits"])]
    hits_html = [f'      <div id="t-{h["id"]}" class="clip layer" data-start="{h["a"]:.3f}" '
                 f'data-duration="{h["b"] - h["a"]:.3f}" data-track-index="8"><div class="hit {h["style"]}">'
                 f'<span class="ht" id="{h["id"]}-t" data-layout-allow-overflow="">{html.escape(h["text"])}</span>'
                 f'</div></div>' for h in hits]
    labels = [{"id": f"l{k}", "text": l["text"], "a": T(l["at"]), "b": T(l["until"])} for k, l in enumerate(R["labels"])]
    labels_html = [f'      <div id="t-{l["id"]}" class="clip layer" data-start="{l["a"]:.3f}" '
                   f'data-duration="{l["b"] - l["a"]:.3f}" data-track-index="7"><span class="lbl" id="{l["id"]}-t" '
                   f'data-layout-allow-overflow="">{html.escape(l["text"])}</span></div>' for l in labels]

    # ── music stems ──
    mus = R["music"]
    lv = mus["levels"]
    gain = 0.0 if NO_MUSIC else 1.0
    inst_auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": t, "v": round(i * gain, 3)} for t, i, _ in lv]}]}
    voc_auto = {"version": 1, "lanes": [{"target": "volume", "points": [{"t": t, "v": round(v * gain, 3)} for t, _, v in lv]}]}
    stem_dur = END + 0.1
    hook_len = TOTAL - END + 0.16
    hook_auto = {"version": 1, "lanes": [{"target": "volume", "points": [
        {"t": 0, "v": 0}, {"t": 0.08, "v": 1}, {"t": hook_len - 0.6, "v": 1}, {"t": hook_len, "v": 0}]}]}

    t = R["title"]
    rep = {
        "%TOTAL%": f"{TOTAL}", "%END%": f"{END}", "%END_DUR%": f"{TOTAL - END:.3f}",
        "%SHOTS%": "\n".join(shots_html), "%CAPS%": "\n".join(caps_html), "%HITS%": "\n".join(hits_html),
        "%LABELS%": "\n".join(labels_html), "%ROOM%": "\n".join(room_html),
        "%INST%": mus["inst"], "%VOC%": mus["voc"], "%STEM_DUR%": f"{stem_dur:.3f}",
        "%INST_AUTO%": esc(inst_auto), "%VOC_AUTO%": esc(voc_auto),
        "%HOOK_SRC%": R["end"]["hook_file"], "%HOOK_IN%": f"{R['end']['hook_src']}", "%HOOK_AT%": f"{END - 0.16:.3f}",
        "%HOOK_DUR%": f"{hook_len:.3f}", "%HOOK_AUTO%": esc(hook_auto),
        "%CAPTIONS%": json.dumps(cap_data), "%CAP_END%": json.dumps(cap_end), "%CAP_FIRST%": json.dumps(cap_first), "%SLOTS%": json.dumps(slot_js),
        "%HITS_JS%": json.dumps([{k: h[k] for k in ("id", "a", "b", "style")} for h in hits]),
        "%LABELS_JS%": json.dumps([{k: l[k] for k in ("id", "a", "b")} for l in labels]),
        "%TITLE_AT%": f"{T(t['at'])}", "%TITLE_OUT%": f"{T(t['out'])}", "%TITLE_DUR%": f"{T(t['out']) - T(t['at']):.3f}",
        "%BEAT%": f"{R['grid']['beat']}",
        "%T_KICKER%": html.escape(t["kicker"]), "%T_L1%": html.escape(t["line1"]), "%T_L2%": html.escape(t["line2"]),
        "%MUSIC_NOTE%": mus["_credit"] + (" [NO-MUSIC BUILD]" if NO_MUSIC else ""),
    }
    page = TEMPLATE
    for k, v in rep.items():
        page = page.replace(k, v)
    left = re.findall(r"%[A-Z0-9_]+%", page)
    assert not left, f"unreplaced {left}"
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    print(f"wrote index.html{' (NO MUSIC)' if NO_MUSIC else ''}: {len(S)} shots, end tag {END}, total {TOTAL}s")
    for s, a, b in S:
        print(f"  {s['id']} {a:6.3f}-{b:6.3f} ({b - a:.2f}s) IMG_{s['src']} @{s['ms']:.2f}  {s.get('note', '')}")
    for cid, words in cap_data.items():
        print(f"  {cid} {cap_data[cid][0][1]:.2f}-{cap_end[cid]:.2f} {' '.join(w for w, _ in words)}")


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
      /* win11: 1:1 window (1080x1080) at y=380 over the blurred fill; the push scales the window only */
      .shot.win .push { inset: auto; left: 0; top: 380px; width: 1080px; height: 1080px; box-shadow: 0 -18px 40px rgba(10,10,10,0.55), 0 18px 40px rgba(10,10,10,0.55); }
      .flash { position: absolute; inset: 0; background: var(--red); opacity: 0; pointer-events: none; mix-blend-mode: screen; }
      .vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 80% 70% at 50% 45%, rgba(10,10,10,0) 55%, rgba(10,10,10,0.55) 100%); }
      .layer { position: absolute; inset: 0; }

      /* title */
      .shade { position: absolute; inset: 0; background: rgba(10, 10, 10, 0.45); opacity: 0; }
      .title { position: absolute; left: 64px; top: 470px; width: 952px; }
      .title .k { display: inline-block; background: var(--red); color: var(--bone); font-weight: 700; font-size: 30px; letter-spacing: 0.16em; text-transform: uppercase; padding: 10px 22px; box-shadow: 6px 6px 0 var(--ink); transform-origin: left center; }
      .title .l1 { display: block; margin-top: 26px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 112px; line-height: 0.95; white-space: nowrap; color: var(--bone); text-shadow: 8px 8px 0 var(--ink); }
      .title .l2 { display: block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; font-size: 168px; line-height: 0.95; white-space: nowrap; color: var(--red); text-shadow: 10px 10px 0 var(--ink); }

      /* coach captions */
      .cap { position: absolute; left: 40px; right: 40px; top: 1180px; text-align: center; }
      .cap .who { display: inline-block; margin-bottom: 14px; background: var(--bone); color: var(--ink); font-weight: 700; font-size: 28px; letter-spacing: 0.18em; text-transform: uppercase; padding: 6px 16px; box-shadow: 5px 5px 0 var(--red); }
      .cap .line { font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 76px; line-height: 1.22; white-space: nowrap; color: var(--bone); text-shadow: 4px 4px 0 var(--ink); }
      .cap .w { display: inline-block; padding: 0 14px; margin: 0 -2px; background: rgba(10, 10, 10, 0.66); }

      /* hit words */
      .hit { position: absolute; left: 0; right: 0; top: 820px; text-align: center; }
      .hit .ht { display: inline-block; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.02em; white-space: nowrap; line-height: 1; }
      .hit.block .ht { font-size: 150px; color: var(--bone); background: var(--red); padding: 10px 40px 26px 30px; box-shadow: 12px 12px 0 var(--ink); }
      .hit.drop .ht { font-size: 240px; color: var(--bone); background: var(--red); padding: 10px 50px 30px 40px; box-shadow: 14px 14px 0 var(--ink); }

      /* move labels (describe the move) */
      .lbl { position: absolute; left: 64px; top: 1430px; display: inline-block; background: var(--red); color: var(--bone); font-weight: 900; font-style: italic; font-size: 46px; letter-spacing: 0.04em; text-transform: uppercase; padding: 8px 24px 12px 20px; box-shadow: 7px 7px 0 var(--ink); transform: skewX(-8deg); }

      /* end tag */
      .card { position: absolute; inset: 0; background: var(--ink); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .end img { display: block; width: 560px; height: 560px; object-fit: contain; }
      .end .lock { display: block; width: 820px; margin-top: 56px; }
      .end .h { display: block; margin-top: 54px; font-weight: 400; font-size: 36px; letter-spacing: 0.2em; color: var(--steel); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%TOTAL%" data-width="1080" data-height="1920">

      <!-- ─── footage (tracks 0/1) ─── -->
%SHOTS%
      <div class="vig"></div>
      <div class="flash" id="flash"></div>

      <!-- ─── title (over the countdown rope shot) ─── -->
      <div id="t-title" class="clip layer" data-start="%TITLE_AT%" data-duration="%TITLE_DUR%" data-track-index="2">
        <div class="shade" id="title-shade"></div>
        <div class="title" id="title-box">
          <span class="k" id="title-k" data-layout-allow-overflow="">%T_KICKER%</span>
          <span class="l1" id="title-1" data-layout-allow-overlap="" data-layout-allow-overflow="">%T_L1%</span>
          <span class="l2" id="title-2" data-layout-allow-overlap="" data-layout-allow-overflow="">%T_L2%</span>
        </div>
      </div>

      <!-- ─── move labels ─── -->
%LABELS%

      <!-- ─── coach captions ─── -->
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

      <!-- ─── audio: song stems (vocal drops out under Coach P), his callouts on their own clips, DB hook ─── -->
      <audio id="a-inst" src="%INST%" data-start="0" data-duration="%STEM_DUR%" data-media-start="0" data-track-index="10" data-volume="1" data-automation="%INST_AUTO%"></audio>
      <audio id="a-voc" src="%VOC%" data-start="0" data-duration="%STEM_DUR%" data-media-start="0" data-track-index="11" data-volume="1" data-automation="%VOC_AUTO%"></audio>
%ROOM%
      <audio id="a-hook" src="%HOOK_SRC%" data-start="%HOOK_AT%" data-duration="%HOOK_DUR%" data-media-start="%HOOK_IN%" data-track-index="13" data-volume="1" data-automation="%HOOK_AUTO%"></audio>
    </div>

    <script>
      // Blue Collar Day 1, Cut B "Nonstop" (generated by build/build.py from build/reel.json, do not hand-edit).
      // Music: %MUSIC_NOTE%
      const CAPTIONS = %CAPTIONS%;
      const CAP_END = %CAP_END%;
      const CAP_FIRST = %CAP_FIRST%;
      const SLOTS = %SLOTS%;
      const HITS = %HITS_JS%;
      const LABELS = %LABELS_JS%;
      const BEAT = %BEAT%;

      const tl = gsap.timeline({ paused: true });
      const RED = "#e81d1d";
      const CLEAR = "rgba(10,10,10,0.66)";

      tl.set(".shot", { x: 0, y: 0, opacity: 1, filter: "blur(0px) brightness(1)" }, 0);

      // ── shots: slow push; impact cuts land with a punch-in + shake; whips slide the old shot out ──
      SLOTS.forEach((s, i) => {
        const w = "#w" + i + " .push";
        const d = s.b - s.a;
        const P = s.win ? { from: 1.0, to: 1.04, punch: 1.1, land: 1.0 } : { from: 1.02, to: 1.09, punch: 1.2, land: 1.03 };
        // win11 wrappers are untimed divs (videos can't nest in a timed element): show only during their slot
        if (s.win) {
          tl.set("#w" + i, { visibility: "hidden" }, 0);
          tl.set("#w" + i, { visibility: "visible" }, s.a);
          tl.set("#w" + i, { visibility: "hidden" }, s.b);
        }
        if (s.fx === "impact") {
          tl.fromTo(w, { scale: P.punch }, { scale: P.land, duration: Math.min(0.28, d), ease: "expo.out" }, s.a);
          if (d > 0.4) tl.to(w, { scale: P.to, duration: d - 0.28, ease: "none" }, s.a + 0.28);
          tl.fromTo("#w" + i, { x: -22, y: 10 }, { x: 0, y: 0, duration: 0.3, ease: "elastic.out(1.2, 0.3)", immediateRender: false }, s.a);
        } else {
          tl.fromTo(w, { scale: P.from }, { scale: P.to, duration: d, ease: "none" }, s.a);
        }
        if (i === 0) return;
        if (s.tx === "whip") {
          const dir = i % 2 ? 1 : -1;
          tl.fromTo("#w" + (i - 1), { x: 0, filter: "blur(0px) brightness(1)" }, { x: -1080 * dir, filter: "blur(24px) brightness(1)", duration: 0.14, ease: "power3.in", immediateRender: false }, s.a - 0.14);
          tl.fromTo("#w" + i, { x: 1080 * dir, filter: "blur(24px) brightness(1)" }, { x: 0, filter: "blur(0px) brightness(1)", duration: 0.18, ease: "power3.out", immediateRender: false }, s.a);
        } else {
          tl.fromTo("#w" + i, { filter: "blur(0px) brightness(1.45)" }, { filter: "blur(0px) brightness(1)", duration: 0.2, ease: "power2.out", immediateRender: false }, s.a);
        }
      });
      // red flash on the drum entry (GO) and on the full-kit entry (pad flurry)
      [3.8, SLOTS[6].a, 20.39].forEach((t) => {
        tl.fromTo("#flash", { opacity: 0.55 }, { opacity: 0, duration: 0.28, ease: "power2.out", immediateRender: false }, t);
      });

      // ── title slam (over the countdown) ──
      tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.16 }, %TITLE_AT%);
      tl.fromTo("#title-k", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.24, ease: "expo.out" }, %TITLE_AT%);
      tl.fromTo("#title-1", { scale: 1.9, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.26, ease: "power4.out" }, %TITLE_AT% + 0.04);
      tl.fromTo("#title-2", { scale: 2.2, opacity: 0, rotation: -9 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.3, ease: "power4.out" }, %TITLE_AT% + BEAT);
      tl.fromTo("#title-box", { x: 0, filter: "blur(0px)" }, { x: -1080, filter: "blur(22px)", duration: 0.16, ease: "power3.in" }, %TITLE_OUT% - 0.16);
      tl.to("#title-shade", { opacity: 0, duration: 0.16, ease: "none" }, %TITLE_OUT% - 0.16);

      // ── move labels: snap in from the left, whip out ──
      LABELS.forEach((l) => {
        const el = "#" + l.id + "-t";
        tl.fromTo(el, { x: -500, opacity: 0 }, { x: 0, opacity: 1, duration: 0.22, ease: "expo.out" }, l.a);
        tl.to(el, { x: -500, opacity: 0, duration: 0.14, ease: "power3.in" }, l.b - 0.14);
      });

      // ── coach captions: each word arrives as he says it, red block rides the active word ──
      for (const [id, words] of Object.entries(CAPTIONS)) {
        if (CAP_FIRST.includes(id)) tl.fromTo("#" + id + " .who", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16, ease: "power3.out" }, words[0][1]);
        words.forEach(([text, t], i) => {
          const el = "#" + id + "-w" + i;
          const next = i + 1 < words.length ? words[i + 1][1] : CAP_END[id];
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.001, ease: "none" }, t);
          tl.fromTo(el, { y: 26, scale: 1.18 }, { y: 0, scale: 1, duration: 0.16, ease: "power3.out" }, t);
          tl.fromTo(el, { backgroundColor: CLEAR, rotation: 0 }, { backgroundColor: RED, rotation: -2, duration: 0.001, ease: "none" }, t);
          tl.to(el, { backgroundColor: CLEAR, rotation: 0, duration: 0.06, ease: "none" }, Math.max(t + 0.08, next - 0.02));
        });
      }

      // ── hit words ──
      HITS.forEach((h) => {
        const el = "#" + h.id + "-t";
        tl.fromTo(el, { scale: 2.3, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: -4, duration: 0.22, ease: "power4.out" }, h.a);
        tl.fromTo("#t-" + h.id, { x: -18, y: 8 }, { x: 0, y: 0, duration: 0.3, ease: "elastic.out(1.2, 0.3)", immediateRender: false }, h.a + 0.18);
        tl.to(el, { x: 1080, filter: "blur(18px)", duration: 0.14, ease: "power3.in" }, h.b - 0.14);
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
