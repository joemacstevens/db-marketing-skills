import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { COLORS, FONTS, SAFE } from "./components/BrandStyles";
import { TextScramble } from "./cinematic-effects";

/*
 * ─── Jack & Jill × DB — A Day of Dedication (25s Recap) ─────────────
 *
 * Full-day wellness-event recap. Dual VO — Jessica (F, warm) + Brian
 * (M, deep). Seven beat clips + Dedication group cheer climax (which
 * keeps its original audio) + end card.
 *
 * Duration: 750 frames @ 30fps = 25.0s
 * Music bed: Kanye West — We Major (instrumental), ducked under VO.
 * VO: 7 ElevenLabs lines (jj1-saturday…jj4-smiled + m1-hands…m3-moved).
 *
 * Beat timeline:
 *   1.   0–60    (2.0s)  Slate — "Jack & Jill × DB" on group-photo backdrop
 *   2.  60–170   (3.7s)  jjr-1 (kids turf w/ Coach Joe)  · F-VO: Saturday morning…
 *   3. 170–250   (2.7s)  jjr-2 (40-kid run)              · F-VO: Forty kids. One floor.
 *   4. 250–310   (2.0s)  jjr-3 (boy jab on DB logo)      · M-VO: They put their hands up.
 *   5. 310–385   (2.5s)  jjr-4 (ring combos)             · M-VO: They hit the combinations.
 *   6. 385–465   (2.7s)  jjr-5 (TRX parents in Pulse)    · F-VO: The parents trained too.
 *   7. 465–540   (2.5s)  jjr-6 (mixed pogo)              · M-VO: Everybody moved.
 *   8. 540–615   (2.5s)  jjr-7 (Pulse Zumba)             · F-VO: Everybody smiled.
 *   9. 615–690   (2.5s)  jjr-8 (group cheer, native audio) — DEDICATION text
 *  10. 690–750   (2.0s)  End card — DB × Jack & Jill
 *
 * IG Reel text-safe band: y ∈ [260, 1500].
 */

export const JJ_DEDICATION_DURATION = 780;

// ─── Reusable video beat ───────────────────────────────────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  brightness?: number;
  muted?: boolean;
}> = ({
  src,
  durationInFrames,
  fadeInFrames = 5,
  fadeOutFrames = 8,
  brightness = 0.88,
  muted = true,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <div
        style={{
          opacity,
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness}) contrast(1.18) saturate(0.95)`,
          }}
          muted={muted}
          volume={muted ? 0 : 1}
        />
      </div>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(20,5,0,0.3) 100%)",
          opacity,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }}
      />
      {/* Text-band readability gradient */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 10%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.18) 70%, transparent 95%)",
          opacity: opacity * 0.55,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Caption line (lower-third + red accent) ──────────────────────
const Caption: React.FC<{
  line: string;
  enterFrame?: number;
  exitFrame: number;
  voice: "F" | "M";
}> = ({ line, enterFrame = 4, exitFrame, voice }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const y = interpolate(enter, [0, 1], [18, 0]);
  const exit = interpolate(frame, [exitFrame - 8, exitFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const accentColor = voice === "M" ? COLORS.red : "#E8B543"; // warm gold for F, red for M

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: Math.min(opacity, exit),
          transform: `translateY(${y}px)`,
          paddingLeft: SAFE.sides,
          paddingRight: SAFE.sides,
          marginTop: 300,
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 80,
            height: 3,
            backgroundColor: accentColor,
            margin: "0 auto 18px auto",
          }}
        />
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: 76,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -1.2,
            lineHeight: 1.04,
            textTransform: "uppercase",
            textShadow: "0 6px 40px rgba(0,0,0,0.95)",
          }}
        >
          {line}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Slate: Title card over group photo ───────────────────────────
const Slate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleBg = interpolate(frame, [0, 60], [1.08, 1.15], {
    extrapolateRight: "clamp",
  });
  const textSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 180 },
    durationInFrames: 20,
  });
  const kickerOp = interpolate(textSpring, [0, 1], [0, 1]);
  const kickerY = interpolate(textSpring, [0, 1], [14, 0]);
  const headlineOp = interpolate(frame, [14, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [48, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barWidth = interpolate(
    spring({
      frame: frame - 22,
      fps,
      config: { damping: 200 },
      durationInFrames: 16,
    }),
    [0, 1],
    [0, 180]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Img
        src={staticFile("jjr-dedication-still.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
          transform: `scale(${scaleBg})`,
          filter: "brightness(0.45) contrast(1.15) saturate(0.92)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        <div
          style={{ opacity: exit, textAlign: "center", width: "100%" }}
        >
          <div
            style={{
              opacity: kickerOp,
              transform: `translateY(${kickerY}px)`,
              fontFamily: FONTS.body,
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255,255,255,0.82)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 18,
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            Jack &amp; Jill × Different Breed
          </div>
          <div
            style={{
              opacity: headlineOp,
              fontFamily: FONTS.headline,
              fontSize: 132,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -3,
              lineHeight: 0.92,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.98)",
            }}
          >
            A Day of
            <br />
            <span style={{ color: COLORS.red }}>Dedication.</span>
          </div>
          <div
            style={{
              width: barWidth,
              height: 4,
              backgroundColor: COLORS.red,
              margin: "30px auto 0",
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Beat 9: Dedication climax (group cheer, native audio) ────────
const BeatDedication: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <VideoBeat
        src="jjr-8-dedication.mp4"
        durationInFrames={75}
        brightness={0.88}
        muted={false}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ textAlign: "center", width: "100%" }}>
          <TextScramble
            text="DEDICATION."
            startFrame={8}
            framesPerChar={1.5}
            fontSize={128}
            fontWeight={700}
            color={COLORS.white}
            fontFamily={FONTS.headline}
            letterSpacing={-3}
            style={{
              textShadow: "0 8px 60px rgba(0,0,0,0.98)",
              textAlign: "center",
              width: "100%",
              lineHeight: 0.95,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── End Card ─────────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.88, 1]);

  const tagSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [14, 0]);

  const barWidth = interpolate(
    spring({
      frame: frame - 16,
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 220]
  );

  const creditOpacity = interpolate(frame, [24, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        <div style={{ opacity: logoOpacity, transform: `scale(${logoScale})` }}>
          <Img
            src={staticFile("evolve-db-white-red.png")}
            style={{
              width: 540,
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.6))",
            }}
          />
        </div>

        <div
          style={{
            width: barWidth,
            height: 4,
            backgroundColor: COLORS.red,
            marginTop: 30,
            marginBottom: 22,
          }}
        />

        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -0.5,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Health. Wellness. <span style={{ color: COLORS.red }}>Family.</span>
        </div>

        <div
          style={{
            opacity: creditOpacity,
            fontFamily: FONTS.body,
            fontSize: 20,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            marginTop: 22,
            letterSpacing: 4,
            textAlign: "center",
            lineHeight: 1.5,
            textTransform: "uppercase",
          }}
        >
          Jack &amp; Jill Bergen-Passaic
          <br />
          × Different Breed Elite Fitness
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────
export const JackJillDedication25: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Beat 1: Slate (0–60) */}
      <Sequence from={0} durationInFrames={60}>
        <Slate />
      </Sequence>

      {/* Beat 2: kids turf (60–185) — F-VO: Saturday morning */}
      <Sequence from={60} durationInFrames={125}>
        <VideoBeat src="jjr-1-kids-turf.mp4" durationInFrames={125} />
        <Caption
          line="Saturday at Different Breed."
          exitFrame={117}
          voice="F"
        />
      </Sequence>

      {/* Beat 3: 40-kid run (185–275) — F-VO: Forty kids. One floor. */}
      <Sequence from={185} durationInFrames={90}>
        <VideoBeat src="jjr-2-forty.mp4" durationInFrames={90} />
        <Caption line="Forty kids. One floor." exitFrame={82} voice="F" />
      </Sequence>

      {/* Beat 4: boy jab on DB logo (275–335) — M-VO: Hands up */}
      <Sequence from={275} durationInFrames={60}>
        <VideoBeat src="jjr-3-hands.mp4" durationInFrames={60} />
        <Caption line="Hands up." exitFrame={52} voice="M" />
      </Sequence>

      {/* Beat 5: ring combos (335–410) — M-VO: Combinations */}
      <Sequence from={335} durationInFrames={75}>
        <VideoBeat src="jjr-4-combos.mp4" durationInFrames={75} />
        <Caption line="Hit the combinations." exitFrame={67} voice="M" />
      </Sequence>

      {/* Beat 6: TRX parents in Pulse (410–490) — F-VO: Parents trained too */}
      <Sequence from={410} durationInFrames={80}>
        <VideoBeat src="jjr-5-parents.mp4" durationInFrames={80} />
        <Caption line="Parents trained too." exitFrame={72} voice="F" />
      </Sequence>

      {/* Beat 7: mixed pogo (490–565) — M-VO: Everybody moved */}
      <Sequence from={490} durationInFrames={75}>
        <VideoBeat src="jjr-6-pogo.mp4" durationInFrames={75} />
        <Caption line="Everybody moved." exitFrame={67} voice="M" />
      </Sequence>

      {/* Beat 8: Pulse Zumba (565–640) — F-VO: Everybody smiled */}
      <Sequence from={565} durationInFrames={75}>
        <VideoBeat src="jjr-7-zumba.mp4" durationInFrames={75} />
        <Caption line="Everybody smiled." exitFrame={67} voice="F" />
      </Sequence>

      {/* Beat 9: Dedication (640–720) — native audio from group cheer */}
      <Sequence from={640} durationInFrames={80}>
        <BeatDedication />
      </Sequence>

      {/* Beat 10: End card (720–780) */}
      <Sequence from={720} durationInFrames={60}>
        <EndCard />
      </Sequence>

      {/* ─── VO layers ─────────────────────────────────────────── */}
      {/* F1: Saturday morning (60) */}
      <Sequence from={60}>
        <Audio src={staticFile("f1-saturday.mp3")} volume={1.0} />
      </Sequence>
      {/* F2: Forty kids. (190) — small breath */}
      <Sequence from={190}>
        <Audio src={staticFile("f2-forty.mp3")} volume={1.0} />
      </Sequence>
      {/* M1: Hands up. (282) */}
      <Sequence from={282}>
        <Audio src={staticFile("m1-hands.mp3")} volume={1.0} />
      </Sequence>
      {/* M2: Combinations. (340) */}
      <Sequence from={340}>
        <Audio src={staticFile("m2-combos.mp3")} volume={1.0} />
      </Sequence>
      {/* F3: Parents trained too. (420) */}
      <Sequence from={420}>
        <Audio src={staticFile("f3-parents.mp3")} volume={1.0} />
      </Sequence>
      {/* M3: Everybody moved. (495) */}
      <Sequence from={495}>
        <Audio src={staticFile("m3-moved.mp3")} volume={1.0} />
      </Sequence>
      {/* F4: Everybody smiled. (572) */}
      <Sequence from={572}>
        <Audio src={staticFile("f4-smiled.mp3")} volume={1.0} />
      </Sequence>

      {/* ─── Music bed — We Major instrumental ─────────────────── */}
      <Audio
        src={staticFile("music-we-major.mp3")}
        volume={(f) => {
          if (f < 30) return interpolate(f, [0, 30], [0, 0.38]);
          if (f < 640) return 0.18;
          if (f < 720) return interpolate(f, [640, 720], [0.18, 0.55]);
          return interpolate(f, [720, 780], [0.55, 0]);
        }}
      />
    </AbsoluteFill>
  );
};
