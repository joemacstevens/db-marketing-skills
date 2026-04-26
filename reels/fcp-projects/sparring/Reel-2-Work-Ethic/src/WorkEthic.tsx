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

const VO_START = 246;           // VO starts at 8.2s (after coach section)
const VO_DURATION = s(9.4);
const VO_END = VO_START + VO_DURATION;
const DUCK_FADE = s(0.5);
const MUSIC_FULL = 1;
const MUSIC_DUCKED = 0.15;

// First 8.2s: Coach Dred is talking on camera — music low, original audio loud
const COACH_TALK_END = 246;
const COACH_TALK_FADE = s(0.8);
const MUSIC_UNDER_COACH = 0.25;
const VIDEO_LOUD = 0.85;
const VIDEO_QUIET = 0.12;

// Beat-synced cuts for 30s — "4 Raws" ~148 BPM
// Cut points: 0 → 8.20 → 16.12 → 21.13 → 26.10 → 30
const clips = [
  { name: "C4755 - Coach Dred instructing tall kid opener", file: "C4755.MP4", startFrom: s(5), duration: 246 },  // 0→8.20s
  { name: "C4759 - CJ full bag sequence best raw energy", file: "C4759.MP4", startFrom: s(10), duration: 238 },  // 8.20→16.12s
  { name: "C4757 - Kid in black focused training", file: "C4757.MP4", startFrom: s(5), duration: 150 },          // 16.12→21.13s
  { name: "C4760 - Kid in white shorts bag work", file: "C4760.MP4", startFrom: s(10), duration: 149 },          // 21.13→26.10s
  { name: "C4756 - CJ finishing combo closer", file: "C4756.MP4", startFrom: s(30), duration: 117 },             // 26.10→30s
];

export const WorkEthic: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let currentFrame = 0;

  const musicFadeStart = durationInFrames - s(1.5);

  // Phase 1 (0-10s): Music quiet, coach talking loud on original audio
  // Phase 2 (10-19.4s): VO plays, music ducked for VO
  // Phase 3 (19.4s+): Music full
  let musicLevel = MUSIC_FULL;
  if (frame < COACH_TALK_END - COACH_TALK_FADE) {
    // Under coach talking: music quiet
    musicLevel = MUSIC_UNDER_COACH;
  } else if (frame < COACH_TALK_END) {
    // Crossfade: music rises as we approach VO
    musicLevel = interpolate(frame, [COACH_TALK_END - COACH_TALK_FADE, COACH_TALK_END], [MUSIC_UNDER_COACH, MUSIC_FULL], { extrapolateRight: "clamp" });
  } else if (frame >= VO_START - DUCK_FADE && frame < VO_START) {
    musicLevel = interpolate(frame, [VO_START - DUCK_FADE, VO_START], [MUSIC_FULL, MUSIC_DUCKED], { extrapolateRight: "clamp" });
  } else if (frame >= VO_START && frame < VO_END) {
    musicLevel = MUSIC_DUCKED;
  } else if (frame >= VO_END && frame < VO_END + DUCK_FADE) {
    musicLevel = interpolate(frame, [VO_END, VO_END + DUCK_FADE], [MUSIC_DUCKED, MUSIC_FULL], { extrapolateRight: "clamp" });
  }

  const endFade = frame >= musicFadeStart
    ? interpolate(frame, [musicFadeStart, durationInFrames], [1, 0], { extrapolateRight: "clamp" })
    : 1;

  const musicVolume = musicLevel * endFade;

  // Video original audio: loud for first 10s (coach talking), then quiet
  let videoVolume = VIDEO_QUIET;
  if (frame < COACH_TALK_END - COACH_TALK_FADE) {
    videoVolume = VIDEO_LOUD;
  } else if (frame < COACH_TALK_END) {
    videoVolume = interpolate(frame, [COACH_TALK_END - COACH_TALK_FADE, COACH_TALK_END], [VIDEO_LOUD, VIDEO_QUIET], { extrapolateRight: "clamp" });
  }

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
      <Audio src={staticFile("music.mp3")} volume={musicVolume} startFrom={0} />

      <Sequence from={246} durationInFrames={VO_DURATION}>
        <Audio src={staticFile("vo.mp3")} volume={1} />
      </Sequence>

      {clips.map((clip, i) => {
        const from = currentFrame;
        currentFrame += clip.duration;
        return (
          <Sequence key={i} name={clip.name} from={from} durationInFrames={clip.duration}>
            <OffthreadVideo
              src={staticFile(clip.file)}
              startFrom={clip.startFrom}
              volume={videoVolume}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
        );
      })}

      <Overlays />
    </div>
  );
};
