import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Easing,
} from "remotion";
import {
  DBS_COLORS,
  DBS_FONTS,
  DBS_SHADOW_PRESS,
  DBS_SHADOW_PRESS_RED,
  DBS_TRACKING,
  SkewHighlight,
  KnockoutSeal,
  useDBSFonts,
} from "./design-system";
import {
  DEFAULT_SCHEDULE_PROPS,
  ScheduleProps,
  ScheduleEntry,
} from "./schedule/defaultProps";
import { formatTime, scheduleDateFromProps } from "./schedule/dateUtils";
import { trackForDate } from "./schedule/tracks";

/*
 * ─── ScheduleReel — Daily "Today's Card" Story (Stamp/Poster) ─────────
 *
 * Built on the Stamp/Poster design system (`reels/src/design-system/`) so the
 * daily schedule story matches the main gym site and the 2026 reel slate.
 * Black/red/bone, NORD Black Italic, Barlow body, hard 4px offset shadows,
 * the red skew-mark, knockout seal. The schedule card echoes the website's
 * ScheduleStrip ("Today's Rounds.", red NORD-italic times, ink class names).
 *
 * Accepts the same MindBody props the Mac-mini pipeline already produces:
 *   { schedule: [{id, iso, class, coach, status}], timezone, maxItems }
 *
 * Duration: 300 frames @ 30fps = 10.0s (fits one IG/FB Story segment, punchy).
 *
 * Beat timeline — built for Stories: lead with the value so you stop the scroll,
 * then close on the brand sign-off.
 *   1.   0–180  (6.0s)  Pinned bone schedule card over action b-roll — the hook
 *   2. 180–300  (4.0s)  Animated end tag — "Evolve Into Greatness" mask-wipes to
 *                       "Become A Different Breed" (same motion as the site hero)
 */

export const SCHEDULE_REEL_DURATION = 300;

// ─── Timeline constants ───────────────────────────────────────────
const CARD_FROM = 0;
const CARD_DUR = 180; // 0–180 (6.0s) — schedule leads; grab them in the first beat
const END_FROM = 180;
const END_DUR = 120; // 180–300 (4.0s) — animated sign-off, room to breathe
const VIDEO_OUT = END_FROM; // action footage runs under the schedule, then bone end tag

// ─── Background cycle — real action b-roll from today's Youth Sports reel ──
// Two on-brand boxing clips (ring sparring + sharp combos) from `YouthInvest`,
// alternating with a cross-dissolve so the background reads as live motion, not
// a static photo. Clips are 1080×1920 / 4s; the ~3.9s slot keeps each one moving
// with no freeze frame before the dissolve. yi-open (sparring) leads the reel.
const ACTION_CLIPS = [
  "/youth-invest/yi-open.mp4", // two young boxers sparring in the DB ring
  "/youth-invest/yi-confidence.mp4", // group shadow-box, sharp combos
];
const BG_START = 0; // footage from frame 0 (behind the leading schedule card)
const BG_CYCLE = 116; // ~3.87s slot — clips are 4s, so no freeze before the dissolve
const BG_TRANSITION = 16; // cross-dissolve frames
const BG_CLIP_START_SEC = 0.1; // skip the first-frame settle
const BG_SLOT_COUNT = Math.ceil(VIDEO_OUT / BG_CYCLE) + 1; // enough slots to cover 0..VIDEO_OUT

// ─── One background slot: darkened, Ken-Burns, cross-fading clip ──
const BgClip: React.FC<{ src: string; index: number }> = ({ src, index }) => {
  const frame = useCurrentFrame();
  const localStart = BG_START + index * BG_CYCLE;
  const local = frame - localStart;

  const fadeIn =
    index === 0
      ? 1
      : interpolate(local, [0, BG_TRANSITION], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Last slot fades into the bone end tag; others cross-dissolve out.
  const fadeOut =
    index === BG_SLOT_COUNT - 1
      ? interpolate(frame, [VIDEO_OUT - 24, VIDEO_OUT], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(local, [BG_CYCLE - BG_TRANSITION, BG_CYCLE], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  if (local < -BG_TRANSITION || local > BG_CYCLE + BG_TRANSITION) return null;

  const opacity = Math.min(fadeIn, fadeOut);
  const scale = interpolate(local, [0, BG_CYCLE], [1.04, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(BG_CLIP_START_SEC * 30)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // Lighter than the old bg so the action actually reads; the card +
            // scrims still carry legibility.
            filter: "brightness(0.56) contrast(1.12) saturate(0.92)",
          }}
          muted
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── Background stack: alternating action clips + legibility overlays ────
const ScheduleBackground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: DBS_COLORS.black }}>
    {Array.from({ length: BG_SLOT_COUNT }, (_, i) => (
      <BgClip key={i} src={ACTION_CLIPS[i % ACTION_CLIPS.length]} index={i} />
    ))}
    {/* Radial vignette focuses the center */}
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 38%, rgba(10,10,10,0.55) 100%)",
        pointerEvents: "none",
      }}
    />
    {/* Top + bottom darken for header row + footer legibility */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.25) 16%, rgba(10,10,10,0) 38%, rgba(10,10,10,0) 64%, rgba(10,10,10,0.45) 84%, rgba(10,10,10,0.9) 100%)",
        pointerEvents: "none",
      }}
    />
  </AbsoluteFill>
);

// ─── Schedule row — echoes the website ScheduleStrip ──────────────
const Row: React.FC<{ entry: ScheduleEntry; index: number; small: boolean }> = ({
  entry,
  index,
  small,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 8 + index * 4;
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.8 },
    durationInFrames: 18,
  });
  const op = interpolate(s, [0, 1], [0, 1]);
  const x = interpolate(s, [0, 1], [-16, 0]);

  const timeFont = small ? 40 : 52;
  const classFont = small ? 32 : 40;
  const coachFont = small ? 17 : 20;

  return (
    <div
      style={{
        opacity: op,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        padding: small ? "13px 0" : "17px 0",
        borderBottom: `1px solid rgba(20,20,20,0.12)`,
        gap: 22,
      }}
    >
      {/* Time — NORD Black Italic, brand red (the strong element) */}
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: timeFont,
          color: DBS_COLORS.red600,
          letterSpacing: "-0.01em",
          minWidth: small ? 158 : 200,
          lineHeight: 1,
        }}
      >
        {formatTime(entry.iso)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: classFont,
            color: DBS_COLORS.ink,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            lineHeight: 1.02,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.class}
        </div>
        <div
          style={{
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: coachFont,
            color: DBS_COLORS.graphite,
            letterSpacing: DBS_TRACKING.wider,
            textTransform: "uppercase",
            marginTop: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.coach}
        </div>
      </div>
    </div>
  );
};

// ─── Pinned bone schedule card (0–180) ────────────────────────────
const ScheduleCard: React.FC<{
  schedule: ScheduleEntry[];
  dow: string;
  dateLabel: string;
  maxItems: number;
}> = ({ schedule, dow, dateLabel, maxItems }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.2, 0.9, 0.1, 1.05);

  // Card entrance — slide + fade (PressTile-style)
  const slide = interpolate(frame, [0, 16], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const cardOp = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardExit = interpolate(frame, [CARD_DUR - 12, CARD_DUR], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const items = schedule.slice(0, Math.min(schedule.length, maxItems));
  const visibleRows = items.slice(0, 6);
  const overflow = items.length - visibleRows.length;
  const small = visibleRows.length >= 5;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
        opacity: cardOp * cardExit,
      }}
    >
      <div
        style={{
          transform: `translateY(${slide}px)`,
          width: "100%",
          maxWidth: 960,
          background: DBS_COLORS.bone,
          border: `3px solid ${DBS_COLORS.ink}`,
          boxShadow: DBS_SHADOW_PRESS,
        }}
      >
        {/* Red header band — "live from MindBody" kicker */}
        <div
          style={{
            background: DBS_COLORS.red500,
            padding: "16px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: DBS_TRACKING.widest,
            textTransform: "uppercase",
            color: DBS_COLORS.paper,
          }}
        >
          <span>Today&rsquo;s Card</span>
          <span>Live from MindBody</span>
        </div>

        <div style={{ padding: "36px 44px 32px" }}>
          {/* Date line */}
          <div
            style={{
              fontFamily: DBS_FONTS.utility,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: DBS_TRACKING.wider,
              textTransform: "uppercase",
              color: DBS_COLORS.graphite,
              marginBottom: 6,
            }}
          >
            {dow} · {dateLabel}
          </div>

          {/* Headline — mirrors the site's "This week's rounds." */}
          <div
            style={{
              fontFamily: DBS_FONTS.display,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 104,
              lineHeight: 0.9,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: DBS_COLORS.ink,
              marginBottom: 26,
            }}
          >
            Today&rsquo;s{" "}
            <SkewHighlight startFrame={6} durationFrames={10}>
              Rounds
            </SkewHighlight>
          </div>

          {/* Rows */}
          {visibleRows.map((e, i) => (
            <Row key={e.id} entry={e} index={i} small={small} />
          ))}

          {overflow > 0 && (
            <div
              style={{
                marginTop: 18,
                display: "inline-block",
                padding: "8px 18px",
                background: DBS_COLORS.ink,
                fontFamily: DBS_FONTS.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: 28,
                color: DBS_COLORS.bone,
                letterSpacing: "-0.01em",
                textTransform: "uppercase",
                boxShadow: DBS_SHADOW_PRESS_RED,
              }}
            >
              + {overflow} More
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: 30,
              paddingTop: 18,
              borderTop: `2px solid ${DBS_COLORS.ink}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: DBS_FONTS.utility,
              fontWeight: 700,
              fontSize: 20,
              color: DBS_COLORS.coal,
              letterSpacing: DBS_TRACKING.wide,
              textTransform: "uppercase",
            }}
          >
            <span>@dbelitefitness</span>
            <span style={{ color: DBS_COLORS.red600 }}>Book · link in bio</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Empty-schedule state (rare — gym closed) ─────────────────────
const EmptyCard: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 90,
        opacity: op,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: 150,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: DBS_COLORS.bone,
            textShadow: "0 6px 30px rgba(0,0,0,0.8)",
          }}
        >
          Rest{" "}
          <SkewHighlight startFrame={10} durationFrames={10}>
            Day
          </SkewHighlight>
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: DBS_TRACKING.wider,
            textTransform: "uppercase",
            color: DBS_COLORS.steel,
          }}
        >
          Back at it tomorrow.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── End tag (180–300) — homepage-style animated sign-off ─────────
// Mirrors the site's HeroHeadline: "Evolve Into Greatness" rises up from behind
// a mask, holds, then mask-wipes to "Become A Different Breed" in the same spot.
// Red skew-mark on the 2nd line, knockout seal above, handle fades in last.
const ET_REVEAL = 20; // rise / wipe duration (frames)
const ET_P1_IN = 4; // phrase 1 begins rising
const ET_P1_OUT = 54; // phrase 1 wipes out
const ET_P2_IN = 68; // phrase 2 rises in (after p1 is most of the way gone)
const ET_LN2_LAG = 3; // 2nd line lags the 1st (matches the site's .ln2 delay)
const ET_EASE = Easing.bezier(0.62, 0, 0.15, 1);

// Reveal progress for one line: rises in at inStart; if outStart is set, wipes
// back out there (for the outgoing phrase). 0 = hidden (clipped), 1 = revealed.
const lineReveal = (
  frame: number,
  inStart: number,
  outStart: number | null,
): number => {
  const rise = interpolate(frame, [inStart, inStart + ET_REVEAL], [0, 1], {
    easing: ET_EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (outStart === null) return rise;
  const fall = interpolate(frame, [outStart, outStart + ET_REVEAL], [0, 1], {
    easing: ET_EASE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return rise * (1 - fall);
};

// Static red skew-mark box (the site's .db-mark): red box, slight skew, hard
// offset shadow, type un-skewed inside so it stays upright.
const RedMark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      background: DBS_COLORS.red500,
      color: DBS_COLORS.paper,
      padding: "0.02em 0.16em 0.08em",
      boxShadow: DBS_SHADOW_PRESS,
      transform: "skewX(-5deg)",
      display: "inline-block",
    }}
  >
    <span
      style={{
        display: "inline-block",
        transform: "skewX(5deg)",
        textAlign: "center",
      }}
    >
      {children}
    </span>
  </span>
);

// A single line masked by a horizontal clip that the text rises up through.
const RevealLine: React.FC<{ progress: number; children: React.ReactNode }> = ({
  progress,
  children,
}) => {
  const top = interpolate(progress, [0, 1], [120, -10]); // % — clipped above → revealed
  const ty = interpolate(progress, [0, 1], [0.34, 0]); // em — rises into place
  return (
    <div
      style={{
        // sides/bottom extended so the skewed red box + offset shadow aren't cropped
        clipPath: `inset(${top}% -0.5em -0.22em -0.5em)`,
        transform: `translateY(${ty}em)`,
      }}
    >
      {children}
    </div>
  );
};

const EndPhrase: React.FC<{
  lead: string;
  mark: string;
  ln1: number;
  ln2: number;
}> = ({ lead, mark, ln1, ln2 }) => (
  <div
    style={{
      gridArea: "1 / 1", // overlap both phrases in one cell so they swap in place
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
    }}
  >
    <RevealLine progress={ln1}>
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 72,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: DBS_COLORS.ink,
        }}
      >
        {lead}
      </div>
    </RevealLine>
    <RevealLine progress={ln2}>
      <div
        style={{
          fontFamily: DBS_FONTS.display,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 96,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        }}
      >
        <RedMark>{mark}</RedMark>
      </div>
    </RevealLine>
  </div>
);

const EndTag: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handleOp = interpolate(
    frame,
    [ET_P2_IN + ET_REVEAL, ET_P2_IN + ET_REVEAL + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const p1l1 = lineReveal(frame, ET_P1_IN, ET_P1_OUT);
  const p1l2 = lineReveal(frame, ET_P1_IN + ET_LN2_LAG, ET_P1_OUT);
  const p2l1 = lineReveal(frame, ET_P2_IN, null);
  const p2l2 = lineReveal(frame, ET_P2_IN + ET_LN2_LAG, null);

  return (
    <AbsoluteFill
      style={{
        background: DBS_COLORS.bone,
        opacity: fadeIn,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: "110px 70px",
        gap: 52,
      }}
    >
      <KnockoutSeal size={200} variant="black" startFrame={4} />
      <div style={{ display: "grid", placeItems: "center" }}>
        <EndPhrase lead="Evolve Into" mark="Greatness" ln1={p1l1} ln2={p1l2} />
        <EndPhrase
          lead="Become A"
          mark="Different Breed"
          ln1={p2l1}
          ln2={p2l2}
        />
      </div>
      <div
        style={{
          opacity: handleOp,
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: DBS_TRACKING.widest,
          textTransform: "uppercase",
          color: DBS_COLORS.red600,
        }}
      >
        @dbelitefitness
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────
export const ScheduleReel: React.FC<ScheduleProps> = (props) => {
  useDBSFonts();

  const { schedule, maxItems } = {
    ...DEFAULT_SCHEDULE_PROPS,
    ...(props || {}),
  };
  const { dow, label: dateLabel } = scheduleDateFromProps(schedule);
  const dateKey = schedule[0]?.iso ?? new Date().toISOString();
  const track = trackForDate(dateKey);

  return (
    <AbsoluteFill style={{ backgroundColor: DBS_COLORS.black }}>
      {/* Music bed — rotating daily track, fades in at the top, out under the end tag. */}
      <Audio
        src={staticFile(track.file)}
        startFrom={Math.round(track.startSec * 30)}
        volume={(f) =>
          interpolate(
            f,
            [0, 18, END_FROM, SCHEDULE_REEL_DURATION],
            [0, 0.85, 0.85, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Action b-roll runs under the schedule, then hands off to the bone end tag */}
      <Sequence from={0} durationInFrames={VIDEO_OUT + BG_TRANSITION}>
        <ScheduleBackground />
      </Sequence>

      {/* 1. Schedule card LEADS — first thing on screen (grab them fast) */}
      <Sequence from={CARD_FROM} durationInFrames={CARD_DUR}>
        {schedule.length === 0 ? (
          <EmptyCard />
        ) : (
          <ScheduleCard
            schedule={schedule}
            dow={dow}
            dateLabel={dateLabel}
            maxItems={maxItems}
          />
        )}
      </Sequence>

      {/* 2. Animated end tag — Evolve Into Greatness → Become A Different Breed */}
      <Sequence from={END_FROM} durationInFrames={END_DUR}>
        <EndTag />
      </Sequence>
    </AbsoluteFill>
  );
};
