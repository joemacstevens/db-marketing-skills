import React from "react";
import { Composition } from "remotion";
import { TheTeam } from "./TheTeam";

// Reel 1 — "The Team" (30s)
// 1080x1920 vertical (9:16), 30fps
// Total: 30 seconds = 900 frames

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TheTeam"
      component={TheTeam}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
