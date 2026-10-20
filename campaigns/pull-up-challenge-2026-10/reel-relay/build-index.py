# Fills index.template.html from timing.json (rep beats + chunks) so the type stays locked to assemble.py.
import json, re
T = json.load(open("timing.json"))
src = open("build/index.template.html").read()
grade = re.search(r'<video (data-color-grading="[^"]*")', open(
    "/Users/joestevens/Projects/Different Breed/.claude/worktrees/pull-up-video-reel-board-78f85b/"
    "campaigns/pull-up-challenge-2026-10/reel-april/index.html").read()).group(1)  # same A2 grade as the series
BOARD = {"Amanda": "Women's #2", "April": "Women's #1", "Roberto": "Men's #2", "Ahmed": "Men's #1"}
maxes = {c["max"] for c in T["chunks"]}
digits = "\n          ".join(
    f'<span class="dg punch{" red" if r["n"] in maxes else ""}" id="d{r["n"]}">{r["n"]}</span>' for r in T["reps"])
names, extra = [], []
for i, c in enumerate(T["chunks"]):
    names.append(f'<span class="nm tag" id="nm{i}">{c["who"]}</span>')
    if c["to"] == c["max"]:
        t = next(r["t"] for r in T["reps"] if r["n"] == c["max"])
        names.append(f'<span class="nm tag" id="mx{i}">{c["who"]}<span class="rule"></span>{BOARD[c["who"]]}</span>')
        extra.append({"i": i, "t": t})
T["maxTags"] = extra
out = (src.replace("__TOTAL__", str(T["total"])).replace("__GRADE__", grade)
       .replace("__DIGITS__", digits).replace("__NAMES__", "\n            ".join(names))
       .replace("__TIMING__", json.dumps(T)))
open("index.html", "w").write(out)
print("index.html written", T["total"], "s")
