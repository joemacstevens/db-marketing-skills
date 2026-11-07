#!/usr/bin/env node
// Deep-bass suspense bed for the Pablo vs D.R.E.D. face-off teaser (synthesized, no samples).
// Beat times match src/pablo-dred-faceoff/timing.ts.
//   node scripts/pablo-dred-faceoff-sfx.mjs -> public/pablo-dred-faceoff/faceoff-sfx.wav
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const DUR = 9;
const N = SR * DUR;
const B = { thump1: 0.45, thump2: 1.0, pablo: 1.4, dred: 2.6, riserStart: 2.75, impact: 4.2, date: 5.3, names: 6.0, pulseEnd: 8.3 };

const dry = new Float32Array(N);
const wet = new Float32Array(N);
let seed = 4242;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (buf, i, v) => { if (i >= 0 && i < N) buf[i] += v; };
const sat = (x, d) => Math.tanh(x * d) / Math.tanh(d);

// --- sub drone: 30.9 Hz (B0) + fifth, slow throb, swells into the impact, then breathes
{
  let ph1 = 0, ph2 = 0, ph3 = 0, rum = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const swell = t < B.impact ? 0.45 + 0.55 * Math.max(0, (t - 0.0) / B.impact) ** 2 : 0.7;
    const out = t > 8.0 ? Math.max(0, 1 - (t - 8.0) / 0.6) : 1;
    const env = Math.min(1, t / 0.8) * swell * out;
    const throb = 0.75 + 0.25 * Math.sin(2 * Math.PI * (t < B.riserStart ? 0.5 : 1.2) * t);
    ph1 += (2 * Math.PI * 30.87) / SR;
    ph2 += (2 * Math.PI * 46.25) / SR;
    ph3 += (2 * Math.PI * 61.74 * (1 + 0.003 * Math.sin(t * 1.3))) / SR;
    rum += 0.012 * (rnd() - rum);
    const v = sat(Math.sin(ph1) * 0.9 + Math.sin(ph2) * 0.35 + Math.sin(ph3) * 0.25, 1.6) * throb + rum * 2.5;
    add(dry, i, v * env * 0.42);
    add(wet, i, v * env * 0.04);
  }
}

// --- sub heartbeat (lub-dub)
const heart = (t0, g) => {
  for (const [off, gg] of [[0, 1], [0.17, 0.6]]) {
    const s0 = Math.floor((t0 + off) * SR);
    let ph = 0;
    for (let k = 0; k < SR * 0.5; k++) {
      const t = k / SR;
      ph += (2 * Math.PI * (34 + 40 * Math.exp(-t * 22))) / SR;
      const v = sat(Math.sin(ph), 2.5) * Math.exp(-t * 8) * Math.min(1, t * 500) * g * gg;
      add(dry, s0 + k, v);
      add(wet, s0 + k, v * 0.1);
    }
  }
};

// --- whoosh lead-in for a slide (filtered noise sweep, panned feel via reverb send)
const whoosh = (tHit, len) => {
  const s1 = Math.floor(tHit * SR), s0 = s1 - Math.floor(len * SR);
  let lp = 0, hp = 0, prev = 0;
  for (let i = s0; i < s1; i++) {
    const p = (i - s0) / (s1 - s0);
    lp += (0.01 + 0.25 * p * p) * (rnd() - lp);
    hp = 0.97 * (hp + lp - prev); prev = lp;
    const v = hp * Math.pow(p, 2.2) * 1.5;
    add(dry, i, v * 0.6);
    add(wet, i, v * 0.4);
  }
};

// --- 808 slam: long sub drop + punch + low braam on big hits
const slam = (t0, size) => {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(SR * (2.2 + size * 1.6));
  let ph = 0, n1 = 0, n2 = 0, blp = 0;
  const bf = [30.87, 46.25, 61.74, 92.5];
  const bph = bf.map(() => Math.random() * 0); // deterministic: start at 0
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const freq = 27 + (70 + 30 * size) * Math.exp(-t * 7);
    ph += (2 * Math.PI * freq) / SR;
    const subEnv = Math.exp(-t * (1.25 - size * 0.45)) * Math.min(1, t * 1200);
    let v = sat(Math.sin(ph), 2.4 + size * 2) * subEnv * 1.05;
    const r = rnd();
    n1 += 0.3 * (r - n1);
    n2 += 0.06 * (r - n2);
    v += (n1 * 0.6 + n2 * 1.8) * Math.exp(-t * 18) * (0.6 + size * 0.6); // punch / thud body
    if (size >= 0.5) {
      let br = 0;
      bf.forEach((fq, j) => { bph[j] += (fq * (1 - 0.04 * Math.exp(-t * 2.5))) / SR; br += ((bph[j] % 1) * 2 - 1) / (j + 1); });
      blp += (0.02 + 0.08 * Math.exp(-t * 1.5)) * (br - blp);
      v += sat(blp * 2.2, 1.8) * Math.exp(-t * (0.9 - size * 0.3)) * Math.min(1, t * 120) * 0.7 * size;
    }
    add(dry, s0 + k, v * 0.9);
    add(wet, s0 + k, v * (0.25 + size * 0.3));
  }
};

// --- riser: rising low tone + noise + accelerating clock ticks + sub swell, cut into impact
{
  const s0 = Math.floor(B.riserStart * SR), s1 = Math.floor((B.impact - 0.04) * SR);
  let lp = 0, hp = 0, prev = 0, ph = 0, ph2 = 0;
  for (let i = s0; i < s1; i++) {
    const p = (i - s0) / (s1 - s0);
    const r = rnd();
    lp += (0.008 + 0.35 * p * p) * (r - lp);
    hp = 0.96 * (hp + lp - prev); prev = lp;
    const f0 = 55 * Math.pow(4, p);
    ph += (2 * Math.PI * f0) / SR;
    ph2 += (2 * Math.PI * f0 * 1.498) / SR;
    const env = Math.pow(p, 1.8);
    const v = (hp * 1.1 + sat(Math.sin(ph) + 0.5 * Math.sin(ph2), 1.5) * 0.35) * env;
    add(dry, i, v * 0.75);
    add(wet, i, v * 0.3);
  }
  let t = B.riserStart, gap = 0.2;
  while (t < B.impact - 0.06) {
    const st = Math.floor(t * SR), p = (t - B.riserStart) / (B.impact - B.riserStart);
    let ph3 = 0;
    for (let k = 0; k < SR * 0.05; k++) {
      ph3 += (2 * Math.PI * 1800) / SR;
      add(dry, st + k, (Math.sin(ph3) * 0.5 + rnd() * 0.5) * Math.exp(-(k / SR) * 140) * (0.12 + 0.3 * p));
    }
    t += gap; gap = Math.max(0.05, gap * 0.84);
  }
  // reverse suck into the impact
  const len = Math.floor(SR * 0.5);
  let sl = 0;
  for (let k = 0; k < len; k++) {
    const p = k / len;
    sl += (0.04 + 0.3 * p) * (rnd() - sl);
    add(dry, Math.floor(B.impact * SR) - len + k, sl * Math.pow(p, 3.5) * 1.1);
  }
}

// --- suspense pulse after the names: "dun ... dun" sub hits every 0.75 s + tick
for (let t = B.names; t < B.pulseEnd; t += 0.75) {
  const s0 = Math.floor(t * SR);
  let ph = 0;
  for (let k = 0; k < SR * 0.6; k++) {
    const tt = k / SR;
    ph += (2 * Math.PI * (31 + 25 * Math.exp(-tt * 14))) / SR;
    add(dry, s0 + k, sat(Math.sin(ph), 2.2) * Math.exp(-tt * 5.5) * Math.min(1, tt * 600) * 0.75);
  }
  const tk = Math.floor((t + 0.375) * SR);
  for (let k = 0; k < SR * 0.03; k++) add(dry, tk + k, rnd() * Math.exp(-(k / SR) * 200) * 0.12);
}

heart(B.thump1, 0.9);
heart(B.thump2, 1.0);
whoosh(B.pablo, 0.45);
whoosh(B.dred, 0.45);
slam(B.pablo, 0.35);
slam(B.dred, 0.45);
slam(B.impact, 1.0);
slam(B.date, 0.55);

// --- reverb (Schroeder) on the send
const reverb = (input) => {
  const out = new Float32Array(N);
  const combs = [1687, 1601, 2053, 2251].map((d) => ({ d: Math.floor(d * SR / 44100), buf: new Float32Array(Math.floor(d * SR / 44100)), i: 0, lp: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.buf[c.i]; c.lp = y * 0.6 + c.lp * 0.4; c.buf[c.i] = input[n] + c.lp * 0.86; c.i = (c.i + 1) % c.d; s += y; }
    out[n] = s * 0.25;
  }
  for (const d of [225, 556, 441]) {
    const len = Math.floor(d * SR / 44100), buf = new Float32Array(len); let i = 0;
    for (let n = 0; n < N; n++) { const b = buf[i]; const y = -out[n] * 0.5 + b; buf[i] = out[n] + b * 0.5; out[n] = y; i = (i + 1) % len; }
  }
  return out;
};
const rv = reverb(wet);

// --- mix: everything silent by ~8.6 s so the tag's "We are" stop-time lands clean
const L = new Float32Array(N), R = new Float32Array(N), dl = Math.floor(SR * 0.013);
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fade = t > 8.1 ? Math.max(0, (8.65 - t) / 0.55) : 1;
  L[n] = (dry[n] + rv[n] * 0.8) * fade;
  R[n] = (dry[n] + (n >= dl ? rv[n - dl] : 0) * 0.8) * fade;
}
let peak = 0;
for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
const g = 1.35 / peak;
const pcm = Buffer.alloc(44 + N * 4);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVE", 8); pcm.write("fmt ", 12);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  pcm.writeInt16LE(Math.round(Math.tanh(L[n] * g) * 0.89 * 32767), 44 + n * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(R[n] * g) * 0.89 * 32767), 46 + n * 4);
}
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pablo-dred-faceoff", "faceoff-sfx.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pcm);
console.log("wrote", out);
