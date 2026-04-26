import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { COLORS, FONTS, SAFE } from "./components/BrandStyles";
import {
  TextScramble,
  Typewriter,
  KineticMarquee,
} from "./cinematic-effects";

/*
 * ─── Core Control Saturdays — April 16 Announcement Reel ──────────────
 *
 * Duration: 450 frames @ 30fps = 15.0s
 *
 * Beat timeline:
 *   1. 0–50     (1.67s)  Empty studio — logo fade-in
 *   2. 50–135   (2.83s)  Solo action — TextScramble "POPULAR DEMAND"
 *   3. 135–220  (2.83s)  Packed class — Typewriter "NEW CORE CONTROL CLASS"
 *   4. 220–295  (2.50s)  Rings class — "SATURDAYS · 8:15 AM"
 *   5. 295–355  (2.00s)  Detail close — "STARTING MAY 2"
 *   6. 355–410  (1.83s)  Community — "LED BY @OHSONESSAA"
 *   7. 410–450  (1.33s)  Wide class + KineticMarquee closer
 *
 * VO: starts at frame 50, ~9.72s duration = ends around frame 342.
 * Music bed: 0.14 volume under VO.
 */

export const CORE_CONTROL_DURATION = 450;

// ─── Reusable Ken Burns photo with fade in/out ───────────────────
const PhotoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  objectPosition?: string;
  scaleFrom?: number;
  scaleTo?: number;
  filter?: string;
}> = ({
  src,
  durationInFrames,
  objectPosition = "center",
  scaleFrom = 1.05,
  scaleTo = 1.15,
  filter = "brightness(0.88) contrast(1.08) saturate(1.05)",
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [scaleFrom, scaleTo], {
    extrapolateRight: "clamp",
  });
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition,
          transform: `scale(${scale})`,
          opacity,
          filter,
        }}
      />
      {/* Vignette + bottom-darkening gradient for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.15) 100%)",
          opacity,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── DB logo watermark (top-right) ───────────────────────────────
const LogoMark: React.FC<{ fadeInFrom?: number }> = ({ fadeInFrom = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [fadeInFrom, fadeInFrom + 15], [0, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        right: SAFE.sides,
        opacity,
      }}
    >
      <Img
        src={staticFile("db-logo-red-outline.png")}
        style={{ width: 78, height: 78 }}
      />
    </div>
  );
};

// ─── Beat 1: Open — empty studio ─────────────────────────────────
const Beat1Open: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-01-studio.jpg"
        durationInFrames={50}
        scaleFrom={1.0}
        scaleTo={1.08}
      />
      <LogoMark fadeInFrom={8} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: SAFE.bottom + 60,
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: titleOpacity,
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          }}
        >
          Core Control · Pilates
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 2: Popular Demand reveal ───────────────────────────────
const Beat2Demand: React.FC = () => {
  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-02-solo-action.jpg"
        durationInFrames={85}
        objectPosition="center 30%"
        scaleFrom={1.08}
        scaleTo={1.18}
      />
      <LogoMark />

      {/* Red accent bar top */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 100,
          left: SAFE.sides,
          width: 120,
          height: 4,
          backgroundColor: COLORS.red,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingBottom: SAFE.bottom + 40,
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div style={{ maxWidth: 900 }}>
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 500,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 6,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Due to
          </div>
          <TextScramble
            text={"POPULAR\nDEMAND"}
            startFrame={5}
            framesPerChar={2}
            fontSize={140}
            fontWeight={700}
            color={COLORS.white}
            fontFamily={FONTS.headline}
            letterSpacing={-2}
            lineHeight={0.95}
            style={{
              textShadow: "0 6px 40px rgba(0,0,0,0.9)",
              textAlign: "left",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 3: New Core Control class announcement ─────────────────
const Beat3Announce: React.FC = () => {
  const frame = useCurrentFrame();
  const barWidth = interpolate(
    spring({ frame: frame - 5, fps: 30, config: { damping: 200 }, durationInFrames: 20 }),
    [0, 1],
    [0, 280]
  );

  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-03-packed-class.jpg"
        durationInFrames={85}
        objectPosition="center 40%"
        scaleFrom={1.02}
        scaleTo={1.12}
      />
      <LogoMark />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingBottom: SAFE.bottom + 60,
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div style={{ width: barWidth, height: 4, backgroundColor: COLORS.red, marginBottom: 24 }} />
        <Typewriter
          text={"NEW CORE\nCONTROL\nCLASS"}
          startFrame={8}
          framesPerChar={2}
          fontSize={108}
          fontWeight={700}
          color={COLORS.white}
          fontFamily={FONTS.headline}
          letterSpacing={-1}
          lineHeight={0.98}
          cursorColor={COLORS.red}
          style={{
            textShadow: "0 4px 30px rgba(0,0,0,0.9)",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 4: Saturdays 8:15 ──────────────────────────────────────
const Beat4Schedule: React.FC = () => {
  const frame = useCurrentFrame();
  const timeSpring = spring({
    frame: frame - 5,
    fps: 30,
    config: { damping: 180, mass: 0.7 },
    durationInFrames: 18,
  });
  const timeScale = interpolate(timeSpring, [0, 1], [1.4, 1]);
  const timeOpacity = interpolate(timeSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-04-rings-class.jpg"
        durationInFrames={75}
        objectPosition="center 45%"
        scaleFrom={1.05}
        scaleTo={1.15}
      />
      <LogoMark />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.red,
            letterSpacing: 10,
            textTransform: "uppercase",
            marginBottom: 14,
            opacity: timeOpacity,
            textShadow: "0 2px 16px rgba(0,0,0,0.9)",
          }}
        >
          Saturdays
        </div>
        <div
          style={{
            transform: `scale(${timeScale})`,
            opacity: timeOpacity,
            fontFamily: FONTS.headline,
            fontSize: 220,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -6,
            lineHeight: 1,
            textShadow: "0 8px 50px rgba(0,0,0,0.95)",
          }}
        >
          8:15
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.white,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginTop: 8,
            opacity: timeOpacity,
            textShadow: "0 2px 20px rgba(0,0,0,0.9)",
          }}
        >
          AM
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 5: Starting May 2 ──────────────────────────────────────
const Beat5Date: React.FC = () => {
  const frame = useCurrentFrame();
  const dateSpring = spring({
    frame: frame - 3,
    fps: 30,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const dateY = interpolate(dateSpring, [0, 1], [40, 0]);
  const dateOpacity = interpolate(dateSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-05-detail.jpg"
        durationInFrames={60}
        objectPosition="center 40%"
        scaleFrom={1.08}
        scaleTo={1.18}
      />
      <LogoMark />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-start",
          paddingBottom: SAFE.bottom + 80,
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div
          style={{
            transform: `translateY(${dateY}px)`,
            opacity: dateOpacity,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 24,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Starting
          </div>
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 140,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -3,
              lineHeight: 0.95,
              textShadow: "0 6px 40px rgba(0,0,0,0.95)",
            }}
          >
            MAY 2
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 6: Led by Nessa ────────────────────────────────────────
const Beat6Coach: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [3, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-06-community.jpg"
        durationInFrames={55}
        objectPosition="center 35%"
        scaleFrom={1.05}
        scaleTo={1.14}
      />
      <LogoMark />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: SAFE.bottom + 40,
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 10,
            textTransform: "uppercase",
            marginBottom: 18,
            opacity,
            textShadow: "0 2px 18px rgba(0,0,0,0.9)",
          }}
        >
          Led by
        </div>
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -1,
            lineHeight: 1,
            opacity,
            textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          }}
        >
          COACH NESSA
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.red,
            letterSpacing: 6,
            marginTop: 14,
            opacity,
            textShadow: "0 2px 16px rgba(0,0,0,0.9)",
          }}
        >
          @ohsonessaa
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 7: Close — wide class + marquee closer ─────────────────
const Beat7Close: React.FC = () => {
  const frame = useCurrentFrame();
  const tagOpacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <PhotoBeat
        src="cc-07-class-wide.jpg"
        durationInFrames={40}
        objectPosition="center 40%"
        scaleFrom={1.04}
        scaleTo={1.1}
        filter="brightness(0.78) contrast(1.1) saturate(1.05)"
      />
      <LogoMark />

      {/* Centered brand closer */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
        }}
      >
        <div
          style={{
            opacity: tagOpacity,
            fontFamily: FONTS.headline,
            fontSize: 104,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -2,
            lineHeight: 0.95,
            textAlign: "center",
            textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          }}
        >
          DIFFERENT
          <br />
          BREED
        </div>
        <div
          style={{
            opacity: tagOpacity,
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: 6,
            marginTop: 18,
            textTransform: "uppercase",
          }}
        >
          pilates.differentbreedsportsacademy.com
        </div>
      </AbsoluteFill>

      {/* Marquee strip at bottom */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          paddingBottom: SAFE.bottom - 20,
        }}
      >
        <KineticMarquee
          text="EVOLVE INTO GREATNESS   CORE CONTROL SATURDAYS   STARTING MAY 2"
          separator="   \u2022   "
          speed={2.2}
          startFrame={0}
          fontSize={28}
          fontWeight={600}
          color="rgba(255,255,255,0.7)"
          separatorColor={COLORS.red}
          letterSpacing={4}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Main Composition ────────────────────────────────────────────
export const CoreControlSaturdayApr16: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Beat 1: Open (0–50) */}
      <Sequence from={0} durationInFrames={50}>
        <Beat1Open />
      </Sequence>

      {/* Beat 2: Popular Demand (50–135) */}
      <Sequence from={50} durationInFrames={85}>
        <Beat2Demand />
      </Sequence>

      {/* Beat 3: Announce (135–220) */}
      <Sequence from={135} durationInFrames={85}>
        <Beat3Announce />
      </Sequence>

      {/* Beat 4: Saturdays 8:15 (220–295) */}
      <Sequence from={220} durationInFrames={75}>
        <Beat4Schedule />
      </Sequence>

      {/* Beat 5: May 2 (295–355) */}
      <Sequence from={295} durationInFrames={60}>
        <Beat5Date />
      </Sequence>

      {/* Beat 6: Coach Nessa (355–410) */}
      <Sequence from={355} durationInFrames={55}>
        <Beat6Coach />
      </Sequence>

      {/* Beat 7: Close (410–450) */}
      <Sequence from={410} durationInFrames={40}>
        <Beat7Close />
      </Sequence>

      {/* Voiceover — starts at 1.67s (frame 50) */}
      <Sequence from={50}>
        <Audio src={staticFile("vo-core-control-saturday.mp3")} volume={1} />
      </Sequence>

      {/* Music bed — full duration at low volume */}
      <Audio
        src={staticFile("music-touch-it.mp3")}
        volume={(f) =>
          interpolate(f, [0, 30, CORE_CONTROL_DURATION - 40, CORE_CONTROL_DURATION], [0, 0.14, 0.14, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </AbsoluteFill>
  );
};
