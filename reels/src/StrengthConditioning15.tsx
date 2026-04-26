import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { COLORS, FONTS, SAFE } from "./components/BrandStyles";
import { TextScramble } from "./cinematic-effects";

/*
 * ─── Strength & Conditioning — 15s Story Cutdown ─────────────────────
 *
 * Duration: 450 frames @ 30fps = 15.0s
 * Music: Hans Zimmer — Gurney Battle (Dune Part 2)
 *
 * Beat timeline:
 *   1. 0–60    (2.0s)  Slate — "STRENGTH & CONDITIONING"
 *   2. 60–135  (2.5s)  Hero clip
 *   3. 135–210 (2.5s)  Fast cut — explosive
 *   4. 210–285 (2.5s)  Fast cut — drive
 *   5. 285–360 (2.5s)  "DIFFERENT BREED" over motion
 *   6. 360–450 (3.0s)  End card
 */

export const SC15_DURATION = 450;

const TEXT_ZONE = { padX: 120 };

type ClipSpec = {
  src: string;
  trimStart?: number;
  brightness?: number;
  objectPosition?: string;
};

const CLIPS: Record<string, ClipSpec> = {
  hero:      { src: "sc-01-hero.mp4",       brightness: 0.82 },  // C4930
  explosive: { src: "sc-03-explosive.mp4",  brightness: 0.85 },  // Atoya barbell
  drive:     { src: "sc-05-drive.mp4",      brightness: 0.82 },  // C4928 class
  motion:    { src: "sc-09-motion.mp4",     brightness: 0.8 },   // C4931 coach
};

const VideoBeat: React.FC<{
  clip: ClipSpec;
  durationInFrames: number;
  vignetteOpacity?: number;
  children?: React.ReactNode;
}> = ({ clip, durationInFrames, vignetteOpacity = 0.55, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <div style={{ opacity, width: "100%", height: "100%", transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(clip.src)}
          startFrom={clip.trimStart ? Math.round(clip.trimStart * 30) : 0}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: clip.objectPosition ?? "center",
            filter: `brightness(${clip.brightness ?? 0.85}) contrast(1.2) saturate(0.88)`,
          }}
          muted
        />
      </div>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          opacity,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(20,5,0,0.35) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

const CenteredBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        transform: "translateY(-50%)",
        width: "100%",
        textAlign: "center",
        paddingLeft: TEXT_ZONE.padX,
        paddingRight: TEXT_ZONE.padX,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

const Beat1Slate: React.FC = () => {
  const frame = useCurrentFrame();
  const textOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [48, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(textOpacity, exitOpacity);

  return (
    <VideoBeat clip={CLIPS.hero} durationInFrames={60} vignetteOpacity={0.7}>
      <CenteredBlock>
        <div style={{ opacity, width: "100%", textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 20,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 18,
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            Different Breed
          </div>
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 112,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -2,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
            }}
          >
            Strength
            <br />
            &amp; Conditioning
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

const PureVisual: React.FC<{ clip: ClipSpec; duration: number }> = ({ clip, duration }) => (
  <VideoBeat clip={clip} durationInFrames={duration} vignetteOpacity={0.55} />
);

const ScrambleBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [62, 75], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.motion} durationInFrames={75} vignetteOpacity={0.65}>
      <CenteredBlock>
        <div style={{ opacity: exit, width: "100%", textAlign: "center" }}>
          <TextScramble
            text={"DIFFERENT\nBREED"}
            startFrame={4}
            framesPerChar={2}
            fontSize={160}
            fontWeight={700}
            color={COLORS.white}
            fontFamily={FONTS.headline}
            letterSpacing={-4}
            style={{
              textShadow: "0 8px 60px rgba(0,0,0,0.98)",
              textAlign: "center",
              width: "100%",
              lineHeight: 0.95,
            }}
          />
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  const tagSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [16, 0]);

  const urlOpacity = interpolate(frame, [34, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}>
          <Img src={staticFile("evolve-db-white-red.png")} style={{ width: 600 }} />
        </div>
        <div
          style={{
            width: 260,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 40,
            marginBottom: 32,
          }}
        />
        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 40,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Evolve Into Greatness
        </div>
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: COLORS.red,
            marginTop: 26,
            letterSpacing: 2,
          }}
        >
          differentbreedsportsacademy.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CornerWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 24], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", top: 260, right: 150, opacity, pointerEvents: "none" }}>
      <Img src={staticFile("db-logo-red-outline.png")} style={{ width: 54, height: 54 }} />
    </div>
  );
};

export const StrengthConditioning15: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Sequence from={0} durationInFrames={60}>
        <Beat1Slate />
      </Sequence>
      <Sequence from={60} durationInFrames={75}>
        <PureVisual clip={CLIPS.hero} duration={75} />
      </Sequence>
      <Sequence from={135} durationInFrames={75}>
        <PureVisual clip={CLIPS.explosive} duration={75} />
      </Sequence>
      <Sequence from={210} durationInFrames={75}>
        <PureVisual clip={CLIPS.drive} duration={75} />
      </Sequence>
      <Sequence from={285} durationInFrames={75}>
        <ScrambleBeat />
      </Sequence>
      <Sequence from={360} durationInFrames={90}>
        <EndCard />
      </Sequence>
      <Sequence from={0} durationInFrames={360}>
        <CornerWatermark />
      </Sequence>

      <Audio
        src={staticFile("music-gurney-battle.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, SC15_DURATION - 30, SC15_DURATION],
            [0, 0.9, 0.9, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
    </AbsoluteFill>
  );
};
