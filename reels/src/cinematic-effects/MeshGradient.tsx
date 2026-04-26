import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../components/BrandStyles";

type GradientBlob = {
  color: string;
  /** Radius as percentage of container */
  size: number;
  /** Movement speed multiplier */
  speed: number;
  /** Phase offset in radians */
  phase: number;
  /** Center X offset (0-1) */
  cx: number;
  /** Center Y offset (0-1) */
  cy: number;
};

const DEFAULT_BLOBS: GradientBlob[] = [
  { color: "rgba(196, 22, 28, 0.25)", size: 60, speed: 0.008, phase: 0, cx: 0.3, cy: 0.3 },
  { color: "rgba(196, 22, 28, 0.15)", size: 50, speed: 0.012, phase: 2.1, cx: 0.7, cy: 0.6 },
  { color: "rgba(212, 168, 67, 0.12)", size: 45, speed: 0.006, phase: 4.2, cx: 0.5, cy: 0.8 },
  { color: "rgba(255, 255, 255, 0.04)", size: 70, speed: 0.01, phase: 1.0, cx: 0.6, cy: 0.2 },
];

type MeshGradientProps = {
  /** Custom gradient blobs (overrides defaults) */
  blobs?: GradientBlob[];
  /** Base background color */
  backgroundColor?: string;
  /** Frame when animation starts */
  startFrame?: number;
  children?: React.ReactNode;
};

export const MeshGradient: React.FC<MeshGradientProps> = ({
  blobs = DEFAULT_BLOBS,
  backgroundColor = COLORS.black,
  startFrame = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  const gradients = blobs.map((blob, i) => {
    const t = elapsed * blob.speed + blob.phase;
    const x = (blob.cx + Math.sin(t) * 0.15 + Math.cos(t * 0.7) * 0.1) * 100;
    const y = (blob.cy + Math.cos(t * 1.3) * 0.15 + Math.sin(t * 0.5) * 0.1) * 100;
    return `radial-gradient(${blob.size}% ${blob.size}% at ${x}% ${y}%, ${blob.color}, transparent)`;
  });

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <AbsoluteFill
        style={{
          background: gradients.join(", "),
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
