import { recipeById } from "@/lib/vst/recipes";
import { engine } from "@/lib/vst/engine";
import { NEUTRAL, clamp100, isPatch, patchFromRecipe, sameRecipe, type Patch } from "@/lib/vst/types";
import { create } from "zustand";

const KEY = "spectral-space-v1";

type VstState = {
  patch: Patch;
  recipeId: string | null;
  edited: boolean;
  status: string;
  playing: boolean;
  rendering: boolean;
  hint: string;
  hydrated: boolean;
  commit: (patch: Patch, recipeId?: string | null) => void;
  applyRecipe: (id: string) => void;
  reset: () => void;
  setGain: (index: number, value: number) => void;
  setQ: (index: number, value: number) => void;
  toggleSolo: (index: number) => void;
  toggleMute: (index: number) => void;
  toggleBypass: () => void;
  setPlaying: (playing: boolean) => void;
  setRendering: (rendering: boolean) => void;
  setStatus: (status: string) => void;
  setHint: (hint: string) => void;
  markHydrated: () => void;
};

function numbers(patch: Patch): Patch {
  return {
    ...patch,
    amp: clamp100(patch.amp),
    hpf: clamp100(patch.hpf),
    lpf: clamp100(patch.lpf),
    delay: clamp100(patch.delay),
    reverb: clamp100(patch.reverb),
    sub: clamp100(patch.sub),
    flanger: clamp100(patch.flanger),
    output: clamp100(patch.output),
    input: clamp100(patch.input ?? 50),
    limiter: clamp100(patch.limiter ?? 0),
    tilt: clamp100(patch.tilt ?? 50),
    smooth: clamp100(patch.smooth ?? 0),
    depth: clamp100(patch.depth ?? 50),
    spaceOn: patch.spaceOn !== false,
    harmOn: patch.harmOn !== false,
    gains: patch.gains.map(clamp100),
    qs: patch.qs.map(clamp100),
  };
}

function meta(patch: Patch, recipeId: string | null) {
  const recipe = recipeById(recipeId);
  return {
    patch,
    recipeId,
    edited: recipe ? !sameRecipe(patch, recipe) : false,
  };
}

export const useVst = create<VstState>((set, get) => ({
  patch: NEUTRAL,
  recipeId: null,
  edited: false,
  status: "Demo bed ready. Load a file when you want a master.",
  playing: false,
  rendering: false,
  hint: "Drag a node on the curve. Up is gain, sideways is width.",
  hydrated: false,
  commit: (patch, recipeId) => {
    const next = numbers(patch);
    const id = recipeId === undefined ? get().recipeId : recipeId;
    engine.setPatch(next);
    set(meta(next, id));
  },
  applyRecipe: (id) => {
    const recipe = recipeById(id);
    if (!recipe) return;
    const patch = patchFromRecipe(recipe);
    engine.setPatch(patch);
    set({
      ...meta(patch, id),
      status: `${recipe.name} · ${recipe.family}`,
      hint: recipe.description,
    });
  },
  reset: () => {
    const patch = {
      ...NEUTRAL,
      gains: NEUTRAL.gains.slice(),
      qs: NEUTRAL.qs.slice(),
      solos: NEUTRAL.solos.slice(),
      mutes: NEUTRAL.mutes.slice(),
    };
    engine.setPatch(patch);
    set({
      patch,
      recipeId: null,
      edited: false,
      status: "Init. Filters open from the factory marks.",
      hint: "Pick a space recipe, or twist from here.",
    });
  },
  setGain: (index, value) => {
    const gains = get().patch.gains.slice();
    gains[index] = value;
    get().commit({ ...get().patch, gains });
  },
  setQ: (index, value) => {
    const qs = get().patch.qs.slice();
    qs[index] = value;
    get().commit({ ...get().patch, qs });
  },
  toggleSolo: (index) => {
    const solos = get().patch.solos.slice();
    solos[index] = !solos[index];
    get().commit({ ...get().patch, solos });
  },
  toggleMute: (index) => {
    const mutes = get().patch.mutes.slice();
    mutes[index] = !mutes[index];
    get().commit({ ...get().patch, mutes });
  },
  toggleBypass: () => {
    const patch = { ...get().patch, bypass: !get().patch.bypass };
    get().commit(patch);
    set({
      status: patch.bypass
        ? "EQ bypass. Filters, space, and level stay in."
        : "EQ back in the chain.",
    });
  },
  setPlaying: (playing) => set({ playing }),
  setRendering: (rendering) => set({ rendering }),
  setStatus: (status) => set({ status }),
  setHint: (hint) => set({ hint }),
  markHydrated: () => set({ hydrated: true }),
}));

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { patch?: unknown; recipeId?: unknown };
    if (!isPatch(data.patch)) return null;
    const patch = {
      ...NEUTRAL,
      ...data.patch,
      gains: data.patch.gains.slice(),
      qs: data.patch.qs.slice(),
      solos: data.patch.solos.slice(),
      mutes: data.patch.mutes.slice(),
      input: data.patch.input ?? 50,
      limiter: data.patch.limiter ?? 0,
      tilt: data.patch.tilt ?? 50,
      smooth: data.patch.smooth ?? 0,
      depth: data.patch.depth ?? 50,
      spaceOn: data.patch.spaceOn !== false,
      harmOn: data.patch.harmOn !== false,
    };
    const recipeId = typeof data.recipeId === "string" ? data.recipeId : null;
    return { patch, recipeId: recipeById(recipeId) ? recipeId : null };
  } catch {
    return null;
  }
}

export function saveSession(patch: Patch, recipeId: string | null) {
  localStorage.setItem(KEY, JSON.stringify({ patch, recipeId }));
}
