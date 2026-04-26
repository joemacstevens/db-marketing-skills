import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile } from "remotion";

type ParallaxLayer = {
  /** Image source (looked up via staticFile) */
  src: string;
  /** Depth multiplier: higher = zooms faster (closer to camera) */
  depth: number;
  /** Starting scale */
  startScale?: number;
  /** Optional CSS filter */
  filter?: string;
  /** Opacity */
  opacity?: number;
};

type ZoomParallaxProps = {
  /** Array of layers from back to front */
  layers: ParallaxLayer[];
  /** Frame when zoom starts */
  startFrame?: number;
  /** Duration of the full zoom */
  duration?: number;
  /** Overall zoom speed multiplier */
  zoomSpeed?: number;
  /** Background color behind all layers */
  backgroundColor?: string;
};

export const ZoomParallax: React.FC<ZoomParallaxProps> = ({
  layers,
  startFrame = 0,
  duration = 90,
  zoomSpeed = 1,
  backgroundColor = "#0E0E0E",
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);

  const progress = interpolate(elapsed, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      {layers.map((layer, i) => {
        const baseScale = layer.startScale ?? 1;
        // Each layer zooms at a rate proportional to its depth
        const scale = baseScale + progress * layer.depth * zoomSpeed * 0.3;

        return (
          <AbsoluteFill
            key={i}
            style={{
              zIndex: i,
              transform: `scale(${scale})`,
              opacity: layer.opacity ?? 1,
            }}
          >
            <Img
              src={staticFile(layer.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: layer.filter,
              }}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
