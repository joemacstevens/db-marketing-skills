import React from "react";
import { Composition } from "remotion";
import { PabloDreadCountdown, PabloDreadProps } from "./PabloDreadCountdown";
import { TOTAL, FPS } from "./timing";

// Cutouts (background removed with `hyperframes remove-background`):
//   pablo.png: main-site coach-pablo-card.jpg (same shot as Drive "Coach Pictures/Coach Pablo")
//   dred.png:  Drive Different Breed/2026/gym_10_29_26/Portraits/gym_10_29_26_--13.jpg
//              (Media Day, @veteranwithacamera), backdrop remnant masked by hand
const defaultProps: PabloDreadProps = {
  pabloSrc: "pablo-dread-countdown/pablo.png",
  dreadSrc: "pablo-dread-countdown/dred.png",
  days: "3 DAYS",
  date: "11.11",
};

export const PabloDreadRoot: React.FC = () => (
  <Composition
    id="PabloDreadCountdown"
    component={PabloDreadCountdown}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={defaultProps}
  />
);
