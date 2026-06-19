import React from "react";
import { Img, staticFile, useCurrentFrame, spring, useVideoConfig } from "remotion";

// The DBEF circular knockout seal, stamped at -8deg with a quick spring
// overshoot. Treats motion as the print equivalent of a stamp landing.

type Props = {
  size?: number;
  variant?: "black" | "white";
  startFrame?: number;
  rotation?: number;
};

export const KnockoutSeal: React.FC<Props> = ({
  size = 220,
  variant = "white",
  startFrame = 0,
  rotation = -8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - startFrame);

  const stamp = spring({
    frame: local,
    fps,
    config: { damping: 12, mass: 0.7, stiffness: 220 },
    durationInFrames: 18,
  });
  const scale = 0.6 + stamp * 0.4;
  const rot = rotation * (0.4 + stamp * 0.6);
  const opacity = stamp;

  const src =
    variant === "black"
      ? "/design-system/seal-black.png"
      : "/design-system/seal-white.png";

  return (
    <Img
      src={staticFile(src)}
      style={{
        width: size,
        height: size,
        transform: `scale(${scale}) rotate(${rot}deg)`,
        opacity,
      }}
    />
  );
};
