"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DeckCard } from "@/lib/db";
import { usePlayer } from "@/lib/player";
import { dueWithin, previewIntervals, Rating, type Grade } from "@/lib/srs";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import { Icon } from "./Icon";
import { Sentence } from "./Sentence";
import { RegisterBadge } from "./ui";

const BUTTONS: { grade: Grade; es: string; en: string; cls: string }[] = [
  { grade: Rating.Again, es: "Otra vez", en: "Again", cls: "bg-terra text-[#FFF6EA]" },
  { grade: Rating.Hard, es: "Difícil", en: "Hard", cls: "bg-surface-2 text-text" },
  { grade: Rating.Good, es: "Bien", en: "Good", cls: "bg-accent text-accent-ink" },
  { grade: Rating.Easy, es: "Fácil", en: "Easy", cls: "bg-blue text-[#F4F7FF]" },
];

/** Cards rated into a short learning step come back later in the same session. */
const REQUEUE_WITHIN_MS = 15 * 60 * 1000;

export interface SessionResult {
  reviewed: number;
  correct: number;
}

export function ReviewSession({
  initialIds,
  onDone,
  label,
}: {
  initialIds: string[];
  onDone: (r: SessionResult) => void;
  label?: string;
}) {
  const { data, rateCard } = useStore();
  const { play, stop } = usePlayer();
  const [queue, setQueue] = useState<string[]>(initialIds);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<SessionResult>({ reviewed: 0, correct: 0 });
  const [total, setTotal] = useState(initialIds.length);
  const [done, setDone] = useState(0);
  const doneRef = useRef(false);

  const card: DeckCard | undefined = data.deck.find((c) => c.id === queue[0]);
  const intervals = useMemo(() => (card ? previewIntervals(card) : null), [card]);

  useEffect(() => {
    if (!card && !doneRef.current) {
      doneRef.current = true;
      onDone(result);
    }
  }, [card, onDone, result]);

  // Listen first: each new card speaks on arrival.
  useEffect(() => {
    if (card) play(`review:${card.id}`, card.es);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id]);

  useEffect(() => () => stop(), [stop]);

  if (!card || !intervals) return null;

  const flip = () => {
    sfx.flip();
    setFlipped((f) => !f);
  };

  const answer = (grade: Grade) => {
    if (grade === Rating.Again) sfx.again();
    else sfx.good();
    const soon = dueWithin(card, grade, REQUEUE_WITHIN_MS);
    rateCard(card.id, grade);
    const rest = queue.slice(1);
    const nextQueue = soon ? [...rest, card.id] : rest;
    if (soon) setTotal((t) => t + 1);
    setDone((d) => d + 1);
    setResult((r) => ({ reviewed: r.reviewed + 1, correct: r.correct + (grade === Rating.Again ? 0 : 1) }));
    setFlipped(false);
    setQueue(nextQueue);
  };

  const pct = Math.round((done / Math.max(1, total)) * 100);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 px-5 sm:px-10">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
        </div>
        <span className="shrink-0 text-base font-bold text-muted">
          {Math.min(done + 1, total)} / {total}
        </span>
      </div>
      {label && (
        <div className="pt-4 text-center text-[13px] font-extrabold uppercase tracking-[0.08em] text-muted">
          {label}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-6 sm:px-14">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={card.id + ":" + done}
            initial={{ opacity: 0, x: 90, rotate: 3, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, x: -90, rotate: -3, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative h-[min(60vh,600px)] w-full max-w-2xl [perspective:1800px]"
          >
            <motion.div
              className="relative h-full w-full [transform-style:preserve-3d]"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              {/* Front */}
              <button
                type="button"
                onClick={flip}
                aria-label="Show the meaning"
                className="absolute inset-0 flex flex-col items-center justify-center gap-7 rounded-[40px] border border-line bg-surface p-8 shadow-[0_40px_80px_var(--shadow)] [backface-visibility:hidden]"
              >
                <span className="rounded-full bg-learn px-4 py-2 text-[13px] font-extrabold uppercase tracking-[0.06em] text-accent-text">
                  {card.sourceTitle}
                </span>
                <span
                  lang="es"
                  className="text-center font-display text-[clamp(34px,6vw,64px)] font-bold leading-[1.1] tracking-[-0.01em]"
                >
                  {card.es}
                </span>
                <span className="text-lg text-muted">What does it mean? Tap to flip</span>
              </button>
              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-y-auto rounded-[40px] bg-blue p-8 text-[#F4F7FF] shadow-[0_40px_80px_var(--shadow)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                aria-hidden={!flipped}
              >
                <Sentence
                  id={`review:${card.id}`}
                  es={card.es}
                  size="card"
                  className="!text-[clamp(28px,4.6vw,46px)]"
                />
                <p className="text-center text-[clamp(22px,3.4vw,30px)] leading-snug text-[#E3EBFF]">{card.en}</p>
                {card.reg && (
                  <RegisterBadge line={{ id: card.id, es: card.es, en: card.en, reg: card.reg, to: undefined }} />
                )}
                {card.note && (
                  <p className="max-w-lg rounded-2xl bg-white/12 px-4 py-3 text-center text-lg leading-snug">
                    {card.note}
                  </p>
                )}
                <span className="flex items-center gap-2.5 text-lg font-bold text-[#FFE2A8]">
                  <Icon name="mic" size={22} /> Now say it out loud
                </span>
                <button
                  type="button"
                  onClick={flip}
                  className="mt-1 text-[15px] font-semibold text-[#E3EBFF] underline underline-offset-4"
                >
                  Flip back
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => play(`review:${card.id}`, card.es)}
          className="mt-6 flex h-14 items-center gap-2.5 rounded-full border border-line bg-surface px-6 text-[17px] font-bold active:scale-95"
        >
          <Icon name="speaker" size={20} /> Escuchar
        </button>
      </div>

      <div className="pb-safe px-5 sm:px-10">
        <div className="mx-auto mb-8 flex h-[104px] max-w-3xl items-end">
          <AnimatePresence mode="wait" initial={false}>
            {flipped ? (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="grid w-full grid-cols-4 gap-3"
              >
                {BUTTONS.map((b) => (
                  <button
                    key={b.grade}
                    type="button"
                    onClick={() => answer(b.grade)}
                    className={`flex h-24 flex-col items-center justify-center gap-1 rounded-3xl shadow-[0_6px_0_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-100 active:translate-y-[5px] active:scale-[0.97] active:shadow-[0_1px_0_rgba(0,0,0,0.35)] ${b.cls}`}
                  >
                    <span className="font-display text-[clamp(17px,2.6vw,22px)] font-extrabold">{b.es}</span>
                    <span className="text-[13px] font-semibold opacity-85">
                      {b.en} · {intervals[b.grade]}
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.button
                key="show"
                type="button"
                onClick={flip}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="h-20 w-full rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-100 active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)]"
              >
                Mostrar respuesta
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
