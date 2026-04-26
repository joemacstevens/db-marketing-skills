import { loadFont } from "@remotion/google-fonts/Oswald";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Load DB brand fonts
const { fontFamily: oswaldFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// DB Brand Colors
export const COLORS = {
  black: "#0E0E0E",
  charcoal: "#1C1C1C",
  red: "#C4161C",
  white: "#FFFFFF",
  gray: "#8E8E8E",
} as const;

// Font families
export const FONTS = {
  headline: oswaldFamily,
  body: interFamily,
} as const;

// Reel dimensions (9:16 vertical)
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
export const FPS = 30;
