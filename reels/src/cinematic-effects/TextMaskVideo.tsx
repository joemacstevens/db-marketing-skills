import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { COLORS, FONTS } from "../components/BrandStyles";

type TextMaskVideoProps = {
  /** Text to display (video plays inside the letterforms) */
  text: string;
  /** Video source file (in public/) */
  videoSrc: string;
  /** Frame when the filled text reveals over the outlined text */
  revealStartFrame?: number;
  /** Duration of the reveal animation */
  revealDuration?: number;
  /** Direction the reveal clip-path moves */
  revealDirection?: "up" | "down" | "left" | "right";
  /** Video start time in seconds */
  videoStartFrom?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  /** Color of the outlined (pre-reveal) text */
  outlineColor?: string;
  /** Background color of the overlay */
  backgroundColor?: string;
};

export const TextMaskVideo: React.FC<TextMaskVideoProps> = ({
  text,
  videoSrc,
  revealStartFrame = 0,
  revealDuration = 30,
  revealDirection = "up",
  videoStartFrom = 0,
  fontSize = 180,
  fontFamily = FONTS.headline,
  fontWeight = 800,
  letterSpacing = -4,
  outlineColor = "rgba(255, 255, 255, 0.12)",
  backgroundColor = COLORS.black,
}) => {
  const frame = useCurrentFrame();

  // Reveal progress
  const revealElapsed = frame - revealStartFrame;
  const revealProgress = interpolate(revealElapsed, [0, revealDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Clip-path based on direction
  let clipPath: string;
  switch (revealDirection) {
    case "down":
      clipPath = `inset(0 0 ${(1 - revealProgress) * 100}% 0)`;
      break;
    case "left":
      clipPath = `inset(0 0 0 ${(1 - revealProgress) * 100}%)`;
      break;
    case "right":
      clipPath = `inset(0 ${(1 - revealProgress) * 100}% 0 0)`;
      break;
    default: // up
      clipPath = `inset(${(1 - revealProgress) * 100}% 0 0 0)`;
  }

  const textStyle: React.CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight: 0.9,
    textAlign: "center",
    textTransform: "uppercase",
    whiteSpace: "pre-wrap",
  };

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {/* Video layer — plays behind everything */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(videoSrc)}
          startFrom={Math.round(videoStartFrom * 30)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.7,
          }}
        />
      </AbsoluteFill>

      {/* Outlined text layer (visible before reveal) */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
        }}
      >
        <div
          style={{
            ...textStyle,
            color: "transparent",
            WebkitTextStroke: `2px ${outlineColor}`,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>

      {/* Filled text layer — video shows through text via background-clip */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          clipPath,
        }}
      >
        <div
          style={{
            ...textStyle,
            color: "transparent",
            backgroundImage: `url(${staticFile(videoSrc)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {text}
        </div>

        {/* Fallback: gradient fill if video-in-text doesn't render */}
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mixBlendMode: "screen",
          }}
        >
          <div
            style={{
              ...textStyle,
              background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.gold || "#D4A843"}, ${COLORS.red})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {text}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
