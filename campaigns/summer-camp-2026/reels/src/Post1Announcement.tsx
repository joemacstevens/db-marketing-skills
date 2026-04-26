import React from "react";
import { AbsoluteFill, staticFile, interpolate, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { PhotoScene } from "./components/PhotoScene";
import { CTAScene } from "./components/CTAScene";
import { CTABar } from "./components/CTABar";

const SCENE_DURATION = 90; // 3 seconds at 30fps
const TRANSITION_DURATION = 10;

export const Post1Announcement: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Music bed — audible under VO */}
      <Audio
        src={staticFile("music-bed.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, fps * 0.5, durationInFrames - fps * 2, durationInFrames],
            [0, 0.35, 0.35, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Voiceover */}
      <Audio src={staticFile("vo-post1.mp3")} volume={0.95} />

      {/* Visual scenes — NEW action shots of kids */}
      <TransitionSeries>
        {/* Scene 1 — Hook: Kid smiling mid-drill */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <PhotoScene
            imageSrc="action-smile-drill.jpg"
            headline={"DB Summer Camp\nIs Back."}
            subline="Ages 11–16 · June 29 – August 28"
            brightness={1.15}
            imagePosition="center 35%"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2 — Boxing mitts: kid throwing punches with coach */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <PhotoScene
            imageSrc="action-boxing-mitts.jpg"
            headline={"9 Weeks. 5 Sports.\nReal Coaches."}
            brightness={1.3}
            imagePosition="center 40%"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3 — Basketball game: kids competing */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <PhotoScene
            imageSrc="action-basketball-game.jpg"
            headline={"Boxing. Basketball.\nConditioning."}
            brightness={1.05}
            imagePosition="center 40%"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4 — Kid airborne during ball game */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION}>
          <PhotoScene
            imageSrc="action-jump-ball.jpg"
            headline={"Pilates.\nSports Performance."}
            brightness={1.35}
            imagePosition="center 40%"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5 — CTA: kid shooting jump shot */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATION + 15}>
          <CTAScene
            imageSrc="action-jumpshot.jpg"
            brightness={1.1}
            imagePosition="center 35%"
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Persistent CTA bar — above IG safe zone */}
      <CTABar />
    </AbsoluteFill>
  );
};
