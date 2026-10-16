"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import { celebrate } from "@/lib/celebrate";
import { PapelPicado } from "./PapelPicado";
import { CandleGlow } from "./ui";

export interface WinStat {
  value: string | number;
  label: string;
  hot?: boolean;
}

export function WinScreen({
  title,
  subtitle,
  stats,
  children,
  quiet = false,
}: {
  title: string;
  subtitle: string;
  stats: WinStat[];
  children?: React.ReactNode;
  /** Skip the confetti, e.g. when there was nothing to do. */
  quiet?: boolean;
}) {
  useEffect(() => {
    if (!quiet) celebrate("big");
  }, [quiet]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-8 overflow-hidden px-6 text-center">
      <CandleGlow />
      <motion.div
        className="absolute inset-x-0 top-0"
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 14 }}
      >
        <PapelPicado className="h-28" />
      </motion.div>
      <motion.div
        className="relative flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
      >
        <h1
          lang="es"
          className="font-display text-[clamp(48px,10vw,84px)] font-extrabold leading-none tracking-[-0.02em]"
        >
          {title}
        </h1>
        <p className="text-xl text-soft">{subtitle}</p>
      </motion.div>
      <motion.div
        className="relative grid w-full max-w-2xl gap-4"
        style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.15 }}
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            className={`flex flex-col gap-1.5 rounded-[26px] px-3 py-6 ${s.hot ? "bg-terra text-[#FFF6EA]" : "bg-surface"}`}
            animate={s.hot ? { scale: [1, 1.07, 1] } : undefined}
            transition={s.hot ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            <span className={`font-display text-5xl font-extrabold ${s.hot ? "" : "text-accent-text"}`}>{s.value}</span>
            <span className={`text-base ${s.hot ? "" : "text-muted"}`}>{s.label}</span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="relative flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export const primaryBtn =
  "flex h-[60px] items-center rounded-full bg-accent px-7 text-lg font-extrabold text-accent-ink transition-transform active:scale-95";
export const secondaryBtn =
  "flex h-[60px] items-center rounded-full border border-line px-7 text-lg font-bold text-text transition-transform active:scale-95";
