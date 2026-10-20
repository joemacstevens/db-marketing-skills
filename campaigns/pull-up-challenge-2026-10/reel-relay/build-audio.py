# Soundtrack: Till I Collapse (instrumental, untouched) + the coaches' real voices as an undertone, then our
# anthem hook "We are Different Breed" under the end tag.
#
# Voices come from ElevenLabs 2-stem separation of each clip (build/voice/<who>-stems/vocals.mp3), so the
# gym's own music is gone. Each spoken count is lifted at its parakeet word times and dropped just after the
# rep it belongs to (coaches count a beat late), so "thirteen" plays on Ahmed's 13th. Where the clip plays at
# ~1x (Amanda's grip-and-go, April's hold, Don calling "twenty-seven") the voice runs in natural sync.
# Music ducks ~4 dB under the voices; the count sits under the beat, not on top of it.
import json, subprocess, numpy as np

SR = 48000
T = json.load(open("timing.json"))
REP = {r["n"]: r["t"] for r in T["reps"]}
TOTAL, E = T["total"], T["endTag"]
LAG = 0.12  # word onset after the rep top

def load(path, ss=0.0, dur=None):
    a = ["ffmpeg", "-v", "error", "-ss", f"{ss}", "-i", path]
    if dur: a += ["-t", f"{dur}"]
    raw = subprocess.run(a + ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

VOX = {w: load(f"build/voice/{w}-stems/vocals.mp3") for w in ("amanda", "april", "roberto", "ahmed")}
WORDS = {w: json.load(open(f"../footage-relay/{f}.parakeet.json"))["words"] for w, f in
         (("amanda", "amanda"), ("april", "april-IMG_6018"), ("roberto", "roberto-IMG_2163"), ("ahmed", "ahmed-IMG_2164"))}

voice = np.zeros((int(TOTAL * SR) + SR, 2), np.float32)

def place(who, s0, s1, at, gain=1.0, fade=0.012):
    seg = VOX[who][int(s0 * SR):int(s1 * SR)].copy() * gain
    n = int(fade * SR); ramp = np.linspace(0, 1, n)[:, None]
    seg[:n] *= ramp; seg[-n:] *= ramp[::-1]
    i = int(at * SR); voice[i:i + len(seg)] += seg[:len(voice) - i]

def word(who, start, at, upto=None):
    """lift the word(s) starting at parakeet time `start` (through `upto`) and drop it at output time `at`"""
    ws = WORDS[who]; k = next(i for i, w in enumerate(ws) if abs(w["start"] - start) < 0.01)
    j = next(i for i, w in enumerate(ws) if abs(w["start"] - (upto or start)) < 0.01)
    s0 = ws[k]["start"] - 0.04
    s1 = min(ws[j]["end"] + 0.08, ws[j + 1]["start"] - 0.02) if j + 1 < len(ws) else ws[j]["end"] + 0.08
    place(who, s0, s1, at - 0.04)

# Amanda: grip-and-go at 1x off the drop (src 3.63 at out 3.0) through Don's "one", then counts
place("amanda", 3.63, 5.85, 3.0)
word("amanda", 6.88, REP[2] + LAG)       # two
word("amanda", 14.4, REP[5] + LAG)       # five
word("amanda", 18.08, REP[6] + LAG)      # six
# April: her coach calls what's left, then "let's go ... yeah, that's ten" in sync over the hold
word("april", 17.6, REP[7] + LAG, 18.0)   # three more
word("april", 20.88, REP[8] + LAG, 21.2)  # two more
word("april", 27.92, REP[9] + LAG, 28.08) # one more
place("april", 35.2, 37.62, REP[10] - 0.4)  # src 35.6 = her 10th top, played 1x
# Roberto (Don counting)
for n, t in ((11, 11.76), (15, 16.8), (16, 18.0), (19, 23.92), (20, 25.6), (23, 35.84), (24, 40.48)):
    word("roberto", t, REP[n] + LAG)
# Ahmed (Don counting; 21 is "twenty-one", 26/27 he only says "six"/"seven")
for n, t, u in ((13, 14.48, None), (14, 15.84, None), (17, 19.76, None), (18, 21.44, None),
                (21, 25.92, 26.4), (22, 28.0, None), (26, 35.68, None), (27, 37.2, None)):
    word("ahmed", t, REP[n] + LAG, u)
# Don calls it under the CTA: "twenty-seven"
word("ahmed", 42.16, T["tailEnd"] + 0.55, 42.64)

voice = voice[:int(TOTAL * SR)]
peak = np.abs(voice).max(); voice *= 0.5 / peak  # voices sit under the music

# music: TIC to the end tag, anthem hook under it ("We" on E)
M = "/Volumes/Ajeo/Projects/Different Breed/Music/Till I Collapse (Instrumental) [HGnpwvw3cwM].mp3"
A = "/Users/joestevens/Projects/Different Breed/music/Different Breed.mp3"
tic = load(M, 54.33, E)
f = int(0.3 * SR); tic[-f:] *= np.linspace(1, 0, f)[:, None]
an = load(A, 48.55, TOTAL - E + 0.12)
f = int(0.25 * SR); an[-f:] *= np.linspace(1, 0, f)[:, None]
music = np.zeros_like(voice)
music[:len(tic)] += tic[:len(music)]
i = int((E - 0.12) * SR); music[i:i + len(an)] += an[:len(music) - i]

# duck the music ~4 dB under the voices (smoothed envelope), not on the anthem
env = np.abs(voice).max(1)
k = int(0.06 * SR); env = np.convolve(env, np.ones(k) / k, "same")
duck = 1 - 0.37 * np.clip(env / 0.08, 0, 1)
duck[int((E - 0.12) * SR):] = 1
mix = music * duck[:, None] + voice
mix = np.clip(mix, -1, 1).astype(np.float32)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "loudnorm=I=-14:TP=-1.0:LRA=11", "-ar", str(SR), "assets/audio/soundtrack.wav"],
               input=mix.tobytes(), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "build/voice/voice-track.wav"], input=voice.astype(np.float32).tobytes(), check=True)
print("soundtrack", TOTAL, "s")
