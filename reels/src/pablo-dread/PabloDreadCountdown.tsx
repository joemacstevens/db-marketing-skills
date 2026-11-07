import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Teko";
import { BEATS, DURATION, TAG_AUDIO_PRE, TAG_DUR, TAG_FILE_LEAD, TAG_START, f } from "./timing";

// Rebuild of the Canva draft "Different Breed fight countdown Instagram Story"
// (DAHaPlAEQLY) as animated layers. Layout is restacked so every line of text sits
// inside the IG Story safe area: y 250..1580 (top 250 / bottom 340 kept clear).

const { fontFamily: TEKO } = loadFont("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

export type PabloDreadProps = {
  pabloSrc?: string; // path under public/, e.g. "pablo-dread-countdown/pablo.png"
  dreadSrc?: string;
  days?: string;
  date?: string;
};

const W = 1080;
const H = 1920;
const TEXT_LIGHT = "#DCDCDC";
const RED = "#E3242B";
const RED_HOT = "#FF2B2B";
const RED_DEEP = "#7A0C10";

// ---------- layout (all text inside 250..1580) ----------
const L = {
  brandY: 256,
  daysTop: 288,
  subY: 494,
  frameTop: 566,
  frameBottom: 1252,
  frameW: 452,
  leftX: 46,
  rightX: W - 46 - 452,
  plateH: 112,
  whoTop: 1276,
  dividerY: 1384,
  dateTop: 1386,
};

// ---------- helpers ----------
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const slam = (frame: number, start: number, fps: number, from: number) => {
  if (frame < start) return { scale: from, opacity: 0 };
  const s = spring({
    frame: frame - start,
    fps,
    config: { damping: 9, stiffness: 210, mass: 0.55 },
  });
  return {
    scale: from + (1 - from) * s,
    opacity: interpolate(frame - start, [0, 2], [0, 1], clamp),
  };
};

const decay = (frame: number, start: number, len: number) =>
  frame < start ? 0 : Math.max(0, 1 - (frame - start) / len) ** 2;

// Screen shake: sum of decaying random jolts per hit.
const shake = (frame: number) => {
  const hits: [number, number, number][] = [
    [f(BEATS.heart1), 6, 6],
    [f(BEATS.heart2), 6, 6],
    [f(BEATS.pablo), 26, 12],
    [f(BEATS.dread), 26, 12],
    [f(BEATS.vs), 46, 18],
    [f(BEATS.days), 22, 10],
  ];
  let x = 0;
  let y = 0;
  let r = 0;
  for (const [start, amp, len] of hits) {
    const d = decay(frame, start, len);
    if (d <= 0) continue;
    x += (random(`sx${frame}-${start}`) - 0.5) * 2 * amp * d;
    y += (random(`sy${frame}-${start}`) - 0.5) * 2 * amp * d;
    r += (random(`sr${frame}-${start}`) - 0.5) * 1.2 * d * (amp / 26);
  }
  return { x, y, r };
};

// ---------- background ----------
const Smoke: React.FC<{ frame: number; vsHeat: number }> = ({ frame, vsHeat }) => {
  const drift = frame * 0.9;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <filter id="smoke" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0032 0.0055"
              numOctaves={5}
              seed={7}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.42
                      0 0 0 0 0.02
                      0 0 0 0 0.02
                      2.2 0 0 0 -1.05"
            />
          </filter>
          <filter id="smoke2" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.009"
              numOctaves={4}
              seed={21}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.30
                      0 0 0 0 0.27
                      0 0 0 0 0.27
                      2.0 0 0 0 -1.1"
            />
          </filter>
          <radialGradient id="base" cx="50%" cy="48%" r="75%">
            <stop offset="0%" stopColor="#1c0405" />
            <stop offset="55%" stopColor="#080202" />
            <stop offset="100%" stopColor="#030303" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#base)" />
        <g transform={`translate(${-drift * 0.3}, ${-drift})`}>
          <rect width={W + 600} height={H + 600} filter="url(#smoke)" opacity={0.8} />
        </g>
        <g transform={`translate(${-200 + drift * 0.2}, ${-drift * 0.55})`}>
          <rect width={W + 600} height={H + 600} filter="url(#smoke2)" opacity={0.22} />
        </g>
      </svg>
      {/* bottom-corner fire glows from the poster */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 22% at 0% 100%, rgba(255,90,30,${0.32 + vsHeat * 0.2}) 0%, transparent 70%),
             radial-gradient(60% 22% at 100% 100%, rgba(255,90,30,${0.32 + vsHeat * 0.2}) 0%, transparent 70%),
             radial-gradient(70% 18% at 50% 0%, rgba(160,20,20,0.25) 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const EMBERS = Array.from({ length: 110 }, (_, i) => ({
  x: random(`ex${i}`) * W,
  y0: random(`ey${i}`) * H,
  speed: 1.6 + random(`es${i}`) * 4.2,
  size: 2 + random(`ez${i}`) ** 3 * 7,
  sway: 10 + random(`ew${i}`) * 40,
  phase: random(`ep${i}`) * Math.PI * 2,
  late: i >= 55, // these only join once VS lands
}));

const Embers: React.FC<{ frame: number; intensity: number; startFade: number }> = ({
  frame,
  intensity,
  startFade,
}) => (
  <AbsoluteFill style={{ mixBlendMode: "screen" }}>
    {EMBERS.map((e, i) => {
      if (e.late && intensity <= 0) return null;
      const speed = e.speed * (1 + intensity * 0.9);
      const travel = frame * speed;
      const y = (((e.y0 - travel) % (H + 60)) + H + 60) % (H + 60) - 30;
      const x = e.x + Math.sin(frame / 22 + e.phase) * e.sway;
      const flicker = 0.55 + 0.45 * Math.sin(frame * 0.6 + e.phase * 3);
      const heightFade = interpolate(y, [0, 500, H], [0.15, 0.8, 1], clamp);
      const gate = e.late ? intensity : 1;
      const o = flicker * heightFade * gate * startFade;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: e.size,
            height: e.size,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#FFD08A" : "#FF7A2E",
            boxShadow: `0 0 ${e.size * 3}px ${e.size}px rgba(255,90,20,0.55)`,
            opacity: o,
          }}
        />
      );
    })}
  </AbsoluteFill>
);

const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg
    width={W}
    height={H}
    style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22 }}
  >
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter="url(#grain)" />
  </svg>
);

// ---------- coach frame ----------
const CH = 46; // chamfer size
const framePath = (w: number, h: number) =>
  `M${CH},0 L${w - CH},0 L${w},${CH} L${w},${h - CH} L${w - CH},${h} L${CH},${h} L0,${h - CH} L0,${CH} Z`;

const CoachFrame: React.FC<{
  side: "left" | "right";
  name: string;
  src?: string;
  frame: number;
  start: number;
  fps: number;
}> = ({ side, name, src, frame, start, fps }) => {
  const x0 = side === "left" ? L.leftX : L.rightX;
  const w = L.frameW;
  const photoH = L.frameBottom - L.frameTop - L.plateH + 18;
  const slide = frame < start
    ? 0
    : spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
  const off = (side === "left" ? -1 : 1) * (w + 120) * (1 - slide);
  const visible = frame >= start - 1;
  const plate = slam(frame, start + 2, fps, 1.8);
  const hot = decay(frame, start, 14); // edge heat right after the hit
  const id = `clip-${side}`;

  if (!visible) return null;
  return (
    <>
      {/* photo window */}
      <div
        style={{
          position: "absolute",
          left: x0,
          top: L.frameTop,
          width: w,
          height: photoH,
          transform: `translateX(${off}px)`,
        }}
      >
        <svg width={w} height={photoH} style={{ position: "absolute", overflow: "visible" }}>
          <defs>
            <clipPath id={id}>
              <path d={framePath(w, photoH)} />
            </clipPath>
            <radialGradient id={`${id}-fill`} cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#120707" />
              <stop offset="70%" stopColor="#0a0404" />
              <stop offset="100%" stopColor="#3a0708" />
            </radialGradient>
            <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={10 + hot * 10} />
            </filter>
            <filter id={`${id}-grit`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={2} seed={side === "left" ? 3 : 9} />
              <feDisplacementMap in="SourceGraphic" scale="5" />
            </filter>
          </defs>
          <path
            d={framePath(w, photoH)}
            fill="none"
            stroke={RED}
            strokeWidth={16}
            opacity={0.55 + hot * 0.45}
            filter={`url(#${id}-glow)`}
          />
          <g clipPath={`url(#${id})`}>
            <rect width={w} height={photoH} fill={`url(#${id}-fill)`} />
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `path('${framePath(w, photoH)}')`,
            boxShadow: "inset 0 0 70px rgba(200,20,20,0.55)",
          }}
        >
          {src ? (
            <>
            <Img
              src={staticFile(src)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 0%",
                // pull both photos into the poster's grade: studio-bright Pablo down, Media Day D.R.E.D. up
                filter:
                  side === "left"
                    ? "brightness(0.86) contrast(1.12) saturate(0.85)"
                    : "brightness(1.3) contrast(1.06) saturate(0.95)",
                // D.R.E.D.'s Media Day crop is wider (hat + fists), so push in to match Pablo's face size
                transform: side === "right" ? "scale(1.2)" : undefined,
                transformOrigin: "50% 12%",
              }}
            />
            {/* red rim + floor fade so the cutout sits in the frame */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(10,2,2,0.85) 100%), radial-gradient(120% 80% at 50% 30%, rgba(0,0,0,0) 55%, rgba(120,10,10,0.45) 100%)",
                mixBlendMode: "multiply",
              }}
            />
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                paddingBottom: 150,
                justifyContent: "center",
                fontFamily: "Menlo, monospace",
                fontSize: 22,
                letterSpacing: 4,
                color: "rgba(255,255,255,0.18)",
              }}
            >
              [{name} CUTOUT]
            </div>
          )}
        </div>
        <svg width={w} height={photoH} style={{ position: "absolute", overflow: "visible" }}>
          <path
            d={framePath(w, photoH)}
            fill="none"
            stroke="#E9E2E2"
            strokeWidth={4}
            opacity={0.85}
            filter={`url(#${id}-grit)`}
          />
          <path
            d={framePath(w - 16, photoH - 16)}
            transform="translate(8,8)"
            fill="none"
            stroke={RED}
            strokeWidth={2.5}
            opacity={0.8}
          />
        </svg>
      </div>

      {/* name plate */}
      <div
        style={{
          position: "absolute",
          left: x0 + 6,
          top: L.frameBottom - L.plateH,
          width: w - 12,
          height: L.plateH,
          transform: `translateX(${off}px) scale(${plate.scale})`,
          opacity: plate.opacity,
          transformOrigin: "50% 50%",
          background: "linear-gradient(180deg, #1d1b1b 0%, #0b0a0a 100%)",
          border: "3px solid #3a3333",
          outline: `2px solid rgba(227,36,43,${0.5 + hot * 0.5})`,
          outlineOffset: 4,
          boxShadow: `0 0 ${24 + hot * 40}px rgba(227,36,43,${0.35 + hot * 0.5})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: TEKO,
            fontWeight: 700,
            fontSize: 118,
            lineHeight: 1,
            marginTop: 10,
            color: TEXT_LIGHT,
            letterSpacing: 1,
            textShadow: `-4px 4px 0 ${RED_DEEP}, -7px 7px 0 #2a0405`,
          }}
        >
          {name}
        </div>
        {/* red brush underline */}
        <div
          style={{
            position: "absolute",
            bottom: 9,
            left: "14%",
            width: "72%",
            height: 6,
            borderRadius: 6,
            background: `linear-gradient(90deg, transparent 0%, ${RED} 18%, ${RED} 70%, transparent 100%)`,
            transform: "skewX(-20deg)",
          }}
        />
      </div>
    </>
  );
};

// ---------- main ----------
export const PabloDreadCountdown: React.FC<PabloDreadProps> = ({
  pabloSrc,
  dreadSrc,
  days = "3 DAYS",
  date = "11.11",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = DURATION; // the countdown part; the end tag follows

  const fPablo = f(BEATS.pablo);
  const fDread = f(BEATS.dread);
  const fVs = f(BEATS.vs);
  const fDays = f(BEATS.days);
  const fWho = f(BEATS.who);

  // scene fades up out of black in the heartbeat section
  const sceneLight = interpolate(frame, [0, f(BEATS.heart2), fPablo], [0, 0.1, 1], clamp);
  const emberStart = interpolate(frame, [4, 30], [0, 1], clamp);
  const emberIntensity = interpolate(frame, [fVs, fVs + 10], [0, 1], clamp);

  const vs = slam(frame, fVs, fps, 2.6);
  const vsHeat = decay(frame, fVs, 26);
  const vsPulse =
    frame > fWho ? 0.5 + 0.5 * Math.sin(((frame - fWho) / fps) * Math.PI * 1.3) : 0;

  const daysSlam = slam(frame, fDays, fps, 1.8);
  const subFade = interpolate(frame, [fDays + 6, fDays + 18], [0, 1], clamp);
  const brandFade = interpolate(frame, [fDays + 8, fDays + 20], [0, 1], clamp);
  const whoFade = interpolate(frame, [fWho, fWho + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const whoRise = interpolate(frame, [fWho, fWho + 14], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dateFade = interpolate(frame, [fWho + 6, fWho + 20], [0, 1], clamp);
  const lineGrow = interpolate(frame, [fWho + 2, fWho + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // flashes
  const red =
    decay(frame, f(BEATS.heart1), 7) * 0.38 + decay(frame, f(BEATS.heart2), 7) * 0.45;
  const white =
    decay(frame, fPablo, 6) * 0.8 +
    decay(frame, fDread, 6) * 0.8 +
    decay(frame, fVs, 8) * 0.95 +
    decay(frame, fDays, 5) * 0.55;
  // riser: brief strobes building into the VS hit
  const riserStrobe =
    frame >= f(BEATS.riserStart) && frame < fVs
      ? (Math.floor(frame / 3) % 2 === 0 ? 1 : 0) *
        interpolate(frame, [f(BEATS.riserStart), fVs], [0.03, 0.22], clamp)
      : 0;

  const s = shake(frame);
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.035]);
  const riserZoom = interpolate(frame, [f(BEATS.riserStart), fVs, fVs + 6], [0, 0.03, 0], clamp);
  const tailFade = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 1], clamp);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={DURATION}>
        <Audio src={staticFile("pablo-dread-countdown/countdown-sfx.wav")} />
      </Sequence>

      <AbsoluteFill
        style={{
          transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${1 + riserZoom})`,
          opacity: tailFade,
        }}
      >
        <AbsoluteFill style={{ opacity: sceneLight }}>
          {/* background overscanned so the shake never shows an edge */}
          <AbsoluteFill style={{ transform: `scale(${1.08 * zoom})` }}>
            <Smoke frame={frame} vsHeat={vsHeat + vsPulse * 0.3} />
          </AbsoluteFill>
          {/* center spine behind VS, like the poster */}
          <div
            style={{
              position: "absolute",
              left: W / 2 - 70,
              top: L.frameTop - 80,
              width: 140,
              height: L.frameBottom - L.frameTop + 160,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)",
            }}
          />
          {/* outer panel border (poster has a thin box around the frames) */}
          <div
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              top: L.frameTop - 22,
              height: L.frameBottom - L.frameTop + 44,
              border: "2px solid rgba(120,30,30,0.55)",
              opacity: interpolate(frame, [fPablo, fPablo + 10], [0, 1], clamp),
            }}
          />
        </AbsoluteFill>

        <Embers frame={frame} intensity={emberIntensity} startFade={emberStart} />

        <CoachFrame side="left" name="PABLO" src={pabloSrc} frame={frame} start={fPablo} fps={fps} />
        <CoachFrame side="right" name="D.R.E.D." src={dreadSrc} frame={frame} start={fDread} fps={fps} />

        {/* VS fire glow */}
        <div
          style={{
            position: "absolute",
            left: W / 2 - 420,
            top: (L.frameTop + L.frameBottom) / 2 - 470,
            width: 840,
            height: 840,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,120,40,0.75) 0%, rgba(230,30,20,0.45) 30%, rgba(120,0,0,0) 65%)",
            opacity: frame >= fVs ? 0.35 + vsHeat * 0.65 + vsPulse * 0.25 : 0,
            transform: `scale(${1 + vsHeat * 0.35 + vsPulse * 0.06})`,
            mixBlendMode: "screen",
          }}
        />
        {/* VS */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: W,
            top: (L.frameTop + L.frameBottom) / 2 - 180,
            textAlign: "center",
            transform: `scale(${vs.scale})`,
            opacity: vs.opacity,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 46,
              fontFamily: TEKO,
              fontWeight: 700,
              fontSize: 330,
              lineHeight: 1,
              color: RED_DEEP,
              opacity: 0.55,
              transform: "translate(-18px, 30px) skewX(-14deg)",
              filter: "blur(2px)",
            }}
          >
            VS
          </span>
          <span
            style={{
              position: "relative",
              fontFamily: TEKO,
              fontWeight: 700,
              fontSize: 300,
              lineHeight: 1,
              color: RED_HOT,
              letterSpacing: -4,
              textShadow: `0 0 ${30 + vsHeat * 60 + vsPulse * 30}px rgba(255,60,30,${0.6 + vsPulse * 0.3}), -5px 6px 0 #5a0608`,
            }}
          >
            VS
          </span>
        </div>

        {/* DIFFERENT BREED */}
        <div
          style={{
            position: "absolute",
            top: L.brandY,
            width: W,
            textAlign: "center",
            fontFamily: TEKO,
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: 6,
            color: TEXT_LIGHT,
            opacity: brandFade,
          }}
        >
          DIFFERENT BREED
        </div>

        {/* 3 DAYS */}
        <div
          style={{
            position: "absolute",
            top: L.daysTop,
            width: W,
            textAlign: "center",
            fontFamily: TEKO,
            fontWeight: 700,
            fontSize: 262,
            lineHeight: 1,
            letterSpacing: 6,
            color: TEXT_LIGHT,
            textShadow: `-6px 6px 0 ${RED_DEEP}, -10px 10px 0 #2a0405`,
            transform: `scale(${daysSlam.scale})`,
            opacity: daysSlam.opacity,
          }}
        >
          {days}
        </div>

        {/* UNTIL FIGHT MATCHUP DAY */}
        <div
          style={{
            position: "absolute",
            top: L.subY,
            width: W,
            textAlign: "center",
            fontFamily: TEKO,
            fontWeight: 600,
            fontSize: 52,
            lineHeight: 1,
            letterSpacing: 16,
            color: TEXT_LIGHT,
            opacity: subFade,
            transform: `translateY(${(1 - subFade) * 14}px)`,
          }}
        >
          UNTIL FIGHT MATCHUP DAY
        </div>

        {/* WHO'S FIGHTING WHO? */}
        <div
          style={{
            position: "absolute",
            top: L.whoTop,
            width: W,
            textAlign: "center",
            fontFamily: TEKO,
            fontWeight: 700,
            fontSize: 104,
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: TEXT_LIGHT,
            textShadow: `-4px 4px 0 ${RED_DEEP}`,
            opacity: whoFade,
            transform: `translateY(${whoRise}px)`,
          }}
        >
          WHO’S FIGHTING WHO?
        </div>
        {/* divider with notch */}
        <div
          style={{
            position: "absolute",
            top: L.dividerY,
            left: W / 2 - 420 * lineGrow,
            width: 840 * lineGrow,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${RED} 15%, ${RED} 85%, transparent)`,
            opacity: whoFade,
          }}
        />
        {/* 11.11 */}
        <div
          style={{
            position: "absolute",
            top: L.dateTop,
            width: W,
            textAlign: "center",
            fontFamily: TEKO,
            fontWeight: 700,
            fontSize: 180,
            lineHeight: 1,
            color: "#C21A20",
            letterSpacing: 4,
            textShadow: `0 0 ${18 + vsPulse * 16}px rgba(220,30,30,0.5), -4px 4px 0 #3a0306`,
            opacity: dateFade,
          }}
        >
          {date}
        </div>

        <Grain frame={frame} />
        {/* vignette */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(120% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)",
          }}
        />
      </AbsoluteFill>

      {/* flashes sit above the shake so they cover the whole frame */}
      <AbsoluteFill style={{ background: "#D0161C", opacity: red, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: Math.min(1, white + riserStrobe) }} />

      {/* house slam end tag: WE / ARE / DIFFERENT / BREED. then the DB logo */}
      <Sequence from={TAG_START} durationInFrames={TAG_DUR}>
        <OffthreadVideo
          src={staticFile("pablo-dread-countdown/endtag-v2.mp4")}
          startFrom={TAG_FILE_LEAD}
          muted
        />
      </Sequence>
      <Sequence from={TAG_START - TAG_AUDIO_PRE} durationInFrames={TAG_DUR + TAG_AUDIO_PRE}>
        <Audio
          src={staticFile("pablo-dread-countdown/endtag-v2-audio.wav")}
          startFrom={TAG_FILE_LEAD - TAG_AUDIO_PRE}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
