import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  OffthreadVideo,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Audio } from "@remotion/media";
import { COLORS, FONTS, FPS } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";

const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

// Clip config: source file, duration to show (frames), trim start (frames)
const CLIPS = [
  { src: "apr11-alpine-runner.mov", duration: 90, trimStart: 2 * FPS }, // treadmill sprint
  { src: "apr11-sled-push-male.mov", duration: 85, trimStart: 1 * FPS }, // sled push
  { src: "apr12-ladder-crawl.mov", duration: 85, trimStart: 3 * FPS }, // ladder bear crawls
  { src: "apr12-sled-push-female.mov", duration: 80, trimStart: 0 }, // female sled push w/ ring
  { src: "apr11-ab-wheel.mov", duration: 80, trimStart: 2 * FPS }, // ab wheel duo
] as const;

const TRANSITION_FRAMES = 8;
const END_TAG_DURATION = 120; // 4 seconds

// Total: sum of clip durations - (transitions * overlap) + end tag
export const BUILT_DIFFERENT_DURATION =
  CLIPS.reduce((sum, c) => sum + c.duration, 0) -
  (CLIPS.length - 1) * TRANSITION_FRAMES +
  END_TAG_DURATION;

// Flash/impact frame on transitions
const FlashFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 3, TRANSITION_FRAMES], [0.7, 0, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.white, opacity, pointerEvents: "none" }}
    />
  );
};

// Single video clip with optional text overlay
const TrainingClip: React.FC<{
  src: string;
  trimStart: number;
  showFlash?: boolean;
}> = ({ src, trimStart, showFlash }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle zoom for energy
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.12], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={trimStart}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>

      {/* Thin vignette for consistency */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* DB Logo watermark */}
      <div
        style={{
          position: "absolute",
          top: SAFE_TOP,
          right: SAFE_SIDES,
          opacity: 0.85,
        }}
      >
        <Img
          src={staticFile("db-logo-red-outline.png")}
          style={{ width: 70, height: 70 }}
        />
      </div>
    </AbsoluteFill>
  );
};

// Opening title card over first clip
const OpeningTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);

  const lineWidth = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 18 }),
    [0, 1],
    [0, 200]
  );

  const subSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

  // Fade out before clip ends
  const fadeOut = interpolate(frame, [70, 85], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Dark gradient for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: SAFE_BOTTOM + 100,
          paddingLeft: SAFE_SIDES,
          paddingRight: SAFE_SIDES,
        }}
      >
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOp,
            fontFamily: FONTS.headline,
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: -1,
            lineHeight: 1.05,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          Built{" "}
          <span style={{ color: COLORS.red }}>Different</span>
        </div>

        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 16,
            marginBottom: 16,
          }}
        />

        <div
          style={{
            opacity: subOp,
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            letterSpacing: 2,
            textTransform: "uppercase",
            textShadow: "0 2px 20px rgba(0,0,0,0.7)",
          }}
        >
          This is how we train
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BuiltDifferent: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate where the video clips end (before end tag)
  const clipsDuration =
    CLIPS.reduce((sum, c) => sum + c.duration, 0) -
    (CLIPS.length - 1) * TRANSITION_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Music — Touch It instrumental, fade in/out */}
      <Audio
        src={staticFile("music-touch-it.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, fps * 0.5, durationInFrames - fps * 2, durationInFrames],
            [0, 0.7, 0.7, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Training clips with fade transitions */}
      <TransitionSeries>
        {CLIPS.map((clip, i) => (
          <React.Fragment key={clip.src}>
            <TransitionSeries.Sequence durationInFrames={clip.duration}>
              <TrainingClip
                src={clip.src}
                trimStart={clip.trimStart}
              />
              {/* Title overlay on first clip only */}
              {i === 0 && <OpeningTitle />}
            </TransitionSeries.Sequence>

            {i < CLIPS.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Fade to black before end tag */}
      <Sequence from={clipsDuration - 20} durationInFrames={20}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(
              frame - (clipsDuration - 20),
              [0, 20],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        />
      </Sequence>

      {/* End tag */}
      <Sequence from={clipsDuration} durationInFrames={END_TAG_DURATION}>
        <EndTagScene tagline="Elite Training" />
      </Sequence>
    </AbsoluteFill>
  );
};
