#!/usr/bin/env python3
"""Cut every segment in build/selects.json into a 1080x1920 picture file + a level-matched voice file.

Cut points come from the Parakeet words in assets/windows/<id>.parakeet.json (build/words.py):
  in  = first word start - HEAD, never earlier than the previous word's end + GAP
  out = last word end + TAIL, never later than the next word's start - GAP (Parakeet pads some last words with
        silence, so a last word counts as at most MAX_WORD long). "out_fixed" overrides out (Parakeet drops
        Stacy's quiet answer in b02b; whisper medium.en hears it).
Outputs, all [in, out] of the source, frame-rounded at 30 fps:
  assets/footage/<id>.mp4  1080x1920 SDR, no audio (HLG sources tone-mapped with the zscale chain from
                           scripts/hdr-tonemap.sh), center-cropped
  assets/audio/<id>.wav    mono 48k voice from the vocal stem (build/stems.py strips the gym music; "voice": "raw"
                           keeps the clip's own sound), one gain
                           per segment so it sits at LUFS, 20/30 ms fades
  build/cuts.json          the cut list build.py reads
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEAD, TAIL, GAP, MAX_WORD = 0.25, 0.35, 0.06, 0.9
PAD = 2.0  # must match words.py
FPS = 30
LUFS = -16
W, H = 1080, 1920
TONEMAP = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
           "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
FORCE = "--force" in sys.argv
SET = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--set=")), "")  # selects-<SET>.json, cuts-<SET>.json
ONLY = [a for a in sys.argv[1:] if not a.startswith("--")]


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def probe(path, entries):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", entries,
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True, check=True).stdout
    return out.strip()


def cut_points(b):
    w0 = max(0.0, b["in"] - PAD)
    words = json.load(open(os.path.join(ROOT, f"assets/windows/{b['id']}.parakeet.json")))["words"]
    words = [dict(w, start=w["start"] + w0, end=w["end"] + w0) for w in words]

    def nearest(t):
        return min(range(len(words)), key=lambda i: abs(words[i]["start"] - t))

    i = nearest(b["first"])
    t_in = words[i]["start"] - HEAD
    if i > 0:  # back off the previous word, but never into this one when Parakeet butts them together
        t_in = max(t_in, min(words[i - 1]["end"] + GAP, words[i]["start"] - 0.04))
    if b.get("out_fixed") is not None:
        t_out = b["out_fixed"]
    else:
        j = nearest(b["last"])
        end = min(words[j]["end"], words[j]["start"] + MAX_WORD)
        t_out = end + TAIL
        if j + 1 < len(words):
            t_out = min(t_out, max(words[j + 1]["start"] - GAP, end + 0.04))
    t_in = max(0.0, t_in)
    frames = round((t_out - t_in) * FPS)
    return round(t_in, 3), frames / FPS


def voice(stem_wav, offset, start, dur, wav):
    """Slice the voice, then one gain so the slice measures LUFS (each speaker levels on their own words)."""
    cut = ["-ss", f"{start - offset:.3f}", "-t", f"{dur:.3f}", "-i", stem_wav]
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", *cut, "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True, check=True).stderr
    gain = LUFS - float(r[r.rindex("I:"):].split()[1])
    ff([*cut, "-af", f"volume={gain:.2f}dB,alimiter=limit=0.89:level=false,afade=t=in:d=0.02,"
        f"afade=t=out:st={dur - 0.03:.3f}:d=0.03", "-ar", "48000", "-ac", "1", wav])


def main():
    cfg = json.load(open(os.path.join(ROOT, "build/selects" + (f"-{SET}" if SET else "") + ".json")))
    stems = json.load(open(os.path.join(ROOT, "assets/stems/index.json")))
    cuts_path = os.path.join(ROOT, "build/cuts" + (f"-{SET}" if SET else "") + ".json")
    cuts = {c["id"]: c for c in json.load(open(cuts_path))} if os.path.exists(cuts_path) else {}
    for b in cfg["bites"]:
        if ONLY and b["id"] not in ONLY:
            continue
        root, rel = b["src"].split("/", 1)
        src = os.path.join(cfg["roots"][root], rel)
        t_in, dur = cut_points(b)
        prev = cuts.get(b["id"], {})
        stale = FORCE or prev.get("in") != t_in or prev.get("dur") != dur
        hdr = probe(src, "stream=color_transfer") in ("arib-std-b67", "smpte2084")
        vid = os.path.join(ROOT, f"assets/footage/{b['id']}.mp4")
        wav = os.path.join(ROOT, f"assets/audio/{b['id']}.wav")
        if stale or not os.path.exists(vid):
            vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},setsar=1,"
                  + (TONEMAP if hdr else "format=yuv420p"))
            ff(["-ss", f"{t_in:.3f}", "-t", f"{dur:.3f}", "-i", src, "-vf", vf, "-an", "-r", str(FPS),
                "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                "-movflags", "+faststart", vid])
        if stale or not os.path.exists(wav) or "--audio" in sys.argv:
            if b.get("voice") == "raw":  # both separators swallow Veronica's laughing line; her clip has almost no music
                st = {"wav": src, "offset": 0.0}
            else:
                st = stems[src]
            voice(os.path.join(ROOT, st["wav"]), st["offset"], t_in, dur, wav)
        cuts[b["id"]] = {"id": b["id"], "beat": b["beat"], "who": b["who"], "src": src,
                         "file": os.path.basename(rel), "in": t_in, "dur": dur, "hdr": hdr}
        print(f"{b['id']:5} {t_in:7.2f} +{dur:6.2f}  {'HDR' if hdr else 'SDR'}  {os.path.basename(rel)}")
    order = [b["id"] for b in cfg["bites"] if b["id"] in cuts]
    json.dump([cuts[i] for i in order], open(cuts_path, "w"), indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
