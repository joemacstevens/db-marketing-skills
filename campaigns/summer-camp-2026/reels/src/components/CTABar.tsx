import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./BrandStyles";

// CTA bar sits ABOVE the IG bottom overlay (21% = ~403px)
// Position it so the bottom of the bar is at ~420px from bottom
const BAR_BOTTOM = 420;

export const CTABar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide up after 0.5s
  const enterSpring = spring({
    frame: frame - Math.round(fps * 0.5),
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const translateY = interpolate(enterSpring, [0, 1], [80, 0]);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: BAR_BOTTOM,
        left: 0,
        right: 0,
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex: 100,
      }}
    >
      {/* Red accent line */}
      <div
        style={{
          height: 3,
          backgroundColor: COLORS.red,
          width: "100%",
        }}
      />

      {/* CTA bar */}
      <div
        style={{
          backgroundColor: "rgba(14, 14, 14, 0.92)",
          padding: "16px 40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          Register Your Child Today
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 18,
            fontWeight: 500,
            color: COLORS.red,
            letterSpacing: 0.5,
          }}
        >
          summer.differentbreedsportsacademy.com
        </div>
      </div>
    </div>
  );
};
