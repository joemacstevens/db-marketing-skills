import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import {
  DBS_COLORS,
  DBS_FONTS,
  DBS_TRACKING,
  DBS_SHADOW_PRESS,
  REEL_WIDTH,
  REEL_HEIGHT,
  SAFE,
  useDBSFonts,
  dbsFontFamilies,
} from "../design-system";
import { Slam, Ribbon, SlashLabel, fullBed } from "../celebrate/kit";
import { KineticMarquee } from "../cinematic-effects/KineticMarquee";
import { RunClubBadge } from "./RunClubBadge";

/*
 * ─── DB RUN CLUB — launch reel ──────────────────────────────────────────
 *
 * Graphics-forward by decision: no gym footage exists for the run club yet,
 * so the cold open runs on generated sunrise-road art in motion instead of
 * splicing in unrelated boxing/strength clips. Everything else is code-drawn
 * in the Stamp/Poster system.
 *
 * Copy source: the approved DB Run Club flyer.
 *   badge      BUILT DIFFERENT · DB RUN CLUB · ONE MILE AT A TIME
 *   statement  more than a running club
 *   pillars    all paces / stronger together / goals growth discipline /
 *              support community belonging / planned routes
 *   race line  when we race, we race as Built Different
 *   schedule   every Wednesday, during Sunrise Strength, 5:30 AM,
 *              Coach Michelle Buttafuoco (@mishbutta)
 *   first run  Wednesday August 5
 *
 * ── MUSIC + BEAT GRID ─────────────────────────────────────────────────
 * /run-club/beat-final.mp3 — ElevenLabs boom-bap, 27.06s, played from 0.
 * aubiotrack detected 44 onsets; the stable pulse is ~97 BPM (0.6157s =
 * 18.47 frames). Every cut below is snapped to a detected onset (or the
 * exact half-beat between two of them where a 1.5s card needed it).
 *
 *   frame   sec     onset source            cut
 *   ----------------------------------------------------------------
 *      0    0.000   —                       COLD OPEN (road art, no type)
 *     52    1.733   beat 1.735              BADGE slam
 *    146    4.867   beat 4.865              STATEMENT card
 *    207    6.900   beat 6.886              PILLAR 1  all paces
 *    253    8.433   half-beat 8.442         PILLAR 2  stronger together
 *    300   10.000   beat 10.011             PILLAR 3  goals growth discipline
 *    347   11.567   beat 11.575             PILLAR 4  support community
 *    394   13.133   half-beat 13.138        PILLAR 5  planned routes
 *    441   14.700   beat 14.691             RACE LINE (red full bleed)
 *    516   17.200   beat 17.195             SCHEDULE card
 *    624   20.800   beat 20.816             END CARD
 *    750   25.000   —                       out (bed faded)
 *
 * Pillars land 46/47/47/47/47 frames apart, i.e. two and a half beats each,
 * so the cuts alternate downbeat / offbeat and keep the running-cadence feel.
 */

export const RUN_CLUB_DURATION = 750;

const MUSIC = "/run-club/beat-final.mp3";
const ART_ROAD = "/run-club/art-road-sunrise.png";
const ART_ASPHALT = "/run-club/art-asphalt.png";

// ─── cut grid ───────────────────────────────────────────────────────────
const F = {
  coldOpen: 0,
  badge: 52,
  statement: 146,
  pillars: 207,
  raceLine: 441,
  schedule: 516,
  endCard: 624,
  out: RUN_CLUB_DURATION,
} as const;

const PILLAR_STARTS = [0, 46, 93, 140, 187]; // relative to F.pillars
const PILLAR_DURS = [46, 47, 47, 47, 47];

// Usable width inside SAFE is REEL_WIDTH - SAFE.sides * 2 = 840px. Every
// NORD line below is sized from measured OTF advance widths to stay under it.

// ─── film grain (rendered at quarter res and scaled up: cheap + chunky) ──
const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.2 }) => (
  <AbsoluteFill style={{ opacity, mixBlendMode: "overlay" }}>
    <svg
      width={REEL_WIDTH / 3}
      height={REEL_HEIGHT / 3}
      style={{ transform: "scale(3)", transformOrigin: "top left" }}
    >
      <filter id="rc-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves={2}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#rc-grain)" />
    </svg>
  </AbsoluteFill>
);

// ─── scanline wash (the house card texture) ─────────────────────────────
const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.42 }) => (
  <AbsoluteFill
    style={{
      background:
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 7px)",
      opacity,
      mixBlendMode: "screen",
    }}
  />
);

// ─── asphalt texture wash behind cards ──────────────────────────────────
const AsphaltWash: React.FC<{ opacity?: number }> = ({ opacity = 0.08 }) => (
  <AbsoluteFill style={{ opacity }}>
    <Img
      src={staticFile(ART_ASPHALT)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

// ─── full-bleed generated art with a slow push + drift ──────────────────
const ArtPlate: React.FC<{
  src: string;
  dur: number;
  from?: number;
  to?: number;
  driftY?: number;
  scrim?: number;
}> = ({ src, dur, from = 1.0, to = 1.08, driftY = 0, scrim = 0 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, dur], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, dur], [0, driftY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: DBS_COLORS.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `scale(${scale}) translateY(${y}px)` }}
      >
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {scrim > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(900px 900px at 50% 46%, rgba(4,2,2,${
              scrim * 0.6
            }) 0%, rgba(4,2,2,${scrim}) 72%), linear-gradient(180deg, rgba(4,2,2,${
              scrim * 0.9
            }) 0%, rgba(4,2,2,0.15) 40%, rgba(4,2,2,${scrim}) 100%)`,
          }}
        />
      )}
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1000px 1200px at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── black card ground (black + red glow + scanlines) ───────────────────
const Ground: React.FC<{
  children: React.ReactNode;
  asphalt?: number;
  justify?: React.CSSProperties["justifyContent"];
}> = ({ children, asphalt = 0, justify = "center" }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(900px 520px at 50% 28%, rgba(255,255,255,0.06), transparent 68%), radial-gradient(760px 400px at 18% 86%, rgba(232,29,29,0.22), transparent 70%), ${DBS_COLORS.black}`,
    }}
  >
    {asphalt > 0 && <AsphaltWash opacity={asphalt} />}
    <Scanlines />
    <AbsoluteFill
      style={{
        padding: `${SAFE.top}px ${SAFE.sides}px ${SAFE.bottom}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

// ─── fast red skew wipe (transition punch, no fade-to-black) ────────────
const FastWipe: React.FC<{ dur?: number }> = ({ dur = 9 }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, dur], [-130, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.35, 0, 0.65, 1),
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: -60,
          background: DBS_COLORS.red500,
          transform: `translateX(${wipe}%) skewX(-12deg)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── big NORD line ──────────────────────────────────────────────────────
const NordLine: React.FC<{
  size: number;
  color?: string;
  shadow?: string;
  lineHeight?: number;
  children: React.ReactNode;
}> = ({
  size,
  color = DBS_COLORS.bone,
  shadow = "8px 8px 0 #141414",
  lineHeight = 0.86,
  children,
}) => (
  <div
    style={{
      fontFamily: DBS_FONTS.display,
      fontWeight: 900,
      fontStyle: "italic",
      fontSize: size,
      lineHeight,
      letterSpacing: "-0.02em",
      textTransform: "uppercase",
      color,
      textShadow: shadow,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// ─── thin red rule that wipes open ──────────────────────────────────────
const RedRule: React.FC<{ startFrame?: number; width?: number }> = ({
  startFrame = 0,
  width = 300,
}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame - startFrame, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  return (
    <div
      style={{
        width,
        height: 8,
        background: DBS_COLORS.red500,
        transform: `scaleX(${grow}) skewX(-26deg)`,
        boxShadow: "0 0 16px rgba(232,29,29,0.55)",
      }}
    />
  );
};

// ─── red ink-stripe behind one word ─────────────────────────────────────
// Local rather than design-system SkewHighlight: that one skews the stripe
// and un-skews the text with two different transform origins, which shears
// the word off its own band inside a NORD italic line. Here only the stripe
// is skewed and the (already italic) word stays put. Band insets are in em
// so they track the font: NORD caps sit at 0.171em-0.835em in a 1em box.
const WordHighlight: React.FC<{
  startFrame?: number;
  dur?: number;
  children: React.ReactNode;
}> = ({ startFrame = 0, dur = 10, children }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame - startFrame, [0, dur], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        lineHeight: 1,
        padding: "0 0.16em",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: "0.04em",
          width: `${wipe}%`,
          height: "0.96em",
          background: DBS_COLORS.red500,
          transform: "skewX(-8deg)",
          transformOrigin: "center",
        }}
      />
      {/* no drop shadow inside the stripe — it reads as grime on the red */}
      <span style={{ position: "relative", textShadow: "none" }}>{children}</span>
    </span>
  );
};

// ═══ 0-52 — COLD OPEN ═══════════════════════════════════════════════════
const ColdOpen: React.FC<{ dur: number }> = ({ dur }) => (
  <AbsoluteFill>
    <ArtPlate src={ART_ROAD} dur={dur} from={1.0} to={1.08} driftY={-14} />
    <Grain opacity={0.22} />
  </AbsoluteFill>
);

// ═══ 52-146 — BADGE ═════════════════════════════════════════════════════
const BadgeCard: React.FC = () => (
  <Ground asphalt={0.09}>
    <RunClubBadge size={700} startFrame={0} spinDegPerSec={5} />
    <div style={{ marginTop: 46 }}>
      <Slam startFrame={20} rotate={-1}>
        <div
          style={{
            fontFamily: dbsFontFamilies.BarlowItalic,
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.16,
            letterSpacing: DBS_TRACKING.wide,
            textTransform: "uppercase",
            color: DBS_COLORS.bone,
            textShadow: "3px 3px 0 #000",
          }}
        >
          BUILT DIFFERENT:
          <br />
          <span style={{ color: DBS_COLORS.red500 }}>ONE MILE AT A TIME.</span>
        </div>
      </Slam>
    </div>
  </Ground>
);

// ═══ 146-207 — STATEMENT ════════════════════════════════════════════════
const StatementCard: React.FC = () => (
  <Ground asphalt={0.08}>
    <Slam startFrame={0} rotate={-2}>
      <NordLine size={96}>MORE THAN A</NordLine>
    </Slam>
    <div style={{ marginTop: 6 }}>
      <Slam startFrame={8} rotate={-2}>
        <NordLine size={82} shadow="9px 9px 0 #141414">
          <WordHighlight startFrame={8} dur={10}>
            RUNNING
          </WordHighlight>{" "}
          CLUB.
        </NordLine>
      </Slam>
    </div>
    <div style={{ marginTop: 34 }}>
      <RedRule startFrame={20} width={380} />
    </div>
  </Ground>
);

// ═══ 207-441 — PILLARS ══════════════════════════════════════════════════
type PillarLine = { text: string; red?: boolean };

const PILLARS: { lines: PillarLine[]; sub?: string; art?: boolean }[] = [
  {
    lines: [{ text: "ALL PACES." }, { text: "ALL PEOPLE.", red: true }],
  },
  {
    lines: [{ text: "STRONGER" }, { text: "TOGETHER", red: true }],
    sub: "physical · mental · emotional",
  },
  {
    lines: [
      { text: "GOALS." },
      { text: "GROWTH." },
      { text: "DISCIPLINE.", red: true },
    ],
    sub: "effort over perfection",
  },
  {
    lines: [
      { text: "SUPPORT." },
      { text: "COMMUNITY." },
      { text: "BELONGING.", red: true },
    ],
    sub: "we run together, we race together",
  },
  {
    lines: [{ text: "PLANNED" }, { text: "ROUTES.", red: true }],
    art: true,
  },
];

const PillarCard: React.FC<{ index: number; dur: number }> = ({ index, dur }) => {
  const p = PILLARS[index];
  return (
    <AbsoluteFill>
      {p.art && (
        <ArtPlate
          src={ART_ROAD}
          dur={dur}
          from={1.06}
          to={1.14}
          driftY={-8}
          scrim={0.6}
        />
      )}
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
        <RedRule startFrame={0} width={220} />
        <div style={{ marginTop: 26 }}>
          {p.lines.map((l, i) => (
            <Slam key={l.text} startFrame={i * 4} rotate={-2}>
              <NordLine
                size={100}
                color={l.red ? DBS_COLORS.red500 : DBS_COLORS.bone}
                shadow={l.red ? "8px 8px 0 #140000" : "8px 8px 0 #141414"}
              >
                {l.text}
              </NordLine>
            </Slam>
          ))}
        </div>
        {p.sub && (
          <Slam startFrame={12} rotate={0}>
            <div
              style={{
                marginTop: 28,
                fontFamily: dbsFontFamilies.BarlowItalic,
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 40,
                letterSpacing: DBS_TRACKING.wide,
                color: DBS_COLORS.steel,
                textShadow: "2px 2px 0 #000",
              }}
            >
              {p.sub}
            </div>
          </Slam>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MarqueeBands: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 244, left: 0, right: 0, opacity: 0.3 }}>
      <KineticMarquee
        text="ONE MILE AT A TIME"
        separator=" · "
        speed={2.6}
        direction="left"
        fontSize={44}
        fontFamily={DBS_FONTS.display}
        fontWeight={900}
        letterSpacing={7}
        color={DBS_COLORS.steel}
        separatorColor={DBS_COLORS.red500}
      />
    </div>
    <div style={{ position: "absolute", top: 1512, left: 0, right: 0, opacity: 0.3 }}>
      <KineticMarquee
        text="ONE MILE AT A TIME"
        separator=" · "
        speed={2.0}
        direction="right"
        fontSize={44}
        fontFamily={DBS_FONTS.display}
        fontWeight={900}
        letterSpacing={7}
        color={DBS_COLORS.steel}
        separatorColor={DBS_COLORS.red500}
      />
    </div>
  </AbsoluteFill>
);

const PillarBlock: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background: `radial-gradient(900px 520px at 50% 28%, rgba(255,255,255,0.05), transparent 68%), radial-gradient(760px 400px at 82% 84%, rgba(232,29,29,0.20), transparent 70%), ${DBS_COLORS.black}`,
      }}
    />
    <AsphaltWash opacity={0.1} />
    <Scanlines opacity={0.34} />

    {PILLAR_STARTS.map((s, i) => (
      <Sequence key={i} from={s} durationInFrames={PILLAR_DURS[i]}>
        <PillarCard index={i} dur={PILLAR_DURS[i]} />
      </Sequence>
    ))}

    <MarqueeBands />

    {PILLAR_STARTS.slice(1).map((s) => (
      <Sequence key={`w${s}`} from={s} durationInFrames={9}>
        <FastWipe dur={9} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ═══ 441-516 — RACE LINE ════════════════════════════════════════════════
const RaceLineCard: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(900px 700px at 50% 40%, #f4302f 0%, ${DBS_COLORS.red600} 62%, ${DBS_COLORS.red700} 100%)`,
    }}
  >
    <AsphaltWash opacity={0.12} />
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
      {[
        { t: "WHEN WE RACE,", size: 84 },
        { t: "WE RACE AS", size: 84 },
        { t: "BUILT", size: 100 },
        { t: "DIFFERENT.", size: 100 },
      ].map((l, i) => (
        <Slam key={l.t} startFrame={i * 5} rotate={-2}>
          <NordLine
            size={l.size}
            color={DBS_COLORS.black}
            shadow="none"
            lineHeight={0.88}
          >
            {l.t}
          </NordLine>
        </Slam>
      ))}
    </AbsoluteFill>
  </AbsoluteFill>
);

// ═══ 516-624 — SCHEDULE ═════════════════════════════════════════════════
const ScheduleCard: React.FC = () => (
  <Ground asphalt={0.08}>
    <SlashLabel startFrame={0}>DB RUN CLUB</SlashLabel>
    <div style={{ marginTop: 30 }}>
      <Slam startFrame={4} rotate={-2}>
        <NordLine size={92}>EVERY</NordLine>
      </Slam>
    </div>
    <Slam startFrame={10} rotate={-2}>
      <NordLine size={106} color={DBS_COLORS.red500} shadow="9px 9px 0 #140000">
        WEDNESDAY
      </NordLine>
    </Slam>

    <div style={{ marginTop: 34 }}>
      <RedRule startFrame={18} width={420} />
    </div>

    <Slam startFrame={22} rotate={0}>
      <div
        style={{
          marginTop: 30,
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: DBS_TRACKING.widest,
          textTransform: "uppercase",
          color: DBS_COLORS.bone,
        }}
      >
        DURING SUNRISE STRENGTH
      </div>
    </Slam>

    <div style={{ marginTop: 12 }}>
      <Slam startFrame={28} rotate={-2}>
        <NordLine size={140} color={DBS_COLORS.bone} shadow="9px 9px 0 #141414">
          5:30 AM
        </NordLine>
      </Slam>
    </div>

    <div style={{ marginTop: 44 }}>
      <Slam startFrame={38} rotate={-1}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              background: DBS_COLORS.red500,
              boxShadow: DBS_SHADOW_PRESS,
              padding: "14px 26px 16px",
              fontFamily: DBS_FONTS.headline,
              fontWeight: 700,
              fontSize: 42,
              lineHeight: 1,
              textTransform: "uppercase",
              color: DBS_COLORS.bone,
              whiteSpace: "nowrap",
            }}
          >
            COACH MICHELLE
          </div>
          <div
            style={{
              fontFamily: DBS_FONTS.utility,
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: DBS_TRACKING.wide,
              color: DBS_COLORS.steel,
              whiteSpace: "nowrap",
            }}
          >
            @mishbutta
          </div>
        </div>
      </Slam>
    </div>
  </Ground>
);

// ═══ 624-750 — END CARD ═════════════════════════════════════════════════
const EndCardRC: React.FC = () => (
  <Ground asphalt={0.07}>
    <SlashLabel startFrame={0}>FIRST RUN · WEDNESDAY AUG 5</SlashLabel>

    <div style={{ marginTop: 40 }}>
      <Slam startFrame={6} rotate={-2}>
        <NordLine size={88}>MEET. MOVE.</NordLine>
      </Slam>
      <Slam startFrame={11} rotate={-2}>
        <NordLine size={88}>BUILD</NordLine>
      </Slam>
      <Slam startFrame={16} rotate={-3}>
        <NordLine size={108} color={DBS_COLORS.red500} shadow="10px 10px 0 #140000">
          DIFFERENT.
        </NordLine>
      </Slam>
    </div>

    <div style={{ marginTop: 46 }}>
      <Ribbon startFrame={26} fontSize={46} rotate={-2}>
        RUN WITH US WEDNESDAY
      </Ribbon>
    </div>

    <Slam startFrame={34} rotate={0}>
      <div
        style={{
          marginTop: 30,
          fontFamily: dbsFontFamilies.BarlowItalic,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: DBS_TRACKING.wide,
          textTransform: "uppercase",
          color: DBS_COLORS.bone,
          textShadow: "3px 3px 0 #000",
        }}
      >
        BOOK SUNRISE STRENGTH · 5:30 AM
      </div>
    </Slam>

    <Slam startFrame={42} rotate={0}>
      <div
        style={{
          marginTop: 34,
          fontFamily: DBS_FONTS.utility,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: DBS_TRACKING.widest,
          textTransform: "uppercase",
          color: DBS_COLORS.red500,
        }}
      >
        @DBELITEFITNESS
      </div>
    </Slam>
  </Ground>
);

// ═══════════════════════════════════════════════════════════════════════
export const RunClub: React.FC = () => {
  useDBSFonts();
  return (
    <AbsoluteFill
      style={{ background: DBS_COLORS.black, width: REEL_WIDTH, height: REEL_HEIGHT }}
    >
      <Audio
        src={staticFile(MUSIC)}
        startFrom={0}
        volume={fullBed(RUN_CLUB_DURATION, 0.95)}
      />

      {/* 0-52 — cold open, road art in motion, zero type */}
      <Sequence from={F.coldOpen} durationInFrames={F.badge - F.coldOpen}>
        <ColdOpen dur={F.badge - F.coldOpen} />
      </Sequence>

      {/* 52-146 — badge slams in on the beat */}
      <Sequence from={F.badge} durationInFrames={F.statement - F.badge}>
        <BadgeCard />
      </Sequence>

      {/* 146-207 — more than a running club */}
      <Sequence from={F.statement} durationInFrames={F.pillars - F.statement}>
        <StatementCard />
      </Sequence>

      {/* 207-441 — five pillars over the marquee */}
      <Sequence from={F.pillars} durationInFrames={F.raceLine - F.pillars}>
        <PillarBlock />
      </Sequence>
      <Sequence from={F.pillars} durationInFrames={9}>
        <FastWipe dur={9} />
      </Sequence>

      {/* 441-516 — race line */}
      <Sequence from={F.raceLine} durationInFrames={F.schedule - F.raceLine}>
        <RaceLineCard />
      </Sequence>
      <Sequence from={F.raceLine} durationInFrames={9}>
        <FastWipe dur={9} />
      </Sequence>

      {/* 516-624 — schedule */}
      <Sequence from={F.schedule} durationInFrames={F.endCard - F.schedule}>
        <ScheduleCard />
      </Sequence>

      {/* 624-750 — end card */}
      <Sequence from={F.endCard} durationInFrames={F.out - F.endCard}>
        <EndCardRC />
      </Sequence>
      <Sequence from={F.endCard} durationInFrames={9}>
        <FastWipe dur={9} />
      </Sequence>
    </AbsoluteFill>
  );
};
