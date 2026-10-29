"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { gameInfo } from "@/components/games/catalog";
import { AnswerTile, GameIntro, GameOver, GameTopBar, Locked, Pill, TimeBar, type TileState } from "@/components/games/GameKit";
import { Loading } from "@/components/ui";
import type { Phrase } from "@/content/types";
import { choicesFor, learnedPhrases, MIN_LEARNED, pickRound, useGameReview } from "@/lib/games";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

// 60-second lightning round: read the Spanish, tap the meaning, as many as you can.

const SECONDS = 60;
const info = gameInfo("rayo");

export default function RayoPage() {
  const { ready, data } = useStore();
  const [stage, setStage] = useState<"intro" | "play" | "over">("intro");
  const [run, setRun] = useState(0);
  const [score, setScore] = useState({ correct: 0, answered: 0, oldBest: 0 });
  if (!ready) return <Loading />;

  const pool = learnedPhrases(data.deck);
  const best = data.progress.games.rayo?.best;

  return (
    <div className="pt-safe flex h-full flex-col">
      <GameTopBar title={info.es} />
      <div className="min-h-0 flex-1">
        {pool.length < MIN_LEARNED.rayo ? (
          <Locked need={MIN_LEARNED.rayo} have={pool.length} />
        ) : stage === "intro" ? (
          <GameIntro
            title={info.es}
            how="60 seconds on the clock. Read the Spanish, tap the meaning. Go fast, but wrong answers cost you a beat."
            best={best ? `Record: ${best}` : undefined}
            icon={info.icon}
            tone={info.tone}
            onStart={() => setStage("play")}
          />
        ) : stage === "play" ? (
          <Play
            key={run}
            pool={pool}
            onDone={(s) => {
              // Read the record before this round is saved over it.
              setScore({ ...s, oldBest: best ?? 0 });
              setStage("over");
            }}
          />
        ) : (
          <GameOver
            result={{ game: "rayo", score: score.correct, correct: score.correct }}
            title={score.correct > score.oldBest ? "¡Récord!" : "¡Tiempo!"}
            subtitle={`${score.correct} right out of ${score.answered}.`}
            scoreLabel="correct"
            extra={[{ value: score.oldBest, label: "old record" }]}
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

function Play({ pool, onDone }: { pool: Phrase[]; onDone: (s: { correct: number; answered: number }) => void }) {
  const { data } = useStore();
  const review = useGameReview();
  const [queue] = useState(() => pickRound(pool, data.deck, 150));
  const [i, setI] = useState(0);
  const [choices, setChoices] = useState(() => choicesFor(queue[0], pool, 2));
  const [picked, setPicked] = useState<string | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [correct, setCorrect] = useState(0);
  const tally = useRef({ correct: 0, answered: 0 });
  const endAt = useRef(0);
  const target = queue[i % queue.length];

  // One clock for the whole round; the bar animates on its own.
  useEffect(() => {
    endAt.current = Date.now() + SECONDS * 1000;
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(t);
        sfx.win();
        onDone(tally.current);
      }
    }, 250);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = (p: Phrase) => {
    if (picked || left === 0) return;
    const ok = p.id === target.id;
    setPicked(p.id);
    review(target.id, ok);
    tally.current.answered++;
    if (ok) {
      sfx.good();
      tally.current.correct++;
      setCorrect(tally.current.correct);
    } else sfx.again();
    setTimeout(
      () => {
        const n = i + 1;
        setChoices(choicesFor(queue[n % queue.length], pool, 2));
        setPicked(null);
        setI(n);
      },
      ok ? 220 : 900,
    );
  };

  const stateOf = (p: Phrase): TileState => {
    if (!picked) return "idle";
    if (p.id === target.id) return "right";
    if (p.id === picked) return "wrong";
    return "dim";
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-5 px-5 pb-8 sm:px-8">
      <div className="flex items-center gap-3">
        <Pill icon="clock" hot={left <= 10}>
          {left}s
        </Pill>
        <div className="flex-1">
          <TimeBar ms={SECONDS * 1000} runKey="rayo" />
        </div>
        <Pill icon="bolt">{correct}</Pill>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={i}
            lang="es"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="text-center font-display text-[clamp(34px,6vw,58px)] font-extrabold leading-[1.08]"
          >
            {target.es}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        {choices.map((c) => (
          <AnswerTile key={`${i}:${c.id}`} state={stateOf(c)} onClick={() => answer(c)}>
            {c.en}
          </AnswerTile>
        ))}
      </div>
    </div>
  );
}
