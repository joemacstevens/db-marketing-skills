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
import { GlitchEffect } from "./cinematic-effects";

/*
 * ─── Jack & Jill × DB — Next Generation (15s Kids Compilation) ─────
 *
 * Pure kids-energy reel. JustWork15 template style — slate + 5 clips
 * + end card, music-driven, no VO. Tight cuts with impact flash +
 * glitch burst transitions.
 *
 * Duration: 450 frames @ 30fps = 15.0s
 * Music: Busta Rhymes — Touch It (instrumental)
 * Source: compilation_analysis top-scored kids clips from 2026/April 18, 2026
 *
 * Beat timeline:
 *   1.   0–45   (1.5s)  Slate — "RAISED DIFFERENT."
 *   2.  45–120  (2.5s)  jjk-1  (IMG_5446 — boy jab on DB logo)
 *   3. 120–195  (2.5s)  jjk-2  (IMG_5443 — ring combo w/ Coach Joe)
 *   4. 195–270  (2.5s)  jjk-3  (IMG_5431 — kid sprint full extension)
 *   5. 270–345  (2.5s)  jjk-4  (IMG_5452 — girl power punch to bag)
 *   6. 345–420  (2.5s)  jjk-5  (74C8B980 — explosive sprint climax)
 *   7. 420–450  (1.0s)  End card — DB × Jack & Jill
 *
 * IG Reel text-safe band: y ∈ [260, 1500].
 */

export const JJ_NEXT_GEN_DURATION = 450;

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
  brightness = 0.9,
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
            filter: `brightness(${brightness}) contrast(1.18) saturate(0.95)`,
          }}
          muted
        />
      </div>
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 44%, rgba(0,0,0,0.5) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Subtle grade */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,0,0,0.12) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(20,5,0,0.28) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Slate: "RAISED DIFFERENT." ──────────────────────────────────
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
  const scaleIn = interpolate(textSpring, [0, 1], [1.22, 1]);
  const exit = interpolate(frame, [34, 45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barWidth = interpolate(
    spring({
      frame: frame - 12,
      fps,
      config: { damping: 200 },
      durationInFrames: 16,
    }),
    [0, 1],
    [0, 200]
  );

  const kickerOpacity = interpolate(frame, [20, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            opacity: exit,
            textAlign: "center",
            paddingLeft: 100,
            paddingRight: 100,
          }}
        >
          <div
            style={{
              opacity: kickerOpacity,
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 28,
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            Jack &amp; Jill × Different Breed
          </div>
          <div
            style={{
              opacity,
              transform: `scale(${scaleIn})`,
              fontFamily: FONTS.headline,
              fontSize: 156,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -4,
              lineHeight: 0.9,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
            }}
          >
            Raised
            <br />
            <span style={{ color: COLORS.red }}>Different.</span>
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

  const creditOpacity = interpolate(frame, [16, 28], [0, 1], {
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})` }}>
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 540,
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 30,
            marginBottom: 22,
          }}
        />

        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -1,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          The Next <span style={{ color: COLORS.red }}>Generation.</span>
        </div>

        <div
          style={{
            opacity: creditOpacity,
            fontFamily: FONTS.body,
            fontSize: 20,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            marginTop: 22,
            letterSpacing: 4,
            textAlign: "center",
            lineHeight: 1.5,
            textTransform: "uppercase",
          }}
        >
          Jack &amp; Jill Bergen-Passaic
          <br />
          @joebutta25 · @sun_of_yah
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
export const JackJillNextGen15: React.FC = () => {
  const cuts = [45, 120, 195, 270, 345];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Slate (0–45) */}
      <Sequence from={0} durationInFrames={45}>
        <Slate />
      </Sequence>

      {/* Clip 1 (45–120) — boy jab on DB logo */}
      <Sequence from={45} durationInFrames={75}>
        <ClipBeat src="jjk-1.mp4" brightness={0.92} />
      </Sequence>

      {/* Clip 2 (120–195) — ring combo with Coach Joe */}
      <Sequence from={120} durationInFrames={75}>
        <ClipBeat src="jjk-2.mp4" brightness={0.9} />
      </Sequence>

      {/* Clip 3 (195–270) — kid sprint full extension */}
      <Sequence from={195} durationInFrames={75}>
        <ClipBeat src="jjk-3.mp4" brightness={0.92} />
      </Sequence>

      {/* Clip 4 (270–345) — girl power punch to bag */}
      <Sequence from={270} durationInFrames={75}>
        <ClipBeat src="jjk-4.mp4" brightness={0.9} />
      </Sequence>

      {/* Clip 5 (345–420) — explosive sprint climax */}
      <Sequence from={345} durationInFrames={75}>
        <ClipBeat src="jjk-5.mp4" brightness={0.92} />
      </Sequence>

      {/* Impact flashes */}
      {cuts.map((f) => (
        <Sequence key={f} from={f} durationInFrames={2}>
          <ImpactFlash />
        </Sequence>
      ))}

      {/* End card (420–450) */}
      <Sequence from={420} durationInFrames={30}>
        <EndCard />
      </Sequence>

      {/* Music bed — Touch It instrumental */}
      <Audio
        src={staticFile("music-touch-it.mp3")}
        volume={(f) => {
          if (f < 8) return interpolate(f, [0, 8], [0, 0.82]);
          if (f > JJ_NEXT_GEN_DURATION - 20)
            return interpolate(
              f,
              [JJ_NEXT_GEN_DURATION - 20, JJ_NEXT_GEN_DURATION],
              [0.82, 0]
            );
          return 0.82;
        }}
      />
    </AbsoluteFill>
  );
};
