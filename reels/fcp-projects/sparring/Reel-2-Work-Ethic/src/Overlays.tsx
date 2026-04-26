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

// Reel 2 VO starts at 10s in video time — word times are relative to VO start
const captionPhrases: CaptionPhrase[] = [
  {
    start: 0.0, end: 1.94,
    words: [
      { word: "Coach", start: 0.0, end: 0.26 },
      { word: "Dred", start: 0.26, end: 0.76 },
      { word: "doesn't", start: 0.76, end: 1.02 },
      { word: "just", start: 1.02, end: 1.18 },
      { word: "teach", start: 1.18, end: 1.50 },
      { word: "boxing,", start: 1.50, end: 1.94 },
    ],
  },
  {
    start: 2.50, end: 3.54,
    words: [
      { word: "he", start: 2.50, end: 2.60 },
      { word: "teaches", start: 2.60, end: 2.90 },
      { word: "work", start: 2.90, end: 3.22 },
      { word: "ethic,", start: 3.22, end: 3.54 },
    ],
  },
  {
    start: 4.04, end: 4.64,
    words: [
      { word: "discipline,", start: 4.04, end: 4.64 },
    ],
  },
  {
    start: 5.66, end: 6.64,
    words: [
      { word: "the", start: 5.66, end: 5.76 },
      { word: "Sweet", start: 5.76, end: 6.12 },
      { word: "Science,", start: 6.12, end: 6.64 },
    ],
  },
  {
    start: 7.20, end: 9.20,
    words: [
      { word: "every", start: 7.20, end: 7.58 },
      { word: "day", start: 7.58, end: 7.94 },
      { word: "at", start: 7.94, end: 8.44 },
      { word: "Different", start: 8.44, end: 8.82 },
      { word: "Breed.", start: 8.82, end: 9.20 },
    ],
  },
];

// VO offset in video time (Reel 2 VO starts at 8.2s)
const VO_OFFSET = 8.2;

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

  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const exitStart = duration - 8;
  const opacity =
    localFrame >= exitStart
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

  const fadeIn = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

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

      {/* 0-8.2s: Coach Dred opener — beat at 0.9s */}
      <TextOverlay
        text="The Sweet Science"
        subtext="Different Breed Elite Fitness"
        from={27}
        duration={s(4)}
        position="center"
        fontSize={56}
        subtextSize={30}
      />

      {/* 12-16s: During VO — beat at 12.15 */}
      <TextOverlay
        text="Put In The Work"
        subtext="Consistency Over Everything"
        from={365}
        duration={s(4)}
        position="bottom"
      />

      {/* 19-22s: After VO — beat at 19.21 */}
      <TextOverlay
        text="Every Level"
        subtext="Same Standard"
        from={576}
        duration={s(3.5)}
        position="bottom"
      />

      {/* 23-26s: Bag work — beat at 23.16 */}
      <TextOverlay
        text="Show Up"
        subtext="Earn It"
        from={695}
        duration={s(3)}
        position="bottom"
        fontSize={60}
      />

      {/* 27-30s: End tag — Evolve into Greatness over fade to black */}
      <EndTag from={s(27)} duration={s(3)} />
    </>
  );
};
