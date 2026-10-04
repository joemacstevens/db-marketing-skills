#!/usr/bin/env python3
"""Word onsets for the captions, from Parakeet + the VO's own onsets.

Parakeet's word starts are on an 80 ms grid and run up to ~0.25s early after a pause. This snaps each word to the
nearest acoustic onset (aubioonset) in [parakeet - 0.08, parakeet + 0.25], and any word that Parakeet puts inside a
pause to the end of that pause. Output: build/vo-words.json = [[word, start], ...] in VO-file seconds.

  python3 build/vo-words.py assets/transcripts/vo-week01.parakeet.json assets/transcripts/vo-week01.wav build/vo-words.json
"""
import json
import re
import subprocess
import sys

pk, wav, out = sys.argv[1:4]
words = json.load(open(pk))["words"]
onsets = [float(x) for x in subprocess.run(["aubioonset", "-t", "0.3", "-s", "-50", wav], capture_output=True,
                                           text=True).stdout.split()]
log = subprocess.run(["ffmpeg", "-nostdin", "-i", wav, "-af", "silencedetect=n=-35dB:d=0.2", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
gaps = list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)],
                [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]))
res = []
for w in words:
    p = w["start"]
    t = p
    for s, e in gaps:
        if s - 0.02 <= p < e:
            t = e
            break
    else:
        near = [o for o in onsets if p - 0.08 <= o <= p + 0.25]
        if near:
            t = min(near, key=lambda o: abs(o - p))
    if res and t < res[-1][1] + 0.08:  # keep onsets in order
        t = res[-1][1] + 0.08
    res.append([w["text"], round(t, 3)])
json.dump(res, open(out, "w"), indent=0)
print(" ".join(f"{w}@{t:.2f}" for w, t in res))
