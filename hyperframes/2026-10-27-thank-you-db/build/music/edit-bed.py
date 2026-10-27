#!/usr/bin/env python3
"""Re-cut bed-C so the beat drops ~2.7 s in (Joey 10/27: "I don't hear the music until the third person").

bed-C's intro runs ~10 s of quiet piano. This keeps only its last bar as a pickup under Don, repeats one
two-bar loop after the drop to win back length (the progression cycles every two bars, so the splice is
seamless), then slows everything ~3% so the final hit lands on the end card. Splices sit on aubiotrack
downbeats with 15 ms crossfades. The pickup bar gets INTRO_DB so the piano is heard under Don's question.
Writes bed-C-edit.wav.
"""
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "bed-C.mp3")
OUT = os.path.join(HERE, "bed-C-edit.wav")
# aubiotrack downbeats in bed-C (beat grid ~88.9 BPM; drop on 10.205, final hit on 43.326)
PICKUP, DROP, LOOP_A, LOOP_B, HIT = 7.541, 10.205, 15.704, 21.154, 43.326
END_CARD = 42.433  # composition time the end card starts (build/timeline.json)
HIT_AT = END_CARD + 0.07
INTRO_DB = 9
XF = 0.015


def main():
    inserted = LOOP_B - LOOP_A
    stretch = (HIT_AT) / (HIT - PICKUP + inserted)  # >1 slows the bed down
    pieces = [(PICKUP, LOOP_B), (LOOP_A, LOOP_B), (LOOP_B, None)]
    ins, chains = [], []
    for n, (a, b) in enumerate(pieces):
        ins += ["-ss", f"{a:.3f}"] + (["-t", f"{b - a + XF:.3f}"] if b else []) + ["-i", SRC]
        chains.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=stereo[p{n}]")
    boost = (f"volume='if(lt(t,{DROP - PICKUP - 0.08:.3f}),{10 ** (INTRO_DB / 20):.3f},1)':eval=frame")
    fc = ";".join(chains) + (f";[p0][p1]acrossfade=d={XF}:c1=tri:c2=tri[a01];"
                             f"[a01][p2]acrossfade=d={XF}:c1=tri:c2=tri[cat];"
                             f"[cat]{boost},atempo={1 / stretch:.5f}[out]")
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[out]", OUT],
                   check=True)
    print(f"bed-C-edit.wav: drop at {(DROP - PICKUP) * stretch:.2f}s, final hit at "
          f"{(HIT - PICKUP + inserted) * stretch:.2f}s, tempo x{1 / stretch:.4f}")


if __name__ == "__main__":
    main()
