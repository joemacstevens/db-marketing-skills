/**
 * Default props for Studio preview — a realistic Tuesday schedule pulled
 * from brand-context/schedule.md. Matches the shape Noah's mini pipeline
 * writes to /tmp/schedule-props.json from MindBody.
 */

export type ScheduleEntry = {
  id: string;
  iso: string;
  class: string;
  coach: string;
  status: string;
};

export type ScheduleProps = {
  schedule: ScheduleEntry[];
  timezone: string;
  maxItems: number;
};

export const DEFAULT_SCHEDULE_PROPS: ScheduleProps = {
  timezone: "America/New_York",
  maxItems: 12,
  schedule: [
    {
      id: "2026-04-21-6-boxing",
      iso: "2026-04-21T06:00:00",
      class: "Boxing Basics",
      coach: "Coach Joe",
      status: "active",
    },
    {
      id: "2026-04-21-9-pilates",
      iso: "2026-04-21T09:00:00",
      class: "Core Control Pilates",
      coach: "Nessa",
      status: "active",
    },
    {
      id: "2026-04-21-12-sweet",
      iso: "2026-04-21T12:00:00",
      class: "The Sweet Science",
      coach: "Danny",
      status: "active",
    },
    {
      id: "2026-04-21-16-kids",
      iso: "2026-04-21T16:00:00",
      class: "Kids Boxing",
      coach: "Glenda · Joe · Ali",
      status: "active",
    },
    {
      id: "2026-04-21-18-sc",
      iso: "2026-04-21T18:00:00",
      class: "Strength & Conditioning",
      coach: "Coach Mike",
      status: "active",
    },
    {
      id: "2026-04-21-19-sweet",
      iso: "2026-04-21T19:00:00",
      class: "The Sweet Science",
      coach: "Joe Butta",
      status: "active",
    },
  ],
};
