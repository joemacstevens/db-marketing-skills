import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { DBS_COLORS, DBS_FONTS } from "../design-system";

/*
 * ─── DB Run Club badge (code-drawn SVG, no generated art) ───────────────
 *
 * Circular stamp: red ring carrying BUILT DIFFERENT · DB RUN CLUB · ONE
 * MILE AT A TIME in letterspaced NORD caps on a <textPath>, black inner
 * disc, big NORD Black Italic DB over a red skewed RUN CLUB band.
 *
 * Everything is unit-space inside a 700x700 viewBox, so the same geometry
 * scales crisply from a 240px lobby-panel badge to a 700px reel hero.
 * The panel version (PanelRunClub) should reuse the constants below.
 *
 * Ring metrics are computed, not eyeballed:
 *   NORD-Bold advance for the full ring string = 32.322em (fontTools),
 *   cap height = 0.664em. Baseline radius is set so the caps sit centred
 *   in the red band, then letter-spacing is solved so the string lands
 *   exactly on the circumference with no gap and no overlap.
 */

// ─── geometry (exported so the lobby panel can reuse it) ────────────────
export const BADGE_VIEWBOX = 700;
const C = BADGE_VIEWBOX / 2; // 350
const R_RING_OUTER = 344;
const R_RING_INNER = 268;
const R_BAND_MID = (R_RING_OUTER + R_RING_INNER) / 2; // 306

export const RING_TEXT = "BUILT DIFFERENT · DB RUN CLUB · ONE MILE AT A TIME · ";
const RING_FONT_SIZE = 46;
const NORD_CAP = 0.664;
/** Advance width of RING_TEXT in NORD-Bold, in em (measured from the OTF). */
const RING_ADVANCE_EM = 32.322;

const R_TEXT = R_BAND_MID - (RING_FONT_SIZE * NORD_CAP) / 2; // ≈ 290.7
const RING_CIRCUMFERENCE = 2 * Math.PI * R_TEXT;
const RING_TRACKING =
  (RING_CIRCUMFERENCE - RING_ADVANCE_EM * RING_FONT_SIZE) / RING_TEXT.length;

// Clockwise circle starting at 12 o'clock so the string reads left-to-right
// across the top of the badge.
const RING_PATH = [
  `M ${C} ${C - R_TEXT}`,
  `A ${R_TEXT} ${R_TEXT} 0 0 1 ${C} ${C + R_TEXT}`,
  `A ${R_TEXT} ${R_TEXT} 0 0 1 ${C} ${C - R_TEXT}`,
].join(" ");

// ─── centre lockup positions ────────────────────────────────────────────
const DASH_Y = 178;
const DB_BASELINE = 372;
const DB_SIZE = 230;
const BAND_CY = 442;
const BAND_W = 392;
const BAND_H = 86;
const LOCALE_BASELINE = 528;

type Props = {
  /** Rendered pixel width (and height) of the badge. */
  size?: number;
  /** Frame the slam-in starts on (relative to the parent Sequence). */
  startFrame?: number;
  /** Degrees per second the ring text rotates. 0 freezes it. */
  spinDegPerSec?: number;
  /** Set false for a static badge (panel/still use). */
  animate?: boolean;
};

export const RunClubBadge: React.FC<Props> = ({
  size = 700,
  startFrame = 0,
  spinDegPerSec = 5,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reactId = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const pathId = `rc-ring-${reactId}`;

  const local = Math.max(0, frame - startFrame);
  const s = animate
    ? spring({
        frame: local,
        fps,
        config: { damping: 13, mass: 0.8, stiffness: 190 },
        durationInFrames: 20,
      })
    : 1;
  const scale = animate ? 0.7 + s * 0.3 : 1;
  const opacity = animate
    ? interpolate(local, [0, 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const tilt = animate ? -9 * (1 - s) : 0;
  const spin = animate ? (local / fps) * spinDegPerSec : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BADGE_VIEWBOX} ${BADGE_VIEWBOX}`}
      style={{
        display: "block",
        opacity,
        transform: `scale(${scale}) rotate(${tilt}deg)`,
        filter: "drop-shadow(10px 12px 0 rgba(8,0,0,0.92))",
      }}
    >
      <defs>
        <path id={pathId} d={RING_PATH} fill="none" />
      </defs>

      {/* red ring band */}
      <circle
        cx={C}
        cy={C}
        r={R_BAND_MID}
        fill="none"
        stroke={DBS_COLORS.red500}
        strokeWidth={R_RING_OUTER - R_RING_INNER}
      />
      {/* hairline edges, inside and out */}
      <circle
        cx={C}
        cy={C}
        r={R_RING_OUTER}
        fill="none"
        stroke={DBS_COLORS.black}
        strokeWidth={7}
      />
      <circle
        cx={C}
        cy={C}
        r={R_RING_INNER}
        fill="none"
        stroke={DBS_COLORS.black}
        strokeWidth={7}
      />

      {/* inner disc */}
      <circle cx={C} cy={C} r={R_RING_INNER - 3} fill={DBS_COLORS.black} />
      <circle
        cx={C}
        cy={C}
        r={R_RING_INNER - 22}
        fill="none"
        stroke={DBS_COLORS.bone}
        strokeWidth={3}
        opacity={0.42}
      />

      {/* ring text — rotates slowly around the badge centre */}
      <g transform={`rotate(${spin} ${C} ${C})`}>
        <text
          fill={DBS_COLORS.bone}
          style={{
            fontFamily: DBS_FONTS.display,
            fontWeight: 700,
            fontSize: RING_FONT_SIZE,
            letterSpacing: `${RING_TRACKING.toFixed(2)}px`,
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0">
            {RING_TEXT}
          </textPath>
        </text>
      </g>

      {/* three red dashes above the monogram */}
      <g transform={`translate(${C} ${DASH_Y}) skewX(-26) translate(${-C} ${-DASH_Y})`}>
        {[-1, 0, 1].map((i) => (
          <rect
            key={i}
            x={C + i * 52 - 19}
            y={DASH_Y - 6}
            width={38}
            height={12}
            fill={DBS_COLORS.red500}
          />
        ))}
      </g>

      {/* DB monogram */}
      <text
        x={C}
        y={DB_BASELINE}
        textAnchor="middle"
        fill={DBS_COLORS.bone}
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: DB_SIZE,
          letterSpacing: "-0.01em",
        }}
      >
        DB
      </text>

      {/* red skewed RUN CLUB band */}
      <g transform={`translate(${C} ${BAND_CY}) skewX(-9) translate(${-C} ${-BAND_CY})`}>
        <rect
          x={C - BAND_W / 2}
          y={BAND_CY - BAND_H / 2}
          width={BAND_W}
          height={BAND_H}
          fill={DBS_COLORS.red500}
        />
      </g>
      <text
        x={C}
        y={BAND_CY + (56 * NORD_CAP) / 2}
        textAnchor="middle"
        fill={DBS_COLORS.black}
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 700,
          fontSize: 56,
          letterSpacing: "6px",
        }}
      >
        RUN CLUB
      </text>

      {/* locale line */}
      <text
        x={C}
        y={LOCALE_BASELINE}
        textAnchor="middle"
        fill={DBS_COLORS.bone}
        opacity={0.66}
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "9px",
        }}
      >
        TEANECK · NJ
      </text>
    </svg>
  );
};
