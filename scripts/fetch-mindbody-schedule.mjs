#!/usr/bin/env node
/**
 * Fetches today's (or a specified date's) class schedule from MindBody v6.
 *
 * Usage:
 *   node scripts/fetch-mindbody-schedule.mjs [YYYY-MM-DD] [output.json]
 *
 * Defaults: today (America/New_York) → stdout.
 *
 * Outputs (Remotion-props shape):
 * {
 *   schedule: [{ id, iso, time, class, coach, status }],
 *   scheduleDate: "2026-04-21T00:00:00.000Z",
 *   timezone: "America/New_York",
 *   maxItems: 12
 * }
 */

import { writeFileSync } from "fs";

const SITE_ID = "706438";
const API_KEY = "5f2a6fa56beb4023887d74a2e242d3e0"; // public MB v6 key, same as mini pipeline
const TIMEZONE = "America/New_York";
const BASE = "https://api.mindbodyonline.com/public/v6/class/classes";

function todayInET() {
  // Format YYYY-MM-DD in America/New_York regardless of host TZ
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  return `${y}-${m}-${d}`;
}

function formatTimeFromIso(iso) {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
  return `${h}${mm} ${suffix}`;
}

async function fetchSchedule(dateStr) {
  const url = new URL(BASE);
  url.searchParams.set("StartDateTime", `${dateStr}T00:00:00`);
  url.searchParams.set("EndDateTime", `${dateStr}T23:59:59`);
  url.searchParams.set("Limit", "100");

  const res = await fetch(url, {
    headers: {
      "Api-Key": API_KEY,
      SiteId: SITE_ID,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `MindBody API ${res.status}: ${await res.text().catch(() => "")}`
    );
  }
  const body = await res.json();
  return body.Classes || [];
}

function normalize(classes, dateStr) {
  const out = [];
  for (const c of classes) {
    if (c.IsCanceled) continue;
    const program = c.ClassDescription?.Program?.Name || "";
    if (/special event/i.test(program)) continue;

    const iso = c.StartDateTime;
    if (!iso || iso.includes("T00:00")) continue; // packages

    const name = c.ClassDescription?.Name || "Class";
    const coach = [c.Staff?.Name, c.Staff?.FirstName].filter(Boolean)[0] || "";

    out.push({
      id: `${dateStr}-${formatTimeFromIso(iso)}-${name}`.replace(/\s+/g, "-"),
      iso,
      time: formatTimeFromIso(iso),
      class: name,
      coach,
      status: "active",
    });
  }
  return out.sort((a, b) => (a.iso < b.iso ? -1 : 1));
}

async function main() {
  const args = process.argv.slice(2);
  const dateStr = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) || todayInET();
  const outPath = args.find((a) => !/^\d{4}-\d{2}-\d{2}$/.test(a)) || null;

  const raw = await fetchSchedule(dateStr);
  const schedule = normalize(raw, dateStr);

  const payload = {
    schedule,
    scheduleDate: new Date(`${dateStr}T00:00:00-04:00`).toISOString(),
    timezone: TIMEZONE,
    maxItems: 12,
  };

  const json = JSON.stringify(payload, null, 2);
  if (outPath) {
    writeFileSync(outPath, json);
    console.error(`Wrote ${schedule.length} classes → ${outPath}`);
  } else {
    process.stdout.write(json + "\n");
  }
}

main().catch((err) => {
  console.error("Fetch failed:", err.message);
  process.exit(1);
});
