import { cn } from "@/lib/cn";
import { clamp100 } from "@/lib/vst/types";
import { useEffect, useRef } from "react";

type KnobProps = {
  label: string;
  value: number;
  display: string;
  unit: string;
  onChange: (value: number) => void;
  resetValue?: number;
  size?: "sm" | "md" | "lg";
  onEngage?: () => void;
};

const sizeClass = {
  sm: "size-12",
  md: "size-11 sm:size-14 lg:size-16",
  lg: "size-20 lg:size-24",
};

export function Knob({ label, value, display, unit, onChange, resetValue = 50, size = "md", onEngage }: KnobProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ y: number; v: number } | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const step = event.shiftKey ? 1 : 2;
      const dir = event.deltaY < 0 ? 1 : -1;
      onChangeRef.current(clamp100(valueRef.current + dir * step));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const sweep = 0.75;
  const length = 2 * Math.PI * 30;
  const shown = (value / 100) * length * sweep;

  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <button
        ref={ref}
        type="button"
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${display} ${unit}`}
        title={`${label} ${display} ${unit}`}
        className={cn(
          "cap relative touch-none rounded-full border border-line bg-inset outline-none transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-brass",
          sizeClass[size],
        )}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { y: event.clientY, v: value };
          onEngage?.();
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;
          const sens = event.shiftKey ? 0.12 : 0.42;
          onChange(clamp100(drag.current.v + (drag.current.y - event.clientY) * sens));
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onDoubleClick={() => onChange(resetValue)}
        onKeyDown={(event) => {
          const fine = event.shiftKey ? 1 : 2;
          if (event.key === "ArrowUp" || event.key === "ArrowRight") {
            event.preventDefault();
            onChange(clamp100(value + fine));
          } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
            event.preventDefault();
            onChange(clamp100(value - fine));
          } else if (event.key === "Home") onChange(0);
          else if (event.key === "End") onChange(100);
        }}
      >
        <svg viewBox="0 0 80 80" className="size-full" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            className="stroke-line"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${length * sweep} ${length}`}
            transform="rotate(135 40 40)"
          />
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            className="stroke-brass"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${shown} ${length}`}
            transform="rotate(135 40 40)"
          />
        </svg>
        <span className="sr-only">
          {display} {unit}
        </span>
      </button>
      <span className="text-xs tracking-widest text-muted uppercase">{label}</span>
      <span className="font-mono text-xs tabular-nums text-brass">
        {display}
        <span className="text-muted"> {unit}</span>
      </span>
    </div>
  );
}
