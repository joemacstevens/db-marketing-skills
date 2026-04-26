import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../components/BrandStyles";

type KineticMarqueeProps = {
  text: string;
  /** Separator between repeated text */
  separator?: string;
  /** Pixels per frame of movement */
  speed?: number;
  /** Direction of scroll */
  direction?: "left" | "right";
  /** Frame when marquee starts moving */
  startFrame?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: number;
  /** Optional accent color for separator dots */
  separatorColor?: string;
  style?: React.CSSProperties;
};

export const KineticMarquee: React.FC<KineticMarqueeProps> = ({
  text,
  separator = " \u2022 ",
  speed = 2,
  direction = "left",
  startFrame = 0,
  fontSize = 36,
  color = COLORS.white,
  fontFamily = FONTS.headline,
  fontWeight = 600,
  letterSpacing = 3,
  separatorColor = COLORS.red,
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // Build repeated strip — enough copies to fill 3x viewport width
  const fullText = `${text}${separator}`;
  const repetitions = 6;
  const strip = Array(repetitions).fill(null);

  // Calculate offset — loops continuously
  const dirMultiplier = direction === "left" ? -1 : 1;
  const offset = elapsed * speed * dirMultiplier;

  // Fade in
  const opacity = interpolate(elapsed, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          transform: `translateX(${offset}px)`,
          willChange: "transform",
        }}
      >
        {strip.map((_, i) => (
          <span
            key={i}
            style={{
              fontFamily,
              fontSize,
              fontWeight,
              color,
              textTransform: "uppercase",
              letterSpacing,
              flexShrink: 0,
            }}
          >
            {text}
            <span style={{ color: separatorColor }}>{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
