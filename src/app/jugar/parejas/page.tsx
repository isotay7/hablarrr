"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CardBack } from "@/components/games/CardBack";
import { gameInfo } from "@/components/games/catalog";
import { GameIntro, GameOver, GameTopBar, Locked, Pill } from "@/components/games/GameKit";
import { PhraseArt } from "@/components/PhraseArt";
import { Loading } from "@/components/ui";
import type { Phrase } from "@/content/types";
import { learnedPhrases, MIN_LEARNED, pickRound, shuffle, useGameReview } from "@/lib/games";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

// Timed memory match: find each Spanish phrase's English twin.

const PAIRS = 6;
const info = gameInfo("parejas");

export default function ParejasPage() {
  const { ready, data } = useStore();
  const [stage, setStage] = useState<"intro" | "play" | "over">("intro");
  const [run, setRun] = useState(0);
  const [result, setResult] = useState({ seconds: 0, flips: 0, oldBest: 0 });
  if (!ready) return <Loading />;

  const pool = learnedPhrases(data.deck);
  const best = data.progress.games.parejas?.best;

  return (
    <div className="pt-safe flex h-full flex-col">
      <GameTopBar title={info.es} />
      <div className="min-h-0 flex-1">
        {pool.length < MIN_LEARNED.parejas ? (
          <Locked need={MIN_LEARNED.parejas} have={pool.length} />
        ) : stage === "intro" ? (
          <GameIntro
            title={info.es}
            how="Flip two cards. Match each Spanish phrase with its meaning. The clock is running!"
            best={best ? `Best time: ${best}s` : undefined}
            icon={info.icon}
            tone={info.tone}
            onStart={() => setStage("play")}
          />
        ) : stage === "play" ? (
          <Play
            key={run}
            pool={pool}
            onDone={(r) => {
              setResult({ ...r, oldBest: best ?? 0 });
              setStage("over");
            }}
          />
        ) : (
          <GameOver
            result={{
              game: "parejas",
              score: result.seconds,
              correct: PAIRS,
              perfect: result.flips === PAIRS,
            }}
            title={!result.oldBest || result.seconds < result.oldBest ? "¡Récord!" : "¡Todas!"}
            subtitle={`All ${PAIRS} pairs in ${result.seconds} seconds.`}
            scoreLabel="seconds"
            extra={[{ value: result.flips, label: "tries" }]}
            onAgain={() => {
              setRun((r) => r + 1);
              setStage("play");
            }}
          />
        )}
      </div>
    </div>
  );
}

interface Card {
  key: string;
  phrase: Phrase;
  side: "es" | "en";
}

function Play({ pool, onDone }: { pool: Phrase[]; onDone: (r: { seconds: number; flips: number }) => void }) {
  const { data } = useStore();
  const { play, stop } = usePlayer();
  const review = useGameReview();
  const [cards] = useState<Card[]>(() => {
    // Distinct meanings only, so every English card has exactly one twin.
    const seen = new Set<string>();
    const picked = pickRound(pool, data.deck, pool.length).filter((p) => !seen.has(p.en) && seen.add(p.en));
    return shuffle(
      picked.slice(0, PAIRS).flatMap((p) => [
        { key: `${p.id}:es`, phrase: p, side: "es" as const },
        { key: `${p.id}:en`, phrase: p, side: "en" as const },
      ]),
    );
  });
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [flips, setFlips] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const started = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    started.current = Date.now();
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - started.current) / 1000)), 250);
    return () => clearInterval(t);
  }, []);
  useEffect(() => () => stop(), [stop]);

  const flip = (c: Card) => {
    if (busy.current || open.includes(c.key) || matched.has(c.phrase.id)) return;
    sfx.flip();
    if (c.side === "es") play(`parejas:${c.key}`, c.phrase.es);
    const now = [...open, c.key];
    setOpen(now);
    if (now.length < 2) return;

    setFlips((f) => f + 1);
    const [a, b] = now.map((k) => cards.find((x) => x.key === k)!);
    if (a.phrase.id === b.phrase.id) {
      sfx.good();
      review(a.phrase.id, true);
      const m = new Set(matched).add(a.phrase.id);
      setMatched(m);
      setOpen([]);
      if (m.size === cards.length / 2) {
        setTimeout(() => onDone({ seconds: Math.max(1, seconds), flips: flips + 1 }), 700);
      }
    } else {
      busy.current = true;
      setTimeout(() => {
        sfx.tap();
        setOpen([]);
        busy.current = false;
      }, 1000);
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 px-4 pb-6 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <Pill icon="clock">{seconds}s</Pill>
        <span className="text-base font-bold text-muted">
          {matched.size} / {cards.length / 2} pairs
        </span>
        <Pill icon="cards">{flips}</Pill>
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-3 gap-3 sm:grid-cols-4 [perspective:1400px]">
        {cards.map((c) => {
          const up = open.includes(c.key) || matched.has(c.phrase.id);
          const done = matched.has(c.phrase.id);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => flip(c)}
              aria-label={up ? (c.side === "es" ? c.phrase.es : c.phrase.en) : "Hidden card"}
              className="relative min-h-[92px]"
            >
              <motion.span
                className="absolute inset-0 [transform-style:preserve-3d]"
                initial={false}
                animate={{ rotateY: up ? 180 : 0, scale: done ? 0.96 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <span className="absolute inset-0 overflow-hidden rounded-[20px] shadow-[0_8px_20px_var(--shadow)] [backface-visibility:hidden]">
                  <CardBack />
                </span>
                <span
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[20px] border-2 p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    done
                      ? "border-accent bg-learn"
                      : c.side === "es"
                        ? "border-line bg-surface"
                        : "border-line bg-card"
                  }`}
                >
                  {c.side === "en" && <PhraseArt category={c.phrase.category} size={26} tint="var(--muted)" />}
                  <span
                    lang={c.side === "es" ? "es" : undefined}
                    className={`leading-tight ${
                      c.side === "es"
                        ? "font-display text-[clamp(16px,2.4vw,22px)] font-bold"
                        : "text-[clamp(14px,2vw,18px)] font-semibold text-soft"
                    }`}
                  >
                    {c.side === "es" ? c.phrase.es : c.phrase.en}
                  </span>
                </span>
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
