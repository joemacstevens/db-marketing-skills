import React from "react";
import { Composition, Folder } from "remotion";
import { CampStoryApril14, CAMP_STORY_DURATION } from "./CampStoryApril14";
import {
  CoreControlSaturdayApr16,
  CORE_CONTROL_DURATION,
} from "./CoreControlSaturdayApr16";
import {
  ColiseumPhase01,
  COLISEUM_PHASE_01_DURATION,
} from "./ColiseumPhase01";
import {
  ColosseumPhase02,
  COLOSSEUM_PHASE_02_DURATION,
} from "./ColosseumPhase02";
import {
  StrengthConditioning30,
  SC30_DURATION,
} from "./StrengthConditioning30";
import {
  StrengthConditioning15,
  SC15_DURATION,
} from "./StrengthConditioning15";
import {
  StrengthCondDanny30,
  DANNY_SC_DURATION,
} from "./StrengthCondDanny30";
import { JustWork15, JUST_WORK_DURATION } from "./JustWork15";
import { JustWork15Vol2, JUST_WORK_VOL2_DURATION } from "./JustWork15Vol2";
import { FullBodyIgniter20, FBI_DURATION } from "./FullBodyIgniter20";
import { WhatPeopleSay30, WPS_DURATION } from "./WhatPeopleSay30";
import { ScheduleReel, SCHEDULE_REEL_DURATION } from "./ScheduleReel";
import { DEFAULT_SCHEDULE_PROPS } from "./schedule/defaultProps";
import {
  JackJillNextGen15,
  JJ_NEXT_GEN_DURATION,
} from "./JackJillNextGen15";
import {
  JackJillDedication25,
  JJ_DEDICATION_DURATION,
} from "./JackJillDedication25";
import {
  JackJillTrainTogether22,
  JJ_TRAIN_DURATION,
} from "./JackJillTrainTogether22";
import { REEL_WIDTH, REEL_HEIGHT, FPS } from "./components/BrandStyles";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Summer-Camp-2026">
        <Composition
          id="CampStoryApril14"
          component={CampStoryApril14}
          durationInFrames={CAMP_STORY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Core-Control">
        <Composition
          id="CoreControlSaturdayApr16"
          component={CoreControlSaturdayApr16}
          durationInFrames={CORE_CONTROL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="The-Coliseum">
        <Composition
          id="ColiseumPhase01"
          component={ColiseumPhase01}
          durationInFrames={COLISEUM_PHASE_01_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="The-Colosseum">
        <Composition
          id="ColosseumPhase02"
          component={ColosseumPhase02}
          durationInFrames={COLOSSEUM_PHASE_02_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Full-Body-Igniter">
        <Composition
          id="FullBodyIgniter20"
          component={FullBodyIgniter20}
          durationInFrames={FBI_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Strength-Conditioning">
        <Composition
          id="StrengthConditioning30"
          component={StrengthConditioning30}
          durationInFrames={SC30_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="StrengthConditioning15"
          component={StrengthConditioning15}
          durationInFrames={SC15_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="StrengthCondDanny30"
          component={StrengthCondDanny30}
          durationInFrames={DANNY_SC_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Just-Work">
        <Composition
          id="JustWork15"
          component={JustWork15}
          durationInFrames={JUST_WORK_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JustWork15Vol2"
          component={JustWork15Vol2}
          durationInFrames={JUST_WORK_VOL2_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Schedule">
        <Composition
          id="ScheduleReel"
          component={ScheduleReel}
          durationInFrames={SCHEDULE_REEL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
          defaultProps={DEFAULT_SCHEDULE_PROPS}
        />
      </Folder>
      <Folder name="What-People-Are-Saying">
        <Composition
          id="WhatPeopleSay30"
          component={WhatPeopleSay30}
          durationInFrames={WPS_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Jack-Jill-2026-04-18">
        <Composition
          id="JackJillDedication25"
          component={JackJillDedication25}
          durationInFrames={JJ_DEDICATION_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JackJillNextGen15"
          component={JackJillNextGen15}
          durationInFrames={JJ_NEXT_GEN_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JackJillTrainTogether22"
          component={JackJillTrainTogether22}
          durationInFrames={JJ_TRAIN_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
    </>
  );
};
