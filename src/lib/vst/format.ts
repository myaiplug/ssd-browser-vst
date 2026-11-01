function signed(db: number, digits = 1) {
  if (!Number.isFinite(db)) return "-inf";
  if (Math.abs(db) < 0.05) return (0).toFixed(digits);
  const sign = db > 0 ? "+" : "";
  return `${sign}${db.toFixed(digits)}`;
}

export function ampGain(v: number) {
  return 0.1 + (v / 100) * 2.9;
}

export function outputGain(v: number) {
  return (v / 50) * (v / 50);
}

export function hpfHz(v: number) {
  return 20 + v * 4.8;
}

export function lpfHz(v: number) {
  return 2000 + v * 200;
}

export function delaySeconds(v: number) {
  return 0.1 + (v / 100) * 0.9;
}

export function gainDb(v: number) {
  return (v - 50) * 0.24;
}

export function qFactor(v: number) {
  return 0.3 + (v / 100) * 9.7;
}

export function formatAmp(v: number) {
  return signed(20 * Math.log10(ampGain(v)));
}

export function formatHpf(v: number) {
  return `${Math.round(hpfHz(v))}`;
}

export function formatLpf(v: number) {
  const hz = lpfHz(v);
  return hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${Math.round(hz)}`;
}

export function formatDelay(v: number) {
  if (v <= 0) return "0";
  return `${Math.round(delaySeconds(v) * 1000)}`;
}

export function formatReverb(v: number) {
  return `${Math.round((v / 150) * 100)}`;
}

export function formatSub(v: number) {
  return signed(v / 10);
}

export function formatFlanger(v: number) {
  if (v <= 0) return "Off";
  return (0.2 + (v / 100) * 2).toFixed(2);
}

export function formatOut(v: number) {
  const g = outputGain(v);
  if (g <= 0.0001) return "-inf";
  return signed(20 * Math.log10(g));
}

export function formatGain(v: number) {
  return signed(gainDb(v));
}

export function formatQ(v: number) {
  return qFactor(v).toFixed(1);
}

export function formatTrim(v: number) {
  return signed((v - 50) * 0.24);
}

export function formatLimiter(v: number) {
  if (v <= 0) return "0.0";
  return signed(-(v / 100) * 24);
}

export function formatPct(v: number) {
  return v.toFixed(1);
}

export function formatTilt(v: number) {
  return signed(((v - 50) / 50) * 6);
}

export function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
