// Self-host the NORD display family for Remotion.
// Uses the FontFace API + delayRender so the renderer waits for the
// .otf files to decode before rendering frame 0. Barlow comes from
// @remotion/google-fonts — no extra setup.

import { staticFile, delayRender, continueRender } from "remotion";
import { loadFont as loadBarlow } from "@remotion/google-fonts/Barlow";

const NORD_CUTS: Array<{
  url: string;
  weight: string;
  style: "normal" | "italic";
}> = [
  { url: "/fonts/NORD-Book.otf", weight: "400", style: "normal" },
  { url: "/fonts/NORD-Bold.otf", weight: "700", style: "normal" },
  { url: "/fonts/NORD-BoldItalic.otf", weight: "700", style: "italic" },
  { url: "/fonts/NORD-Black.otf", weight: "900", style: "normal" },
  { url: "/fonts/NORD-BlackItalic.otf", weight: "900", style: "italic" },
];

let nordPromise: Promise<void> | null = null;

const ensureNord = (): Promise<void> => {
  if (nordPromise) return nordPromise;
  if (typeof document === "undefined") return Promise.resolve();

  nordPromise = Promise.all(
    NORD_CUTS.map(async (cut) => {
      const face = new FontFace(
        "Nord",
        `url(${staticFile(cut.url)}) format("opentype")`,
        { weight: cut.weight, style: cut.style },
      );
      const loaded = await face.load();
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(loaded);
    }),
  ).then(() => undefined);

  return nordPromise;
};

export const dbsFontFamilies = {
  Barlow: loadBarlow("normal", {
    weights: ["400", "500", "600", "700", "800"],
    subsets: ["latin"],
  }).fontFamily,
  BarlowItalic: loadBarlow("italic", {
    weights: ["400", "600", "700"],
    subsets: ["latin"],
  }).fontFamily,
};

export const useDBSFonts = (): void => {
  const handle = delayRender("Loading NORD fonts");
  ensureNord()
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("NORD font load failed", err);
      continueRender(handle);
    });
};
