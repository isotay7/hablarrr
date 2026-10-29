"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { gameInfo } from "@/components/games/catalog";
import { AnswerTile, GameIntro, GameOver, GameTopBar, Locked, Pill, TimeBar, type TileState } from "@/components/games/GameKit";
import { Icon } from "@/components/Icon";
import { Loading } from "@/components/ui";
import type { Phrase } from "@/content/types";
import { choicesFor, learnedPhrases, MIN_LEARNED, pickRound, useGameReview } from "@/lib/games";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

// Hear a phrase, tap its meaning from 4 tiles. Each correct answer in a row
// shortens the clock; a miss resets it.

const ROUNDS = 12;
const BASE_MS = 9000;
const STEP_MS = 800;
const MIN_MS = 3500;
const info = gameInfo("escucha");

export default function EscuchaPage() {
  const { ready, data } = useStore();
  const [stage, setStage] = useState<"intro" | "play" | "over">("intro");
  const [run, setRun] = useState(0);
  const [result, setResult] = useState({ correct: 0, bestStreak: 0 });
  if (!ready) return <Loading />;

  const pool = learnedPhrases(data.deck);
  const best = data.progress.games.escucha?.best;

  return (
    <div className="pt-safe flex h-full flex-col">
      <GameTopBar title={info.es} />
      <div className="min-h-0 flex-1">
        {pool.length < MIN_LEARNED.escucha ? (
          <Locked need={MIN_LEARNED.escucha} have={pool.length} />
        ) : stage === "intro" ? (
          <GameIntro
            title={info.es}
            how="You’ll hear a phrase. Tap what it means. Get them right in a row and the clock speeds up."
            best={best ? `Best streak: ${best}` : undefined}
            icon={info.icon}
            tone={info.tone}
            onStart={() => setStage("play")}
          />
        ) : stage === "play" ? (
          <Play
            key={run}
            pool={pool}
            onDone={(r) => {
              setResult(r);
              setStage("over");
            }}
          />
        ) : (
          <GameOver
            result={{ game: "escucha", score: result.bestStreak, correct: result.correct }}
            title={result.correct >= ROUNDS - 2 ? "¡Qué oído!" : "¡Bien!"}
            subtitle={`${result.correct} of ${ROUNDS} right.`}
            scoreLabel="best streak"
            extra={[{ value: `${result.correct}/${ROUNDS}`, label: "correct" }]}
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

function Play({ pool, onDone }: { pool: Phrase[]; onDone: (r: { correct: number; bestStreak: number }) => void }) {
  const { data } = useStore();
  const { play, stop } = usePlayer();
  const review = useGameReview();
  const [round] = useState(() => pickRound(pool, data.deck, ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [timing, setTiming] = useState(false);
  const [streak, setStreak] = useState(0);
  const score = useRef({ correct: 0, bestStreak: 0 });

  const target = round[i];
  const [choices, setChoices] = useState(() => choicesFor(round[0], pool, 3));
  const limit = Math.max(MIN_MS, BASE_MS - streak * STEP_MS);
  const answered = picked !== null;

  // Speak each phrase, then start the clock. If speech never ends, start anyway.
  const current = useRef(0);
  useEffect(() => {
    current.current = i;
    let started = false;
    const start = () => {
      // A cut-off earlier phrase can still report its end; ignore it.
      if (started || current.current !== i) return;
      started = true;
      setTiming(true);
    };
    play(`escucha:${i}`, target.es, { onEnd: start });
    const fallback = setTimeout(start, 3500);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => () => stop(), [stop]);

  const advance = () => {
    if (i + 1 >= round.length) {
      onDone(score.current);
      return;
    }
    const next = round[i + 1];
    setChoices(choicesFor(next, pool, 3));
    setPicked(null);
    setTiming(false);
    setI(i + 1);
  };

  const answer = (p: Phrase | null) => {
    if (answered) return;
    const ok = p?.id === target.id;
    setPicked(p?.id ?? "timeout");
    review(target.id, ok);
    if (ok) {
      sfx.good();
      score.current.correct++;
      const s = streak + 1;
      score.current.bestStreak = Math.max(score.current.bestStreak, s);
      setStreak(s);
    } else {
      sfx.again();
      setStreak(0);
    }
    setTimeout(advance, ok ? 900 : 1800);
  };

  // Out of time counts as a miss.
  useEffect(() => {
    if (!timing || answered) return;
    const t = setTimeout(() => answer(null), limit);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timing, answered, i]);

  const stateOf = (p: Phrase): TileState => {
    if (!answered) return "idle";
    if (p.id === target.id) return "right";
    if (p.id === picked) return "wrong";
    return "dim";
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-5 px-5 pb-8 sm:px-8">
      <div className="flex items-center gap-3">
        <span className="text-base font-bold tabular-nums text-muted">
          {i + 1} / {round.length}
        </span>
        <div className="flex-1">
          <TimeBar ms={limit} runKey={`${i}:${timing}`} paused={!timing || answered} />
        </div>
        <Pill icon="flame" hot={streak >= 3}>
          {streak}
        </Pill>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => play(`escucha:${i}`, target.es)}
          aria-label="Listen again"
          className="relative flex h-36 w-36 items-center justify-center rounded-full bg-blue text-[#F4F7FF] shadow-[0_20px_50px_color-mix(in_srgb,var(--blue)_35%,transparent)] active:scale-95"
        >
          {!answered && (
            <motion.span
              className="absolute inset-0 rounded-full border-4 border-blue-soft"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <Icon name="speaker" size={60} />
        </button>
        <div className="flex h-16 items-center">
          <AnimatePresence mode="wait">
            {answered ? (
              <motion.p
                key="es"
                lang="es"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center font-display text-[clamp(26px,4.4vw,38px)] font-bold leading-tight"
              >
                {target.es}
              </motion.p>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg text-muted">
                Tap the speaker to hear it again
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {choices.map((c) => (
          <AnswerTile key={`${i}:${c.id}`} state={stateOf(c)} onClick={() => answer(c)}>
            {c.en}
          </AnswerTile>
        ))}
      </div>
      <p className="h-6 text-center font-display text-lg font-extrabold" aria-live="polite">
        {picked === "timeout" ? "¡Se acabó el tiempo! Time’s up." : answered ? (picked === target.id ? "¡Eso!" : "Casi…") : ""}
      </p>
    </div>
  );
}
