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
  // Optional CTA line below the hero lockup. Pass "" to hide.
  cta?: string;
  // Handle shown at the bottom.
  handle?: string;
};

/**
 * Shared DB end-tag scene.
 *
 * "EVOLVE INTO GREATNESS." is the hero — it's the brand signature and should
 * be at least as big as any quote/headline elsewhere in the reel. Use this
 * component for every DB video's sign-off.
 *
 * Designed for 30-frame (1s) sequences but scales fine up to ~45f.
 */
export const EndTagScene: React.FC<EndTagProps> = ({
  cta = "Book · link in bio",
  handle = "@dbelitefitness",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero: "EVOLVE INTO / GREATNESS." lockup (biggest element)
  const heroS = spring({
    frame: frame - 2,
    fps,
    config: { damping: 180, mass: 0.8 },
    durationInFrames: 22,
  });
  const heroOp = interpolate(heroS, [0, 1], [0, 1]);
  const heroY = interpolate(heroS, [0, 1], [30, 0]);
  const heroSc = interpolate(heroS, [0, 1], [0.92, 1]);

  // Red rule
  const rule = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 18 }),
    [0, 1],
    [0, 300]
  );

  // Logo mark (secondary, above the hero)
  const logoS = spring({
    frame: frame - 4,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const logoOp = interpolate(logoS, [0, 1], [0, 1]);

  // Footer lines
  const footerS = spring({
    frame: frame - 14,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const footerOp = interpolate(footerS, [0, 1], [0, 1]);
  const footerY = interpolate(footerS, [0, 1], [14, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
        padding: "80px 60px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* DB mark — kept small so the tagline can lead */}
        <div style={{ opacity: logoOp, marginBottom: 18 }}>
          <Img
            src={staticFile("db-logo-red-outline.png")}
            style={{
              width: 150,
              filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.55))",
            }}
          />
        </div>

        {/* Red rule */}
        <div
          style={{
            width: rule,
            height: 4,
            backgroundColor: COLORS.red,
            margin: "0 auto 28px",
          }}
        />

        {/* HERO: Evolve Into Greatness */}
        <div
          style={{
            opacity: heroOp,
            transform: `translateY(${heroY}px) scale(${heroSc})`,
            fontFamily: FONTS.headline,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            lineHeight: 0.92,
            letterSpacing: -3,
            textShadow: "0 6px 40px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ fontSize: 120 }}>Evolve Into</div>
          <div style={{ fontSize: 160 }}>
            Greatness<span style={{ color: COLORS.red }}>.</span>
          </div>
        </div>

        {/* Footer: CTA + handle */}
        <div
          style={{
            opacity: footerOp,
            transform: `translateY(${footerY}px)`,
            marginTop: 44,
          }}
        >
          {cta ? (
            <div
              style={{
                fontFamily: FONTS.headline,
                fontSize: 40,
                fontWeight: 700,
                color: COLORS.white,
                letterSpacing: -0.5,
                textTransform: "uppercase",
              }}
            >
              {cta}
            </div>
          ) : null}
          <div
            style={{
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 500,
              color: COLORS.gray,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginTop: 10,
            }}
          >
            {handle}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
