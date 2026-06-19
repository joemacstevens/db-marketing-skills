import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { DBS_COLORS } from "../tokens";

// A row of 5 alternating red/black stars sweeping across the safe-area band
// between sections. Doubles as a section divider and an outgoing transition.

type Props = {
  startFrame?: number;
  durationFrames?: number;
  colorA?: string;
  colorB?: string;
  starSize?: number;
  count?: number;
  /** Total horizontal span of the arc as a percentage of the parent. */
  spreadPct?: number;
};

const Star: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: "block" }}
  >
    <polygon points="12,2 14.6,8.6 21.6,9.2 16.4,13.9 18.1,21 12,17.2 5.9,21 7.6,13.9 2.4,9.2 9.4,8.6" />
  </svg>
);

export const StarArcDivider: React.FC<Props> = ({
  startFrame = 0,
  durationFrames = 18,
  colorA = DBS_COLORS.red500,
  colorB = DBS_COLORS.ink,
  starSize = 56,
  count = 5,
  spreadPct = 70,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const ease = Easing.bezier(0.2, 0.7, 0.2, 1);

  const stars = Array.from({ length: count }, (_, i) => {
    const enter = interpolate(local, [i * 2, i * 2 + 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });
    const exit = interpolate(
      local,
      [durationFrames - 10 + i, durationFrames + i],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const opacity = Math.min(enter, exit);
    const lift = interpolate(local, [i * 2, i * 2 + 10], [12, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    });
    return (
      <div
        key={i}
        style={{
          opacity,
          transform: `translateY(${lift}px)`,
        }}
      >
        <Star size={starSize} color={i % 2 === 0 ? colorA : colorB} />
      </div>
    );
  });

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: `${spreadPct}%`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {stars}
      </div>
    </div>
  );
};
