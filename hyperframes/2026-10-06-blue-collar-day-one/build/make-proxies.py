#!/usr/bin/env python3
"""Footage proxies + room-audio cuts for every shot in build/reel.json.

Each shot gets assets/footage/<id>.mp4 covering source [ms - 0.3, ms + slot + 0.3] (so data-media-start is 0.3),
SDR 30fps, no audio. Sources are 720p iMessage copies (bt709, not HDR), so no tonemap.
  frame fill  : portrait 720x1280 scaled to 1080x1920.
  frame win11 : landscape source (after optional "rotate", e.g. transpose=2 for the sideways IMG_7839) -> a 720x720
                square around cx scaled to 1080x1080, plus <id>-bg.mp4 = the same clip as a blurred, darkened,
                desaturated 1080x1920 fill.
Shots with "room" also get assets/audio/room-<id>.wav (mono 48k, 20 ms fades) for the slot (from room.from if set).
Existing files are skipped unless --force.
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timing import R, ROOT, SRC_DIR, slots  # noqa: E402

HANDLE = 0.3
FORCE = "--force" in sys.argv


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def main():
    os.makedirs(os.path.join(ROOT, "assets/footage"), exist_ok=True)
    for s, a, b in slots():
        src = os.path.join(SRC_DIR, f"IMG_{s['src']}.mov")
        start = max(0.0, s["ms"] - HANDLE)
        dur = (b - a) + 2 * HANDLE
        out = os.path.join(ROOT, f"assets/footage/{s['id']}.mp4")
        enc = ["-an", "-r", "30", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p",
               "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"]
        rot = (s["rotate"] + ",") if s.get("rotate") else ""
        if FORCE or not os.path.exists(out):
            if s.get("frame") == "win11":
                cx = s.get("cx", 0.5)
                vf = f"{rot}crop=720:720:'max(0,min(iw-720,{cx}*iw-360))':0,scale=1080:1080:flags=lanczos,setsar=1"
                bg = os.path.join(ROOT, f"assets/footage/{s['id']}-bg.mp4")
                ff(["-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src, "-vf",
                    f"{rot}scale=-2:480,crop=270:480,gblur=sigma=10,eq=brightness=-0.16:saturation=0.5,"
                    f"scale=1080:1920,setsar=1", *enc, bg])
            else:
                vf = f"{rot}scale=1080:1920:flags=lanczos,setsar=1"
            ff(["-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src, "-vf", vf, *enc, out])
            print("built", out)
        if s.get("room"):
            r0 = s["room"].get("from", a)
            rs = s["ms"] + (r0 - a)
            rd = b - r0 + 0.05
            wav = os.path.join(ROOT, f"assets/audio/room-{s['id']}.wav")
            if FORCE or not os.path.exists(wav):
                ff(["-ss", f"{rs:.3f}", "-t", f"{rd:.3f}", "-i", src, "-vn", "-ac", "1", "-ar", "48000", "-af",
                    f"afade=t=in:d=0.02,afade=t=out:st={rd - 0.04:.3f}:d=0.04", wav])
                print("built", wav)


if __name__ == "__main__":
    main()
