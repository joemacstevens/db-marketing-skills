// Daily motivational quotes for the schedule story.
// Written in DB voice — action-oriented, no celebrity attributions.
// Think: what a coach writes on the gym board to get you moving.
// Selection is deterministic per date so the same day always shows the same quote.

export const QUOTES: string[] = [
  "Show up. Do the work.",
  "The only way out is through.",
  "Get 1% better today.",
  "Don't wish for it. Work for it.",
  "Make today count.",
  "The work is waiting.",
  "Earn your sweat.",
  "Do it tired. Do it anyway.",
  "No one's coming. Get yours.",
  "Start before you're ready.",
  "Push past the point you want to quit.",
  "Every rep matters.",
  "Be better than yesterday.",
  "Discipline beats motivation.",
  "The grind doesn't stop.",
  "One body. Train it.",
  "Silence the doubt. Do the work.",
  "Your goals don't care how you feel.",
  "Choose hard now. Choose easy later.",
  "Outwork yesterday.",
  "Show up when it's hard.",
  "Keep going.",
  "Take the first step.",
  "Small reps. Big results.",
  "No shortcuts. No excuses.",
  "The work is the reward.",
  "Sweat today. Shine tomorrow.",
  "Be the one who shows up.",
  "One more round.",
  "You're stronger than the excuse.",
];

// Simple deterministic hash from a date string ("YYYY-MM-DD" or ISO).
function hashDate(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function quoteForDate(dateStr: string): string {
  const key = dateStr.slice(0, 10); // date only, ignore time
  return QUOTES[hashDate(key) % QUOTES.length];
}
