"use client";

import { LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { gameInfo } from "@/components/games/catalog";
import { bigBtn, GameIntro, GameOver, GameTopBar, Locked, Pill } from "@/components/games/GameKit";
import { Icon } from "@/components/Icon";
import { Loading } from "@/components/ui";
import type { Phrase } from "@/content/types";
import { learnedPhrases, pickRound, shuffle, useGameReview, wordsOf } from "@/lib/games";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import { wordKey } from "@/lib/tokenize";

// Rebuild a phrase by tapping its words in order.

const ROUNDS = 8;
const MIN_PHRASES = 4;
const info = gameInfo("arma");

/** Phrases with enough words to be worth rebuilding. */
function buildable(pool: Phrase[]) {
  return pool.filter((p) => {
    const n = wordsOf(p).length;
    return n >= 2 && n <= 7;
  });
}

export default function ArmaPage() {
  const { ready, data } = useStore();
  const [stage, setStage] = useState<"intro" | "play" | "over">("intro");
  const [run, setRun] = useState(0);
  const [correct, setCorrect] = useState(0);
  if (!ready) return <Loading />;

  const pool = buildable(learnedPhrases(data.deck));
  const best = data.progress.games.arma?.best;

  return (
    <div className="pt-safe flex h-full flex-col">
      <GameTopBar title={info.es} />
      <div className="min-h-0 flex-1">
        {pool.length < MIN_PHRASES ? (
          <Locked need={MIN_PHRASES} have={pool.length} what="phrases of two words or more" />
        ) : stage === "intro" ? (
          <GameIntro
            title={info.es}
            how="See the meaning, hear the phrase, then tap the Spanish words in the right order."
            best={best ? `Best: ${best} of ${ROUNDS}` : undefined}
            icon={info.icon}
            tone={info.tone}
            onStart={() => setStage("play")}
          />
        ) : stage === "play" ? (
          <Play
            key={run}
            pool={pool}
            onDone={(n) => {
              setCorrect(n);
              setStage("over");
            }}
          />
        ) : (
          <GameOver
            result={{ game: "arma", score: correct, correct, perfect: correct === ROUNDS }}
            title={correct === ROUNDS ? "¡Perfecto!" : "¡Bien armado!"}
            subtitle={`${correct} of ${ROUNDS} phrases rebuilt.`}
            scoreLabel="correct"
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

interface Tile {
  id: number;
  text: string;
}

/** Words as tiles, without the ¿ ¡ ? ! . that would give the order away. */
function tilesFor(p: Phrase): Tile[] {
  const words = wordsOf(p).map((w, id) => ({ id, text: w.replace(/^[¡¿]+|[!?.,]+$/g, "") }));
  let out = shuffle(words);
  // Never hand out the answer already in order.
  for (let tries = 0; tries < 5 && out.every((t, n) => t.id === n); tries++) out = shuffle(words);
  return out;
}

function Play({ pool, onDone }: { pool: Phrase[]; onDone: (correct: number) => void }) {
  const { data } = useStore();
  const { play, stop } = usePlayer();
  const review = useGameReview();
  const [round] = useState(() => pickRound(pool, data.deck, ROUNDS));
  const [i, setI] = useState(0);
  const [bank, setBank] = useState<Tile[]>(() => tilesFor(round[0]));
  const [placed, setPlaced] = useState<Tile[]>([]);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const target = round[i];

  useEffect(() => {
    play(`arma:${i}`, target.es);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  useEffect(() => () => stop(), [stop]);

  const check = (all: Tile[]) => {
    const want = wordsOf(target).map(wordKey);
    const ok = all.every((t, n) => wordKey(t.text) === want[n]);
    review(target.id, ok);
    setVerdict(ok ? "right" : "wrong");
    if (ok) {
      sfx.good();
      setCorrect((c) => c + 1);
      play(`arma:${i}`, target.es);
    } else sfx.again();
  };

  const place = (t: Tile) => {
    if (verdict) return;
    sfx.tap();
    const nextPlaced = [...placed, t];
    setPlaced(nextPlaced);
    setBank(bank.filter((b) => b.id !== t.id));
    if (nextPlaced.length === wordsOf(target).length) check(nextPlaced);
  };

  const unplace = (t: Tile) => {
    if (verdict) return;
    sfx.tap();
    setPlaced(placed.filter((p) => p.id !== t.id));
    setBank([...bank, t]);
  };

  const next = () => {
    sfx.tap();
    if (i + 1 >= round.length) {
      onDone(correct);
      return;
    }
    setBank(tilesFor(round[i + 1]));
    setPlaced([]);
    setVerdict(null);
    setI(i + 1);
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-5 px-5 pb-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-bold tabular-nums text-muted">
          {i + 1} / {round.length}
        </span>
        <Pill icon="check">{correct}</Pill>
      </div>

      <div className="flex flex-col items-center gap-3 pt-4 text-center">
        <p className="font-display text-[clamp(26px,4.4vw,36px)] font-bold leading-tight">“{target.en}”</p>
        <button
          type="button"
          onClick={() => play(`arma:${i}`, target.es)}
          className="flex h-12 items-center gap-2 rounded-full bg-surface px-5 text-[16px] font-bold active:scale-95"
        >
          <Icon name="speaker" size={18} /> Escuchar
        </button>
      </div>

      <LayoutGroup>
        <motion.div
          animate={verdict === "wrong" ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className={`flex min-h-[132px] flex-wrap content-start items-start gap-2.5 rounded-[28px] border-2 border-dashed p-4 transition-colors ${
            verdict === "right"
              ? "border-accent bg-learn"
              : verdict === "wrong"
                ? "border-terra-soft bg-[color-mix(in_srgb,var(--terra-soft)_12%,transparent)]"
                : "border-line"
          }`}
        >
          {placed.map((t) => (
            <WordTile key={t.id} tile={t} onClick={() => unplace(t)} strong />
          ))}
          {!placed.length && <span className="p-2 text-lg text-muted">Tap the words below</span>}
        </motion.div>

        <div className="flex min-h-[120px] flex-wrap content-start justify-center gap-2.5">
          {bank.map((t) => (
            <WordTile key={t.id} tile={t} onClick={() => place(t)} />
          ))}
        </div>
      </LayoutGroup>

      <div className="mt-auto flex flex-col gap-3">
        {verdict === "wrong" && (
          <p className="text-center text-lg text-soft">
            It goes: <b lang="es" className="text-text">{target.es}</b>
          </p>
        )}
        {verdict && (
          <motion.button
            type="button"
            onClick={next}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={bigBtn}
          >
            {verdict === "right" ? "¡Eso! Siguiente" : "Siguiente"} <Icon name="arrowRight" size={24} />
          </motion.button>
        )}
        {!verdict && placed.length > 0 && (
          <button
            type="button"
            onClick={() => {
              sfx.tap();
              setBank(shuffle([...bank, ...placed]));
              setPlaced([]);
            }}
            className="mx-auto h-12 rounded-full border border-line px-5 font-bold text-muted active:scale-95"
          >
            Borrar todo
          </button>
        )}
      </div>
    </div>
  );
}

function WordTile({ tile, onClick, strong = false }: { tile: Tile; onClick: () => void; strong?: boolean }) {
  return (
    <motion.button
      layoutId={`tile-${tile.id}`}
      layout
      type="button"
      lang="es"
      onClick={onClick}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className={`h-14 rounded-2xl px-4 font-display text-[22px] font-bold shadow-[0_4px_0_rgba(0,0,0,0.25)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(0,0,0,0.25)] ${
        strong ? "bg-accent text-accent-ink" : "bg-surface-2 text-text"
      }`}
    >
      {tile.text}
    </motion.button>
  );
}
