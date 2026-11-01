import { responseDb, storedBandDb } from "@/lib/vst/curve";
import { engine } from "@/lib/vst/engine";
import { useVst } from "@/lib/vst/store";
import { BANDS, clamp100 } from "@/lib/vst/types";
import { useEffect, useRef } from "react";

const MIN_F = 20;
const MAX_F = 20000;

function xOf(freq: number, width: number) {
  const t = Math.log(freq / MIN_F) / Math.log(MAX_F / MIN_F);
  return Math.min(width, Math.max(0, t * width));
}

function yOfDb(db: number, height: number) {
  const clamped = Math.max(-18, Math.min(18, db));
  const t = (clamped + 18) / 36;
  return (1 - t) * (height - 16) + 8;
}

function dbOfY(y: number, height: number) {
  const t = 1 - (y - 8) / (height - 16);
  return -18 + Math.max(0, Math.min(1, t)) * 36;
}

function token(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

type NodeHit = { index: number; x: number; y: number };

export function Spectrum({ className, onPick }: { className?: string; onPick?: (index: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hits = useRef<NodeHit[]>([]);
  const drag = useRef<{ index: number; q: number; x: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const inBins = new Uint8Array(1024);
    const outBins = new Uint8Array(1024);
    let frame = 0;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const brass = token("--color-brass", "#d4b483");
      const ivory = token("--color-ivory", "#f3efe6");
      const muted = token("--color-muted", "#8d877c");
      const line = token("--color-line", "#2e2a24");
      const inset = token("--color-inset", "#0a0908");

      ctx.fillStyle = inset;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      for (const db of [-12, 0, 12]) {
        const y = yOfDb(db, height);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const sr = engine.sampleRate();
      const nyquist = sr / 2;
      engine.readSpectrum("in", inBins);
      engine.readSpectrum("out", outBins);

      const pathFor = (bins: Uint8Array) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 2) {
          const freq = MIN_F * (MAX_F / MIN_F) ** (x / width);
          const bin = Math.round((freq / nyquist) * (bins.length - 1));
          const mag = bins[Math.max(0, Math.min(bins.length - 1, bin))] / 255;
          const y = height - mag * (height - 10);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };

      pathFor(inBins);
      ctx.strokeStyle = muted;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1;
      ctx.stroke();
      pathFor(outBins);
      ctx.strokeStyle = brass;
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fillStyle = brass;
      ctx.globalAlpha = 0.12;
      ctx.fill();
      ctx.globalAlpha = 1;

      const patch = useVst.getState().patch;
      ctx.beginPath();
      const steps = Math.max(48, Math.floor(width / 4));
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const freq = MIN_F * (MAX_F / MIN_F) ** (x / Math.max(1, width));
        const db = responseDb(patch, Math.min(freq, nyquist - 30), sr);
        const y = yOfDb(db, height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ivory;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = ivory;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
      ctx.fillStyle = muted;
      const nextHits: NodeHit[] = [];
      BANDS.forEach((band, index) => {
        const x = xOf(band.hz, width);
        const y = yOfDb(storedBandDb(patch, index), height);
        nextHits.push({ index, x, y });
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        const dim = patch.mutes[index] || (patch.solos.some(Boolean) && !patch.solos[index]);
        ctx.fillStyle = dim ? inset : brass;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = ivory;
        ctx.stroke();
        ctx.fillStyle = muted;
        ctx.fillText(band.label, x - 8, height - 4);
      });
      hits.current = nextHits;
      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  const pointer = (event: { clientX: number; clientY: number; currentTarget: HTMLCanvasElement }) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, h: rect.height };
  };

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "h-44 w-full touch-none rounded-xl bg-inset lg:h-56"}
      aria-label="Spectrum and EQ curve. Drag a node up for gain, sideways for Q."
      onPointerDown={(event) => {
        const p = pointer(event);
        const hit = hits.current.find((node) => (node.x - p.x) ** 2 + (node.y - p.y) ** 2 < 28 ** 2);
        if (!hit) return;
        onPick?.(hit.index);
        event.currentTarget.setPointerCapture(event.pointerId);
        const q = useVst.getState().patch.qs[hit.index];
        drag.current = { index: hit.index, q, x: event.clientX };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const p = pointer(event);
        const db = dbOfY(p.y, p.h);
        const gain = clamp100(db / 0.24 + 50);
        const q = clamp100(drag.current.q + (event.clientX - drag.current.x) * (event.shiftKey ? 0.08 : 0.22));
        const state = useVst.getState();
        const gains = state.patch.gains.slice();
        const qs = state.patch.qs.slice();
        gains[drag.current.index] = gain;
        qs[drag.current.index] = q;
        state.commit({ ...state.patch, gains, qs });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onDoubleClick={(event) => {
        const p = pointer(event);
        const hit = hits.current.find((node) => (node.x - p.x) ** 2 + (node.y - p.y) ** 2 < 28 ** 2);
        if (!hit) return;
        onPick?.(hit.index);
        const state = useVst.getState();
        const gains = state.patch.gains.slice();
        const qs = state.patch.qs.slice();
        gains[hit.index] = 50;
        qs[hit.index] = 7;
        state.commit({ ...state.patch, gains, qs });
      }}
    />
  );
}
