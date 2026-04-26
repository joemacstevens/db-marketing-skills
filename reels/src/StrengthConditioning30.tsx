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
import { TextScramble, KineticMarquee } from "./cinematic-effects";

/*
 * ─── Strength & Conditioning — 30s Feature Reel ────────────────────────
 *
 * Duration: 900 frames @ 30fps = 30.0s
 * Music: Hans Zimmer — Gurney Battle (Dune Part 2)
 * Source footage: 2026/gym_4_15_26 S&C shoot (+ curated backups)
 *
 * Beat timeline (feed-safe center band):
 *   1. 0–75     (2.5s)  Cold open — slate: "STRENGTH & CONDITIONING"
 *   2. 75–160   (2.83s) Hero clip + red bar reveal
 *   3. 160–230  (2.33s) Fast cut — explosive
 *   4. 230–300  (2.33s) Fast cut — load
 *   5. 300–390  (3.00s) Text beat: "EVERY REP. EARNED."
 *   6. 390–460  (2.33s) Fast cut — drive
 *   7. 460–530  (2.33s) Fast cut — grind
 *   8. 530–620  (3.00s) Text beat: "DISCIPLINE · DESIRE · DEDICATION"
 *   9. 620–720  (3.33s) Hero long hold — climax clip
 *   10. 720–820 (3.33s) "DIFFERENT BREED" scramble over motion
 *   11. 820–900 (2.67s) End card — logo + tagline + marquee
 *
 * IG Reel feed-safe text zone (1080x1920):
 *   - Top 220px blocked by username bar
 *   - Bottom 450px blocked by caption + UI
 *   - Text lives in y=260–1400 band
 */

export const SC30_DURATION = 900;

const TEXT_ZONE = {
  top: 260,
  bottom: 1400,
  padX: 120,
};

// ─── Clip playlist ─────────────────────────────────────────────
// Clips are staged in reels/public/. Each entry: file, trim start, object position.
// TO FILL IN after gym_4_15_26 indexing completes.
type ClipSpec = {
  src: string;          // file under public/
  trimStart?: number;   // seconds — startFrom on OffthreadVideo
  brightness?: number;
  objectPosition?: string;
};

// Clip selections — pulled from media index. Files staged in reels/public/
// via strength-conditioning-2026-04-15/prep-clips.sh
const CLIPS: Record<string, ClipSpec> = {
  hero:      { src: "sc-01-hero.mp4",      brightness: 0.82 },  // C4930  step + boxing open
  realwork:  { src: "sc-02-realwork.mp4",  brightness: 0.82 },  // C4927  students boxing w/ weights
  explosive: { src: "sc-03-explosive.mp4", brightness: 0.85 },  // Atoya  barbell squat
  load:      { src: "sc-04-load.mp4",      brightness: 0.85 },  // Apr 12 sled push
  drive:     { src: "sc-05-drive.mp4",     brightness: 0.82 },  // C4928  class wide (text bg)
  mid2:      { src: "sc-06-mid2.mp4",      brightness: 0.85 },  // C4688  TRX
  grind:     { src: "sc-07-grind.mp4",     brightness: 0.85 },  // C4925  boxing combo close
  text2:     { src: "sc-08-text2.mp4",     brightness: 0.82 },  // C4924  class wide (text bg 2)
  motion:    { src: "sc-09-motion.mp4",    brightness: 0.8 },   // C4931  coach + participants
  climax:    { src: "sc-10-climax.mp4",    brightness: 0.88 },  // C4928@22s coach instruction
};

// ─── Reusable video beat with cinematic grade + fades ───────────
const VideoBeat: React.FC<{
  clip: ClipSpec;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  vignetteOpacity?: number;
  children?: React.ReactNode;
}> = ({
  clip,
  durationInFrames,
  fadeInFrames = 5,
  fadeOutFrames = 8,
  vignetteOpacity = 0.55,
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

  // Subtle Ken Burns push
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

      {/* Heavy vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          opacity,
          pointerEvents: "none",
        }}
      />

      {/* Color wash to unify clips — cool shadows, slight red lift */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(20,5,0,0.35) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* Text band gradient for readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 5%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.2) 70%, transparent 95%)",
          opacity: opacity * 0.6,
          pointerEvents: "none",
        }}
      />

      {children}
    </AbsoluteFill>
  );
};

// ─── Centered text block helper ─────────────────────────────────
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

// ─── Red accent bar (spring in) ─────────────────────────────────
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
        marginBottom: 22,
      }}
    />
  );
};

// ─── Beat 1: Cold open slate ────────────────────────────────────
const Beat1Slate: React.FC = () => {
  const frame = useCurrentFrame();
  const textOpacity = interpolate(frame, [8, 28], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [62, 75], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(textOpacity, exitOpacity);

  return (
    <VideoBeat clip={CLIPS.hero} durationInFrames={75} vignetteOpacity={0.7}>
      <CenteredBlock>
        <div style={{ opacity, width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RedAccent delay={10} width={120} thickness={3} />
          </div>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 18,
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            Different Breed Elite Fitness
          </div>
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 118,
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

// ─── Beat 2: Hero cut — red bar reveal + subtitle ───────────────
const Beat2Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const subSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);
  const subY = interpolate(subSpring, [0, 1], [18, 0]);
  const exitOpacity = interpolate(frame, [72, 85], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.realwork} durationInFrames={85} vignetteOpacity={0.55}>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
          paddingBottom: SAFE.bottom + 80,
        }}
      >
        <div
          style={{
            opacity: exitOpacity,
            transform: `translateY(${subY}px)`,
          }}
        >
          <div
            style={{
              opacity: subOpacity,
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div style={{ width: 40, height: 2, backgroundColor: COLORS.red }} />
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 22,
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                letterSpacing: 6,
                textTransform: "uppercase",
                textShadow: "0 2px 18px rgba(0,0,0,0.9)",
              }}
            >
              Teaneck · NJ
            </div>
          </div>
          <div
            style={{
              opacity: subOpacity,
              fontFamily: FONTS.headline,
              fontSize: 78,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1,
              lineHeight: 0.98,
              textTransform: "uppercase",
              textShadow: "0 6px 36px rgba(0,0,0,0.95)",
            }}
          >
            Real gym.
            <br />
            Real work.
          </div>
        </div>
      </AbsoluteFill>
    </VideoBeat>
  );
};

// ─── Text-only beat (clip keeps playing under) ──────────────────
const TextBeat: React.FC<{
  clip: ClipSpec;
  duration: number;
  eyebrow?: string;
  headline: string;
  accent?: string;
  startScale?: number;
}> = ({ clip, duration, eyebrow, headline, accent, startScale = 1.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 6,
    fps,
    config: { damping: 180, mass: 0.8 },
    durationInFrames: 22,
  });
  const headlineScale = interpolate(enter, [0, 1], [startScale, 1]);
  const headlineOpacity = interpolate(enter, [0, 1], [0, 1]);
  const exit = interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eyebrowOpacity = interpolate(frame, [14, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={clip} durationInFrames={duration} vignetteOpacity={0.7}>
      <CenteredBlock>
        <div style={{ opacity: exit, width: "100%", textAlign: "center" }}>
          {eyebrow && (
            <div
              style={{
                opacity: eyebrowOpacity,
                fontFamily: FONTS.body,
                fontSize: 22,
                fontWeight: 600,
                color: COLORS.red,
                letterSpacing: 10,
                textTransform: "uppercase",
                marginBottom: 22,
                textShadow: "0 2px 18px rgba(0,0,0,0.9)",
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              opacity: headlineOpacity,
              transform: `scale(${headlineScale})`,
              fontFamily: FONTS.headline,
              fontSize: 132,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -3,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.98)",
            }}
          >
            {headline}
          </div>
          {accent && (
            <div
              style={{
                opacity: interpolate(frame, [30, 50], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                fontFamily: FONTS.body,
                fontSize: 24,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: 6,
                textTransform: "uppercase",
                marginTop: 22,
                textShadow: "0 2px 16px rgba(0,0,0,0.9)",
              }}
            >
              {accent}
            </div>
          )}
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Pure visual cut — no text, just clip + vignette ────────────
const PureVisual: React.FC<{
  clip: ClipSpec;
  duration: number;
  vignetteOpacity?: number;
}> = ({ clip, duration, vignetteOpacity = 0.55 }) => {
  return <VideoBeat clip={clip} durationInFrames={duration} vignetteOpacity={vignetteOpacity} />;
};

// ─── Climax beat — long hold with scramble "DIFFERENT BREED" ────
const ClimaxBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [88, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.motion} durationInFrames={100} vignetteOpacity={0.65}>
      <CenteredBlock>
        <div style={{ opacity: exit, width: "100%", textAlign: "center" }}>
          <TextScramble
            text={"DIFFERENT\nBREED"}
            startFrame={6}
            framesPerChar={2}
            fontSize={170}
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

// ─── End Card ───────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  const barWidth = interpolate(
    spring({
      frame: frame - 14,
      fps,
      config: { damping: 200 },
      durationInFrames: 22,
    }),
    [0, 1],
    [0, 280]
  );

  const tagSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [18, 0]);

  const urlOpacity = interpolate(frame, [40, 58], [0, 1], {
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
          paddingLeft: TEXT_ZONE.padX,
          paddingRight: TEXT_ZONE.padX,
        }}
      >
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}>
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 620,
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div
          style={{
            width: barWidth,
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
            fontSize: 42,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: 6,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Evolve Into Greatness
        </div>

        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONTS.body,
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.red,
            marginTop: 28,
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          differentbreedsportsacademy.com
        </div>
      </div>

      {/* Bottom marquee */}
      <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: SAFE.bottom - 40 }}>
        <KineticMarquee
          text="STRENGTH &amp; CONDITIONING   ·   DIFFERENT BREED ELITE FITNESS   ·   TEANECK NJ"
          separator="   \u2022   "
          speed={2.0}
          startFrame={20}
          fontSize={24}
          fontWeight={600}
          color="rgba(255,255,255,0.6)"
          separatorColor={COLORS.red}
          letterSpacing={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Persistent top-right watermark ─────────────────────────────
const CornerWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [12, 30], [0, 0.6], {
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
      <Img src={staticFile("db-logo-red-outline.png")} style={{ width: 54, height: 54 }} />
    </div>
  );
};

// ─── Main Composition ───────────────────────────────────────────
export const StrengthConditioning30: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Beat 1: Slate (0–75) */}
      <Sequence from={0} durationInFrames={75}>
        <Beat1Slate />
      </Sequence>

      {/* Beat 2: Hero (75–160) */}
      <Sequence from={75} durationInFrames={85}>
        <Beat2Hero />
      </Sequence>

      {/* Beat 3: Fast cut — explosive (160–230) */}
      <Sequence from={160} durationInFrames={70}>
        <PureVisual clip={CLIPS.explosive} duration={70} />
      </Sequence>

      {/* Beat 4: Fast cut — load (230–300) */}
      <Sequence from={230} durationInFrames={70}>
        <PureVisual clip={CLIPS.load} duration={70} />
      </Sequence>

      {/* Beat 5: Text — "EVERY REP. EARNED." (300–390) */}
      <Sequence from={300} durationInFrames={90}>
        <TextBeat
          clip={CLIPS.drive}
          duration={90}
          eyebrow="The Standard"
          headline={"EVERY REP.\nEARNED."}
        />
      </Sequence>

      {/* Beat 6: Fast cut — drive (390–460) */}
      <Sequence from={390} durationInFrames={70}>
        <PureVisual clip={CLIPS.mid2} duration={70} />
      </Sequence>

      {/* Beat 7: Fast cut — grind (460–530) */}
      <Sequence from={460} durationInFrames={70}>
        <PureVisual clip={CLIPS.grind} duration={70} />
      </Sequence>

      {/* Beat 8: Text — "DISCIPLINE · DESIRE · DEDICATION" (530–620) */}
      <Sequence from={530} durationInFrames={90}>
        <TextBeat
          clip={CLIPS.text2}
          duration={90}
          eyebrow="The Code"
          headline={"DISCIPLINE\nDESIRE\nDEDICATION"}
        />
      </Sequence>

      {/* Beat 9: Climax — "DIFFERENT BREED" scramble (620–720) */}
      <Sequence from={620} durationInFrames={100}>
        <ClimaxBeat />
      </Sequence>

      {/* Beat 10: Hero long hold (720–820) */}
      <Sequence from={720} durationInFrames={100}>
        <PureVisual clip={CLIPS.climax} duration={100} vignetteOpacity={0.6} />
      </Sequence>

      {/* Beat 11: End card (820–900) */}
      <Sequence from={820} durationInFrames={80}>
        <EndCard />
      </Sequence>

      {/* Corner watermark — entire duration except end card */}
      <Sequence from={0} durationInFrames={820}>
        <CornerWatermark />
      </Sequence>

      {/* Music bed — Hans Zimmer, Gurney Battle */}
      <Audio
        src={staticFile("music-gurney-battle.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, 30, SC30_DURATION - 40, SC30_DURATION],
            [0, 0.9, 0.9, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
    </AbsoluteFill>
  );
};
