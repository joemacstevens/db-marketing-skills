#!/usr/bin/env node
/**
 * Daily schedule story — end-to-end orchestrator.
 *
 *   1. Fetch today's schedule from MindBody
 *   2. Pick 4 fresh b-roll clips (deterministic per-date, avoids 7-day history)
 *   3. Render ScheduleReel via Remotion
 *   4. Publish to IG + FB Stories via Upload-Post
 *   5. Append a posted entry to content-calendar/calendar.json
 *
 * Flags:
 *   --date=YYYY-MM-DD   Override schedule date (default: today, ET)
 *   --dry-run           Do everything except publish
 *   --skip-pick         Re-use existing background clips in reels/public/
 *   --skip-render       Re-use an existing render at the expected path
 *
 * Every non-dry run records its outcome in cron/heartbeat.json (current state)
 * and cron/heartbeat.jsonl (history) under job "daily-schedule-story". Set
 * HEARTBEAT_PUSH=1 to also write both files to GitHub main via `gh api`, so the
 * cloud spot-check can see the result without this machine pushing a commit.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync, spawnSync } from "child_process";
import { UploadPost } from "upload-post/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REELS = resolve(ROOT, "reels");
const CAL = resolve(ROOT, "content-calendar", "calendar.json");

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, v] = a.slice(2).split("=");
      return [k, v ?? true];
    })
);

const DRY_RUN = !!args["dry-run"];
const SKIP_PICK = !!args["skip-pick"];
const SKIP_RENDER = !!args["skip-render"];

const HEARTBEAT_JOB = "daily-schedule-story";
const STARTED_AT = new Date();

// ─── Heartbeat ───
function recordHeartbeat(status, summary, { ref = null, error = null } = {}) {
  if (DRY_RUN) return;
  const finished = new Date();
  const host = process.env.HEARTBEAT_HOST || execFileSync("hostname").toString().trim();
  const event = {
    job: HEARTBEAT_JOB,
    host,
    started_at: STARTED_AT.toISOString(),
    finished_at: finished.toISOString(),
    status,
    duration_ms: finished - STARTED_AT,
    summary,
    ref,
    error,
  };
  const hbPath = resolve(ROOT, "cron", "heartbeat.json");
  const logPath = resolve(ROOT, "cron", "heartbeat.jsonl");
  try {
    const state = existsSync(hbPath) ? JSON.parse(readFileSync(hbPath, "utf8") || "{}") : {};
    const prev = state[HEARTBEAT_JOB] || {};
    state[HEARTBEAT_JOB] = {
      last_at: event.finished_at,
      status,
      last_summary: summary,
      last_ref: ref,
      last_error: error,
      last_success_at: status === "success" ? event.finished_at : prev.last_success_at ?? null,
      host,
    };
    writeFileSync(hbPath, JSON.stringify(state, null, 2) + "\n");
    const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
    writeFileSync(logPath, log + JSON.stringify(event) + "\n");
    if (process.env.HEARTBEAT_PUSH === "1") {
      for (const file of [hbPath, logPath]) pushToGitHub(file, `Heartbeat: ${HEARTBEAT_JOB} ${status}`);
    }
  } catch (e) {
    console.error("Heartbeat write failed:", e.message);
  }
}

function pushToGitHub(file, message) {
  const repoPath = file.slice(ROOT.length + 1);
  const repo = process.env.HEARTBEAT_REPO || "joemacstevens/db-marketing-skills";
  let sha = null;
  const cur = spawnSync("gh", ["api", `repos/${repo}/contents/${repoPath}?ref=main`, "--jq", ".sha"]);
  if (cur.status === 0) sha = cur.stdout.toString().trim() || null;
  const body = {
    message,
    branch: "main",
    content: readFileSync(file).toString("base64"),
    ...(sha ? { sha } : {}),
  };
  const res = spawnSync("gh", ["api", "-X", "PUT", `repos/${repo}/contents/${repoPath}`, "--input", "-"], {
    input: JSON.stringify(body),
  });
  if (res.status !== 0) console.error(`Heartbeat push failed for ${repoPath}:`, res.stderr.toString().trim());
}

function fail(step, err) {
  const msg = err?.message || String(err);
  console.error(`${step} failed:`, msg);
  recordHeartbeat("failure", `${DATE}: ${step} failed`, { error: msg.slice(0, 500) });
  process.exit(1);
}

const FB_PAGE_ID = "100873874674621"; // DB Elite Fitness & Sports FB page

function todayInET() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  return `${y}-${m}-${d}`;
}

const DATE = args.date || todayInET();
const DOW_LONG = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "long",
}).format(new Date(`${DATE}T12:00:00-04:00`));

console.log(`\n═══ DB Daily Schedule — ${DOW_LONG}, ${DATE} ${DRY_RUN ? "(DRY RUN)" : ""} ═══\n`);

// ─── Load secrets ───
function loadApiKey() {
  const envPath = "/Users/joestevens/.claude/secrets/.env.openclaw-secrets";
  const secrets = readFileSync(envPath, "utf8");
  const key = secrets.match(/UPLOAD_POST_API_KEY=(.*)/)?.[1]
    ?.trim()
    ?.replace(/^["']|["']$/g, "");
  if (!key) throw new Error("UPLOAD_POST_API_KEY missing in secrets");
  return key;
}

// ─── 1. Fetch schedule ───
console.log("[1/5] Fetching schedule from MindBody...");
let props;
try {
  const scheduleJson = execFileSync(
    "node",
    [resolve(__dirname, "fetch-mindbody-schedule.mjs"), DATE],
    { cwd: ROOT }
  ).toString();
  props = JSON.parse(scheduleJson);
} catch (err) {
  fail("MindBody fetch", err);
}
console.log(`      → ${props.schedule.length} classes`);

if (props.schedule.length === 0) {
  console.log("\nNo classes today — skipping render + publish. (Gym closed or API empty.)");
  recordHeartbeat("success", `${DATE}: 0 classes, nothing to post`);
  process.exit(0);
}

// Write props file for Remotion render
const propsDir = resolve(REELS, "src", "schedule");
const propsPath = resolve(propsDir, "daily-props.json");
writeFileSync(propsPath, JSON.stringify(props, null, 2));

// ─── 2. Pick b-roll ───
if (!SKIP_PICK) {
  console.log("\n[2/5] Picking fresh b-roll...");
  const pickRes = spawnSync(
    "node",
    [resolve(REELS, "src", "schedule", "pickBackgroundClips.mjs"), `--date=${DATE}`],
    { stdio: "inherit" }
  );
  if (pickRes.status !== 0) fail("B-roll picker", `exit ${pickRes.status}`);
} else {
  console.log("\n[2/5] Skipping picker (--skip-pick).");
}

// ─── 3. Render ───
const outDir = resolve(REELS, "out");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const renderOut = resolve(outDir, `schedule-${DATE}.mp4`);

if (!SKIP_RENDER) {
  console.log("\n[3/5] Rendering ScheduleReel...");
  const renderRes = spawnSync(
    "npx",
    [
      "remotion",
      "render",
      "src/index.ts",
      "ScheduleReel",
      renderOut,
      `--props=${propsPath}`,
    ],
    { cwd: REELS, stdio: "inherit" }
  );
  if (renderRes.status !== 0) fail("Render", `remotion exit ${renderRes.status}`);
} else {
  console.log("\n[3/5] Skipping render (--skip-render).");
}
console.log(`      → ${renderOut}`);

// ─── 4. Publish ───
const title = `Today at DB — ${DOW_LONG}`;

if (DRY_RUN) {
  console.log(`\n[4/5] DRY RUN — skipping publish. Would post: "${title}"`);
  process.exit(0);
}

console.log("\n[4/5] Publishing to IG + FB Stories via Upload-Post...");
const client = new UploadPost(loadApiKey());

let uploadResponse;
try {
  uploadResponse = await client.upload(renderOut, {
    user: "dbelitefitness",
    platforms: ["instagram", "facebook"],
    title,
    instagramMediaType: "STORIES",
    facebookMediaType: "STORIES",
    facebookPageId: FB_PAGE_ID,
  });

  // Poll if async
  if (uploadResponse?.request_id && !uploadResponse?.status) {
    console.log(`      Async upload ${uploadResponse.request_id} — polling...`);
    let attempts = 0;
    let status = uploadResponse;
    do {
      await new Promise((r) => setTimeout(r, 8000));
      status = await client.getStatus(uploadResponse.request_id);
      attempts++;
      console.log(`      poll ${attempts}: ${status.status}`);
    } while (
      status.status !== "completed" &&
      status.status !== "error" &&
      attempts < 40
    );
    uploadResponse = status;
  }
  console.log("      ✓ Published");
} catch (err) {
  fail("Publish", err);
}

// ─── 5. Log to calendar ───
console.log("\n[5/5] Logging to content calendar...");
const cal = JSON.parse(readFileSync(CAL, "utf8"));
const now = new Date().toISOString();

// Summary for caption (used in IG/FB caption field)
const summary = props.schedule
  .slice(0, 6)
  .map((s) => `• ${s.time} — ${s.class}${s.coach ? ` (${s.coach})` : ""}`)
  .join("\n");

const entry = {
  id: `${DATE}-schedule`,
  status: "posted",
  campaign: null,
  content_type: "schedule",
  post_date: DATE,
  post_time: null,
  platforms: ["instagram", "facebook"],
  ig_caption: `Today at DB — ${DOW_LONG}.\n\n${summary}\n\nBook via link in bio.`,
  fb_caption: `Today at DB — ${DOW_LONG}. ${props.schedule.length} classes on the board. Book via link in bio.`,
  hashtags: [],
  media_type: "story",
  media_paths: [renderOut],
  media_query: `ScheduleReel automated render — 4 b-roll clips from media library, date-seeded shuffle`,
  instagram_options: { media_type: "STORIES", first_comment: null },
  facebook_options: { media_type: "STORIES" },
  coach_tags: [],
  credit_videographer: false,
  notes: `Auto-posted by scripts/run-daily-schedule.mjs. ${props.schedule.length} classes. B-roll manifest: reels/src/schedule/background-manifest.json`,
  created_at: now,
  approved_at: now,
  posted_at: now,
  post_result: uploadResponse,
};

// Replace existing entry for this date if re-run; otherwise append
const existingIdx = cal.posts.findIndex((p) => p.id === entry.id);
if (existingIdx >= 0) cal.posts[existingIdx] = entry;
else cal.posts.push(entry);
cal.last_updated = now;
writeFileSync(CAL, JSON.stringify(cal, null, 2));

console.log(`      ✓ Calendar entry: ${entry.id}`);
console.log("\n═══ Done ═══\n");

const urls = (uploadResponse?.results || [])
  .map((r) => `  ${r.platform}: ${r.success ? "✓" : "✗"} ${r.post_url || r.error_message || ""}`)
  .join("\n");
if (urls) console.log(urls + "\n");

const results = Array.isArray(uploadResponse?.results) ? uploadResponse.results : [];
const failed = results.filter((r) => !r.success).map((r) => r.platform);
recordHeartbeat(
  failed.length ? "partial" : "success",
  `${DATE}: ${props.schedule.length} classes posted to Stories${failed.length ? `, failed on ${failed.join("+")}` : ""}`,
  { ref: results.find((r) => r.post_url)?.post_url || renderOut, error: failed.length ? `failed: ${failed.join(", ")}` : null }
);
