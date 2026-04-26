import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS, SAFE } from "../components/BrandStyles";

type CardData = {
  /** Card title */
  title: string;
  /** Card subtitle/description */
  subtitle?: string;
  /** Background color for this card */
  backgroundColor?: string;
  /** Text color */
  color?: string;
  /** Optional accent line color */
  accentColor?: string;
};

type StickyCardsProps = {
  cards: CardData[];
  /** Frame when the first card enters */
  startFrame?: number;
  /** Frames between each card entering */
  stagger?: number;
  /** Vertical offset between stacked cards */
  stackOffset?: number;
  /** Card border radius */
  borderRadius?: number;
  children?: React.ReactNode;
};

export const StickyCards: React.FC<StickyCardsProps> = ({
  cards,
  startFrame = 0,
  stagger = 25,
  stackOffset = 24,
  borderRadius = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        padding: `${SAFE.top}px ${SAFE.sides}px ${SAFE.bottom}px`,
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {cards.map((card, i) => {
          const cardStart = startFrame + i * stagger;
          const cardElapsed = frame - cardStart;

          // Spring entrance
          const enterSpring = spring({
            frame: Math.max(0, cardElapsed),
            fps,
            config: { damping: 200, mass: 0.8 },
            durationInFrames: 20,
          });

          const translateY = interpolate(enterSpring, [0, 1], [300, 0]);
          const opacity = interpolate(enterSpring, [0, 1], [0, 1]);

          // Slight scale-down for cards that are further back in the stack
          const stackIndex = cards.length - 1 - i;
          const scale = interpolate(
            enterSpring,
            [0, 1],
            [0.95, 1 - stackIndex * 0.02]
          );

          const bgColor = card.backgroundColor || COLORS.charcoal;
          const textColor = card.color || COLORS.white;
          const accent = card.accentColor || COLORS.red;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${i * stackOffset + 80}px`,
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                backgroundColor: bgColor,
                borderRadius,
                padding: "44px 36px",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                zIndex: i + 1,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              {/* Accent line */}
              <div
                style={{
                  width: 60,
                  height: 4,
                  backgroundColor: accent,
                  marginBottom: 16,
                }}
              />

              <div
                style={{
                  fontFamily: FONTS.headline,
                  fontSize: 40,
                  fontWeight: 700,
                  color: textColor,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  lineHeight: 1.1,
                  marginBottom: card.subtitle ? 10 : 0,
                }}
              >
                {card.title}
              </div>

              {card.subtitle && (
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 22,
                    fontWeight: 500,
                    color: `${textColor}BB`,
                    lineHeight: 1.4,
                  }}
                >
                  {card.subtitle}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
