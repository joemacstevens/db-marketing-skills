#!/usr/bin/env node
/**
 * DB Amplifier Layer — legit reach for DB posts, no fake-engagement/ban risk.
 *
 * After a post publishes to @dbelitefitness, this reshares the same media to
 * your other (connected, business/creator) accounts as a STORY and/or FEED
 * post via Upload-Post. Config lives in amplifiers.json.
 *
 * IG Collab posts and first-comment seeding — the two strongest legit
 * amplifiers — are handled in publish.mjs at post time via a post's
 * instagram_options.collaborators / instagram_options.first_comment. This
 * script owns the third piece: the reshare fan-out, plus connect + rally.
 *
 * Subcommands:
 *   node amplify.mjs --status                 List Upload-Post profiles + connection state
 *   node amplify.mjs --connect                Create profiles + print IG connect links (one-time)
 *   node amplify.mjs --post <id>              Reshare that post to all enabled targets
 *   node amplify.mjs --post <id> --dry-run    Show what would be reshared, post nothing
 *   node amplify.mjs --rally <id> --link <url>  Draft (NOT send) rally messages to account owners
 *
 * Auto-fire: publish.mjs imports amplifyPost() and calls it after a post goes
 * live. It stays inert until amplifiers.json has enabled:true.
 */

import { readFileSync } from 'fs';
import { UploadPost } from 'upload-post/index.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CAL_PATH = resolve(__dirname, 'calendar.json');
const CFG_PATH = resolve(__dirname, 'amplifiers.json');
const SECRETS_PATH = '/Users/joestevens/.claude/secrets/.env.openclaw-secrets';

// ── secrets / client ──
export function loadApiKey() {
  const secrets = readFileSync(SECRETS_PATH, 'utf8');
  const key = secrets.match(/UPLOAD_POST_API_KEY=(.*)/)?.[1]?.trim()?.replace(/^["']|["']$/g, '');
  if (!key) throw new Error('UPLOAD_POST_API_KEY not found in secrets');
  return key;
}
function makeClient() {
  return new UploadPost(loadApiKey());
}

// ── config / calendar ──
export function loadConfig() {
  return JSON.parse(readFileSync(CFG_PATH, 'utf8'));
}
function loadCalendar() {
  return JSON.parse(readFileSync(CAL_PATH, 'utf8'));
}

// ── media helpers ──
function mediaKind(path) {
  const ext = String(path).toLowerCase().split('.').pop();
  if (['mp4', 'mov', 'm4v', 'webm'].includes(ext)) return 'video';
  if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext)) return 'photo';
  return 'unknown';
}
function normalizeIgType(mt) {
  if (!mt) return undefined;
  const up = String(mt).toUpperCase();
  return up === 'REEL' ? 'REELS' : up === 'STORY' ? 'STORIES' : up;
}

// ── reshare one post to one target ──
async function reshareToTarget(client, post, target, { dryRun, baseTime, index, staggerMin }) {
  const paths = post.media_paths || [];
  const label = target.handle || target.profile;
  if (!paths.length) {
    console.log(`  ⚠ ${label}: post has no media_paths — skipping`);
    return { target: target.profile, skipped: 'no-media' };
  }
  const first = paths[0];
  const kind = mediaKind(first);
  if (kind === 'unknown') {
    console.log(`  ⚠ ${label}: can't tell media type of ${first} — skipping`);
    return { target: target.profile, skipped: 'unknown-media' };
  }

  const modes = target.reshare?.length ? target.reshare : ['story'];
  const results = [];

  for (const mode of modes) {
    const opts = { user: target.profile, platforms: ['instagram'] };

    // Stagger via Upload-Post scheduling so the process never blocks for minutes
    // and the accounts don't all fire at the same second.
    if (staggerMin > 0) {
      const when = new Date(baseTime.getTime() + index * staggerMin * 60000);
      opts.scheduledDate = when.toISOString();
    }

    if (mode === 'story') {
      opts.instagramMediaType = 'STORIES'; // stories carry no caption/first-comment
    } else if (mode === 'feed') {
      opts.title = post.ig_caption || '';
      if (kind === 'video') opts.instagramMediaType = normalizeIgType(post.instagram_options?.media_type) || 'REELS';
      if (target.first_comment) opts.instagramFirstComment = target.first_comment;
    } else {
      console.log(`  ⚠ ${label}: unknown reshare mode "${mode}" — skipping`);
      continue;
    }

    if (dryRun) {
      console.log(
        `  [DRY] ${label} · ${mode} · ${kind}` +
        `${opts.scheduledDate ? ` @ ${opts.scheduledDate}` : ''}` +
        `${opts.instagramFirstComment ? ` +first-comment` : ''}  ← ${first}`
      );
      results.push({ mode, dry: true });
      continue;
    }

    let res;
    if (kind === 'video') {
      res = await client.upload(first, opts);
    } else {
      // photo/carousel. Feed can carry the whole carousel; story takes the first frame.
      res = await client.uploadPhotos(mode === 'feed' ? paths : [first], opts);
    }
    console.log(`  ✓ ${label} · ${mode}${opts.scheduledDate ? ` (scheduled ${opts.scheduledDate})` : ''}`);
    results.push({ mode, res });
  }

  return { target: target.profile, results };
}

// ── public: amplify a single post to all enabled targets ──
export async function amplifyPost(post, { dryRun = false, client } = {}) {
  const cfg = loadConfig();
  if (!cfg.enabled) return { skipped: 'disabled' };
  if (post.amplify === false) {
    console.log(`  📣 Amplify: ${post.id} opted out (amplify:false).`);
    return { skipped: 'opted-out' };
  }
  // Only amplify real IG feed/reel/photo content — not stories, not text-only.
  if (!post.platforms?.includes('instagram')) return { skipped: 'not-instagram' };
  if (post.media_type === 'text' || post.media_type === 'story') {
    return { skipped: `media-type-${post.media_type}` };
  }

  const targets = (cfg.targets || []).filter(t => t.enabled && t.profile);
  if (!targets.length) {
    console.log('  📣 Amplify: enabled, but no targets are connected/enabled yet.');
    return { skipped: 'no-targets' };
  }

  const c = client || makeClient();
  const staggerMin = Number(cfg.stagger_minutes) || 0;
  const baseTime = new Date(Date.now() + 60_000); // first reshare ~1 min out
  console.log(`\n📣 Amplifying ${post.id} → ${targets.length} account(s)${dryRun ? ' [DRY RUN]' : ''}...`);

  const out = [];
  for (let i = 0; i < targets.length; i++) {
    try {
      out.push(await reshareToTarget(c, post, targets[i], { dryRun, baseTime, index: i, staggerMin }));
    } catch (e) {
      console.error(`  ✗ ${targets[i].handle || targets[i].profile}: ${e.message}`);
      out.push({ target: targets[i].profile, error: e.message });
    }
  }
  return { amplified: out };
}

// ── CLI: --status ──
async function cmdStatus(client) {
  console.log('\n═══ Upload-Post profiles (listUsers) ═══');
  try {
    const u = await client.listUsers();
    console.log(JSON.stringify(u, null, 2));
  } catch (e) {
    console.error(`listUsers error: ${e.message}`);
  }
}

// ── CLI: --connect ──
async function cmdConnect(client, cfg) {
  const targets = (cfg.targets || []).filter(t => t.profile);
  if (!targets.length) {
    console.log('No targets with a `profile` set in amplifiers.json. Add them, then re-run --connect.');
    return;
  }
  console.log('\nCreating profiles + generating IG connect links...\n');
  for (const t of targets) {
    try {
      await client.createUser(t.profile);
      console.log(`+ created profile "${t.profile}"`);
    } catch (e) {
      console.log(`• profile "${t.profile}" (create skipped: ${e.message})`);
    }
    try {
      const jwt = await client.generateJwt(t.profile, {
        platforms: ['instagram'],
        connectTitle: `Connect ${t.handle || t.profile} to Different Breed`,
        redirectButtonText: 'Done',
      });
      const url = jwt.access_url || jwt.url || jwt.connect_url || jwt.connection_url;
      console.log(`  → ${t.handle || t.profile}: ${url || '(url field not found — raw below)'}`);
      if (!url) console.log(`    ${JSON.stringify(jwt)}`);
      console.log('');
    } catch (e) {
      console.error(`  ✗ generateJwt "${t.profile}": ${e.message}\n`);
    }
  }
  console.log('Open each link, log into THAT IG account (business/creator), approve Instagram. One-time per account.');
  console.log('Then set that target\'s enabled:true in amplifiers.json.');
}

// ── CLI: --post <id> ──
async function cmdPost(client, id, dryRun) {
  const cal = loadCalendar();
  const post = cal.posts.find(p => p.id === id);
  if (!post) {
    console.error(`No post with id "${id}" in calendar.json`);
    process.exit(1);
  }
  const cfg = loadConfig();
  if (!cfg.enabled) {
    console.log('amplifiers.json has enabled:false — flip it to true to run for real. Showing dry-run:');
    dryRun = true;
  }
  const res = await amplifyPost(post, { dryRun, client });
  if (res.skipped) console.log(`(skipped: ${res.skipped})`);
}

// ── CLI: --rally <id> --link <url>  (DRAFT ONLY — never sends) ──
function cmdRally(id, link) {
  const cal = loadCalendar();
  const post = cal.posts.find(p => p.id === id);
  if (!post) {
    console.error(`No post with id "${id}" in calendar.json`);
    process.exit(1);
  }
  const cfg = loadConfig();
  const owners = (cfg.targets || []).filter(t => t.owner_imessage);
  console.log('\n═══ Rally drafts (NOT sent — copy/send yourself, or ask Claude to send with your OK) ═══\n');
  const hook = (post.ig_caption || '').split('\n')[0].slice(0, 60);
  for (const t of owners) {
    const msg = `New DB post just went live 🥊 "${hook}..." — jump on it: like, drop a real comment, and reshare to your story with an @dbelitefitness mention. First 30 min matters most.${link ? `\n${link}` : ''}`;
    console.log(`→ ${t.handle || t.profile} (${t.owner_imessage}):`);
    console.log(`  ${msg}\n`);
  }
  if (!owners.length) console.log('(No targets have owner_imessage set in amplifiers.json.)');
  console.log('Note: the story @mention sticker can only be added by a human in the app — that\'s the whole point of the rally.');
}

// ── main (only when run directly) ──
const isDirect = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isDirect) {
  const argv = process.argv.slice(2);
  const has = f => argv.includes(f);
  const val = f => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : null);
  const dryRun = has('--dry-run');

  (async () => {
    const cfg = loadConfig();
    if (has('--status')) return cmdStatus(makeClient());
    if (has('--connect')) return cmdConnect(makeClient(), cfg);
    if (has('--rally')) return cmdRally(val('--rally'), val('--link'));
    if (has('--post')) return cmdPost(makeClient(), val('--post'), dryRun);
    console.log('Usage: --status | --connect | --post <id> [--dry-run] | --rally <id> --link <url>');
  })().catch(e => {
    console.error('Fatal:', e.message);
    process.exit(1);
  });
}
