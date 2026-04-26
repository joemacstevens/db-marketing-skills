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
import { COLORS, FONTS } from "./components/BrandStyles";
import { TextScramble, Typewriter, GlitchEffect } from "./cinematic-effects";

/*
 * ─── The Coliseum · Phase 01 Teaser (v2) ──────────────────────────────
 *
 * Duration: 660 frames @ 30fps = 22.0s
 *
 * Beat timeline:
 *   A. 0–90    (3.0s)  FOOT hits sand — "A NEW TRAINING GROUND IS RISING"
 *   B. 90–240  (5.0s)  IRON grip — "Raw iron. Real work. No machines."
 *   C. 240–480 (8.0s)  ARENA push-in — "THE COLISEUM" + "A Different Breed Experience"
 *   D. 480–660 (6.0s)  BACKLIT walk — "TRAIN LIKE A GLADIATOR" → "WELCOME TO THE COLISEUM"
 *
 * Safe zone — IG Reel feed (per nase.digital guide):
 *   - Top 220px blocked by username bar
 *   - Bottom 450px blocked by caption + UI controls
 *   - Right 135px blocked by action column (like/comment/share)
 *   - Usable text zone: y=260-1400, x=100-880 (center-biased)
 *   - All text here sits in vertical center band, x centered.
 *
 * Music: custom ElevenLabs-generated cinematic track (music-coliseum-teaser.mp3)
 */

export const COLISEUM_PHASE_01_DURATION = 660;

// IG Reel feed-safe text zone. Keep all overlays inside this band.
const TEXT_ZONE = {
  top: 260,
  bottom: 1400, // leaves 520px at the bottom for IG UI
  padX: 120,
};

// ─── Reusable video beat with cinematic overlays ────────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  vignetteOpacity?: number;
  brightness?: number;
  children?: React.ReactNode;
}> = ({
  src,
  durationInFrames,
  vignetteOpacity = 0.55,
  brightness = 0.9,
  children,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <div style={{ opacity }}>
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness}) contrast(1.22) saturate(0.85)`,
          }}
          muted
        />
      </div>

      {/* Heavy vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          opacity,
          pointerEvents: "none",
        }}
      />

      {/* Warm color wash to unify clips */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(20,8,0,0.12) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 70%, rgba(15,5,0,0.3) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* Center-band gradient — darkens the text area slightly for readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 10%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.25) 70%, transparent 90%)",
          opacity: opacity * 0.7,
          pointerEvents: "none",
        }}
      />

      {children}
    </AbsoluteFill>
  );
};

// ─── Centered text block helper ─────────────────────────────────
// Uses absolute-centered wrapper + width:100% inner so text-align actually
// centers regardless of how wide the typed content becomes. Previous version
// used pure flexbox which let the container shift as Typewriter chars typed.
const CenteredBlock: React.FC<{ children: React.ReactNode; offsetY?: number }> = ({
  children,
  offsetY = 0,
}) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        transform: `translateY(calc(-50% + ${offsetY}px))`,
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

// ─── Red accent bar ─────────────────────────────────────────────
const RedAccent: React.FC<{ delay?: number; width?: number; thickness?: number }> = ({
  delay = 0,
  width = 140,
  thickness = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const w = interpolate(s, [0, 1], [0, width]);
  return (
    <div
      style={{
        width: w,
        height: thickness,
        backgroundColor: COLORS.red,
        marginBottom: 18,
      }}
    />
  );
};

// ─── Beat A: "A NEW TRAINING GROUND IS RISING" ───────────────────
const BeatA: React.FC = () => {
  const frame = useCurrentFrame();
  const textOpacity = interpolate(frame, [12, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(textOpacity, exitOpacity);

  return (
    <VideoBeat src="coliseum-A-foot.mp4" durationInFrames={90} vignetteOpacity={0.65}>
      <CenteredBlock>
        <div style={{ opacity, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <RedAccent delay={10} width={100} thickness={3} />
          </div>
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 84,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1,
              lineHeight: 1.05,
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
              textTransform: "uppercase",
              textAlign: "center",
              width: "100%",
            }}
          >
            A New
            <br />
            Training Ground
            <br />
            Is Rising
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat B: "Raw iron. Real work. No machines." ────────────────
const BeatB: React.FC = () => {
  const frame = useCurrentFrame();
  const exitOpacity = interpolate(frame, [135, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat src="coliseum-B-iron.mp4" durationInFrames={150} vignetteOpacity={0.6}>
      <CenteredBlock>
        <div
          style={{
            opacity: exitOpacity,
            width: "100%",
            textAlign: "center",
          }}
        >
          <Typewriter
            text={"RAW IRON.\nREAL WORK.\nNO MACHINES."}
            startFrame={8}
            framesPerChar={2}
            fontSize={88}
            fontWeight={700}
            color={COLORS.white}
            fontFamily={FONTS.headline}
            letterSpacing={-1}
            lineHeight={1.05}
            cursorColor={COLORS.red}
            textAlign="center"
            showCursor={false}
            style={{
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
              textTransform: "uppercase",
              width: "100%",
            }}
          />
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat C: "THE COLISEUM" reveal ───────────────────────────────
const BeatC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glitchFrame = 42;

  const subSpring = spring({
    frame: frame - 120,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);
  const subY = interpolate(subSpring, [0, 1], [20, 0]);
  const exitOpacity = interpolate(frame, [225, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat
      src="coliseum-C-arena.mp4"
      durationInFrames={240}
      vignetteOpacity={0.5}
      brightness={0.85}
    >
      <CenteredBlock>
        <div style={{ opacity: exitOpacity, width: "100%", textAlign: "center" }}>
          <GlitchEffect startFrame={glitchFrame} duration={10} intensity={0.5}>
            <TextScramble
              text={"THE\nCOLISEUM"}
              startFrame={30}
              framesPerChar={2}
              fontSize={170}
              fontWeight={700}
              color={COLORS.white}
              fontFamily={FONTS.headline}
              letterSpacing={-4}
              textAlign="center"
              style={{
                textShadow: "0 8px 60px rgba(0,0,0,0.98)",
                width: "100%",
              }}
            />
          </GlitchEffect>

          <div
            style={{
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
              marginTop: 28,
              width: "100%",
              fontFamily: FONTS.body,
              fontSize: 26,
              fontWeight: 500,
              fontStyle: "italic",
              color: COLORS.red,
              letterSpacing: 6,
              textTransform: "uppercase",
              textAlign: "center",
              textShadow: "0 2px 18px rgba(0,0,0,0.95)",
            }}
          >
            A Different Breed Experience
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat D: Tagline close — two-stage (tagline → welcome + coming soon)
const BeatD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1 (0–85): "TRAIN LIKE A GLADIATOR"
  const taglineSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const taglineOpacityIn = interpolate(taglineSpring, [0, 1], [0, 1]);
  const taglineY = interpolate(taglineSpring, [0, 1], [24, 0]);
  const taglineOpacityOut = interpolate(frame, [78, 92], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineOpacity = Math.min(taglineOpacityIn, taglineOpacityOut);

  // Phase 2 (95–180): "WELCOME TO THE COLISEUM" + DB lockup + "COMING SOON"
  const welcomeSpring = spring({
    frame: frame - 95,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const welcomeOpacity = interpolate(welcomeSpring, [0, 1], [0, 1]);
  const welcomeY = interpolate(welcomeSpring, [0, 1], [24, 0]);

  const logoOpacity = interpolate(frame, [115, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const comingOpacity = interpolate(frame, [140, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat
      src="coliseum-D-walk.mp4"
      durationInFrames={180}
      vignetteOpacity={0.5}
      brightness={0.95}
    >
      <CenteredBlock>
        {/* Both phases stacked as absolute-positioned full-width layers
            so each is independently centered. */}

        {/* Phase 1 — TRAIN LIKE A GLADIATOR */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: `translateY(calc(-50% + ${taglineY}px))`,
            opacity: taglineOpacity,
            width: "100%",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 100,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1,
              lineHeight: 0.98,
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
              width: "100%",
              textAlign: "center",
            }}
          >
            TRAIN LIKE
            <br />
            A GLADIATOR.
          </div>
        </div>

        {/* Phase 2 — WELCOME + DB logo + COMING SOON (stacked, all centered) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: `translateY(calc(-50% + ${welcomeY}px))`,
            opacity: welcomeOpacity,
            width: "100%",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 100,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -2,
              lineHeight: 0.98,
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
              width: "100%",
              textAlign: "center",
            }}
          >
            WELCOME TO
            <br />
            THE COLISEUM.
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              justifyContent: "center",
              opacity: logoOpacity,
            }}
          >
            <Img
              src={staticFile("evolve-db-white-red.png")}
              style={{ height: 84, objectFit: "contain" }}
            />
          </div>

          <div
            style={{
              marginTop: 24,
              opacity: comingOpacity,
              fontFamily: FONTS.body,
              fontSize: 30,
              fontWeight: 600,
              color: COLORS.red,
              letterSpacing: 14,
              textTransform: "uppercase",
              textShadow: "0 2px 16px rgba(0,0,0,0.95)",
              width: "100%",
              textAlign: "center",
            }}
          >
            Coming Soon
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Persistent top-right watermark (positioned inside safe zone) ────
const CornerWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [15, 40], [0, 0.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 260,
        right: 150, // well inside the right action-column safe boundary
        opacity,
        pointerEvents: "none",
      }}
    >
      <Img
        src={staticFile("db-logo-red-outline.png")}
        style={{ width: 54, height: 54 }}
      />
    </div>
  );
};

// ─── Main Composition ────────────────────────────────────────────
export const ColiseumPhase01: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Sequence from={0} durationInFrames={90}>
        <BeatA />
      </Sequence>

      <Sequence from={90} durationInFrames={150}>
        <BeatB />
      </Sequence>

      <Sequence from={240} durationInFrames={240}>
        <BeatC />
      </Sequence>

      <Sequence from={480} durationInFrames={180}>
        <BeatD />
      </Sequence>

      <Sequence from={0} durationInFrames={COLISEUM_PHASE_01_DURATION}>
        <CornerWatermark />
      </Sequence>

      {/* Custom cinematic music bed (ElevenLabs Music) */}
      <Audio
        src={staticFile("music-coliseum-teaser.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, COLISEUM_PHASE_01_DURATION - 40, COLISEUM_PHASE_01_DURATION],
            [0, 0.9, 0.9, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
    </AbsoluteFill>
  );
};
