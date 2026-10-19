// Pull Up Challenge (Oct 2026): first two men on the board.
// Source: Don's texts in the Don + CJ thread, 10/17 6:23 PM (IMG_2163, "Roberto
// Estrada second place with 25") + 6:25 PM (IMG_2164, "first place with 27"),
// name confirmed 10/18 11:22 AM: "First place for the pull-up contest is Ahmed Ashour".
//
// Merges into whatever is on the board (upsert by name + division, re-rank each
// division by reps, higher wins). History snapshot first, then a delayed verify.
//   node --env-file="/Users/joestevens/Projects/Different Breed/main-site/.env.local" scripts/add-pull-up-reps-2026-10-19.mjs [--dry]
import { list, put } from '@vercel/blob';

const PANEL_ID = 'pull-up-challenge';
const UPSERTS = [
  { name: 'Ahmed Ashour', score: '27', division: 'men' },
  { name: 'Roberto Estrada', score: '25', division: 'men' },
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

const key = (r) => `${r.division}|${r.name.toLowerCase()}`;
const merged = new Map(before.map((r) => [key(r), { ...r }]));
for (const u of UPSERTS) merged.set(key(u), { ...(merged.get(key(u)) ?? {}), ...u });
const rows = [];
for (const div of [...new Set([...merged.values()].map((r) => r.division))]) {
  [...merged.values()].filter((r) => r.division === div)
    .sort((a, b) => Number(b.score) - Number(a.score))
    .forEach((r, i) => rows.push({ ...r, rank: i + 1 }));
}

panel.leaderboard = { ...(panel.leaderboard ?? {}), rows };
console.log('after: ', JSON.stringify(rows));
if (DRY) { console.log('--dry, nothing written'); process.exit(0); }

const body = JSON.stringify(panels, null, 2);
await put(`lobby-config/history/panels-${Date.now()}.json`, JSON.stringify(panels.map((p) => (p.id === PANEL_ID ? { ...p, leaderboard: { ...p.leaderboard, rows: before } } : p)), null, 2), OPTS).catch((e) => console.warn('history snapshot failed', e.message));
await put(KEY, body, OPTS);
console.log('written; verifying in 15s...');
await new Promise((r) => setTimeout(r, 15000));
const check = (await readPanels()).panels.find((p) => p.id === PANEL_ID);
const ok = JSON.stringify(check.leaderboard?.rows) === JSON.stringify(rows);
console.log(ok ? 'VERIFY OK' : 'VERIFY MISMATCH (Blob edge cache can lag; re-read in a few minutes before re-writing)', JSON.stringify(check.leaderboard?.rows));
