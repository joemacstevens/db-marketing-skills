// Standalone entry for the Pablo vs Dread countdown, so it renders without
// depending on every comp in src/Root.tsx.
//   npx remotion render src/pablo-dread/index.ts PabloDreadCountdown out/pablo-dread-countdown.mp4
//   npx remotion still  src/pablo-dread/index.ts PabloDreadCountdown out/pablo-dread-final.png --frame=239
import { registerRoot } from "remotion";
import { PabloDreadRoot } from "./Root";

registerRoot(PabloDreadRoot);
