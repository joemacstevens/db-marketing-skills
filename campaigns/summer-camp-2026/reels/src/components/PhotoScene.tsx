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

// IG Reels safe zones (1080x1920):
// Top: 10% = 192px, Bottom: 21% = 403px, Sides: 10% = 108px
const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

type PhotoSceneProps = {
  imageSrc: string;
  headline: string;
  subline?: string;
  brightness?: number;
  imagePosition?: string;
};

export const PhotoScene: React.FC<PhotoSceneProps> = ({
  imageSrc,
  headline,
  subline,
  brightness = 1.0,
  imagePosition = "center center",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ken Burns: slow zoom from 1.0 to 1.12
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {
    extrapolateRight: "clamp",
  });

  // Slight horizontal drift
  const translateX = interpolate(frame, [0, durationInFrames], [0, -15], {
    extrapolateRight: "clamp",
  });

  // Text entrance: spring slide-up + fade
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const textY = interpolate(textSpring, [0, 1], [60, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Subline enters slightly after headline
  const sublineSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const sublineY = interpolate(sublineSpring, [0, 1], [40, 0]);
  const sublineOpacity = interpolate(sublineSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Photo with Ken Burns */}
      <AbsoluteFill>
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: imagePosition,
            transform: `scale(${scale}) translateX(${translateX}px)`,
            filter: `brightness(${brightness}) contrast(1.08) saturate(1.05)`,
          }}
        />
      </AbsoluteFill>

      {/* Dark gradient overlay for text legibility */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)",
        }}
      />

      {/* DB logo mark — inside safe zone */}
      <div
        style={{
          position: "absolute",
          top: SAFE_TOP,
          right: SAFE_SIDES,
          opacity: 0.9,
        }}
      >
        <Img
          src={staticFile("db-logo-red-outline.png")}
          style={{ width: 80, height: 80 }}
        />
      </div>

      {/* Text overlay — positioned within safe zone */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: SAFE_BOTTOM + 110,
          paddingLeft: SAFE_SIDES,
          paddingRight: SAFE_SIDES,
        }}
      >
        {/* Headline */}
        <div
          style={{
            transform: `translateY(${textY}px)`,
            opacity: textOpacity,
            fontFamily: FONTS.headline,
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: -1,
            lineHeight: 1.05,
            textShadow: "0 4px 30px rgba(0,0,0,0.8)",
          }}
        >
          {headline}
        </div>

        {/* Red accent divider */}
        <div
          style={{
            width: interpolate(textSpring, [0, 1], [0, 120]),
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        {/* Subline */}
        {subline && (
          <div
            style={{
              transform: `translateY(${sublineY}px)`,
              opacity: sublineOpacity,
              fontFamily: FONTS.body,
              fontSize: 34,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              letterSpacing: 1,
              textShadow: "0 2px 20px rgba(0,0,0,0.7)",
            }}
          >
            {subline}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
