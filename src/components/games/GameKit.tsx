"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { CandleGlow, Kicker, RoundButton } from "@/components/ui";
import { primaryBtn, secondaryBtn, WinScreen, type WinStat } from "@/components/WinScreen";
import type { GameResult } from "@/lib/progress";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

export const bigBtn =
  "flex h-20 w-full items-center justify-center gap-2 rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow,opacity] duration-100 active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] disabled:opacity-30";

export function GameTopBar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 px-5 pb-2 pt-5 sm:px-10">
      <RoundButton icon="close" label="Leave the game" href="/jugar" />
      <Kicker className="flex-1 truncate text-accent-text">{title}</Kicker>
      {children}
    </div>
  );
}

/** A pill for the score, streak or clock in the top bar. */
export function Pill({ icon, children, hot = false }: { icon?: IconName; children: React.ReactNode; hot?: boolean }) {
  return (
    <span
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[17px] font-extrabold tabular-nums ${
        hot ? "bg-terra text-[#FFF6EA]" : "bg-surface text-text"
      }`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </span>
  );
}

export type TileState = "idle" | "right" | "wrong" | "dim";

/** An answer tile: big, tappable, shakes when wrong. */
export function AnswerTile({
  state,
  onClick,
  children,
  lang,
  className = "",
}: {
  state: TileState;
  onClick: () => void;
  children: React.ReactNode;
  lang?: string;
  className?: string;
}) {
  const look: Record<TileState, string> = {
    idle: "border-line bg-card text-text",
    right: "border-accent bg-accent text-accent-ink",
    wrong: "border-terra-soft bg-[color-mix(in_srgb,var(--terra-soft)_22%,transparent)] text-text",
    dim: "border-line bg-card text-muted",
  };
  return (
    <motion.button
      type="button"
      lang={lang}
      onClick={onClick}
      animate={state === "wrong" ? { x: [0, -10, 9, -6, 4, 0] } : state === "right" ? { scale: [1, 1.04, 1] } : undefined}
      transition={{ duration: 0.35 }}
      className={`flex min-h-[76px] items-center gap-3 rounded-3xl border-2 px-5 py-3 text-left text-[clamp(18px,2.6vw,22px)] font-bold leading-snug transition-colors active:scale-[0.98] ${look[state]} ${className}`}
    >
      <span className="flex-1">{children}</span>
      {state === "right" && <Icon name="check" size={24} strokeWidth={3} className="shrink-0" />}
    </motion.button>
  );
}

/** A shrinking time bar. Uses transform only, so it stays smooth. */
export function TimeBar({ ms, runKey, paused = false }: { ms: number; runKey: string | number; paused?: boolean }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
      <motion.div
        key={runKey}
        className="h-full origin-left rounded-full bg-accent"
        initial={{ scaleX: 1 }}
        animate={paused ? undefined : { scaleX: 0 }}
        transition={{ duration: ms / 1000, ease: "linear" }}
        style={{ willChange: "transform" }}
      />
    </div>
  );
}

/** Saves the game once and shows what you earned. */
export function GameOver({
  result,
  title,
  subtitle,
  scoreLabel,
  extra = [],
  onAgain,
  quiet = false,
}: {
  result: GameResult;
  title: string;
  subtitle: string;
  scoreLabel: string;
  extra?: WinStat[];
  onAgain: () => void;
  quiet?: boolean;
}) {
  const { recordGame } = useStore();
  const saved = useRef(false);
  const [reward, setReward] = useState<{ pesos: number; xp: number; best: boolean } | null>(null);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    setReward(recordGame(result));
  }, [recordGame, result]);

  return (
    <WinScreen
      title={title}
      subtitle={reward?.best ? `${subtitle} ¡Nuevo récord!` : subtitle}
      quiet={quiet}
      stats={[
        { value: result.score, label: scoreLabel },
        ...extra,
        { value: `+${reward?.pesos ?? 0}`, label: "pesos", hot: true },
      ]}
    >
      <button
        type="button"
        onClick={() => {
          sfx.tap();
          onAgain();
        }}
        className={primaryBtn}
      >
        Otra vez
      </button>
      <Link href="/jugar" className={secondaryBtn}>
        Más juegos
      </Link>
    </WinScreen>
  );
}

export function Locked({ need, have, what = "phrases" }: { need: number; have: number; what?: string }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <CandleGlow />
      <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-surface text-muted">
        <Icon name="lock" size={44} />
      </span>
      <div className="relative flex max-w-md flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold">Todavía no</h1>
        <p className="text-lg text-soft">
          Games only use phrases you’ve learned. This one opens at {need} {what}; you have {have}. Start Here teaches 5 a
          day.
        </p>
      </div>
      <Link href="/empezar" className={`relative ${primaryBtn}`}>
        Empieza aquí
      </Link>
    </div>
  );
}

/** Intro card before a game starts: title, how to play, a big start button. */
export function GameIntro({
  title,
  how,
  best,
  icon,
  tone,
  onStart,
  children,
}: {
  title: string;
  how: string;
  best?: string;
  icon: IconName;
  tone: string;
  onStart: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <CandleGlow />
      <div className="relative mx-auto flex min-h-full max-w-xl flex-col justify-center gap-7 px-6 py-8">
        <motion.span
          initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="flex h-24 w-24 items-center justify-center rounded-[28px] text-[#FFF6EA]"
          style={{ background: tone }}
        >
          <Icon name={icon} size={48} strokeWidth={1.8} />
        </motion.span>
        <div className="flex flex-col gap-2">
          <h1 lang="es" className="font-display text-[clamp(40px,8vw,60px)] font-extrabold leading-none tracking-[-0.02em]">
            {title}
          </h1>
          <p className="text-lg text-soft">{how}</p>
          {best && <p className="font-bold text-accent-text">{best}</p>}
        </div>
        {children}
        <button
          type="button"
          onClick={() => {
            sfx.tap();
            onStart();
          }}
          className={bigBtn}
        >
          Jugar <Icon name="play" size={22} />
        </button>
      </div>
    </div>
  );
}
