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

// Safe zones
const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 120;

type CTASceneProps = {
  imageSrc: string;
  brightness?: number;
  imagePosition?: string;
};

export const CTAScene: React.FC<CTASceneProps> = ({
  imageSrc,
  brightness = 1.0,
  imagePosition = "center center",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ken Burns
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.1], {
    extrapolateRight: "clamp",
  });

  // Hook text entrance
  const hookSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const hookY = interpolate(hookSpring, [0, 1], [50, 0]);
  const hookOpacity = interpolate(hookSpring, [0, 1], [0, 1]);

  // Red divider
  const dividerWidth = interpolate(
    spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 20 }),
    [0, 1],
    [0, 160]
  );

  // Register Now entrance
  const registerSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const registerY = interpolate(registerSpring, [0, 1], [40, 0]);
  const registerOpacity = interpolate(registerSpring, [0, 1], [0, 1]);

  // URL entrance
  const urlSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const urlY = interpolate(urlSpring, [0, 1], [30, 0]);
  const urlOpacity = interpolate(urlSpring, [0, 1], [0, 1]);

  // Evolve lockup fade-in
  const evolveOpacity = interpolate(frame, [fps * 1.8, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
            transform: `scale(${scale})`,
            filter: `brightness(${brightness}) contrast(1.08)`,
          }}
        />
      </AbsoluteFill>

      {/* Heavy dark overlay */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 80%, transparent 100%)",
        }}
      />

      {/* DB logo — safe zone */}
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

      {/* CTA Content — all within safe zone */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: SAFE_TOP,
          paddingBottom: SAFE_BOTTOM + 100, // Extra padding above the CTABar
          paddingLeft: SAFE_SIDES,
          paddingRight: SAFE_SIDES,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 200 }}>
          {/* Hook line */}
          <div
            style={{
              transform: `translateY(${hookY}px)`,
              opacity: hookOpacity,
              fontFamily: FONTS.headline,
              fontSize: 54,
              fontWeight: 700,
              color: COLORS.white,
              textTransform: "uppercase",
              textAlign: "center",
              letterSpacing: 1,
              lineHeight: 1.15,
              textShadow: "0 4px 30px rgba(0,0,0,0.8)",
            }}
          >
            Where Skills Turn
            {"\n"}
            to Confidence.
          </div>

          {/* Red divider */}
          <div
            style={{
              width: dividerWidth,
              height: 4,
              backgroundColor: COLORS.red,
              marginTop: 22,
              marginBottom: 22,
            }}
          />

          {/* Register Now button */}
          <div
            style={{
              transform: `translateY(${registerY}px)`,
              opacity: registerOpacity,
              fontFamily: FONTS.headline,
              fontSize: 40,
              fontWeight: 700,
              color: COLORS.white,
              textAlign: "center",
              letterSpacing: 4,
              textTransform: "uppercase",
              backgroundColor: COLORS.red,
              padding: "12px 44px",
              marginBottom: 14,
            }}
          >
            Register Now
          </div>

          {/* URL */}
          <div
            style={{
              transform: `translateY(${urlY}px)`,
              opacity: urlOpacity,
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
            }}
          >
            summer.differentbreedsportsacademy.com
          </div>

          {/* Early bird */}
          <div
            style={{
              transform: `translateY(${urlY}px)`,
              opacity: urlOpacity,
              fontFamily: FONTS.body,
              fontSize: 18,
              fontWeight: 500,
              color: COLORS.gray,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            Early Bird Pricing Ends June 12
          </div>

          {/* Evolve lockup */}
          <div style={{ marginTop: 30, opacity: evolveOpacity }}>
            <Img
              src={staticFile("evolve-db-white-red.png")}
              style={{
                width: 280,
                filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.7))",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
