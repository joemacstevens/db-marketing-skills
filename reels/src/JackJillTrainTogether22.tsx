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

/*
 * ─── Jack & Jill × DB — Train Together, Different (22s Pulse reel) ─
 *
 * The adults' side of the day — Pulse studio TRX, Zumba, community.
 * Single female VO (Jessica, warm). Music bed ducks under VO.
 *
 * Duration: 660 frames @ 30fps = 22.0s
 * Music: Seven Nation Army instrumental (reused, different context)
 * VO: 6 ElevenLabs lines (p1-came … p6-different)
 *
 * Beat timeline:
 *   1.   0–50    (1.7s)  Slate — "The parents WORKED TOO." over Pulse
 *   2.  50–140   (3.0s)  jjp-1 (Pulse + leopard TRX)       · VO: They came with their kids.
 *   3. 140–230   (3.0s)  jjp-2 (TRX tricep peak)           · VO: And they didn't just watch.
 *   4. 230–300   (2.3s)  jjp-3 (TRX hip raises)            · VO: They trained.  — red text
 *   5. 300–370   (2.3s)  jjp-4 (Jack & Jill shirt in ring) · VO: Together.
 *   6. 370–460   (3.0s)  jjp-5 (Zumba joy)                 · VO: And they had fun doing it.
 *   7. 460–520   (2.0s)  jjp-6 (Coach arms-up / laugh)     · (silent, music swells)
 *   8. 520–610   (3.0s)  jjp-7 (group cheer, muted)        · VO: That's what different looks like.
 *   9. 610–660   (1.7s)  End card — DB × Jack & Jill
 */

export const JJ_TRAIN_DURATION = 670;

// ─── VideoBeat (fades + grade) ────────────────────────────────────
const VideoBeat: React.FC<{
  src: string;
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  brightness?: number;
}> = ({
  src,
  durationInFrames,
  fadeInFrames = 5,
  fadeOutFrames = 8,
  brightness = 0.92,
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
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.07], {
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
            filter: `brightness(${brightness}) contrast(1.15) saturate(0.96)`,
          }}
          muted
        />
      </div>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.5) 100%)",
          opacity,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, transparent 10%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.18) 70%, transparent 95%)",
          opacity: opacity * 0.55,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Caption (lower-third, gold accent) ───────────────────────────
const Caption: React.FC<{
  line: string;
  enterFrame?: number;
  exitFrame: number;
  color?: string;
  emphasis?: boolean;
}> = ({ line, enterFrame = 4, exitFrame, color = COLORS.white, emphasis = false }) => {
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
  const scale = emphasis ? interpolate(enter, [0, 1], [1.25, 1]) : 1;

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
          transform: `translateY(${y}px) scale(${scale})`,
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
            backgroundColor: "#E8B543",
            margin: "0 auto 18px auto",
          }}
        />
        <div
          style={{
            fontFamily: FONTS.headline,
            fontSize: emphasis ? 112 : 78,
            fontWeight: 700,
            color,
            letterSpacing: emphasis ? -2 : -1.2,
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

// ─── Slate ────────────────────────────────────────────────────────
const Slate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleBg = interpolate(frame, [0, 50], [1.08, 1.14], {
    extrapolateRight: "clamp",
  });
  const textSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 180 },
    durationInFrames: 20,
  });
  const kickerOp = interpolate(textSpring, [0, 1], [0, 1]);
  const headlineOp = interpolate(frame, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [40, 50], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      <Img
        src={staticFile("jjp-pulse-still.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 40%",
          transform: `scale(${scaleBg})`,
          filter: "brightness(0.45) contrast(1.15) saturate(0.95)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.85) 100%)",
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
        <div style={{ opacity: exit, textAlign: "center", width: "100%" }}>
          <div
            style={{
              opacity: kickerOp,
              fontFamily: FONTS.body,
              fontSize: 20,
              fontWeight: 600,
              color: "rgba(255,255,255,0.78)",
              letterSpacing: 8,
              textTransform: "uppercase",
              marginBottom: 18,
              textShadow: "0 2px 18px rgba(0,0,0,0.9)",
            }}
          >
            Jack &amp; Jill × Pulse Studio
          </div>
          <div
            style={{
              opacity: headlineOp,
              fontFamily: FONTS.headline,
              fontSize: 112,
              fontWeight: 700,
              color: COLORS.white,
              letterSpacing: -2.5,
              lineHeight: 0.92,
              textTransform: "uppercase",
              textShadow: "0 6px 40px rgba(0,0,0,0.98)",
            }}
          >
            The parents
            <br />
            <span style={{ color: COLORS.red }}>worked too.</span>
          </div>
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
    durationInFrames: 16,
  });
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);
  const logoScale = interpolate(logoSpring, [0, 1], [0.88, 1]);

  const tagSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
    durationInFrames: 16,
  });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [14, 0]);

  const barWidth = interpolate(
    spring({
      frame: frame - 14,
      fps,
      config: { damping: 200 },
      durationInFrames: 12,
    }),
    [0, 1],
    [0, 220]
  );

  const creditOpacity = interpolate(frame, [18, 30], [0, 1], {
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
            marginTop: 28,
            marginBottom: 22,
          }}
        />

        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontFamily: FONTS.headline,
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.white,
            letterSpacing: -1,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Train <span style={{ color: COLORS.red }}>Together.</span>
        </div>

        <div
          style={{
            opacity: creditOpacity,
            fontFamily: FONTS.body,
            fontSize: 20,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            marginTop: 20,
            letterSpacing: 4,
            textAlign: "center",
            lineHeight: 1.5,
            textTransform: "uppercase",
          }}
        >
          Pulse Studio at Different Breed
          <br />
          Jack &amp; Jill Bergen-Passaic
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────
export const JackJillTrainTogether22: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Beat 1: Slate (0–50) */}
      <Sequence from={0} durationInFrames={50}>
        <Slate />
      </Sequence>

      {/* Beat 2: Pulse TRX leopard (50–140) — VO: They came with their kids */}
      <Sequence from={50} durationInFrames={90}>
        <VideoBeat src="jjp-1-pulse.mp4" durationInFrames={90} />
        <Caption line="They came with their kids." exitFrame={82} />
      </Sequence>

      {/* Beat 3: TRX tricep (140–240) — VO: And they didn't just watch */}
      <Sequence from={140} durationInFrames={100}>
        <VideoBeat src="jjp-2-trx.mp4" durationInFrames={100} />
        <Caption line="They didn't just watch." exitFrame={92} />
      </Sequence>

      {/* Beat 4: Hip raises (240–310) — VO: They trained (emphasis, red) */}
      <Sequence from={240} durationInFrames={70}>
        <VideoBeat src="jjp-3-hips.mp4" durationInFrames={70} />
        <Caption
          line="They trained."
          exitFrame={62}
          color={COLORS.red}
          emphasis
        />
      </Sequence>

      {/* Beat 5: J&J shirt (310–380) — VO: Together (emphasis) */}
      <Sequence from={310} durationInFrames={70}>
        <VideoBeat src="jjp-4-jj.mp4" durationInFrames={70} />
        <Caption line="Together." exitFrame={62} emphasis />
      </Sequence>

      {/* Beat 6: Zumba joy (380–470) — VO: And they had fun doing it */}
      <Sequence from={380} durationInFrames={90}>
        <VideoBeat src="jjp-5-zumba1.mp4" durationInFrames={90} />
        <Caption line="And they had fun doing it." exitFrame={82} />
      </Sequence>

      {/* Beat 7: Zumba coach arms-up (470–530) — silent, music swells */}
      <Sequence from={470} durationInFrames={60}>
        <VideoBeat src="jjp-6-zumba2.mp4" durationInFrames={60} />
      </Sequence>

      {/* Beat 8: Group photo (530–620) — VO: That's what different looks like */}
      <Sequence from={530} durationInFrames={90}>
        <VideoBeat src="jjp-7-group.mp4" durationInFrames={90} />
        <Caption
          line="That's what different looks like."
          exitFrame={82}
        />
      </Sequence>

      {/* Beat 9: End card (620–670) */}
      <Sequence from={620} durationInFrames={50}>
        <EndCard />
      </Sequence>

      {/* ─── VO layers (single female — Tonya) ─────────────── */}
      <Sequence from={55}>
        <Audio src={staticFile("p1-came.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={148}>
        <Audio src={staticFile("p2-watch.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={250}>
        <Audio src={staticFile("p3-trained.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={320}>
        <Audio src={staticFile("p4-together.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={388}>
        <Audio src={staticFile("p5-fun.mp3")} volume={1.0} />
      </Sequence>
      <Sequence from={540}>
        <Audio src={staticFile("p6-different.mp3")} volume={1.0} />
      </Sequence>

      {/* ─── Music bed — Seven Nation Army ──────────────────── */}
      <Audio
        src={staticFile("music-seven-nation-army.mp3")}
        volume={(f) => {
          if (f < 24) return interpolate(f, [0, 24], [0, 0.4]);
          if (f < 470) return 0.2;
          if (f < 530) return interpolate(f, [470, 530], [0.2, 0.6]);
          if (f < 610) return 0.28;
          return interpolate(f, [610, 670], [0.28, 0]);
        }}
      />
    </AbsoluteFill>
  );
};
