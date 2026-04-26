import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../components/BrandStyles";

type SplitScreenProps = {
  /** Content for the left half */
  left: React.ReactNode;
  /** Content for the right half */
  right: React.ReactNode;
  /** Split direction */
  direction?: "vertical" | "horizontal";
  /** Frame when the split animation starts */
  startFrame?: number;
  /** Duration of the split entrance animation */
  entranceDuration?: number;
  /** Divider line color */
  dividerColor?: string;
  /** Divider line width */
  dividerWidth?: number;
  /** Gap between halves (0 for no gap) */
  gap?: number;
};

export const SplitScreen: React.FC<SplitScreenProps> = ({
  left,
  right,
  direction = "vertical",
  startFrame = 0,
  entranceDuration = 20,
  dividerColor = COLORS.red,
  dividerWidth = 3,
  gap = 0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // Entrance: halves slide in from opposite sides
  const entranceProgress = interpolate(elapsed, [0, entranceDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isVertical = direction === "vertical";

  // Left/top slides in from left/top
  const leftOffset = interpolate(entranceProgress, [0, 1], [isVertical ? -100 : -100, 0]);
  // Right/bottom slides in from right/bottom
  const rightOffset = interpolate(entranceProgress, [0, 1], [isVertical ? 100 : 100, 0]);

  // Divider grows in
  const dividerScale = interpolate(entranceProgress, [0.3, 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Left / Top half */}
      <div
        style={{
          position: "absolute",
          ...(isVertical
            ? { top: 0, left: 0, bottom: 0, width: `calc(50% - ${gap / 2}px)` }
            : { top: 0, left: 0, right: 0, height: `calc(50% - ${gap / 2}px)` }),
          overflow: "hidden",
          transform: isVertical
            ? `translateX(${leftOffset}%)`
            : `translateY(${leftOffset}%)`,
        }}
      >
        <AbsoluteFill>{left}</AbsoluteFill>
      </div>

      {/* Right / Bottom half */}
      <div
        style={{
          position: "absolute",
          ...(isVertical
            ? { top: 0, right: 0, bottom: 0, width: `calc(50% - ${gap / 2}px)` }
            : { bottom: 0, left: 0, right: 0, height: `calc(50% - ${gap / 2}px)` }),
          overflow: "hidden",
          transform: isVertical
            ? `translateX(${rightOffset}%)`
            : `translateY(${rightOffset}%)`,
        }}
      >
        <AbsoluteFill>{right}</AbsoluteFill>
      </div>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          ...(isVertical
            ? {
                top: 0,
                bottom: 0,
                left: "50%",
                width: dividerWidth,
                marginLeft: -dividerWidth / 2,
                transform: `scaleY(${dividerScale})`,
              }
            : {
                left: 0,
                right: 0,
                top: "50%",
                height: dividerWidth,
                marginTop: -dividerWidth / 2,
                transform: `scaleX(${dividerScale})`,
              }),
          backgroundColor: dividerColor,
          zIndex: 3,
          transformOrigin: "center center",
        }}
      />
    </AbsoluteFill>
  );
};
