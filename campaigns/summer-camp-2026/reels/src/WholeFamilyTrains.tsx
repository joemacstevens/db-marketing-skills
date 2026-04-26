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
import { slide } from "@remotion/transitions/slide";
import { Audio } from "@remotion/media";
import { COLORS, FONTS, FPS } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";

const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

// Clip layout — kid sprint is the hook, adults grinding in middle, kid+ring at end
const CLIPS = [
  { src: "apr11-kid-sprint.mov", duration: 100, trimStart: 0 }, // kid running toward camera — THE HOOK
  { src: "apr11-treadmill-row.mov", duration: 85, trimStart: 1 * FPS }, // adults on treadmills
  { src: "apr11-alpine-runner.mov", duration: 75, trimStart: 3 * FPS }, // solo male sprinting
  { src: "apr11-kid-sprint.mov", duration: 85, trimStart: 8 * FPS }, // kid by the ring chatting — the payoff
] as const;

const TRANSITION_FRAMES = 10;
const END_TAG_DURATION = 120;

export const WHOLE_FAMILY_DURATION =
  CLIPS.reduce((sum, c) => sum + c.duration, 0) -
  (CLIPS.length - 1) * TRANSITION_FRAMES +
  END_TAG_DURATION;

// Animated text block
const AnimText: React.FC<{
  children: string;
  fontSize?: number;
  delay?: number;
  font?: string;
  color?: string;
  weight?: number;
  spacing?: number;
}> = ({
  children,
  fontSize = 58,
  delay = 0,
  font = FONTS.headline,
  color = COLORS.white,
  weight = 700,
  spacing = -1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`,
        opacity: interpolate(s, [0, 1], [0, 1]),
        fontFamily: font,
        fontSize,
        fontWeight: weight,
        color,
        textTransform: "uppercase",
        textAlign: "center",
        letterSpacing: spacing,
        lineHeight: 1.1,
        textShadow: "0 4px 30px rgba(0,0,0,0.8)",
      }}
    >
      {children}
    </div>
  );
};

// Video clip wrapper
const FamilyClip: React.FC<{
  src: string;
  trimStart: number;
}> = ({ src, trimStart }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
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
    </AbsoluteFill>
  );
};

// Scene 1: Kid sprint with hook text
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [75, 95], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <FamilyClip src="apr11-kid-sprint.mov" trimStart={0} />

      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Gradient */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)",
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
          <AnimText fontSize={54}>
            {"The Whole Family\nTrains Here"}
          </AnimText>

          <div
            style={{
              height: 4,
              backgroundColor: COLORS.red,
              marginTop: 16,
              marginBottom: 16,
              width: interpolate(
                spring({
                  frame: frame - 8,
                  fps: FPS,
                  config: { damping: 200 },
                  durationInFrames: 18,
                }),
                [0, 1],
                [0, 180]
              ),
            }}
          />

          <AnimText
            fontSize={26}
            delay={10}
            font={FONTS.body}
            color="rgba(255,255,255,0.85)"
            weight={500}
            spacing={2}
          >
            {"Different Breed Elite Fitness"}
          </AnimText>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 4: Kid by the ring with closing text
const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Text appears after a brief pause
  const textDelay = 15;

  const s = spring({
    frame: frame - textDelay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  return (
    <AbsoluteFill>
      <FamilyClip src="apr11-kid-sprint.mov" trimStart={8 * FPS} />

      {/* Gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
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
            transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
            opacity: interpolate(s, [0, 1], [0, 1]),
            fontFamily: FONTS.headline,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: -0.5,
            lineHeight: 1.15,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          From 5 to 50{"\n"}
          <span style={{ color: COLORS.red }}>Everybody</span> Puts{"\n"}
          In Work
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const WholeFamilyTrains: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clipsDuration =
    CLIPS.reduce((sum, c) => sum + c.duration, 0) -
    (CLIPS.length - 1) * TRANSITION_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Music — The Show Goes On instrumental */}
      <Audio
        src={staticFile("music-show-goes-on.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, fps * 0.5, WHOLE_FAMILY_DURATION - fps * 2, WHOLE_FAMILY_DURATION],
            [0, 0.65, 0.65, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      <TransitionSeries>
        {/* Scene 1: Kid sprint hook */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[0].duration}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 2: Treadmill row — adults grinding */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[1].duration}>
          <FamilyClip
            src={CLIPS[1].src}
            trimStart={CLIPS[1].trimStart}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 3: Solo alpine runner */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[2].duration}>
          <FamilyClip
            src={CLIPS[2].src}
            trimStart={CLIPS[2].trimStart}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 4: Kid by the ring — payoff */}
        <TransitionSeries.Sequence durationInFrames={CLIPS[3].duration}>
          <ClosingScene />
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
        <EndTagScene tagline="All Ages Welcome" />
      </Sequence>
    </AbsoluteFill>
  );
};
