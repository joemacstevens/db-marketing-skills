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
} from "remotion";
import { COLORS, FONTS, SAFE } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";
import {
  TextScramble,
  GlitchEffect,
  Typewriter,
  KineticMarquee,
  MeshGradient,
} from "./cinematic-effects";

// ── Timing (30fps) ──────────────────────────────────────────
// Scene 1: TextScramble "DB SUMMER CAMP" over mesh gradient  (0-90, 3s)
// Scene 2: Glitch burst + "IS BACK." punch-in               (75-165, 3s)
// Scene 3: Action photo + Typewriter stats                   (150-300, 5s)
// Scene 4: CTA + KineticMarquee ticker                       (285-375, 3s)
// Scene 5: End tag                                           (360-465, 3.5s)
// Total: 465 frames ≈ 15.5s (perfect for IG Story)

export const CAMP_STORY_DURATION = 465;

// ── Scene 1: Title Scramble ──────────────────────────────────
const ScrambleTitle: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <MeshGradient>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        {/* DB logo watermark */}
        <div style={{ position: "absolute", top: SAFE.top, right: SAFE.sides, opacity: 0.85 }}>
          <Img src={staticFile("db-logo-red-outline.png")} style={{ width: 70, height: 70 }} />
        </div>

        <TextScramble
          text={"DB\nSUMMER\nCAMP"}
          startFrame={10}
          framesPerChar={4}
          fontSize={120}
          color={COLORS.white}
          fontFamily={FONTS.headline}
          fontWeight={700}
          letterSpacing={4}
        />

        {/* Subtle "2026" below */}
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 60,
            fontWeight: 400,
            color: COLORS.red,
            letterSpacing: 12,
            marginTop: 20,
            opacity: interpolate(frame, [50, 65], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          2026
        </div>
      </AbsoluteFill>
    </MeshGradient>
  );
};

// ── Scene 2: Glitch "IS BACK." ───────────────────────────────
const IsBackGlitch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const textSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 120, mass: 0.8 },
    durationInFrames: 15,
  });
  const textScale = interpolate(textSpring, [0, 1], [1.3, 1]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  return (
    <MeshGradient
      blobs={[
        { color: "rgba(196, 22, 28, 0.35)", size: 70, speed: 0.015, phase: 0, cx: 0.5, cy: 0.5 },
        { color: "rgba(196, 22, 28, 0.2)", size: 50, speed: 0.02, phase: 3, cx: 0.3, cy: 0.7 },
        { color: "rgba(255, 255, 255, 0.05)", size: 60, speed: 0.008, phase: 1.5, cx: 0.7, cy: 0.3 },
      ]}
    >
      <GlitchEffect startFrame={0} duration={15} intensity={0.9}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              transform: `scale(${textScale})`,
              opacity: textOpacity,
              fontFamily: FONTS.headline,
              fontSize: 140,
              fontWeight: 700,
              color: COLORS.white,
              textTransform: "uppercase",
              textAlign: "center",
              letterSpacing: -2,
              lineHeight: 1,
              textShadow: "0 0 60px rgba(196, 22, 28, 0.6)",
            }}
          >
            IS{"\n"}BACK.
          </div>
        </AbsoluteFill>
      </GlitchEffect>

      {/* Second smaller glitch burst mid-scene */}
      <Sequence from={40} durationInFrames={20}>
        <GlitchEffect startFrame={0} duration={8} intensity={0.4}>
          <AbsoluteFill />
        </GlitchEffect>
      </Sequence>
    </MeshGradient>
  );
};

// ── Scene 3: Action Photo + Typewriter Stats ─────────────────
const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ken Burns on photo
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.15], {
    extrapolateRight: "clamp",
  });

  // Photo fade in
  const photoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Action photo background */}
      <AbsoluteFill style={{ opacity: photoOpacity }}>
        <Img
          src={staticFile("camp-action.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            transform: `scale(${scale})`,
            filter: "brightness(1.2) contrast(1.1) saturate(1.05)",
          }}
        />
      </AbsoluteFill>

      {/* Dark gradient for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 70%, transparent 100%)",
        }}
      />

      {/* DB logo */}
      <div style={{ position: "absolute", top: SAFE.top, right: SAFE.sides, opacity: 0.85 }}>
        <Img src={staticFile("db-logo-red-outline.png")} style={{ width: 70, height: 70 }} />
      </div>

      {/* Stats typing out at bottom */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: SAFE.bottom + 140,
          paddingLeft: SAFE.sides + 20,
          paddingRight: SAFE.sides + 20,
        }}
      >
        {/* Red accent line */}
        <div
          style={{
            width: interpolate(
              spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 18 }),
              [0, 1],
              [0, 200]
            ),
            height: 4,
            backgroundColor: COLORS.red,
            marginBottom: 28,
          }}
        />

        <Typewriter
          text={"Ages 11-16\n9 Weeks\n5 Coaches\n5 Sports"}
          startFrame={15}
          framesPerChar={3}
          fontSize={52}
          fontWeight={700}
          letterSpacing={2}
          lineHeight={1.4}
          cursorColor={COLORS.red}
          style={{
            textShadow: "0 4px 30px rgba(0,0,0,0.9)",
          }}
        />

        {/* "Real Coaching" subline after typing completes */}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.gray,
            textTransform: "uppercase",
            letterSpacing: 4,
            marginTop: 20,
            opacity: interpolate(frame, [110, 125], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          Where Skills Turn to Confidence.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 4: CTA with Marquee ────────────────────────────────
const CTAWithMarquee: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const ctaY = interpolate(ctaSpring, [0, 1], [50, 0]);
  const ctaOpacity = interpolate(ctaSpring, [0, 1], [0, 1]);

  const urlSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const urlOpacity = interpolate(urlSpring, [0, 1], [0, 1]);

  return (
    <MeshGradient
      blobs={[
        { color: "rgba(196, 22, 28, 0.2)", size: 55, speed: 0.01, phase: 0, cx: 0.4, cy: 0.4 },
        { color: "rgba(212, 168, 67, 0.1)", size: 45, speed: 0.015, phase: 2, cx: 0.6, cy: 0.6 },
      ]}
    >
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        {/* Register Now CTA */}
        <div
          style={{
            transform: `translateY(${ctaY}px)`,
            opacity: ctaOpacity,
            fontFamily: FONTS.headline,
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.white,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 20,
          }}
        >
          Register Now
        </div>

        {/* Red button-style pill */}
        <div
          style={{
            transform: `translateY(${ctaY}px)`,
            opacity: ctaOpacity,
            backgroundColor: COLORS.red,
            padding: "14px 50px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 30,
              fontWeight: 600,
              color: COLORS.white,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Early Bird — Ends June 12
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONTS.body,
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          summer.differentbreedsportsacademy.com
        </div>
      </AbsoluteFill>

      {/* Marquee ticker at bottom */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          paddingBottom: SAFE.bottom + 40,
        }}
      >
        <KineticMarquee
          text="BOXING  CONDITIONING  BASKETBALL  YOGA  SPORTS PERFORMANCE"
          separator=" \u2022 "
          speed={1.5}
          startFrame={10}
          fontSize={28}
          fontWeight={500}
          color="rgba(255,255,255,0.5)"
          separatorColor={COLORS.red}
          letterSpacing={4}
        />
      </AbsoluteFill>
    </MeshGradient>
  );
};

// ── Main Composition ─────────────────────────────────────────
export const CampStoryApril14: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Scene 1: Title Scramble (0-90) */}
      <Sequence from={0} durationInFrames={90}>
        <ScrambleTitle />
      </Sequence>

      {/* Cross-fade: Scene 1 fades out */}
      <Sequence from={75} durationInFrames={15}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(frame - 75, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Sequence>

      {/* Scene 2: Glitch "IS BACK." (75-165) */}
      <Sequence from={75} durationInFrames={90}>
        <IsBackGlitch />
      </Sequence>

      {/* Cross-fade: Scene 2 fades out */}
      <Sequence from={150} durationInFrames={15}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(frame - 150, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Sequence>

      {/* Scene 3: Action Photo + Stats (150-300) */}
      <Sequence from={150} durationInFrames={150}>
        <StatsScene />
      </Sequence>

      {/* Cross-fade: Scene 3 fades out */}
      <Sequence from={285} durationInFrames={15}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(frame - 285, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Sequence>

      {/* Scene 4: CTA + Marquee (285-375) */}
      <Sequence from={285} durationInFrames={90}>
        <CTAWithMarquee />
      </Sequence>

      {/* Fade to black before end tag */}
      <Sequence from={360} durationInFrames={15}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(frame - 360, [0, 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </Sequence>

      {/* Scene 5: End Tag (360-465) */}
      <Sequence from={360} durationInFrames={105}>
        <EndTagScene tagline="Summer Camp 2026" />
      </Sequence>
    </AbsoluteFill>
  );
};
