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
import { wipe } from "@remotion/transitions/wipe";
import { Audio } from "@remotion/media";
import { COLORS, FONTS, FPS } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";

const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

// Three movements, one athlete, one session
const CLIPS = [
  { src: "apr12-ladder-crawl.mov", duration: 120, trimStart: 2 * FPS, label: "Agility" },
  { src: "apr12-ladder-footwork.mov", duration: 90, trimStart: 1 * FPS, label: "Speed" },
  { src: "apr12-sled-push-female.mov", duration: 100, trimStart: 0, label: "Power" },
] as const;

const TRANSITION_FRAMES = 10;
const END_TAG_DURATION = 120;

export const HER_WORKOUT_DURATION =
  CLIPS.reduce((sum, c) => sum + c.duration, 0) -
  (CLIPS.length - 1) * TRANSITION_FRAMES +
  END_TAG_DURATION;

// Movement label that pops in at the start of each clip
const MovementLabel: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 200 },
    durationInFrames: 18,
  });
  const labelScale = interpolate(labelSpring, [0, 1], [0.6, 1]);
  const labelOp = interpolate(labelSpring, [0, 1], [0, 1]);

  // Fade out
  const fadeOut = interpolate(frame, [40, 55], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_TOP + 110,
        left: SAFE_SIDES,
        opacity: labelOp * fadeOut,
        transform: `scale(${labelScale})`,
        transformOrigin: "left center",
      }}
    >
      {/* Red pill badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 6,
            height: 40,
            backgroundColor: COLORS.red,
            borderRadius: 3,
          }}
        />
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            letterSpacing: 4,
            textShadow: "0 4px 30px rgba(0,0,0,0.9)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// Video clip with movement label
const WorkoutClip: React.FC<{
  src: string;
  trimStart: number;
  label: string;
  showLabel?: boolean;
}> = ({ src, trimStart, label, showLabel = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.1], {
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

      {/* Subtle top gradient for label readability */}
      {showLabel && (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 35%, transparent 55%)",
          }}
        />
      )}

      {/* DB Logo */}
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

      {/* Movement label */}
      {showLabel && <MovementLabel label={label} />}
    </AbsoluteFill>
  );
};

// Final clip has closing text overlay
const FinalClip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Text appears in second half of clip
  const textDelay = 40;

  const titleSpring = spring({
    frame: frame - textDelay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  const lineWidth = interpolate(
    spring({
      frame: frame - textDelay - 8,
      fps,
      config: { damping: 200 },
      durationInFrames: 18,
    }),
    [0, 1],
    [0, 240]
  );

  const subSpring = spring({
    frame: frame - textDelay - 14,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <WorkoutClip
        src="apr12-sled-push-female.mov"
        trimStart={0}
        label="Power"
        showLabel={true}
      />

      {/* Bottom gradient for closing text */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
        }}
      />

      {/* Closing title */}
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
            fontSize: 48,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 1,
            lineHeight: 1.1,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          Different{" "}
          <span style={{ color: COLORS.red }}>Breed</span>
        </div>

        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 14,
            marginBottom: 14,
          }}
        />

        <div
          style={{
            opacity: subOp,
            fontFamily: FONTS.body,
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            letterSpacing: 3,
            textTransform: "uppercase",
            textShadow: "0 2px 20px rgba(0,0,0,0.7)",
          }}
        >
          Agility. Speed. Power.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const HerWorkout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clipsDuration =
    CLIPS.reduce((sum, c) => sum + c.duration, 0) -
    (CLIPS.length - 1) * TRANSITION_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Music — Run The World (Girls) instrumental */}
      <Audio
        src={staticFile("music-run-the-world.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, fps * 0.5, HER_WORKOUT_DURATION - fps * 2, HER_WORKOUT_DURATION],
            [0, 0.7, 0.7, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      <TransitionSeries>
        {/* Clip 1: Ladder crawls — "Agility" */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[0].duration}>
          <WorkoutClip
            src={CLIPS[0].src}
            trimStart={CLIPS[0].trimStart}
            label={CLIPS[0].label}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Clip 2: Ladder footwork — "Speed" */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[1].duration}>
          <WorkoutClip
            src={CLIPS[1].src}
            trimStart={CLIPS[1].trimStart}
            label={CLIPS[1].label}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Clip 3: Sled push — "Power" + closing text */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[2].duration}>
          <FinalClip />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Fade to black */}
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
        <EndTagScene tagline="Member Spotlight" />
      </Sequence>
    </AbsoluteFill>
  );
};
