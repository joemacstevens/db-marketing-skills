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
import { GlitchEffect } from "./cinematic-effects";

/*
 * ─── Just Work — 15s Compilation Reel (TEMPLATE-LOCKED STYLE) ──────────
 *
 * This composition is the TEMPLATE for all "Just Work" compilation reels.
 * The Slate + EndCard typography and composition layout are LOCKED per
 * Joey's sign-off — reuse these exact components for future compilations.
 * Only the CLIPS array + music choice should change reel-to-reel.
 *
 * Duration: 450 frames @ 30fps = 15.0s
 * Music: The White Stripes — Seven Nation Army (Instrumental)
 * Source: top-scored q8+ clips, selected via compilation_analysis
 *   (peak_impact_moment, hype_factor, beat_drop_suitability, motion_direction)
 *
 * Beat timeline:
 *   1.   0–45   (1.5s)  Slate  — "JUST WORK." [LOCKED]
 *   2.  45–120  (2.5s)  jw-1   (medicine ball throw at camera)
 *   3. 120–195  (2.5s)  jw-2   (rowing cable pull — back engaged)
 *   4. 195–270  (2.5s)  jw-3   (sled drive toward camera)
 *   5. 270–345  (2.5s)  jw-4   (pilates leg press w/ ball)
 *   6. 345–420  (2.5s)  jw-5   (pilates rings group)
 *   7. 420–450  (1.0s)  End card — logo + "Just Work." [LOCKED]
 *
 * Transitions: 2-frame impact flash + 8-frame GlitchEffect burst on each
 * incoming clip to sell the beat hit.
 *
 * IG Reel text-safe band: y ∈ [260, 1500]. All text lives there.
 */

export const JUST_WORK_DURATION = 450;

// ─── Reusable video beat with vignette + fade + grade ─────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  brightness?: number;
}> = ({
  src,
  durationInFrames,
  fadeInFrames = 4,
  fadeOutFrames = 6,
  brightness = 0.88,
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
  // Subtle push-in
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
            filter: `brightness(${brightness}) contrast(1.18) saturate(0.92)`,
          }}
          muted
        />
      </div>
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.55) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Warm/cool grade */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(20,5,0,0.3) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Slate: "JUST WORK." ──────────────────────────────────────────
const Slate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 180, mass: 0.7 },
    durationInFrames: 18,
  });
  const opacity = interpolate(textSpring, [0, 1], [0, 1]);
  const scaleIn = interpolate(textSpring, [0, 1], [1.25, 1]);
  const exit = interpolate(frame, [34, 45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent bar
  const barWidth = interpolate(
    spring({
      frame: frame - 12,
      fps,
      config: { damping: 200 },
      durationInFrames: 16,
    }),
    [0, 1],
    [0, 180]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity: exit,
            textAlign: "center",
            paddingLeft: 120,
            paddingRight: 120,
          }}
        >
          <div
            style={{
              opacity,
              transform: `scale(${scaleIn})`,
              fontFamily: FONTS.headline,
              fontSize: 180,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -4,
              lineHeight: 0.9,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
            }}
          >
            Just
            <br />
            <span style={{ color: COLORS.red }}>Work.</span>
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
    </AbsoluteFill>
  );
};

// ─── End Card ─────────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.88, 1]);

  const tagSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [14, 0]);

  const barWidth = interpolate(
    spring({
      frame: frame - 14,
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
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})` }}>
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 560,
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 32,
            marginBottom: 24,
          }}
        />

        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -1,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Just <span style={{ color: COLORS.red }}>Work.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Impact flash — 2-frame white punch at cut boundary ───────────
const ImpactFlash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: 0.95 }} />
);

// ─── Clip beat with glitch burst on entrance ──────────────────────
const ClipBeat: React.FC<{ src: string; brightness?: number }> = ({
  src,
  brightness = 0.9,
}) => (
  <GlitchEffect startFrame={0} duration={8} intensity={0.55}>
    <VideoBeat src={src} durationInFrames={75} brightness={brightness} />
  </GlitchEffect>
);

// ─── Main Composition ─────────────────────────────────────────────
export const JustWork15: React.FC = () => {
  // Cut boundaries for incoming clips (where flash + glitch land)
  const cuts = [45, 120, 195, 270, 345];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Slate (0–45) */}
      <Sequence from={0} durationInFrames={45}>
        <Slate />
      </Sequence>

      {/* Clip 1 (45–120) — medicine ball throw */}
      <Sequence from={45} durationInFrames={75}>
        <ClipBeat src="jw-1.mp4" brightness={0.92} />
      </Sequence>

      {/* Clip 2 (120–195) — rowing pull */}
      <Sequence from={120} durationInFrames={75}>
        <ClipBeat src="jw-2.mp4" brightness={0.88} />
      </Sequence>

      {/* Clip 3 (195–270) — sled drive */}
      <Sequence from={195} durationInFrames={75}>
        <ClipBeat src="jw-3.mp4" brightness={0.9} />
      </Sequence>

      {/* Clip 4 (270–345) — pilates leg press */}
      <Sequence from={270} durationInFrames={75}>
        <ClipBeat src="jw-4.mp4" brightness={0.88} />
      </Sequence>

      {/* Clip 5 (345–420) — pilates rings group */}
      <Sequence from={345} durationInFrames={75}>
        <ClipBeat src="jw-5.mp4" brightness={0.9} />
      </Sequence>

      {/* Impact flashes — 2-frame white punches at each cut boundary */}
      {cuts.map((f) => (
        <Sequence key={f} from={f} durationInFrames={2}>
          <ImpactFlash />
        </Sequence>
      ))}

      {/* End card (420–450) */}
      <Sequence from={420} durationInFrames={30}>
        <EndCard />
      </Sequence>

      {/* Music bed — Seven Nation Army instrumental */}
      <Audio
        src={staticFile("music-seven-nation-army.mp3")}
        volume={(f) => {
          if (f < 8) return interpolate(f, [0, 8], [0, 0.82]);
          if (f > JUST_WORK_DURATION - 20)
            return interpolate(f, [JUST_WORK_DURATION - 20, JUST_WORK_DURATION], [0.82, 0]);
          return 0.82;
        }}
      />
    </AbsoluteFill>
  );
};
