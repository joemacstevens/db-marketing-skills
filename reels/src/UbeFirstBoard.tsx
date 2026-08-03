import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  interpolate,
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
import {
  SlashLabel,
  Ribbon,
  Slam,
  FlashWipe,
  CardGround,
  bedVolume,
  dbsFontFamilies,
} from "./celebrate/kit";

/*
 * ─── UBE CHALLENGE — WEEK 1: "IT HAS BEGUN." ────────────────────────────
 *
 * Duration: 750 frames @ 30fps = 25.0s.  Comp id: UbeFirstBoard
 *
 * Follow-up to UbeChallengeAug (the announce reel) — same bed, same grid,
 * same design vocabulary, now with the first three names on the board.
 *
 * Bed: ube-challenge/bed-final.mp3 (140 BPM, drop at frame 0, bar =
 * 51.5625f — see UbeChallenge.tsx header for the full grid math). Bed's
 * own fade-out covers the end card, exactly like the announce reel.
 *
 * Footage (aug3/ proxies, HDR-tonemapped, portrait 720x1280):
 *   IMG_9487  Doug's 40s sprint. Don narrates on tape. startFrom 2.2s so
 *             "It has begun" (3.46–4.38s) lands at comp f38–66, right as
 *             the title slams at f52. "Doug is the first to accept the
 *             challenge" (6.96–10.74s) → comp f143–256, inside the Doug
 *             beat. Clip runs unbroken f0–361.
 *   IMG_9490  Owen. Crowd "come on" tape, plays under his beat.
 *   IMG_9549  Dawn Baxter, women's leader. Muted, bed carries.
 *
 * Beat plan (cuts on the 140 BPM bar grid):
 *   0–52     COLD OPEN  9487, pure footage, Don's voice starts
 *   52–155   TITLE      IT HAS / BEGUN. (red wipe), clip runs under
 *   155–361  DOUG       chip DOUG · 24 M · 40 SEC + tape caption
 *   361–464  OWEN       chip OWEN · 23 M · 40 SEC, crowd tape
 *   464–567  DAWN       chip DAWN BAXTER · 15 M · 30 SEC + WOMEN'S LEAD
 *   567–670  BOARD      week-1 standings card (matches the lobby panel)
 *   670–750  END CARD   THE BOARD IS OPEN. / COME TAKE THE TOP SPOT
 *
 * Board figures match the live lobby Blob board (2026-08-03):
 * Women 30s: Dawn Baxter 15. Men 40s: Doug 24, Owen 23.
 */

export const UBE_FIRST_BOARD_DURATION = 750;

const BED_SRC = "ube-challenge/bed-final.mp3";

const RED = DBS_COLORS.red500;
const BONE = DBS_COLORS.bone;
const BLACK = DBS_COLORS.black;
const GOLD = DBS_COLORS.gold;
const HARD_SHADOW = "4px 4px 0 #000";

// ── Cut grid (bars) ─────────────────────────────────────────────────────
const T_TITLE = 52;
const T_DOUG = 155;
const T_OWEN = 361;
const T_DAWN = 464;
const T_BOARD = 567;
const T_END = 670;

// Don's tape windows (comp frames) → bed ducks under them.
const SPEECH: [number, number][] = [
  [24, 72], // "It has begun"
  [136, 268], // "Doug is the first to accept the challenge"
  [355, 470], // Owen crowd tape
];

// ─── Footage beat (portrait proxies fill 9:16 natively) ──────────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  startFrom?: number;
  muted?: boolean;
  volume?: number;
  brightness?: number;
  scrim?: number;
  children?: React.ReactNode;
}> = ({
  src,
  durationInFrames,
  startFrom = 0,
  muted = true,
  volume = 1,
  brightness = 0.94,
  scrim = 0.62,
  children,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
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
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,0.5) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(5,5,5,0) 38%, rgba(5,5,5,${
            scrim * 0.6
          }) 64%, rgba(5,5,5,${scrim}) 100%)`,
          pointerEvents: "none",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// ─── Skewed red kicker chip ──────────────────────────────────────────────
const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
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
          fontSize: 32,
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

// ─── Lower-third wrapper ─────────────────────────────────────────────────
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

// ─── Tape caption (Don's actual words, burned for muted viewers) ─────────
const TapeCaption: React.FC<{
  inAt: number;
  outAt: number;
  children: React.ReactNode;
}> = ({ inAt, outAt, children }) => {
  const frame = useCurrentFrame();
  const o =
    Math.min(
      interpolate(frame, [inAt, inAt + 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
      interpolate(frame, [outAt - 6, outAt], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    );
  return (
    <AbsoluteFill
      style={{
        padding: `0 ${SAFE.sides}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        paddingBottom: SAFE.bottom + 330,
        opacity: o,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: dbsFontFamilies.BarlowItalic,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.12,
          textTransform: "uppercase",
          color: BONE,
          textShadow: "3px 3px 0 #000",
          background: "rgba(5,5,5,0.55)",
          padding: "10px 16px 12px",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ─── Title beat: IT HAS / BEGUN. ─────────────────────────────────────────
const TitleBeat: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [10, 28], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  return (
    <LowerThird inAt={2} outAt={dur - 12}>
      <Kicker delay={2}>UBE Challenge · Week 1</Kicker>
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
        <div style={{ fontSize: 96 }}>IT HAS</div>
        <div
          style={{
            position: "relative",
            display: "inline-block",
            fontSize: 148,
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
          <span style={{ position: "relative", zIndex: 1 }}>BEGUN.</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: DBS_TRACKING.wider,
          color: BONE,
          textTransform: "uppercase",
          borderTop: `4px solid ${RED}`,
          paddingTop: 14,
        }}
      >
        First names hit the board
      </div>
    </LowerThird>
  );
};

// ─── Athlete score chip (lower-third stack) ──────────────────────────────
const ScoreChip: React.FC<{
  name: string;
  meters: string;
  rule: string;
  tag?: string;
  dur: number;
}> = ({ name, meters, rule, tag, dur }) => (
  <LowerThird inAt={4} outAt={dur - 10}>
    <Kicker delay={4}>{rule}</Kicker>
    <div
      style={{
        marginTop: 18,
        fontFamily: DBS_FONTS.headline,
        fontWeight: 700,
        fontSize: 64,
        textTransform: "uppercase",
        color: BONE,
        background: RED,
        boxShadow: HARD_SHADOW,
        padding: "14px 26px 16px",
        lineHeight: 1,
      }}
    >
      {name}
    </div>
    <div
      style={{
        marginTop: 14,
        display: "flex",
        alignItems: "baseline",
        gap: 18,
      }}
    >
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 150,
          lineHeight: 0.86,
          letterSpacing: DBS_TRACKING.tight,
          color: BONE,
          textTransform: "uppercase",
          textShadow: "5px 5px 0 #000",
        }}
      >
        {meters}
        <span style={{ fontSize: 66, color: RED, textShadow: "4px 4px 0 #000" }}>
          {" "}
          M
        </span>
      </div>
      {tag ? (
        <div
          style={{
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: DBS_TRACKING.widest,
            color: GOLD,
            textTransform: "uppercase",
            textShadow: "3px 3px 0 #000",
          }}
        >
          {tag}
        </div>
      ) : null}
    </div>
  </LowerThird>
);

// ─── Week-1 board card (mirrors the lobby panel) ─────────────────────────
const DivisionStrip: React.FC<{ label: string; sub: string; delay: number }> = ({
  label,
  sub,
  delay,
}) => (
  <Slam startFrame={delay} rotate={-1} from={0.92}>
    <div
      style={{
        width: 840,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        background: RED,
        boxShadow: HARD_SHADOW,
        padding: "10px 22px 12px",
      }}
    >
      <span
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 46,
          color: BONE,
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: DBS_TRACKING.wider,
          color: "rgba(246,242,236,0.9)",
          textTransform: "uppercase",
        }}
      >
        {sub}
      </span>
    </div>
  </Slam>
);

const BoardRow: React.FC<{
  rank: number;
  name: string;
  meters: string;
  delay: number;
}> = ({ rank, name, meters, delay }) => {
  const top = rank === 1;
  return (
    <Slam startFrame={delay} rotate={0} from={0.95}>
      <div
        style={{
          width: 840,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "12px 22px",
          background: top ? "rgba(229,181,61,0.14)" : "rgba(255,255,255,0.05)",
          borderLeft: `6px solid ${top ? GOLD : RED}`,
          marginTop: 8,
        }}
      >
        <span
          style={{
            width: 46,
            textAlign: "left",
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 44,
            color: top ? GOLD : RED,
          }}
        >
          {rank}
        </span>
        <span
          style={{
            flex: 1,
            textAlign: "left",
            fontFamily: DBS_FONTS.headline,
            fontWeight: 700,
            fontSize: 44,
            textTransform: "uppercase",
            color: BONE,
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 52,
            color: BONE,
          }}
        >
          {meters}
          <span style={{ fontSize: 28, color: RED }}> M</span>
        </span>
      </div>
    </Slam>
  );
};

const BoardCard: React.FC<{ dur: number }> = ({ dur }) => (
  <CardGround dur={dur}>
    <SlashLabel startFrame={2}>THE BOARD · WEEK 1</SlashLabel>
    <div style={{ marginTop: 30, display: "flex", flexDirection: "column" }}>
      <DivisionStrip label="Women" sub="30 sec · furthest distance" delay={8} />
      <BoardRow rank={1} name="Dawn Baxter" meters="15" delay={14} />
      <div style={{ height: 26 }} />
      <DivisionStrip label="Men" sub="40 sec · furthest distance" delay={22} />
      <BoardRow rank={1} name="Doug" meters="24" delay={28} />
      <BoardRow rank={2} name="Owen" meters="23" delay={34} />
    </div>
    <div style={{ marginTop: 34 }}>
      <Ribbon startFrame={48} fontSize={48}>
        FURTHEST DISTANCE WINS
      </Ribbon>
    </div>
  </CardGround>
);

// ─── End card ────────────────────────────────────────────────────────────
const EndBeat: React.FC<{ dur: number }> = ({ dur }) => (
  <CardGround dur={dur} fadeOut={false}>
    <SlashLabel startFrame={0}>AUGUST CHALLENGE · ALL MONTH</SlashLabel>
    <div style={{ marginTop: 32 }}>
      {["THE BOARD", "IS OPEN."].map((line, i) => (
        <Slam key={line} startFrame={3 + i * 6} rotate={-2}>
          <div
            style={{
              fontFamily: DBS_FONTS.display,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 108,
              lineHeight: 0.96,
              letterSpacing: DBS_TRACKING.tight,
              color: i === 1 ? RED : BONE,
              textTransform: "uppercase",
              textShadow: i === 1 ? "7px 7px 0 #140000" : "7px 7px 0 #141414",
            }}
          >
            {line}
          </div>
        </Slam>
      ))}
    </div>
    <div style={{ marginTop: 34 }}>
      <Ribbon startFrame={22} fontSize={54}>
        COME TAKE THE TOP SPOT
      </Ribbon>
    </div>
    <Slam startFrame={32} rotate={0}>
      <div
        style={{
          marginTop: 30,
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: DBS_TRACKING.wide,
          color: BONE,
          textTransform: "uppercase",
          textShadow: "3px 3px 0 #000",
        }}
      >
        Log your distance at the front desk
      </div>
    </Slam>
    <Slam startFrame={42} rotate={0}>
      <div
        style={{
          marginTop: 32,
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
  </CardGround>
);

// ─── Main composition ────────────────────────────────────────────────────
export const UbeFirstBoard: React.FC = () => {
  useDBSFonts();
  return (
    <AbsoluteFill
      style={{ backgroundColor: BLACK, width: REEL_WIDTH, height: REEL_HEIGHT }}
    >
      {/* Doug's clip runs unbroken through open → title → Doug beat.
          startFrom 66 (2.2s) puts "It has begun" right at the title slam. */}
      <Sequence from={0} durationInFrames={T_OWEN}>
        <VideoBeat
          src="aug3/IMG_9487.mp4"
          startFrom={66}
          durationInFrames={T_OWEN}
          muted={false}
          volume={1.1}
          scrim={0.3}
        />
      </Sequence>

      {/* title overlays the running clip */}
      <Sequence from={T_TITLE} durationInFrames={T_DOUG - T_TITLE}>
        <TitleBeat dur={T_DOUG - T_TITLE} />
      </Sequence>

      {/* Doug chip + tape caption */}
      <Sequence from={T_DOUG} durationInFrames={T_OWEN - T_DOUG}>
        <ScoreChip
          name="Doug"
          meters="24"
          rule="Men · 40 sec sprint"
          dur={T_OWEN - T_DOUG}
        />
      </Sequence>
      <TapeCaption inAt={146} outAt={266}>
        "DOUG IS THE FIRST TO ACCEPT THE CHALLENGE."
      </TapeCaption>

      {/* Owen */}
      <Sequence from={T_OWEN} durationInFrames={T_DAWN - T_OWEN}>
        <VideoBeat
          src="aug3/IMG_9490.mp4"
          startFrom={15}
          durationInFrames={T_DAWN - T_OWEN}
          muted={false}
          volume={0.9}
          scrim={0.72}
        >
          <FlashWipe />
          <ScoreChip
            name="Owen"
            meters="23"
            rule="Men · 40 sec sprint"
            dur={T_DAWN - T_OWEN}
          />
        </VideoBeat>
      </Sequence>

      {/* Dawn Baxter — women's leader */}
      <Sequence from={T_DAWN} durationInFrames={T_BOARD - T_DAWN}>
        <VideoBeat
          src="aug3/IMG_9549.mp4"
          startFrom={60}
          durationInFrames={T_BOARD - T_DAWN}
          scrim={0.72}
        >
          <FlashWipe />
          <ScoreChip
            name="Dawn Baxter"
            meters="15"
            rule="Women · 30 sec sprint"
            tag="Women's lead"
            dur={T_BOARD - T_DAWN}
          />
        </VideoBeat>
      </Sequence>

      {/* the board */}
      <Sequence from={T_BOARD} durationInFrames={T_END - T_BOARD}>
        <BoardCard dur={T_END - T_BOARD} />
      </Sequence>

      {/* end card */}
      <Sequence from={T_END} durationInFrames={UBE_FIRST_BOARD_DURATION - T_END}>
        <EndBeat dur={UBE_FIRST_BOARD_DURATION - T_END} />
      </Sequence>

      {/* series bed — drop at frame 0, ducked under Don's tape */}
      <Audio
        src={staticFile(BED_SRC)}
        volume={bedVolume(UBE_FIRST_BOARD_DURATION, SPEECH, 0.3, 0.92)}
      />
    </AbsoluteFill>
  );
};
