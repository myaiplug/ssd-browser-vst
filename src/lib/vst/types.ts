export const BANDS = [
  { hz: 60, label: "60", type: "lowshelf" as const },
  { hz: 200, label: "200", type: "peaking" as const },
  { hz: 800, label: "800", type: "peaking" as const },
  { hz: 2000, label: "2k", type: "peaking" as const },
  { hz: 4000, label: "4k", type: "peaking" as const },
  { hz: 8000, label: "8k", type: "peaking" as const },
  { hz: 16000, label: "16k", type: "highshelf" as const },
];

export type Patch = {
  amp: number;
  hpf: number;
  lpf: number;
  delay: number;
  reverb: number;
  sub: number;
  flanger: number;
  output: number;
  input: number;
  limiter: number;
  tilt: number;
  smooth: number;
  depth: number;
  spaceOn: boolean;
  harmOn: boolean;
  gains: number[];
  qs: number[];
  solos: boolean[];
  mutes: boolean[];
  bypass: boolean;
};

export type Family = "Vocals" | "Low end" | "Space" | "Character" | "Fix-it";

export type Recipe = {
  id: string;
  name: string;
  family: Family;
  description: string;
  amp: number;
  hpf: number;
  lpf: number;
  delay: number;
  reverb: number;
  sub: number;
  flanger: number;
  output: number;
  eqGain: number[];
  eqQ: number[];
};

export const FAMILIES: Family[] = ["Vocals", "Low end", "Space", "Character", "Fix-it"];

const zeros = () => [false, false, false, false, false, false, false];
const fifties = () => [50, 50, 50, 50, 50, 50, 50];

export const NEUTRAL: Patch = {
  amp: 50,
  hpf: 75,
  lpf: 19,
  delay: 0,
  reverb: 0,
  sub: 0,
  flanger: 0,
  output: 50,
  input: 50,
  limiter: 0,
  tilt: 50,
  smooth: 0,
  depth: 50,
  spaceOn: true,
  harmOn: true,
  gains: fifties(),
  qs: fifties(),
  solos: zeros(),
  mutes: zeros(),
  bypass: false,
};

export function clamp100(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function patchFromRecipe(recipe: Recipe): Patch {
  return {
    amp: recipe.amp,
    hpf: recipe.hpf,
    lpf: recipe.lpf,
    delay: recipe.delay,
    reverb: recipe.reverb,
    sub: recipe.sub,
    flanger: recipe.flanger,
    output: recipe.output,
    input: 50,
    limiter: 0,
    tilt: 50,
    smooth: 0,
    depth: 50,
    spaceOn: true,
    harmOn: true,
    gains: recipe.eqGain.slice(),
    qs: recipe.eqQ.slice(),
    solos: zeros(),
    mutes: zeros(),
    bypass: false,
  };
}

export function sameRecipe(patch: Patch, recipe: Recipe) {
  const nums = [
    patch.amp === recipe.amp,
    patch.hpf === recipe.hpf,
    patch.lpf === recipe.lpf,
    patch.delay === recipe.delay,
    patch.reverb === recipe.reverb,
    patch.sub === recipe.sub,
    patch.flanger === recipe.flanger,
    patch.output === recipe.output,
    patch.gains.every((g, i) => g === recipe.eqGain[i]),
    patch.qs.every((q, i) => q === recipe.eqQ[i]),
    (patch.input ?? 50) === 50,
    (patch.limiter ?? 0) === 0,
    (patch.tilt ?? 50) === 50,
    (patch.smooth ?? 0) === 0,
    (patch.depth ?? 50) === 50,
    patch.spaceOn !== false,
    patch.harmOn !== false,
  ];
  return nums.every(Boolean) && !patch.bypass && patch.solos.every((s) => !s) && patch.mutes.every((m) => !m);
}

export function isPatch(value: unknown): value is Patch {
  if (!value || typeof value !== "object") return false;
  const v = value as Patch;
  return (
    Array.isArray(v.gains) &&
    v.gains.length === 7 &&
    Array.isArray(v.qs) &&
    v.qs.length === 7 &&
    Array.isArray(v.solos) &&
    Array.isArray(v.mutes) &&
    typeof v.amp === "number" &&
    typeof v.bypass === "boolean"
  );
}
