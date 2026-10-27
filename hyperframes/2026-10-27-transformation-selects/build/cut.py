#!/usr/bin/env python3
"""Cut every bite in build/selects.json into a picture proxy + a level-matched audio file.

Cut points come from the Parakeet words in assets/windows/<id>.parakeet.json (build/words.py):
  in  = first word start - HEAD, never earlier than the previous word's end + GAP
  out = last word end + TAIL, never later than the next word's start - GAP (Parakeet pads some last words with
        silence, so a last word counts as at most MAX_WORD long). "out_fixed" overrides out (Parakeet drops
        Stacy's quiet answer in b02b; whisper medium.en hears it).
Outputs, all [in, out] of the source, frame-rounded at 30 fps:
  assets/footage/<id>.mp4  720x1280 SDR, no audio (HLG sources tone-mapped with the zscale chain from
                           scripts/hdr-tonemap.sh; 480p sources scaled up and center-cropped)
  assets/audio/<id>.wav    mono 48k, two-pass loudnorm to LUFS, 20 ms fades
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


def loudnorm(src, start, dur, wav):
    af = f"loudnorm=I={LUFS}:TP=-1.5:LRA=11"
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src,
                        "-vn", "-ac", "1", "-af", af + ":print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True, check=True).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    af2 = (f"{af}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
           f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
           f"aresample=48000,afade=t=in:d=0.02,afade=t=out:st={dur - 0.03:.3f}:d=0.03")
    ff(["-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", src, "-vn", "-ac", "1", "-af", af2, "-ar", "48000", wav])


def main():
    cfg = json.load(open(os.path.join(ROOT, "build/selects" + (f"-{SET}" if SET else "") + ".json")))
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
        w, h = (int(v) for v in probe(src, "stream=width,height").split())
        if probe(src, "stream_side_data=rotation").lstrip("-") in ("90", "270"):
            w, h = h, w
        vid = os.path.join(ROOT, f"assets/footage/{b['id']}.mp4")
        wav = os.path.join(ROOT, f"assets/audio/{b['id']}.wav")
        if stale or not os.path.exists(vid):
            if w > h:  # landscape: letterbox the whole frame rather than guess a crop
                vf = ("scale=720:-2:flags=lanczos,setsar=1," + (TONEMAP if hdr else "format=yuv420p")
                      + ",pad=720:1280:(ow-iw)/2:(oh-ih)/2:black")
            else:
                vf = ("scale=720:1280:force_original_aspect_ratio=increase:flags=lanczos,crop=720:1280,setsar=1,"
                      + (TONEMAP if hdr else "format=yuv420p"))
            ff(["-ss", f"{t_in:.3f}", "-t", f"{dur:.3f}", "-i", src, "-vf", vf, "-an", "-r", str(FPS),
                "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                "-movflags", "+faststart", vid])
        if stale or not os.path.exists(wav):
            loudnorm(src, t_in, dur, wav)
        cuts[b["id"]] = {"id": b["id"], "row": b["row"], "who": b["who"], "what": b["what"],
                         "file": os.path.basename(rel), "in": t_in, "dur": dur, "hdr": hdr}
        print(f"{b['id']:5} {t_in:7.2f} +{dur:6.2f}  {'HDR' if hdr else 'SDR'}  {os.path.basename(rel)}")
    order = [b["id"] for b in cfg["bites"] if b["id"] in cuts]
    json.dump([cuts[i] for i in order], open(cuts_path, "w"), indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
