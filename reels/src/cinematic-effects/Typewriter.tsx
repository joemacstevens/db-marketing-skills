import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../components/BrandStyles";

type TypewriterProps = {
  text: string;
  /** Frame when typing starts (relative to Sequence) */
  startFrame?: number;
  /** Frames between each character */
  framesPerChar?: number;
  /** Show blinking cursor */
  showCursor?: boolean;
  /** Cursor blink rate in frames */
  cursorBlinkRate?: number;
  fontSize?: number;
  color?: string;
  cursorColor?: string;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
};

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  startFrame = 0,
  framesPerChar = 2,
  showCursor = true,
  cursorBlinkRate = 16,
  fontSize = 48,
  color = COLORS.white,
  cursorColor = COLORS.red,
  fontFamily = FONTS.headline,
  fontWeight = 600,
  letterSpacing = 1,
  lineHeight = 1.3,
  textAlign = "center",
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // How many characters to show
  const charCount = Math.min(
    Math.floor(elapsed / framesPerChar),
    text.length
  );

  const visibleText = text.slice(0, charCount);
  const isComplete = charCount >= text.length;

  // Cursor blinks after typing is complete
  const cursorOpacity = isComplete
    ? Math.floor(elapsed / cursorBlinkRate) % 2 === 0
      ? 1
      : 0
    : 1; // Solid while typing

  // Fade in
  const opacity = interpolate(elapsed, [0, 4], [0, 1], {
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
        lineHeight,
        whiteSpace: "pre-wrap",
        opacity,
        ...style,
      }}
    >
      {visibleText}
      {showCursor && (
        <span
          style={{
            color: cursorColor,
            opacity: cursorOpacity,
            fontWeight: 400,
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
