import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  OffthreadVideo,
} from "remotion";
import { COLORS, FONTS } from "./BrandStyles";

const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

type VideoSceneProps = {
  videoSrc: string;
  startFrom?: number;
  endAt?: number;
  muted?: boolean;
  volume?: number;
  headline?: string;
  subline?: string;
  headlinePosition?: "center" | "bottom" | "top";
  showLogo?: boolean;
  overlayOpacity?: number;
};

export const VideoScene: React.FC<VideoSceneProps> = ({
  videoSrc,
  startFrom = 0,
  endAt,
  muted = true,
  volume = 0,
  headline,
  subline,
  headlinePosition = "bottom",
  showLogo = true,
  overlayOpacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Text entrance
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const textY = interpolate(textSpring, [0, 1], [60, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Subline
  const sublineSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const sublineY = interpolate(sublineSpring, [0, 1], [40, 0]);
  const sublineOpacity = interpolate(sublineSpring, [0, 1], [0, 1]);

  const positionStyles: Record<string, React.CSSProperties> = {
    bottom: {
      justifyContent: "flex-end",
      paddingBottom: SAFE_BOTTOM + 110,
    },
    center: {
      justifyContent: "center",
    },
    top: {
      justifyContent: "flex-start",
      paddingTop: SAFE_TOP + 100,
    },
  };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Video */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(videoSrc)}
          startFrom={startFrom}
          endAt={endAt}
          muted={muted}
          volume={volume}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background:
            headlinePosition === "top"
              ? `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity + 0.3}) 0%, rgba(0,0,0,${overlayOpacity * 0.6}) 40%, transparent 70%)`
              : `linear-gradient(to top, rgba(0,0,0,${overlayOpacity + 0.3}) 0%, rgba(0,0,0,${overlayOpacity * 0.6}) 40%, transparent 70%)`,
        }}
      />

      {/* DB Logo */}
      {showLogo && (
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
      )}

      {/* Text overlay */}
      {headline && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            paddingLeft: SAFE_SIDES,
            paddingRight: SAFE_SIDES,
            ...positionStyles[headlinePosition],
          }}
        >
          <div
            style={{
              transform: `translateY(${textY}px)`,
              opacity: textOpacity,
              fontFamily: FONTS.headline,
              fontSize: 58,
              fontWeight: 700,
              color: COLORS.white,
              textTransform: "uppercase",
              textAlign: "center",
              letterSpacing: -1,
              lineHeight: 1.1,
              textShadow: "0 4px 30px rgba(0,0,0,0.8)",
            }}
          >
            {headline}
          </div>

          <div
            style={{
              width: interpolate(textSpring, [0, 1], [0, 120]),
              height: 4,
              backgroundColor: COLORS.red,
              marginTop: 18,
              marginBottom: 18,
            }}
          />

          {subline && (
            <div
              style={{
                transform: `translateY(${sublineY}px)`,
                opacity: sublineOpacity,
                fontFamily: FONTS.body,
                fontSize: 30,
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
      )}
    </AbsoluteFill>
  );
};
