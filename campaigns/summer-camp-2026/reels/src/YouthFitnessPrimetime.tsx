import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
  spring,
  Img,
  staticFile,
  OffthreadVideo,
} from "remotion";
import { Audio } from "@remotion/media";
import { COLORS, FONTS } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";

// Video is ~24s at 30fps = 725 frames
// Structure:
//   0-90    (0-3s)    Hook — "Youth Fitness" title over video
//   90-180  (3-6s)    Clean video, let the action breathe
//   180-330 (6-11s)   Mid callout — "Training with Primetime"
//   330-600 (11-20s)  Clean video, training footage
//   600-725 (20-24s)  End tag — Evolve Into Greatness

const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

const VIDEO_DURATION = 725; // frames of source video
const END_TAG_DURATION = 120; // 4 seconds
const TOTAL_DURATION = VIDEO_DURATION + END_TAG_DURATION; // 845 frames = ~28s

// Animated text block component
const AnimatedText: React.FC<{
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

  const textSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        transform: `translateY(${interpolate(textSpring, [0, 1], [50, 0])}px)`,
        opacity: interpolate(textSpring, [0, 1], [0, 1]),
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

// Red accent divider
const RedDivider: React.FC<{ delay?: number }> = ({ delay = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const divSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  return (
    <div
      style={{
        width: interpolate(divSpring, [0, 1], [0, 120]),
        height: 4,
        backgroundColor: COLORS.red,
        marginTop: 16,
        marginBottom: 16,
      }}
    />
  );
};

export const YouthFitnessPrimetime: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Background video — plays for the video portion */}
      {/* VO runs frames 10–532, so fade gym audio in after VO ends */}
      <Sequence durationInFrames={VIDEO_DURATION}>
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile("youth-fitness-primetime.mp4")}
            volume={(f) =>
              interpolate(
                f,
                [0, 500, 545, VIDEO_DURATION - 30, VIDEO_DURATION],
                [0, 0, 0.85, 0.85, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Music bed — plays throughout, ducks under VO */}
      <Audio
        src={staticFile("music-bed.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, fps * 0.5, durationInFrames - fps * 2, durationInFrames],
            [0, 0.2, 0.2, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Voiceover — starts at frame 10 (~0.3s) to let hook visual land first */}
      <Sequence from={10}>
        <Audio src={staticFile("vo-youth-fitness.mp3")} volume={0.95} />
      </Sequence>

      {/* === SCENE 1: Hook (0-3s) === */}
      <Sequence durationInFrames={90}>
        {/* Dark gradient for text */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)",
          }}
        />

        {/* DB Logo */}
        <div
          style={{
            position: "absolute",
            top: SAFE_TOP,
            right: SAFE_SIDES,
            opacity: 0.9,
          }}
        >
          <Img
            src={staticFile("db-logo-red-outline.png")}
            style={{ width: 80, height: 80 }}
          />
        </div>

        {/* Hook text */}
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: SAFE_BOTTOM + 110,
            paddingLeft: SAFE_SIDES,
            paddingRight: SAFE_SIDES,
          }}
        >
          <AnimatedText fontSize={62}>
            {"Youth Fitness"}
          </AnimatedText>
          <RedDivider />
          <AnimatedText
            fontSize={30}
            delay={8}
            font={FONTS.body}
            color="rgba(255,255,255,0.9)"
            weight={500}
            spacing={1}
          >
            {"Personal Training at Different Breed"}
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* === SCENE 2: Clean video (3-6s) — just logo, let footage breathe === */}
      <Sequence from={90} durationInFrames={90}>
        <div
          style={{
            position: "absolute",
            top: SAFE_TOP,
            right: SAFE_SIDES,
            opacity: 0.9,
          }}
        >
          <Img
            src={staticFile("db-logo-red-outline.png")}
            style={{ width: 80, height: 80 }}
          />
        </div>
      </Sequence>

      {/* === SCENE 3: Chris Colbert callout (6-11s) === */}
      <Sequence from={180} durationInFrames={150}>
        {/* Gradient overlay */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: SAFE_TOP,
            right: SAFE_SIDES,
            opacity: 0.9,
          }}
        >
          <Img
            src={staticFile("db-logo-red-outline.png")}
            style={{ width: 80, height: 80 }}
          />
        </div>

        {/* Primetime callout — top position */}
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            paddingTop: SAFE_TOP + 100,
            paddingLeft: SAFE_SIDES,
            paddingRight: SAFE_SIDES + 100,
          }}
        >
          <AnimatedText fontSize={44}>
            {"Training With\nPrimetime"}
          </AnimatedText>
          <RedDivider />
          <AnimatedText
            fontSize={26}
            delay={8}
            font={FONTS.body}
            color="rgba(255,255,255,0.85)"
            weight={500}
            spacing={0.5}
          >
            {"Former Interim World Champion\nChris Colbert"}
          </AnimatedText>
        </AbsoluteFill>
      </Sequence>

      {/* === SCENE 4: Clean video (11-20s) — logo only === */}
      <Sequence from={330} durationInFrames={270}>
        <div
          style={{
            position: "absolute",
            top: SAFE_TOP,
            right: SAFE_SIDES,
            opacity: 0.9,
          }}
        >
          <Img
            src={staticFile("db-logo-red-outline.png")}
            style={{ width: 80, height: 80 }}
          />
        </div>
      </Sequence>

      {/* === SCENE 5: Video fades to black + End Tag (20-28s) === */}
      {/* Black fade over last 1s of video */}
      <Sequence from={VIDEO_DURATION - 30} durationInFrames={30}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(
              frame - (VIDEO_DURATION - 30),
              [0, 30],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        />
      </Sequence>

      {/* End tag */}
      <Sequence from={VIDEO_DURATION} durationInFrames={END_TAG_DURATION}>
        <EndTagScene />
      </Sequence>
    </AbsoluteFill>
  );
};
