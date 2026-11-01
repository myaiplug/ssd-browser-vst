import { ampGain, gainDb, hpfHz, lpfHz, outputGain, qFactor } from "@/lib/vst/format";
import { BANDS, type Patch } from "@/lib/vst/types";

type Coefs = { b0: number; b1: number; b2: number; a1: number; a2: number };

function mag(c: Coefs, w: number) {
  const c1 = Math.cos(w);
  const s1 = Math.sin(w);
  const c2 = Math.cos(2 * w);
  const s2 = Math.sin(2 * w);
  const nr = c.b0 + c.b1 * c1 + c.b2 * c2;
  const ni = -c.b1 * s1 - c.b2 * s2;
  const dr = 1 + c.a1 * c1 + c.a2 * c2;
  const di = -c.a1 * s1 - c.a2 * s2;
  const den = dr * dr + di * di;
  if (den <= 1e-12) return 0;
  return Math.sqrt((nr * nr + ni * ni) / den);
}

function normalize(b0: number, b1: number, b2: number, a0: number, a1: number, a2: number): Coefs {
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

function peaking(f0: number, q: number, db: number, sr: number): Coefs {
  const A = Math.pow(10, db / 40);
  const w0 = (2 * Math.PI * f0) / sr;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Math.max(0.05, q));
  return normalize(1 + alpha * A, -2 * cos, 1 - alpha * A, 1 + alpha / A, -2 * cos, 1 - alpha / A);
}

function shelf(kind: "low" | "high", f0: number, db: number, sr: number): Coefs {
  const A = Math.pow(10, db / 40);
  const w0 = (2 * Math.PI * f0) / sr;
  const cos = Math.cos(w0);
  const S = 1;
  const alpha = (Math.sin(w0) / 2) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
  const two = 2 * Math.sqrt(A) * alpha;
  const ap = A + 1;
  const am = A - 1;
  if (kind === "low") {
    return normalize(
      A * (ap - am * cos + two),
      2 * A * (am - ap * cos),
      A * (ap - am * cos - two),
      ap + am * cos + two,
      -2 * (am + ap * cos),
      ap + am * cos - two,
    );
  }
  return normalize(
    A * (ap + am * cos + two),
    -2 * A * (am + ap * cos),
    A * (ap + am * cos - two),
    ap - am * cos + two,
    2 * (am - ap * cos),
    ap - am * cos - two,
  );
}

function pass(kind: "low" | "high", f0: number, sr: number): Coefs {
  const w0 = (2 * Math.PI * Math.min(f0, sr / 2 - 20)) / sr;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * 0.707);
  if (kind === "low") {
    const b0 = (1 - cos) / 2;
    return normalize(b0, 1 - cos, b0, 1 + alpha, -2 * cos, 1 - alpha);
  }
  const b0 = (1 + cos) / 2;
  return normalize(b0, -(1 + cos), b0, 1 + alpha, -2 * cos, 1 - alpha);
}

export function shapedBand(patch: Patch, index: number) {
  const depth = (patch.depth ?? 50) / 50;
  const tilt = ((patch.tilt ?? 50) - 50) / 50;
  const weight = (index / 6) * 2 - 1;
  let db = gainDb(patch.gains[index]) * depth + tilt * weight * 6;
  const anySolo = patch.solos.some(Boolean);
  if (patch.bypass) db = 0;
  else if (patch.mutes[index] || (anySolo && !patch.solos[index])) db = -60;
  const smooth = (patch.smooth ?? 0) / 100;
  const q = qFactor(patch.qs[index]) * (1 - smooth) + 0.7 * smooth;
  return { db, q };
}

export function responseDb(patch: Patch, freq: number, sampleRate: number) {
  const sr = sampleRate;
  const w = (2 * Math.PI * freq) / sr;
  let db = 20 * Math.log10(Math.max(1e-6, ampGain(patch.amp) * outputGain(patch.output)));
  for (let i = 0; i < BANDS.length; i++) {
    const band = BANDS[i];
    const shaped = shapedBand(patch, i);
    const coef =
      band.type === "lowshelf"
        ? shelf("low", band.hz, shaped.db, sr)
        : band.type === "highshelf"
          ? shelf("high", band.hz, shaped.db, sr)
          : peaking(band.hz, shaped.q, shaped.db, sr);
    db += 20 * Math.log10(Math.max(1e-8, mag(coef, w)));
  }
  if (patch.sub > 0) db += 20 * Math.log10(Math.max(1e-8, mag(shelf("low", 80, patch.sub / 10, sr), w)));
  db += 20 * Math.log10(Math.max(1e-8, mag(pass("high", hpfHz(patch.hpf), sr), w)));
  db += 20 * Math.log10(Math.max(1e-8, mag(pass("low", lpfHz(patch.lpf), sr), w)));
  return db;
}

export function storedBandDb(patch: Patch, index: number) {
  return gainDb(patch.gains[index]);
}
