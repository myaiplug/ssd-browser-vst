import { Spectrum } from "@/components/vst/spectrum";
import { engine } from "@/lib/vst/engine";
import {
  formatAmp,
  formatGain,
  formatHpf,
  formatLpf,
  formatLimiter,
  formatOut,
  formatQ,
  formatSub,
  formatTilt,
  formatTrim,
  slug,
} from "@/lib/vst/format";
import { RECIPES, recipeById } from "@/lib/vst/recipes";
import { loadSession, saveSession, useVst } from "@/lib/vst/store";
import { BANDS, FAMILIES, clamp100, isPatch, type Patch } from "@/lib/vst/types";
import { bufferToWav, downloadBlob } from "@/lib/vst/wav";
import { ChevronDown, ChevronLeft, ChevronRight, FolderOpen, Power, Redo2, Save, Undo2 } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

function clone(patch: Patch): Patch {
  return {
    ...patch,
    gains: patch.gains.slice(),
    qs: patch.qs.slice(),
    solos: patch.solos.slice(),
    mutes: patch.mutes.slice(),
  };
}

function db(text: string) {
  return text === "-inf" ? "-inf" : `${text} dB`;
}

function hz(text: string) {
  return text.includes("k") ? text : `${text} Hz`;
}

function pct(value: number) {
  return `${value.toFixed(1)} %`;
}

function fit(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const pw = Math.floor(w * dpr);
  const ph = Math.floor(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function paintVar(canvas: HTMLCanvasElement, name: string, fallback: string) {
  const value = getComputedStyle(canvas).getPropertyValue(name).trim();
  return value || fallback;
}

function Orb({ live }: { live: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const data = new Float32Array(1024);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let t = 0.4;
    const draw = () => {
      if (!reduce) t += 0.016;
      const box = fit(canvas);
      if (!box) return;
      const { ctx, w, h } = box;
      ctx.clearRect(0, 0, w, h);
      engine.waveform("out", data);
      let energy = 0;
      for (let i = 0; i < data.length; i += 4) energy += data[i] * data[i];
      energy = Math.min(1, Math.sqrt(energy / (data.length / 4)) * 5);
      const sig = paintVar(canvas, "--sig", "#7ad0ff");
      const sig2 = paintVar(canvas, "--sig-2", "#b388ff");
      const n = 140;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) {
        const x = i / (n - 1);
        const env = Math.sin(Math.PI * x);
        const idle =
          Math.sin(x * Math.PI * 2.2 + t * 0.8) * 0.22 +
          Math.sin(x * 54 + t * 3.1) * 0.2 * env +
          Math.exp(-((x - 0.38) ** 2) / 0.004) * 0.55 +
          Math.exp(-((x - 0.62) ** 2) / 0.006) * 0.28;
        const sample = data[Math.floor(x * (data.length - 1))] ?? 0;
        const amp = idle * (1 - energy) + sample * 1.15 * energy;
        pts.push([x * w, (0.52 - amp * 0.34) * h]);
      }
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, sig);
      grad.addColorStop(0.45, "#f4f8ff");
      grad.addColorStop(1, sig2);
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round";
      ctx.shadowColor = sig;
      ctx.shadowBlur = live ? 18 : 12;
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#f7fbff";
      for (let i = 0; i < 6; i++) {
        const x = 0.12 + i * 0.15;
        const env = Math.sin(Math.PI * x);
        const y = 0.52 - (Math.sin(x * Math.PI * 2.2 + t * 0.8) * 0.22 + Math.sin(x * 8) * 0.05) * env;
        ctx.beginPath();
        ctx.arc(x * w, y * h, 3.1, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [live]);
  return <canvas ref={ref} className="orb-canvas" aria-hidden="true" />;
}

function Flow() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let t = 0;
    const draw = () => {
      if (!reduce) t += 0.012;
      const box = fit(canvas);
      if (!box) return;
      const { ctx, w, h } = box;
      const patch = useVst.getState().patch;
      const sig = paintVar(canvas, "--sig", "#7ad0ff");
      ctx.clearRect(0, 0, w, h);
      const amp = 0.16 + (patch.reverb / 100) * 0.2 + (patch.delay / 100) * 0.1;
      const speed = 0.6 + patch.hpf / 180;
      for (let line = 0; line < 7; line++) {
        ctx.beginPath();
        ctx.strokeStyle = line === 3 ? "#f4f8ff" : sig;
        ctx.globalAlpha = line === 3 ? 0.95 : 0.28 + line * 0.06;
        ctx.lineWidth = line === 3 ? 1.7 : 1;
        for (let x = 0; x <= w; x += 3) {
          const u = x / w;
          const y =
            h * 0.52 +
            Math.sin(u * Math.PI * (2.2 + patch.lpf / 90) + t * speed + line * 0.4) * h * amp +
            Math.sin(u * 8 + line) * h * 0.025;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} aria-hidden="true" />;
}

function Bars() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const bins = new Uint8Array(1024);
    let frame = 0;
    const draw = () => {
      const box = fit(canvas);
      if (!box) return;
      const { ctx, w, h } = box;
      const sig = paintVar(canvas, "--sig", "#7ad0ff");
      const sig2 = paintVar(canvas, "--sig-2", "#b388ff");
      ctx.clearRect(0, 0, w, h);
      engine.readSpectrum("out", bins);
      const count = 28;
      const gap = 2;
      const bw = (w - gap * (count - 1)) / count;
      const shape = [0.35, 0.55, 0.42, 0.7, 0.48, 0.86, 0.6, 0.74, 0.4, 0.9, 0.52, 0.66, 0.38, 0.8, 0.58, 0.44, 0.72, 0.5, 0.84, 0.46, 0.63, 0.4, 0.77, 0.55, 0.36, 0.68, 0.5, 0.42];
      for (let i = 0; i < count; i++) {
        const start = Math.floor((i / count) * 220);
        const end = Math.floor(((i + 1) / count) * 220);
        let peak = 0;
        for (let b = start; b < end; b++) if (bins[b] > peak) peak = bins[b];
        const liveMag = peak / 255;
        const mag = liveMag > 0.04 ? liveMag : shape[i];
        const bh = Math.max(3, mag * (h - 8));
        const grad = ctx.createLinearGradient(0, h, 0, h - bh);
        grad.addColorStop(0, sig2);
        grad.addColorStop(0.7, sig);
        grad.addColorStop(1, "#f4f8ff");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.55 + mag * 0.45;
        ctx.fillRect(i * (bw + gap), h - bh, Math.max(1, bw), bh);
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} aria-hidden="true" />;
}

function setNum(key: "amp" | "hpf" | "lpf" | "delay" | "reverb" | "sub" | "flanger" | "output" | "input" | "limiter" | "tilt" | "smooth" | "depth", value: number) {
  const state = useVst.getState();
  state.commit({ ...state.patch, [key]: value });
}

function Steel({
  label,
  value,
  display,
  size = "md",
  tone = "steel",
  reset = 50,
  dim = false,
  inline = false,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  size?: "lg" | "md" | "sm";
  tone?: "steel" | "cyan" | "violet";
  reset?: number;
  dim?: boolean;
  inline?: boolean;
  onChange: (value: number) => void;
}) {
  const drag = useRef<{ y: number; v: number } | null>(null);
  const angle = -135 + (value / 100) * 270;
  const style = { "--p": `${(value / 100) * 75}%` } as CSSProperties;
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const scale = event.shiftKey ? 0.12 : 0.38;
    onChange(clamp100(drag.current.v + (drag.current.y - event.clientY) * scale));
  };
  return (
    <div className={`steel steel-${size} ${inline ? "steel-inline" : ""}`} data-tone={tone} data-dim={dim ? "1" : "0"} style={style}>
      {inline ? null : <div className="steel-label">{label}</div>}
      <div className="steel-face">
        <div className="steel-ring" />
        <button
          type="button"
          className="steel-cap"
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-valuetext={display}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { y: event.clientY, v: value };
          }}
          onPointerMove={move}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onDoubleClick={() => onChange(reset)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 1 : 2;
            if (event.key === "ArrowUp" || event.key === "ArrowRight") {
              event.preventDefault();
              onChange(clamp100(value + step));
            } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
              event.preventDefault();
              onChange(clamp100(value - step));
            }
          }}
        >
          <span className="steel-sheen" />
          <span className="steel-rotor" style={{ transform: `rotate(${angle}deg)` }}>
            <span className="steel-needle" />
          </span>
        </button>
      </div>
      {inline ? (
        <div className="mini-copy">
          <div className="mini-label">{label}</div>
          <div className="steel-read">{display}</div>
        </div>
      ) : (
        <div className="steel-read">{display}</div>
      )}
    </div>
  );
}

function Vfader({
  label,
  value,
  display,
  reset = 50,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  reset?: number;
  onChange: (value: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const fromY = (clientY: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return value;
    return clamp100((1 - (clientY - rect.top) / rect.height) * 100);
  };
  return (
    <div className="vf">
      <span>{label}</span>
      <div
        ref={track}
        className="vf-track"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-valuetext={display}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onChange(fromY(event.clientY));
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          onChange(fromY(event.clientY));
        }}
        onDoubleClick={() => onChange(reset)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 1 : 2;
          if (event.key === "ArrowUp") {
            event.preventDefault();
            onChange(clamp100(value + step));
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            onChange(clamp100(value - step));
          }
        }}
      >
        <b style={{ top: `${100 - value}%` }} />
      </div>
      <span>{display}</span>
    </div>
  );
}

function Rail({
  side,
  label,
  value,
  display,
  onChange,
}: {
  side: "in" | "out";
  label: string;
  value: number;
  display: string;
  onChange: (value: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const level = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const { rms } = engine.level(side);
      if (level.current) level.current.style.height = `${Math.max(0, Math.min(100, rms * 100))}%`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [side]);
  const fromY = (clientY: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return value;
    return clamp100((1 - (clientY - rect.top) / rect.height) * 100);
  };
  return (
    <div className={`rail rail-${side}`}>
      <span className="rail-label">{label}</span>
      <span className="rail-read">{display}</span>
      <div
        ref={track}
        className="rail-track"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-valuetext={display}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onChange(fromY(event.clientY));
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          onChange(fromY(event.clientY));
        }}
        onDoubleClick={() => onChange(50)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 1 : 2;
          if (event.key === "ArrowUp") {
            event.preventDefault();
            onChange(clamp100(value + step));
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            onChange(clamp100(value - step));
          }
        }}
      >
        <div className="rail-leds" />
        <div ref={level} className="rail-level" />
        <div className="rail-cap" style={{ top: `${100 - value}%` }} />
      </div>
    </div>
  );
}

export function Face() {
  const fileRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const past = useRef<Patch[]>([]);
  const future = useRef<Patch[]>([]);
  const lock = useRef(false);
  const gesture = useRef(false);
  const timer = useRef(0);
  const historyApi = useRef({ undo: () => {}, redo: () => {} });
  const [face, setFace] = useState<"dark" | "light">("dark");
  const [over, setOver] = useState(false);
  const [menu, setMenu] = useState(false);
  const [band, setBand] = useState(3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const patch = useVst((s) => s.patch);
  const recipeId = useVst((s) => s.recipeId);
  const edited = useVst((s) => s.edited);
  const status = useVst((s) => s.status);
  const playing = useVst((s) => s.playing);
  const rendering = useVst((s) => s.rendering);

  useEffect(() => {
    const saved = localStorage.getItem("hrw-face");
    const next = saved === "light" ? "light" : "dark";
    document.documentElement.dataset.face = next;
    setFace(next);
  }, []);

  useEffect(() => {
    return useVst.subscribe((state, prev) => {
      if (state.patch === prev.patch || lock.current) return;
      if (!gesture.current) {
        past.current.push(prev.patch);
        if (past.current.length > 60) past.current.shift();
        future.current = [];
        gesture.current = true;
        setCanUndo(true);
        setCanRedo(false);
      }
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        gesture.current = false;
      }, 480);
    });
  }, []);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      useVst.getState().commit(saved.patch, saved.recipeId);
      useVst.getState().setStatus(saved.recipeId ? "Session restored." : "Manual session restored.");
    }
    useVst.getState().markHydrated();
  }, []);

  useEffect(() => {
    if (!useVst.getState().hydrated) return;
    const id = window.setTimeout(() => saveSession(patch, recipeId), 280);
    return () => window.clearTimeout(id);
  }, [patch, recipeId]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);

  function undo() {
    window.clearTimeout(timer.current);
    gesture.current = false;
    const prev = past.current.pop();
    if (!prev || !isPatch(prev)) {
      setCanUndo(past.current.length > 0);
      return;
    }
    lock.current = true;
    future.current.push(useVst.getState().patch);
    useVst.getState().commit(clone(prev));
    lock.current = false;
    setCanUndo(past.current.length > 0);
    setCanRedo(true);
  }

  function redo() {
    window.clearTimeout(timer.current);
    gesture.current = false;
    const next = future.current.pop();
    if (!next || !isPatch(next)) {
      setCanRedo(future.current.length > 0);
      return;
    }
    lock.current = true;
    past.current.push(useVst.getState().patch);
    useVst.getState().commit(clone(next));
    lock.current = false;
    setCanUndo(true);
    setCanRedo(future.current.length > 0);
  }

  historyApi.current.undo = undo;
  historyApi.current.redo = redo;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      event.preventDefault();
      if (event.shiftKey) historyApi.current.redo();
      else historyApi.current.undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleFace() {
    const next = face === "dark" ? "light" : "dark";
    setFace(next);
    document.documentElement.dataset.face = next;
    localStorage.setItem("hrw-face", next);
  }

  function stepRecipe(dir: -1 | 1) {
    const current = useVst.getState().recipeId;
    const index = RECIPES.findIndex((item) => item.id === current);
    const next = index < 0 ? (dir > 0 ? 0 : RECIPES.length - 1) : (index + dir + RECIPES.length) % RECIPES.length;
    useVst.getState().applyRecipe(RECIPES[next].id);
  }

  function setPresence(value: number) {
    const state = useVst.getState();
    const gains = state.patch.gains.slice();
    gains[4] = value;
    gains[5] = value;
    state.commit({ ...state.patch, gains });
  }

  async function engage() {
    const state = useVst.getState();
    try {
      if (state.playing) {
        engine.pause();
        state.setPlaying(false);
        state.setStatus("Paused.");
        return;
      }
      await engine.play();
      useVst.getState().setPlaying(true);
      useVst.getState().setStatus(engine.origin === "file" ? "Processing the loaded file." : "Processing the demo bed.");
    } catch {
      useVst.getState().setStatus("Audio could not start. Try the N button again.");
    }
  }

  async function onFile(file: File) {
    const state = useVst.getState();
    state.setStatus("Reading audio.");
    try {
      const info = await engine.loadFile(file);
      const rate = (info.rate / 1000).toFixed(1);
      useVst.getState().setStatus(`${file.name} · ${info.duration.toFixed(1)} s · ${rate} kHz`);
      if (useVst.getState().playing) useVst.getState().setPlaying(true);
    } catch {
      useVst.getState().setStatus("That file did not decode.");
    }
  }

  async function exportWav(bits: 16 | 24) {
    const state = useVst.getState();
    if (state.rendering) return;
    state.setRendering(true);
    state.setStatus(bits === 24 ? "Rendering 24-bit master." : "Rendering 16-bit master.");
    setMenu(false);
    try {
      const rendered = await engine.render();
      const name = `harmonic-${slug(recipeById(useVst.getState().recipeId)?.name ?? "init")}${bits === 24 ? "-24bit" : ""}.wav`;
      downloadBlob(bufferToWav(rendered, bits), name);
      useVst.getState().setStatus(engine.origin === "file" ? `Exported ${name}.` : `Exported the demo bed as ${name}.`);
      if (useVst.getState().playing) useVst.getState().setPlaying(true);
    } catch {
      useVst.getState().setStatus("Render failed.");
    } finally {
      useVst.getState().setRendering(false);
    }
  }

  const presence = Math.round(((patch.gains[4] ?? 50) + (patch.gains[5] ?? 50)) / 2);
  const lpfText = formatLpf(patch.lpf);

  return (
    <main
      className="stage"
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const file = event.dataTransfer.files?.[0];
        if (file) void onFile(file);
      }}
    >
      <section className="warp" data-over={over ? "1" : "0"}>
        <header className="warp-bar">
          <div className="warp-id">
            <div className="warp-brand">
              <strong>NoDAW</strong>
              <small>Labs</small>
            </div>
            <span className="hair" />
            <h1 className="warp-title">
              <span>Harmonic</span> RealityWarp
            </h1>
          </div>
          <div className="preset-nav">
            <button type="button" className="step-btn" aria-label="Previous recipe" onClick={() => stepRecipe(-1)}>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="preset-pill" data-edited={edited ? "1" : "0"}>
              <select
                aria-label="Space recipe"
                value={recipeId ?? ""}
                onChange={(event) => {
                  const id = event.target.value;
                  if (!id) useVst.getState().reset();
                  else useVst.getState().applyRecipe(id);
                }}
              >
                <option value="">Init</option>
                {FAMILIES.map((family) => (
                  <optgroup key={family} label={family}>
                    {RECIPES.filter((item) => item.family === family).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="preset-caret" size={14} aria-hidden="true" />
            </div>
            <button type="button" className="step-btn" aria-label="Next recipe" onClick={() => stepRecipe(1)}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="bar-tools">
            <span className="hair" />
            <div className="tool-pop" ref={popRef}>
              <button
                type="button"
                className="icon-btn"
                aria-label="Export WAV"
                aria-expanded={menu}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenu((open) => !open);
                }}
              >
                <Save size={16} aria-hidden="true" />
              </button>
              {menu ? (
                <div className="export-pop" onClick={(event) => event.stopPropagation()}>
                  <button type="button" disabled={rendering} onClick={() => void exportWav(16)}>
                    16-bit WAV
                  </button>
                  <button type="button" disabled={rendering} onClick={() => void exportWav(24)}>
                    24-bit WAV
                  </button>
                </div>
              ) : null}
            </div>
            <button type="button" className="icon-btn" aria-label="Load audio" onClick={() => fileRef.current?.click()}>
              <FolderOpen size={16} aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" aria-label="Undo" disabled={!canUndo} onClick={undo}>
              <Undo2 size={16} aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" aria-label="Redo" disabled={!canRedo} onClick={redo}>
              <Redo2 size={16} aria-hidden="true" />
            </button>
            <span className="hair" />
            <button type="button" className="light-toggle" aria-pressed={face === "light"} onClick={toggleFace}>
              Light
              <span className="toggle-track" aria-hidden="true">
                <span className="toggle-knob" />
              </span>
            </button>
          </div>
        </header>
        <p className="live" aria-live="polite">
          {status}
        </p>
        <div className="hero">
          <div className="rail-in">
            <Rail side="in" label="Input" value={patch.input} display={db(formatTrim(patch.input))} onChange={(value) => setNum("input", value)} />
          </div>
          <div className="well well-l">
            <Steel label="Drive" size="lg" tone="cyan" value={patch.amp} display={db(formatAmp(patch.amp))} reset={31} onChange={(value) => setNum("amp", value)} />
            <div className="pair">
              <Steel
                label="Character"
                value={patch.flanger}
                display={pct(patch.flanger)}
                reset={0}
                dim={!patch.harmOn}
                onChange={(value) => setNum("flanger", value)}
              />
              <Steel label="Presence" value={presence} display={pct(presence)} onChange={setPresence} />
            </div>
          </div>
          <div className="orb-wrap" data-on={playing ? "1" : "0"}>
            <div className="orb">
              <Orb live={playing} />
              <span className="orb-glass" />
            </div>
            <button type="button" className="n-badge" data-engage data-on={playing ? "1" : "0"} aria-pressed={playing} onClick={() => void engage()}>
              N
            </button>
          </div>
          <div className="well well-r">
            <Steel
              label="Warp"
              size="lg"
              tone="violet"
              value={patch.reverb}
              display={pct((patch.reverb / 150) * 100)}
              reset={0}
              dim={!patch.spaceOn}
              onChange={(value) => setNum("reverb", value)}
            />
            <div className="pair">
              <Steel
                label="Mix"
                value={patch.delay}
                display={pct(patch.delay)}
                reset={0}
                dim={!patch.spaceOn}
                onChange={(value) => setNum("delay", value)}
              />
              <Steel label="Limiter" value={patch.limiter} display={db(formatLimiter(patch.limiter))} reset={0} onChange={(value) => setNum("limiter", value)} />
            </div>
          </div>
          <div className="rail-out">
            <Rail side="out" label="Output" value={patch.output} display={db(formatOut(patch.output))} onChange={(value) => setNum("output", value)} />
          </div>
        </div>
        <div className="bays">
          <article className="bay" data-on={patch.bypass ? "0" : "1"}>
            <div className="bay-head">
              <button type="button" className="power" data-on={patch.bypass ? "0" : "1"} aria-pressed={!patch.bypass} aria-label="Spectral shaping power" onClick={() => useVst.getState().toggleBypass()}>
                <Power size={15} aria-hidden="true" />
              </button>
              <span className="bay-label">Spectral Shaping</span>
            </div>
            <div className="bay-body spec">
              <div className="screen">
                <Spectrum className="h-full w-full touch-none" onPick={setBand} />
              </div>
              <div className="v-faders">
                <Vfader label="Tilt" value={patch.tilt} display={db(formatTilt(patch.tilt))} onChange={(value) => setNum("tilt", value)} />
                <Vfader label="Smooth" value={patch.smooth} display={pct(patch.smooth)} reset={0} onChange={(value) => setNum("smooth", value)} />
                <Vfader label="Depth" value={patch.depth} display={pct(patch.depth)} onChange={(value) => setNum("depth", value)} />
              </div>
              <div className="band-row">
                {BANDS.map((item, index) => (
                  <button
                    key={item.hz}
                    type="button"
                    className="band-pick"
                    data-on={index === band ? "1" : "0"}
                    data-solo={patch.solos[index] ? "1" : "0"}
                    data-mute={patch.mutes[index] ? "1" : "0"}
                    aria-pressed={index === band}
                    onClick={() => setBand(index)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </article>
          <article className="bay" data-on={patch.spaceOn ? "1" : "0"}>
            <div className="bay-head">
              <button
                type="button"
                className="power"
                data-on={patch.spaceOn ? "1" : "0"}
                aria-pressed={patch.spaceOn}
                aria-label="Temporal flow power"
                onClick={() => {
                  const state = useVst.getState();
                  const spaceOn = !state.patch.spaceOn;
                  state.commit({ ...state.patch, spaceOn });
                  state.setStatus(spaceOn ? "Temporal flow is in. Delay and hall return." : "Temporal flow bypassed. Delay and hall are muted.");
                }}
              >
                <Power size={15} aria-hidden="true" />
              </button>
              <span className="bay-label">Temporal Flow</span>
            </div>
            <div className="bay-body stack">
              <div className="screen">
                <Flow />
              </div>
              <div className="bay-knobs">
                <Steel inline size="sm" label="HPF" value={patch.hpf} display={hz(formatHpf(patch.hpf))} reset={0} onChange={(value) => setNum("hpf", value)} />
                <Steel inline size="sm" label="LPF" value={patch.lpf} display={hz(lpfText)} reset={100} onChange={(value) => setNum("lpf", value)} />
                <Steel inline size="sm" label="Sub" value={patch.sub} display={db(formatSub(patch.sub))} reset={0} dim={!patch.harmOn} onChange={(value) => setNum("sub", value)} />
              </div>
            </div>
          </article>
          <article className="bay" data-on={patch.harmOn ? "1" : "0"}>
            <div className="bay-head">
              <button
                type="button"
                className="power"
                data-on={patch.harmOn ? "1" : "0"}
                aria-pressed={patch.harmOn}
                aria-label="Harmonic engine power"
                onClick={() => {
                  const state = useVst.getState();
                  const harmOn = !state.patch.harmOn;
                  state.commit({ ...state.patch, harmOn });
                  state.setStatus(harmOn ? "Harmonic engine is in. Sub and character return." : "Harmonic engine bypassed. Sub and character are muted.");
                }}
              >
                <Power size={15} aria-hidden="true" />
              </button>
              <span className="bay-label">Harmonic Engine</span>
            </div>
            <div className="bay-body">
              <div className="screen">
                <Bars />
              </div>
              <div className="mini-stack">
                <Steel
                  inline
                  size="sm"
                  label="Band"
                  value={Math.round((band / 6) * 100)}
                  display={BANDS[band].label}
                  onChange={(value) => setBand(Math.max(0, Math.min(6, Math.round((value / 100) * 6))))}
                />
                <Steel
                  inline
                  size="sm"
                  label="Gain"
                  value={patch.gains[band] ?? 50}
                  display={db(formatGain(patch.gains[band] ?? 50))}
                  onChange={(value) => useVst.getState().setGain(band, value)}
                />
                <Steel
                  inline
                  size="sm"
                  label="Q"
                  value={patch.qs[band] ?? 50}
                  display={formatQ(patch.qs[band] ?? 50)}
                  reset={7}
                  onChange={(value) => useVst.getState().setQ(band, value)}
                />
                <div className="flag-row">
                  <button
                    type="button"
                    className="flag"
                    data-on={patch.solos[band] ? "1" : "0"}
                    aria-pressed={patch.solos[band]}
                    onClick={() => useVst.getState().toggleSolo(band)}
                  >
                    Solo
                  </button>
                  <button
                    type="button"
                    className="flag"
                    data-on={patch.mutes[band] ? "1" : "0"}
                    aria-pressed={patch.mutes[band]}
                    onClick={() => useVst.getState().toggleMute(band)}
                  >
                    Mute
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <footer className="warp-foot">
          <span className="foot-note">NoDAW Labs · Advanced Audio Processing</span>
          <span className="foot-mid">
            <svg className="pulse" viewBox="0 0 64 16" aria-hidden="true">
              <path d="M0 8 H16 L22 8 L26 3 L32 13 L38 8 H46 L50 6 L54 8 H64" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="mark">Sound without limits</span>
          </span>
          <span className="ver">
            v2.0.0 <i className="led" data-on={playing ? "1" : "0"} />
          </span>
        </footer>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*,video/mp4,video/quicktime,video/webm,.wav,.mp3,.m4a,.aac,.flac,.aif,.aiff,.ogg,.opus,.caf"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onFile(file);
            event.target.value = "";
          }}
        />
      </section>
    </main>
  );
}
