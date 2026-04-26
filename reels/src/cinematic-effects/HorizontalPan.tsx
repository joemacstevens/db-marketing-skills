import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS } from "../components/BrandStyles";

type HorizontalPanProps = {
  /** Frame when panning starts */
  startFrame?: number;
  /** Duration of the full pan */
  duration?: number;
  /** Easing for the pan motion */
  easing?: "linear" | "easeInOut" | "easeOut";
  /** Background color */
  backgroundColor?: string;
  /** The horizontally-laid-out content to pan across */
  children: React.ReactNode;
  /** Total width of the content strip in pixels */
  contentWidth?: number;
};

export const HorizontalPan: React.FC<HorizontalPanProps> = ({
  startFrame = 0,
  duration = 90,
  easing = "easeInOut",
  backgroundColor = COLORS.black,
  children,
  contentWidth = 4000,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // Raw progress 0→1
  let progress = interpolate(elapsed, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Apply easing
  switch (easing) {
    case "easeInOut":
      progress = Easing.inOut(Easing.ease)(progress);
      break;
    case "easeOut":
      progress = Easing.out(Easing.ease)(progress);
      break;
  }

  // Translate the strip: from 0 to -(contentWidth - viewport)
  // Viewport width is 1080 for reels
  const maxOffset = contentWidth - 1080;
  const translateX = -progress * maxOffset;

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            transform: `translateX(${translateX}px)`,
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
