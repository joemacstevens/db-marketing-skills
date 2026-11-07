// Standalone entry for the Pablo vs D.R.E.D. face-off teaser.
//   node scripts/pablo-dred-faceoff-sfx.mjs
//   npx remotion render src/pablo-dred-faceoff/index.ts PabloDredFaceOff out/pablo-dred-faceoff.mp4 --audio-codec=aac
//   then shift audio 42.5 ms earlier (Remotion AAC offset, see README in the render step)
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PabloDredFaceOff } from "./PabloDredFaceOff";
import { FPS, TOTAL } from "./timing";

const Root: React.FC = () =>
  React.createElement(Composition, {
    id: "PabloDredFaceOff",
    component: PabloDredFaceOff,
    durationInFrames: TOTAL,
    fps: FPS,
    width: 1080,
    height: 1920,
  });

registerRoot(Root);
