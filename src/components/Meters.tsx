"use client";

import { motion } from "motion/react";

/** Animated progress ring. `value` is 0..1. */
export function Ring({
  value,
  size = 130,
  stroke = 14,
  color = "var(--accent)",
  label,
  children,
  marker,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  children?: React.ReactNode;
  /** Optional goal tick, 0..1. */
  marker?: number;
}) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.001, Math.min(1, value)) }}
          transition={{ duration: 1.3, ease: [0.2, 0.9, 0.3, 1], delay: 0.15 }}
        />
        {marker !== undefined && (
          <line
            x1={c}
            y1={stroke / 2 - 6}
            x2={c}
            y2={stroke / 2 + 8}
            stroke="var(--text)"
            strokeWidth={3}
            strokeLinecap="round"
            transform={`rotate(${marker * 360} ${c} ${c})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Animated horizontal bar. `value` is 0..1. */
export function Bar({
  value,
  color = "var(--accent)",
  className = "h-3.5",
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-full bg-[var(--line)] ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ duration: 1.1, ease: [0.2, 0.9, 0.3, 1], delay: 0.1 }}
      />
    </div>
  );
}

/** The 50-segment Stage 1 meter: learned, in progress, not started. */
export function SegmentMeter({ learned, learning, total }: { learned: number; learning: number; total: number }) {
  return (
    <div
      role="img"
      aria-label={`${learned} of ${total} phrases learned, ${learning} in progress`}
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="h-[22px] rounded-[3px]"
          style={{
            background:
              i < learned
                ? "var(--accent)"
                : i < learned + learning
                  ? "color-mix(in srgb, var(--accent) 35%, transparent)"
                  : "var(--line)",
            transformOrigin: "bottom",
          }}
          initial={{ scaleY: 0.2, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 0.1 + i * 0.012, type: "spring", stiffness: 500, damping: 26 }}
        />
      ))}
    </div>
  );
}
