import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../components/BrandStyles";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

// Seeded random so each frame renders deterministically
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

type TextScrambleProps = {
  text: string;
  /** Frame (relative to Sequence) when scramble begins */
  startFrame?: number;
  /** Frames per character to resolve (lower = faster) */
  framesPerChar?: number;
  /** Scramble iterations per frame before resolving */
  scrambleSpeed?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  textAlign?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
};

export const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  startFrame = 0,
  framesPerChar = 3,
  scrambleSpeed = 1,
  fontSize = 72,
  color = COLORS.white,
  fontFamily = FONTS.headline,
  fontWeight = 700,
  letterSpacing = -1,
  textAlign = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  const chars = text.split("").map((char, i) => {
    // Whitespace and line breaks pass through
    if (char === " " || char === "\n") return char;

    // Frame at which this character resolves
    const resolveFrame = i * framesPerChar;

    if (elapsed >= resolveFrame) {
      return char; // Resolved
    }

    // Still scrambling — pick a random char based on frame + position
    const seed = elapsed * scrambleSpeed * 100 + i * 37;
    const randomIndex = Math.floor(
      seededRandom(seed) * SCRAMBLE_CHARS.length
    );
    return SCRAMBLE_CHARS[randomIndex];
  });

  // Fade in at the start
  const opacity = interpolate(elapsed, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        textTransform: "uppercase",
        textAlign,
        letterSpacing,
        lineHeight: 1.1,
        whiteSpace: "pre-wrap",
        opacity,
        ...style,
      }}
    >
      {chars.join("")}
    </div>
  );
};
