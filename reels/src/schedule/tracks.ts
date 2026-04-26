// Daily music rotation for the schedule story.
// Same deterministic-per-date pattern as quotes — different beat each day,
// cycling across the whole pool so nothing gets stale.
//
// startSec: where to begin playback (skip intros, land on the strong bar).
// Tune by ear; tweaks here don't require re-copying the mp3.

export interface Track {
  file: string;      // path inside public/tracks/
  title: string;
  artist: string;
  startSec: number;  // playback entry point
}

export const TRACKS: Track[] = [
  { file: "tracks/track-01-dmx-get-at-me-dog.mp3", title: "Get At Me Dog",       artist: "DMX",                    startSec: 4 },
  { file: "tracks/track-02-jayz-hard-knock.mp3",   title: "Hard Knock Life",     artist: "Jay-Z",                  startSec: 8 },
  { file: "tracks/track-03-50cent-in-da-club.mp3", title: "In Da Club",          artist: "50 Cent",                startSec: 9 },
  { file: "tracks/track-04-busta-touch-it.mp3",    title: "Touch It",            artist: "Busta Rhymes",           startSec: 16 },
  { file: "tracks/track-05-kanye-black-skinhead.mp3", title: "Black Skinhead",   artist: "Kanye West",             startSec: 8 },
  { file: "tracks/track-06-kendrick-dna.mp3",      title: "DNA",                 artist: "Kendrick Lamar",         startSec: 12 },
  { file: "tracks/track-07-family-ties.mp3",       title: "Family Ties",         artist: "Kendrick & Baby Keem",   startSec: 15 },
  { file: "tracks/track-08-logic-keanu.mp3",       title: "Keanu Reeves",        artist: "Logic",                  startSec: 10 },
  { file: "tracks/track-09-jcole-january.mp3",     title: "January 28th",        artist: "J. Cole",                startSec: 30 },
  { file: "tracks/track-10-drake-bottom.mp3",      title: "Started From the Bottom", artist: "Drake",              startSec: 15 },
  { file: "tracks/track-11-till-i-collapse.mp3",   title: "Till I Collapse",     artist: "Eminem",                 startSec: 0 },
  { file: "tracks/track-12-i-against-all.mp3",     title: "I Against All",       artist: "Motivational Hip Hop",   startSec: 5 },
  { file: "tracks/track-13-cinematic-hiphop.mp3",  title: "Cinematic Hip Hop",   artist: "Library",                startSec: 5 },
];

function hashDate(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Offset the pool from the quote pool so the pairing shifts over time.
const POOL_OFFSET = 7;

export function trackForDate(dateStr: string): Track {
  const key = dateStr.slice(0, 10);
  return TRACKS[(hashDate(key) + POOL_OFFSET) % TRACKS.length];
}
