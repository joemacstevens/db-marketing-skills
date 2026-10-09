#!/usr/bin/env node
/**
 * Reel Queue preview — builds the phone-preview page of everything queued on
 * Upload-Post for @dbelitefitness. See skills/reel-schedule-preview.md.
 *
 * Source of truth is Upload-Post's listScheduled() (calendar.json keeps
 * status=scheduled after a post goes out, and PATCHed times only land in
 * Upload-Post). calendar.json is joined by job_id for the local media file,
 * captions, first comment and notes. Calendar is read from the MAIN checkout,
 * because worktree copies are stale.
 *
 *   node content-calendar/preview/build.mjs                  # build site/
 *   node content-calendar/preview/build.mjs --mark-published # after a successful Artifact publish
 *
 * Output (gitignored): content-calendar/preview/site/
 *   index.html          the page, data inlined
 *   reels/<job>.mp4     540x960 proxies (≤12 MB each)
 *   reels/<job>.jpg     poster frames
 *   fonts/, avatar.png  brand files
 *   publish-plan.json   { files: {path: path | null} } — incremental Artifact `files` map (root = site/)
 *
 * Proxies are cached in ~/.cache/db-reel-preview/ keyed by source path+mtime,
 * so a rebuild in a fresh worktree only transcodes new reels.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, copyFileSync, rmSync, readdirSync } from "fs";
import { execFileSync } from "child_process";
import { createRequire } from "module";
import { createHash } from "crypto";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(HERE, "site");
const CACHE = path.join(os.homedir(), ".cache", "db-reel-preview");
const PUBLISHED_STATE = path.join(CACHE, "published.json");
const MAX_PROXY_MB = 12;

const commonDir = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: HERE }).toString().trim();
const MAIN = path.dirname(commonDir);

if (process.argv.includes("--mark-published")) {
  const plan = JSON.parse(readFileSync(path.join(SITE, "publish-plan.json"), "utf8"));
  writeFileSync(PUBLISHED_STATE, JSON.stringify({ at: new Date().toISOString(), files: plan.current }, null, 2));
  console.log(`marked ${plan.current.length} files as published`);
  process.exit(0);
}

const require = createRequire(path.join(MAIN, "package.json"));
const { UploadPost } = await import(require.resolve("upload-post/index.js"));
const apiKey = readFileSync(path.join(os.homedir(), ".claude/secrets/.env.openclaw-secrets"), "utf8")
  .match(/UPLOAD_POST_API_KEY=(.*)/)?.[1]?.trim()?.replace(/^["']|["']$/g, "");
const client = new UploadPost(apiKey);

const cal = JSON.parse(readFileSync(path.join(MAIN, "content-calendar", "calendar.json"), "utf8"));
const byJob = new Map(cal.posts.filter((p) => p.post_result?.job_id).map((p) => [p.post_result.job_id, p]));

const sch = await client.listScheduled();
const jobs = (sch?.scheduled_posts || []).filter((j) => j.profile_username === "dbelitefitness" || !j.profile_username);
jobs.sort((a, b) => utc(a.scheduled_date) - utc(b.scheduled_date));

function utc(s) { return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(s) ? s : s + "Z"); }

rmSync(SITE, { recursive: true, force: true });
mkdirSync(path.join(SITE, "reels"), { recursive: true });
mkdirSync(path.join(SITE, "fonts"), { recursive: true });
mkdirSync(CACHE, { recursive: true });

const warnings = [];
const items = [];
for (const j of jobs) {
  const post = byJob.get(j.job_id);
  const when = utc(j.scheduled_date);
  const src = post?.media_paths?.[0];
  const isStory = (j.fields?.media_type || post?.instagram_options?.media_type || post?.media_type || "").toString().toUpperCase().includes("STOR");
  let video = null, poster = null, duration = null;

  if (!post) warnings.push(`job ${j.job_id} (${j.scheduled_date}) is on Upload-Post but not in calendar.json`);
  if (src && /\.(mp4|mov|m4v)$/i.test(src) && existsSync(src)) {
    const key = createHash("sha1").update(src + statSync(src).mtimeMs).digest("hex").slice(0, 12);
    const cMp4 = path.join(CACHE, `${key}.mp4`), cJpg = path.join(CACHE, `${key}.jpg`), cMeta = path.join(CACHE, `${key}.json`);
    if (!existsSync(cMp4) || !existsSync(cJpg) || !existsSync(cMeta)) {
      duration = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).toString().trim());
      const vk = Math.max(400, Math.min(1800, Math.floor((MAX_PROXY_MB * 8 * 1000) / duration) - 110));
      console.log(`  transcoding ${path.basename(src)} (${duration.toFixed(1)}s @ ${vk}k)`);
      execFileSync("ffmpeg", ["-nostdin", "-y", "-v", "error", "-i", src,
        "-vf", "scale=540:960:force_original_aspect_ratio=decrease,pad=540:960:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-b:v", `${vk}k`, "-maxrate", `${vk}k`, "-bufsize", `${vk * 2}k`,
        "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", cMp4]);
      // Opener rule: 1.5s of footage, then the title card — 0.8s lands on footage.
      execFileSync("ffmpeg", ["-nostdin", "-y", "-v", "error", "-ss", String(Math.min(0.8, duration / 2)), "-i", src,
        "-frames:v", "1", "-vf", "scale=540:-2", "-q:v", "4", cJpg]);
      writeFileSync(cMeta, JSON.stringify({ duration }));
    }
    duration = JSON.parse(readFileSync(cMeta, "utf8")).duration;
    copyFileSync(cMp4, path.join(SITE, "reels", `${j.job_id}.mp4`));
    copyFileSync(cJpg, path.join(SITE, "reels", `${j.job_id}.jpg`));
    video = `reels/${j.job_id}.mp4`;
    poster = `reels/${j.job_id}.jpg`;
  } else if (src && /\.(png|jpe?g)$/i.test(src) && existsSync(src)) {
    execFileSync("sips", ["-Z", "960", "-s", "format", "jpeg", src, "--out", path.join(SITE, "reels", `${j.job_id}.jpg`)], { stdio: "ignore" });
    poster = `reels/${j.job_id}.jpg`;
  } else if (j.thumbnail_url) {
    try {
      const r = await fetch(j.thumbnail_url);
      if (r.ok) { writeFileSync(path.join(SITE, "reels", `${j.job_id}.jpg`), Buffer.from(await r.arrayBuffer())); poster = `reels/${j.job_id}.jpg`; }
    } catch {}
    warnings.push(`job ${j.job_id}: local media missing (${src || "no calendar path"}), using Upload-Post thumbnail`);
  }

  const igCaption = j.platform_content?.instagram?.title || j.title || post?.ig_caption || "";
  items.push({
    job_id: j.job_id,
    calendar_id: post?.id || null,
    at: when.toISOString(),
    kind: isStory ? "Story" : (j.post_type === "video" ? "Reel" : j.post_type || "Post"),
    platforms: j.platforms || [],
    caption: igCaption,
    fb_caption: j.platform_content?.facebook?.title || post?.fb_caption || null,
    first_comment: post?.instagram_options?.first_comment || null,
    collaborators: [].concat(j.fields?.collaborators || post?.instagram_options?.collaborators || []).flatMap((c) => String(c).split(",")).map((c) => c.trim()).filter(Boolean),
    campaign: post?.campaign || null,
    file: src ? path.basename(src) : j.source_filename || null,
    duration,
    video,
    poster,
  });
}

// Calendar says scheduled-in-the-future but Upload-Post doesn't have it: drift worth flagging.
const now = Date.now();
const queued = new Set(jobs.map((j) => j.job_id));
for (const p of cal.posts) {
  if (p.status !== "scheduled" || !p.post_date) continue;
  const t = new Date(`${p.post_date}T${p.post_time || "12:00"}:00-04:00`).getTime();
  if (t > now && !queued.has(p.post_result?.job_id)) warnings.push(`calendar ${p.id} is status=scheduled for ${p.post_date} ${p.post_time} but NOT queued on Upload-Post`);
}

// Brand files.
for (const f of ["NORD-BlackItalic.otf", "NORD-Black.otf"]) copyFileSync(path.join(MAIN, "design-system", "fonts", f), path.join(SITE, "fonts", f));
execFileSync("sips", ["-Z", "96", path.join(MAIN, "design-system/assets/logos/DB-knockout-stamp-white.png"), "--out", path.join(SITE, "avatar.png")], { stdio: "ignore" });

const data = { synced_at: new Date().toISOString(), account: "dbelitefitness", items };
const html = readFileSync(path.join(HERE, "template.html"), "utf8")
  .replace("/*__DATA__*/null", JSON.stringify(data).replace(/</g, "\\u003c"));
writeFileSync(path.join(SITE, "index.html"), html);

// Publish plan (paths relative to site/). `files` is the incremental map for
// the Artifact publish: files the last publish didn't have, plus null for
// files it had that this build dropped (posted reels). `full` re-sends
// everything — use it if the artifact's file listing disagrees with this.
const list = (dir) => readdirSync(path.join(SITE, dir)).map((f) => `${dir}/${f}`);
const current = [...list("reels"), ...list("fonts"), "avatar.png"];
const prev = existsSync(PUBLISHED_STATE) ? JSON.parse(readFileSync(PUBLISHED_STATE, "utf8")).files || [] : [];
const files = {}, full = {};
for (const f of current) { full[f] = f; if (!prev.includes(f)) files[f] = f; }
for (const f of prev) if (!current.includes(f)) files[f] = null;
writeFileSync(path.join(SITE, "publish-plan.json"), JSON.stringify({ current, files, full }, null, 2));

console.log(`\n${items.length} queued post(s):`);
for (const it of items) {
  const et = new Date(it.at).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });
  console.log(`  ${et.padEnd(22)} ${it.kind.padEnd(6)} ${it.video ? "▶" : it.poster ? "▢" : "∅"}  ${it.caption.split("\n")[0].slice(0, 60)}`);
}
const removed = Object.values(files).filter((v) => v === null).length;
console.log(`\nsite: ${SITE}\npublish-plan: ${current.length} files live, ${Object.keys(files).length - removed} to upload, ${removed} to remove`);
if (warnings.length) console.log(`\nWARNINGS:\n  - ${warnings.join("\n  - ")}`);
