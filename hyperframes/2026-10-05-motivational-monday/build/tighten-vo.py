#!/usr/bin/env python3
"""Tighten the pauses in a VO take without touching the speech (no speed change).

Every silence longer than --max is cut down to --max (the cut happens in the middle of the gap, with 6 ms fades so
there is no click), leading silence is trimmed to --lead, trailing silence to --tail.

  python3 build/tighten-vo.py <in.mp3> <out.mp3> [--max 0.5] [--lead 0.05] [--tail 0.3] [--db -35] [--min 0.25] [--set 7=0.4,8=0.4]

Prints the gap map before/after so you can see what moved. Re-run Parakeet/whisper on the OUTPUT, never reuse the
input's word times.
"""
import argparse
import re
import subprocess

ap = argparse.ArgumentParser()
ap.add_argument("inp")
ap.add_argument("out")
ap.add_argument("--max", type=float, default=0.5)
ap.add_argument("--lead", type=float, default=0.05)
ap.add_argument("--tail", type=float, default=0.3)
ap.add_argument("--db", type=float, default=-35)
ap.add_argument("--min", type=float, default=0.25, help="silencedetect minimum gap length")
ap.add_argument("--set", default="", help="per-gap max override, 'idx=sec,idx=sec' (idx from the printed gap list)")
a = ap.parse_args()

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.inp],
                           capture_output=True, text=True).stdout)
log = subprocess.run(["ffmpeg", "-nostdin", "-i", a.inp, "-af", f"silencedetect=n={a.db}dB:d={a.min}", "-f", "null",
                      "-"], capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
if len(ends) < len(starts):
    ends.append(dur)
gaps = list(zip(starts, ends))

# speech start = end of a leading silence (if any)
lead_log = subprocess.run(["ffmpeg", "-nostdin", "-i", a.inp, "-af", f"silencedetect=n={a.db}dB:d=0.02", "-f", "null",
                           "-"], capture_output=True, text=True).stderr
m = re.search(r"silence_start: (-?[\d.]+)", lead_log)
first_end = re.search(r"silence_end: ([\d.]+)", lead_log)
speech_in = float(first_end.group(1)) if m and float(m.group(1)) <= 0.01 and first_end else 0.0

override = {int(k): float(v) for k, v in (x.split("=") for x in a.set.split(",") if x)}
keep = []  # (in, out) ranges of the source to keep
cur = max(0.0, speech_in - a.lead)
for gi, (s, e) in enumerate(gaps):
    mx = override.get(gi, a.max)
    if s <= speech_in + 0.01:
        continue
    if e >= dur - 0.01:  # trailing silence
        keep.append((cur, min(dur, s + a.tail)))
        cur = None
        break
    if e - s > mx:
        keep.append((cur, s + mx / 2))
        cur = e - mx / 2
if cur is not None:
    keep.append((cur, dur))

parts, labels = [], []
for i, (x, y) in enumerate(keep):
    d = y - x
    parts.append(f"[0:a]atrim={x:.4f}:{y:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,"
                 f"afade=t=out:st={max(0, d - 0.006):.4f}:d=0.006[p{i}]")
    labels.append(f"[p{i}]")
fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(keep)}:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", a.inp, "-filter_complex", fc, "-map", "[o]",
                "-c:a", "libmp3lame", "-b:a", "192k", a.out], check=True)
new = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out],
                           capture_output=True, text=True).stdout)
print(f"gaps in: " + ", ".join(f"[{i}] {s:.2f}-{e:.2f} ({e - s:.2f})" for i, (s, e) in enumerate(gaps)))
print(f"kept {len(keep)} ranges: " + ", ".join(f"{x:.2f}-{y:.2f}" for x, y in keep))
print(f"{a.inp}: {dur:.2f}s -> {a.out}: {new:.2f}s")
