"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { gameInfo } from "@/components/games/catalog";
import { GameIntro, GameOver, GameTopBar, Locked, Pill, TimeBar } from "@/components/games/GameKit";
import { Icon } from "@/components/Icon";
import { artFor, PhraseArt } from "@/components/PhraseArt";
import { Loading } from "@/components/ui";
import type { Phrase } from "@/content/types";
import { learnedPhrases, MIN_LEARNED, pickRound, shuffle, useGameReview } from "@/lib/games";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

// Lotería: the caller says a phrase in Spanish, you find its meaning on your
// board and drop a bean on it. Four in a row (or three on the small board),
// across, down or corner to corner, then shout ¡Lotería!

const CALL_MS = 8000;
const DECOYS = 6;
const info = gameInfo("loteria");

export default function LoteriaPage() {
  const { ready, data } = useStore();
  const [stage, setStage] = useState<"intro" | "play" | "over">("intro");
  const [run, setRun] = useState(0);
  const [result, setResult] = useState({ won: false, marked: 0, calls: 0 });
  if (!ready) return <Loading />;

  const pool = learnedPhrases(data.deck);
  const wins = data.progress.games.loteria?.wins ?? 0;
  const size = pool.length >= 16 ? 4 : 3;

  return (
    <div className="pt-safe flex h-full flex-col">
      <GameTopBar title={info.es} />
      <div className="min-h-0 flex-1">
        {pool.length < MIN_LEARNED.loteria ? (
          <Locked need={MIN_LEARNED.loteria} have={pool.length} />
        ) : stage === "intro" ? (
          <GameIntro
            title={info.es}
            how={`The caller says a phrase in Spanish. Find what it means on your board and tap it to drop a bean. Get ${size} in a row (across, down or corner to corner), then tap ¡Lotería!`}
            best={wins ? `${wins} ${wins === 1 ? "win" : "wins"} so far` : undefined}
            icon={info.icon}
            tone={info.tone}
            onStart={() => setStage("play")}
          >
            {size === 3 && (
              <p className="text-base text-muted">At 16 phrases you’ll get the big 4×4 board.</p>
            )}
          </GameIntro>
        ) : stage === "play" ? (
          <Play
            key={run}
            pool={pool}
            size={size}
            onDone={(r) => {
              setResult(r);
              setStage("over");
            }}
          />
        ) : (
          <GameOver
            result={{ game: "loteria", score: result.marked, correct: result.marked, won: result.won }}
            title={result.won ? "¡Lotería!" : "Se acabaron las cartas"}
            subtitle={result.won ? `You won in ${result.calls} calls.` : "Out of cards this time. ¡La próxima!"}
            scoreLabel="beans"
            extra={[{ value: result.calls, label: "calls" }]}
            quiet={!result.won}
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

function lines(size: number): number[][] {
  const out: number[][] = [];
  for (let r = 0; r < size; r++) out.push(Array.from({ length: size }, (_, c) => r * size + c));
  for (let c = 0; c < size; c++) out.push(Array.from({ length: size }, (_, r) => r * size + c));
  out.push(Array.from({ length: size }, (_, n) => n * size + n));
  out.push(Array.from({ length: size }, (_, n) => n * size + (size - 1 - n)));
  return out;
}

function Play({
  pool,
  size,
  onDone,
}: {
  pool: Phrase[];
  size: number;
  onDone: (r: { won: boolean; marked: number; calls: number }) => void;
}) {
  const { data } = useStore();
  const { play, stop } = usePlayer();
  const review = useGameReview();

  // The board and the caller's deck: every board phrase plus a few that aren't on it.
  const [{ board, calls }] = useState(() => {
    const seen = new Set<string>();
    const distinct = pickRound(pool, data.deck, pool.length).filter((p) => !seen.has(p.en) && seen.add(p.en));
    const board = distinct.slice(0, size * size);
    const decoys = distinct.slice(size * size, size * size + DECOYS);
    return { board, calls: shuffle([...board, ...decoys]) };
  });
  const [n, setN] = useState(0);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const markedRef = useRef(marked);
  useEffect(() => {
    markedRef.current = marked;
  }, [marked]);

  const call = calls[n];
  const called = new Set(calls.slice(0, n + 1).map((p) => p.id));
  const win = lines(size).find((l) => l.every((i) => marked.has(board[i].id)));
  const boardIds = new Set(board.map((p) => p.id));

  const finish = useCallback(
    (won: boolean, callsUsed: number) => onDone({ won, marked: markedRef.current.size, calls: callsUsed }),
    [onDone],
  );

  // Announce each card.
  useEffect(() => {
    sfx.flip();
    const t = setTimeout(() => play(`loteria:${n}`, call.es), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  useEffect(() => () => stop(), [stop]);

  const nextCall = useCallback(() => {
    // A phrase that was on the board and went by without a bean counts as a miss.
    if (boardIds.has(call.id) && !markedRef.current.has(call.id)) review(call.id, false);
    if (n + 1 >= calls.length) finish(false, calls.length);
    else setN(n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, call.id, calls.length, finish, review]);

  // The caller doesn't wait forever. Pauses once you have a line, so you can shout.
  useEffect(() => {
    if (win) return;
    const t = setTimeout(nextCall, CALL_MS);
    return () => clearTimeout(t);
  }, [n, win, nextCall]);

  const tap = (p: Phrase) => {
    if (marked.has(p.id)) return;
    if (called.has(p.id)) {
      sfx.pop();
      if (p.id === call.id) review(p.id, true);
      setMarked(new Set(marked).add(p.id));
    } else {
      sfx.again();
      review(call.id, false);
      setShake(p.id);
      setTimeout(() => setShake(null), 400);
    }
  };

  const shout = () => {
    if (!win) {
      sfx.again();
      setNudge(true);
      setTimeout(() => setNudge(false), 1400);
      return;
    }
    play("loteria:win", "¡Lotería!");
    finish(true, n + 1);
  };

  const art = artFor(call.category);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-4 px-4 pb-6 sm:flex-row sm:items-stretch sm:gap-6 sm:px-8">
      {/* The caller */}
      <div className="flex shrink-0 flex-row items-center gap-4 sm:w-[240px] sm:flex-col sm:justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.button
            key={n}
            type="button"
            onClick={() => play(`loteria:${n}`, call.es)}
            aria-label={`Card ${n + 1}: ${call.es}. Tap to hear it again.`}
            initial={{ rotateY: 90, opacity: 0, y: -10 }}
            animate={{ rotateY: 0, opacity: 1, y: 0 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative flex h-[168px] w-[124px] shrink-0 flex-col items-center justify-between overflow-hidden rounded-[18px] border-4 p-2.5 shadow-[0_14px_30px_var(--shadow)] sm:h-[300px] sm:w-[220px] sm:p-4"
            style={{ background: "#FBF4E8", borderColor: art.bg, color: "#2B1D15" }}
          >
            <span className="flex w-full items-center justify-between text-[13px] font-extrabold sm:text-base">
              <span>{n + 1}</span>
              <Icon name="speaker" size={16} />
            </span>
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full sm:h-28 sm:w-28"
              style={{ background: art.bg }}
            >
              <PhraseArt category={call.category} size={size === 4 ? 40 : 44} className="sm:h-20 sm:w-20" />
            </span>
            <span lang="es" className="text-center font-display text-[15px] font-extrabold leading-tight sm:text-[22px]">
              {call.es}
            </span>
          </motion.button>
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:w-full sm:flex-none">
          <TimeBar ms={CALL_MS} runKey={n} paused={!!win} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-bold text-muted">
              Card {n + 1} / {calls.length}
            </span>
            <button
              type="button"
              onClick={() => {
                sfx.tap();
                nextCall();
              }}
              disabled={!!win}
              className="flex h-11 items-center gap-1.5 rounded-full bg-surface px-4 text-[15px] font-bold active:scale-95 disabled:opacity-40"
            >
              Otra <Icon name="arrowRight" size={16} />
            </button>
          </div>
          <Pill icon="check">{marked.size} beans</Pill>
        </div>
      </div>

      {/* Your board */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          className="grid min-h-0 flex-1 auto-rows-fr gap-2 rounded-[24px] border-4 border-[color-mix(in_srgb,var(--terra)_70%,transparent)] bg-[color-mix(in_srgb,var(--terra)_14%,var(--card))] p-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {board.map((p, i) => {
            const on = marked.has(p.id);
            const inWin = win?.includes(i);
            return (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => tap(p)}
                aria-pressed={on}
                animate={shake === p.id ? { x: [0, -8, 7, -5, 3, 0] } : inWin ? { scale: [1, 1.05, 1] } : undefined}
                transition={inWin ? { duration: 0.9, repeat: Infinity } : { duration: 0.35 }}
                className={`relative flex min-h-[64px] items-center justify-center overflow-hidden rounded-[14px] p-1.5 text-center leading-tight transition-colors ${
                  inWin ? "bg-accent text-accent-ink" : "bg-card text-text"
                } ${size === 4 ? "text-[clamp(12px,1.9vw,16px)]" : "text-[clamp(14px,2.4vw,19px)]"} font-bold`}
              >
                <span className="absolute left-1.5 top-1 text-[10px] font-extrabold text-muted">{i + 1}</span>
                <span className={on && !inWin ? "opacity-45" : ""}>{p.en}</span>
                <AnimatePresence>
                  {on && (
                    <motion.svg
                      aria-hidden
                      viewBox="0 0 40 28"
                      className="pointer-events-none absolute h-[46%] w-[46%]"
                      initial={{ scale: 2.2, opacity: 0, rotate: -30, y: -30 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12, y: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    >
                      <ellipse cx="20" cy="14" rx="18" ry="12" fill="#6B3A22" />
                      <ellipse cx="14" cy="10" rx="6" ry="3" fill="#A86A45" opacity="0.8" />
                      <path d="M6 15c4 4 10 6 16 5" stroke="#4A2615" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        <motion.button
          type="button"
          onClick={shout}
          animate={win ? { scale: [1, 1.06, 1] } : nudge ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
          transition={win ? { duration: 0.8, repeat: Infinity } : { duration: 0.4 }}
          className={`flex h-[72px] shrink-0 items-center justify-center rounded-3xl font-display text-[28px] font-extrabold shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-colors active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] ${
            win ? "bg-accent text-accent-ink" : "bg-surface text-muted"
          }`}
        >
          {nudge ? "Todavía no… not yet!" : "¡Lotería!"}
        </motion.button>
      </div>
    </div>
  );
}
