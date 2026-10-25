"""Before/after test reel for the Sample cinematic house grade (hyperframes/_grades/sample-cinematic.json)."""
import os
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
clips = [("c6170", "Adrian · Sony"), ("c6164", "Adrian · Sony"), ("img9332", "Don · iPhone"), ("img9330", "Don · iPhone")]
D = 3.5
vids, chips = [], []
for i, (c, src) in enumerate(clips):
    s = f"{i * D:.3f}"
    vids.append(f'      <div class="half top"><video id="b{i}" class="clip before" src="assets/footage/{c}-before.mp4" data-start="{s}" data-duration="{D}" data-media-start="0" data-track-index="{i * 2}" muted playsinline></video></div>')
    vids.append(f'      <div class="half bot"><video id="a{i}" class="clip after" src="assets/footage/{c}.mp4" data-start="{s}" data-duration="{D}" data-media-start="0" data-track-index="{i * 2 + 1}" muted playsinline></video></div>')
    chips.append(f'      <div id="cb{i}" class="chip ghost clip ctop" data-start="{s}" data-duration="{D}" data-track-index="{20 + i * 2}">Before · {src}</div>')
    chips.append(f'      <div id="ca{i}" class="chip clip cbot" data-start="{s}" data-duration="{D}" data-track-index="{21 + i * 2}">Sample grade</div>')
nl = "\n"
html = f'''<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1080, height=1920">
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "NORD"; src: url("assets/fonts/NORD-Bold.otf"); font-weight: 700; }}
      :root {{ --ink: #0a0a0a; --red: #e81d1d; --bone: #f6f2ec; }}
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: var(--ink); }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: var(--ink); font-family: "NORD", sans-serif; }}
      .half {{ position: absolute; left: 0; width: 1080px; height: 954px; overflow: hidden; }}
      .half.top {{ top: 0; }}
      .half.bot {{ top: 966px; }}
      .half video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      .chip {{ position: absolute; left: 40px; background: var(--red); color: var(--bone); font-weight: 700; font-size: 30px; letter-spacing: 0.14em; text-transform: uppercase; padding: 10px 20px; }}
      .chip.ghost {{ background: rgba(10, 10, 10, 0.72); }}
      .ctop {{ top: 870px; }}
      .cbot {{ top: 1836px; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{D * len(clips):.3f}" data-width="1080" data-height="1920">
{nl.join(vids)}
{nl.join(chips)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''
open("index.html", "w").write(html)
