import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../components/BrandStyles";

type OdometerCounterProps = {
  /** Target number to roll to */
  value: number;
  /** Frame when the roll starts */
  startFrame?: number;
  /** Duration of the full roll animation */
  duration?: number;
  /** Stagger delay between digits (frames) — rightmost animates first */
  stagger?: number;
  /** Text before the number (e.g., "$") */
  prefix?: string;
  /** Text after the number (e.g., "%", "/wk") */
  suffix?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  /** Style for prefix/suffix */
  affixColor?: string;
  affixSize?: number;
  style?: React.CSSProperties;
};

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const OdometerCounter: React.FC<OdometerCounterProps> = ({
  value,
  startFrame = 0,
  duration = 40,
  stagger = 4,
  prefix,
  suffix,
  fontSize = 80,
  color = COLORS.white,
  fontFamily = FONTS.headline,
  fontWeight = 700,
  affixColor = COLORS.red,
  affixSize,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const valueStr = String(value);
  const digitCount = valueStr.length;
  const digitHeight = fontSize * 1.15;

  // Overall fade in
  const elapsed = Math.max(0, frame - startFrame);
  const opacity = interpolate(elapsed, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        opacity,
        ...style,
      }}
    >
      {/* Prefix */}
      {prefix && (
        <span
          style={{
            fontFamily,
            fontSize: affixSize || fontSize * 0.6,
            fontWeight,
            color: affixColor,
            marginRight: 4,
          }}
        >
          {prefix}
        </span>
      )}

      {/* Digit wheels */}
      {valueStr.split("").map((targetChar, i) => {
        const targetDigit = parseInt(targetChar, 10);

        // Stagger: leftmost digit starts last, rightmost first
        const digitDelay = (digitCount - 1 - i) * stagger;
        const digitElapsed = Math.max(0, elapsed - digitDelay);

        // Spring for smooth roll
        const rollSpring = spring({
          frame: digitElapsed,
          fps,
          config: { damping: 30, mass: 0.6, stiffness: 80 },
          durationInFrames: duration,
        });

        // How far to translate: roll to the target digit
        const translateY = interpolate(rollSpring, [0, 1], [0, -targetDigit * digitHeight]);

        return (
          <div
            key={i}
            style={{
              overflow: "hidden",
              height: digitHeight,
              display: "inline-block",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                transform: `translateY(${translateY}px)`,
                willChange: "transform",
              }}
            >
              {DIGITS.map((d) => (
                <span
                  key={d}
                  style={{
                    display: "block",
                    height: digitHeight,
                    lineHeight: `${digitHeight}px`,
                    fontFamily,
                    fontSize,
                    fontWeight,
                    color,
                    textAlign: "center",
                    minWidth: fontSize * 0.65,
                    letterSpacing: -1,
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {/* Suffix */}
      {suffix && (
        <span
          style={{
            fontFamily,
            fontSize: affixSize || fontSize * 0.5,
            fontWeight,
            color: affixColor,
            marginLeft: 4,
            alignSelf: "flex-start",
            marginTop: fontSize * 0.15,
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
};
