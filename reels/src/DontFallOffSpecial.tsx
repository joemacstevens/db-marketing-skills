import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  Img,
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
import { SlashLabel, Ribbon, Slam } from "./celebrate/kit";
import { CAPS } from "./dont-fall-off-captions";

/*
 * ─── DON'T "FALL" OFF FITNESS SPECIAL — bookend cut (v5) ─────────────────
 *
 * Structure per Joey (8/31): the coach opens and closes the ad; the middle
 * is pure Remotion graphics with a deliberately different announcer voice.
 *
 * BOTH coach moments come from ONE 8s Veo generation
 * (dont-fall-off/bookend-both-lines.mp4 — locked camera, native audio):
 *      0.00–3.28  "Hey. You. Don't let your fitness gains fall off."
 *      3.28–3.92  beat of silence  ← the split point
 *      3.92–7.34  "Consistency is the true measure of greatness. Be great."
 *      7.34–8.00  hold (extended by endhold.png freeze for the stamps)
 * One generation = one coach voice by construction; native audio = real sync.
 *
 * Middle: one Gemini TTS announcer read (Charon, announcer-charon.m4a):
 *      0–3.06  title · 3.06–7.2 three names · 7.2–15.9 value + rules
 * Cards flip to the announcer's pacing. Package numbers are Don's verbatim.
 *
 * v13 (9/1): Higgsfield Seedance anime b-roll behind the middle — squat under
 * the three-names index, bag/sled/ladder under the three cards. BrollBG darkens
 * the clip 55–74% so the numbers stay readable; clips are muted, the bed and
 * announcer own the audio.
 * v14 (9/1, Joey): early savings flag — "SAVE UP TO $1,194" chip top-left
 * during the coach open only, so scrollers know money is on the table before
 * the title card lands. Gone once the middle takes over (cards carry their
 * own SAVE ribbons).
 * v15 (9/1, DON's ask): ONE voice throughout — the middle read re-voiced as
 * the coach via ElevenLabs (voice cloned from the bookend's own audio, then
 * speech-to-speech over the announcer-fun read, so every word keeps its
 * exact timestamp; zero re-timing needed). Announcer file swap only.
 */

export const DFO_DURATION = 936; // v17 AS POSTED 2026-09-01 — b-roll middle, one coach voice, savings chip, 31.2s

const DIR = "dont-fall-off";
const BOOKEND = `${DIR}/bookend-seedance-clean.mp4`; // v17 = THE POSTED VERSION (Joey: the v18/v19 spot paint-overs looked worse than the softened shine). Seedance video_edit pass, original audio muxed back.
const ANNOUNCER = `${DIR}/announcer-coach-tts.m4a`; // v16: middle spoken BY the cloned coach voice as fresh TTS (his natural cadence, not the announcer's prosody re-voiced — v15's STS kept the announcer delivery and read as a different guy). 4 lines pinned at 0.27/3.46/8.62/14.38s, 18.96s total, level matched.
const BED = `${DIR}/bed-boombap.mp3`; // v10: dusty boom-bap swagger (bounce-v1 read as corny; knock + drumline alts staged)
const ENDHOLD = `${DIR}/endhold-clean.png`; // v17: thumbs-up freeze from the clean bookend (11.87s)

// v13 anime b-roll (Higgsfield Seedance 2.0, 5s each, silent under the bed)
const BROLL_SQUAT = `${DIR}/broll-squat.mp4`; // woman barbell squat — three-names index
const BROLL_BAG = `${DIR}/broll-bag.mp4`; // coach on the heavy bag — DESIRE
const BROLL_SLED = `${DIR}/broll-sled.mp4`; // coach sled pull — DISCIPLINE
const BROLL_LADDER = `${DIR}/broll-ladder-v2.mp4`; // member on the Jacob's ladder — DEDICATION

const RED = DBS_COLORS.red500;
const BONE = DBS_COLORS.bone;
const BLACK = DBS_COLORS.black;
const INK = DBS_COLORS.ink2;
const HARD_SHADOW = "4px 4px 0 #000";

// ── Grid (fitted to the fun announcer read: title 0–3.1, names 4.0–8.2,
//    value 9.1–13.3, rules 14.5–18.4) ─────────────────────────────────────
// Seedance take: hook 0–5.58, chuckle gap, creed 7.5–11.48, thumbs-up to 12.06
const T_MID = 172; // coach open ends at source 5.73s; announcer + title begin
const T_INDEX = 326; // three-names card (names pop local 10 / 52 / 73)
const T_CARDS = 446; // detail cards over the value + rules lines
const CARD_LEN = 87;
const T_COACH2 = 707; // back to the coach (video startFrom 207f = source 6.9s)
const T_FREEZE = 856; // cut AT the thumbs-up (source 11.87s) → freeze it
const ANNOUNCER_LEN = 569; // full 18.96s read

// ─── Word-pop caption line ───────────────────────────────────────────────
type CapWord = { w: string; at: number; red?: boolean };

const CaptionLine: React.FC<{ words: CapWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        padding: `0 ${SAFE.sides - 30}px ${SAFE.bottom + 24}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 16,
          rowGap: 6,
          maxWidth: 900,
        }}
      >
        {words.map((wd, i) => {
          const on = frame >= wd.at;
          const pop = interpolate(frame - wd.at, [0, 4], [1.1, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={i}
              style={{
                fontFamily: DBS_FONTS.utility,
                fontWeight: 700,
                fontSize: 52,
                letterSpacing: DBS_TRACKING.wide,
                textTransform: "uppercase",
                color: wd.red ? RED : BONE,
                opacity: on ? 1 : 0,
                transform: `scale(${on ? pop : 1.1})`,
                textShadow: "3px 3px 0 #000",
                lineHeight: 1.15,
              }}
            >
              {wd.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Brand graphic background (shared by title/index/cards) ──────────────
const GraphicBG: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        opacity: inOp,
        background: `radial-gradient(900px 520px at 50% 22%, rgba(255,255,255,0.06), transparent 68%), radial-gradient(760px 420px at 24% 88%, rgba(232,29,29,0.24), transparent 70%), ${BLACK}`,
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
      {children}
    </AbsoluteFill>
  );
};

// ─── B-roll background — anime clip under a dark overlay (v13) ───────────
const BrollBG: React.FC<{ src: string; children?: React.ReactNode }> = ({
  src,
  children,
}) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: inOp, backgroundColor: BLACK }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(760px 420px at 24% 88%, rgba(232,29,29,0.18), transparent 70%), linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.6) 42%, rgba(5,5,5,0.74) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 7px)",
          opacity: 0.42,
          mixBlendMode: "screen",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

// ─── Title card (announcer: "The Don't Fall Off Fitness Special") ────────
const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [12, 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.7, 0.2, 1),
  });
  return (
    <GraphicBG>
      <AbsoluteFill
        style={{
          padding: `${SAFE.top}px ${SAFE.sides}px ${SAFE.bottom}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Slam startFrame={2} rotate={-2}>
          <div
            style={{
              transform: "skew(-7deg)",
              background: RED,
              padding: "8px 20px 10px",
              boxShadow: HARD_SHADOW,
            }}
          >
            <div
              style={{
                transform: "skew(7deg)",
                fontFamily: DBS_FONTS.utility,
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: DBS_TRACKING.widest,
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              New Fall Special
            </div>
          </div>
        </Slam>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            fontFamily: DBS_FONTS.display,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 0.88,
            letterSpacing: DBS_TRACKING.tight,
            color: BONE,
            textTransform: "uppercase",
            textShadow: HARD_SHADOW,
            whiteSpace: "nowrap",
          }}
        >
          <Slam startFrame={6} rotate={-1}>
            <div style={{ fontSize: 90 }}>THE DON&rsquo;T</div>
          </Slam>
          <Slam startFrame={12} rotate={-1}>
            <div style={{ position: "relative", display: "inline-block", fontSize: 116 }}>
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
              <span style={{ position: "relative", zIndex: 1 }}>FALL OFF</span>
            </div>
          </Slam>
          <Slam startFrame={18} rotate={-1}>
            <div style={{ fontSize: 72, marginTop: 8 }}>FITNESS SPECIAL</div>
          </Slam>
        </div>
      </AbsoluteFill>
    </GraphicBG>
  );
};

// ─── Index card — the three names land as the announcer says them ────────
// Announcer (global f110): desire @4.24s→f237, discipline @5.22→f267,
// dedication @6.22→f297. This card starts at f200 → local 37 / 67 / 97.
const IndexCard: React.FC = () => (
  <BrollBG src={BROLL_SQUAT}>
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
      <SlashLabel startFrame={4}>THREE PACKAGES</SlashLabel>
      <div style={{ marginTop: 36 }}>
        {[
          // v16: pops retimed to the coach TTS name onsets (5.19 / 6.47 / 7.84s)
          { n: "DESIRE", at: 3 },
          { n: "DISCIPLINE", at: 41 },
          { n: "DEDICATION", at: 82 },
        ].map((p, i) => (
          <Slam key={p.n} startFrame={p.at} rotate={-2}>
            <div
              style={{
                fontFamily: DBS_FONTS.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: 108,
                lineHeight: 1.06,
                letterSpacing: DBS_TRACKING.tight,
                color: i === 2 ? RED : BONE,
                textTransform: "uppercase",
                textShadow: i === 2 ? "7px 7px 0 #140000" : "7px 7px 0 #141414",
              }}
            >
              {p.n}
            </div>
          </Slam>
        ))}
      </div>
    </AbsoluteFill>
  </BrollBG>
);

// ─── Package detail cards ────────────────────────────────────────────────
type Pkg = {
  index: string;
  name: string;
  sessions: string;
  price: string;
  per?: string;
  comps: string;
  save: string;
  chip: string;
  chipRed?: boolean;
};

const PKGS: Pkg[] = [
  {
    index: "PACKAGE 01",
    name: "DESIRE",
    sessions: "15 SESSIONS",
    price: "$1,290",
    comps: "+ 8 COMP SESSIONS · 1 BODY SCAN",
    save: "SAVE $688",
    chip: "TRAIN 2X A WEEK MIN",
  },
  {
    index: "PACKAGE 02",
    name: "DISCIPLINE",
    sessions: "20 SESSIONS",
    price: "$1,520",
    per: "$76 / SESSION · REG. $82",
    comps: "+ 10 COMP SESSIONS · 2 BODY SCANS",
    save: "SAVE $940",
    chip: "TRAIN 2X A WEEK MIN",
  },
  {
    index: "PACKAGE 03",
    name: "DEDICATION",
    sessions: "48 SESSIONS",
    price: "$3,408",
    per: "$71 / SESSION · REG. $78",
    comps: "+ 11 COMP SESSIONS · 2 BODY SCANS",
    save: "SAVE $1,194",
    chip: "TRAIN 3X A WEEK MIN",
    chipRed: true,
  },
];

const PkgCard: React.FC<{ pkg: Pkg; broll: string }> = ({ pkg, broll }) => (
  <BrollBG src={broll}>
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
      <SlashLabel startFrame={2}>{pkg.index}</SlashLabel>

      <div style={{ marginTop: 20 }}>
        <Slam startFrame={5} rotate={-2}>
          <div
            style={{
              fontFamily: DBS_FONTS.display,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 128,
              lineHeight: 0.9,
              letterSpacing: DBS_TRACKING.tight,
              color: BONE,
              textTransform: "uppercase",
              textShadow: "7px 7px 0 #141414",
            }}
          >
            {pkg.name}
          </div>
        </Slam>
      </div>

      <div style={{ marginTop: 30 }}>
        <Slam startFrame={9} rotate={0} from={0.86}>
          <div
            style={{
              background: INK,
              boxShadow: HARD_SHADOW,
              borderTop: `5px solid ${RED}`,
              padding: "20px 42px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: DBS_FONTS.utility,
                fontWeight: 700,
                fontSize: 40,
                letterSpacing: DBS_TRACKING.wider,
                color: BONE,
                textTransform: "uppercase",
              }}
            >
              {pkg.sessions}
              <span style={{ color: RED }}> — {pkg.price}</span>
            </div>
            {pkg.per ? (
              <div
                style={{
                  marginTop: 10,
                  fontFamily: DBS_FONTS.utility,
                  fontWeight: 700,
                  fontSize: 27,
                  letterSpacing: DBS_TRACKING.wider,
                  color: DBS_COLORS.steel,
                  textTransform: "uppercase",
                }}
              >
                {pkg.per}
              </div>
            ) : null}
            <div
              style={{
                marginTop: 10,
                fontFamily: DBS_FONTS.utility,
                fontWeight: 700,
                fontSize: 27,
                letterSpacing: DBS_TRACKING.wider,
                color: BONE,
                textTransform: "uppercase",
              }}
            >
              {pkg.comps}
            </div>
          </div>
        </Slam>
      </div>

      <div style={{ marginTop: 34 }}>
        <Ribbon startFrame={15} fontSize={66}>
          {pkg.save}
        </Ribbon>
      </div>

      <div style={{ marginTop: 30 }}>
        <Slam startFrame={22} rotate={0}>
          <div
            style={{
              display: "inline-block",
              transform: "skew(-7deg)",
              background: pkg.chipRed ? RED : INK,
              border: pkg.chipRed ? "none" : `2px solid rgba(246,242,236,0.34)`,
              padding: "10px 24px 12px",
              boxShadow: HARD_SHADOW,
            }}
          >
            <div
              style={{
                transform: "skew(7deg)",
                fontFamily: DBS_FONTS.utility,
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: DBS_TRACKING.widest,
                color: BONE,
                textTransform: "uppercase",
              }}
            >
              {pkg.chip}
            </div>
          </div>
        </Slam>
      </div>
    </AbsoluteFill>
  </BrollBG>
);

// ─── End stamps over the frozen final stare ──────────────────────────────
const EndOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const scrim = interpolate(frame, [0, 12], [0, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(5,5,5,${scrim})` }} />
      <AbsoluteFill
        style={{
          padding: `${SAFE.top}px ${SAFE.sides}px ${SAFE.bottom - 60}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {["DON'T FALL OFF.", "BE DIFFERENT."].map((line, i) => (
          <Slam key={line} startFrame={4 + i * 6} rotate={-2}>
            <div
              style={{
                fontFamily: DBS_FONTS.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: 76,
                whiteSpace: "nowrap",
                lineHeight: 1.04,
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

        <div style={{ marginTop: 30 }}>
          <Ribbon startFrame={16} fontSize={44}>
            ASK AT THE FRONT DESK
          </Ribbon>
        </div>

        <Slam startFrame={24} rotate={0}>
          <div
            style={{
              marginTop: 26,
              fontFamily: DBS_FONTS.utility,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: DBS_TRACKING.wide,
              color: BONE,
              textTransform: "uppercase",
              textShadow: "3px 3px 0 #000",
            }}
          >
            Runs 4 months · 2 to 3 sessions a week
          </div>
        </Slam>

        <Slam startFrame={32} rotate={0}>
          <div
            style={{
              marginTop: 28,
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

// ─── Corner logo ─────────────────────────────────────────────────────────
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
      <Img
        src={staticFile("db-logo-red-outline.png")}
        style={{ width: 66, height: 66 }}
      />
    </div>
  );
};

// ─── Early savings flag — coach open only (v14) ──────────────────────────
const SavingsChip: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: SAFE.top - 40,
      left: 64,
      pointerEvents: "none",
    }}
  >
    <Slam startFrame={20} rotate={-2}>
      <div
        style={{
          transform: "skew(-7deg)",
          background: RED,
          padding: "8px 20px 10px",
          boxShadow: HARD_SHADOW,
        }}
      >
        <div
          style={{
            transform: "skew(7deg)",
            fontFamily: DBS_FONTS.utility,
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: DBS_TRACKING.widest,
            color: "#fff",
            textTransform: "uppercase",
          }}
        >
          Save up to $1,194
        </div>
      </div>
    </Slam>
  </div>
);

// ─── Coach beat: bookend video window with native audio + scrim ──────────
const CoachBeat: React.FC<{ startFrom: number }> = ({ startFrom }) => (
  <AbsoluteFill style={{ backgroundColor: BLACK }}>
    <OffthreadVideo
      src={staticFile(BOOKEND)}
      startFrom={startFrom}
      muted={false}
      volume={1}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(5,5,5,0) 46%, rgba(5,5,5,0.28) 70%, rgba(5,5,5,0.5) 100%)",
        pointerEvents: "none",
      }}
    />
  </AbsoluteFill>
);

// ─── Main composition ────────────────────────────────────────────────────
export const DontFallOffSpecial: React.FC = () => {
  useDBSFonts();
  return (
    <AbsoluteFill
      style={{ backgroundColor: BLACK, width: REEL_WIDTH, height: REEL_HEIGHT }}
    >
      {/* 1. coach opens — native Veo audio, real lip sync */}
      <Sequence from={0} durationInFrames={T_MID}>
        <CoachBeat startFrom={0} />
        <CaptionLine words={CAPS["hook"]} />
        <SavingsChip />
      </Sequence>

      {/* 2. announcer middle — title, the three names, the detail cards */}
      <Sequence from={T_MID} durationInFrames={T_INDEX - T_MID}>
        <TitleCard />
      </Sequence>
      <Sequence from={T_INDEX} durationInFrames={T_CARDS - T_INDEX}>
        <IndexCard />
      </Sequence>
      <Sequence from={T_CARDS} durationInFrames={CARD_LEN}>
        <PkgCard pkg={PKGS[0]} broll={BROLL_BAG} />
      </Sequence>
      <Sequence from={T_CARDS + CARD_LEN} durationInFrames={CARD_LEN}>
        <PkgCard pkg={PKGS[1]} broll={BROLL_SLED} />
      </Sequence>
      <Sequence
        from={T_CARDS + CARD_LEN * 2}
        durationInFrames={T_COACH2 - (T_CARDS + CARD_LEN * 2)}
      >
        <PkgCard pkg={PKGS[2]} broll={BROLL_LADDER} />
      </Sequence>

      {/* 3. coach closes — same single generation, same voice, ends on him */}
      <Sequence from={T_COACH2} durationInFrames={T_FREEZE - T_COACH2}>
        <CoachBeat startFrom={207} />
        <CaptionLine words={CAPS["creed"]} />
      </Sequence>

      {/* 4. freeze his stare, land the stamps */}
      <Sequence from={T_FREEZE} durationInFrames={DFO_DURATION - T_FREEZE}>
        <AbsoluteFill style={{ backgroundColor: BLACK }}>
          <Img
            src={staticFile(ENDHOLD)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
        <EndOverlay />
      </Sequence>

      {/* corner logo until the stamps */}
      <Sequence from={0} durationInFrames={T_FREEZE}>
        <CornerLogo />
      </Sequence>

      {/* announcer voice — one TTS read across the whole middle */}
      <Sequence from={T_MID} durationInFrames={ANNOUNCER_LEN}>
        <Audio src={staticFile(ANNOUNCER)} />
      </Sequence>

      {/* bed from frame ONE (32s bed covers the 31.2s comp) — under the
          coach beats, up with the announcer, lifted for the stamps */}
      <Audio
        src={staticFile(BED)}
        volume={(f) =>
          interpolate(
            f,
            [0, 10, 160, 172, 695, 707, 850, 864, 912, DFO_DURATION],
            [0, 0.18, 0.18, 0.35, 0.35, 0.18, 0.18, 0.5, 0.5, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
    </AbsoluteFill>
  );
};
