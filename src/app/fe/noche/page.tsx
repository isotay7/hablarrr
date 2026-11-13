"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { faithDay, refLabel, type FaithDayRef } from "@/content/faith/men";
import { Candle, ManBadge, VerseCard } from "@/components/faith/FaithKit";
import { Icon } from "@/components/Icon";
import { CandleGlow, Kicker, Loading, RoundButton } from "@/components/ui";
import { primaryBtn, secondaryBtn } from "@/components/WinScreen";
import { canRead, faithStreak, manComplete, NAME_NOTE, passage, tonight } from "@/lib/faith";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

// Tonight's reading: read, the facts, one question, an optional verse, amén.
// 5–7 minutes, calm, in candlelight.

export default function FaithNightPage() {
  const { ready, data } = useStore();
  const router = useRouter();
  // The day comes from ?d=adan-1; one static page serves them all, so it works offline.
  const [ref] = useState<FaithDayRef | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const id = new URLSearchParams(window.location.search).get("d");
    return id ? faithDay(id) : tonight(data.faith).next ?? undefined;
  });
  // Decided once, so finishing tonight's reading doesn't lock the page mid-way.
  const [allowed] = useState(() => (ref ? canRead(data.faith, ref.id) : false));

  useEffect(() => {
    if (ready && !allowed) router.replace("/fe");
  }, [ready, allowed, router]);

  if (!ready || !ref || !allowed) return <Loading />;
  return <Reading key={ref.id} r={ref} />;
}

function Reading({ r }: { r: FaithDayRef }) {
  const { data, finishFaithDay } = useStore();
  const { stop } = usePlayer();
  const steps = ["Lee", "Los hechos", "Piensa", ...(r.day.verse ? ["Versículo"] : [])];
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState<null | { first: boolean }>(null);
  const [rereading] = useState(() => Boolean(data.faith.done[r.id]));

  useEffect(() => () => stop(), [stop]);

  const last = step === steps.length - 1;
  const next = () => {
    stop();
    if (!last) {
      sfx.tap();
      setStep(step + 1);
      return;
    }
    const first = finishFaithDay(r.id);
    sfx.win();
    setFinished({ first });
  };

  if (finished) return <Done r={r} rereading={rereading} />;

  return (
    <div className="pt-safe relative flex h-full flex-col">
      <CandleGlow />
      <div className="relative flex items-center gap-4 px-5 pb-2 pt-5 sm:px-10">
        <RoundButton icon="close" label="Leave tonight’s reading" href="/fe" />
        <div className="flex flex-1 gap-1.5" role="img" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((s, n) => (
            <span key={s} className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
              <motion.span
                className="block h-full rounded-full bg-accent"
                initial={false}
                animate={{ width: n <= step ? "100%" : "0%" }}
                transition={{ type: "spring", stiffness: 200, damping: 26 }}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-8"
          >
            <div className="flex flex-col gap-1.5">
              <Kicker className="text-accent-text">
                {steps[step]} · {r.man.name}, day {r.dayIndex + 1} of {r.man.days.length}
              </Kicker>
              <h1 className="font-serif text-[clamp(30px,5.5vw,44px)] font-semibold leading-tight">{r.day.title}</h1>
            </div>
            {step === 0 && <ReadStep r={r} />}
            {step === 1 && <FactsStep r={r} />}
            {step === 2 && <ThinkStep r={r} />}
            {step === 3 && r.day.verse && (
              <>
                <p className="text-lg text-soft">
                  Optional. The key verse in Spanish, the way it’s worded in the 1909 Bible. Save it to your review deck if
                  you’d like.
                </p>
                <VerseCard verse={r.day.verse} saveable />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pb-safe relative px-5 sm:px-10">
        <div className="mx-auto mb-8 max-w-2xl">
          <button
            type="button"
            onClick={next}
            className="flex h-20 w-full items-center justify-center gap-2 rounded-3xl bg-accent font-display text-2xl font-extrabold text-accent-ink shadow-[0_6px_0_rgba(0,0,0,0.3)] transition-[transform,box-shadow] duration-100 active:translate-y-[5px] active:shadow-[0_1px_0_rgba(0,0,0,0.3)]"
          >
            {last ? (
              "Amén"
            ) : (
              <>
                Siguiente <Icon name="arrowRight" size={24} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadStep({ r }: { r: FaithDayRef }) {
  const verses = passage(r.day.read);
  const named = verses.some((v) => v.en.includes("Yahweh"));
  return (
    <>
      <div className="text-lg font-bold text-muted">{refLabel(r.day.read)}</div>
      <div className="flex flex-col gap-3 font-serif text-[clamp(20px,3vw,25px)] leading-relaxed">
        {verses.map((v) => (
          <p key={v.key}>
            {v.gap && <span className="mb-3 block text-center text-muted">· · ·</span>}
            <sup className="mr-1.5 font-sans text-[13px] font-bold text-accent-text">{v.label}</sup>
            {v.en}
          </p>
        ))}
      </div>
      {named && <p className="rounded-[20px] bg-note px-5 py-4 text-base leading-snug text-muted">{NAME_NOTE}</p>}
      <p className="text-sm text-muted">World English Bible · public domain</p>
    </>
  );
}

function FactsStep({ r }: { r: FaithDayRef }) {
  return (
    <ul className="flex flex-col gap-4">
      {r.day.facts.map((f, n) => (
        <motion.li
          key={n}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 * n, duration: 0.3 }}
          className="flex gap-4 text-[clamp(18px,2.6vw,21px)] leading-snug"
        >
          <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
          <span>{f}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function ThinkStep({ r }: { r: FaithDayRef }) {
  return (
    <div className="flex flex-col items-center gap-8 pt-4 text-center">
      <Candle size={72} />
      <p className="font-serif text-[clamp(26px,4.4vw,36px)] italic leading-snug">{r.day.question}</p>
      <p className="text-lg text-muted">Take a minute with it. Nothing to write down.</p>
    </div>
  );
}

function Done({ r, rereading }: { r: FaithDayRef; rereading: boolean }) {
  const { data } = useStore();
  const finishedMan = r.dayIndex === r.man.days.length - 1 && manComplete(data.faith, r.man);
  const t = tonight(data.faith);
  return (
    <div className="pt-safe relative flex h-full flex-col items-center justify-center gap-7 overflow-hidden px-6 text-center">
      <CandleGlow />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        className="relative"
      >
        {finishedMan ? <ManBadge man={r.man} earned size={110} /> : <Candle size={84} />}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="relative flex flex-col items-center gap-2"
      >
        <h1 lang="es" className="font-serif text-[clamp(40px,8vw,64px)] font-semibold leading-none">
          {finishedMan ? r.man.es : "Buenas noches"}
        </h1>
        <p className="max-w-md text-xl text-soft">
          {rereading
            ? "Read again. Good to come back to."
            : finishedMan
              ? `You finished ${r.man.name}. His badge is yours, and his recap is ready.`
              : t.next
                ? `Tomorrow night: ${t.next.day.title}.`
                : "You’ve finished the whole path."}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative grid w-full max-w-md grid-cols-2 gap-4"
      >
        <div className="flex flex-col gap-1 rounded-[26px] bg-surface px-3 py-5">
          <span className="font-display text-4xl font-extrabold text-accent-text">{faithStreak(data.faith)}</span>
          <span className="text-muted">night faith streak</span>
        </div>
        <div className="flex flex-col gap-1 rounded-[26px] bg-surface px-3 py-5">
          <span className="font-display text-4xl font-extrabold text-accent-text">
            {t.count}/{t.total}
          </span>
          <span className="text-muted">readings</span>
        </div>
      </motion.div>
      <div className="relative flex flex-wrap justify-center gap-3">
        {finishedMan ? (
          <Link href={`/fe/hombre/?m=${r.man.id}`} className={primaryBtn}>
            See his recap
          </Link>
        ) : (
          <Link href="/" className={primaryBtn}>
            Inicio
          </Link>
        )}
        <Link href="/fe" className={secondaryBtn}>
          Fe
        </Link>
      </div>
    </div>
  );
}
