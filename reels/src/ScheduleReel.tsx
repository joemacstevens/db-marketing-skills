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
  Img,
  staticFile,
} from "remotion";
import { COLORS, FONTS } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";
import {
  DEFAULT_SCHEDULE_PROPS,
  ScheduleProps,
  ScheduleEntry,
} from "./schedule/defaultProps";
import { formatTime, scheduleDateFromProps } from "./schedule/dateUtils";
import { quoteForDate } from "./schedule/quotes";
import { trackForDate } from "./schedule/tracks";

/*
 * ─── ScheduleReel — 15s Daily Story (video-backed, bolder) ────────
 *
 * Replaces the flat-black schedule story with action b-roll behind
 * a pinned magazine-cover schedule card. Accepts the same MindBody
 * props the Mac-mini pipeline already produces:
 *   { schedule: [{id, iso, class, coach, status}], timezone, maxItems }
 *
 * Duration: 450 frames @ 30fps = 15.0s
 *
 * Beat timeline:
 *   1.   0–90   (3.0s)  Motivational quote — leads the reel so it actually
 *                       gets seen (deterministic daily pick, DB board voice)
 *   2.  90–420 (11.0s)  Pinned schedule card over cycling b-roll
 *                       (4 clips × 97f each, 15f cross-dissolve)
 *   3. 420–450  (1.0s)  End tag: DB logo + book-via-link-in-bio
 */

export const SCHEDULE_REEL_DURATION = 450;

// ─── Background cycle ─────────────────────────────────────────────
const BG_CLIPS = [
  "sched-bg-1.mp4",
  "sched-bg-2.mp4",
  "sched-bg-3.mp4",
  "sched-bg-4.mp4",
];
const BG_START = 30;
const BG_CYCLE = 97;      // frames per clip slot (~3.23s)
const BG_TRANSITION = 15; // cross-dissolve frames

// ─── One background slot: darkened, Ken-Burns, cross-fading clip ──
const BgClip: React.FC<{ src: string; index: number }> = ({ src, index }) => {
  const frame = useCurrentFrame();
  const localStart = BG_START + index * BG_CYCLE;
  const local = frame - localStart;

  // Fade-in on entry (except the first, which bleeds from the intro)
  const fadeIn =
    index === 0
      ? interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" })
      : interpolate(local, [0, BG_TRANSITION], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Fade-out at end (last clip also fades for end-tag)
  const fadeOut =
    index === BG_CLIPS.length - 1
      ? interpolate(
          frame,
          [BG_START + BG_CLIPS.length * BG_CYCLE - 20, 420],
          [1, 0.25],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      : interpolate(
          local,
          [BG_CYCLE - BG_TRANSITION, BG_CYCLE],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

  // Don't render if way out of range
  if (local < -BG_TRANSITION || local > BG_CYCLE + BG_TRANSITION) return null;

  const opacity = Math.min(fadeIn, fadeOut);
  const scale = interpolate(local, [0, BG_CYCLE], [1.06, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.42) contrast(1.22) saturate(0.88)",
          }}
          muted
        />
      </div>
    </AbsoluteFill>
  );
};

// ─── Background stack: 4 cycling clips + overlays for legibility ──
const ScheduleBackground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
    {BG_CLIPS.map((src, i) => (
      <BgClip key={src} src={src} index={i} />
    ))}
    {/* Radial vignette */}
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }}
    />
    {/* Top + bottom darken for label row + footer */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 18%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.4) 82%, rgba(0,0,0,0.92) 100%)",
        pointerEvents: "none",
      }}
    />
  </AbsoluteFill>
);

// ─── Intro card (0–30) ────────────────────────────────────────────
const IntroCard: React.FC<{ dow: string; dateLabel: string }> = ({
  dow,
  dateLabel,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({
    frame: frame - 2,
    fps,
    config: { damping: 180, mass: 0.7 },
    durationInFrames: 16,
  });
  const op = interpolate(entry, [0, 1], [0, 1]);
  const sc = interpolate(entry, [0, 1], [1.15, 1]);
  const exit = interpolate(frame, [22, 30], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
      }}
    >
      <div
        style={{
          opacity: op,
          transform: `scale(${sc})`,
          textAlign: "center",
          paddingLeft: 120,
          paddingRight: 120,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 30,
            fontWeight: 600,
            color: COLORS.gray,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Today at DB
        </div>
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 200,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -4,
            lineHeight: 0.9,
            textTransform: "uppercase",
            textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          }}
        >
          {dow}
          <span style={{ color: COLORS.red }}>.</span>
        </div>
        <div
          style={{
            marginTop: 24,
            display: "inline-block",
            padding: "10px 28px",
            backgroundColor: COLORS.red,
            fontFamily: FONTS.headline,
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {dateLabel}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Schedule row ─────────────────────────────────────────────────
const Row: React.FC<{ entry: ScheduleEntry; index: number; small: boolean }> = ({
  entry,
  index,
  small,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 4 + index * 4;
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.8 },
    durationInFrames: 20,
  });
  const op = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [18, 0]);

  const timeFont = small ? 38 : 52;
  const classFont = small ? 32 : 42;
  const coachFont = small ? 18 : 24;

  return (
    <div
      style={{
        opacity: op,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        padding: small ? "14px 0" : "18px 0",
        borderBottom: `2px solid rgba(255,255,255,0.08)`,
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.headline,
          fontSize: timeFont,
          fontWeight: 700,
          color: COLORS.red,
          letterSpacing: -1,
          textTransform: "uppercase",
          minWidth: small ? 150 : 200,
          lineHeight: 1,
        }}
      >
        {formatTime(entry.iso)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: classFont,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {entry.class}
        </div>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: coachFont,
            fontWeight: 500,
            color: COLORS.gray,
            letterSpacing: 2,
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

// ─── Pinned schedule card (30–420) ────────────────────────────────
const ScheduleCard: React.FC<{
  schedule: ScheduleEntry[];
  dow: string;
  dateLabel: string;
  maxItems: number;
}> = ({ schedule, dow, dateLabel, maxItems }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance (sequence starts at frame 0 inside Sequence)
  const cardS = spring({
    frame,
    fps,
    config: { damping: 180, mass: 0.8 },
    durationInFrames: 24,
  });
  const cardOp = interpolate(cardS, [0, 1], [0, 1]);
  const cardY = interpolate(cardS, [0, 1], [28, 0]);

  // Card exit (sequence is 330f long; exit last 10 frames)
  const cardExit = interpolate(frame, [320, 330], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Red rule animates
  const rule = interpolate(
    spring({
      frame: frame - 6,
      fps,
      config: { damping: 200 },
      durationInFrames: 18,
    }),
    [0, 1],
    [0, 640]
  );

  const items = schedule.slice(0, Math.min(schedule.length, maxItems));
  const visibleRows = items.slice(0, 6);
  const overflow = items.length - visibleRows.length;
  const small = visibleRows.length >= 5;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 60,
        paddingRight: 60,
        opacity: cardOp * cardExit,
      }}
    >
      <div
        style={{
          transform: `translateY(${cardY}px)`,
          width: "100%",
          maxWidth: 960,
          backgroundColor: "rgba(28,28,28,0.92)",
          borderTop: `4px solid ${COLORS.red}`,
          padding: "44px 48px 36px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        {/* Label row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLORS.gray,
            marginBottom: 18,
          }}
        >
          <span>Today at DB</span>
          <span style={{ color: COLORS.white }}>
            {dow} · {dateLabel}
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 110,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -3,
            lineHeight: 0.92,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          What&rsquo;s On<span style={{ color: COLORS.red }}>.</span>
        </div>

        {/* Red rule */}
        <div
          style={{
            width: rule,
            height: 4,
            backgroundColor: COLORS.red,
            marginBottom: 26,
          }}
        />

        {/* Rows */}
        {visibleRows.map((e, i) => (
          <Row key={e.id} entry={e} index={i} small={small} />
        ))}

        {overflow > 0 && (
          <div
            style={{
              marginTop: 16,
              display: "inline-block",
              padding: "6px 16px",
              backgroundColor: COLORS.red,
              fontFamily: FONTS.headline,
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            + {overflow} More
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 18,
            borderTop: `2px solid rgba(255,255,255,0.08)`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: FONTS.body,
            fontSize: 20,
            fontWeight: 500,
            color: COLORS.gray,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>@dbelitefitness</span>
          <span>Book · link in bio</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Empty-schedule state (rare but handle it) ────────────────────
const EmptyCard: React.FC = () => (
  <AbsoluteFill
    style={{ justifyContent: "center", alignItems: "center", padding: 80 }}
  >
    <div
      style={{
        fontFamily: FONTS.headline,
        fontSize: 110,
        fontWeight: 700,
        color: COLORS.white,
        letterSpacing: -2,
        lineHeight: 0.95,
        textTransform: "uppercase",
        textAlign: "center",
        textShadow: "0 6px 40px rgba(0,0,0,0.95)",
      }}
    >
      Rest Day<span style={{ color: COLORS.red }}>.</span>
      <div
        style={{
          marginTop: 24,
          fontSize: 44,
          color: COLORS.gray,
          letterSpacing: 2,
        }}
      >
        Back at it tomorrow.
      </div>
    </div>
  </AbsoluteFill>
);

// ─── Quote card (0–90) ────────────────────────────────────────────
const QuoteCard: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: frame - 4,
    fps,
    config: { damping: 180, mass: 0.8 },
    durationInFrames: 26,
  });
  const op = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [28, 0]);

  const rule = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 20 }),
    [0, 1],
    [0, 220]
  );

  // Label entry (small kicker above quote)
  const labelS = spring({
    frame: frame - 2,
    fps,
    config: { damping: 200 },
    durationInFrames: 16,
  });
  const labelOp = interpolate(labelS, [0, 1], [0, 1]);

  // Sequence is 90f; exit last 10 frames so schedule card can enter clean
  const exit = interpolate(frame, [80, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 120,
        paddingRight: 120,
        backgroundColor: "rgba(0,0,0,0.35)",
        opacity: exit,
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 900,
        }}
      >
        <div
          style={{
            opacity: labelOp,
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.gray,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Today&rsquo;s Word
        </div>
        <div
          style={{
            width: rule,
            height: 4,
            backgroundColor: COLORS.red,
            margin: "0 auto 32px",
          }}
        />
        <div
          style={{
            opacity: op,
            transform: `translateY(${y}px)`,
            fontFamily: FONTS.headline,
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -2,
            lineHeight: 1.0,
            textTransform: "uppercase",
            textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          }}
        >
          {text}
        </div>
        <div
          style={{
            opacity: labelOp,
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: COLORS.gray,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginTop: 32,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────
export const ScheduleReel: React.FC<ScheduleProps> = (props) => {
  const { schedule, maxItems } = {
    ...DEFAULT_SCHEDULE_PROPS,
    ...(props || {}),
  };
  const { dow, label: dateLabel } = scheduleDateFromProps(schedule);
  const quoteKey = schedule[0]?.iso ?? new Date().toISOString();
  const quoteText = quoteForDate(quoteKey);
  const quoteLabel = `${dow} · ${dateLabel}`;
  const track = trackForDate(quoteKey);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Music bed — rotating daily track, fades in on quote, out under end tag */}
      <Audio
        src={staticFile(track.file)}
        startFrom={Math.round(track.startSec * 30)}
        volume={(f) =>
          interpolate(
            f,
            [0, 20, 420, 450],
            [0, 0.85, 0.85, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      {/* Background runs the full reel */}
      <ScheduleBackground />

      {/* Motivational quote — leads the reel */}
      <Sequence from={0} durationInFrames={90}>
        <QuoteCard text={quoteText} label={quoteLabel} />
      </Sequence>

      {/* Schedule card */}
      <Sequence from={90} durationInFrames={330}>
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

      {/* End tag — shared DB sign-off, Evolve Into Greatness as hero */}
      <Sequence from={420} durationInFrames={30}>
        <EndTagScene cta="Book · link in bio" />
      </Sequence>
    </AbsoluteFill>
  );
};
