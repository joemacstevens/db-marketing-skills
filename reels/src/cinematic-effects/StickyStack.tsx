import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";

type StickyStackProps = {
  /** The foreground element that stays pinned (e.g., a coach quote overlay) */
  foreground: React.ReactNode;
  /** Array of background scenes that cross-dissolve behind the foreground */
  backgrounds: React.ReactNode[];
  /** Frame when the sequence starts */
  startFrame?: number;
  /** Frames each background is visible */
  holdDuration?: number;
  /** Frames for the cross-dissolve transition between backgrounds */
  transitionDuration?: number;
};

export const StickyStack: React.FC<StickyStackProps> = ({
  foreground,
  backgrounds,
  startFrame = 0,
  holdDuration = 60,
  transitionDuration = 15,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  // Total duration per background: hold + transition
  const cycleDuration = holdDuration + transitionDuration;

  return (
    <AbsoluteFill>
      {/* Background layers — cross-dissolve */}
      {backgrounds.map((bg, i) => {
        const bgStart = i * cycleDuration;
        const bgEnd = bgStart + holdDuration + transitionDuration;
        const localFrame = elapsed - bgStart;

        // Fade in
        const fadeIn =
          i === 0
            ? 1
            : interpolate(localFrame, [0, transitionDuration], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

        // Fade out (during transition to next)
        const fadeOutStart = holdDuration;
        const fadeOut =
          i === backgrounds.length - 1
            ? 1
            : interpolate(
                localFrame,
                [fadeOutStart, fadeOutStart + transitionDuration],
                [1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }
              );

        // Only render if we're within range
        if (elapsed < bgStart - transitionDuration || elapsed > bgEnd + transitionDuration) {
          return null;
        }

        const opacity = Math.min(fadeIn, fadeOut);

        return (
          <AbsoluteFill key={i} style={{ opacity, zIndex: i }}>
            {bg}
          </AbsoluteFill>
        );
      })}

      {/* Foreground — always on top */}
      <AbsoluteFill style={{ zIndex: backgrounds.length + 1 }}>
        {foreground}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
