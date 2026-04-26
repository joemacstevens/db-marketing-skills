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
 * ─── Strength & Conditioning — Coach Danny — 30s Reel ──────────────────
 *
 * Duration: 900 frames @ 30fps = 30.0s
 * Music: Kanye West — We Major (Instrumental)
 * VO: 18.6s cinematic invite ("This isn't a class. It's a standard...")
 * Source footage: 2026/gym_3_30_26/Video (56 clips, Coach Danny's class)
 *
 * VO timing (ElevenLabs, qVpGLzi5EhjW3WGVhOa9, 18.60s):
 *   Starts at frame 30 (1.0s), ends at frame 588 (19.6s)
 *
 * Beat timeline (music bed under VO @ 0.18, swells to 0.65 at climax):
 *   1. 0–30      (1.00s)  Cold open — slate over group photo
 *   2. 30–115    (2.83s)  VO "This isn't a class. It's a standard." — class b-roll
 *   3. 115–200   (2.83s)  VO "Strength and Conditioning — Coach Danny." — Danny card
 *   4. 200–285   (2.83s)  VO "We build power. Discipline. Athletes." — fast cuts
 *   5. 285–390   (3.50s)  VO "Every rep. Every round. Earned." — text beat
 *   6. 390–495   (3.50s)  VO "No fluff. No shortcuts. Just work." — grind clip
 *   7. 495–588   (3.10s)  VO "Walk through the door. Train different." — entrance/wide
 *   8. 588–720   (4.40s)  Climax — "DIFFERENT BREED" scramble (VO done, music swells)
 *   9. 720–900   (6.00s)  End card — logo + "Evolve Into Greatness" + marquee
 *
 * IG Reel feed-safe text zone (1080x1920):
 *   - Top 210px blocked by username bar
 *   - Bottom 420px blocked by caption + UI
 *   - Text lives in y=260–1400 band
 *
 * CLIP NAMING:
 *   dsc-*.mp4 — clips from gym_3_30_26 (Danny S&C shoot, Mar 30 2026)
 *   Staged after Gemini indexing selects best_clip_range windows.
 *   Until then, sc-*.mp4 fallbacks from gym_4_15_26 are used (see CLIPS).
 */

export const DANNY_SC_DURATION = 900;

// ─── Clip playlist ─────────────────────────────────────────────
// Staged in reels/public/. Swap dsc-*.mp4 names in as indexer completes.
type ClipSpec = {
  src: string;
  trimStart?: number; // seconds
  brightness?: number;
  objectPosition?: string;
  /**
   * True if the source is landscape (16:9). Renders the clip contained
   * inside 9:16 with a blurred+scaled copy filling the full frame behind.
   * Preserves the full landscape composition instead of cropping hard.
   */
  landscape?: boolean;
};

const CLIPS: Record<string, ClipSpec> = {
  // Sourced from 2026/gym_3_30_26 (Coach Danny's S&C class) via Gemini
  // best_clip_range selection. See scripts/danny-clip-selection.json.
  open: { src: "dsc-open.mp4", brightness: 0.82 }, // C4846 — rotated 90°CW to portrait 2160x3840
  danny: { src: "dsc-danny.mp4", brightness: 0.85 }, // C4838 portrait
  power: { src: "dsc-power.mp4", brightness: 0.85 }, // C4850 portrait
  discipline: { src: "dsc-discipline.mp4", brightness: 0.85, landscape: true }, // C4837 landscape
  athletes: { src: "dsc-athletes.mp4", brightness: 0.82 }, // C4815 portrait
  earned: { src: "dsc-earned.mp4", brightness: 0.82 }, // C4823 portrait
  grind: { src: "dsc-grind.mp4", brightness: 0.85, landscape: true }, // C4818 landscape
  door: { src: "dsc-door.mp4", brightness: 0.8, landscape: true }, // C4806 landscape
  climax: { src: "dsc-climax.mp4", brightness: 0.88, landscape: true }, // C4817 landscape
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

  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {clip.landscape && (
        // Blurred, scaled-up backplate — fills 9:16 behind the letterboxed video
        <div
          style={{
            opacity: opacity * 0.75,
            position: "absolute",
            inset: 0,
            transform: `scale(${scale * 1.4})`,
            filter: "blur(36px) brightness(0.45) saturate(1.1)",
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
            }}
            muted
          />
        </div>
      )}

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
            objectFit: clip.landscape ? "contain" : "cover",
            objectPosition: clip.objectPosition ?? "center",
            filter: `brightness(${clip.brightness ?? 0.85}) contrast(1.2) saturate(0.88)`,
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

      {/* Color wash */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(20,5,0,0.35) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />

      {/* Text band readability gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 5%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.2) 70%, transparent 95%)",
          opacity: opacity * 0.55,
          pointerEvents: "none",
        }}
      />

      {children}
    </AbsoluteFill>
  );
};

// ─── Centered text in safe zone ─────────────────────────────────
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

const RedAccent: React.FC<{
  delay?: number;
  width?: number;
  thickness?: number;
}> = ({ delay = 0, width = 140, thickness = 4 }) => {
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
        margin: "0 auto 22px auto",
      }}
    />
  );
};

// ─── Beat 1: Slate (0–30) over group photo, pre-VO ──────────────
const Beat1Slate: React.FC = () => {
  const frame = useCurrentFrame();
  const textOpacity = interpolate(frame, [6, 22], [0, 1], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(frame, [22, 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(textOpacity, exitOpacity);

  const scale = interpolate(frame, [0, 30], [1.06, 1.12], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Img
        src={staticFile("danny-sc-group-1.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          transform: `scale(${scale})`,
          filter: "brightness(0.55) contrast(1.15) saturate(0.9)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }}
      />
      <CenteredBlock>
        <div style={{ opacity, width: "100%", textAlign: "center" }}>
          <RedAccent delay={6} width={110} thickness={3} />
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 14,
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            Different Breed Elite Fitness
          </div>
        </div>
      </CenteredBlock>
    </AbsoluteFill>
  );
};

// ─── Beat 2: VO "This isn't a class. It's a standard." ──────────
const Beat2Standard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 5,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const headlineOpacity = interpolate(enter, [0, 1], [0, 1]);
  const headlineY = interpolate(enter, [0, 1], [20, 0]);
  const exit = interpolate(frame, [70, 85], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.open} durationInFrames={85} vignetteOpacity={0.6}>
      <CenteredBlock offsetY={-40}>
        <div
          style={{
            opacity: Math.min(headlineOpacity, exit),
            transform: `translateY(${headlineY}px)`,
            textAlign: "center",
          }}
        >
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
            This isn't
            <br />
            a class.
          </div>
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 112,
              fontWeight: 700,
              color: COLORS.red,
              letterSpacing: -2,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
              marginTop: 16,
            }}
          >
            It's a<br />
            standard.
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat 3: VO "Strength & Conditioning — Coach Danny." ────────
const Beat3Danny: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const lineOpacity = interpolate(enter, [0, 1], [0, 1]);
  const lineY = interpolate(enter, [0, 1], [18, 0]);
  const exit = interpolate(frame, [70, 85], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameOpacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.danny} durationInFrames={85} vignetteOpacity={0.6}>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
          paddingBottom: SAFE.bottom + 60,
        }}
      >
        <div
          style={{
            opacity: exit,
            transform: `translateY(${lineY}px)`,
          }}
        >
          <div
            style={{
              opacity: lineOpacity,
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{ width: 40, height: 2, backgroundColor: COLORS.red }}
            />
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: 6,
                textTransform: "uppercase",
                textShadow: "0 2px 18px rgba(0,0,0,0.9)",
              }}
            >
              Strength &amp; Conditioning
            </div>
          </div>
          <div
            style={{
              opacity: lineOpacity,
              fontFamily: FONTS.headline,
              fontSize: 86,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textShadow: "0 6px 36px rgba(0,0,0,0.95)",
            }}
          >
            Coach Danny
          </div>
          <div
            style={{
              opacity: nameOpacity,
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 500,
              color: COLORS.red,
              letterSpacing: 3,
              marginTop: 10,
              textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            }}
          >
            @danielwilson78
          </div>
        </div>
      </AbsoluteFill>
    </VideoBeat>
  );
};

// ─── Beat 4: Fast-cut montage — "POWER · DISCIPLINE · ATHLETES" ─
const Beat4BuildTriptych: React.FC = () => {
  const frame = useCurrentFrame();
  // Three sub-cuts of ~28 frames each
  const getOpacity = (startF: number) => {
    const inP = interpolate(frame, [startF, startF + 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const outP = interpolate(frame, [startF + 22, startF + 30], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.min(inP, outP);
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Sub-cut 1: POWER (0–30) */}
      <div style={{ position: "absolute", inset: 0, opacity: getOpacity(0) }}>
        <VideoBeat clip={CLIPS.power} durationInFrames={85} vignetteOpacity={0.6}>
          <Word text="Power." color={COLORS.white} />
        </VideoBeat>
      </div>
      {/* Sub-cut 2: DISCIPLINE (28–58) */}
      <div style={{ position: "absolute", inset: 0, opacity: getOpacity(28) }}>
        <VideoBeat clip={CLIPS.discipline} durationInFrames={85} vignetteOpacity={0.6}>
          <Word text="Discipline." color={COLORS.red} />
        </VideoBeat>
      </div>
      {/* Sub-cut 3: ATHLETES (56–85) */}
      <div style={{ position: "absolute", inset: 0, opacity: getOpacity(56) }}>
        <VideoBeat clip={CLIPS.athletes} durationInFrames={85} vignetteOpacity={0.6}>
          <Word text="Athletes." color={COLORS.white} />
        </VideoBeat>
      </div>
    </AbsoluteFill>
  );
};

const Word: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <CenteredBlock>
    <div
      style={{
        fontFamily: FONTS.headline,
        fontSize: 148,
        fontWeight: 700,
        color,
        letterSpacing: -3,
        textTransform: "uppercase",
        textAlign: "center",
        textShadow: "0 6px 40px rgba(0,0,0,0.98)",
      }}
    >
      {text}
    </div>
  </CenteredBlock>
);

// ─── Beat 5: VO "Every rep. Every round. Earned." ──────────────
const Beat5Earned: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 4,
    fps,
    config: { damping: 180 },
    durationInFrames: 22,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const scale = interpolate(enter, [0, 1], [1.3, 1]);
  const exit = interpolate(frame, [90, 105], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const earnedOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.earned} durationInFrames={105} vignetteOpacity={0.7}>
      <CenteredBlock>
        <div style={{ opacity: exit, textAlign: "center", width: "100%" }}>
          <div
            style={{
              opacity,
              transform: `scale(${scale})`,
              fontFamily: FONTS.headline,
              fontSize: 108,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -2,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.98)",
            }}
          >
            Every rep.
            <br />
            Every round.
          </div>
          <div
            style={{
              opacity: earnedOpacity,
              fontFamily: FONTS.headline,
              fontSize: 136,
              fontWeight: 700,
              color: COLORS.red,
              letterSpacing: -3,
              marginTop: 24,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.98)",
            }}
          >
            Earned.
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat 6: VO "No fluff. No shortcuts. Just work." ────────────
const Beat6Work: React.FC = () => {
  const frame = useCurrentFrame();
  const lines = [
    { text: "No fluff.", delay: 4 },
    { text: "No shortcuts.", delay: 26 },
    { text: "Just work.", delay: 58 },
  ];
  const exit = interpolate(frame, [90, 105], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.grind} durationInFrames={105} vignetteOpacity={0.62}>
      <CenteredBlock>
        <div style={{ opacity: exit, textAlign: "center", width: "100%" }}>
          {lines.map((l, i) => {
            const lOpacity = interpolate(
              frame,
              [l.delay, l.delay + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const lY = interpolate(
              frame,
              [l.delay, l.delay + 10],
              [14, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  opacity: lOpacity,
                  transform: `translateY(${lY}px)`,
                  fontFamily: FONTS.headline,
                  fontSize: 96,
                  fontWeight: 700,
                  color: i === 2 ? COLORS.red : COLORS.white,
                  letterSpacing: -2,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  textShadow: "0 6px 40px rgba(0,0,0,0.95)",
                }}
              >
                {l.text}
              </div>
            );
          })}
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat 7: VO "Walk through the door. Train different." ──────
const Beat7Door: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [16, 0]);
  const exit = interpolate(frame, [78, 93], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondOpacity = interpolate(frame, [34, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.door} durationInFrames={93} vignetteOpacity={0.6}>
      <CenteredBlock>
        <div style={{ opacity: exit, textAlign: "center", width: "100%" }}>
          <div
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              fontFamily: FONTS.headline,
              fontSize: 88,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -1.5,
              lineHeight: 0.98,
              textTransform: "uppercase",
              textShadow: "0 6px 36px rgba(0,0,0,0.95)",
            }}
          >
            Walk through
            <br />
            the door.
          </div>
          <div
            style={{
              opacity: secondOpacity,
              fontFamily: FONTS.headline,
              fontSize: 108,
              fontWeight: 700,
              color: COLORS.red,
              letterSpacing: -2,
              marginTop: 22,
              textTransform: "uppercase",
              textShadow: "0 6px 36px rgba(0,0,0,0.98)",
            }}
          >
            Train different.
          </div>
        </div>
      </CenteredBlock>
    </VideoBeat>
  );
};

// ─── Beat 8: Climax — "DIFFERENT BREED" scramble ───────────────
const Beat8Climax: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [120, 132], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VideoBeat clip={CLIPS.climax} durationInFrames={132} vignetteOpacity={0.68}>
      <CenteredBlock>
        <div style={{ opacity: exit, textAlign: "center", width: "100%" }}>
          <TextScramble
            text={"DIFFERENT\nBREED"}
            startFrame={6}
            framesPerChar={2}
            fontSize={162}
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

// ─── Beat 9: End Card ──────────────────────────────────────────
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
    [0, 260]
  );

  const tagSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 200 },
    durationInFrames: 22,
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [18, 0]);

  const detailOpacity = interpolate(frame, [42, 60], [0, 1], {
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
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity }}>
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 600,
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 36,
            marginBottom: 28,
          }}
        />

        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 40,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: 5,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Strength &amp; Conditioning
        </div>

        <div
          style={{
            opacity: detailOpacity,
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            marginTop: 22,
            letterSpacing: 3,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          With Coach Danny · @danielwilson78
          <br />
          Teaneck, NJ · differentbreedsportsacademy.com
        </div>
      </div>

      {/* Bottom marquee — above IG caption safe line (y<1500) */}
      <AbsoluteFill
        style={{ justifyContent: "flex-end", paddingBottom: SAFE.bottom + 40 }}
      >
        <KineticMarquee
          text="STRENGTH & CONDITIONING   ·   COACH DANNY   ·   DIFFERENT BREED ELITE FITNESS   ·   TEANECK NJ"
          separator="   •   "
          speed={2.0}
          startFrame={20}
          fontSize={22}
          fontWeight={600}
          color="rgba(255,255,255,0.55)"
          separatorColor={COLORS.red}
          letterSpacing={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Persistent top-right watermark ────────────────────────────
const CornerWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [12, 30], [0, 0.55], {
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
        style={{ width: 52, height: 52 }}
      />
    </div>
  );
};

// ─── Main Composition ──────────────────────────────────────────
export const StrengthCondDanny30: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Beat 1: Slate (0–30) */}
      <Sequence from={0} durationInFrames={30}>
        <Beat1Slate />
      </Sequence>

      {/* Beat 2: "This isn't a class. It's a standard." (30–115) */}
      <Sequence from={30} durationInFrames={85}>
        <Beat2Standard />
      </Sequence>

      {/* Beat 3: "Strength & Conditioning — Coach Danny." (115–200) */}
      <Sequence from={115} durationInFrames={85}>
        <Beat3Danny />
      </Sequence>

      {/* Beat 4: Triptych "Power. Discipline. Athletes." (200–285) */}
      <Sequence from={200} durationInFrames={85}>
        <Beat4BuildTriptych />
      </Sequence>

      {/* Beat 5: "Every rep. Every round. Earned." (285–390) */}
      <Sequence from={285} durationInFrames={105}>
        <Beat5Earned />
      </Sequence>

      {/* Beat 6: "No fluff. No shortcuts. Just work." (390–495) */}
      <Sequence from={390} durationInFrames={105}>
        <Beat6Work />
      </Sequence>

      {/* Beat 7: "Walk through the door. Train different." (495–588) */}
      <Sequence from={495} durationInFrames={93}>
        <Beat7Door />
      </Sequence>

      {/* Beat 8: Climax — "DIFFERENT BREED" (588–720) */}
      <Sequence from={588} durationInFrames={132}>
        <Beat8Climax />
      </Sequence>

      {/* Beat 9: End card (720–900) */}
      <Sequence from={720} durationInFrames={180}>
        <EndCard />
      </Sequence>

      {/* Corner watermark — beats 2–8 */}
      <Sequence from={30} durationInFrames={690}>
        <CornerWatermark />
      </Sequence>

      {/* VO — starts at frame 30 */}
      <Sequence from={30}>
        <Audio src={staticFile("vo-danny-sc.mp3")} volume={1} />
      </Sequence>

      {/* Music bed — ducks under VO, swells at climax */}
      <Audio
        src={staticFile("music-we-major.mp3")}
        volume={(f) => {
          // Fade in (0–30), low under VO (30–588), swell (588–840), fade out (840–900)
          if (f < 30) return interpolate(f, [0, 30], [0, 0.45]);
          if (f < 588) return 0.18;
          if (f < 720) return interpolate(f, [588, 720], [0.18, 0.72]);
          if (f < 840) return 0.72;
          return interpolate(f, [840, 900], [0.72, 0]);
        }}
      />
    </AbsoluteFill>
  );
};
