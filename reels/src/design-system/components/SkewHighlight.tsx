import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { DBS_COLORS } from "../tokens";

// The brand's signature: a red ink-stripe slides in behind a single word,
// skewed -6deg, with the word un-skewed inside (so the type stays upright).

type Props = {
  children: React.ReactNode;
  /** Frame at which the wipe begins (relative to the parent Sequence). */
  startFrame?: number;
  /** Wipe duration in frames. */
  durationFrames?: number;
  /** Background color of the highlight stripe. Defaults to brand red. */
  color?: string;
  /** Color of the text inside the stripe. Defaults to paper white. */
  textColor?: string;
  /** Padding around the word. */
  padX?: string;
};

export const SkewHighlight: React.FC<Props> = ({
  children,
  startFrame = 0,
  durationFrames = 8,
  color = DBS_COLORS.red500,
  textColor = DBS_COLORS.paper,
  padX = "0.18em",
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const wipe = interpolate(local, [0, durationFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        transform: "skewX(-6deg)",
        padding: `0 ${padX}`,
        color: wipe > 6 ? textColor : DBS_COLORS.ink,
        transition: "color 0.001s",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: color,
          width: `${wipe}%`,
          // The wipe expands from the leading edge.
        }}
      />
      <span
        style={{
          position: "relative",
          display: "inline-block",
          transform: "skewX(6deg)",
        }}
      >
        {children}
      </span>
    </span>
  );
};
