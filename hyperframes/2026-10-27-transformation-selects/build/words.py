#!/usr/bin/env python3
"""Parakeet word timings around every bite in build/selects.json, for snapping in/out to word edges.

Each bite gets assets/windows/<id>.wav (source [in - PAD, out + PAD], mono 16k) and <id>.parakeet.json,
then prints the words with absolute source times; words inside the current [in, out] are marked "|".
Existing transcripts are reused unless --force.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAD = 2.0
TRANSCRIBE = os.path.expanduser("~/.claude/skills/media-use/scripts/transcribe.mjs")
FORCE = "--force" in sys.argv
SET = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--set=")), "")  # selects-<SET>.json, cuts-<SET>.json
ONLY = [a for a in sys.argv[1:] if not a.startswith("--")]


def load():
    cfg = json.load(open(os.path.join(ROOT, "build/selects" + (f"-{SET}" if SET else "") + ".json")))
    for b in cfg["bites"]:
        root, rel = b["src"].split("/", 1)
        b["path"] = os.path.join(cfg["roots"][root], rel)
    return cfg["bites"]


def main():
    env = dict(os.environ, PATH=os.path.expanduser("~/.venvs/parakeet/bin") + ":" + os.environ["PATH"])
    for b in load():
        if ONLY and b["id"] not in ONLY:
            continue
        w0 = max(0.0, b["in"] - PAD)
        wav = os.path.join(ROOT, f"assets/windows/{b['id']}.wav")
        js = wav.replace(".wav", ".parakeet.json")
        if FORCE or not os.path.exists(js):
            subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{w0:.3f}",
                            "-t", f"{b['out'] - w0 + PAD:.3f}", "-i", b["path"], "-vn", "-ac", "1", "-ar", "16000", wav],
                           check=True)
            subprocess.run(["node", TRANSCRIBE, "--input", wav, "--out", js, "--engine", "parakeet"],
                           check=True, env=env, stdout=subprocess.DEVNULL)
        words = json.load(open(js))["words"]
        print(f"\n== {b['id']}  [{b['in']:.2f}, {b['out']:.2f}]  {b['who']}: {b['what']}")
        line = []
        for w in words:
            s, e = w["start"] + w0, w["end"] + w0
            mark = "|" if b["in"] - 0.05 <= s and e <= b["out"] + 0.05 else " "
            line.append(f"{mark}{s:.2f}-{e:.2f} {w['text']}")
        print("\n".join(line))


if __name__ == "__main__":
    main()
