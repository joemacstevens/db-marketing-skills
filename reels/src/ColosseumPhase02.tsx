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
import { GlitchEffect, TextScramble } from "./cinematic-effects";

/*
 * ─── The Colosseum · Phase 02 — BTS Construction + Vision ───────────────
 *
 * Duration: 570 frames @ 30fps = 19.0s
 *
 * The second new addition at DB this year. Opens on Don Sommerville (owner)
 * mid-demolition — his smiling face is the HOOK per Joey's feedback, since
 * viewers drop off before the end and the owner's face pulls more watches.
 * Opener title "COMING SOON / A DIFFERENT BREED" rides over him, then the
 * narrative builds through demolition → work montage → dust → end card
 * with the "THE COLOSSEUM" brand reveal as the payoff.
 *
 * Beat timeline:
 *   A.   0–90   (3.0s)  Don smiling (col2-hero) + "A DIFFERENT BREED" title
 *   B.  90–240  (5.0s)  Demolition (col2-demo) — no on-screen text, VO leads
 *   C. 240–390  (5.0s)  Work montage (3 × 50-frame cuts), VO continues
 *   D. 390–480  (3.0s)  Dust transition (col2-dust)
 *   +  430–480  ( overlay) "THE COLOSSEUM" title card reveal over the dust
 *   E. 480–570  (3.0s)  End card — DB lockup + "THE COLOSSEUM · COMING SOON 2026"
 *
 * Layered on top:
 *   • Berto VO (from f=90, ~12.2s) narrates the vision. See vo-colosseum-vision.mp3
 *   • TikTok-style caption track synced to Whisper word timestamps (f=90–430)
 *   • Music (music-colosseum-phase02.mp3) ducks during VO, returns for end card
 */

export const COLOSSEUM_PHASE_02_DURATION = 570;

// ─── Video beat with heavy cinematic grade ─────────────────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  brightness?: number;
  saturation?: number;
  contrast?: number;
  vignetteOpacity?: number;
  children?: React.ReactNode;
}> = ({
  src,
  durationInFrames,
  fadeInFrames = 5,
  fadeOutFrames = 8,
  brightness = 0.85,
  saturation = 0.8,
  contrast = 1.25,
  vignetteOpacity = 0.6,
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
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.08], {
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
            filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`,
          }}
          muted
        />
      </div>
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* Center band gradient for text legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 10%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.4) 60%, transparent 90%)",
          opacity: opacity * 0.6,
          pointerEvents: "none",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// ─── Centered text block helper ────────────────────────────────────
const CenteredBlock: React.FC<{
  children: React.ReactNode;
  offsetY?: number;
}> = ({ children, offsetY = 0 }) => (
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
        paddingLeft: 120,
        paddingRight: 120,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

// ─── Opener title — "A DIFFERENT BREED" over Beat A ─────────────────
// Clean single-line title layered on Don's hook shot. "Coming Soon" message
// is now carried by the Berto VO + end card, so the opener stays uncluttered.
const OpenerTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 180, mass: 0.7 },
    durationInFrames: 18,
  });
  const mainOpacity = interpolate(mainSpring, [0, 1], [0, 1]);
  const mainScale = interpolate(mainSpring, [0, 1], [1.16, 1]);

  const barWidth = interpolate(
    spring({
      frame: frame - 20,
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 260]
  );

  const exit = interpolate(frame, [72, 88], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          opacity: exit,
          textAlign: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div
          style={{
            opacity: mainOpacity,
            transform: `scale(${mainScale})`,
            fontFamily: FONTS.headline,
            fontSize: 140,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -3,
            lineHeight: 0.92,
            textTransform: "uppercase",
            textShadow:
              "0 8px 60px rgba(0,0,0,0.98), 0 2px 10px rgba(0,0,0,0.9)",
          }}
        >
          A Different
          <br />
          Breed
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

// ─── Beat A: HOOK — Don (owner) smiling + opener title over him ─────
// Don's face is the retention hook. Opener title "COMING SOON / A DIFFERENT
// BREED" rides over him for 3 seconds, then hands off to the demolition beat.
const BeatA: React.FC = () => {
  return (
    <VideoBeat
      src="col2-hero.mp4"
      durationInFrames={90}
      brightness={0.82}
      saturation={0.88}
      contrast={1.2}
      vignetteOpacity={0.55}
    >
      <OpenerTitle />
    </VideoBeat>
  );
};

// ─── Beat B: Demolition — no on-screen text (VO carries the narrative) ──
const BeatB: React.FC = () => {
  return (
    <VideoBeat
      src="col2-demo.mp4"
      durationInFrames={150}
      brightness={0.82}
      saturation={0.7}
      contrast={1.3}
      vignetteOpacity={0.55}
    />
  );
};

// ─── Beat C: Work montage — 3 × 50f quick cuts, no text ────────────
const BeatC: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={50}>
        <VideoBeat
          src="col2-work.mp4"
          durationInFrames={50}
          brightness={0.88}
          saturation={0.75}
          fadeInFrames={3}
          fadeOutFrames={6}
        />
      </Sequence>
      <Sequence from={50} durationInFrames={50}>
        <VideoBeat
          src="col2-pickaxe.mp4"
          durationInFrames={50}
          brightness={0.85}
          saturation={0.8}
          fadeInFrames={3}
          fadeOutFrames={6}
        />
      </Sequence>
      <Sequence from={100} durationInFrames={50}>
        <VideoBeat
          src="col2-shovel.mp4"
          durationInFrames={50}
          brightness={0.86}
          saturation={0.78}
          fadeInFrames={3}
          fadeOutFrames={6}
        />
      </Sequence>
    </>
  );
};

// ─── Beat D: Dust transition — abstract texture with glitch pop ────
const BeatD: React.FC = () => {
  return (
    <GlitchEffect startFrame={60} duration={12} intensity={0.7}>
      <VideoBeat
        src="col2-dust.mp4"
        durationInFrames={90}
        brightness={1.0}
        saturation={0.3}
        contrast={1.4}
        vignetteOpacity={0.4}
      />
    </GlitchEffect>
  );
};

// ─── TikTok-style captions ─────────────────────────────────────────
// Chunks are timed from Whisper word-level timestamps on the VO, shifted +90
// frames (VO starts at composition f=90). Each chunk appears with a scale
// bounce entrance and snaps to the next.
type Caption = {
  start: number;
  end: number;
  text: string;
  highlight?: string;
};

const CAPTIONS: Caption[] = [
  { start: 90, end: 120, text: "We're Building" },
  { start: 120, end: 148, text: "Something Different" },
  { start: 151, end: 180, text: "A Raw, Functional" },
  { start: 180, end: 215, text: "Training Space" },
  { start: 215, end: 258, text: "Sleds. Iron." },
  { start: 258, end: 295, text: "A Cold Plunge", highlight: "Cold Plunge" },
  { start: 295, end: 320, text: "A Heat Tub", highlight: "Heat Tub" },
  { start: 320, end: 345, text: "In The Back" },
  { start: 345, end: 368, text: "No Machines" },
  { start: 368, end: 395, text: "Just Movement" },
  { start: 395, end: 430, text: "Coming Soon…" },
];

const CaptionChunk: React.FC<{ caption: Caption }> = ({ caption }) => {
  // frame here is local to the wrapping Sequence (starts at 0 each chunk)
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: { damping: 180, mass: 0.6 },
    durationInFrames: 10,
  });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const scale = interpolate(s, [0, 1], [1.15, 1]);

  const renderText = () => {
    if (!caption.highlight) return caption.text;
    const idx = caption.text.toLowerCase().indexOf(caption.highlight.toLowerCase());
    if (idx === -1) return caption.text;
    const before = caption.text.slice(0, idx);
    const hl = caption.text.slice(idx, idx + caption.highlight.length);
    const after = caption.text.slice(idx + caption.highlight.length);
    return (
      <>
        {before}
        <span style={{ color: COLORS.red }}>{hl}</span>
        {after}
      </>
    );
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 520,
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 84,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -1,
            lineHeight: 1.0,
            textTransform: "uppercase",
            textShadow:
              "0 0 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,0.95), 0 8px 40px rgba(0,0,0,0.9)",
            WebkitTextStroke: "2px rgba(0,0,0,0.85)",
          }}
        >
          {renderText()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CaptionTrack: React.FC = () => {
  return (
    <>
      {CAPTIONS.map((c) => (
        <Sequence key={c.start} from={c.start} durationInFrames={c.end - c.start}>
          <CaptionChunk caption={c} />
        </Sequence>
      ))}
    </>
  );
};

// ─── THE COLOSSEUM title card reveal — lands when VO says it ────────
// VO says "The Colosseum" starting at composition f~436. Reveal rides over
// the dust transition (which ends f=480) then hands off to the end card.
const ColosseumTitleReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dim overlay fades up to enhance legibility
  const dimOpacity = interpolate(frame, [0, 10], [0, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sub line spring
  const subSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);
  const subY = interpolate(subSpring, [0, 1], [12, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Dim backing for title readability over dust */}
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,1)", opacity: dimOpacity }} />

      {/* Title — absolute top:50% centering pattern (reliable across renders) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          width: "100%",
          textAlign: "center",
          paddingLeft: 80,
          paddingRight: 80,
          boxSizing: "border-box",
        }}
      >
        <GlitchEffect startFrame={6} duration={12} intensity={0.6}>
          <TextScramble
            text={"THE\nCOLOSSEUM"}
            startFrame={2}
            framesPerChar={1}
            fontSize={170}
            fontWeight={700}
            color={COLORS.white}
            fontFamily={FONTS.headline}
            letterSpacing={-4}
            textAlign="center"
            style={{
              textTransform: "uppercase",
              lineHeight: 0.92,
              textShadow:
                "0 8px 60px rgba(0,0,0,0.98), 0 2px 10px rgba(0,0,0,0.95)",
              width: "100%",
            }}
          />
        </GlitchEffect>
        <div
          style={{
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            marginTop: 22,
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 500,
            fontStyle: "italic",
            color: COLORS.red,
            letterSpacing: 8,
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 2px 18px rgba(0,0,0,0.98)",
            width: "100%",
          }}
        >
          A Different Breed Experience
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Beat E: End card — DB lockup + "THE COLOSSEUM · COMING SOON · 2026" ─
const BeatE: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.88, 1]);

  const comingSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const comingOpacity = interpolate(comingSpring, [0, 1], [0, 1]);
  const comingY = interpolate(comingSpring, [0, 1], [12, 0]);

  const tagOpacity = interpolate(frame, [40, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barWidth = interpolate(
    spring({
      frame: frame - 28,
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 260]
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
          width: "100%",
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 500,
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
            marginBottom: 24,
          }}
        />

        <div
          style={{
            opacity: comingOpacity,
            transform: `translateY(${comingY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 74,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -2,
            textTransform: "uppercase",
            textAlign: "center",
            width: "100%",
          }}
        >
          The <span style={{ color: COLORS.red }}>Colosseum</span>
        </div>
        <div
          style={{
            opacity: comingOpacity,
            transform: `translateY(${comingY}px)`,
            fontFamily: FONTS.body,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.gold,
            letterSpacing: 12,
            textTransform: "uppercase",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Coming Soon · 2026
        </div>

        <div
          style={{
            opacity: tagOpacity,
            marginTop: 28,
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: COLORS.gray,
            letterSpacing: 4,
            textAlign: "center",
            width: "100%",
          }}
        >
          Sleds · Iron · Cold Plunge · Outdoor Air
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Persistent corner watermark ───────────────────────────────────
const CornerWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [20, 45], [0, 0.55], {
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

// ─── Main Composition ──────────────────────────────────────────────
export const ColosseumPhase02: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* A: 0–90 HOOK — Don (owner) + opener title "COMING SOON / A DIFFERENT BREED" */}
      <Sequence from={0} durationInFrames={90}>
        <BeatA />
      </Sequence>

      {/* B: 90–240 demolition + "RAW IRON / REAL WORK / REAL SPACE" */}
      <Sequence from={90} durationInFrames={150}>
        <BeatB />
      </Sequence>

      {/* C: 240–390 work montage (3 quick cuts inside) */}
      <Sequence from={240} durationInFrames={150}>
        <BeatC />
      </Sequence>

      {/* D: 390–480 dust transition */}
      <Sequence from={390} durationInFrames={90}>
        <BeatD />
      </Sequence>

      {/* E: 480–570 end card — brand reveal */}
      <Sequence from={480} durationInFrames={90}>
        <BeatE />
      </Sequence>

      {/* TikTok-style captions — synced to VO, f=90–430 */}
      <CaptionTrack />

      {/* THE COLOSSEUM title card — lands when VO says it (f=430–480),
          rides over the dust transition, hands off to the end card. */}
      <Sequence from={430} durationInFrames={50}>
        <ColosseumTitleReveal />
      </Sequence>

      {/* Persistent watermark */}
      <Sequence from={0} durationInFrames={COLOSSEUM_PHASE_02_DURATION}>
        <CornerWatermark />
      </Sequence>

      {/*
        Music bed — rhythmic cinematic trailer track.
        Volume ducks during the VO section (f=90–460) so Berto can breathe.
        Returns to full for the end card payoff (f=480+).
      */}
      <Audio
        src={staticFile("music-colosseum-phase02.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, 85, 100, 450, 475, COLOSSEUM_PHASE_02_DURATION - 25, COLOSSEUM_PHASE_02_DURATION],
            [0, 0.85, 0.85, 0.25, 0.25, 0.85, 0.85, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/*
        Voiceover — Berto (DB signature voice, ElevenLabs v3) narrates the
        vision from f=90 (3s, as opener title fades) through ~f=456 (~15.2s).
        12.2s of spoken content — leaves breathing room before end card.
      */}
      <Sequence from={90}>
        <Audio
          src={staticFile("vo-colosseum-vision.mp3")}
          volume={(f) =>
            interpolate(f, [0, 6, 360, 370], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      </Sequence>
    </AbsoluteFill>
  );
};
