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
 * ─── Just Work — Vol. 2 — 15s Compilation Reel ─────────────────────────
 *
 * VARIANT on the LOCKED JustWork15 template — per Joey: drop the black-screen
 * slate at the top (people scroll past black openers). Title "JUST WORK." now
 * overlays the first clip for 40 frames, then the reel plays as normal.
 * EndCard logo/tagline stays locked.
 *
 * Source: April 20, 2026 — "Its Just Work" iPhone drop from Don Sommerville.
 *
 * Duration: 450 frames @ 30fps = 15.0s
 * Music: The White Stripes — Seven Nation Army (Instrumental) [reused]
 *
 * Beat timeline:
 *   1.   0–120  (4.0s)  jw2-1 (plate press overhead) + "JUST WORK." overlay f0–f40
 *   2. 120–195  (2.5s)  jw2-2 (group plank wide — "It's Just Work" wall)
 *   3. 195–270  (2.5s)  jw2-3 (down-dog row stretch)
 *   4. 270–345  (2.5s)  jw2-4 (stretch / transition beat)
 *   5. 345–420  (2.5s)  jw2-5 (side plank / push-up group — ring in BG)
 *   6. 420–450  (1.0s)  End card — logo + "Just Work." [LOCKED]
 */

export const JUST_WORK_VOL2_DURATION = 450;

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
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.55) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
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

// ─── Title overlay — "JUST / WORK." rides over the first clip ───────
// Renders on top of the video beat for the first ~1.3s, then fades out while
// the clip continues playing. Replaces the old black-screen slate.
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
      frame: frame - 10,
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 180]
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
            fontSize: 180,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -4,
            lineHeight: 0.9,
            textTransform: "uppercase",
            textShadow: "0 8px 60px rgba(0,0,0,0.98), 0 2px 8px rgba(0,0,0,0.9)",
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
  );
};

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

const ImpactFlash: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: 0.95 }} />
);

const ClipBeat: React.FC<{
  src: string;
  brightness?: number;
  durationInFrames?: number;
}> = ({ src, brightness = 0.9, durationInFrames = 75 }) => (
  <GlitchEffect startFrame={0} duration={8} intensity={0.55}>
    <VideoBeat
      src={src}
      durationInFrames={durationInFrames}
      brightness={brightness}
    />
  </GlitchEffect>
);

export const JustWork15Vol2: React.FC = () => {
  const cuts = [120, 195, 270, 345];

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Clip 1 runs 0–120 (4s) with title overlay on top for first 42 frames */}
      <Sequence from={0} durationInFrames={120}>
        <ClipBeat src="jw2-1.mp4" brightness={0.88} durationInFrames={120} />
      </Sequence>

      {/* "JUST / WORK." title rides over the first clip then fades */}
      <Sequence from={0} durationInFrames={45}>
        <TitleOverlay />
      </Sequence>

      <Sequence from={120} durationInFrames={75}>
        <ClipBeat src="jw2-2.mp4" brightness={0.88} />
      </Sequence>

      <Sequence from={195} durationInFrames={75}>
        <ClipBeat src="jw2-3.mp4" brightness={0.9} />
      </Sequence>

      <Sequence from={270} durationInFrames={75}>
        <ClipBeat src="jw2-4.mp4" brightness={0.88} />
      </Sequence>

      <Sequence from={345} durationInFrames={75}>
        <ClipBeat src="jw2-5.mp4" brightness={0.9} />
      </Sequence>

      {cuts.map((f) => (
        <Sequence key={f} from={f} durationInFrames={2}>
          <ImpactFlash />
        </Sequence>
      ))}

      <Sequence from={420} durationInFrames={30}>
        <EndCard />
      </Sequence>

      <Audio
        src={staticFile("music-seven-nation-army.mp3")}
        volume={(f) => {
          if (f < 8) return interpolate(f, [0, 8], [0, 0.82]);
          if (f > JUST_WORK_VOL2_DURATION - 20)
            return interpolate(
              f,
              [JUST_WORK_VOL2_DURATION - 20, JUST_WORK_VOL2_DURATION],
              [0.82, 0]
            );
          return 0.82;
        }}
      />
    </AbsoluteFill>
  );
};
