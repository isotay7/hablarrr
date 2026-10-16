"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { characters, lessons } from "@/content";
import { Icon } from "@/components/Icon";
import { ReviewSession, type SessionResult } from "@/components/ReviewSession";
import { Sentence } from "@/components/Sentence";
import { CandleGlow, Kicker, Loading, RoundButton } from "@/components/ui";
import { primaryBtn, secondaryBtn, WinScreen } from "@/components/WinScreen";
import type { DeckCard } from "@/lib/db";
import { usePlayer } from "@/lib/player";
import { isDue } from "@/lib/srs";
import { sfx } from "@/lib/sounds";
import { streak } from "@/lib/stats";
import { useStore } from "@/lib/store";

const NEW_PER_SESSION = 5;
const MAX_REVIEWS = 25;
const REPEAT_COUNT = 5;

type Step = "intro" | "review" | "repeat" | "done";

export default function FocusPage() {
  const { ready, data, introduceStage1 } = useStore();
  const [step, setStep] = useState<Step>("intro");
  const [queue, setQueue] = useState<string[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [result, setResult] = useState<SessionResult>({ reviewed: 0, correct: 0 });
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || step === "done") return;
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(t);
  }, [startedAt, step]);

  const onReviewDone = useCallback((r: SessionResult) => {
    setResult(r);
    setStep("repeat");
  }, []);

  if (!ready) return <Loading />;

  const dueNow = data.deck.filter((c) => isDue(c)).length;
  const stage1Left = data.deck.filter((c) => c.stage1).length < 50;
  const nextLesson =
    lessons.find((l) => {
      const r = data.reading.find((x) => x.lessonId === l.id);
      return !r?.finished;
    }) ?? lessons[0];

  const start = () => {
    sfx.tap();
    const added = stage1Left ? introduceStage1(NEW_PER_SESSION) : 0;
    setNewCount(added);
    // Read the deck after introducing: the new cards are due immediately.
    setStartedAt(Date.now());
    setStep("review");
  };

  const minutes = Math.max(1, Math.round(elapsed / 60000));
  const clock = `${Math.floor(elapsed / 60000)}:${String(Math.floor(elapsed / 1000) % 60).padStart(2, "0")}`;

  return (
    <div className="pt-safe relative flex h-full flex-col">
      {step !== "done" && (
        <div className="flex items-center gap-3 px-5 pb-3 pt-5 sm:px-10">
          <RoundButton icon="close" label="Leave focus mode" href="/" />
          <div className="flex-1" />
          {startedAt > 0 && (
            <span className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 font-bold tabular-nums text-muted">
              <Icon name="clock" size={18} /> {clock}
            </span>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1">
        {step === "intro" && (
          <Intro
            dueNow={dueNow}
            newCount={stage1Left ? NEW_PER_SESSION : 0}
            lessonTitle={nextLesson.title}
            onStart={start}
          />
        )}
        {step === "review" && (
          <ReviewQueue
            onReady={setQueue}
            queue={queue}
            onDone={onReviewDone}
            label={newCount ? `Repaso + ${newCount} frases nuevas` : "Repaso"}
          />
        )}
        {step === "repeat" && <ListenRepeat onDone={() => setStep("done")} />}
        {step === "done" && (
          <WinScreen
            title="¡Sesión completa!"
            subtitle={`Focus session done. ¡Muy bien, ${characters.me.name}!`}
            stats={[
              { value: result.reviewed, label: "cards reviewed" },
              { value: minutes, label: minutes === 1 ? "minute" : "minutes" },
              { value: streak(data.days), label: "night streak", hot: true },
            ]}
          >
            <Link href="/" className={secondaryBtn}>
              Hoy
            </Link>
            <Link href={`/leer/${nextLesson.id}`} className={primaryBtn}>
              Leer: {nextLesson.title}
            </Link>
          </WinScreen>
        )}
      </div>
    </div>
  );
}

function Intro({
  dueNow,
  newCount,
  lessonTitle,
  onStart,
}: {
  dueNow: number;
  newCount: number;
  lessonTitle: string;
  onStart: () => void;
}) {
  const steps = [
    { icon: "deck" as const, title: "Repaso", text: dueNow ? `${dueNow} cards due` : "Nothing due yet" },
    {
      icon: "bulb" as const,
      title: "Frases nuevas",
      text: newCount ? `${newCount} of your 50 phrases` : "All 50 started",
    },
    { icon: "mic" as const, title: "Escucha y repite", text: `${REPEAT_COUNT} sentences out loud` },
    { icon: "book" as const, title: "Lectura", text: lessonTitle },
  ];
  return (
    <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-center gap-8 overflow-hidden px-6">
      <CandleGlow />
      <div className="relative flex flex-col gap-2">
        <Kicker className="text-accent-text">Modo enfoque · 15–20 min</Kicker>
        <h1 className="font-display text-[clamp(44px,8vw,68px)] font-extrabold leading-none tracking-[-0.02em]">
          Vamos a practicar.
        </h1>
        <p className="text-lg text-soft">Find a quiet spot where you can speak out loud.</p>
      </div>
      <ol className="relative flex flex-col gap-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 26 }}
            className="flex items-center gap-4 rounded-[22px] bg-surface p-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-learn text-accent-text">
              <Icon name={s.icon} size={22} />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-xl font-bold">{s.title}</span>
              <span className="text-muted">{s.text}</span>
            </span>
          </motion.li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onStart}
        className="relative h-20 rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-100 active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)]"
      >
        Empezar
      </button>
    </div>
  );
}

/** Builds the queue once (after new cards are in the deck), then runs the review. */
function ReviewQueue({
  queue,
  onReady,
  onDone,
  label,
}: {
  queue: string[];
  onReady: (ids: string[]) => void;
  onDone: (r: SessionResult) => void;
  label: string;
}) {
  const { data } = useStore();
  useEffect(() => {
    if (queue.length) return;
    const due = data.deck
      .filter((c) => isDue(c))
      .sort((a, b) => a.fsrs.due - b.fsrs.due)
      .slice(0, MAX_REVIEWS)
      .map((c) => c.id);
    if (due.length) onReady(due);
    else onDone({ reviewed: 0, correct: 0 });
    // Run once on entering the step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!queue.length) return <Loading />;
  return <ReviewSession initialIds={queue} onDone={onDone} label={label} />;
}

type Phase = "listen" | "repeat" | "slow" | "repeat2";

function ListenRepeat({ onDone }: { onDone: () => void }) {
  const { data } = useStore();
  const { play, stop } = usePlayer();
  // Newest cards first: what you just learned is what you should say.
  const items: DeckCard[] = useMemo(
    () => [...data.deck].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, REPEAT_COUNT),
    // Pick once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("listen");
  const item = items[i];

  useEffect(() => {
    if (!item) {
      onDone();
      return;
    }
    let cancelled = false;
    const id = `repeat:${item.id}`;
    const wait = (ms: number, next: Phase) =>
      setTimeout(() => {
        if (!cancelled) setPhase(next);
      }, ms);
    let t: ReturnType<typeof setTimeout> | undefined;
    if (phase === "listen") play(id, item.es, { speed: "normal", onEnd: () => !cancelled && setPhase("repeat") });
    if (phase === "repeat") t = wait(repeatMs(item.es), "slow");
    if (phase === "slow") play(id, item.es, { speed: "slow", onEnd: () => !cancelled && setPhase("repeat2") });
    if (phase === "repeat2") t = wait(repeatMs(item.es), "listen");
    return () => {
      cancelled = true;
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, phase]);

  useEffect(() => () => stop(), [stop]);

  if (!item) return null;

  const next = () => {
    sfx.good();
    stop();
    setPhase("listen");
    setI((n) => n + 1);
  };

  const speaking = phase === "listen" || phase === "slow";
  const prompt = {
    listen: "Escucha…",
    repeat: "Tu turno. Say it out loud!",
    slow: "Escucha, más despacio…",
    repeat2: "Otra vez. One more time!",
  }[phase];

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-10 px-6 text-center">
      <Kicker className="text-muted">
        Escucha y repite · {i + 1} / {items.length}
      </Kicker>
      <Sentence id={`repeat:${item.id}`} es={item.es} size="card" />
      <p className="text-xl text-soft">{item.en}</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center gap-4"
        >
          <span
            className={`relative flex h-28 w-28 items-center justify-center rounded-full ${
              speaking ? "bg-surface text-accent-text" : "bg-accent text-accent-ink"
            }`}
          >
            {!speaking && (
              <motion.span
                className="absolute inset-0 rounded-full border-4 border-accent"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.45, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <Icon name={speaking ? "speaker" : "mic"} size={44} />
          </span>
          <span className="font-display text-2xl font-bold">{prompt}</span>
        </motion.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={next}
        className="flex h-16 items-center gap-2 rounded-full bg-surface px-8 text-lg font-bold active:scale-95"
      >
        {i + 1 < items.length ? "Siguiente" : "Terminar"} <Icon name="arrowRight" size={20} />
      </button>
    </div>
  );
}

/** Time to say a sentence yourself: about the length of saying it slowly. */
function repeatMs(es: string) {
  return 1800 + es.split(/\s+/).length * 550;
}
