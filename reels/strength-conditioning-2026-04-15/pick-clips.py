#!/usr/bin/env python3
"""
Pick the best S&C clips for the feature reel.

Usage:
  python3 pick-clips.py

Reads the video index, ranks clips, and prints a suggested clip plan
(source path, trim start, duration, suggested role).
"""
import json
from pathlib import Path

INDEX = Path("/Volumes/Ajeo/Projects/Different Breed/Media Library/_index/videos.jsonl")

# S&C lexicon — subjects that map to strength OR conditioning work
STRICT_STRENGTH = {
    "weight lifting", "weights", "weightlifting", "lifting", "weight training",
    "kettlebell", "barbell", "dumbbell", "medicine ball",
    "squat", "squats", "deadlift", "strength training",
    "sled", "sled push", "trx",
    "battle rope", "battle ropes",
}

CONDITIONING = {
    "plyometrics", "box jump", "box jumps", "jump box",
    "sprint", "treadmill", "ski erg",
    "circuit", "hiit", "functional",
    "step aerobics", "step", "conditioning",
}

S_C_ALL = STRICT_STRENGTH | CONDITIONING

EXCLUDE_ACTIVITY = {"pilates"}


def load_videos():
    out = []
    with INDEX.open() as f:
        for line in f:
            out.append(json.loads(line))
    return out


def is_sc_clip(v):
    if v.get("model") is None:
        return False
    if not v.get("usage_flags", {}).get("approved"):
        return False
    if v.get("usage_flags", {}).get("avoid"):
        return False
    if v.get("quality_score", 0) < 6:
        return False
    if v.get("duration_seconds", 0) < 3:
        return False

    subjects = {s.lower() for s in (v.get("subject") or [])}
    activity = (v.get("activity_type") or "").lower()

    if activity in EXCLUDE_ACTIVITY:
        return False
    if "pilates" in subjects and not (subjects & S_C_ALL):
        return False

    has_sc = (subjects & S_C_ALL) or activity in {"training", "strength", "conditioning"}
    return bool(has_sc)


def score_clip(v):
    cf = v.get("content_fit", {})
    hr = cf.get("highlight_reel", 0)
    sr = cf.get("social_reel", 0)
    q = v.get("quality_score", 0)
    is_high = 1 if v.get("energy_level") == "high" else 0
    is_strict = 1 if {s.lower() for s in v.get("subject", [])} & STRICT_STRENGTH else 0
    return (hr + sr, q, is_high, is_strict)


def summarize(v):
    km = v.get("key_moments") or []
    km_str = " | ".join([f"{k['timestamp_sec']:.0f}s: {k['description'][:45]}" for k in km[:2]])
    cf = v.get("content_fit", {})
    return (
        f"q={v['quality_score']} e={(v.get('energy_level') or '?')[:3]} "
        f"dur={v['duration_seconds']:.1f}s hr={cf.get('highlight_reel',0):.1f} sr={cf.get('social_reel',0):.1f}\n"
        f"    subjects: {v.get('subject',[])[:6]}\n"
        f"    moments:  {km_str}"
    )


def main():
    videos = load_videos()

    # 1. gym_4_15_26 priority bucket
    new_batch = [v for v in videos if "gym_4_15_26" in v.get("path", "") and is_sc_clip(v)]
    new_batch.sort(key=score_clip, reverse=True)

    # 2. Recent strict-strength backups from 2026
    backups = [v for v in videos
               if is_sc_clip(v)
               and "2026" in v.get("path", "")
               and "gym_4_15_26" not in v.get("path", "")
               and {s.lower() for s in v.get("subject", [])} & STRICT_STRENGTH]
    backups.sort(key=score_clip, reverse=True)

    print("=" * 70)
    print(f"gym_4_15_26 S&C clips indexed so far: {len(new_batch)}")
    print("=" * 70)
    for v in new_batch:
        print(f"\n  {v['path']}")
        print(f"    {summarize(v)}")

    print()
    print("=" * 70)
    print(f"Strict-strength 2026 backups: {len(backups)}")
    print("=" * 70)
    for v in backups[:10]:
        print(f"\n  {v['path']}")
        print(f"    {summarize(v)}")


if __name__ == "__main__":
    main()
