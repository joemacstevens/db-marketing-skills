import React from "react";
import { Composition, Folder } from "remotion";
import { Post1Announcement } from "./Post1Announcement";
import { YouthFitnessPrimetime } from "./YouthFitnessPrimetime";
import { BuiltDifferent, BUILT_DIFFERENT_DURATION } from "./BuiltDifferent";
import { WholeFamilyTrains, WHOLE_FAMILY_DURATION } from "./WholeFamilyTrains";
import { HerWorkout, HER_WORKOUT_DURATION } from "./HerWorkout";
import { ReviewReel, REVIEW_REEL_DURATION } from "./ReviewReel";
import { REEL_WIDTH, REEL_HEIGHT, FPS } from "./components/BrandStyles";

// Post1: 5 scenes × 90 frames - 4 transitions × 10 frames + 15 extra on CTA = 425 frames
const POST1_DURATION = 5 * 90 - 4 * 10 + 15;

// YouthFitness: 725 frames video + 120 frames end tag = 845 frames (~28s)
const YOUTH_FITNESS_DURATION = 725 + 120;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Summer-Camp-2026">
        <Composition
          id="Post1Announcement"
          component={Post1Announcement}
          durationInFrames={POST1_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="YouthFitnessPrimetime"
          component={YouthFitnessPrimetime}
          durationInFrames={YOUTH_FITNESS_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>

      <Folder name="April-2026-Reels">
        <Composition
          id="BuiltDifferent"
          component={BuiltDifferent}
          durationInFrames={BUILT_DIFFERENT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="WholeFamilyTrains"
          component={WholeFamilyTrains}
          durationInFrames={WHOLE_FAMILY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="HerWorkout"
          component={HerWorkout}
          durationInFrames={HER_WORKOUT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="ReviewReel"
          component={ReviewReel}
          durationInFrames={REVIEW_REEL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
    </>
  );
};
