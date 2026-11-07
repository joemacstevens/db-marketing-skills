#!/usr/bin/env node
// Synthesizes the Pablo vs Dread countdown sound bed (no samples, no licensed music).
// Beat times match src/pablo-dread/timing.ts.
//   node scripts/pablo-dread-sfx.mjs  -> public/pablo-dread-countdown/countdown-sfx.wav
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const DUR = 8;
const N = SR * DUR;
const B = {
  heart1: 0.35, heart2: 0.85, pablo: 1.4, dread: 2.5,
  riserStart: 2.6, vs: 3.6, days: 4.7, who: 5.8,
};

const dry = new Float32Array(N);
const wet = new Float32Array(N); // sent to reverb
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (buf, i, v) => { if (i >= 0 && i < N) buf[i] += v; };

// --- drone: low E cluster with slow beating, swells into the hits, fades on tail
{
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env =
      Math.min(1, t / 1.0) *
      (t > 6.4 ? Math.max(0, 1 - (t - 6.4) / 1.6) : 1) *
      (0.75 + 0.25 * Math.min(1, Math.max(0, (t - B.riserStart) / 1.0)) * (t < B.vs ? 1 : 0.6));
    let v =
      Math.sin(2 * Math.PI * 41.2 * t) * 0.5 +
      Math.sin(2 * Math.PI * 41.7 * t) * 0.35 +
      Math.sin(2 * Math.PI * 82.4 * t + Math.sin(t * 0.7)) * 0.18 +
      Math.sin(2 * Math.PI * 87.3 * t) * 0.07; // minor-second rub = unease
    lp += 0.02 * (rnd() - lp); // rumble
    v += lp * 2.2;
    add(dry, i, v * env * 0.32);
    add(wet, i, v * env * 0.05);
  }
}

// --- heartbeat thud
const thud = (t0, gain) => {
  const s0 = Math.floor(t0 * SR);
  let ph = 0;
  for (let k = 0; k < SR * 0.45; k++) {
    const t = k / SR;
    const freq = 38 + 34 * Math.exp(-t * 18);
    ph += (2 * Math.PI * freq) / SR;
    const env = Math.exp(-t * 9) * Math.min(1, t * 400);
    const v = Math.tanh(Math.sin(ph) * 2.2) * env * gain;
    add(dry, s0 + k, v);
    add(wet, s0 + k, v * 0.15);
    // softer second beat ("dub") 150ms later
  }
  for (let k = 0; k < SR * 0.35; k++) {
    const t = k / SR;
    const env = Math.exp(-t * 12) * Math.min(1, t * 400);
    add(dry, s0 + Math.floor(SR * 0.16) + k, Math.sin(2 * Math.PI * 44 * t) * env * gain * 0.55);
  }
};

// --- boom: sub drop + noise crack + low braam, with reverb send
const boom = (t0, size) => {
  const s0 = Math.floor(t0 * SR);
  const len = Math.floor(SR * (1.6 + size * 1.2));
  let ph = 0, n1 = 0, n2 = 0;
  const braamF = [55, 82.4, 110, 164.8];
  const bph = braamF.map(() => 0);
  let blp = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    // sub sweep
    const freq = 30 + (95 + 40 * size) * Math.exp(-t * 9);
    ph += (2 * Math.PI * freq) / SR;
    const subEnv = Math.exp(-t * (2.6 - size * 0.9)) * Math.min(1, t * 900);
    let v = Math.tanh(Math.sin(ph) * (2 + size * 1.5)) * subEnv * (0.9 + size * 0.2);
    // crack: lowpassed noise burst
    const r = rnd();
    n1 += 0.35 * (r - n1);
    n2 += 0.08 * (r - n2);
    v += (n1 * 0.9 + n2 * 1.6) * Math.exp(-t * 22) * (0.7 + size * 0.5);
    // braam (saw-ish cluster) only for the bigger hits
    if (size > 0.4) {
      let br = 0;
      braamF.forEach((bf, j) => {
        bph[j] += (bf * (1 - 0.03 * Math.exp(-t * 3))) / SR;
        br += ((bph[j] % 1) * 2 - 1) / (j + 1);
      });
      blp += (0.04 + 0.12 * Math.exp(-t * 2)) * (br - blp);
      v += blp * Math.exp(-t * (1.4 - size * 0.5)) * Math.min(1, t * 200) * 0.55 * size;
    }
    add(dry, s0 + k, v * 0.85);
    add(wet, s0 + k, v * (0.35 + size * 0.25));
  }
};

// --- riser: noise sweep + rising tone + accelerating ticks, cut just before VS
{
  const s0 = Math.floor(B.riserStart * SR);
  const s1 = Math.floor((B.vs - 0.03) * SR);
  let lp = 0, ph = 0, hp = 0, prev = 0;
  for (let i = s0; i < s1; i++) {
    const p = (i - s0) / (s1 - s0); // 0..1
    const r = rnd();
    const cut = 0.01 + 0.5 * p * p;
    lp += cut * (r - lp);
    hp = 0.95 * (hp + lp - prev); prev = lp;
    const f0 = 180 * Math.pow(5, p);
    ph += (2 * Math.PI * f0 * (1 + 0.02 * Math.sin(i / SR * 2 * Math.PI * (4 + 18 * p)))) / SR;
    const env = Math.pow(p, 1.6);
    const v = (hp * 1.4 + Math.sin(ph) * 0.22 + Math.sin(ph * 1.5) * 0.1) * env;
    add(dry, i, v * 0.7);
    add(wet, i, v * 0.35);
  }
  // accelerating ticks
  let t = B.riserStart;
  let gap = 0.16;
  while (t < B.vs - 0.05) {
    const st = Math.floor(t * SR);
    const p = (t - B.riserStart) / (B.vs - B.riserStart);
    for (let k = 0; k < SR * 0.04; k++) {
      add(dry, st + k, rnd() * Math.exp(-(k / SR) * 120) * (0.15 + 0.35 * p));
    }
    t += gap;
    gap = Math.max(0.045, gap * 0.82);
  }
}

// --- reverse swell into VS (pre-hit suck)
{
  const s1 = Math.floor(B.vs * SR);
  const len = Math.floor(SR * 0.45);
  let lp = 0;
  for (let k = 0; k < len; k++) {
    const p = k / len;
    lp += (0.05 + 0.3 * p) * (rnd() - lp);
    add(dry, s1 - len + k, lp * Math.pow(p, 3) * 0.9);
  }
}

// --- shimmer for the "WHO'S FIGHTING WHO?" reveal
{
  const s0 = Math.floor(B.who * SR);
  const len = Math.floor(SR * 2.1);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const env = Math.min(1, t * 30) * Math.exp(-t * 1.6);
    const v =
      (Math.sin(2 * Math.PI * 659.3 * t) * 0.5 +
        Math.sin(2 * Math.PI * 987.8 * t) * 0.3 +
        Math.sin(2 * Math.PI * 1318.5 * t + Math.sin(t * 40) * 0.4) * 0.2) * env * 0.12;
    add(dry, s0 + k, v);
    add(wet, s0 + k, v * 1.2);
  }
}

thud(B.heart1, 0.85);
thud(B.heart2, 0.95);
boom(B.pablo, 0.3);
boom(B.dread, 0.38);
boom(B.vs, 1.0);
boom(B.days, 0.5);
boom(B.who, 0.15);

// --- Schroeder reverb on the send
const reverb = (input) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d: Math.floor(d * SR / 44100), buf: new Float32Array(Math.floor(d * SR / 44100)), i: 0, lp: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.7 + c.lp * 0.3;
      c.buf[c.i] = input[n] + c.lp * 0.84;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    out[n] = s * 0.25;
  }
  for (const d of [225, 556]) {
    const len = Math.floor(d * SR / 44100);
    const buf = new Float32Array(len);
    let i = 0;
    for (let n = 0; n < N; n++) {
      const b = buf[i];
      const y = -out[n] * 0.5 + b;
      buf[i] = out[n] + b * 0.5;
      out[n] = y;
      i = (i + 1) % len;
    }
  }
  return out;
};
const rv = reverb(wet);

// --- mix, stereo widen the reverb, master fade + soft clip
const L = new Float32Array(N), R = new Float32Array(N);
const delay = Math.floor(SR * 0.011);
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fade = t > DUR - 1.4 ? Math.max(0, (DUR - t) / 1.4) : 1;
  const r2 = n >= delay ? rv[n - delay] : 0;
  L[n] = (dry[n] + rv[n] * 0.9) * fade;
  R[n] = (dry[n] + r2 * 0.9) * fade;
}
let peak = 0;
for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
const g = 1.25 / peak;
const pcm = Buffer.alloc(44 + N * 4);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write("WAVE", 8);
pcm.write("fmt ", 12); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write("data", 36); pcm.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  const l = Math.tanh(L[n] * g) * 0.89;
  const r = Math.tanh(R[n] * g) * 0.89;
  pcm.writeInt16LE(Math.round(l * 32767), 44 + n * 4);
  pcm.writeInt16LE(Math.round(r * 32767), 46 + n * 4);
}
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "public", "pablo-dread-countdown", "countdown-sfx.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pcm);
console.log("wrote", out);
