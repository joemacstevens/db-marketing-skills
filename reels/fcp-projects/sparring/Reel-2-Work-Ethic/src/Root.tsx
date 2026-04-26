import React from "react";
import { Composition } from "remotion";
import { WorkEthic } from "./WorkEthic";

// Reel 2 — "Work Ethic" (30s)
// 1080x1920 vertical (9:16), 30fps
// Total: 30 seconds = 900 frames

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WorkEthic"
      component={WorkEthic}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
