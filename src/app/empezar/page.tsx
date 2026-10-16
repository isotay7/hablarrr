"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { characters, phrases, STAGE1_TOTAL, UNLOCK_DIALOGUES, UNLOCK_STORIES } from "@/content";
import type { Phrase } from "@/content/types";
import { Icon } from "@/components/Icon";
import { ReviewSession } from "@/components/ReviewSession";
import { Sentence } from "@/components/Sentence";
import { Avatar, CandleGlow, Kicker, Loading, MissionChip, RoundButton } from "@/components/ui";
import { primaryBtn, secondaryBtn, WinScreen } from "@/components/WinScreen";
import { celebrate } from "@/lib/celebrate";
import { dayKey } from "@/lib/dates";
import { usePlayer } from "@/lib/player";
import { isDue } from "@/lib/srs";
import { sfx } from "@/lib/sounds";
import { stage1Started, startHere, streak } from "@/lib/stats";
import { useStore } from "@/lib/store";

// Start Here: five new phrases a day, each through a short loop, then a review
// of earlier phrases and a celebration. English is always shown here.

type Stage = "intro" | "learn" | "review" | "done";
const STEPS = ["Escucha", "Pronuncia", "Dilo", "Quiz", "En contexto"] as const;
const MAX_REVIEW = 15;

export default function StartHerePage() {
  const { ready, data } = useStore();
  // Snapshot the plan once so it doesn't shift while phrases are added.
  // Home links here with #mas to learn 5 more after today's are done.
  const [plan, setPlan] = useState(() =>
    startHere(data.deck, { extra: typeof window !== "undefined" && window.location.hash === "#mas" }),
  );
  const [stage, setStage] = useState<Stage>("intro");
  const [i, setI] = useState(0);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [learnedNow, setLearnedNow] = useState(0);

  const startReview = useCallback(() => {
    const todayStart = new Date(dayKey() + "T00:00:00").getTime();
    const ids = data.deck
      .filter((c) => c.stage1 && c.createdAt < todayStart && isDue(c))
      .sort((a, b) => a.fsrs.due - b.fsrs.due)
      .slice(0, MAX_REVIEW)
      .map((c) => c.id);
    if (ids.length) {
      setReviewIds(ids);
      setStage("review");
    } else setStage("done");
  }, [data.deck]);

  if (!ready) return <Loading />;

  const total = plan.next.length;
  const phrase = plan.next[i];

  const onPhraseDone = () => {
    setLearnedNow((n) => n + 1);
    if (i + 1 < total) setI(i + 1);
    else startReview();
  };

  return (
    <div className="pt-safe relative flex h-full flex-col">
      {stage !== "done" && (
        <div className="flex items-center gap-4 px-5 pb-2 pt-5 sm:px-10">
          <RoundButton icon="close" label="Leave Start Here" href="/" />
          {stage === "learn" ? (
            <LoopProgress phraseIndex={i} total={total} />
          ) : (
            <Kicker className="flex-1 text-accent-text">
              Empieza aquí · Día {plan.day}
              {stage === "review" ? " · repaso" : ""}
            </Kicker>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1">
        {stage === "intro" && (
          <Intro
            plan={plan}
            onMore={() => {
              sfx.tap();
              setPlan(startHere(data.deck, { extra: true }));
            }}
            onStart={() => {
              sfx.tap();
              if (total) setStage("learn");
              else startReview();
            }}
          />
        )}
        {stage === "learn" && phrase && (
          <PhraseLoop key={phrase.id} phrase={phrase} last={i + 1 === total} onDone={onPhraseDone} />
        )}
        {stage === "review" && (
          <ReviewSession initialIds={reviewIds} onDone={() => setStage("done")} label="Repaso · frases anteriores" />
        )}
        {stage === "done" && <Done before={plan.started} learnedNow={learnedNow} day={plan.day} />}
      </div>
    </div>
  );
}

function LoopProgress({ phraseIndex, total }: { phraseIndex: number; total: number }) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="flex flex-1 gap-1.5" role="img" aria-label={`Phrase ${phraseIndex + 1} of ${total}`}>
        {Array.from({ length: total }, (_, n) => (
          <span key={n} className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
            <motion.span
              className="block h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: n < phraseIndex ? "100%" : n === phraseIndex ? "50%" : "0%" }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
            />
          </span>
        ))}
      </div>
      <span className="shrink-0 text-base font-bold tabular-nums text-muted">
        {phraseIndex + 1} / {total}
      </span>
    </div>
  );
}

function Intro({
  plan,
  onStart,
  onMore,
}: {
  plan: ReturnType<typeof startHere>;
  onStart: () => void;
  onMore: () => void;
}) {
  const nothingNew = plan.next.length === 0;
  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <CandleGlow />
      <div className="relative mx-auto flex min-h-full max-w-2xl flex-col justify-center gap-7 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[clamp(40px,8vw,64px)] font-extrabold leading-[1.02] tracking-[-0.02em]">
            {plan.finished
              ? "¡Las 50 frases!"
              : nothingNew
                ? "Hoy ya terminaste."
                : `${plan.next.length} frases nuevas`}
          </h1>
          <p className="text-lg text-soft">
            {plan.finished
              ? "You’ve learned every Start Here phrase. Keep them fresh with a quick review."
              : nothingNew
                ? "Today’s 5 phrases are done. Review earlier ones, or learn 5 more if you’re on a roll."
                : "For each one: listen, learn the sounds, say it out loud, a quick quiz, then see it in a real moment."}
          </p>
        </div>

        {!nothingNew && (
          <ol className="flex flex-col gap-2.5">
            {plan.next.map((p, n) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * n, type: "spring", stiffness: 300, damping: 26 }}
                className="flex items-center gap-4 rounded-[22px] bg-surface px-5 py-4"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span lang="es" className="font-display text-[24px] font-bold leading-tight">
                    {p.es}
                  </span>
                  <span className="text-muted">{p.en}</span>
                </span>
                <MissionChip mission={p.mission} className="shrink-0" />
              </motion.li>
            ))}
          </ol>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="h-20 rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-100 active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)]"
          >
            {nothingNew ? "Repasar" : "Empezar"}
          </button>
          {nothingNew && !plan.finished && (
            <button
              type="button"
              onClick={onMore}
              className="flex h-14 items-center justify-center rounded-full border border-line text-lg font-bold active:scale-95"
            >
              Learn 5 more today
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** One phrase, five steps: hear, pronounce, say, quiz, scene. */
function PhraseLoop({ phrase, last, onDone }: { phrase: Phrase; last: boolean; onDone: () => void }) {
  const { learnPhrase } = useStore();
  const { play, stop } = usePlayer();
  const [step, setStep] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const id = `start:${phrase.id}`;

  useEffect(() => () => stop(), [stop]);

  const next = () => {
    sfx.tap();
    stop();
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      learnPhrase(phrase.id, quizCorrect ?? false);
      onDone();
    }
  };

  const canContinue = step !== 3 || quizCorrect !== null;
  const label = step < STEPS.length - 1 ? "Siguiente" : last ? "Terminar" : "Siguiente frase";

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-center gap-2 px-5 pt-2" aria-hidden="true">
        {STEPS.map((s, n) => (
          <span
            key={s}
            className={`rounded-full px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.06em] transition-colors ${
              n === step ? "bg-accent text-accent-ink" : n < step ? "bg-learn text-accent-text" : "text-muted"
            }`}
          >
            <span className="hidden sm:inline">{s}</span>
            <span className="sm:hidden">{n + 1}</span>
          </span>
        ))}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-7 px-6 py-8 text-center"
          >
            {step === 0 && <HearStep phrase={phrase} id={id} play={play} />}
            {step === 1 && <GuideStep phrase={phrase} id={id} play={play} />}
            {step === 2 && <SayStep phrase={phrase} id={id} play={play} />}
            {step === 3 && (
              <QuizStep phrase={phrase} id={id} play={play} picked={quizCorrect} onPick={setQuizCorrect} />
            )}
            {step === 4 && <SceneStep phrase={phrase} play={play} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-safe px-5 sm:px-10">
        <div className="mx-auto mb-8 max-w-2xl">
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="flex h-20 w-full items-center justify-center gap-2 rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow,opacity] duration-100 active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)] disabled:opacity-30"
          >
            {label} <Icon name="arrowRight" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

type Play = ReturnType<typeof usePlayer>["play"];

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Kicker className="text-accent-text">
        {n} · {STEPS[n - 1]}
      </Kicker>
      <span className="text-lg text-soft">{children}</span>
    </div>
  );
}

function ListenButtons({ onNormal, onSlow }: { onNormal: () => void; onSlow: () => void }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onNormal}
        className="flex h-14 items-center gap-2 rounded-full bg-surface px-6 text-[17px] font-bold active:scale-95"
      >
        <Icon name="speaker" size={20} /> Escuchar
      </button>
      <button
        type="button"
        onClick={onSlow}
        className="flex h-14 items-center gap-2 rounded-full bg-surface px-6 text-[17px] font-bold active:scale-95"
      >
        <Icon name="turtle" size={22} /> Lento
      </button>
    </div>
  );
}

function HearStep({ phrase, id, play }: { phrase: Phrase; id: string; play: Play }) {
  useEffect(() => {
    play(id, phrase.es, { speed: "slow" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <StepTitle n={1}>Just listen. Here’s what it means.</StepTitle>
      <Sentence id={id} es={phrase.es} size="card" />
      <p className="font-display text-[clamp(24px,4vw,34px)] font-semibold text-soft">“{phrase.en}”</p>
      {phrase.note && <p className="max-w-md text-lg leading-snug text-muted">{phrase.note}</p>}
      <ListenButtons
        onNormal={() => play(id, phrase.es, { speed: "normal" })}
        onSlow={() => play(id, phrase.es, { speed: "slow" })}
      />
    </>
  );
}

/** "MOO-choh GOOS-toh" with the stressed syllables lit up. */
function SayGuide({ say, className = "" }: { say: string; className?: string }) {
  const parts = say.split(/([\s-]+)/);
  return (
    <p className={`font-display font-bold tracking-[0.02em] ${className}`} aria-label={`Sounds like: ${say}`}>
      {parts.map((part, n) => {
        const stressed = /[A-Z]/.test(part) && part === part.toUpperCase();
        return (
          <span key={n} className={stressed ? "text-accent-text" : /^[\s-]+$/.test(part) ? "text-muted" : ""}>
            {part}
          </span>
        );
      })}
    </p>
  );
}

function GuideStep({ phrase, id, play }: { phrase: Phrase; id: string; play: Play }) {
  useEffect(() => {
    play(id, phrase.es, { speed: "normal" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <StepTitle n={2}>Sounds like this. The bright part gets the stress.</StepTitle>
      <Sentence id={id} es={phrase.es} size="card" />
      <div className="w-full rounded-[32px] bg-surface px-6 py-7">
        <SayGuide say={phrase.say} className="text-[clamp(28px,5vw,44px)] leading-tight" />
      </div>
      <p className="text-lg text-muted">“{phrase.en}”</p>
      <ListenButtons
        onNormal={() => play(id, phrase.es, { speed: "normal" })}
        onSlow={() => play(id, phrase.es, { speed: "slow" })}
      />
    </>
  );
}

function SayStep({ phrase, id, play }: { phrase: Phrase; id: string; play: Play }) {
  const [turn, setTurn] = useState(false);
  const listen = useCallback(() => {
    setTurn(false);
    play(id, phrase.es, { speed: "slow", onEnd: () => setTurn(true) });
  }, [id, phrase.es, play]);
  useEffect(() => {
    play(id, phrase.es, { speed: "slow", onEnd: () => setTurn(true) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <StepTitle n={3}>Say it out loud, twice. Slow is fine.</StepTitle>
      <Sentence id={id} es={phrase.es} size="card" />
      <SayGuide say={phrase.say} className="text-[clamp(20px,3.2vw,28px)]" />
      <p className="text-lg text-muted">“{phrase.en}”</p>
      <span
        className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-colors ${
          turn ? "bg-accent text-accent-ink" : "bg-surface text-accent-text"
        }`}
      >
        {turn && (
          <motion.span
            className="absolute inset-0 rounded-full border-4 border-accent"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <Icon name={turn ? "mic" : "speaker"} size={52} />
      </span>
      <span className="font-display text-2xl font-bold">{turn ? "Tu turno. Your turn!" : "Escucha…"}</span>
      <button
        type="button"
        onClick={listen}
        className="flex h-14 items-center gap-2 rounded-full bg-surface px-6 text-[17px] font-bold active:scale-95"
      >
        <Icon name="speaker" size={20} /> Otra vez
      </button>
    </>
  );
}

function QuizStep({
  phrase,
  id,
  play,
  picked,
  onPick,
}: {
  phrase: Phrase;
  id: string;
  play: Play;
  picked: boolean | null;
  onPick: (correct: boolean) => void;
}) {
  const choices = useMemo(() => quizChoices(phrase), [phrase]);
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;

  const choose = (n: number) => {
    if (answered) return;
    const ok = choices[n] === phrase.en;
    setChosen(n);
    if (picked === null) onPick(ok);
    if (ok) celebrate("small");
    else sfx.again();
  };

  return (
    <>
      <StepTitle n={4}>What does it mean?</StepTitle>
      <button
        type="button"
        onClick={() => play(id, phrase.es, { speed: "normal" })}
        className="flex flex-col items-center gap-3"
        aria-label="Listen again"
      >
        <Sentence id={id} es={phrase.es} size="card" />
        <span className="flex items-center gap-2 text-muted">
          <Icon name="speaker" size={18} /> Tap to listen
        </span>
      </button>
      <div className="flex w-full flex-col gap-3">
        {choices.map((c, n) => {
          const isAns = c === phrase.en;
          const isPick = n === chosen;
          let look = "border-line bg-card text-text";
          if (answered && isAns) look = "border-accent bg-accent text-accent-ink";
          else if (answered && isPick)
            look = "border-terra-soft bg-[color-mix(in_srgb,var(--terra-soft)_22%,transparent)] text-text";
          else if (answered) look = "border-line bg-card text-muted";
          return (
            <motion.button
              key={c}
              type="button"
              onClick={() => choose(n)}
              animate={answered && isPick && !isAns ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={`flex min-h-[72px] items-center gap-3 rounded-3xl border-2 px-6 text-left text-[clamp(18px,2.6vw,22px)] font-bold transition-colors active:scale-[0.98] ${look}`}
            >
              <span className="flex-1">{c}</span>
              {answered && isAns && <Icon name="check" size={24} strokeWidth={3} />}
            </motion.button>
          );
        })}
      </div>
      {answered && (
        <p className="font-display text-2xl font-extrabold">
          {choices[chosen] === phrase.en ? "¡Eso! That’s it." : "Casi. Now you know it."}
        </p>
      )}
    </>
  );
}

/** The right meaning plus two others, preferring phrases you've already met. */
function quizChoices(phrase: Phrase): string[] {
  const at = phrases.findIndex((p) => p.id === phrase.id);
  const earlier = phrases.slice(0, at).filter((p) => p.en !== phrase.en);
  const pool = earlier.length >= 2 ? earlier : phrases.filter((p) => p.id !== phrase.id && p.en !== phrase.en);
  let h = [...phrase.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 17);
  const pick = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h;
  };
  const others: string[] = [];
  while (others.length < 2 && others.length < pool.length) {
    const c = pool[pick() % pool.length].en;
    if (!others.includes(c)) others.push(c);
  }
  const all = [phrase.en, ...others];
  for (let n = all.length - 1; n > 0; n--) {
    const j = pick() % (n + 1);
    [all[n], all[j]] = [all[j], all[n]];
  }
  return all;
}

function SceneStep({ phrase, play }: { phrase: Phrase; play: Play }) {
  const lines = phrase.scene.lines;
  const playAll = useCallback(() => {
    play(`scene:${phrase.id}:0`, lines[0].es, {
      onEnd: () => setTimeout(() => play(`scene:${phrase.id}:1`, lines[1].es), 350),
    });
  }, [lines, phrase.id, play]);
  useEffect(() => {
    playAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <Kicker className="text-accent-text">5 · {STEPS[4]}</Kicker>
        <span className="flex items-center gap-2 text-lg text-soft">
          {phrase.scene.where} <MissionChip mission={phrase.scene.mission} />
        </span>
      </div>
      <div className="flex w-full flex-col gap-4 text-left">
        {lines.map((l, n) => {
          const me = l.who === "me";
          return (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + n * 0.25, type: "spring", stiffness: 300, damping: 26 }}
              className={`flex items-start gap-3 ${me ? "flex-row-reverse" : ""}`}
            >
              <Avatar who={l.who} size={48} />
              <div
                className={`flex min-w-0 max-w-[85%] flex-col gap-1 rounded-[26px] px-5 py-4 ${
                  me ? "bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))]" : "bg-surface"
                }`}
              >
                <span className="text-[15px] font-bold text-muted">{characters[l.who].name}</span>
                <Sentence id={`scene:${phrase.id}:${n}`} es={l.es} className="!text-[clamp(24px,4vw,34px)]" />
                <span className="text-[17px] text-soft">{l.en}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={playAll}
        className="flex h-14 items-center gap-2 rounded-full bg-surface px-6 text-[17px] font-bold active:scale-95"
      >
        <Icon name="play" size={18} /> Escuchar la escena
      </button>
    </>
  );
}

function Done({ before, learnedNow, day }: { before: number; learnedNow: number; day: number }) {
  const { data } = useStore();
  const after = stage1Started(data.deck);
  const unlockedDialogues = before < UNLOCK_DIALOGUES && after >= UNLOCK_DIALOGUES;
  const unlockedStories = before < UNLOCK_STORIES && after >= UNLOCK_STORIES;
  const subtitle = unlockedStories
    ? "All 50 phrases! Stories and Solo español are unlocked."
    : unlockedDialogues
      ? "20 phrases: the dialogues are unlocked. ¡Felicidades!"
      : learnedNow
        ? "Five more phrases you can use tomorrow. See you then."
        : "Review done. Your phrases are fresh.";
  return (
    <WinScreen
      title={`¡Día ${day} listo!`}
      subtitle={subtitle}
      stats={[
        { value: learnedNow, label: learnedNow === 1 ? "new phrase" : "new phrases" },
        { value: `${after}/${STAGE1_TOTAL}`, label: "Start Here" },
        { value: streak(data.days), label: "day streak", hot: true },
      ]}
    >
      <Link href="/" className={primaryBtn}>
        Inicio
      </Link>
      {unlockedDialogues || unlockedStories ? (
        <Link href="/leer" className={secondaryBtn}>
          See what’s new
        </Link>
      ) : (
        <Link href="/chill" className={secondaryBtn}>
          Modo chill
        </Link>
      )}
    </WinScreen>
  );
}
