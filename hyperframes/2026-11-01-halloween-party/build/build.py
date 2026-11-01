#!/usr/bin/env python3
"""DB Halloween party recap (Sat 10/31/2026), feed reel 1080x1920. Source: Don's drop, copied to
don-drops/2026-10-31-halloween/raw/ (iMessage clips 1280x720 30 fps HLG rotated -90, share1614_a/b 4K60 HLG).

Spine: Don's own lines. "The Different Breed Halloween experience" (his IMG_2791 caption) on the title, and
"More than fitness. We are the community." (his IMG_2809 caption, trimmed) on the closer.

Story (v2, Joey 11/1: "just focus on the kids"; the MJ ladder, morning class and the adults' toast are out): hook on the
T-rex + little Spider-Man trick-or-treating (no type, 1.5 s), title over the witch at the Pulse door, the walk in, the
party tables, trick-or-treat out front of Pulse, kids dancing, closer line over Jessie dancing, end tag v2 (slam). Only
kid party / trick-or-treat clips (IMG_2791, 2800, 2803, 2807, 2808, 2809, share1614_a/b). One appearance per person
where the footage allows. Kids only on good moments.

Music: ElevenLabs bed (scripts/generate-music.mjs, take B, prompt in build/music-prompts.txt), 120 BPM, full beat from
frame 0, instrumental, no vocals. Cuts sit on its aubiotrack beats (BEATS below). Natural sound from each clip runs
under it at NAT_VOL. End tag = DB song hook via _end-tag-v2.

Grade: house Sample cinematic v3 on every footage layer (prep_photo bakes a photo to a still clip so it would be graded too; v2 uses no photos).
Prep: rotate, scale to 1080x1920 (scale BEFORE tonemap on the 4K files), hable tonemap, unsharp 0.6 (v3 pairing).

  python3 build/build.py
  npx --yes hyperframes@0.8.207 check . && npx --yes hyperframes@0.8.207 render . --quiet -o renders/halloween-party-v2-raw.mp4
  bash build/master.sh renders/halloween-party-v2-raw.mp4 renders/halloween-party-v2.mp4
"""
import html
import json
import math
import os
import subprocess
import sys

from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
WT = os.path.normpath(os.path.join(ROOT, "../.."))
sys.path.insert(0, os.path.normpath(os.path.join(ROOT, "../_end-tag-v2")))
import endtag_v2 as et2  # noqa: E402

RAW = os.path.join(WT, "don-drops/2026-10-31-halloween/raw")
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,"
      "zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
SHARP = "unsharp=5:5:0.6:5:5:0"

BED = "assets/audio/bed-halloween-B.mp3"
BED_VOL = 0.85
NAT_VOL = 0.30
HOOK_PRE = 0.55
assert (48.80, 0.08) == (et2.SONG_SRC, et2.SONG_LEAD)

# aubiotrack beats of the bed (reel t == bed t, the bed starts at 0)
BEATS = [1.501, 1.990, 2.479, 3.012, 3.506, 4.001, 4.521, 5.016, 5.511, 6.003, 6.496, 6.990, 7.772, 8.266, 8.760,
         9.264, 9.756, 10.248, 10.760, 11.253, 11.746, 12.257, 12.750, 13.242, 13.764, 14.257, 14.750, 15.264,
         15.756, 16.249, 16.761, 17.254, 17.746, 18.259, 18.751, 19.243, 19.764, 20.257, 20.751, 21.269, 21.762,
         22.255, 22.761, 23.254]
B = lambda k: BEATS[k]
END = 21.8                       # end tag v2 wants END on a 0.1 s frame; beat 40 is 21.762
TOTAL = round(END + et2.DUR, 4)
HANDLE = 0.3

# (source file, media start in src s, reel start, reel end, nat volume multiplier, note)
# nat x0.5 where whisper heard background music in the room (gym speakers, the party DJ), so it can't fight the bed
SEQ = [
    ("IMG_2809.mov", 3.00, 0.0, B(0), 1.0, "HOOK: T-rex costume + little Spider-Man with his pumpkin at the candy"),
    ("IMG_2791.mov", 0.30, B(0), B(3), 1.0, "TITLE: witch at the Pulse door, kids in costume (yellow tutu, Pink Ladies jacket)"),
    ("IMG_2791.mov", 13.50, B(3), B(5), 0.5, "through the doors into the decorated Pulse room"),
    ("IMG_2791.mov", 27.00, B(5), B(7), 1.0, "long tables of kids doing crafts"),
    ("IMG_2803.mov", 3.40, B(7), B(9), 1.0, "girl in the yellow jacket at the table, pizza"),
    ("IMG_2800.mov", 13.00, B(9), B(11), 1.0, "Beetlejuice tutu at the table"),
    ("IMG_2803.mov", 6.60, B(11), B(13), 1.0, "pink cowgirl hat"),
    ("IMG_2800.mov", 25.20, B(13), B(15), 1.0, "Ninja Turtle + fairy at the table"),
    ("IMG_2803.mov", 12.20, B(15), B(17), 0.5, "balloons and webs across the ceiling, room full"),
    ("IMG_2807.mov", 4.60, B(17), B(20), 1.0, "TRICK-OR-TREAT: candy into the red costume's bag out front of Pulse"),
    ("IMG_2808.mov", 4.00, B(20), B(22), 1.0, "Cat in the Hat handing out"),
    ("IMG_2809.mov", 38.60, B(22), B(24), 1.0, "yellow hat + Curious George toddler"),
    ("IMG_2809.mov", 22.80, B(24), B(27), 1.0, "toddlers (purple suit, Spider-Man) at the candy"),
    ("IMG_2807.mov", 8.20, B(27), B(29), 1.0, "little Wonder Woman with her bag on the sidewalk"),
    ("share1614_a.mov", 13.40, B(29), B(31), 0.5, "DANCE: Woody + cowgirl on the Pulse floor"),
    ("share1614_a.mov", 9.00, B(31), B(33), 0.5, "yellow costume with the black balloon"),
    ("IMG_2791.mov", 41.50, B(33), B(35), 0.5, "crafts table, red hair + yellow top painting pumpkins"),
    ("share1614_b.mov", 25.30, B(35), END, 0.5, "CLOSER: Jessie dancing; 'more than fitness, we are the community'"),
]
FLASH_AT = [B(3), B(17), B(29)]      # quick white flash transitions: inside, trick-or-treat, dance


def ff(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)


def is_hdr(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer",
                          "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip()
    return out in ("arib-std-b67", "smpte2084")


def prep_video(i, src, ms, length):
    """-> (media offset inside the prepped file, prepped path, nat wav path)"""
    base = os.path.splitext(src)[0]
    out = os.path.join(ROOT, f"assets/footage/s{i:02d}_{base}_{ms:.2f}.mp4")
    nat = os.path.join(ROOT, f"assets/audio/nat-s{i:02d}_{base}_{ms:.2f}.wav")
    pre = min(HANDLE, ms)
    path = os.path.join(RAW, src)
    if not os.path.exists(out):
        chain = ["scale=1080:1920:flags=lanczos"]          # autorotated by ffmpeg; scale first (4K files)
        if is_hdr(path):
            chain.append(TM)
        # setparams: -vf keeps the source's HLG/bt2020 tags on the SDR pixels otherwise, and HyperFrames then
        # auto-promotes the whole render to HDR (v2 first render came out gray)
        chain += [SHARP, "fps=30", "setsar=1", "format=yuv420p",
                  "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv"]
        ff(["-ss", f"{ms - pre:.3f}", "-t", f"{length + HANDLE + pre:.3f}", "-i", path, "-an", "-vf", ",".join(chain),
            "-r", "30", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-g", "15",
            "-keyint_min", "15", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", out])
        print("prepped", out)
    if not os.path.exists(nat):
        ff(["-ss", f"{ms - pre:.3f}", "-t", f"{length + HANDLE + pre:.3f}", "-i", path, "-vn", "-ac", "2", "-ar", "48000",
            "-c:a", "pcm_s16le", nat])
    return round(pre, 3), os.path.relpath(out, ROOT), os.path.relpath(nat, ROOT)


def prep_photo(i, src, length, pos_x=0.52):
    """HEIC -> upright sRGB -> 9:16 crop 1080x1920 -> still clip (so the grade applies like any footage layer)."""
    base = os.path.splitext(src)[0]
    jpg = os.path.join(ROOT, f"assets/photo/{base}.jpg")
    out = os.path.join(ROOT, f"assets/footage/s{i:02d}_{base}_still.mp4")
    if not os.path.exists(jpg):
        tmp = jpg + ".sips.jpg"
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "92", "-m",
                        "/System/Library/ColorSync/Profiles/sRGB Profile.icc", os.path.join(RAW, src), "--out", tmp],
                       check=True, capture_output=True)
        im = ImageOps.exif_transpose(Image.open(tmp)).convert("RGB")
        im = ImageOps.fit(im, (1080, 1920), Image.LANCZOS, centering=(pos_x, 0.5))
        im.save(jpg, quality=93)
        os.remove(tmp)
    if not os.path.exists(out):
        ff(["-loop", "1", "-t", f"{length + HANDLE:.3f}", "-i", jpg, "-vf", "fps=30,format=yuv420p", "-c:v", "libx264",
            "-crf", "16", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", out])
    return 0.0, os.path.relpath(out, ROOT)


def esc(o):
    return html.escape(json.dumps(o, separators=(",", ":")), quote=True)


def main():
    for d in ("assets/footage", "assets/photo", "assets/audio"):
        os.makedirs(os.path.join(ROOT, d), exist_ok=True)
    shots, slots, log, A, layers, audio = [], [], [], [], [], []
    for i, (src, ms, a, b, natm, note) in enumerate(SEQ):
        a, b = round(a, 3), round(b, 3)
        length = round(b - a, 3)
        if ms is None:
            off, path = prep_photo(i, src, length)
            nat = None
        else:
            off, path, nat = prep_video(i, src, ms, length)
        shots.append(f'      <!-- s{i:02d} {src} @{ms}: {html.escape(note)} -->\n'
                     f'      <div class="shot" id="w{i}"><div class="push" data-layout-allow-overflow="">'
                     f'<video id="v{i}" class="clip foot" src="{path}" data-start="{a:.3f}" data-duration="{length:.3f}" '
                     f'data-media-start="{off:.3f}" data-track-index="{i % 2}" muted playsinline></video></div></div>')
        slots.append({"i": i, "a": a, "b": b, "z": 1.06 if ms is None else 1.035})
        if nat and natm > 0:
            v = round(NAT_VOL * natm, 3)
            pts = [{"t": 0, "v": 0}, {"t": 0.04, "v": v}, {"t": round(length - 0.04, 3), "v": v}, {"t": length, "v": 0}]
            audio.append(f'      <audio id="n{i}" src="{nat}" data-start="{a:.3f}" data-duration="{length:.3f}" '
                         f'data-media-start="{off:.3f}" data-track-index="{40 + i % 2}" data-volume="1" '
                         f'data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": pts}]})}"></audio>')
        mtxt = "photo" if ms is None else f"in {ms:6.2f} out {ms + length:6.2f}"
        log.append(f"{a:6.2f}-{b:6.2f}  {src:16} {mtxt:22}  {note}")

    # flash transitions
    # each flash is its own short clip: a fromTo's from-state (opacity 0.55) would otherwise sit on screen before it fires
    for k, t in enumerate(FLASH_AT):
        layers.append(f'      <div id="t-flash{k}" class="clip layer" data-start="{t:.3f}" data-duration="0.300" data-track-index="5">'
                      f'<div class="abs" id="fl{k}" style="inset:0;background:#fff;opacity:0"></div></div>')
        A.append({"sel": f"#fl{k}", "kind": "flash", "t": t, "o": 0.55})

    # TITLE over the witch at the door (B0-B3): "the" / DIFFERENT BREED / HALLOWEEN (red) / "experience". Lower third, in the safe band.
    t0, t1 = B(0), B(3)
    layers.append(
        f'      <div id="t-title" class="clip layer" data-start="{t0:.3f}" data-duration="{t1 - t0:.3f}" data-track-index="6">'
        f'<div class="scrim" style="height:1000px;background:linear-gradient(to top, rgba(11,11,12,0.78), rgba(11,11,12,0))"></div>'
        f'<div class="col" style="left:70px;top:1050px;width:940px;align-items:center">'
        f'<div class="rel"><span class="cn" id="ti-the" style="font-size:84px;opacity:0">the</span></div>'
        f'<div class="rel" style="margin-top:6px"><span class="pw fit" id="ti-db" data-fit="900" style="font-stretch:72%;line-height:0.9;opacity:0">Different Breed</span></div>'
        f'<div class="rel"><span class="pw fit red" id="ti-hw" data-fit="900" style="font-stretch:88%;line-height:0.9;opacity:0">Halloween</span></div>'
        f'<div class="rel" style="margin-top:8px"><span class="cn" id="ti-exp" style="font-size:96px;opacity:0">experience</span></div>'
        f'</div></div>')
    A += [{"sel": "#ti-the", "kind": "conn", "t": round(t0, 3)},
          {"sel": "#ti-db", "kind": "punch", "t": round(t0 + 0.1, 3)},
          {"sel": "#ti-hw", "kind": "punch", "t": round(B(1), 3)},
          {"sel": "#ti-exp", "kind": "conn", "t": round(B(1) + 0.15, 3)}]

    # CLOSER line over the dancing (B35-END): "more than fitness." / WE ARE THE / COMMUNITY. (red)
    c0 = B(35)
    layers.append(
        f'      <div id="t-close" class="clip layer" data-start="{c0:.3f}" data-duration="{END - c0:.3f}" data-track-index="7">'
        f'<div class="scrim" style="height:900px;background:linear-gradient(to top, rgba(11,11,12,0.78), rgba(11,11,12,0))"></div>'
        f'<div class="col" style="left:70px;top:1130px;width:940px;align-items:center">'
        f'<div class="rel"><span class="cn" id="cl-mt" style="font-size:92px;opacity:0">more than fitness.</span></div>'
        f'<div class="rel" style="margin-top:14px"><span class="pw fit" id="cl-we" data-fit="760" style="font-stretch:80%;line-height:0.9;opacity:0">We are the</span></div>'
        f'<div class="rel"><span class="pw fit red" id="cl-com" data-fit="940" style="font-stretch:70%;line-height:0.9;opacity:0">Community.</span></div>'
        f'</div></div>')
    A += [{"sel": "#cl-mt", "kind": "conn", "t": round(c0 + 0.1, 3)},
          {"sel": "#cl-we", "kind": "punch", "t": round(B(36), 3)},
          {"sel": "#cl-com", "kind": "punch", "t": round(B(37), 3)}]

    et2.install(ROOT)
    tag_html, tag_s, hook_at_end = et2.end_tag_v2(A, END, track=10)
    layers.append(tag_html)
    log.append(f"{END:6.2f}-{TOTAL:6.2f}  {'(end tag v2)':39}  slam tag + 'We are Different Breed' hook")

    # bed: full from 0, fades under the tag's stop-time so 'We ... are' is clean
    bpts = [{"t": 0, "v": BED_VOL}, {"t": round(END - 0.9, 3), "v": BED_VOL}, {"t": round(END - 0.1, 3), "v": 0}]
    audio.insert(0, f'      <audio id="a-bed" src="{BED}" data-start="0" data-duration="{END:.3f}" data-media-start="0" '
                    f'data-track-index="33" data-volume="1" data-automation="{esc({"version": 1, "lanes": [{"target": "volume", "points": bpts}]})}"></audio>')
    audio.append(et2.hook_audio(END, pre=HOOK_PRE, track=31))

    rep = {"%TOTAL%": f"{TOTAL}", "%SHOTS%": "\n".join(shots), "%TYPE%": "\n".join(layers),
           "%AUDIO%": "\n".join(audio), "%SLOTS%": json.dumps(slots), "%ANIMS%": json.dumps(A)}
    page = open(os.path.join(HERE, "template.html")).read()
    page = page.replace("<!-- Thriller: creaking-door intro, stab at 41.30 into the bassline groove, the laugh under the mask; DB hook on the end tag -->",
                        "<!-- ElevenLabs Halloween bed from frame 0, clip nat sound under it; DB hook on the end tag -->")
    page = page.replace("// CJ Thriller (DB Kinetic Type Kit)", "// DB Halloween party recap (DB Kinetic Type Kit)")
    for k, v in rep.items():
        page = page.replace(k, v)
    page = et2.patch_page(page)
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    open(os.path.join(HERE, "shotlist.txt"), "w").write("\n".join(log) + "\n")

    grading = open(os.path.join(HERE, "sample-cinematic-v3.json")).read().replace("\n", "").replace(" ", "")
    subprocess.run(["npx", "--yes", "hyperframes@0.8.207", "media-treatment", "--project", ROOT, "--file", "index.html",
                    "--selector", "video.foot", "--apply", "--grading", grading], check=True)
    print("\n".join(log))
    print(f"END {END}  TOTAL {TOTAL}")
    print(et2.timing_report(END))


if __name__ == "__main__":
    main()
