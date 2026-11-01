#!/usr/bin/env python3
"""Standalone review render of end tag v2: 0.7 s of black (the hook fades in under it, as it does under a reel's
closer), then the 5.0 s tag. Same template + kit fonts as the reels.

  python3 build/build.py && npm run check && npm run render -- -o renders/endtag-v2-A-raw.mp4
  bash build/master.sh renders/endtag-v2-A-raw.mp4 ../../output/2026-10-28/end-tag-v2/endtag-v2-A.mp4
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
import endtag_v2 as et2  # noqa: E402

LEAD = 0.7   # black lead-in (>= 0.08 + 0.55 so the hook element starts at t >= 0) so the song's 0.55 s fade-in (and the held "hey") play before the card, like in a reel


def main():
    A = []
    END = LEAD
    tag_html, tag_s, hook_at_end = et2.end_tag_v2(A, END)
    TOTAL = round(END + tag_s, 3)
    rep = {"%TOTAL%": f"{TOTAL}", "%SHOTS%": "", "%TYPE%": tag_html, "%AUDIO%": et2.hook_audio(END, pre=0.55),
           "%SLOTS%": "[]", "%ANIMS%": json.dumps(A)}
    page = open(os.path.join(HERE, "template.html")).read()
    for k, v in rep.items():
        page = page.replace(k, v)
    page = et2.patch_page(page)
    open(os.path.join(ROOT, "index.html"), "w").write(page)
    print(f"END {END}, tag {tag_s}s, total {TOTAL}s, song {hook_at_end} at END")
    print(et2.timing_report(END))


if __name__ == "__main__":
    main()
