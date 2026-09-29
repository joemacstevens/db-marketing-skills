#!/usr/bin/env node
/**
 * DB Content Calendar → Upload-Post Publisher
 *
 * Reads approved posts from calendar.json and publishes them via Upload-Post.
 * Posts can be immediate or scheduled for a future date/time.
 *
 * Usage:
 *   node publish.mjs                    # Publish all approved posts due today or earlier
 *   node publish.mjs --schedule         # Schedule approved posts at their post_date/post_time
 *   node publish.mjs --id 2026-04-15-001  # Publish a specific post by ID
 *   node publish.mjs --dry-run          # Show what would be posted without actually posting
 *   node publish.mjs --review           # Show all posts pending approval
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { UploadPost } from 'upload-post/index.js';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { amplifyPost } from './amplify.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CAL_PATH = resolve(__dirname, 'calendar.json');
const CAMPAIGN_TAGS_PATH = resolve(__dirname, 'campaign-tags.json');
const PROFILE = 'dbelitefitness';
const TIMEZONE = 'America/New_York';
// Facebook: multiple pages can be connected under this profile.
// Always target Different Breed Elite Fitness & Sports unless a post overrides it.
const DEFAULT_FB_PAGE_ID = '100873874674621';
// IG photo stories cap at ~5s and PNGs on the video path transcode to 0s,
// so still images for stories are wrapped into an MP4 of this length.
const DEFAULT_STORY_SECONDS = 12;
const STILL_IMAGE_RE = /\.(png|jpe?g|webp)$/i;

function wrapStillAsVideo(imagePath, seconds) {
  const out = resolve(dirname(imagePath), `${basename(imagePath, extname(imagePath))}-${seconds}s.mp4`);
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(imagePath).mtimeMs) {
    console.log(`  Using existing ${seconds}s story video: ${out}`);
    return out;
  }
  console.log(`  Wrapping still image into ${seconds}s story video...`);
  execFileSync('ffmpeg', [
    '-nostdin', '-loglevel', 'error', '-y',
    '-loop', '1', '-i', imagePath,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-t', String(seconds), '-r', '30',
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest',
    '-movflags', '+faststart', out,
  ], { stdio: ['ignore', 'inherit', 'inherit'] });
  return out;
}

// ── Load secrets ──
let apiKey;
try {
  const secrets = readFileSync('/Users/joestevens/.claude/secrets/.env.openclaw-secrets', 'utf8');
  apiKey = secrets.match(/UPLOAD_POST_API_KEY=(.*)/)?.[1]?.trim()?.replace(/^["']|["']$/g, '');
} catch {
  console.error('ERROR: Could not read secrets.env. Is the path correct?');
  process.exit(1);
}

if (!apiKey) {
  console.error('ERROR: UPLOAD_POST_API_KEY not found in secrets.env');
  process.exit(1);
}

const client = new UploadPost(apiKey);

// ── Parse args ──
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SCHEDULE_MODE = args.includes('--schedule');
const REVIEW_MODE = args.includes('--review');
const specificId = args.find(a => a !== '--dry-run' && a !== '--schedule' && a !== '--review' && !a.startsWith('--'))
  || (args.includes('--id') ? args[args.indexOf('--id') + 1] : null);

// ── Load calendar ──
function loadCalendar() {
  return JSON.parse(readFileSync(CAL_PATH, 'utf8'));
}

function saveCalendar(cal) {
  cal.last_updated = new Date().toISOString();
  writeFileSync(CAL_PATH, JSON.stringify(cal, null, 2));
}

// ── Campaign tag defaults ──
// Every post that belongs to a campaign in campaign-tags.json (matched by
// post.campaign, or an explicit instagram_options.tag_set) inherits that
// campaign's collaborators / user_tags / location. Post-level values win;
// user_tags are UNIONED so a post can add its own on top of the campaign set.
let CAMPAIGN_TAGS = {};
try {
  CAMPAIGN_TAGS = JSON.parse(readFileSync(CAMPAIGN_TAGS_PATH, 'utf8'));
} catch {
  CAMPAIGN_TAGS = {}; // optional file — absence just means no campaign defaults
}

function normHandles(v) {
  return (Array.isArray(v) ? v : String(v || '').split(','))
    .map(s => s.replace(/^@/, '').trim())
    .filter(Boolean);
}

// Resolve the effective platforms for a post: the post's own platforms UNIONed
// with any campaign default (so e.g. every because-of-boxing post also hits Threads).
function effectivePlatforms(post) {
  const out = Array.isArray(post.platforms) ? [...post.platforms] : [];
  const key = post.instagram_options?.tag_set || post.campaign;
  const def = key && CAMPAIGN_TAGS[key];
  if (def && Array.isArray(def.platforms)) {
    for (const p of def.platforms) if (!out.includes(p)) out.push(p);
  }
  return out;
}

// Resolve the effective instagram_options for a post (post values + campaign defaults).
function effectiveIg(post) {
  const ig = { ...(post.instagram_options || {}) };
  const key = post.instagram_options?.tag_set || post.campaign;
  const def = key && CAMPAIGN_TAGS[key];
  if (!def) return ig;

  // collaborators / location / first_comment: campaign default only fills a gap.
  if (ig.collaborators == null && def.collaborators) ig.collaborators = def.collaborators;
  if ((ig.location_id == null || ig.location_id === '') && def.location_id) ig.location_id = def.location_id;
  if (ig.first_comment == null && def.first_comment) ig.first_comment = def.first_comment;

  // user_tags: union post + campaign, deduped.
  if (def.user_tags) {
    ig.user_tags = [...new Set([...normHandles(ig.user_tags), ...normHandles(def.user_tags)])];
  }
  return ig;
}

// ── Review mode ──
function showReview(cal) {
  const ready = cal.posts.filter(p => p.status === 'ready');
  const approved = cal.posts.filter(p => p.status === 'approved');
  const scheduled = cal.posts.filter(p => p.status === 'scheduled');
  const posted = cal.posts.filter(p => p.status === 'posted');

  console.log('\n═══════════════════════════════════════════');
  console.log('  DB Content Calendar — Status');
  console.log('═══════════════════════════════════════════\n');

  if (ready.length > 0) {
    console.log(`📝 READY FOR APPROVAL (${ready.length})`);
    ready.forEach(p => {
      console.log(`  ${p.id}  ${p.post_date || '(no date)'} — ${p.content_type} (${p.media_type})`);
      console.log(`    IG: ${p.ig_caption.slice(0, 80)}...`);
      if (p.media_paths?.length) console.log(`    Media: ${p.media_paths[0]}`);
      console.log('');
    });
  }

  if (approved.length > 0) {
    console.log(`✅ APPROVED — Ready to Post (${approved.length})`);
    approved.forEach(p => {
      console.log(`  ${p.id}  ${p.post_date || '(no date)'} @ ${p.post_time || 'anytime'} — ${p.content_type}`);
    });
    console.log('');
  }

  if (scheduled.length > 0) {
    console.log(`📅 SCHEDULED (${scheduled.length})`);
    scheduled.forEach(p => {
      console.log(`  ${p.id}  ${p.post_date} @ ${p.post_time} — ${p.content_type}`);
    });
    console.log('');
  }

  console.log(`📊 Total: ${cal.posts.length} posts (${ready.length} ready, ${approved.length} approved, ${scheduled.length} scheduled, ${posted.length} posted)\n`);
}

// ── Publish a single post ──
async function publishPost(post) {
  console.log(`\n→ Publishing ${post.id}: ${post.content_type} (${post.media_type})`);

  // Resolve tagging + platforms (post + campaign defaults) up front so the
  // dry-run preview and the real upload use exactly the same values.
  const platforms = effectivePlatforms(post);
  const ig = effectiveIg(post);
  const igCollabs = ig.collaborators ? normHandles(ig.collaborators) : [];
  const igTags = ig.user_tags ? normHandles(ig.user_tags).slice(0, 20) : [];

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would post:');
    console.log(`    Platforms: ${platforms.join(', ')}`);
    console.log(`    IG: ${post.ig_caption.slice(0, 100)}...`);
    console.log(`    FB: ${(post.fb_caption || '(auto)').slice(0, 100)}`);
    if (platforms.includes('threads')) {
      console.log(`    Threads: ${(post.threads_caption || '(same as IG)').slice(0, 100)}`);
    }
    if (platforms.includes('tiktok')) {
      console.log(`    TikTok: ${(post.tiktok_caption || '(same as IG)').slice(0, 100)}  [${post.tiktok_options?.privacy_level || 'PUBLIC_TO_EVERYONE'}]`);
    }
    console.log(`    Media: ${post.media_paths?.[0] || '(none)'}`);
    if (igCollabs.length) console.log(`    Collab (co-author): @${igCollabs.join(', @')}`);
    if (igTags.length) console.log(`    Tags (${igTags.length}): @${igTags.join(', @')}`);
    if (ig.location_id) console.log(`    Location: ${ig.location_id}`);
    else if ((post.instagram_options?.tag_set || post.campaign) && CAMPAIGN_TAGS[post.instagram_options?.tag_set || post.campaign]) console.log('    Location: (none set)');
    if (ig.first_comment) console.log(`    First comment: ${ig.first_comment}`);
    if (SCHEDULE_MODE && post.post_date && post.post_time) {
      console.log(`    Scheduled for: ${post.post_date} ${post.post_time} ET`);
    }
    return { dry_run: true };
  }

  try {
    const baseOpts = {
      user: PROFILE,
      platforms,
    };

    // Captions — use platform-specific if FB caption differs
    if (post.fb_caption && post.fb_caption !== post.ig_caption) {
      baseOpts.instagramTitle = post.ig_caption;
      baseOpts.facebookTitle = post.fb_caption;
      baseOpts.title = post.ig_caption;
    } else {
      baseOpts.title = post.ig_caption;
    }
    // Threads gets its OWN copy when provided. Threads renders links in the post
    // body as clickable, so a landing-page URL belongs here (not in the IG
    // caption, where links are never clickable). Falls back to `title` if unset.
    if (post.threads_caption) baseOpts.threadsTitle = post.threads_caption;
    if (post.threads_options?.topic_tag) {
      baseOpts.threadsTopicTag = String(post.threads_options.topic_tag).replace(/^#/, '');
    }
    // TikTok (connected on the dbelitefitness profile 2026-09) gets its OWN
    // caption when provided — the IG copy is long and paragraph-shaped, and the
    // TikTok card wants one or two lines plus tags. Falls back to `title`.
    // Options map 1:1 onto the SDK's tiktok* fields; privacy defaults to public
    // because an unset level posts as a draft on some TikTok accounts.
    if (platforms.includes('tiktok')) {
      // Both fields: on the first live run (2026-09-08-bob-julian) Upload-Post
      // recorded tiktokTitle as post_title but TikTok displayed the IG caption,
      // so the description field is set too until one of them is proven to win.
      if (post.tiktok_caption) {
        baseOpts.tiktokTitle = post.tiktok_caption;
        baseOpts.tiktokDescription = post.tiktok_caption;
      }
      const tt = post.tiktok_options || {};
      baseOpts.tiktokPrivacyLevel = tt.privacy_level || 'PUBLIC_TO_EVERYONE';
      if (tt.disable_duet != null) baseOpts.tiktokDisableDuet = Boolean(tt.disable_duet);
      if (tt.disable_stitch != null) baseOpts.tiktokDisableStitch = Boolean(tt.disable_stitch);
      if (tt.disable_comment != null) baseOpts.tiktokDisableComment = Boolean(tt.disable_comment);
      if (tt.cover_timestamp != null) baseOpts.tiktokCoverTimestamp = Number(tt.cover_timestamp);
      if (tt.post_mode) baseOpts.tiktokPostMode = tt.post_mode;
      if (tt.is_aigc != null) baseOpts.tiktokIsAigc = Boolean(tt.is_aigc);
    }

    // IG options — all resolved through `ig` (post values + campaign defaults).
    if (ig.media_type) {
      // Normalize common shortenings — Upload-Post wants plural forms for video types
      const mt = String(ig.media_type).toUpperCase();
      baseOpts.instagramMediaType =
        mt === 'REEL' ? 'REELS' : mt === 'STORY' ? 'STORIES' : mt;
    }
    if (ig.first_comment) {
      baseOpts.instagramFirstComment = ig.first_comment;
    }
    // Collaborators (co-author) — Upload-Post wants a comma-separated string.
    if (igCollabs.length) {
      baseOpts.instagramCollaborators = igCollabs.join(',');
    }
    // User tags — the native "tag people" (Tagged tab + notification + reach to
    // their followers). Separate from collaborators. IG caps tags at 20/post.
    if (ig.user_tags) {
      const all = normHandles(ig.user_tags);
      if (all.length > 20) {
        console.warn(`  ⚠ ${all.length} user_tags — IG allows 20 max; keeping the first 20.`);
      }
      baseOpts.instagramUserTags = all.slice(0, 20).join(',');
    }
    // Location tag (optional) — surfaces the post on the location page.
    if (ig.location_id) {
      baseOpts.instagramLocationId = String(ig.location_id);
    }

    // FB options
    if (post.facebook_options?.media_type) {
      baseOpts.facebookMediaType = post.facebook_options.media_type;
    }
    // Always explicitly target an FB page (never rely on Upload-Post's default order).
    if (platforms.includes('facebook')) {
      baseOpts.facebookPageId = post.facebook_options?.facebookPageId || DEFAULT_FB_PAGE_ID;
    }

    // Scheduling
    // Upload-Post wants `scheduled_date` as a properly anchored ISO 8601
    // string. Send UTC with an explicit Z; if you send "YYYY-MM-DDTHH:MM:00"
    // without an offset, the API silently drops it into the FIFO queue with
    // scheduled_for=null (this bit us 2026-04-26 — see plan file). post_date
    // and post_time are ET wall-clock; convert to UTC here. Also log the
    // resolved UTC so a malformed input never silently fails again.
    if (SCHEDULE_MODE && post.post_date && post.post_time) {
      // Use the IANA-aware Date constructor with explicit ET offset. EDT is
      // UTC-04:00 (Mar–Nov), EST is UTC-05:00 (Nov–Mar). Picking the right
      // offset based on the date keeps DST transitions correct.
      const month = parseInt(post.post_date.split('-')[1], 10);
      const day = parseInt(post.post_date.split('-')[2], 10);
      const isEdt =
        (month > 3 && month < 11) ||
        (month === 3 && day >= 8) ||  // approx 2nd Sunday of March
        (month === 11 && day < 1);    // never true; EST starts 1st Sun Nov
      const offset = isEdt ? '-04:00' : '-05:00';
      const local = new Date(`${post.post_date}T${post.post_time}:00${offset}`);
      baseOpts.scheduledDate = local.toISOString(); // → "...Z"
      // Drop the redundant `timezone` field — Z already encodes UTC.
      console.log(
        `    Resolved schedule: ${post.post_date} ${post.post_time} ET (${offset}) → ${baseOpts.scheduledDate}`
      );
    }

    let response;

    if (post.media_type === 'text') {
      response = await client.uploadText(baseOpts);
    } else if (post.media_type === 'photo' || post.media_type === 'carousel') {
      const paths = post.media_paths || [];
      if (paths.length === 0) {
        throw new Error('No media_paths specified for photo/carousel post');
      }
      if (post.media_type === 'carousel' || paths.length > 1) {
        response = await client.uploadPhotos(paths, baseOpts);
      } else {
        response = await client.uploadPhotos(paths, {
          ...baseOpts,
          instagramMediaType: baseOpts.instagramMediaType || 'IMAGE',
        });
      }
    } else if (post.media_type === 'video' || post.media_type === 'story') {
      let path = post.media_paths?.[0];
      if (!path) throw new Error('No media_paths specified for video post');

      // A still image sent down the video/story path gets a 0s duration from
      // Upload-Post's transcode and flashes by in under a second. Wrap it in
      // an MP4 so the story holds (default 12s, override with story_duration).
      if (STILL_IMAGE_RE.test(path)) {
        path = wrapStillAsVideo(path, post.story_duration || DEFAULT_STORY_SECONDS);
      }

      if (post.media_type === 'story') {
        baseOpts.instagramMediaType = 'STORIES';
      } else if (!baseOpts.instagramMediaType) {
        baseOpts.instagramMediaType = 'REELS';
      }
      response = await client.upload(path, baseOpts);
    } else {
      throw new Error(`Unsupported media_type: "${post.media_type}". Use one of: text, photo, carousel, video, story. (For reels, use media_type "video" with instagram_options.media_type "REELS".)`);
    }

    if (response === undefined) {
      throw new Error(`publishPost did not produce a response for media_type "${post.media_type}" — a branch is missing its response assignment.`);
    }

    // Handle async uploads
    if (response?.request_id && !response?.status) {
      console.log(`  Async upload started (${response.request_id}). Polling...`);
      let status;
      let attempts = 0;
      do {
        await new Promise(r => setTimeout(r, 5000));
        status = await client.getStatus(response.request_id);
        attempts++;
        console.log(`  Poll ${attempts}: ${status.status}`);
      } while (status.status !== 'completed' && status.status !== 'error' && attempts < 60);
      response = status;
    }

    console.log(`  ✓ Posted successfully`);
    return response;
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    throw err;
  }
}

// ── Main ──
async function main() {
  const cal = loadCalendar();

  if (REVIEW_MODE) {
    showReview(cal);
    return;
  }

  // Find posts to publish
  let toPublish;
  const today = new Date().toISOString().slice(0, 10);

  if (specificId) {
    toPublish = cal.posts.filter(p => p.id === specificId);
    if (toPublish.length === 0) {
      console.error(`No post found with ID: ${specificId}`);
      process.exit(1);
    }
    if (toPublish[0].status !== 'approved' && !DRY_RUN) {
      console.error(`Post ${specificId} is "${toPublish[0].status}", not "approved". Approve it first.`);
      process.exit(1);
    }
  } else {
    // All approved posts due today or earlier (or with no date)
    toPublish = cal.posts.filter(p =>
      p.status === 'approved' &&
      (!p.post_date || p.post_date <= today)
    );
  }

  if (toPublish.length === 0) {
    console.log('\nNo approved posts ready to publish.');
    console.log(`(${cal.posts.filter(p => p.status === 'ready').length} posts waiting for approval)`);
    return;
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Publishing ${toPublish.length} post(s)...`);

  let success = 0, scheduled = 0, failed = 0;

  for (const post of toPublish) {
    try {
      const result = await publishPost(post);

      // Upload-Post marks the job "completed" even when individual platforms
      // fail, so inspect per-platform success — never blanket-mark "posted".
      // Not meaningful in SCHEDULE_MODE: a queued job reports every platform as
      // { status: "queued", success: false } because the worker hasn't run yet,
      // so treating that as failure would flag a perfectly good schedule.
      const platResults = Array.isArray(result?.results) ? result.results : [];
      const failedPlats = platResults.filter(r => r.success === false).map(r => r.platform);
      const fullyFailed = platResults.length > 0 && failedPlats.length === platResults.length;

      if (!DRY_RUN) {
        if (SCHEDULE_MODE) {
          post.status = 'scheduled';
        } else if (fullyFailed) {
          post.status = 'failed';
        } else if (failedPlats.length) {
          post.status = 'partial';
          post.failed_platforms = failedPlats;
          console.log(`  ⚠ Partial: failed on ${failedPlats.join(', ')} (see post_result for errors)`);
        } else {
          post.status = 'posted';
        }
        post.posted_at = new Date().toISOString();
        post.post_result = result;
        saveCalendar(cal);
      }
      // Counters mirror the status written above, so the tally can never
      // disagree with what landed in the calendar.
      if (SCHEDULE_MODE) scheduled++;
      else if (fullyFailed) failed++;
      else success++;

      // ── Amplifier fan-out ──
      // Fires only for immediate publishes that actually went live (a scheduled
      // or fully-failed post has nothing to amplify).
      // Fail-soft: an amplifier error must never fail a post that already went
      // live. Stays inert until amplifiers.json has enabled:true.
      if (!SCHEDULE_MODE && !fullyFailed) {
        try {
          const amp = await amplifyPost(post, { dryRun: DRY_RUN, client });
          if (!DRY_RUN && amp && !amp.skipped) {
            post.amplify_result = amp;
            saveCalendar(cal);
          }
        } catch (ampErr) {
          console.error(`  ⚠ Amplify failed (post is still live): ${ampErr.message}`);
        }
      }
    } catch (err) {
      if (!DRY_RUN) {
        post.status = 'failed';
        post.post_result = { error: err.message };
        saveCalendar(cal);
      }
      failed++;
    }
  }

  console.log(`\nDone: ${success} published, ${scheduled} scheduled, ${failed} failed.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
