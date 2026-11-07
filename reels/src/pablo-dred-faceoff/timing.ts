// Pablo vs D.R.E.D. face-off teaser: Matchup Day, Wed Nov 11.
// Shared by the composition and scripts/pablo-dred-faceoff-sfx.mjs so picture and sound stay locked.
export const FPS = 30;
export const BODY_SEC = 9;
export const BODY = FPS * BODY_SEC; // 270 frames

export const BEATS = {
  thump1: 0.45, // sub heartbeat + red flash, flash-frame of Pablo
  thump2: 1.0, //  sub heartbeat + red flash, flash-frame of D.R.E.D.
  pablo: 1.4, //   BOOM, Pablo slides in from the left
  dred: 2.6, //    BOOM, D.R.E.D. slides in from the right
  riserStart: 2.75,
  impact: 4.2, //  biggest hit: spark burst between the faces, MATCHUP DAY slams
  date: 5.3, //    hit: NOV 11 slams
  names: 6.0, //   names + top line in, then the suspense pulse
  pulseEnd: 8.3, // pulses stop; ~0.7 s of near-silence before the tag's "We are"
} as const;

// House slam end tag (approved render, 0.7 s black lead, then 5.0 s tag)
export const TAG_START = BODY;
export const TAG_DUR = 150;
export const TAG_FILE_LEAD = 21;
export const TAG_AUDIO_PRE = 17;
export const TOTAL = BODY + TAG_DUR; // 420 frames, 14 s

export const f = (sec: number) => Math.round(sec * FPS);
