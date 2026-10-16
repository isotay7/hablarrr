"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { characters, dialogueQuestions, missionQuestions, type MissionQuestion } from "@/content";
import type { Mission } from "@/content/types";
import { Icon } from "@/components/Icon";
import { Sentence } from "@/components/Sentence";
import { Avatar, Kicker, Loading, RoundButton } from "@/components/ui";
import { primaryBtn, secondaryBtn, WinScreen } from "@/components/WinScreen";
import { isoWeek } from "@/lib/dates";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

const QUESTIONS = 5;
const PASS = 4;

/** Even ISO weeks: dinner with the family. Odd weeks: on the road in Mexico. */
function missionOfWeek(week = isoWeek()): Mission {
  return Number(week.slice(-2)) % 2 === 0 ? "family" : "travel";
}

function buildCheck(seed: number, mission: Mission): MissionQuestion[] {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
  const shuffle = <T,>(a: T[]) => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  const own = missionQuestions.filter((q) => q.mission === mission);
  const picked = [...shuffle(own).slice(0, 3), ...shuffle(dialogueQuestions(mission)).slice(0, QUESTIONS - 3)];
  // Shuffle the answer order too, remapping the right answer.
  return shuffle(picked).map((q) => {
    const order = shuffle(q.choices.map((_, i) => i));
    return { ...q, choices: order.map((i) => q.choices[i]), answer: order.indexOf(q.answer) };
  });
}

export default function MissionPage() {
  const { ready, data } = useStore();
  const [attempt, setAttempt] = useState(0);
  if (!ready) return <Loading />;
  // A new attempt remounts the run with fresh questions.
  const seed = [...isoWeek()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, attempt + data.missions.length);
  return <MissionRun key={attempt} seed={seed} onRetry={() => setAttempt((a) => a + 1)} />;
}

function MissionRun({ seed, onRetry }: { seed: number; onRetry: () => void }) {
  const { data, recordMission } = useStore();
  const mission = missionOfWeek();
  const [questions] = useState<MissionQuestion[]>(() => buildCheck(seed, mission));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [reveal, setReveal] = useState(false);
  const { play, stop } = usePlayer();

  const q = questions[idx];

  useEffect(() => {
    if (q) play(`mission:${q.id}`, q.es, { speed: "normal" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);

  useEffect(() => () => stop(), [stop]);

  const finished = idx >= questions.length;
  const score = results.filter(Boolean).length;

  if (finished) {
    const passed = score >= PASS;
    return passed ? (
      <WinScreen
        title={`${score} / ${questions.length}`}
        subtitle={
          mission === "family"
            ? `Mission ready. ${characters.partner.name}’s family will feel the effort.`
            : "Mission ready. Mexico, here you come."
        }
        stats={[
          { value: `${Math.round((score / questions.length) * 100)}%`, label: "correct" },
          { value: data.missions.length, label: "checks taken" },
        ]}
      >
        <button type="button" onClick={onRetry} className={secondaryBtn}>
          Try another
        </button>
        <Link href="/progreso" className={primaryBtn}>
          Back to progress
        </Link>
      </WinScreen>
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        <Kicker className="text-accent-text">Mission check complete</Kicker>
        <div className="font-display text-[120px] font-extrabold leading-none">
          {score}
          <span className="text-5xl text-muted"> / {questions.length}</span>
        </div>
        <p className="max-w-md text-xl leading-relaxed text-soft">
          Good practice. Review your Start Here phrases and try again: you need {PASS} to pass.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onRetry} className={secondaryBtn}>
            Try again
          </button>
          <Link href="/repasar" className={primaryBtn}>
            Review cards
          </Link>
        </div>
      </div>
    );
  }

  const answered = picked !== null;
  const right = answered && picked === q!.answer;

  const choose = (i: number) => {
    if (answered || !q) return;
    const ok = i === q.answer;
    if (ok) sfx.good();
    else sfx.again();
    setPicked(i);
    const nextResults = [...results, ok];
    setResults(nextResults);
    play(`mission:choice`, q.choices[i], { speed: "normal" });
    if (nextResults.length === questions.length) recordMission(nextResults.filter(Boolean).length, questions.length);
  };

  const next = () => {
    sfx.tap();
    setPicked(null);
    setReveal(false);
    setIdx((n) => n + 1);
  };

  return (
    <div className="pt-safe flex h-full flex-col">
      <header className="flex items-center gap-4 px-5 pb-2 pt-5 sm:px-10">
        <RoundButton icon="close" label="Leave mission check" href="/progreso" />
        <div className="min-w-0 flex-1">
          <Kicker className="text-accent-text">Mission check · {isoWeek().replace("-W", " · semana ")}</Kicker>
          <div className="truncate font-display text-2xl font-bold">
            {mission === "family"
              ? `Dinner at ${characters.mom.name} and ${characters.dad.name}’s`
              : "On the road in Mexico"}
          </div>
        </div>
        <div role="img" aria-label={`${score} correct so far`} className="flex gap-2">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full ${
                results[i] === true
                  ? "bg-accent"
                  : results[i] === false
                    ? "bg-terra-soft"
                    : i === idx
                      ? "bg-[color-mix(in_srgb,var(--text)_45%,transparent)]"
                      : "bg-[var(--line)]"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={q!.id + idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-6 sm:px-10"
          >
            <div className="flex flex-col items-center gap-5 rounded-[36px] bg-surface p-8 text-center">
              <div className="flex items-center gap-3">
                <Avatar who={q!.who} size={44} />
                <span className="text-lg text-soft">
                  <b className="text-text">{characters[q!.who].name}</b> {q!.setup}
                </span>
              </div>
              <button
                type="button"
                onClick={() => play(`mission:${q!.id}`, q!.es, { speed: "normal" })}
                aria-label={`Listen to ${characters[q!.who].name}`}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-accent text-accent-ink active:scale-95"
              >
                <motion.span
                  className="absolute inset-0 rounded-full border-4 border-accent"
                  animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
                <Icon name="speaker" size={46} />
              </button>
              {answered || reveal ? (
                <Sentence id={`mission:${q!.id}`} es={q!.es} size="card" className="!text-[clamp(30px,5vw,44px)]" />
              ) : (
                <button
                  type="button"
                  onClick={() => setReveal(true)}
                  className="h-11 rounded-full border border-line px-5 text-[15px] font-bold text-muted"
                >
                  Listen first · show text
                </button>
              )}
              {answered && <p className="text-lg text-soft">{q!.en}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-muted">Your reply</span>
              {q!.choices.map((c, i) => {
                const isAns = i === q!.answer;
                const isPick = i === picked;
                let look = "border-line bg-card text-text";
                if (answered && isAns) look = "border-accent bg-accent text-accent-ink";
                else if (answered && isPick)
                  look = "border-terra-soft bg-[color-mix(in_srgb,var(--terra-soft)_22%,transparent)] text-text";
                else if (answered) look = "border-line bg-card text-muted";
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => choose(i)}
                    animate={answered && isPick && !isAns ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
                    transition={{ duration: 0.4 }}
                    lang="es"
                    className={`flex min-h-[84px] items-center gap-4 rounded-3xl border-2 px-6 text-left font-display text-[clamp(20px,3vw,26px)] font-bold transition-colors active:scale-[0.98] ${look}`}
                  >
                    <span className="flex-1">{c}</span>
                    {answered && (isAns || isPick) && (
                      <span className="shrink-0 font-sans text-[15px] font-extrabold">
                        {isAns ? "Correct" : "Your pick"}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center ${
                  right ? "bg-learn" : "bg-[color-mix(in_srgb,var(--terra-soft)_18%,transparent)]"
                }`}
              >
                <div className="flex-1">
                  <div className="font-display text-[22px] font-extrabold">
                    {right ? "¡Eso! Perfect." : "Casi. Almost."}
                  </div>
                  <div className="text-[17px] leading-snug text-soft">{q!.why}</div>
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="h-14 shrink-0 rounded-full bg-text px-7 text-[17px] font-extrabold text-bg active:scale-95"
                >
                  {idx + 1 < questions.length ? "Siguiente" : "See score"}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
