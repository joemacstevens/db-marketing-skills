import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./BrandStyles";

type EndTagProps = {
  tagline?: string;
};

export const EndTagScene: React.FC<EndTagProps> = ({ tagline = "Youth Fitness Program" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Evolve lockup entrance
  const evolveSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const evolveScale = interpolate(evolveSpring, [0, 1], [0.85, 1]);
  const evolveOpacity = interpolate(evolveSpring, [0, 1], [0, 1]);

  // Red line grows
  const lineWidth = interpolate(
    spring({ frame: frame - 12, fps, config: { damping: 200 }, durationInFrames: 20 }),
    [0, 1],
    [0, 280]
  );

  // Tagline entrance
  const tagSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const tagY = interpolate(tagSpring, [0, 1], [30, 0]);
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);

  // Website entrance
  const urlSpring = spring({
    frame: frame - 24,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const urlOpacity = interpolate(urlSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        {/* Evolve Into Greatness lockup */}
        <div
          style={{
            transform: `scale(${evolveScale})`,
            opacity: evolveOpacity,
          }}
        >
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 620,
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        {/* Red divider */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 36,
            marginBottom: 36,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            transform: `translateY(${tagY}px)`,
            opacity: tagOpacity,
            fontFamily: FONTS.headline,
            fontSize: 38,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: 5,
          }}
        >
          {tagline}
        </div>

        {/* Website */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.red,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          differentbreedsportsacademy.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
