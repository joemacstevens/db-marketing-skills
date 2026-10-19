// Pull Up Challenge (Oct 2026): first score on the board.
// Source: Don's text 10/6 8:44 AM with IMG_1822 — "Amanda has begun the
// challenge 6 is tops at the moment for the females."
//
// Writes straight to Blob (mirrors config-store.writeBlob), history snapshot first,
// then a delayed verify. Run from the repo root:
//   node --env-file="/Users/joestevens/Projects/Different Breed/main-site/.env.local" scripts/add-pull-up-reps-2026-10-06.mjs [--dry]
import { list, put } from '@vercel/blob';

const PANEL_ID = 'pull-up-challenge';
const ROWS = [
  { name: 'Amanda', score: '6', division: 'women', rank: 1 },
];
const DRY = process.argv.includes('--dry');
const KEY = 'lobby-config/panels.json';
const OPTS = { access: 'public', addRandomSuffix: false, contentType: 'application/json', allowOverwrite: true, cacheControlMaxAge: 0 };

async function readPanels() {
  const { blobs } = await list({ prefix: KEY });
  const b = blobs.find((x) => x.pathname === KEY);
  if (!b) throw new Error('panels.json not found in Blob');
  const res = await fetch(`${b.url}?t=${Date.now()}`, { cache: 'no-store' });
  return { panels: await res.json(), uploadedAt: b.uploadedAt };
}

const { panels, uploadedAt } = await readPanels();
console.log('panels.json uploadedAt', uploadedAt);
const panel = panels.find((p) => p.id === PANEL_ID);
if (!panel) throw new Error(`panel ${PANEL_ID} missing`);
const before = panel.leaderboard?.rows ?? [];
console.log('before:', JSON.stringify(before));
if (before.length > 0) {
  console.error('Board already has rows; refusing to overwrite. Merge by hand.');
  process.exit(1);
}

panel.leaderboard = { ...(panel.leaderboard ?? {}), rows: ROWS };
console.log('after: ', JSON.stringify(panel.leaderboard.rows));
if (DRY) { console.log('--dry, nothing written'); process.exit(0); }

const body = JSON.stringify(panels, null, 2);
await put(`lobby-config/history/panels-${Date.now()}.json`, JSON.stringify(panels.map((p) => (p.id === PANEL_ID ? { ...p, leaderboard: { ...p.leaderboard, rows: before } } : p)), null, 2), OPTS).catch((e) => console.warn('history snapshot failed', e.message));
await put(KEY, body, OPTS);
console.log('written; verifying in 15s...');
await new Promise((r) => setTimeout(r, 15000));
const check = (await readPanels()).panels.find((p) => p.id === PANEL_ID);
const ok = JSON.stringify(check.leaderboard?.rows) === JSON.stringify(ROWS);
console.log(ok ? 'VERIFY OK' : 'VERIFY MISMATCH (Blob edge cache can lag; re-read in a few minutes before re-writing)', JSON.stringify(check.leaderboard?.rows));
