import React from "react";
import {
  Audio,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Overlays } from "./Overlays";

const FPS = 30;
const s = (seconds: number) => Math.round(seconds * FPS);

// VO duration in frames (~21.8s)
const VO_DURATION = s(22);
const DUCK_FADE = s(0.5);
const MUSIC_FULL = 1;
const MUSIC_DUCKED = 0.15;

// Beat-synced cuts for 30s version — "6 Foot 7 Foot" ~114 BPM
// Cut points: 0 → 3.50 → 8.84 → 14.52 → 20.22 → 25.95 → 30
const clips = [
  { name: "C4758 - Wide gym shot establisher", file: "C4758.MP4", startFrom: s(0), duration: 105 },    // 0→3.50s
  { name: "C4757 - Kid in black/Boo Boo cap", file: "C4757.MP4", startFrom: s(3), duration: 160 },    // 3.50→8.84s
  { name: "C4756 - CJ green gloves power combos", file: "C4756.MP4", startFrom: s(5), duration: 171 },// 8.84→14.52s
  { name: "C4760 - Headgear guy + kid in white bag work", file: "C4760.MP4", startFrom: s(5), duration: 171 },// 14.52→20.22s
  { name: "C4754 - Coach Dred coaching/clinching", file: "C4754.MP4", startFrom: s(0), duration: 172 },// 20.22→25.95s
  { name: "C4755 - Coach Dred instruction close-up closer", file: "C4755.MP4", startFrom: s(10), duration: 121 },// 25.95→30s
];

export const TheTeam: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let currentFrame = 0;

  const musicFadeStart = durationInFrames - s(1.5);

  let musicDuck = MUSIC_FULL;
  if (frame < DUCK_FADE) {
    musicDuck = interpolate(frame, [0, DUCK_FADE], [MUSIC_FULL, MUSIC_DUCKED], { extrapolateRight: "clamp" });
  } else if (frame < VO_DURATION) {
    musicDuck = MUSIC_DUCKED;
  } else if (frame < VO_DURATION + DUCK_FADE) {
    musicDuck = interpolate(frame, [VO_DURATION, VO_DURATION + DUCK_FADE], [MUSIC_DUCKED, MUSIC_FULL], { extrapolateRight: "clamp" });
  } else {
    musicDuck = MUSIC_FULL;
  }

  const endFade = frame >= musicFadeStart
    ? interpolate(frame, [musicFadeStart, durationInFrames], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  const musicVolume = musicDuck * endFade;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
      <Audio src={staticFile("music.mp3")} volume={musicVolume} startFrom={0} />
      <Audio src={staticFile("vo.mp3")} volume={1} startFrom={0} />

      {clips.map((clip, i) => {
        const from = currentFrame;
        currentFrame += clip.duration;
        return (
          <Sequence key={i} name={clip.name} from={from} durationInFrames={clip.duration}>
            <OffthreadVideo
              src={staticFile(clip.file)}
              startFrom={clip.startFrom}
              volume={0.12}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        );
      })}

      <Overlays />
    </div>
  );
};
