#!/usr/bin/env python3
"""Mix assets/mix.wav: the voice segments back to back (build/cut.py) over the composed bed, ducked under speech.

The bed (build/music/bed-C-edit.wav: bed-C.mp3, ElevenLabs Music composed to the cut, re-cut by edit-bed.py so the
beat drops ~2.7 s in) sits at BED, ducked gently under the voices, and comes up to BED_END for the end card. The result is normalised to LUFS
with a -1 dBTP ceiling. Run build/build.py first (it writes build/timeline.json).
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BED_FILE = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--bed=")), "build/music/bed-C-edit.wav")
BED, BED_END = 0.50, 0.85  # Joey 10/27 on v2: music came in too late and too quiet ("you might be being a little too safe")
DUCK = "threshold=0.05:ratio=3:attack=8:release=350"
LUFS = -14
LIFTS = [(2.85, 3.75, 6)]  # (start, end, dB) on the voice: her quiet "Since August" lands on the beat drop


def main():
    tl = json.load(open(os.path.join(ROOT, "build/timeline.json")))
    cuts = json.load(open(os.path.join(ROOT, "build/cuts.json")))
    lst = os.path.join(ROOT, "build/voice-list.txt")
    open(lst, "w").write("".join(f"file '../assets/audio/{c['id']}.wav'\n" for c in cuts))
    voice = os.path.join(ROOT, "assets/voice.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", voice], check=True)
    e, total = tl["voice_end"], tl["total"]
    ramp = f"{BED}+{BED_END - BED}*min(max((t-{e - 0.15:.3f})/0.35\\,0)\\,1)"
    lift = ",".join(f"volume=enable='between(t,{a},{b})':volume={db}dB" for a, b, db in LIFTS)
    fc = (f"[0:a]aresample=48000,{lift},apad=whole_dur={total}[vox];"
          f"[vox]asplit[v1][key];"
          f"[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{total},volume='{ramp}':eval=frame,"
          f"afade=t=out:st={total - 0.45:.3f}:d=0.45[bed];"
          f"[bed][key]sidechaincompress={DUCK}[duck];"
          f"[v1]aformat=channel_layouts=stereo[v2];"
          f"[v2][duck]amix=inputs=2:duration=first:normalize=0[m]")
    pre = os.path.join(ROOT, "assets/mix-pre.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", voice, "-i", os.path.join(ROOT, BED_FILE),
                    "-filter_complex", fc, "-map", "[m]", "-t", f"{total}", pre], check=True)
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", pre, "-af",
                        f"loudnorm=I={LUFS}:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, check=True).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    out = os.path.join(ROOT, "assets/mix.wav")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", pre, "-af",
                    f"loudnorm=I={LUFS}:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                    f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:"
                    f"linear=true,aresample=48000", "-ar", "48000", out], check=True)
    print(f"mix.wav: {total}s, bed {os.path.basename(BED_FILE)}, input {m['input_i']} LUFS -> {LUFS}")


if __name__ == "__main__":
    main()
