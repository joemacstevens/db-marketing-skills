import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  DBS_COLORS,
  DBS_FONTS,
  DBS_SHADOW_PRESS,
  DBS_TRACKING,
  SAFE,
  dbsFontFamilies,
} from "../design-system";

// ─── slam-in with spring overshoot ──────────────────────────────────────
export const Slam: React.FC<{
  startFrame: number;
  children: React.ReactNode;
  rotate?: number;
  from?: number;
}> = ({ startFrame, children, rotate = 0, from = 0.9 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - startFrame);
  const s = spring({
    frame: local,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 220 },
    durationInFrames: 12,
  });
  const scale = from + s * (1 - from);
  const opacity = Math.min(1, s * 1.6);
  const rot = rotate * (1 - s);
  return (
    <div style={{ opacity, transform: `scale(${scale}) rotate(${rot}deg)`, display: "inline-block" }}>
      {children}
    </div>
  );
};

// ─── skewed red ribbon ──────────────────────────────────────────────────
export const Ribbon: React.FC<{
  children: React.ReactNode;
  startFrame?: number;
  fontSize?: number;
  rotate?: number;
}> = ({ children, startFrame = 0, fontSize = 54, rotate = -2 }) => (
  <Slam startFrame={startFrame} rotate={rotate}>
    <div
      style={{
        display: "inline-block",
        padding: "12px 34px 14px",
        transform: "skewX(-14deg)",
        background: `linear-gradient(180deg, #f12b2b, ${DBS_COLORS.red600})`,
        color: DBS_COLORS.bone,
        fontFamily: DBS_FONTS.display,
        fontWeight: 900,
        fontStyle: "italic",
        fontSize,
        lineHeight: 1,
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        boxShadow: "8px 8px 0 #160000",
      }}
    >
      <span style={{ display: "inline-block", transform: "skewX(14deg)" }}>{children}</span>
    </div>
  </Slam>
);

// ─── slash pair around a small label ────────────────────────────────────
export const SlashLabel: React.FC<{ children: React.ReactNode; startFrame?: number }> = ({
  children,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame - startFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  const slash = (
    <span
      style={{
        width: 84 * grow,
        height: 6,
        background: DBS_COLORS.red500,
        transform: "skewX(-26deg)",
        boxShadow: "0 0 14px rgba(232,29,29,0.7)",
        display: "inline-block",
      }}
    />
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
      {slash}
      <span
        style={{
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: DBS_TRACKING.widest,
          textTransform: "uppercase",
          color: DBS_COLORS.bone,
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      {slash}
    </div>
  );
};

// ─── full-bleed footage (muted; audio handled globally) ─────────────────
// zoom=false shows the clip 1:1 with no Ken Burns push — for footage already
// framed/delivered at reel size (e.g. Adrian's picks) that shouldn't be cropped.
export const Backdrop: React.FC<{
  src: string;
  startTimeSec: number;
  durationFrames: number;
  dimTop?: number;
  dimBottom?: number;
  fade?: boolean;
  zoom?: boolean;
}> = ({ src, startTimeSec, durationFrames, dimTop = 0, dimBottom = 0, fade = true, zoom = true }) => {
  const frame = useCurrentFrame();
  const scale = zoom
    ? interpolate(frame, [0, durationFrames], [1.04, 1.1], { extrapolateRight: "clamp" })
    : 1;
  const op = fade
    ? interpolate(frame, [0, 5, durationFrames - 5, durationFrames], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  return (
    <AbsoluteFill style={{ background: DBS_COLORS.black, opacity: op }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(startTimeSec * 30)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {(dimTop > 0 || dimBottom > 0) && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, rgba(5,5,5,${dimTop}) 0%, rgba(5,5,5,0) 32%, rgba(5,5,5,0) 58%, rgba(5,5,5,${dimBottom}) 100%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── full-card surface (black + red-glow ground) ────────────────────────
export const CardGround: React.FC<{ children: React.ReactNode; dur?: number; fadeOut?: boolean }> = ({
  children,
  dur = 0,
  fadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const outOp = fadeOut
    ? interpolate(frame, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(inOp, outOp),
        background: `radial-gradient(900px 520px at 50% 26%, rgba(255,255,255,0.06), transparent 68%), radial-gradient(700px 360px at 20% 84%, rgba(232,29,29,0.20), transparent 70%), ${DBS_COLORS.black}`,
      }}
    >
      <AbsoluteFill
        style={{
          background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 7px)",
          opacity: 0.42,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          padding: `${SAFE.top}px ${SAFE.sides}px ${SAFE.bottom}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── lower-third name chip (house style: red box, NORD bone, bottom-left) ─
// Mirrors because-of-boxing render.py chip: x64 / y1600, NORD-Bold 58, red box.
export const NameChip: React.FC<{ name: string; startFrame?: number; hold?: number }> = ({
  name,
  startFrame = 0,
  hold = 110,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const opIn = interpolate(local, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opOut = interpolate(local, [hold - 10, hold], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slide = interpolate(local, [0, 10], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 1600,
          opacity: Math.min(opIn, opOut),
          transform: `translateX(${slide}px)`,
          background: DBS_COLORS.red500,
          padding: "18px 30px 20px",
          boxShadow: DBS_SHADOW_PRESS,
          fontFamily: DBS_FONTS.headline,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          color: DBS_COLORS.bone,
        }}
      >
        {name}
      </div>
    </AbsoluteFill>
  );
};

// ─── red skew flash wipe ────────────────────────────────────────────────
export const FlashWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 16], [-120, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: DBS_COLORS.red500,
          transform: `translateX(${wipe}%) skewX(-12deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── end card: DIFFERENT BREED / line / line / handle ───────────────────
export const EndCard: React.FC<{
  dur: number;
  line1: string;
  line2?: string;
  handle: string;
}> = ({ dur, line1, line2, handle }) => (
  <CardGround dur={dur} fadeOut={false}>
    <Slam startFrame={2} rotate={-2}>
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 118,
          lineHeight: 0.84,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: DBS_COLORS.bone,
          textShadow: "9px 9px 0 #141414",
        }}
      >
        DIFFERENT
        <br />
        BREED
      </div>
    </Slam>
    <Slam startFrame={12} rotate={-2}>
      <div style={{ marginTop: 26 }}>
        <Ribbon startFrame={12} fontSize={62}>
          {line1}
        </Ribbon>
      </div>
    </Slam>
    {line2 && (
      <Slam startFrame={20} rotate={0}>
        <div
          style={{
            marginTop: 30,
            fontFamily: dbsFontFamilies.BarlowItalic,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 42,
            lineHeight: 1.05,
            textTransform: "uppercase",
            color: DBS_COLORS.bone,
            textShadow: "3px 3px 0 #000",
          }}
        >
          {line2}
        </div>
      </Slam>
    )}
    <Slam startFrame={30} rotate={0}>
      <div
        style={{
          marginTop: 40,
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: DBS_TRACKING.widest,
          textTransform: "uppercase",
          color: DBS_COLORS.red500,
        }}
      >
        {handle}
      </div>
    </Slam>
  </CardGround>
);

// ─── music-bed volume: low under speech windows, lifted elsewhere ───────
// windows: array of [startF, endF] where speech plays → duck to `duckTo`.
export const bedVolume =
  (total: number, speech: [number, number][], duckTo = 0.26, base = 0.82) =>
  (f: number) => {
    const fadeIn = interpolate(f, [0, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [total - 30, total], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    let ducked = false;
    for (const [s, e] of speech) if (f >= s - 8 && f <= e + 8) ducked = true;
    const level = ducked ? duckTo : base;
    return Math.min(fadeIn, fadeOut) * level;
  };

// ─── music-forward bed for montages: near-full with fades ───────────────
export const fullBed = (total: number, level = 0.95) => (f: number) => {
  const fadeIn = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [total - 26, total], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut) * level;
};

// ─── montage stamp title card (2 big NORD lines, accent 2nd) ─────────────
export const StampTitle: React.FC<{ dur: number; line1: string; line2: string }> = ({
  dur,
  line1,
  line2,
}) => (
  <CardGround dur={dur}>
    <Slam startFrame={2} rotate={-2}>
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 128,
          lineHeight: 0.84,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: DBS_COLORS.bone,
          textShadow: "9px 9px 0 #141414",
        }}
      >
        {line1}
      </div>
    </Slam>
    <div style={{ marginTop: 10 }}>
      <Slam startFrame={10} rotate={-2}>
        <div
          style={{
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 168,
            lineHeight: 0.8,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: DBS_COLORS.red500,
            textShadow: "10px 10px 0 #140000",
          }}
        >
          {line2}
        </div>
      </Slam>
    </div>
  </CardGround>
);

export { DBS_COLORS, DBS_FONTS, DBS_TRACKING, DBS_SHADOW_PRESS, dbsFontFamilies };
