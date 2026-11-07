import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import {
  BEATS,
  BODY,
  TAG_AUDIO_PRE,
  TAG_DUR,
  TAG_FILE_LEAD,
  TAG_START,
  f,
} from "./timing";

// Modern fight-poster face-off: two profile portraits nose to nose, sparks between them,
// MATCHUP DAY / NOV 11 under. Text stays inside y 250..1580 (IG safe zone).

const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: OSWALD } = loadOswald("normal", { weights: ["500", "600"], subsets: ["latin"] });

const W = 1080;
const H = 1920;
const RED = "#E8202A";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Portrait placement. Source images are 1696x2528, both drawn 1140x1700.
// Noses meet near center, eyes level at y~500. Joey 11/7: Pablo from v2, D.R.E.D. from v1.
const SIZE = {
  left: { w: 1140, h: 1700, left: -404, top: -86 }, //  Pablo: nose -> (478, 680)
  right: { w: 1140, h: 1700, left: 300, top: -66 }, //  D.R.E.D. (v1 cowboy-hat portrait): nose -> (623, ~650)
};
const SPARK_ORIGIN = { x: 550, y: 640 };

const decay = (frame: number, start: number, len: number) =>
  frame < start ? 0 : Math.max(0, 1 - (frame - start) / len) ** 2;

const slam = (frame: number, start: number, fps: number, from: number) => {
  if (frame < start) return { scale: from, opacity: 0 };
  const s = spring({ frame: frame - start, fps, config: { damping: 10, stiffness: 230, mass: 0.6 } });
  return { scale: from + (1 - from) * s, opacity: interpolate(frame - start, [0, 2], [0, 1], clamp) };
};

const shake = (frame: number) => {
  const hits: [number, number, number][] = [
    [f(BEATS.thump1), 5, 6],
    [f(BEATS.thump2), 5, 6],
    [f(BEATS.pablo), 30, 14],
    [f(BEATS.dred), 30, 14],
    [f(BEATS.impact), 52, 20],
    [f(BEATS.date), 24, 10],
  ];
  let x = 0, y = 0, r = 0;
  for (const [s, amp, len] of hits) {
    const d = decay(frame, s, len);
    if (d <= 0) continue;
    x += (random(`x${frame}-${s}`) - 0.5) * 2 * amp * d;
    y += (random(`y${frame}-${s}`) - 0.5) * 2 * amp * d;
    r += (random(`r${frame}-${s}`) - 0.5) * 1.4 * d * (amp / 30);
  }
  // low-frequency tremor during the riser
  const riser = interpolate(frame, [f(BEATS.riserStart), f(BEATS.impact)], [0, 1], clamp) *
    (frame < f(BEATS.impact) ? 1 : 0);
  x += Math.sin(frame * 2.1) * 4 * riser;
  y += Math.cos(frame * 2.7) * 3 * riser;
  return { x, y, r };
};

// ---------- sparks ----------
type Spark = { x: number; y: number; vx: number; vy: number; life: number; len: number; t0: number };
const AMBIENT: Spark[] = Array.from({ length: 90 }, (_, i) => ({
  x: random(`ax${i}`) * W,
  y: random(`ay${i}`) * H,
  vx: (random(`avx${i}`) - 0.5) * 1.2,
  vy: -(1.2 + random(`avy${i}`) * 3.5),
  life: 0,
  len: 4 + random(`al${i}`) * 10,
  t0: 0,
}));
const BURST: Spark[] = Array.from({ length: 140 }, (_, i) => {
  const a = random(`ba${i}`) * Math.PI * 2;
  const sp = 10 + random(`bs${i}`) ** 0.6 * 34;
  return {
    x: SPARK_ORIGIN.x,
    y: SPARK_ORIGIN.y,
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp * 0.8 - 6,
    life: 18 + random(`bl${i}`) * 40,
    len: 10 + random(`bL${i}`) * 26,
    t0: f(BEATS.impact) + Math.floor(random(`bt${i}`) * 3),
  };
});
// smaller bursts on each slide-in, from where the faces enter
const SLIDE_BURST = (start: number, fromX: number, dir: number, key: string): Spark[] =>
  Array.from({ length: 50 }, (_, i) => {
    const a = (random(`${key}a${i}`) - 0.5) * 1.6;
    const sp = 8 + random(`${key}s${i}`) * 22;
    return {
      x: fromX,
      y: 520 + random(`${key}y${i}`) * 420,
      vx: Math.cos(a) * sp * dir,
      vy: Math.sin(a) * sp - 4,
      life: 14 + random(`${key}l${i}`) * 26,
      len: 8 + random(`${key}L${i}`) * 18,
      t0: start,
    };
  });
const BURSTS = [
  ...BURST,
  ...SLIDE_BURST(f(BEATS.pablo) + 3, 470, 1, "p"),
  ...SLIDE_BURST(f(BEATS.dred) + 3, 620, -1, "d"),
];

const Sparks: React.FC<{ frame: number; intensity: number }> = ({ frame, intensity }) => {
  const lines: React.ReactNode[] = [];
  AMBIENT.forEach((s, i) => {
    const spd = 1 + intensity * 1.6;
    const y = ((((s.y + s.vy * frame * spd) % (H + 40)) + H + 40) % (H + 40)) - 20;
    const x = s.x + s.vx * frame + Math.sin(frame / 15 + i) * 12;
    const fl = 0.5 + 0.5 * Math.sin(frame * 0.7 + i * 1.7);
    const o = (0.25 + 0.55 * intensity) * fl;
    lines.push(
      <line key={`a${i}`} x1={x} y1={y} x2={x - s.vx * 2} y2={y + s.len} stroke={i % 4 ? "#FF8A2A" : "#FFD27A"}
        strokeWidth={2} strokeLinecap="round" opacity={o} />,
    );
  });
  BURSTS.forEach((s, i) => {
    const t = frame - s.t0;
    if (t < 0 || t > s.life) return;
    const drag = Math.pow(0.93, t);
    const dist = (1 - drag) / (1 - 0.93);
    const x = s.x + s.vx * dist;
    const y = s.y + s.vy * dist + 0.35 * t * t;
    const vxN = s.vx * drag, vyN = s.vy * drag + 0.7 * t;
    const sp = Math.hypot(vxN, vyN) || 1;
    const L = Math.min(s.len, sp * 1.6);
    const o = 1 - t / s.life;
    lines.push(
      <line key={`b${i}`} x1={x} y1={y} x2={x - (vxN / sp) * L} y2={y - (vyN / sp) * L}
        stroke={i % 3 ? "#FFB347" : "#FFF1C2"} strokeWidth={2.6} strokeLinecap="round" opacity={o} />,
    );
  });
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      <defs>
        <filter id="sparkglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#sparkglow)">{lines}</g>
    </svg>
  );
};

const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.2 }}>
    <filter id="g2"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 9} />
      <feColorMatrix type="saturate" values="0" /></filter>
    <rect width={W} height={H} filter="url(#g2)" />
  </svg>
);

// ---------- portrait ----------
const Portrait: React.FC<{
  src: string;
  side: "left" | "right";
  frame: number;
  start: number;
  fps: number;
}> = ({ src, side, frame, start, fps }) => {
  if (frame < start - 1) return null;
  const s = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 120, mass: 0.9 } });
  const dir = side === "left" ? -1 : 1;
  const enter = dir * 900 * (1 - s);
  // slow creep toward each other after arriving: the tension
  const creep = -dir * interpolate(frame, [start + 15, BODY], [0, 26], clamp);
  const push = interpolate(frame, [start, BODY], [1.0, 1.05], clamp);
  const blur = Math.max(0, (1 - s) * 18);
  const { w, h, left, top } = SIZE[side];
  // fade the inner edge into black so the two shots merge
  const mask =
    side === "left"
      ? "linear-gradient(90deg, #000 0%, #000 72%, transparent 92%)"
      : "linear-gradient(270deg, #000 0%, #000 72%, transparent 92%)";
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        transform: `translateX(${enter + creep}px) scale(${push})`,
        transformOrigin: side === "left" ? "75% 35%" : "25% 35%",
        filter: `blur(${blur}px) contrast(1.12) saturate(1.05) brightness(${side === "left" ? 1.0 : 1.04})`,
        WebkitMaskImage: mask,
        maskImage: mask,
        mixBlendMode: side === "right" ? "lighten" : undefined,
      }}
    />
  );
};

// flash-frames: 3-frame glimpses of each face on the heartbeats (pure suspense)
const FlashFrame: React.FC<{ src: string; side: "left" | "right"; frame: number; at: number }> = ({
  src, side, frame, at,
}) => {
  const t = frame - at;
  if (t < 0 || t > 3) return null;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: SIZE[side].left + (side === "left" ? 60 : -60),
        top: SIZE[side].top,
        width: SIZE[side].w,
        height: SIZE[side].h,
        opacity: [0.9, 0.6, 0.3, 0.1][t],
        filter: "grayscale(1) contrast(1.6) brightness(1.2)",
        mixBlendMode: "screen",
      }}
    />
  );
};

export const PabloDredFaceOff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fP = f(BEATS.pablo), fD = f(BEATS.dred), fI = f(BEATS.impact), fDate = f(BEATS.date), fN = f(BEATS.names);

  const sparkIntensity = interpolate(frame, [0, fP, f(BEATS.riserStart), fI, fI + 20], [0.15, 0.35, 0.4, 1, 0.7], clamp);
  const matchup = slam(frame, fI + 1, fps, 2.2);
  const date = slam(frame, fDate, fps, 2.0);
  const namesIn = interpolate(frame, [fN, fN + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const topIn = interpolate(frame, [fN + 6, fN + 18], [0, 1], clamp);
  const gapGlow =
    interpolate(frame, [f(BEATS.riserStart), fI], [0.2, 0.7], clamp) * (frame < fI ? 1 : 0) +
    (frame >= fI ? 0.55 + decay(frame, fI, 30) * 0.9 + 0.12 * Math.sin((frame - fI) / 7) : 0);

  const red = decay(frame, f(BEATS.thump1), 8) * 0.4 + decay(frame, f(BEATS.thump2), 8) * 0.45;
  const white =
    decay(frame, fP, 6) * 0.75 + decay(frame, fD, 6) * 0.75 + decay(frame, fI, 9) * 1.0 + decay(frame, fDate, 5) * 0.5;
  const strobe =
    frame >= f(BEATS.riserStart) && frame < fI
      ? (Math.floor(frame / 2) % 3 === 0 ? 1 : 0) * interpolate(frame, [f(BEATS.riserStart), fI], [0.02, 0.28], clamp)
      : 0;
  // suspense pulse after the names: a slow red breath on each sub pulse
  const pulse = frame > fN && frame < f(BEATS.pulseEnd) ? Math.max(0, Math.cos(((frame - fN) / fps) * Math.PI * 2 / 0.75)) ** 6 : 0;

  const sh = shake(frame);
  const riserZoom = interpolate(frame, [f(BEATS.riserStart), fI, fI + 8], [0, 0.04, 0], clamp);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={BODY}>
        <Audio src={staticFile("pablo-dred-faceoff/faceoff-sfx.wav")} />
      </Sequence>

      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + riserZoom})` }}>
        {/* deep red heat behind the gap */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(38% 30% at ${SPARK_ORIGIN.x}px ${SPARK_ORIGIN.y}px, rgba(255,80,20,${0.55 * gapGlow}) 0%, rgba(150,10,10,${0.4 * gapGlow}) 45%, transparent 75%)`,
          }}
        />
        <Portrait src="pablo-dred-faceoff/pablo-ai.png" side="left" frame={frame} start={fP} fps={fps} />
        <Portrait src="pablo-dred-faceoff/dred-ai.png" side="right" frame={frame} start={fD} fps={fps} />
        <FlashFrame src="pablo-dred-faceoff/pablo-ai.png" side="left" frame={frame} at={f(BEATS.thump1)} />
        <FlashFrame src="pablo-dred-faceoff/dred-ai.png" side="right" frame={frame} at={f(BEATS.thump2)} />

        <Sparks frame={frame} intensity={sparkIntensity} />

        {/* scrims so the type reads */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.85) 66%, rgba(0,0,0,0.95) 100%)",
          }}
        />

        {/* top line */}
        <div style={{
          position: "absolute", top: 262, width: W, textAlign: "center", fontFamily: OSWALD, fontWeight: 600,
          fontSize: 46, letterSpacing: 12, color: "#EDEDED", opacity: topIn, lineHeight: 1,
        }}>
          WHO’S FIGHTING WHO?
        </div>

        {/* names under each face */}
        <div style={{
          position: "absolute", top: 1150, left: 70, fontFamily: OSWALD, fontWeight: 600, fontSize: 50,
          letterSpacing: 6, color: "#F2F2F2", opacity: namesIn, transform: `translateX(${(1 - namesIn) * -40}px)`, lineHeight: 1,
        }}>
          COACH <span style={{ color: RED }}>PABLO</span>
        </div>
        <div style={{
          position: "absolute", top: 1150, right: 70, fontFamily: OSWALD, fontWeight: 600, fontSize: 50,
          letterSpacing: 6, color: "#F2F2F2", opacity: namesIn, transform: `translateX(${(1 - namesIn) * 40}px)`, lineHeight: 1,
          textAlign: "right",
        }}>
          COACH <span style={{ color: RED }}>D.R.E.D.</span>
        </div>

        {/* MATCHUP DAY */}
        <div style={{
          position: "absolute", top: 1218, width: W, textAlign: "center", fontFamily: ANTON, fontSize: 168,
          lineHeight: 1, letterSpacing: 4, color: "#FFFFFF", transform: `scale(${matchup.scale})`, opacity: matchup.opacity,
          textShadow: "0 6px 30px rgba(0,0,0,0.8)",
        }}>
          MATCHUP DAY
        </div>
        {/* NOV 11 */}
        <div style={{
          position: "absolute", top: 1392, width: W, textAlign: "center", fontFamily: ANTON, fontSize: 172,
          lineHeight: 1, letterSpacing: 6, color: RED, transform: `scale(${date.scale})`, opacity: date.opacity,
          textShadow: `0 0 ${24 + pulse * 30}px rgba(232,32,42,${0.45 + pulse * 0.4})`,
        }}>
          WED · NOV 11
        </div>

        <Grain frame={frame} />
        <AbsoluteFill style={{ background: "radial-gradient(125% 90% at 50% 45%, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />
        <AbsoluteFill style={{ background: "#B0141B", opacity: pulse * 0.08, mixBlendMode: "screen" }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#D0161C", opacity: red, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: Math.min(1, white + strobe) }} />

      <Sequence from={TAG_START} durationInFrames={TAG_DUR}>
        <OffthreadVideo src={staticFile("pablo-dred-faceoff/endtag-v2.mp4")} startFrom={TAG_FILE_LEAD} muted />
      </Sequence>
      <Sequence from={TAG_START - TAG_AUDIO_PRE} durationInFrames={TAG_DUR + TAG_AUDIO_PRE}>
        <Audio src={staticFile("pablo-dred-faceoff/endtag-v2-audio.wav")} startFrom={TAG_FILE_LEAD - TAG_AUDIO_PRE} />
      </Sequence>
    </AbsoluteFill>
  );
};
