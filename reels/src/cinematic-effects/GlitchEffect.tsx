import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../components/BrandStyles";

// Seeded random for deterministic frame-by-frame rendering
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

type GlitchEffectProps = {
  /** Frame when the glitch burst starts (relative to Sequence) */
  startFrame?: number;
  /** How many frames the glitch lasts */
  duration?: number;
  /** Glitch intensity 0-1 (controls offset magnitude) */
  intensity?: number;
  /** Color for the top/left RGB channel */
  colorA?: string;
  /** Color for the bottom/right RGB channel */
  colorB?: string;
  children: React.ReactNode;
};

export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  startFrame = 0,
  duration = 12,
  intensity = 1,
  colorA = "#00f0ff", // cyan
  colorB = COLORS.red,
  children,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  // Not active yet or already done
  if (elapsed < 0 || elapsed >= duration) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // Glitch envelope: ramp up then taper
  const envelope = interpolate(
    elapsed,
    [0, duration * 0.3, duration * 0.7, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const maxOffset = 12 * intensity * envelope;
  const seed = elapsed * 137;

  // Top channel: offset left, clip top portion
  const topOffsetX = (seededRandom(seed) - 0.5) * 2 * maxOffset;
  const topOffsetY = (seededRandom(seed + 1) - 0.5) * 2 * maxOffset * 0.5;
  const topClipBottom = 40 + seededRandom(seed + 2) * 40; // clip 40-80% from bottom

  // Bottom channel: offset right, clip bottom portion
  const botOffsetX = (seededRandom(seed + 3) - 0.5) * 2 * maxOffset;
  const botOffsetY = (seededRandom(seed + 4) - 0.5) * 2 * maxOffset * 0.5;
  const botClipTop = 40 + seededRandom(seed + 5) * 40; // clip 40-80% from top

  // Flash on the first 2 frames
  const flashOpacity =
    elapsed <= 1
      ? interpolate(elapsed, [0, 1], [0.3 * intensity, 0], {
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill>
      {/* Base layer (always visible) */}
      {children}

      {/* Top RGB channel */}
      <AbsoluteFill
        style={{
          transform: `translate(${topOffsetX}px, ${topOffsetY}px)`,
          clipPath: `inset(0 0 ${topClipBottom}% 0)`,
          mixBlendMode: "screen",
          opacity: 0.7 * envelope,
        }}
      >
        <AbsoluteFill style={{ filter: `drop-shadow(0 0 0 ${colorA})` }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: colorA,
              mixBlendMode: "multiply",
              opacity: 0.3,
            }}
          />
          {children}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Bottom RGB channel */}
      <AbsoluteFill
        style={{
          transform: `translate(${botOffsetX}px, ${botOffsetY}px)`,
          clipPath: `inset(${botClipTop}% 0 0 0)`,
          mixBlendMode: "screen",
          opacity: 0.7 * envelope,
        }}
      >
        <AbsoluteFill style={{ filter: `drop-shadow(0 0 0 ${colorB})` }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: colorB,
              mixBlendMode: "multiply",
              opacity: 0.3,
            }}
          />
          {children}
        </AbsoluteFill>
      </AbsoluteFill>

      {/* Scanline overlay during glitch */}
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 0, 0, 0.08) 3px,
            rgba(0, 0, 0, 0.08) 4px
          )`,
          opacity: envelope,
          pointerEvents: "none",
        }}
      />

      {/* Impact flash */}
      {flashOpacity > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.white,
            opacity: flashOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
