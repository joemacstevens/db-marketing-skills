// Beat sheet for the Pablo vs Dread countdown (Sunday Nov 8 post).
// Shared by the composition and scripts/synth-sfx.mjs, so picture and sound stay locked.
export const FPS = 30;
export const DURATION_SEC = 8;
export const DURATION = FPS * DURATION_SEC; // 240 frames: the countdown itself

// House slam end tag ("We are Different Breed" hook, then the DB logo), Joey 11/7.
// endtag-v2.mp4 is the approved standalone render: 0.7 s of black, then the 5.0 s tag.
export const TAG_START = DURATION; // tag frame 0 = 8.0 s
export const TAG_DUR = 150; // 5.0 s
export const TAG_FILE_LEAD = 21; // tag frame 0 sits at 0.7 s in endtag-v2.mp4
export const TAG_AUDIO_PRE = 17; // hook audio enters ~0.57 s before the cut (house: song fades in 0.55 s early)
export const TOTAL = DURATION + TAG_DUR; // 390 frames, 13.0 s

export const BEATS = {
  heart1: 0.35, // heartbeat thud + red flash
  heart2: 0.85,
  pablo: 1.4, // BOOM, Pablo slides in from the left, PABLO plate slams
  dread: 2.5, // BOOM, Dread slides in from the right, DREAD plate slams
  riserStart: 2.6,
  vs: 3.6, // biggest hit, VS slam, fire glow
  days: 4.7, // hit, "3 DAYS" slam, subline fades up
  who: 5.8, // "WHO'S FIGHTING WHO?" + "11.11" fade in, then hold
} as const;

export const f = (sec: number) => Math.round(sec * FPS);
