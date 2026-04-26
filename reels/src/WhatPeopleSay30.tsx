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
 * ─── What People Are Saying — 30s Reviews Compilation ─────────────
 *
 * Real member reviews overlaid on b-roll of the gym in action.
 * Source reviews pulled Apr 2026 from Mindbody + HireFrederick public listings.
 *
 * Duration: 900 frames @ 30fps = 30.0s
 * Music: We Major (Kanye)
 *
 * Beat timeline:
 *   1.   0–60   (2.0s)  Slate — "What people are saying"
 *   2.  60–225  (5.5s)  Review 1 — Izzy E. (Oct 2025) over pad work
 *   3. 225–390  (5.5s)  Review 2 — Oren R. over sparring
 *   4. 390–555  (5.5s)  Review 3 — Christopher R. over coach+group
 *   5. 555–720  (5.5s)  Review 4 — Sean-Paul G. over facility wide
 *   6. 720–855  (4.5s)  Review 5 — Bill C. over smiling member
 *   7. 855–900  (1.5s)  End card — logo + CTA
 *
 * Text-safe band: y ∈ [260, 1500]. Cards live in lower third.
 */

export const WPS_DURATION = 900;

type Review = {
  quote: string;
  author: string;
  source: string;
  clip: string;
  brightness?: number;
};

const REVIEWS: Review[] = [
  {
    quote: "My best class yet.",
    author: "Izzy E.",
    source: "Oct 2025 • Mindbody",
    clip: "wpr-1-pads.mp4",
    brightness: 0.82,
  },
  {
    quote: "No BS. Action, action, action. Love it.",
    author: "Oren R.",
    source: "Mindbody",
    clip: "wpr-2-spar.mp4",
    brightness: 0.85,
  },
  {
    quote: "Best gym I have ever joined.",
    author: "Christopher R.",
    source: "Google Review",
    clip: "wpr-3-group.mp4",
    brightness: 0.8,
  },
  {
    quote: "Immaculate facility. Top-notch equipment. Excellent staff.",
    author: "Sean-Paul G.",
    source: "Google Review",
    clip: "wpr-4-facility.mp4",
    brightness: 0.78,
  },
  {
    quote: "Great positive energy. Extremely happy to have found it.",
    author: "Bill C.",
    source: "Google Review",
    clip: "wpr-5-smile.mp4",
    brightness: 0.82,
  },
];

// ─── B-roll layer: video with vignette, grade, dark bottom gradient ─
const VideoBed: React.FC<{
  src: string;
  durationInFrames: number;
  brightness?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}> = ({
  src,
  durationInFrames,
  brightness = 0.85,
  fadeInFrames = 4,
  fadeOutFrames = 6,
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
  const scale = interpolate(frame, [0, durationInFrames], [1.04, 1.1], {
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
            filter: `brightness(${brightness}) contrast(1.15) saturate(0.9)`,
          }}
          muted
        />
      </div>
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.6) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Heavy bottom gradient for caption legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.75) 88%, rgba(0,0,0,0.92) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Review card overlay — quote + attribution ────────────────────
const ReviewCard: React.FC<{ review: Review; startFrame?: number }> = ({
  review,
  startFrame = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, mass: 0.8 },
    durationInFrames: 22,
  });
  const opacity = interpolate(entry, [0, 1], [0, 1]);
  const translateY = interpolate(entry, [0, 1], [26, 0]);

  const barWidth = interpolate(
    spring({
      frame: frame - (startFrame + 6),
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 140]
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingLeft: 90,
        paddingRight: 90,
        paddingBottom: 280,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        {/* 5 stars */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            color: COLORS.gold,
            fontSize: 42,
            letterSpacing: 2,
          }}
        >
          ★★★★★
        </div>

        {/* Quote */}
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 72,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            textTransform: "uppercase",
            textShadow: "0 4px 30px rgba(0,0,0,0.95)",
            maxWidth: 900,
          }}
        >
          &ldquo;{review.quote}&rdquo;
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: COLORS.red,
            margin: "28px 0 20px",
          }}
        />

        {/* Attribution */}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.white,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          — {review.author}
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 20,
            fontWeight: 500,
            color: COLORS.gray,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          {review.source}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Slate ────────────────────────────────────────────────────────
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
  const scaleIn = interpolate(textSpring, [0, 1], [1.2, 1]);
  const exit = interpolate(frame, [48, 60], [1, 0], {
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
              color: COLORS.gold,
              fontSize: 48,
              letterSpacing: 6,
              marginBottom: 24,
            }}
          >
            ★★★★★
          </div>
          <div
            style={{
              opacity,
              transform: `scale(${scaleIn})`,
              fontFamily: FONTS.headline,
              fontSize: 150,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -4,
              lineHeight: 0.92,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
            }}
          >
            What
            <br />
            People Are
            <br />
            <span style={{ color: COLORS.red }}>Saying.</span>
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
    [0, 240]
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
          Train with <span style={{ color: COLORS.red }}>Us.</span>
        </div>
        <div
          style={{
            opacity: tagOpacity,
            fontFamily: FONTS.body,
            fontSize: 28,
            fontWeight: 500,
            color: COLORS.gray,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 14,
          }}
        >
          @dbelitefitness
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Impact flash — 2-frame white punch at cut boundary ───────────
const ImpactFlash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: 0.9 }} />
);

// ─── Review beat: clip + card, with glitch burst on entrance ──────
const ReviewBeat: React.FC<{ review: Review; durationInFrames: number }> = ({
  review,
  durationInFrames,
}) => (
  <>
    <GlitchEffect startFrame={0} duration={6} intensity={0.45}>
      <VideoBed
        src={review.clip}
        durationInFrames={durationInFrames}
        brightness={review.brightness}
      />
    </GlitchEffect>
    <ReviewCard review={review} startFrame={8} />
  </>
);

// ─── Main Composition ─────────────────────────────────────────────
export const WhatPeopleSay30: React.FC = () => {
  // Beat lengths (frames)
  const beats = [
    { from: 0, dur: 60, kind: "slate" as const },
    { from: 60, dur: 165, kind: "review" as const, idx: 0 },
    { from: 225, dur: 165, kind: "review" as const, idx: 1 },
    { from: 390, dur: 165, kind: "review" as const, idx: 2 },
    { from: 555, dur: 165, kind: "review" as const, idx: 3 },
    { from: 720, dur: 135, kind: "review" as const, idx: 4 },
    { from: 855, dur: 45, kind: "end" as const },
  ];

  // Cut boundaries for impact flashes (entering each review beat)
  const cuts = [60, 225, 390, 555, 720, 855];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {beats.map((b, i) => {
        if (b.kind === "slate") {
          return (
            <Sequence key={i} from={b.from} durationInFrames={b.dur}>
              <Slate />
            </Sequence>
          );
        }
        if (b.kind === "end") {
          return (
            <Sequence key={i} from={b.from} durationInFrames={b.dur}>
              <EndCard />
            </Sequence>
          );
        }
        const review = REVIEWS[b.idx];
        return (
          <Sequence key={i} from={b.from} durationInFrames={b.dur}>
            <ReviewBeat review={review} durationInFrames={b.dur} />
          </Sequence>
        );
      })}

      {/* Impact flashes at each cut */}
      {cuts.map((f) => (
        <Sequence key={`flash-${f}`} from={f} durationInFrames={2}>
          <ImpactFlash />
        </Sequence>
      ))}

      {/* Music bed */}
      <Audio
        src={staticFile("music-we-major.mp3")}
        volume={(f) => {
          if (f < 10) return interpolate(f, [0, 10], [0, 0.78]);
          if (f > WPS_DURATION - 24)
            return interpolate(f, [WPS_DURATION - 24, WPS_DURATION], [0.78, 0]);
          return 0.78;
        }}
      />
    </AbsoluteFill>
  );
};
