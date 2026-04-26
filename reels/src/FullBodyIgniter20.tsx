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
import { Typewriter, GlitchEffect } from "./cinematic-effects";

/*
 * ─── Full Body Igniter — 20s Class Promo ───────────────────────────────
 *
 * Duration: 600 frames @ 30fps = 20.0s
 * Source: April 21, 2026 — "Full Body Ignighter" drop from Don Sommerville
 * Coach: Carlos Acevedo (@cphysiquetraining)
 * CTA: Tuesdays · 6 PM · Book via link in bio
 *
 * Per Joey: no black-screen slate at the top (viewers scroll past). Title
 * "FULL BODY / IGNITER" overlays the first video clip for the first ~1.5s,
 * then fades while the clip continues.
 *
 * Beat timeline:
 *   1.   0–150  (5.0s)  fbi-1-sled — title overlay "FULL BODY IGNITER" f0–f45
 *                        + caption "45 MINUTES" after title clears
 *   2. 150–255  (3.5s)  fbi-3-circuit    — "EVERY MUSCLE"
 *   3. 255–360  (3.5s)  fbi-2-sledfront  — "EVERY ROUND"
 *   4. 360–465  (3.5s)  fbi-4-ladder     — "NO MACHINES. JUST WORK."
 *   5. 465–600  (4.5s)  End card — Coach Carlos + Tuesdays 6 PM + CTA
 *
 * Effects per clip: 8-frame GlitchEffect entrance + 2-frame ImpactFlash at cut.
 */

export const FBI_DURATION = 600;

// ─── Video beat with cinematic overlays ────────────────────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  brightness?: number;
  children?: React.ReactNode;
}> = ({
  src,
  durationInFrames,
  fadeInFrames = 4,
  fadeOutFrames = 6,
  brightness = 0.9,
  children,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.07], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <div
        style={{
          opacity,
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness}) contrast(1.2) saturate(0.95)`,
          }}
          muted
        />
      </div>
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Bottom gradient for caption legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// ─── Beat caption — typewriter at bottom of safe zone ──────────────
const BeatCaption: React.FC<{
  text: string;
  startFrame?: number;
  exitStart?: number;
  exitEnd?: number;
}> = ({ text, startFrame = 12, exitStart = 90, exitEnd = 105 }) => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [exitStart, exitEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom: 520,
        opacity: exit,
        pointerEvents: "none",
        textAlign: "center",
      }}
    >
      <Typewriter
        text={text}
        startFrame={startFrame}
        framesPerChar={2}
        fontSize={74}
        fontWeight={700}
        color={COLORS.white}
        fontFamily={FONTS.headline}
        letterSpacing={-1}
        lineHeight={1.05}
        showCursor={false}
        textAlign="center"
        style={{
          textTransform: "uppercase",
          textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          width: "100%",
        }}
      />
    </div>
  );
};

// ─── Title overlay — "FULL BODY / IGNITER" rides over the first clip ──
// Replaces the old MeshGradient slate. Title springs in, holds, fades out
// around f=40 while the class footage keeps playing underneath.
const TitleOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 180, mass: 0.7 },
    durationInFrames: 16,
  });
  const entryOpacity = interpolate(textSpring, [0, 1], [0, 1]);
  const scaleIn = interpolate(textSpring, [0, 1], [1.18, 1]);
  const exit = interpolate(frame, [30, 42], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(entryOpacity, exit);

  const barWidth = interpolate(
    spring({
      frame: frame - 12,
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 220]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          textAlign: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div
          style={{
            transform: `scale(${scaleIn})`,
            fontFamily: FONTS.headline,
            fontSize: 138,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -3,
            lineHeight: 0.92,
            textTransform: "uppercase",
            textShadow:
              "0 8px 60px rgba(0,0,0,0.98), 0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          Full Body
          <br />
          <span style={{ color: COLORS.red }}>Igniter</span>
        </div>
        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: COLORS.red,
            margin: "32px auto 0",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── Impact flash — 2-frame white punch ────────────────────────────
const ImpactFlash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: 0.95 }} />
);

// ─── Two-stage End card ─────────────────────────────────────────────
//  Phase 1 (f 0–85):  Class tag — "FULL BODY IGNITER / Every Tuesday · 6 PM
//                     / With Coach Carlos + @cphysiquetraining"
//  Phase 2 (f 85–135): BIG DB brand lockup (Evolve Into Greatness / Become
//                     A Different Breed) + Book · Link In Bio CTA
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase 1: class tag ──
  const p1Title = spring({
    frame: frame - 2,
    fps,
    config: { damping: 180, mass: 0.7 },
    durationInFrames: 16,
  });
  const p1TitleOpacity = interpolate(p1Title, [0, 1], [0, 1]);
  const p1TitleY = interpolate(p1Title, [0, 1], [16, 0]);

  const p1Time = spring({
    frame: frame - 16,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const p1TimeOpacity = interpolate(p1Time, [0, 1], [0, 1]);
  const p1TimeY = interpolate(p1Time, [0, 1], [14, 0]);

  const p1Coach = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const p1CoachOpacity = interpolate(p1Coach, [0, 1], [0, 1]);
  const p1CoachY = interpolate(p1Coach, [0, 1], [14, 0]);

  const p1BarWidth = interpolate(
    spring({
      frame: frame - 10,
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 220]
  );

  const p1Exit = interpolate(frame, [70, 85], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Phase 2: BIG brand lockup ──
  const p2Logo = spring({
    frame: frame - 88,
    fps,
    config: { damping: 180, mass: 0.8 },
    durationInFrames: 20,
  });
  const p2LogoOpacity = interpolate(p2Logo, [0, 1], [0, 1]);
  const p2LogoScale = interpolate(p2Logo, [0, 1], [0.84, 1]);

  const p2CtaOpacity = interpolate(frame, [112, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Phase 1 — class tag */}
      <AbsoluteFill
        style={{
          opacity: p1Exit,
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <div
            style={{
              opacity: p1TitleOpacity,
              transform: `translateY(${p1TitleY}px)`,
              fontFamily: FONTS.headline,
              fontSize: 108,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -2,
              lineHeight: 0.92,
              textTransform: "uppercase",
              textShadow: "0 4px 24px rgba(0,0,0,0.9)",
            }}
          >
            Full Body
            <br />
            <span style={{ color: COLORS.red }}>Igniter</span>
          </div>

          <div
            style={{
              width: p1BarWidth,
              height: 4,
              backgroundColor: COLORS.red,
              margin: "30px auto 28px",
            }}
          />

          <div
            style={{
              opacity: p1TimeOpacity,
              transform: `translateY(${p1TimeY}px)`,
              fontFamily: FONTS.headline,
              fontSize: 56,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Every Tuesday <span style={{ color: COLORS.red }}>·</span> 6 PM
          </div>

          <div
            style={{
              opacity: p1CoachOpacity,
              transform: `translateY(${p1CoachY}px)`,
              fontFamily: FONTS.headline,
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1,
              textTransform: "uppercase",
              textAlign: "center",
              marginTop: 28,
            }}
          >
            With Coach <span style={{ color: COLORS.red }}>Carlos</span>
          </div>
          <div
            style={{
              opacity: p1CoachOpacity,
              transform: `translateY(${p1CoachY}px)`,
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 500,
              color: COLORS.gray,
              letterSpacing: 4,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            @cphysiquetraining
          </div>
        </div>
      </AbsoluteFill>

      {/* Phase 2 — BIG brand lockup */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <div
            style={{
              opacity: p2LogoOpacity,
              transform: `scale(${p2LogoScale})`,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Img
              src={staticFile("evolve-db-white-red.png")}
              style={{
                width: 860,
                filter: "drop-shadow(0 10px 60px rgba(0,0,0,0.85))",
              }}
            />
          </div>

          <div
            style={{
              opacity: p2CtaOpacity,
              fontFamily: FONTS.body,
              fontSize: 26,
              fontWeight: 600,
              color: COLORS.red,
              letterSpacing: 12,
              textTransform: "uppercase",
              textAlign: "center",
              marginTop: 48,
            }}
          >
            Book · Link In Bio
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Corner watermark ──────────────────────────────────────────────
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
        right: 150,
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

// ─── Clip beat wrapping VideoBeat with glitch + caption ────────────
const ClipBeat: React.FC<{
  src: string;
  caption: string;
  brightness?: number;
  durationInFrames?: number;
  captionStart?: number;
  captionExitStart?: number;
  captionExitEnd?: number;
}> = ({
  src,
  caption,
  brightness = 0.9,
  durationInFrames = 105,
  captionStart = 12,
  captionExitStart = 90,
  captionExitEnd = 105,
}) => (
  <GlitchEffect startFrame={0} duration={8} intensity={0.55}>
    <VideoBeat
      src={src}
      durationInFrames={durationInFrames}
      brightness={brightness}
    >
      <BeatCaption
        text={caption}
        startFrame={captionStart}
        exitStart={captionExitStart}
        exitEnd={captionExitEnd}
      />
    </VideoBeat>
  </GlitchEffect>
);

// ─── Main Composition ──────────────────────────────────────────────
export const FullBodyIgniter20: React.FC = () => {
  const cuts = [150, 255, 360];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Clip 1 — sled solo (extended to 150f to host title overlay) */}
      <Sequence from={0} durationInFrames={150}>
        <ClipBeat
          src="fbi-1-sled.mp4"
          caption="45 Minutes"
          brightness={0.88}
          durationInFrames={150}
          captionStart={55}
          captionExitStart={130}
          captionExitEnd={145}
        />
      </Sequence>

      {/* Title overlay rides over clip 1 for first 45 frames */}
      <Sequence from={0} durationInFrames={45}>
        <TitleOverlay />
      </Sequence>

      {/* Clip 2 — class turf */}
      <Sequence from={150} durationInFrames={105}>
        <ClipBeat
          src="fbi-3-circuit.mp4"
          caption="Every Muscle"
          brightness={0.9}
        />
      </Sequence>

      {/* Clip 3 — sled front hero */}
      <Sequence from={255} durationInFrames={105}>
        <ClipBeat
          src="fbi-2-sledfront.mp4"
          caption="Every Round"
          brightness={0.92}
        />
      </Sequence>

      {/* Clip 4 — ladder close */}
      <Sequence from={360} durationInFrames={105}>
        <ClipBeat
          src="fbi-4-ladder.mp4"
          caption={"No Machines.\nJust Work."}
          brightness={0.9}
        />
      </Sequence>

      {/* Impact flashes on each cut */}
      {cuts.map((f) => (
        <Sequence key={f} from={f} durationInFrames={2}>
          <ImpactFlash />
        </Sequence>
      ))}

      {/* End card 465–600 */}
      <Sequence from={465} durationInFrames={135}>
        <EndCard />
      </Sequence>

      {/* Persistent watermark */}
      <Sequence from={0} durationInFrames={FBI_DURATION}>
        <CornerWatermark />
      </Sequence>

      {/* Music bed — new ElevenLabs cinematic hype (generated at build time) */}
      <Audio
        src={staticFile("music-fbi.mp3")}
        volume={(f) => {
          if (f < 10) return interpolate(f, [0, 10], [0, 0.85]);
          if (f > FBI_DURATION - 25)
            return interpolate(
              f,
              [FBI_DURATION - 25, FBI_DURATION],
              [0.85, 0]
            );
          return 0.85;
        }}
      />
    </AbsoluteFill>
  );
};
