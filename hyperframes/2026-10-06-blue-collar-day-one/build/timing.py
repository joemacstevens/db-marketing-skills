"""Shared timing helpers for build/reel.json (reel time = song time)."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC_DIR = "/Users/joestevens/Projects/Different Breed/Blue Collar 2026/Day 1"
R = json.load(open(os.path.join(HERE, "reel.json")))
G = R["grid"]


def T(spec):
    if isinstance(spec, (int, float)):
        return round(float(spec), 3)
    kind, n = spec.split(":")
    assert kind == "b", spec
    return round(G["phase"] + int(n) * G["beat"], 3)


END = T(R["end"]["at"])
TOTAL = round(END + R["end"]["length"], 3)


def slots():
    shots = R["shots"]
    starts = [T(s["at"]) for s in shots]
    assert starts == sorted(starts), "shots out of order"
    return [(s, a, b) for s, a, b in zip(shots, starts, starts[1:] + [END])]


def reel_of(shot_id, src_t):
    """Reel time of a source timestamp inside a shot."""
    for s, a, _ in slots():
        if s["id"] == shot_id:
            return round(a + (src_t - s["ms"]), 3)
    raise KeyError(shot_id)
