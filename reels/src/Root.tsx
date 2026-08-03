import React from "react";
import { Composition, Folder, Still } from "remotion";
import { CampStoryApril14, CAMP_STORY_DURATION } from "./CampStoryApril14";
import {
  CoreControlSaturdayApr16,
  CORE_CONTROL_DURATION,
} from "./CoreControlSaturdayApr16";
import {
  CoreControlMJTribute,
  MJ_TRIBUTE_DURATION,
} from "./CoreControlMJTribute";
import { ColiseumPhase01, COLISEUM_PHASE_01_DURATION } from "./ColiseumPhase01";
import { ColiseumPhase02, COLISEUM_PHASE_02_DURATION } from "./ColiseumPhase02";
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
import { StrengthCondDanny30, DANNY_SC_DURATION } from "./StrengthCondDanny30";
import { BodyShapingDanny, BODY_SHAPING_DURATION } from "./BodyShapingDanny";
import { JustWork15, JUST_WORK_DURATION } from "./JustWork15";
import { JustWork15Vol2, JUST_WORK_VOL2_DURATION } from "./JustWork15Vol2";
import { FullBodyIgniter20, FBI_DURATION } from "./FullBodyIgniter20";
import { WhatPeopleSay30, WPS_DURATION } from "./WhatPeopleSay30";
import { VeronicaTestimonial, VERONICA_DURATION } from "./VeronicaTestimonial";
import { ScheduleReel, SCHEDULE_REEL_DURATION } from "./ScheduleReel";
import { DEFAULT_SCHEDULE_PROPS } from "./schedule/defaultProps";
import { JackJillNextGen15, JJ_NEXT_GEN_DURATION } from "./JackJillNextGen15";
import {
  JackJillDedication25,
  JJ_DEDICATION_DURATION,
} from "./JackJillDedication25";
import {
  JackJillTrainTogether22,
  JJ_TRAIN_DURATION,
} from "./JackJillTrainTogether22";
import {
  TestimonialApr23,
  TESTIMONIAL_APR23_DURATION,
} from "./TestimonialApr23";
import {
  TestimonialApr26,
  TESTIMONIAL_APR26_DURATION,
} from "./TestimonialApr26";
import { JustWorkApr26, JUST_WORK_APR26_DURATION } from "./JustWorkApr26";
import {
  JustWorkApr26Vol2,
  JUST_WORK_APR26_VOL2_DURATION,
} from "./JustWorkApr26Vol2";
import { FitForMayReel, FFM_DURATION } from "./FitForMayReel";
import { Jab101, JAB_101_DURATION } from "./Jab101";
import { KidsBoxing5, KIDS_BOXING_5_DURATION } from "./KidsBoxing5";
import { FitForMayV3, FIT_FOR_MAY_V3_DURATION } from "./FitForMayV3";
import {
  FitForMayBeachStory,
  FFM_BEACH_STORY_DURATION,
} from "./FitForMayBeachStory";
import { FitForMay13Days, FFM_13_DAYS_DURATION } from "./FitForMay13Days";
import {
  FitForMay13DaysCover,
  FFM_13_DAYS_COVER_DURATION,
} from "./FitForMay13DaysCover";
import {
  AscentJuneChallenge,
  ASCENT_JUNE_DURATION,
} from "./AscentJuneChallenge";
import { AscentFinalPush, ASCENT_PUSH_DURATION } from "./AscentFinalPush";
import { KettlebellCarry, KETTLEBELL_CARRY_DURATION } from "./KettlebellCarry";
import {
  MomentsLikeThese,
  MOMENTS_LIKE_THESE_DURATION,
} from "./MomentsLikeThese";
import {
  MotherSonWorkout,
  MOTHER_SON_WORKOUT_DURATION,
} from "./MotherSonWorkout";
import { YouthSportsMay2, YOUTH_SPORTS_MAY2_DURATION } from "./YouthSportsMay2";
import { RiseLastDay, RISE_LAST_DAY_DURATION } from "./RiseLastDay";
import {
  VictoriaCrownJuly,
  VICTORIA_CROWN_DURATION,
} from "./VictoriaCrownJuly";
import { RunClub, RUN_CLUB_DURATION } from "./run-club/RunClub";
import { FritzCrownAug, FRITZ_CROWN_DURATION } from "./FritzCrownAug";
import { UbeChallenge, UBE_CHALLENGE_DURATION } from "./UbeChallenge";
import { UbeFirstBoard, UBE_FIRST_BOARD_DURATION } from "./UbeFirstBoard";
import {
  ItsJustWorkMonday,
  ITS_JUST_WORK_MONDAY_DURATION,
} from "./celebrate/ItsJustWorkMonday";
import {
  YasmineAuthorReel,
  YASMINE_AUTHOR_DURATION,
} from "./celebrate/YasmineAuthorReel";
import {
  JulioAscentReel,
  JULIO_ASCENT_DURATION,
} from "./celebrate/JulioAscentReel";
import { CampBuildReel, CAMP_BUILD_DURATION } from "./celebrate/CampBuildReel";
import {
  JustWorkAdultReel,
  JUSTWORK_ADULT_DURATION,
} from "./celebrate/JustWorkAdultReel";
import { ArnoldReel, ARNOLD_DURATION } from "./celebrate/ArnoldReel";
import { BOBEndCard, BOB_ENDCARD_DURATION } from "./celebrate/BOBEndCard";
import {
  KettlebellChallengeReel,
  KB_CHALLENGE_DURATION,
} from "./celebrate/KettlebellChallengeReel";
import {
  KettlebellFinalCall,
  KB_FINAL_DURATION,
} from "./celebrate/KettlebellFinalCall";
import {
  KettlebellOneDayLeft,
  KB_ONEDAY_DURATION,
} from "./celebrate/KettlebellOneDayLeft";
import {
  KettlebellChampions,
  KB_CHAMPS_DURATION,
} from "./celebrate/KettlebellChampions";
import { CampSimonSays, CAMP_SIMON_DURATION } from "./celebrate/CampSimonSays";
import {
  PersonalTrainingJuly29,
  PT_JULY29_DURATION,
} from "./celebrate/PersonalTrainingJuly29";
import { StacyPTReel, STACY_PT_DURATION } from "./celebrate/StacyPTReel";
import { ItsJustWorkQuote, IJW_QUOTE_DURATION } from "./celebrate/ItsJustWorkQuote";
import {
  FamilyAffairCouples,
  FamilyAffairBrothers,
  FAMILY_AFFAIR_COUPLES_DURATION,
  FAMILY_AFFAIR_BROTHERS_DURATION,
} from "./celebrate/FamilyAffair";
import { TransitionShowcase, TRANSITION_SHOWCASE_DURATION } from "./celebrate/TransitionShowcase";
import { YouthInvest, YOUTH_INVEST_DURATION } from "./YouthInvest";
import { RiseCarousel, CAROUSEL_W, CAROUSEL_H } from "./RiseCarousel";
import { TrxStrength15, TRX_STRENGTH_DURATION } from "./TrxStrength15";
import { ThreeMoves20, THREE_MOVES_DURATION } from "./ThreeMoves20";
import { TuesdayAtDB16, TUESDAY_DB_DURATION } from "./TuesdayAtDB16";
import { JustWorkMay11, JUST_WORK_MAY11_DURATION } from "./JustWorkMay11";
import { JustWorkMay26, JUST_WORK_MAY26_DURATION } from "./JustWorkMay26";
import { JustWorkMay27, JUST_WORK_MAY27_DURATION } from "./JustWorkMay27";
import {
  FullBodyIgniterMay12,
  FBI_MAY12_DURATION,
} from "./FullBodyIgniterMay12";
import {
  YouthTrainingMay9,
  YOUTH_TRAINING_MAY9_DURATION,
} from "./YouthTrainingMay9";
import { ComeAsYouAreMay6, CAYA_MAY6_DURATION } from "./ComeAsYouAreMay6";
import { YouthCommercial, YOUTH_COMMERCIAL_DURATION } from "./YouthCommercial";
import {
  HydrationSlide01,
  HydrationSlide02,
  HydrationSlide03,
  HydrationSlide04,
  HydrationSlide05,
  HydrationSlide06,
  HydrationSlide07,
  SLIDE_W,
  SLIDE_H,
  SLIDE_DURATION,
} from "./HydrationCarousel";
import {
  BecauseOfBoxingBrian,
  BecauseOfBoxingDon,
  BecauseOfBoxingJulio,
  BecauseOfBoxingRod,
  BecauseOfBoxingJonathan,
  BecauseOfBoxingAdel,
  BecauseOfBoxingElaine,
  BecauseOfBoxingCyan,
  BRIAN_BECAUSE_OF_BOXING_DURATION,
  DON_BECAUSE_OF_BOXING_DURATION,
  JULIO_BECAUSE_OF_BOXING_DURATION,
  ROD_BECAUSE_OF_BOXING_DURATION,
  JONATHAN_BECAUSE_OF_BOXING_DURATION,
  ADEL_BECAUSE_OF_BOXING_DURATION,
  ELAINE_BECAUSE_OF_BOXING_DURATION,
  CYAN_BECAUSE_OF_BOXING_DURATION,
} from "./BecauseOfBoxing";
import {
  BecauseOfBoxingJames,
  BecauseOfBoxingJamesSocial,
  JAMES_FULL_DURATION,
  JAMES_SOCIAL_DURATION,
} from "./BecauseOfBoxingJames";
import {
  BecauseOfBoxingPoster,
  BecauseOfBoxingTestimonial,
  GABRIEL_TESTIMONIAL,
  GIL_TESTIMONIAL,
  testimonialDuration,
} from "./BecauseOfBoxingTestimonial";
import {
  BecauseOfBoxingCompilation,
  BecauseOfBoxingCompilationLyrics,
  BECAUSE_OF_BOXING_COMPILATION_DURATION,
} from "./BecauseOfBoxingCompilation";
import {
  BecauseOfBoxingCompilation2,
  BECAUSE_OF_BOXING_COMPILATION_2_DURATION,
} from "./BecauseOfBoxingCompilation2";
import {
  RingsideRiddle,
  RIDDLE_01,
  RINGSIDE_RIDDLE_DURATION,
} from "./celebrate/RingsideRiddle";
import {
  RingsideRiddleAnswer,
  RIDDLE_ANSWER_02,
  RIDDLE_ANSWER_02_DURATION,
} from "./celebrate/RingsideRiddleAnswer";
import {
  CoachsCorner,
  CoachsCornerPoster,
  PABLO_EP01_INTRO,
  PABLO_EP02_BASICS,
  PABLO_EP03_BALANCE,
  PABLO_EP04_JAB,
  PABLO_FOUNDATION,
  coachsCornerDuration,
} from "./CoachsCorner";
import {
  BecauseOfBoxingWomen,
  BECAUSE_OF_BOXING_WOMEN_DURATION,
} from "./BecauseOfBoxingWomen";
import {
  CampLifeFullBreadth,
  CAMP_LIFE_FB_DURATION,
} from "./CampLifeFullBreadth";
import { CampLifeMarchCut, CAMP_LIFE_MARCH_DURATION } from "./CampLifeMarchCut";
import { CampLifeSongCut, CAMP_LIFE_SONG_DURATION } from "./CampLifeSongCut";
import { ItsJustWork, ITS_JUST_WORK_DURATION } from "./ItsJustWork";
import { BBQCookoutReel, BBQ_COOKOUT_DURATION } from "./BBQCookoutReel";
import { REEL_WIDTH, REEL_HEIGHT, FPS } from "./components/BrandStyles";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="BBQ-Cookout-2026">
        <Composition
          id="BBQCookoutReel"
          component={BBQCookoutReel}
          durationInFrames={BBQ_COOKOUT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Because-of-Boxing">
        <Composition
          id="RingsideRiddle01"
          component={RingsideRiddle}
          defaultProps={{ config: RIDDLE_01 }}
          durationInFrames={RINGSIDE_RIDDLE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="RingsideRiddleAnswer02"
          component={RingsideRiddleAnswer}
          defaultProps={{ config: RIDDLE_ANSWER_02 }}
          durationInFrames={RIDDLE_ANSWER_02_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingCompilation"
          component={BecauseOfBoxingCompilation}
          durationInFrames={BECAUSE_OF_BOXING_COMPILATION_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingCompilationLyrics"
          component={BecauseOfBoxingCompilationLyrics}
          durationInFrames={BECAUSE_OF_BOXING_COMPILATION_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingCompilation2"
          component={BecauseOfBoxingCompilation2}
          durationInFrames={BECAUSE_OF_BOXING_COMPILATION_2_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingWomen"
          component={BecauseOfBoxingWomen}
          durationInFrames={BECAUSE_OF_BOXING_WOMEN_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingDon"
          component={BecauseOfBoxingDon}
          durationInFrames={DON_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingBrian"
          component={BecauseOfBoxingBrian}
          durationInFrames={BRIAN_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingJulio"
          component={BecauseOfBoxingJulio}
          durationInFrames={JULIO_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingRod"
          component={BecauseOfBoxingRod}
          durationInFrames={ROD_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingJonathan"
          component={BecauseOfBoxingJonathan}
          durationInFrames={JONATHAN_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingAdel"
          component={BecauseOfBoxingAdel}
          durationInFrames={ADEL_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingElaine"
          component={BecauseOfBoxingElaine}
          durationInFrames={ELAINE_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingCyan"
          component={BecauseOfBoxingCyan}
          durationInFrames={CYAN_BECAUSE_OF_BOXING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingJames"
          component={BecauseOfBoxingJames}
          durationInFrames={JAMES_FULL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingJamesSocial"
          component={BecauseOfBoxingJamesSocial}
          durationInFrames={JAMES_SOCIAL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingGil"
          component={BecauseOfBoxingTestimonial}
          defaultProps={{ config: GIL_TESTIMONIAL }}
          durationInFrames={testimonialDuration(GIL_TESTIMONIAL)}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingGabriel"
          component={BecauseOfBoxingTestimonial}
          defaultProps={{ config: GABRIEL_TESTIMONIAL }}
          durationInFrames={testimonialDuration(GABRIEL_TESTIMONIAL)}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Still
          id="BecauseOfBoxingGabrielPoster"
          component={BecauseOfBoxingPoster}
          defaultProps={{ config: GABRIEL_TESTIMONIAL }}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingTestimonialRender"
          component={BecauseOfBoxingTestimonial}
          defaultProps={{ config: GIL_TESTIMONIAL }}
          durationInFrames={3600}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Still
          id="BecauseOfBoxingGilPoster"
          component={BecauseOfBoxingPoster}
          defaultProps={{ config: GIL_TESTIMONIAL }}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BecauseOfBoxingTestimonialPosterFrame"
          component={BecauseOfBoxingPoster}
          defaultProps={{ config: GIL_TESTIMONIAL }}
          durationInFrames={3600}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Coachs-Corner">
        <Composition
          id="CoachsCornerPabloFoundation"
          component={CoachsCorner}
          defaultProps={{ config: PABLO_FOUNDATION }}
          durationInFrames={coachsCornerDuration(PABLO_FOUNDATION)}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Still
          id="CoachsCornerPabloFoundationPoster"
          component={CoachsCornerPoster}
          defaultProps={{ config: PABLO_FOUNDATION }}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        {[PABLO_EP01_INTRO, PABLO_EP02_BASICS, PABLO_EP03_BALANCE, PABLO_EP04_JAB].map(
          (episode, index) => {
            const id = `CoachsCornerPabloEp${String(index + 1).padStart(2, "0")}`;
            return (
              <React.Fragment key={episode.id}>
                <Composition
                  id={id}
                  component={CoachsCorner}
                  defaultProps={{ config: episode }}
                  durationInFrames={coachsCornerDuration(episode)}
                  fps={FPS}
                  width={REEL_WIDTH}
                  height={REEL_HEIGHT}
                />
                <Still
                  id={`${id}Poster`}
                  component={CoachsCornerPoster}
                  defaultProps={{ config: episode }}
                  width={REEL_WIDTH}
                  height={REEL_HEIGHT}
                />
              </React.Fragment>
            );
          },
        )}
      </Folder>
      <Folder name="RISE-Youth">
        <Composition
          id="RiseLastDay"
          component={RiseLastDay}
          durationInFrames={RISE_LAST_DAY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="YouthInvest"
          component={YouthInvest}
          durationInFrames={YOUTH_INVEST_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="RiseCarousel"
          component={RiseCarousel}
          durationInFrames={60}
          fps={FPS}
          width={CAROUSEL_W}
          height={CAROUSEL_H}
          defaultProps={{ slide: 0 }}
        />
      </Folder>
      <Folder name="Its-Just-Work">
        <Composition
          id="ItsJustWork"
          component={ItsJustWork}
          durationInFrames={ITS_JUST_WORK_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="August-2026">
        <Composition
          id="RunClubAug"
          component={RunClub}
          durationInFrames={RUN_CLUB_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FritzCrownAug"
          component={FritzCrownAug}
          durationInFrames={FRITZ_CROWN_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="UbeChallengeAug"
          component={UbeChallenge}
          durationInFrames={UBE_CHALLENGE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="UbeFirstBoard"
          component={UbeFirstBoard}
          durationInFrames={UBE_FIRST_BOARD_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="ItsJustWorkMonday"
          component={ItsJustWorkMonday}
          durationInFrames={ITS_JUST_WORK_MONDAY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="July-2026">
        <Composition
          id="VictoriaCrownJuly"
          component={VictoriaCrownJuly}
          durationInFrames={VICTORIA_CROWN_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Celebrate">
        <Composition
          id="BOBEndCard"
          component={BOBEndCard}
          durationInFrames={BOB_ENDCARD_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="YasmineAuthorReel"
          component={YasmineAuthorReel}
          durationInFrames={YASMINE_AUTHOR_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JulioAscentReel"
          component={JulioAscentReel}
          durationInFrames={JULIO_ASCENT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="CampBuildReel"
          component={CampBuildReel}
          durationInFrames={CAMP_BUILD_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JustWorkAdultReel"
          component={JustWorkAdultReel}
          durationInFrames={JUSTWORK_ADULT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="ArnoldReel"
          component={ArnoldReel}
          durationInFrames={ARNOLD_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="KettlebellChallengeReel"
          component={KettlebellChallengeReel}
          durationInFrames={KB_CHALLENGE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="KettlebellFinalCall"
          component={KettlebellFinalCall}
          durationInFrames={KB_FINAL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="KettlebellChampions"
          component={KettlebellChampions}
          durationInFrames={KB_CHAMPS_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="KettlebellOneDayLeft"
          component={KettlebellOneDayLeft}
          durationInFrames={KB_ONEDAY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="CampSimonSays"
          component={CampSimonSays}
          durationInFrames={CAMP_SIMON_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="PersonalTrainingJuly29"
          component={PersonalTrainingJuly29}
          durationInFrames={PT_JULY29_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="BodyShapingDanny"
          component={BodyShapingDanny}
          durationInFrames={BODY_SHAPING_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="StacyPTReel"
          component={StacyPTReel}
          durationInFrames={STACY_PT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="ItsJustWorkQuote"
          component={ItsJustWorkQuote}
          durationInFrames={IJW_QUOTE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Family-Affair">
        <Composition
          id="FamilyAffairCouples"
          component={FamilyAffairCouples}
          durationInFrames={FAMILY_AFFAIR_COUPLES_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FamilyAffairBrothers"
          component={FamilyAffairBrothers}
          durationInFrames={FAMILY_AFFAIR_BROTHERS_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="TransitionShowcase"
          component={TransitionShowcase}
          durationInFrames={TRANSITION_SHOWCASE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="July-2026">
        <Composition
          id="KettlebellCarry"
          component={KettlebellCarry}
          durationInFrames={KETTLEBELL_CARRY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="June-2026">
        <Composition
          id="AscentJuneChallenge"
          component={AscentJuneChallenge}
          durationInFrames={ASCENT_JUNE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="AscentFinalPush"
          component={AscentFinalPush}
          durationInFrames={ASCENT_PUSH_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="TrxStrength15"
          component={TrxStrength15}
          durationInFrames={TRX_STRENGTH_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="ThreeMoves20"
          component={ThreeMoves20}
          durationInFrames={THREE_MOVES_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="TuesdayAtDB16"
          component={TuesdayAtDB16}
          durationInFrames={TUESDAY_DB_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Educational">
        <Composition
          id="YouthSportsMay2"
          component={YouthSportsMay2}
          durationInFrames={YOUTH_SPORTS_MAY2_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="KidsBoxing5"
          component={KidsBoxing5}
          durationInFrames={KIDS_BOXING_5_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="Jab101"
          component={Jab101}
          durationInFrames={JAB_101_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Summer-Camp-2026">
        <Composition
          id="CampLifeFullBreadth"
          component={CampLifeFullBreadth}
          durationInFrames={CAMP_LIFE_FB_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="CampLifeMarchCut"
          component={CampLifeMarchCut}
          durationInFrames={CAMP_LIFE_MARCH_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="CampLifeSongCut"
          component={CampLifeSongCut}
          durationInFrames={CAMP_LIFE_SONG_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
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
        <Composition
          id="CoreControlMJTribute"
          component={CoreControlMJTribute}
          durationInFrames={MJ_TRIBUTE_DURATION}
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
        <Composition
          id="ColiseumPhase02"
          component={ColiseumPhase02}
          durationInFrames={COLISEUM_PHASE_02_DURATION}
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
        <Composition
          id="JustWorkApr26"
          component={JustWorkApr26}
          durationInFrames={JUST_WORK_APR26_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JustWorkApr26Vol2"
          component={JustWorkApr26Vol2}
          durationInFrames={JUST_WORK_APR26_VOL2_DURATION}
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
        <Composition
          id="VeronicaTestimonial"
          component={VeronicaTestimonial}
          durationInFrames={VERONICA_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Testimonial-Apr23">
        <Composition
          id="TestimonialApr23"
          component={TestimonialApr23}
          durationInFrames={TESTIMONIAL_APR23_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Testimonial-Apr26">
        <Composition
          id="TestimonialApr26"
          component={TestimonialApr26}
          durationInFrames={TESTIMONIAL_APR26_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Fit-For-May-2026">
        <Composition
          id="FitForMayV3"
          component={FitForMayV3}
          durationInFrames={FIT_FOR_MAY_V3_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FitForMayReel"
          component={FitForMayReel}
          durationInFrames={FFM_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FitForMayBeachStory"
          component={FitForMayBeachStory}
          durationInFrames={FFM_BEACH_STORY_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FitForMay13Days"
          component={FitForMay13Days}
          durationInFrames={FFM_13_DAYS_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FitForMay13DaysCover"
          component={FitForMay13DaysCover}
          durationInFrames={FFM_13_DAYS_COVER_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Moments-Like-These">
        <Composition
          id="MomentsLikeThese"
          component={MomentsLikeThese}
          durationInFrames={MOMENTS_LIKE_THESE_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="Mother-Son-Workout">
        <Composition
          id="MotherSonWorkout"
          component={MotherSonWorkout}
          durationInFrames={MOTHER_SON_WORKOUT_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="5-13-Bundle">
        <Composition
          id="JustWorkMay11"
          component={JustWorkMay11}
          durationInFrames={JUST_WORK_MAY11_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JustWorkMay26"
          component={JustWorkMay26}
          durationInFrames={JUST_WORK_MAY26_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="JustWorkMay27"
          component={JustWorkMay27}
          durationInFrames={JUST_WORK_MAY27_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="FullBodyIgniterMay12"
          component={FullBodyIgniterMay12}
          durationInFrames={FBI_MAY12_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="YouthTrainingMay9"
          component={YouthTrainingMay9}
          durationInFrames={YOUTH_TRAINING_MAY9_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="ComeAsYouAreMay6"
          component={ComeAsYouAreMay6}
          durationInFrames={CAYA_MAY6_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
        <Composition
          id="YouthCommercial"
          component={YouthCommercial}
          durationInFrames={YOUTH_COMMERCIAL_DURATION}
          fps={FPS}
          width={REEL_WIDTH}
          height={REEL_HEIGHT}
        />
      </Folder>
      <Folder name="DB-Rules-Carousels">
        <Composition
          id="HydrationSlide01"
          component={HydrationSlide01}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
        />
        <Composition
          id="HydrationSlide02"
          component={HydrationSlide02}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
        />
        <Composition
          id="HydrationSlide03"
          component={HydrationSlide03}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
        />
        <Composition
          id="HydrationSlide04"
          component={HydrationSlide04}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
        />
        <Composition
          id="HydrationSlide05"
          component={HydrationSlide05}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
        />
        <Composition
          id="HydrationSlide06"
          component={HydrationSlide06}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
        />
        <Composition
          id="HydrationSlide07"
          component={HydrationSlide07}
          durationInFrames={SLIDE_DURATION}
          fps={FPS}
          width={SLIDE_W}
          height={SLIDE_H}
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
