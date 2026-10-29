"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { gameInfo } from "@/components/games/catalog";
import { GameIntro, GameOver, GameTopBar, Locked, Pill } from "@/components/games/GameKit";
import { Icon } from "@/components/Icon";
import { Avatar, Loading } from "@/components/ui";
import { characters } from "@/content";
import type { Phrase } from "@/content/types";
import { learnedPhrases, shuffle, useGameReview } from "@/lib/games";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import {
  MAIN_PATH,
  TACO_SCENE,
  tacoStandReady,
  usableGood,
  WEIRD,
  WEIRD_GENERIC,
  type GoodAnswer,
  type Moment,
  type Say,
} from "@/lib/tacos";

const info = gameInfo("tacos");

export default function TacosPage() {
  const { ready, data } = useStore();
  const [stage, setStage] = useState<"intro" | "play" | "over">("intro");
  const [run, setRun] = useState(0);
  const [result, setResult] = useState({ tips: 0, perfect: false, good: 0 });
  if (!ready) return <Loading />;

  const learned = learnedPhrases(data.deck);
  const standing = tacoStandReady(learned);
  const best = data.progress.games.tacos?.best;

  return (
    <div className="pt-safe flex h-full flex-col">
      <GameTopBar title={info.es} />
      <div className="min-h-0 flex-1">
        {!standing.ready ? (
          <Locked need={standing.need} have={standing.have} what="taco stand moments you can answer" />
        ) : stage === "intro" ? (
          <GameIntro
            title={info.es}
            how="It’s late, you’re hungry, and the taquero is waiting. Answer with phrases you know: good answers earn tips, weird ones get… reactions."
            best={best ? `Best tips: $${best}` : undefined}
            icon={info.icon}
            tone={info.tone}
            onStart={() => setStage("play")}
          />
        ) : stage === "play" ? (
          <Play
            key={run}
            learned={learned}
            onDone={(r) => {
              setResult(r);
              setStage("over");
            }}
          />
        ) : (
          <GameOver
            result={{ game: "tacos", score: result.tips, correct: result.good, perfect: result.perfect, tips: result.tips }}
            title={result.perfect ? "¡Taquero de oro!" : "¡Buen provecho!"}
            subtitle={result.perfect ? "Every answer was perfect. The taquero loves you." : "Tacos in hand. Try for a perfect run!"}
            scoreLabel="pesos in tips"
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

interface Bubble {
  key: string;
  who: "taquero" | "me" | "action";
  es?: string;
  en?: string;
  tip?: number;
  weird?: boolean;
}

interface Choice {
  phrase: Phrase;
  good?: GoodAnswer;
}

/** Up to two good answers you know, plus learned phrases that make no sense here. */
function choicesFor(m: Moment, learned: Phrase[], ids: Set<string>): Choice[] {
  const goods = shuffle(usableGood(m, ids)).slice(0, 2);
  const goodIds = new Set(m.good.map((g) => g.id));
  // Favor answers with their own funny reaction.
  const others = shuffle(learned.filter((p) => !goodIds.has(p.id)));
  const funny = others.filter((p) => WEIRD[p.id]);
  const plain = others.filter((p) => !WEIRD[p.id]);
  const weird = [...funny.slice(0, 1), ...plain, ...funny.slice(1)].slice(0, 3 - goods.length);
  return shuffle([
    ...goods.map((g) => ({ phrase: learned.find((p) => p.id === g.id)!, good: g })),
    ...weird.map((phrase) => ({ phrase })),
  ]);
}

function nextMoment(m: Moment, g: GoodAnswer): Moment | undefined {
  if (g.goto) return TACO_SCENE.find((x) => x.id === g.goto);
  const at = TACO_SCENE.indexOf(m);
  return TACO_SCENE.slice(at + 1).find((x) => !x.branch);
}

function Play({
  learned,
  onDone,
}: {
  learned: Phrase[];
  onDone: (r: { tips: number; perfect: boolean; good: number }) => void;
}) {
  const { play, stop } = usePlayer();
  const review = useGameReview();
  const ids = useMemo(() => new Set(learned.map((p) => p.id)), [learned]);
  const [moment, setMoment] = useState<Moment>(MAIN_PATH[0]);
  const [bubbles, setBubbles] = useState<Bubble[]>([{ key: "0", who: "action", en: MAIN_PATH[0].action }]);
  const [choices, setChoices] = useState<Choice[]>(() => choicesFor(MAIN_PATH[0], learned, ids));
  const [waiting, setWaiting] = useState(true);
  const [tips, setTips] = useState(0);
  const [lastTip, setLastTip] = useState<{ n: number; key: number } | null>(null);
  const missedHere = useRef(false);
  const stats = useRef({ perfect: true, good: 0, weird: 0 });
  const end = useRef<HTMLDivElement>(null);

  const say = (b: Omit<Bubble, "key">) => setBubbles((list) => [...list, { ...b, key: `${list.length}` }]);

  /** Speaks, then runs `then` once, even if speech never reports that it ended. */
  const speakThen = (id: string, text: string, then: () => void) => {
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      then();
    };
    play(id, text, { onEnd: once });
    setTimeout(once, 1500 + text.length * 90);
  };

  const enter = (m: Moment) => {
    missedHere.current = false;
    setWaiting(true);
    setChoices(choicesFor(m, learned, ids));
    say({ who: "action", en: m.action });
    setMoment(m);
  };

  // Each moment: what happens, then the taquero's line, then your options.
  useEffect(() => {
    const t = setTimeout(() => {
      say({ who: "taquero", es: moment.line.es, en: moment.line.en });
      speakThen(`tacos:${moment.id}`, moment.line.es, () => setWaiting(false));
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment]);

  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bubbles, waiting]);

  const pick = (c: Choice) => {
    if (waiting) return;
    stop();
    say({ who: "me", es: c.phrase.es, en: c.phrase.en });
    setWaiting(true);

    if (c.good) {
      const g = c.good;
      review(g.id, true);
      stats.current.good++;
      const tip = missedHere.current ? 0 : g.tip;
      if (tip) {
        setTips((t) => t + tip);
        setLastTip((l) => ({ n: tip, key: (l?.key ?? 0) + 1 }));
      }
      sfx.good();
      setTimeout(() => {
        say({ who: "taquero", es: g.reply.es, en: g.reply.en, tip });
        speakThen(`tacos:${moment.id}:r`, g.reply.es, () => {
          const next = nextMoment(moment, g);
          setTimeout(() => {
            if (next) enter(next);
            else onDone({ tips: tips + tip, perfect: stats.current.perfect, good: stats.current.good });
          }, 600);
        });
      }, 500);
      return;
    }

    // A weird answer: a funny reaction, no tip here, and try again.
    stats.current.perfect = false;
    missedHere.current = true;
    for (const g of usableGood(moment, ids)) review(g.id, false);
    sfx.again();
    const r: Say = WEIRD[c.phrase.id] ?? WEIRD_GENERIC[stats.current.weird++ % WEIRD_GENERIC.length];
    setTimeout(() => {
      say({ who: "taquero", es: r.es, en: r.en, weird: true });
      setChoices((list) => list.filter((x) => x.phrase.id !== c.phrase.id));
      speakThen(`tacos:${moment.id}:w`, r.es, () => setWaiting(false));
    }, 500);
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-4 sm:px-8">
      <div className="flex items-center justify-between gap-3 pb-2">
        <span className="flex items-center gap-2 text-[15px] font-bold text-muted">
          <Icon name="taco" size={20} /> Tacos “El Güero” · 11:40 pm
        </span>
        <span className="relative">
          <Pill icon="coin" hot={tips > 0}>
            ${tips}
          </Pill>
          <AnimatePresence>
            {lastTip && (
              <motion.span
                key={lastTip.key}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 1, 0], y: -36 }}
                transition={{ duration: 1.3 }}
                className="pointer-events-none absolute -top-2 right-2 font-display text-xl font-extrabold text-accent-text"
              >
                +${lastTip.n}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-3">
        {bubbles.map((b) =>
          b.who === "action" ? (
            <motion.p
              key={b.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-6 text-center text-[16px] italic text-muted"
            >
              {b.en}
            </motion.p>
          ) : (
            <motion.div
              key={b.key}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`flex items-end gap-2.5 ${b.who === "me" ? "flex-row-reverse" : ""}`}
            >
              {b.who === "taquero" && <Avatar who="taquero" size={40} />}
              <div
                className={`flex max-w-[82%] flex-col gap-0.5 rounded-[22px] px-4 py-3 ${
                  b.who === "me"
                    ? "bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface))]"
                    : b.weird
                      ? "bg-[color-mix(in_srgb,var(--terra-soft)_18%,var(--surface))]"
                      : "bg-surface"
                }`}
              >
                {b.who === "taquero" && (
                  <span className="text-[13px] font-bold text-muted">{characters.taquero.name}</span>
                )}
                <span lang="es" className="font-display text-[clamp(20px,3.4vw,26px)] font-bold leading-snug">
                  {b.es}
                </span>
                <span className="text-[15px] text-soft">{b.en}</span>
                {!!b.tip && <span className="text-[14px] font-extrabold text-accent-text">+${b.tip} de propina</span>}
              </div>
            </motion.div>
          ),
        )}
        <div ref={end} />
      </div>

      <div className="pb-safe">
        <div className="mb-6 flex min-h-[236px] flex-col justify-end gap-2.5 pt-2">
          <AnimatePresence>
            {!waiting &&
              choices.map((c, i) => (
                <motion.button
                  key={`${moment.id}:${c.phrase.id}`}
                  type="button"
                  lang="es"
                  onClick={() => pick(c)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.05 }}
                  className="min-h-[68px] rounded-3xl border-2 border-line bg-card px-5 text-left font-display text-[clamp(19px,3vw,24px)] font-bold active:scale-[0.98]"
                >
                  {c.phrase.es}
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
