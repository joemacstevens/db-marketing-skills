import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  DBS_FONTS,
  DBS_COLORS,
  DBS_TRACKING,
  REEL_WIDTH,
  REEL_HEIGHT,
  SAFE,
  useDBSFonts,
} from "./design-system";
import { SlashLabel, Ribbon, Slam, FlashWipe } from "./celebrate/kit";

/*
 * ─── THE UBE CHALLENGE — August 2026 announce reel ───────────────────────
 *
 * Duration: 750 frames @ 30fps = 25.0s.  Comp id: UbeChallengeAug
 *
 * ── MUSIC / BEAT GRID ──────────────────────────────────────────────────
 * Bed: reels/public/ube-challenge/bed-final.mp3, built from beat-final.mp3
 * (ElevenLabs dark trap, 140 BPM). The raw take is 27.06s but only carries
 * ~15.6s of usable groove after the drop, so the bed is a phase-locked loop:
 *
 *     A = beat-final[6.880 .. 20.630]   (8 bars from the drop)
 *   + B = beat-final[13.755 .. 27.062]  (spliced 4 bars back, phase-perfect,
 *                                        carries the track's natural fade-out)
 *   = 27.06s bed, full energy 0 .. 22.5s, natural fade 22.5 .. 26.0s.
 *
 * Frame 0 of this comp = the drop. Audio plays from bed frame 0, so no
 * startFrom offset is needed. The bed's own fade-out lands across the end
 * card (full energy through frame 675, end card starts at 644).
 *
 * Measured grid (aubiotrack + 100ms RMS on beat-final.mp3):
 *   drop transient .......... 6.88s   → comp frame 0
 *   tempo ................... 140 BPM → beat 0.42969s = 12.891 frames
 *   bar (4/4) ............... 1.71875s = 51.5625 frames
 *   2-bar phrase ............ 3.4375s  = 103.125 frames
 *
 * NOTE: the handoff brief said the drop was at 6.0s. Measured RMS says
 * otherwise — energy is flat at ~-20 dBFS through 6.70s and jumps to
 * -14 dB at 6.80 / -8 dB at 6.90. The first heavy 808 is at 6.88s.
 *
 * sec (bed) → frame table, every bar:
 *   0.000→0    1.719→52    3.438→103   5.156→155   6.875→206
 *   8.594→258  10.313→309  12.031→361  13.750→413  15.469→464
 *   17.188→516 18.906→567  20.625→619  22.344→670  24.063→722
 *
 * ── BEAT PLAN (every cut lands within 0.5f of a beat) ───────────────────
 *   0–52    COLD OPEN   open.mp4, pure footage, no type          (bar 1)
 *   52–155  TITLE       same clip runs; THE UBE / CHALLENGE      (bars 2–3)
 *   155–258 WOMEN       women.mp4 + natural coach audio,
 *                       WOMEN / 30 SEC + draining timer bar      (bars 4–5)
 *   258–361 MEN         men.mp4, MEN / 40 SEC + draining bar     (bars 6–7)
 *   361–438 SLAM        push.mp4, FURTHEST / DISTANCE / WINS.    (bars 8–8.5)
 *   438–567 PRIZE       graphic card, $150 Visa gift card        (bars 9–11)
 *   567–644 TEASE       women.mp4 later segment, YOUR NAME       (bars 12–12.5)
 *   644–750 END CARD    PUSH HARD / GO FURTHER / BE DIFFERENT    (bars 13–14.5)
 *
 * ── FOOTAGE ────────────────────────────────────────────────────────────
 * All trims HDR-tonemapped via scripts/hdr-tonemap.sh (iPhone HLG/bt2020).
 *   open.mp4  ← June 11, 2025/IMG_2752.mov        11.5–19.5s
 *   women.mp4 ← January 8, 2026/IMG_2704.mov       1.0–13.0s (natural audio)
 *   men.mp4   ← August 26, 2025/IMG_5391.mov      13.0–19.0s (muted)
 *   push.mp4  ← 2026/5-13-Bundle/Its Just Work V2/IMG_6195.mov 0.5–9.5s
 *
 * The brief's opener (July 2026 - Don Clips/IMG_8612.mov) has no UBE in it
 * at all — it is a kids circuit clip (med ball, Jacob's Ladder, air bike).
 * IMG_2752 replaces it: two adults on branded HIIT UBEs, wide and clean.
 * IMG_5391 (a man) carries the MEN card and IMG_6195 (a woman) the slam,
 * so no division card ever sits over the wrong athlete.
 *
 * Design: Stamp/Poster system — black / #E81D1D red / bone, NORD Black
 * Italic display, hard 4px black offset shadow, skewed red chips.
 * SAFE = 210 / 420 / 120, so usable width is 840px — display type is
 * capped at 118px and the end card at 80px so nothing clips.
 */

export const UBE_CHALLENGE_DURATION = 750;

const BED_SRC = "ube-challenge/bed-final.mp3";

const RED = DBS_COLORS.red500; // #E81D1D
const BONE = DBS_COLORS.bone; // #F6F2EC
const BLACK = DBS_COLORS.black; // #0A0A0A
const INK = DBS_COLORS.ink2; // #1F1F1F
const GOLD = DBS_COLORS.gold; // #E5B53D
const HARD_SHADOW = "4px 4px 0 #000";

// ── Cut grid ────────────────────────────────────────────────────────────
const T_TITLE = 52;
const T_WOMEN = 155;
const T_MEN = 258;
const T_SLAM = 361;
const T_PRIZE = 438;
const T_TEASE = 567;
const T_END = 644;

// The natural coach audio ("reach and pull") sits in the first 2.4s of
// women.mp4, i.e. comp frames 155–227. Bed ducks around that window.
const DUCK_IN = 148;
const DUCK_OUT = 236;

// ─── Video beat: footage + brand grade + readability scrim ───────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  startFrom?: number;
  muted?: boolean;
  volume?: number;
  brightness?: number;
  scrim?: number;
  fade?: boolean;
  children?: React.ReactNode;
}> = ({
  src,
  durationInFrames,
  startFrom = 0,
  muted = true,
  volume = 1,
  brightness = 0.94,
  scrim = 0.62,
  fade = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = fade ? Math.min(fadeIn, fadeOut) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <div style={{ opacity, width: "100%", height: "100%" }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={startFrom}
          muted={muted}
          volume={volume}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness}) contrast(1.12) saturate(1.04)`,
          }}
        />
      </div>
      {/* corner vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,0.5) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      {/* bottom scrim for lower-third type */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(5,5,5,0) 38%, rgba(5,5,5,${
            scrim * 0.6
          }) 64%, rgba(5,5,5,${scrim}) 100%)`,
          opacity,
          pointerEvents: "none",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// ─── Skewed red kicker chip ──────────────────────────────────────────────
const Kicker: React.FC<{
  children: React.ReactNode;
  delay?: number;
  fontSize?: number;
}> = ({ children, delay = 0, fontSize = 32 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        alignSelf: "flex-start",
        transform: "skew(-7deg)",
        background: RED,
        padding: "8px 20px 10px",
        boxShadow: HARD_SHADOW,
        opacity: o,
      }}
    >
      <div
        style={{
          transform: "skew(7deg)",
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize,
          letterSpacing: DBS_TRACKING.widest,
          color: "#fff",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Lower-third stamp wrapper ───────────────────────────────────────────
const LowerThird: React.FC<{
  inAt: number;
  outAt?: number;
  children: React.ReactNode;
}> = ({ inAt, outAt, children }) => {
  const frame = useCurrentFrame();
  const oIn = interpolate(frame, [inAt, inAt + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const oOut =
    outAt != null
      ? interpolate(frame, [outAt, outAt + 10], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const rise = interpolate(frame, [inAt, inAt + 14], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill
      style={{
        padding: `0 ${SAFE.sides}px ${SAFE.bottom}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        opacity: Math.min(oIn, oOut),
        transform: `translateY(${rise}px)`,
        pointerEvents: "none",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ─── Beat 2: title — THE UBE / CHALLENGE over the opener ─────────────────
const TitleBeat: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [16, 34], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  return (
    <VideoBeat
      src="ube-challenge/open.mp4"
      startFrom={T_TITLE}
      durationInFrames={dur}
      scrim={0.74}
    >
      <LowerThird inAt={4} outAt={dur - 12}>
        <Kicker delay={4}>August Challenge</Kicker>
        <div
          style={{
            marginTop: 16,
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 0.86,
            letterSpacing: DBS_TRACKING.tight,
            color: BONE,
            textTransform: "uppercase",
            textShadow: HARD_SHADOW,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontSize: 86 }}>THE UBE</div>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              fontSize: 112,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: "0.06em -0.05em 0.04em -0.05em",
                background: RED,
                transform: "skew(-6deg)",
                clipPath: `inset(0 ${100 - wipe}% 0 0)`,
                zIndex: 0,
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>CHALLENGE</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: DBS_TRACKING.wider,
            color: BONE,
            textTransform: "uppercase",
            borderTop: `4px solid ${RED}`,
            paddingTop: 14,
          }}
        >
          Power. Push. Perform.
        </div>
      </LowerThird>
    </VideoBeat>
  );
};

// ─── Draining timer bar (RingsideRiddle mechanic) ────────────────────────
const DrainBar: React.FC<{ inAt: number; dur: number }> = ({ inAt, dur }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [inAt, dur - 6], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const o = interpolate(frame, [inAt - 6, inAt + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ marginTop: 20, width: 840, opacity: o }}>
      <div
        style={{
          height: 16,
          width: "100%",
          background: "rgba(246,242,236,0.18)",
          boxShadow: "3px 3px 0 rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ height: "100%", width: `${w}%`, background: RED }} />
      </div>
    </div>
  );
};

// ─── Beats 3 + 4: the two division rules ─────────────────────────────────
const RulesBeat: React.FC<{
  src: string;
  dur: number;
  division: string;
  seconds: string;
  startFrom?: number;
  muted?: boolean;
  brightness?: number;
}> = ({ src, dur, division, seconds, startFrom = 0, muted = true, brightness = 0.9 }) => (
  <VideoBeat
    src={src}
    startFrom={startFrom}
    durationInFrames={dur}
    muted={muted}
    brightness={brightness}
    scrim={0.78}
  >
    <LowerThird inAt={4} outAt={dur - 12}>
      <Kicker delay={4}>How far can you go?</Kicker>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "baseline",
          gap: 28,
        }}
      >
        <div
          style={{
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 54,
            letterSpacing: DBS_TRACKING.wider,
            color: BONE,
            textTransform: "uppercase",
            textShadow: HARD_SHADOW,
          }}
        >
          {division}
        </div>
        <div
          style={{
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 140,
            lineHeight: 0.86,
            letterSpacing: DBS_TRACKING.tight,
            color: RED,
            textTransform: "uppercase",
            textShadow: "5px 5px 0 #000",
          }}
        >
          {seconds}
          <span style={{ fontSize: 62 }}> SEC</span>
        </div>
      </div>
      <DrainBar inAt={12} dur={dur} />
    </LowerThird>
  </VideoBeat>
);

// ─── Beat 5: the slam ────────────────────────────────────────────────────
const SlamBeat: React.FC<{ dur: number }> = ({ dur }) => (
  <VideoBeat
    src="ube-challenge/push.mp4"
    startFrom={60}
    durationInFrames={dur}
    brightness={0.82}
    scrim={0.86}
  >
    <FlashWipe />
    <AbsoluteFill
      style={{
        padding: `0 ${SAFE.sides}px ${SAFE.bottom}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
      }}
    >
      {["FURTHEST", "DISTANCE", "WINS."].map((line, i) => (
        <Slam key={line} startFrame={10 + i * 8} rotate={-2}>
          <div
            style={{
              fontFamily: DBS_FONTS.display,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 118,
              lineHeight: 0.9,
              letterSpacing: DBS_TRACKING.tight,
              color: i === 1 ? RED : BONE,
              textTransform: "uppercase",
              textShadow: i === 1 ? "6px 6px 0 #140000" : "6px 6px 0 #000",
            }}
          >
            {line}
          </div>
        </Slam>
      ))}
    </AbsoluteFill>
  </VideoBeat>
);

// ─── Code-drawn $150 Visa gift card: slams in, then a slow bob ───────────
// Mirrors the lobby panel's card (PanelUbeChallenge frame C) so the prize
// reads identically on the TV and in the reel.
const GiftCard: React.FC<{ startFrame: number; width?: number }> = ({
  startFrame,
  width = 560,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 150 },
    durationInFrames: 24,
  });
  const pop = interpolate(s, [0, 1], [0.8, 1]);
  const o = interpolate(frame - startFrame, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Gentle bob after landing — transform only, ±5px on a slow sine.
  const bob = Math.sin((Math.max(0, frame - startFrame - 24) / fps) * 1.6) * 5;
  const height = Math.round(width / 1.586); // credit-card ratio

  return (
    <div
      style={{
        width,
        height,
        opacity: o,
        transform: `rotate(-6deg) scale(${pop}) translateY(${bob}px)`,
        background: "linear-gradient(135deg, #C91414, #E81D1D)",
        border: `4px solid ${BLACK}`,
        boxShadow: "14px 14px 0 rgba(0,0,0,0.75)",
        padding: "30px 38px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "left",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 21,
            letterSpacing: DBS_TRACKING.widest,
            color: "rgba(246,242,236,0.85)",
            textTransform: "uppercase",
          }}
        >
          Different Breed
        </span>
        <span
          style={{
            width: 58,
            height: 42,
            background: GOLD,
            border: `3px solid ${BLACK}`,
            borderRadius: 7,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 122,
          lineHeight: 1,
          color: BONE,
          textShadow: "6px 6px 0 #140000",
        }}
      >
        $150
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 38,
          letterSpacing: "0.04em",
          color: BLACK,
          textTransform: "uppercase",
        }}
      >
        Visa Gift Card
      </div>
      <div
        style={{
          marginTop: "auto",
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: DBS_TRACKING.widest,
          color: "rgba(246,242,236,0.78)",
          textTransform: "uppercase",
        }}
      >
        One per division winner
      </div>
    </div>
  );
};

// ─── Beat 6: the prize card ──────────────────────────────────────────────
const PrizeChip: React.FC<{
  label: string;
  division: string;
  delay: number;
}> = ({ label, division, delay }) => (
  <Slam startFrame={delay} rotate={-2} from={0.86}>
    <div
      style={{
        background: INK,
        boxShadow: HARD_SHADOW,
        borderTop: `5px solid ${RED}`,
        padding: "14px 26px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: DBS_TRACKING.widest,
          color: DBS_COLORS.steel,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 46,
          lineHeight: 1,
          color: BONE,
          textTransform: "uppercase",
        }}
      >
        {division}
      </div>
    </div>
  </Slam>
);

const PrizeCard: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity: inOp,
        background: `radial-gradient(900px 520px at 50% 24%, rgba(255,255,255,0.06), transparent 68%), radial-gradient(760px 420px at 22% 86%, rgba(232,29,29,0.24), transparent 70%), ${BLACK}`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 7px)",
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
        <SlashLabel startFrame={2}>AUGUST 1 TO 31 · ALL MEMBERS</SlashLabel>

        <div
          style={{
            marginTop: 26,
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: DBS_TRACKING.widest,
            color: RED,
            textTransform: "uppercase",
            opacity: interpolate(frame, [8, 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Take your division
        </div>

        <div style={{ marginTop: 14 }}>
          <Slam startFrame={10} rotate={-2}>
            <div
              style={{
                fontFamily: DBS_FONTS.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: 82,
                lineHeight: 0.94,
                letterSpacing: DBS_TRACKING.tight,
                color: BONE,
                textTransform: "uppercase",
                textShadow: "7px 7px 0 #141414",
                whiteSpace: "nowrap",
              }}
            >
              <div>
                WIN A <span style={{ color: RED }}>$150</span>
              </div>
              <div>VISA GIFT CARD</div>
            </div>
          </Slam>
        </div>

        <div style={{ marginTop: 34 }}>
          <GiftCard startFrame={16} width={560} />
        </div>

        <div style={{ marginTop: 30, display: "flex", gap: 26 }}>
          <PrizeChip label="Top distance" division="Men" delay={46} />
          <PrizeChip label="Top distance" division="Women" delay={54} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 7: tease ───────────────────────────────────────────────────────
const TeaseBeat: React.FC<{ dur: number }> = ({ dur }) => (
  <VideoBeat
    src="ube-challenge/women.mp4"
    startFrom={250}
    durationInFrames={dur}
    brightness={0.86}
    scrim={0.84}
  >
    <LowerThird inAt={6} outAt={dur - 10}>
      <Kicker delay={6}>Every attempt gets logged</Kicker>
      <div
        style={{
          marginTop: 16,
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 112,
          lineHeight: 0.86,
          letterSpacing: DBS_TRACKING.tight,
          color: BONE,
          textTransform: "uppercase",
          textShadow: HARD_SHADOW,
          whiteSpace: "nowrap",
        }}
      >
        <div>YOUR NAME</div>
        <div>GOES ON</div>
        <div>
          THE <span style={{ color: RED }}>BOARD.</span>
        </div>
      </div>
    </LowerThird>
  </VideoBeat>
);

// ─── Beat 8: end card (house style — no logo, @handle is the sign-off) ───
const UbeEndCard: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity: inOp,
        background: `radial-gradient(900px 520px at 50% 26%, rgba(255,255,255,0.06), transparent 68%), radial-gradient(700px 360px at 20% 86%, rgba(232,29,29,0.22), transparent 70%), radial-gradient(620px 340px at 82% 90%, rgba(232,29,29,0.16), transparent 70%), ${BLACK}`,
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 7px)",
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
        <SlashLabel startFrame={0}>AUGUST CHALLENGE · ALL MONTH</SlashLabel>

        <div style={{ marginTop: 34 }}>
          {["PUSH HARD.", "GO FURTHER.", "BE DIFFERENT."].map((line, i) => (
            <Slam key={line} startFrame={4 + i * 7} rotate={-2}>
              <div
                style={{
                  fontFamily: DBS_FONTS.display,
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontSize: 80,
                  lineHeight: 1.0,
                  letterSpacing: DBS_TRACKING.tight,
                  color: i === 2 ? RED : BONE,
                  textTransform: "uppercase",
                  textShadow: i === 2 ? "7px 7px 0 #140000" : "7px 7px 0 #141414",
                }}
              >
                {line}
              </div>
            </Slam>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          <Ribbon startFrame={30} fontSize={58}>
            GET ON THE BOARD
          </Ribbon>
        </div>

        <Slam startFrame={40} rotate={0}>
          <div
            style={{
              marginTop: 30,
              fontFamily: DBS_FONTS.utility,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: DBS_TRACKING.wide,
              color: BONE,
              textTransform: "uppercase",
              textShadow: "3px 3px 0 #000",
            }}
          >
            Log your distance at the front desk
          </div>
        </Slam>

        <Slam startFrame={50} rotate={0}>
          <div
            style={{
              marginTop: 34,
              fontFamily: DBS_FONTS.utility,
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: DBS_TRACKING.widest,
              color: RED,
              textTransform: "uppercase",
            }}
          >
            @DBELITEFITNESS
          </div>
        </Slam>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Persistent corner logo (footage beats only, never the end card) ─────
const CornerLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [12, 34], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top - 40,
        right: 130,
        opacity: o,
        pointerEvents: "none",
      }}
    >
      <Img src={staticFile("db-logo-red-outline.png")} style={{ width: 66, height: 66 }} />
    </div>
  );
};

// ─── Main composition ────────────────────────────────────────────────────
export const UbeChallenge: React.FC = () => {
  useDBSFonts();
  return (
    <AbsoluteFill
      style={{ backgroundColor: BLACK, width: REEL_WIDTH, height: REEL_HEIGHT }}
    >
      {/* 1. cold open — pure footage, no type (house rule) */}
      <Sequence from={0} durationInFrames={T_TITLE}>
        <VideoBeat
          src="ube-challenge/open.mp4"
          durationInFrames={T_TITLE}
          scrim={0.28}
        />
      </Sequence>

      {/* 2. title — the same clip keeps running underneath */}
      <Sequence from={T_TITLE} durationInFrames={T_WOMEN - T_TITLE}>
        <TitleBeat dur={T_WOMEN - T_TITLE} />
      </Sequence>

      {/* 3. women 30 sec — natural coach audio ("reach and pull") */}
      <Sequence from={T_WOMEN} durationInFrames={T_MEN - T_WOMEN}>
        <RulesBeat
          src="ube-challenge/women.mp4"
          dur={T_MEN - T_WOMEN}
          division="Women"
          seconds="30"
          muted={false}
          brightness={0.9}
        />
      </Sequence>

      {/* 4. men 40 sec — muted (unrelated room speech on the source) */}
      <Sequence from={T_MEN} durationInFrames={T_SLAM - T_MEN}>
        <RulesBeat
          src="ube-challenge/men.mp4"
          dur={T_SLAM - T_MEN}
          division="Men"
          seconds="40"
          startFrom={20}
          brightness={0.92}
        />
      </Sequence>

      {/* 5. slam */}
      <Sequence from={T_SLAM} durationInFrames={T_PRIZE - T_SLAM}>
        <SlamBeat dur={T_PRIZE - T_SLAM} />
      </Sequence>

      {/* 6. prize card — $150 Visa gift card */}
      <Sequence from={T_PRIZE} durationInFrames={T_TEASE - T_PRIZE}>
        <PrizeCard dur={T_TEASE - T_PRIZE} />
      </Sequence>

      {/* 7. tease */}
      <Sequence from={T_TEASE} durationInFrames={T_END - T_TEASE}>
        <TeaseBeat dur={T_END - T_TEASE} />
      </Sequence>

      {/* 8. end card */}
      <Sequence from={T_END} durationInFrames={UBE_CHALLENGE_DURATION - T_END}>
        <UbeEndCard dur={UBE_CHALLENGE_DURATION - T_END} />
      </Sequence>

      {/* corner logo over the footage beats only */}
      <Sequence from={0} durationInFrames={T_END}>
        <CornerLogo />
      </Sequence>

      {/* Music bed — frame 0 is the drop. Ducks under the natural coach
          audio on the women beat; the bed's own fade-out covers the end. */}
      <Audio
        src={staticFile(BED_SRC)}
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              10,
              DUCK_IN,
              DUCK_IN + 10,
              DUCK_OUT - 10,
              DUCK_OUT,
              UBE_CHALLENGE_DURATION - 20,
              UBE_CHALLENGE_DURATION,
            ],
            [0, 0.92, 0.92, 0.3, 0.3, 0.92, 0.92, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
    </AbsoluteFill>
  );
};
