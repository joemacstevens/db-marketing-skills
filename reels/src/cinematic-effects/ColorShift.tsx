import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../components/BrandStyles";

type ColorStop = {
  /** Frame at which this color is fully active */
  frame: number;
  /** Background color */
  backgroundColor: string;
  /** Text color (optional — for children to inherit) */
  textColor?: string;
};

type ColorShiftProps = {
  /** Array of color stops with frame timing */
  stops: ColorStop[];
  children?: React.ReactNode;
};

function lerpColor(a: string, b: string, t: number): string {
  // Parse hex to RGB
  const parseHex = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * DB defaults: cool blue → red → gold energy ramp
 */
const DB_STOPS: ColorStop[] = [
  { frame: 0, backgroundColor: "#0E0E0E", textColor: "#FFFFFF" },
  { frame: 30, backgroundColor: "#0D1520", textColor: "#FFFFFF" }, // cool blue-black
  { frame: 60, backgroundColor: "#1A0808", textColor: "#FFFFFF" }, // dark red
  { frame: 90, backgroundColor: "#2A0A0A", textColor: "#FFFFFF" }, // medium red
  { frame: 120, backgroundColor: "#1A1408", textColor: "#FFFFFF" }, // warm gold-black
];

export const ColorShift: React.FC<ColorShiftProps> = ({
  stops = DB_STOPS,
  children,
}) => {
  const frame = useCurrentFrame();

  // Find which two stops we're between
  let bg = stops[0].backgroundColor;
  let textColor = stops[0].textColor || COLORS.white;

  for (let i = 0; i < stops.length - 1; i++) {
    const curr = stops[i];
    const next = stops[i + 1];

    if (frame >= curr.frame && frame <= next.frame) {
      const t = interpolate(frame, [curr.frame, next.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      bg = lerpColor(curr.backgroundColor, next.backgroundColor, t);
      if (curr.textColor && next.textColor) {
        textColor = lerpColor(curr.textColor, next.textColor, t);
      }
      break;
    }

    if (frame > next.frame) {
      bg = next.backgroundColor;
      textColor = next.textColor || COLORS.white;
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: bg, color: textColor }}>
      {children}
    </AbsoluteFill>
  );
};
