export const COLORS = {
  background: '#1a1a1a',
  red: '#E31937',
  white: '#FFFFFF',
  black: '#000000',
  overlayDark: 'rgba(0,0,0,0.5)',
};

export const FONTS = {
  oswald: "'Oswald', sans-serif",
};

export const CANVAS = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 900, // 30 seconds
};

// Segment timing (in frames at 30fps) — Downloads batch (30-second version)
// Intro hook:            0-3s   (90f)  IMG_4668 2-5s
// Agility Drills:        3-10s  (210f) IMG_4659 5-9s + IMG_4673 8-11s
// Circuit Training:      10-17s (210f) IMG_4670 3-7s  + IMG_4672 5-8s
// The Squad (4K):        17-24s (210f) IMG_4660 2-6s  + UUID 2-5s
// Flexibility & Strength:24-28s (120f) IMG_4674 5-8s + IMG_4675 2-3s
// Closing clip:          REMOVED
// End card:              28-30s  (60f)
export const SEGMENTS = {
  intro:       { from: 0,   durationInFrames: 90  },  // 0-3s
  agility:     { from: 90,  durationInFrames: 210 },  // 3-10s
  circuit:     { from: 300, durationInFrames: 210 },  // 10-17s
  squad:       { from: 510, durationInFrames: 210 },  // 17-24s
  flexibility: { from: 720, durationInFrames: 120 },  // 24-28s
  closing:     { from: 840, durationInFrames: 0   },  // REMOVED
  endcard:     { from: 840, durationInFrames: 60  },  // 28-30s
};

// Sub-segment durations for composite segments
export const SUB = {
  agility1: 120,  // IMG_4659: 5-9s  = 4s = 120f
  agility2:  90,  // IMG_4673: 8-11s = 3s = 90f
  circuit1: 120,  // IMG_4670: 3-7s  = 4s = 120f
  circuit2:  90,  // IMG_4672: 5-8s  = 3s = 90f
  squad1:   120,  // IMG_4660: 2-6s  = 4s = 120f
  squad2:    90,  // UUID:     2-5s  = 3s = 90f
  flex1:     90,  // IMG_4674: 5-8s  = 3s = 90f
  flex2:     30,  // IMG_4675: 2-3s  = 1s = 30f
};
