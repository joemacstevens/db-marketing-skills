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

import { readFileSync, writeFileSync } from 'fs';
import { UploadPost } from 'upload-post/index.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CAL_PATH = resolve(__dirname, 'calendar.json');
const PROFILE = 'dbelitefitness';
const TIMEZONE = 'America/New_York';
// Facebook: multiple pages can be connected under this profile.
// Always target Different Breed Elite Fitness & Sports unless a post overrides it.
const DEFAULT_FB_PAGE_ID = '100873874674621';

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

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would post:');
    console.log(`    Platforms: ${post.platforms.join(', ')}`);
    console.log(`    IG: ${post.ig_caption.slice(0, 100)}...`);
    console.log(`    FB: ${(post.fb_caption || '(auto)').slice(0, 100)}`);
    console.log(`    Media: ${post.media_paths?.[0] || '(none)'}`);
    if (SCHEDULE_MODE && post.post_date && post.post_time) {
      console.log(`    Scheduled for: ${post.post_date} ${post.post_time} ET`);
    }
    return { dry_run: true };
  }

  try {
    const baseOpts = {
      user: PROFILE,
      platforms: post.platforms,
    };

    // Captions — use platform-specific if FB caption differs
    if (post.fb_caption && post.fb_caption !== post.ig_caption) {
      baseOpts.instagramTitle = post.ig_caption;
      baseOpts.facebookTitle = post.fb_caption;
      baseOpts.title = post.ig_caption;
    } else {
      baseOpts.title = post.ig_caption;
    }

    // IG options
    if (post.instagram_options?.media_type) {
      // Normalize common shortenings — Upload-Post wants plural forms for video types
      const mt = String(post.instagram_options.media_type).toUpperCase();
      baseOpts.instagramMediaType =
        mt === 'REEL' ? 'REELS' : mt === 'STORY' ? 'STORIES' : mt;
    }
    if (post.instagram_options?.first_comment) {
      baseOpts.instagramFirstComment = post.instagram_options.first_comment;
    }
    if (post.instagram_options?.collaborators) {
      baseOpts.instagramCollaborators = post.instagram_options.collaborators;
    }

    // FB options
    if (post.facebook_options?.media_type) {
      baseOpts.facebookMediaType = post.facebook_options.media_type;
    }
    // Always explicitly target an FB page (never rely on Upload-Post's default order).
    if (post.platforms?.includes('facebook')) {
      baseOpts.facebookPageId = post.facebook_options?.facebookPageId || DEFAULT_FB_PAGE_ID;
    }

    // Scheduling
    if (SCHEDULE_MODE && post.post_date && post.post_time) {
      baseOpts.scheduledDate = `${post.post_date}T${post.post_time}:00`;
      baseOpts.timezone = TIMEZONE;
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
      const path = post.media_paths?.[0];
      if (!path) throw new Error('No media_paths specified for video post');

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

  let success = 0, failed = 0;

  for (const post of toPublish) {
    try {
      const result = await publishPost(post);

      if (!DRY_RUN) {
        post.status = SCHEDULE_MODE ? 'scheduled' : 'posted';
        post.posted_at = new Date().toISOString();
        post.post_result = result;
        saveCalendar(cal);
      }
      success++;
    } catch (err) {
      if (!DRY_RUN) {
        post.status = 'failed';
        post.post_result = { error: err.message };
        saveCalendar(cal);
      }
      failed++;
    }
  }

  console.log(`\nDone: ${success} published, ${failed} failed.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
