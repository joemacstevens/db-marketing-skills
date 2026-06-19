import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { DBS_COLORS, DBS_SHADOW_PRESS } from "../tokens";

// Bone-on-black or paper-on-bone card with the 4px hard offset shadow.
// The brand's only shadow. Card slides up 12px on entry; the shadow lags 4f.

type Variant = "bone-on-ink" | "paper-on-bone" | "red-on-bone";

type Props = {
  children: React.ReactNode;
  width?: number | string;
  padding?: number | string;
  startFrame?: number;
  variant?: Variant;
  shadow?: string;
  borderColor?: string;
  borderWidth?: number;
  style?: React.CSSProperties;
};

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  "bone-on-ink": {
    bg: DBS_COLORS.bone,
    fg: DBS_COLORS.ink,
    border: DBS_COLORS.ink,
  },
  "paper-on-bone": {
    bg: DBS_COLORS.paper,
    fg: DBS_COLORS.ink,
    border: DBS_COLORS.ink,
  },
  "red-on-bone": {
    bg: DBS_COLORS.red500,
    fg: DBS_COLORS.paper,
    border: DBS_COLORS.ink,
  },
};

export const PressTile: React.FC<Props> = ({
  children,
  width = "100%",
  padding = 48,
  startFrame = 0,
  variant = "bone-on-ink",
  shadow = DBS_SHADOW_PRESS,
  borderColor,
  borderWidth = 3,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const ease = Easing.bezier(0.2, 0.9, 0.1, 1.1);
  const slide = interpolate(local, [0, 14], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const opacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const v = VARIANTS[variant];

  return (
    <div
      style={{
        width,
        background: v.bg,
        color: v.fg,
        border: `${borderWidth}px solid ${borderColor ?? v.border}`,
        boxShadow: shadow,
        padding,
        transform: `translateY(${slide}px)`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
