const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** "2026-04-21T16:00:00" → { dow: "TUE", label: "APR 21" } */
export function formatDateChip(iso: string): { dow: string; label: string } {
  const d = new Date(iso);
  return {
    dow: DOW[d.getDay()],
    label: `${MONTH[d.getMonth()]} ${d.getDate()}`,
  };
}

/** "2026-04-21T16:00:00" → "4:00 PM" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h}${mm} ${suffix}`;
}

/** Derive the schedule's date from the first iso, or fall back to today */
export function scheduleDateFromProps(
  schedule: Array<{ iso: string }>
): { dow: string; label: string } {
  if (schedule.length > 0) return formatDateChip(schedule[0].iso);
  return formatDateChip(new Date().toISOString());
}
