// Different Breed — Stamp/Poster design system, ported for Remotion.
// Mirrors design-system/tokens/colors_and_type.css. Web is the source of truth;
// this file restates the relevant tokens as TS constants for video.

import {
  REEL_WIDTH as LEGACY_REEL_WIDTH,
  REEL_HEIGHT as LEGACY_REEL_HEIGHT,
  FPS as LEGACY_FPS,
  SAFE as LEGACY_SAFE,
} from "../components/BrandStyles";

export const DBS_COLORS = {
  red50: "#FFF1F1",
  red100: "#FFD9D9",
  red500: "#E81D1D",
  red600: "#C91414",
  red700: "#A50F0F",
  red900: "#5C0707",
  black: "#0A0A0A",
  ink: "#141414",
  ink2: "#1F1F1F",
  ink3: "#2A2A2A",
  bone: "#F6F2EC",
  paper: "#FFFFFF",
  fog: "#E7E2DA",
  steel: "#B8B2A8",
  graphite: "#6E6A63",
  coal: "#3A3936",
  gold: "#E5B53D",
} as const;

export const DBS_FONTS = {
  display:
    "'Nord', 'Oswald', 'Anton', 'Impact', 'Arial Narrow', sans-serif",
  headline:
    "'Nord', 'Oswald', 'Barlow Condensed', 'Arial Narrow', sans-serif",
  body: "'Barlow', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  utility: "'Oswald', 'Nord', 'Barlow Condensed', sans-serif",
} as const;

export const DBS_SHADOW_PRESS = "4px 4px 0 #141414";
export const DBS_SHADOW_PRESS_RED = "4px 4px 0 #E81D1D";

export const DBS_TRACKING = {
  tight: "-0.01em",
  normal: "0",
  wide: "0.04em",
  wider: "0.08em",
  widest: "0.16em",
} as const;

// Re-export reel dimensions from the legacy file so we don't duplicate.
export const REEL_WIDTH = LEGACY_REEL_WIDTH;
export const REEL_HEIGHT = LEGACY_REEL_HEIGHT;
export const FPS = LEGACY_FPS;
export const SAFE = LEGACY_SAFE;
