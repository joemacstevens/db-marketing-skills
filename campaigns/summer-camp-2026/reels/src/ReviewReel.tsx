import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  OffthreadVideo,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Audio } from "@remotion/media";
import { COLORS, FONTS, FPS } from "./components/BrandStyles";
import { EndTagScene } from "./components/EndTagScene";

const SAFE_TOP = 210;
const SAFE_BOTTOM = 420;
const SAFE_SIDES = 80;

// -------------------------------------------------------------------
// Review data — swap these with real Google / Yelp reviews
// -------------------------------------------------------------------
const REVIEWS = [
  {
    name: "Marcus T.",
    stars: 5,
    text: "Best gym in Jersey. The coaches actually care about your progress. Don sets a standard you won't find anywhere else.",
    clip: "feb13-pilates-core.mov",
    trimStart: 0,
  },
  {
    name: "Sarah M.",
    stars: 5,
    text: "My kids did summer camp last year and they're already asking about this year. The discipline and confidence they came home with was incredible.",
    clip: "apr2-squats-resistance.mov",
    trimStart: 1 * FPS,
  },
  {
    name: "David R.",
    stars: 5,
    text: "Not your average gym. The energy, the coaching, the community — it's a whole different level. You walk in and you feel it.",
    clip: "apr5-25-jacobs-ladder.mov",
    trimStart: 0,
  },
  {
    name: "Jasmine L.",
    stars: 5,
    text: "I've trained at a lot of places. Nothing compares. The programming is legit and the coaches push you the right way.",
    clip: "apr1-25-sled-push.mov",
    trimStart: 1 * FPS,
  },
] as const;

// -------------------------------------------------------------------
// Timing
// -------------------------------------------------------------------
const HOOK_DURATION = 75; // 2.5s opening hook
const REVIEW_DURATION = 135; // 4.5s per review card
const TRANSITION_FRAMES = 10;
const END_TAG_DURATION = 120; // 4s

export const REVIEW_REEL_DURATION =
  HOOK_DURATION +
  REVIEWS.length * REVIEW_DURATION -
  REVIEWS.length * TRANSITION_FRAMES + // transitions between hook→reviews and review→review
  END_TAG_DURATION;

// -------------------------------------------------------------------
// Star rating row
// -------------------------------------------------------------------
const Stars: React.FC<{ count: number; size?: number }> = ({
  count,
  size = 36,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => {
        const starSpring = spring({
          frame: frame - 8 - i * 3,
          fps,
          config: { damping: 12, stiffness: 200 },
          durationInFrames: 14,
        });
        const scale = interpolate(starSpring, [0, 1], [0, 1]);
        const rotation = interpolate(starSpring, [0, 1], [-90, 0]);

        return (
          <div
            key={i}
            style={{
              fontSize: size,
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              color: "#FFD700",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            ★
          </div>
        );
      })}
    </div>
  );
};

// -------------------------------------------------------------------
// Hook scene — "What Our Members Are Saying"
// -------------------------------------------------------------------
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // "Google" icon / 5 stars badge
  const badgeSpring = spring({
    frame: frame - 3,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.5, 1]);
  const badgeOp = interpolate(badgeSpring, [0, 1], [0, 1]);

  const titleSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);

  const subSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });
  const subOp = interpolate(subSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Subtle background video (dimmed) */}
      <AbsoluteFill style={{ opacity: 0.25 }}>
        <OffthreadVideo
          src={staticFile("apr2-squats-resistance.mov")}
          startFrom={2 * FPS}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: SAFE_SIDES,
          paddingRight: SAFE_SIDES,
        }}
      >
        {/* Stars badge */}
        <div
          style={{
            transform: `scale(${badgeScale})`,
            opacity: badgeOp,
            marginBottom: 24,
          }}
        >
          <Stars count={5} size={48} />
        </div>

        {/* Title */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOp,
            fontFamily: FONTS.headline,
            fontSize: 58,
            fontWeight: 700,
            color: COLORS.white,
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: -1,
            lineHeight: 1.1,
          }}
        >
          What Our{"\n"}
          <span style={{ color: COLORS.red }}>Members</span> Say
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: subOp,
            fontFamily: FONTS.body,
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: 3,
            marginTop: 20,
          }}
        >
          Real Reviews. Real Results.
        </div>
      </AbsoluteFill>

      {/* DB Logo */}
      <div
        style={{
          position: "absolute",
          top: SAFE_TOP,
          right: SAFE_SIDES,
          opacity: 0.85,
        }}
      >
        <Img
          src={staticFile("db-logo-red-outline.png")}
          style={{ width: 70, height: 70 }}
        />
      </div>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------------
// Single review card scene
// -------------------------------------------------------------------
const ReviewCard: React.FC<{
  name: string;
  stars: number;
  text: string;
  clip: string;
  trimStart: number;
}> = ({ name, stars, text, clip, trimStart }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Background video zoom
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.1], {
    extrapolateRight: "clamp",
  });

  // Card entrance
  const cardSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
    durationInFrames: 22,
  });
  const cardY = interpolate(cardSpring, [0, 1], [120, 0]);
  const cardOp = interpolate(cardSpring, [0, 1], [0, 1]);

  // Quote text typewriter-ish fade
  const textSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 200 },
    durationInFrames: 25,
  });
  const textOp = interpolate(textSpring, [0, 1], [0, 1]);

  // Name entrance
  const nameSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 200 },
    durationInFrames: 18,
  });
  const nameOp = interpolate(nameSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Background video */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile(clip)}
          startFrom={trimStart}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>

      {/* Heavy darken overlay for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.3) 65%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* DB Logo */}
      <div
        style={{
          position: "absolute",
          top: SAFE_TOP,
          right: SAFE_SIDES,
          opacity: 0.85,
        }}
      >
        <Img
          src={staticFile("db-logo-red-outline.png")}
          style={{ width: 70, height: 70 }}
        />
      </div>

      {/* Review card content — positioned in lower safe area */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          paddingBottom: SAFE_BOTTOM + 60,
          paddingLeft: SAFE_SIDES + 20,
          paddingRight: SAFE_SIDES + 20,
        }}
      >
        <div
          style={{
            transform: `translateY(${cardY}px)`,
            opacity: cardOp,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Stars */}
          <Stars count={stars} size={40} />

          {/* Quote mark + review text */}
          <div style={{ opacity: textOp }}>
            <div
              style={{
                fontFamily: FONTS.headline,
                fontSize: 72,
                fontWeight: 700,
                color: COLORS.red,
                lineHeight: 0.6,
                marginBottom: 8,
              }}
            >
              {"\u201C"}
            </div>
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 38,
                fontWeight: 600,
                color: COLORS.white,
                lineHeight: 1.4,
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              }}
            >
              {text}
            </div>
          </div>

          {/* Reviewer name */}
          <div
            style={{
              opacity: nameOp,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 3,
                backgroundColor: COLORS.red,
              }}
            />
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 26,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {name}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------------
// Main composition
// -------------------------------------------------------------------
export const ReviewReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const contentDuration =
    HOOK_DURATION +
    REVIEWS.length * REVIEW_DURATION -
    REVIEWS.length * TRANSITION_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.black }}>
      {/* Music — Juicy instrumental, smooth confidence */}
      <Audio
        src={staticFile("music-juicy-instrumental.mp3")}
        volume={(f) =>
          interpolate(
            f,
            [0, fps * 0.5, durationInFrames - fps * 2, durationInFrames],
            [0, 0.55, 0.55, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      <TransitionSeries>
        {/* Hook scene */}
        <TransitionSeries.Sequence durationInFrames={HOOK_DURATION}>
          <HookScene />
        </TransitionSeries.Sequence>

        {/* Review cards */}
        {REVIEWS.map((review, i) => (
          <React.Fragment key={review.name}>
            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
            />
            <TransitionSeries.Sequence durationInFrames={REVIEW_DURATION}>
              <ReviewCard
                name={review.name}
                stars={review.stars}
                text={review.text}
                clip={review.clip}
                trimStart={review.trimStart}
              />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Fade to black before end tag */}
      <Sequence from={contentDuration - 20} durationInFrames={20}>
        <AbsoluteFill
          style={{
            backgroundColor: COLORS.black,
            opacity: interpolate(
              frame - (contentDuration - 20),
              [0, 20],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ),
          }}
        />
      </Sequence>

      {/* End tag */}
      <Sequence from={contentDuration} durationInFrames={END_TAG_DURATION}>
        <EndTagScene tagline="5-Star Rated" />
      </Sequence>
    </AbsoluteFill>
  );
};
