#!/usr/bin/env python3
"""Strip the background music from every source clip: ElevenLabs two-stem separation, keep the vocal stem.

One call per source file, over [first segment in - PAD, last segment out + PAD] so the model gets context.
Outputs assets/stems/<key>/ (the zip contents) and assets/stems/<key>.vocals.wav (mono 48k), plus
assets/stems/index.json mapping each source path to {"wav", "offset"}; cut.py reads the voice from there.
Existing stems are reused unless --force.
"""
import glob
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = 1.5
SEPARATE = "/Users/joestevens/Projects/Different Breed/scripts/separate-music-stems.mjs"
FORCE = "--force" in sys.argv
ONLY = [a for a in sys.argv[1:] if not a.startswith("--")]


def main():
    cfg = json.load(open(os.path.join(ROOT, "build/selects.json")))
    spans = {}
    for b in cfg["bites"]:
        root, rel = b["src"].split("/", 1)
        path = os.path.join(cfg["roots"][root], rel)
        lo, hi = spans.get(path, (b["in"], b["out"]))
        spans[path] = (min(lo, b["in"]), max(hi, b["out"]))
    index_path = os.path.join(ROOT, "assets/stems/index.json")
    index = json.load(open(index_path)) if os.path.exists(index_path) else {}
    for path, (lo, hi) in spans.items():
        key = re.sub(r"[^A-Za-z0-9_-]+", "_", os.path.splitext(os.path.basename(path))[0])
        if ONLY and key not in ONLY:
            continue
        w0 = max(0.0, lo - PAD)
        wav = os.path.join(ROOT, f"assets/stems/{key}.vocals.wav")
        if FORCE or not os.path.exists(wav) or index.get(path, {}).get("offset") != w0:
            d = os.path.join(ROOT, f"assets/stems/{key}")
            os.makedirs(d, exist_ok=True)
            mp3 = os.path.join(d, f"{key}.mp3")
            subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{w0:.3f}", "-t", f"{hi + PAD - w0:.3f}",
                            "-i", path, "-vn", "-ac", "2", "-ar", "44100", "-b:a", "256k", mp3], check=True)
            subprocess.run(["node", SEPARATE, mp3, d], check=True, stdout=subprocess.DEVNULL)
            vocals = [f for f in glob.glob(os.path.join(d, "*")) if re.search(r"vocal", os.path.basename(f), re.I)
                      and not f.endswith(".zip")]
            if len(vocals) != 1:
                sys.exit(f"{key}: expected one vocal stem, found {os.listdir(d)}")
            subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", vocals[0], "-ac", "1", "-ar", "48000", wav],
                           check=True)
        index[path] = {"wav": os.path.relpath(wav, ROOT), "offset": w0}
        print(f"{key:40} offset {w0:7.2f}  {os.path.basename(wav)}")
    json.dump(index, open(index_path, "w"), indent=2)


if __name__ == "__main__":
    main()
