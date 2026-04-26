import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS, FONTS } from "../components/BrandStyles";

type CurtainRevealProps = {
  /** Frame when curtain starts opening */
  startFrame?: number;
  /** Frames to fully open */
  duration?: number;
  /** Content on left curtain panel */
  leftContent?: React.ReactNode;
  /** Content on right curtain panel */
  rightContent?: React.ReactNode;
  /** Background color of curtain panels */
  curtainColor?: string;
  /** Easing style */
  easing?: "power2" | "linear" | "bounce";
  /** Content revealed behind the curtain */
  children: React.ReactNode;
};

export const CurtainReveal: React.FC<CurtainRevealProps> = ({
  startFrame = 0,
  duration = 30,
  leftContent,
  rightContent,
  curtainColor = COLORS.black,
  easing = "power2",
  children,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  // Progress 0→1 over the duration
  const rawProgress = interpolate(elapsed, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Apply easing
  let progress: number;
  switch (easing) {
    case "bounce":
      progress = Easing.out(Easing.back(1.2))(rawProgress);
      break;
    case "linear":
      progress = rawProgress;
      break;
    default: // power2
      progress = Easing.inOut(Easing.ease)(rawProgress);
  }

  // Panels translate out: 0% → 100% of their width
  const leftX = interpolate(progress, [0, 1], [0, -100]);
  const rightX = interpolate(progress, [0, 1], [0, 100]);

  // Reveal content fades in as curtain opens
  const revealOpacity = interpolate(progress, [0.2, 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Revealed content (behind curtain) */}
      <AbsoluteFill style={{ opacity: revealOpacity }}>
        {children}
      </AbsoluteFill>

      {/* Left curtain panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "50%",
          backgroundColor: curtainColor,
          transform: `translateX(${leftX}%)`,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 40,
          borderRight: `1px solid ${COLORS.charcoal}`,
        }}
      >
        {leftContent || (
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 80,
              fontWeight: 700,
              color: COLORS.white,
              textTransform: "uppercase",
              letterSpacing: -2,
              textAlign: "right",
            }}
          >
            DIFFERENT
          </div>
        )}
      </div>

      {/* Right curtain panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "50%",
          backgroundColor: curtainColor,
          transform: `translateX(${rightX}%)`,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: 40,
          borderLeft: `1px solid ${COLORS.charcoal}`,
        }}
      >
        {rightContent || (
          <div
            style={{
              fontFamily: FONTS.headline,
              fontSize: 80,
              fontWeight: 700,
              color: COLORS.red,
              textTransform: "uppercase",
              letterSpacing: -2,
            }}
          >
            BREED
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
