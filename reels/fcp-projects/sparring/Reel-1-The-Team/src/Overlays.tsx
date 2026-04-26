import React from "react";
import {
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS = 30;
const s = (seconds: number) => Math.round(seconds * FPS);

// ─── TikTok-style captions ───
type CaptionWord = { word: string; start: number; end: number };
type CaptionPhrase = { words: CaptionWord[]; start: number; end: number };

// Reel 1 VO starts at frame 0 — word times are absolute seconds
const captionPhrases: CaptionPhrase[] = [
  {
    start: 0.0, end: 1.60,
    words: [
      { word: "This", start: 0.0, end: 0.38 },
      { word: "is", start: 0.38, end: 0.70 },
      { word: "Different", start: 0.70, end: 1.00 },
      { word: "Breed.", start: 1.00, end: 1.60 },
    ],
  },
  {
    start: 2.54, end: 5.02,
    words: [
      { word: "The", start: 2.54, end: 2.92 },
      { word: "Sweet", start: 2.92, end: 3.22 },
      { word: "Science", start: 3.22, end: 3.64 },
      { word: "runs", start: 3.64, end: 4.00 },
      { word: "every", start: 4.00, end: 4.42 },
      { word: "single", start: 4.42, end: 4.70 },
      { word: "day.", start: 4.70, end: 5.02 },
    ],
  },
  {
    start: 5.56, end: 6.48,
    words: [
      { word: "No", start: 5.56, end: 5.66 },
      { word: "experience", start: 5.66, end: 6.00 },
      { word: "needed.", start: 6.00, end: 6.48 },
    ],
  },
  {
    start: 6.84, end: 7.98,
    words: [
      { word: "Just", start: 6.84, end: 6.98 },
      { word: "show", start: 6.98, end: 7.20 },
      { word: "up", start: 7.20, end: 7.36 },
      { word: "ready", start: 7.36, end: 7.58 },
      { word: "to", start: 7.58, end: 7.74 },
      { word: "work.", start: 7.74, end: 7.98 },
    ],
  },
  {
    start: 8.84, end: 10.98,
    words: [
      { word: "Learn", start: 8.84, end: 9.04 },
      { word: "real", start: 9.04, end: 9.34 },
      { word: "technique,", start: 9.34, end: 9.72 },
      { word: "real", start: 10.22, end: 10.46 },
      { word: "combinations.", start: 10.46, end: 10.98 },
    ],
  },
  {
    start: 11.64, end: 13.52,
    words: [
      { word: "Footwork,", start: 11.64, end: 12.08 },
      { word: "head", start: 12.42, end: 12.62 },
      { word: "movement,", start: 12.62, end: 12.86 },
      { word: "power.", start: 13.24, end: 13.52 },
    ],
  },
  {
    start: 14.32, end: 15.48,
    words: [
      { word: "From", start: 14.32, end: 14.44 },
      { word: "beginners", start: 14.44, end: 14.80 },
      { word: "to", start: 14.80, end: 15.00 },
      { word: "competitors,", start: 15.00, end: 15.48 },
    ],
  },
  {
    start: 16.10, end: 17.22,
    words: [
      { word: "everyone's", start: 16.10, end: 16.58 },
      { word: "in", start: 16.58, end: 16.66 },
      { word: "here", start: 16.66, end: 16.82 },
      { word: "grinding.", start: 16.82, end: 17.22 },
    ],
  },
  {
    start: 18.06, end: 19.26,
    words: [
      { word: "Coach", start: 18.06, end: 18.44 },
      { word: "Dred", start: 18.44, end: 18.84 },
      { word: "and", start: 18.84, end: 18.90 },
      { word: "the", start: 18.90, end: 19.00 },
      { word: "team", start: 19.00, end: 19.26 },
    ],
  },
  {
    start: 19.26, end: 21.62,
    words: [
      { word: "will", start: 19.26, end: 19.46 },
      { word: "push", start: 19.46, end: 19.76 },
      { word: "you", start: 19.76, end: 19.92 },
      { word: "to", start: 19.92, end: 20.06 },
      { word: "levels", start: 20.06, end: 20.34 },
      { word: "you", start: 20.34, end: 20.62 },
      { word: "didn't", start: 20.62, end: 21.02 },
      { word: "know", start: 21.02, end: 21.20 },
      { word: "you", start: 21.20, end: 21.38 },
      { word: "had.", start: 21.38, end: 21.62 },
    ],
  },
];

// VO offset in video time (Reel 1 VO starts at 0s)
const VO_OFFSET = 0;

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const currentTime = frame / FPS;

  // Find the active phrase
  const activePhrase = captionPhrases.find(
    (p) => currentTime >= p.start + VO_OFFSET && currentTime <= p.end + VO_OFFSET + 0.15
  );

  if (!activePhrase) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        top: "55%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px 10px",
        zIndex: 25,
      }}
    >
      {activePhrase.words.map((w, i) => {
        const wordTime = w.start + VO_OFFSET;
        const isActive = currentTime >= wordTime && currentTime < w.end + VO_OFFSET + 0.08;
        const isPast = currentTime >= w.end + VO_OFFSET + 0.08;

        return (
          <span
            key={i}
            style={{
              fontFamily: "Nord, sans-serif",
              fontWeight: 700,
              fontSize: 58,
              color: isActive ? "#E63946" : isPast ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: 1,
              transform: isActive ? "scale(1.12)" : "scale(1)",
              transition: "transform 0.05s",
              textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0px 30px rgba(0,0,0,0.6)",
              lineHeight: 1.3,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

// ─── Font face injection ───
const fontFace = `
@font-face {
  font-family: 'Nord';
  src: url('${staticFile("brand/NORD-Bold.woff2")}') format('woff2');
  font-weight: 700;
}
@font-face {
  font-family: 'Nord';
  src: url('${staticFile("brand/NORD-Medium.woff2")}') format('woff2');
  font-weight: 500;
}
`;

// ─── Animated text block ───
const TextOverlay: React.FC<{
  text: string;
  subtext?: string;
  from: number;
  duration: number;
  position?: "center" | "bottom" | "top";
  fontSize?: number;
  subtextSize?: number;
}> = ({
  text,
  subtext,
  from,
  duration,
  position = "bottom",
  fontSize = 52,
  subtextSize = 32,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - from;
  if (localFrame < 0 || localFrame >= duration) return null;

  // Entrance spring
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Exit fade (last 8 frames)
  const exitStart = duration - 8;
  const opacity = localFrame >= exitStart
    ? interpolate(localFrame, [exitStart, duration], [1, 0], {
        extrapolateRight: "clamp",
      })
    : 1;

  const translateY = interpolate(entrance, [0, 1], [40, 0]);

  const positionStyle: React.CSSProperties =
    position === "center"
      ? { top: "50%", transform: `translateY(calc(-50% + ${translateY}px))` }
      : position === "top"
        ? { top: 120, transform: `translateY(${translateY}px)` }
        : { bottom: 180, transform: `translateY(${translateY}px)` };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: opacity * entrance,
        ...positionStyle,
        zIndex: 10,
      }}
    >
      {/* Text shadow / glow background */}
      <div
        style={{
          padding: "16px 40px",
          borderRadius: 8,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "Nord, sans-serif",
            fontWeight: 700,
            fontSize,
            color: "#FFFFFF",
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 1.2,
          }}
        >
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: "Nord, sans-serif",
              fontWeight: 500,
              fontSize: subtextSize,
              color: "#E63946",
              letterSpacing: 1,
              marginTop: 8,
              textTransform: "uppercase",
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Logo watermark ───
const LogoWatermark: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over first second
  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  // Fade out in last 3 seconds (for CTA takeover)
  const fadeOutStart = durationInFrames - s(3);
  const fadeOut =
    frame >= fadeOutStart
      ? interpolate(frame, [fadeOutStart, fadeOutStart + s(0.5)], [1, 0], {
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 40,
        opacity: fadeIn * fadeOut * 0.85,
        zIndex: 5,
      }}
    >
      <Img
        src={staticFile("brand/DB-logo@3x.png")}
        style={{ width: 80, height: "auto" }}
      />
    </div>
  );
};

// ─── End tag: Evolve into Greatness logo over fade-to-black ───
const EndTag: React.FC<{ from: number; duration: number }> = ({
  from,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - from;
  if (localFrame < 0 || localFrame >= duration) return null;

  // Video fades to black over the full duration
  const blackOpacity = interpolate(localFrame, [0, duration * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Logo fades in quickly (first ~15 frames) and stays
  const logoEntrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <>
      {/* Black overlay that fades in over the video */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity: blackOpacity,
          zIndex: 15,
        }}
      />
      {/* Evolve into Greatness logo — stays visible over black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: logoEntrance,
          zIndex: 20,
        }}
      >
        <Img
          src={staticFile("brand/Evolve-into-greatness-DB-white-red@3x.png")}
          style={{ width: 600, height: "auto" }}
        />
      </div>
    </>
  );
};

// ─── Main overlay composition ───
export const Overlays: React.FC = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontFace }} />

      <LogoWatermark />
      <Captions />

      {/* 0-3.5s: Title card — beat at 0.64s */}
      <TextOverlay
        text="Different Breed"
        subtext="Elite Fitness"
        from={19}
        duration={s(2.8)}
        position="center"
        fontSize={64}
        subtextSize={36}
      />

      {/* 3.5-8.84s: Class intro — beat at 3.82 */}
      <TextOverlay
        text="The Sweet Science"
        subtext="Boxing. Every Day."
        from={115}
        duration={s(4.5)}
        position="bottom"
      />

      {/* 14.52-20.22s: Highlight the vibe — beat at 14.52 */}
      <TextOverlay
        text="All Levels Welcome"
        subtext="Real Coaching. Real Work."
        from={436}
        duration={s(5)}
        position="bottom"
      />

      {/* 22-25.95s: Coach Dred — after VO ends */}
      <TextOverlay
        text="Coach Dred's Team"
        subtext="Show Up. Put In The Work."
        from={s(22)}
        duration={s(3.5)}
        position="bottom"
      />

      {/* 27-30s: End tag — Evolve into Greatness over fade to black */}
      <EndTag from={s(27)} duration={s(3)} />
    </>
  );
};
