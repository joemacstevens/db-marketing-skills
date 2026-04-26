#!/usr/bin/env node
/**
 * post-reel.mjs — Publish a DB reel to Instagram + Facebook via Upload-Post.
 *
 * Usage:
 *   node scripts/post-reel.mjs <videoPath> "Caption with emojis 🥊"
 *
 * Environment:
 *   Reads ~/Projects/utilities/claude-secrets/.env.openclaw-secrets
 *   for UPLOAD_POST_API_KEY (and other keys). That file is the single
 *   source of truth for secrets on this MacBook.
 *
 * Behavior:
 *   - Uploads video as a Reel to IG + FB under @dbelitefitness
 *   - If response is an async handoff, polls getStatus every 15s (up to 20 tries)
 *   - Appends result to ~/Library/Logs/uploadpost-publish.jsonl
 *   - Exits 0 on success, non-zero on any failure
 *
 * ⚠️  APPROVAL RULE:
 *   Never run this without Joey's explicit go-ahead. Preview the reel
 *   + caption first, wait for approval, THEN post.
 */

import { UploadPost } from 'upload-post';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SECRETS_FILE = path.join(
  os.homedir(),
  'Projects/utilities/claude-secrets/.env.openclaw-secrets'
);

function loadSecretsEnv(file) {
  if (!fs.existsSync(file)) {
    console.error(`[post-reel] Secrets file not found: ${file}`);
    return;
  }
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const s = line.trim();
    if (!s || s.startsWith('#') || !s.includes('=')) continue;
    const idx = s.indexOf('=');
    const k = s.slice(0, idx).trim();
    const v = s.slice(idx + 1).trim().replace(/^"(.*)"$/, '$1');
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadSecretsEnv(SECRETS_FILE);

// CLI args
const videoPath = process.argv[2];
const title = process.argv[3] || process.env.UPLOAD_POST_TITLE || 'Different Breed';

if (!videoPath) {
  console.error('Usage: post-reel.mjs <videoPath> [caption]');
  process.exit(1);
}
if (!fs.existsSync(videoPath)) {
  console.error(`[post-reel] File not found: ${videoPath}`);
  process.exit(1);
}

const apiKey = process.env.UPLOAD_POST_API_KEY;
const user = process.env.UPLOAD_POST_USER || 'dbelitefitness';
const platforms = (process.env.UPLOAD_POST_PLATFORMS || 'instagram,facebook')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!apiKey) {
  console.error('[post-reel] Missing UPLOAD_POST_API_KEY in secrets file.');
  process.exit(1);
}

// FB caption limit sanity check
if (platforms.includes('facebook') && title.length > 255) {
  console.error(
    `[post-reel] Title is ${title.length} chars; Facebook caps at 255. ` +
      `Either shorten or drop 'facebook' from platforms.`
  );
  process.exit(1);
}

const client = new UploadPost(apiKey);

async function pollForDelivery(requestId, key) {
  const MAX_ATTEMPTS = 20;
  const INTERVAL_MS = 15_000;
  const statusUrl = `https://api.upload-post.com/api/uploadposts/status?request_id=${encodeURIComponent(
    requestId
  )}`;

  console.log(
    `[post-reel] Polling delivery for request_id=${requestId} (up to ${MAX_ATTEMPTS} × 15s)…`
  );

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
    let statusData;
    try {
      const resp = await fetch(statusUrl, {
        headers: { Authorization: `Apikey ${key}` },
      });
      statusData = await resp.json();
    } catch (e) {
      console.warn(
        `[post-reel] Poll ${attempt}/${MAX_ATTEMPTS} failed: ${e?.message}`
      );
      continue;
    }

    console.log(
      `[post-reel] Poll ${attempt}/${MAX_ATTEMPTS}: status=${statusData?.status} completed=${statusData?.completed} failed=${statusData?.failed} total=${statusData?.total}`
    );

    if (statusData?.status === 'completed') {
      if ((statusData?.failed ?? 0) === 0) {
        console.log('[post-reel] ✅ Delivered to all platforms.');
        if (Array.isArray(statusData?.results)) {
          for (const r of statusData.results) {
            console.log(`  ✓ ${r.platform}: post_id=${r.post_id} status=${r.status}`);
          }
        }
        process.exit(0);
      } else {
        console.error(
          `[post-reel] ❌ Completed with failures: ${statusData.failed}/${statusData.total}`
        );
        if (Array.isArray(statusData?.results)) {
          for (const r of statusData.results) {
            if (!r.success) console.error(`  ✗ ${r.platform}: status=${r.status}`);
          }
        }
        process.exit(2);
      }
    }
  }

  console.warn(
    `[post-reel] ⚠️  Timed out after ~${(MAX_ATTEMPTS * INTERVAL_MS) / 60_000} min. request_id=${requestId}`
  );
  process.exit(3);
}

(async () => {
  console.log(`[post-reel] Uploading → ${videoPath}`);
  console.log(`[post-reel] user=${user} platforms=${platforms.join(',')}`);
  console.log(`[post-reel] title="${title}"`);

  try {
    const res = await client.upload(videoPath, {
      title,
      user,
      platforms,
      // Post as a Reel on IG (not a Story). Omit for default feed video.
      instagram: { isReel: true },
    });

    const isAsyncHandoff =
      res?.success === true && !res?.results && !!(res?.request_id || res?.job_id);

    const asyncMessage = isAsyncHandoff
      ? `Upload accepted (async) — request_id=${res?.request_id || 'n/a'} job_id=${
          res?.job_id || 'n/a'
        }`
      : null;

    const out = {
      ts: new Date().toISOString(),
      file: path.basename(videoPath),
      user,
      platforms,
      title,
      status: isAsyncHandoff ? 'accepted_async_handoff' : 'completed_inline',
      message: asyncMessage || null,
      result: res,
    };

    const logDir = path.join(os.homedir(), 'Library/Logs');
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(
      path.join(logDir, 'uploadpost-publish.jsonl'),
      JSON.stringify(out) + '\n'
    );

    console.log(JSON.stringify(res, null, 2));

    if (isAsyncHandoff) {
      console.log(asyncMessage);
      const requestId = res?.request_id || res?.job_id;
      await pollForDelivery(requestId, apiKey);
      return; // pollForDelivery exits the process
    }

    const igOk = !!res?.results?.instagram?.success;
    const fbOk = platforms.includes('facebook')
      ? !!res?.results?.facebook?.success
      : true;
    if (!igOk || !fbOk) process.exit(2);
    console.log('[post-reel] ✅ Inline completion — all platforms OK.');
  } catch (e) {
    console.error('[post-reel] Upload-Post failed:', e?.message || e);
    process.exit(1);
  }
})();
