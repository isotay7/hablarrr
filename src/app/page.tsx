"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { characters, lessons, phrases, STAGE2_GOAL } from "@/content";
import { Icon } from "@/components/Icon";
import { SegmentMeter } from "@/components/Meters";
import { PapelPicado } from "@/components/PapelPicado";
import { SaveButton } from "@/components/SaveButton";
import { CandleGlow, Kicker, Loading, RoundButton, SoundToggle, ThemeToggle } from "@/components/ui";
import { dayKey, greeting, isoWeek } from "@/lib/dates";
import { usePlayer } from "@/lib/player";
import { hasMexicanVoice, onVoicesChanged, speechSupported } from "@/lib/speech";
import { isDue } from "@/lib/srs";
import { minutesOn, stage1Progress, streak, wordsKnown } from "@/lib/stats";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 300, damping: 28, delay: 0.04 * i },
});

export default function Home() {
  const { ready, data } = useStore();
  const { play, playingId, stop } = usePlayer();
  if (!ready) return <Loading />;

  const hello = greeting();
  const s1 = stage1Progress(data.deck, data.reviews);
  const due = data.deck.filter((c) => isDue(c)).length;
  const today = minutesOn(data.days, dayKey());
  const goal = data.settings.dailyGoalMinutes;
  const nights = streak(data.days);
  const checkedThisWeek = data.missions.find((m) => m.week === isoWeek());
  const known = wordsKnown(data.words);

  const inProgress =
    lessons.find((l) => {
      const r = data.reading.find((x) => x.lessonId === l.id);
      return r && !r.finished && r.linesRead > 0;
    }) ?? lessons.find((l) => !data.reading.find((x) => x.lessonId === l.id)?.finished);
  const reading = inProgress && data.reading.find((r) => r.lessonId === inProgress.id);

  // Phrase of the night: same all day, different tomorrow.
  const n = [...dayKey()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const phrase = phrases[n % phrases.length];
  const phraseId = `night:${phrase.id}`;

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <CandleGlow />
      <PapelPicado className="absolute inset-x-0 top-0 h-24" />
      <div className="pt-safe relative mx-auto flex max-w-3xl flex-col gap-5 px-5 pb-10 sm:px-8">
        <motion.header {...rise(0)} className="flex items-start justify-between gap-4 pt-24">
          <div className="flex flex-col gap-1.5">
            <h1
              lang="es"
              className="font-display text-[clamp(40px,7.5vw,60px)] font-bold leading-[1.02] tracking-[-0.02em]"
            >
              {hello.es}, {characters.me.name}
            </h1>
            <p className="text-lg text-muted">{hello.en}. A little Spanish before bed?</p>
          </div>
          <div className="flex shrink-0 gap-2 pt-1">
            <SoundToggle />
            <ThemeToggle />
            <RoundButton icon="settings" label="Settings" href="/ajustes" />
          </div>
        </motion.header>

        <Hints />

        <motion.div {...rise(1)}>
          <Link
            href="/progreso"
            className="flex flex-col gap-4 rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-card px-6 py-5 transition-transform active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Kicker className="text-accent-text">Misión · la cena con la familia</Kicker>
                <div className="font-display text-[clamp(22px,3.4vw,28px)] font-bold leading-tight">
                  {s1.complete ? "Etapa 2: 800 palabras" : "Etapa 1: 50 frases de confianza"}
                </div>
              </div>
              <div className="shrink-0 font-display text-[34px] font-extrabold text-accent-text">
                {s1.complete ? known : s1.learned}
                <span className="text-xl text-muted"> / {s1.complete ? STAGE2_GOAL : s1.total}</span>
              </div>
            </div>
            <SegmentMeter learned={s1.learned} learning={s1.learning} total={s1.total} />
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[15px] font-semibold text-muted">
              <span>
                Recall <b className="text-text">{s1.recall === null ? "—" : `${Math.round(s1.recall * 100)}%`}</b> ·
                goal 80%
              </span>
              <span>
                Mission check ·{" "}
                <b className="text-text">
                  {checkedThisWeek ? `${checkedThisWeek.score}/${checkedThisWeek.total} this week` : "due this week"}
                </b>
              </span>
              {!s1.complete && (
                <span className="flex items-center gap-1.5">
                  <Icon name="lock" size={15} strokeWidth={2.4} /> Etapa 2 · {STAGE2_GOAL} palabras
                </span>
              )}
            </div>
          </Link>
        </motion.div>

        <motion.div {...rise(2)} className="flex flex-wrap gap-2.5">
          <span className="flex items-center gap-2 rounded-full bg-learn px-4 py-2.5 text-[17px] font-bold text-accent-text">
            <Icon name="flame" size={20} />
            {nights === 1 ? "Racha de 1 noche" : `Racha de ${nights} noches`}
          </span>
          <span className="flex items-center rounded-full bg-surface px-4 py-2.5 text-[17px] font-semibold text-muted">
            {today} de {goal} min hoy
          </span>
        </motion.div>

        <motion.div {...rise(3)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/chill"
            onClick={() => sfx.tap()}
            className="relative flex h-[200px] flex-col justify-between overflow-hidden rounded-[32px] bg-terra p-6 text-[#FFF6EA] shadow-[0_20px_50px_color-mix(in_srgb,var(--terra)_30%,transparent)] transition-transform active:scale-[0.97] sm:h-[220px]"
          >
            <span aria-hidden className="absolute -right-8 top-8 h-48 w-36 rotate-[10deg] rounded-3xl bg-white/12" />
            <span aria-hidden className="absolute right-3 top-14 h-48 w-36 -rotate-[4deg] rounded-3xl bg-white/18" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/18">
              <Icon name="arrowUp" size={26} />
            </span>
            <span className="relative flex flex-col gap-1.5">
              <span className="font-display text-[34px] font-bold leading-none">Modo chill</span>
              <span className="max-w-60 text-base leading-snug">
                Swipe through phrases, little dialogues and stories.
              </span>
            </span>
          </Link>
          <Link
            href="/enfoque"
            onClick={() => sfx.tap()}
            className="relative flex h-[200px] flex-col justify-between overflow-hidden rounded-[32px] bg-blue p-6 text-[#F4F7FF] shadow-[0_20px_50px_color-mix(in_srgb,var(--blue)_30%,transparent)] transition-transform active:scale-[0.97] sm:h-[220px]"
          >
            <svg
              aria-hidden
              width="190"
              height="190"
              viewBox="0 0 190 190"
              className="absolute -right-9 -top-8 opacity-25"
            >
              <circle cx="95" cy="95" r="80" fill="none" stroke="#F4F7FF" strokeWidth="14" />
              <circle
                cx="95"
                cy="95"
                r="80"
                fill="none"
                stroke="#F2A93B"
                strokeWidth="14"
                strokeDasharray="503"
                strokeDashoffset="190"
                strokeLinecap="round"
                transform="rotate(-90 95 95)"
              />
            </svg>
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/18">
              <Icon name="clock" size={26} />
            </span>
            <span className="relative flex flex-col gap-1.5">
              <span className="font-display text-[34px] font-bold leading-none">Modo enfoque</span>
              <span className="text-base leading-snug">
                15–20 min · {due ? `${due} ${due === 1 ? "card" : "cards"} due` : "new phrases"}, then listen and repeat
                out loud.
              </span>
            </span>
          </Link>
        </motion.div>

        {inProgress && (
          <motion.div {...rise(4)}>
            <Link
              href={`/leer/${inProgress.id}`}
              className="flex items-center gap-5 rounded-[28px] border border-line bg-surface p-5 transition-transform active:scale-[0.99]"
            >
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-surface-2 text-accent-text">
                <Icon name={inProgress.kind === "story" ? "book" : "bowl"} size={40} strokeWidth={1.6} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Kicker className="text-muted">
                  {reading?.linesRead ? "Keep reading" : "Next up"} ·{" "}
                  {inProgress.kind === "story" ? "Historia" : `Diálogo ${Number(inProgress.id.slice(1))}`}
                </Kicker>
                <span lang="es" className="truncate font-display text-[26px] font-bold leading-tight">
                  {inProgress.title}
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${((reading?.linesRead ?? 0) / inProgress.lines.length) * 100}%` }}
                  />
                </span>
                <span className="text-[15px] text-muted">
                  {reading?.linesRead ?? 0} of {inProgress.lines.length} lines · {inProgress.subtitle}
                </span>
              </span>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                <Icon name="play" size={24} />
              </span>
            </Link>
          </motion.div>
        )}

        <motion.section
          {...rise(5)}
          className="flex flex-col gap-2.5 rounded-[28px] border border-dashed border-[color-mix(in_srgb,var(--accent)_38%,transparent)] bg-card px-6 py-5"
        >
          <div className="flex items-center justify-between">
            <Kicker className="text-accent-text">Frase de la noche</Kicker>
            <span className="text-sm text-muted">{phrase.reg === "usted" ? "usted" : phrase.category}</span>
          </div>
          <div lang="es" className="font-display text-[clamp(32px,5.5vw,44px)] font-bold leading-[1.05]">
            {phrase.es}
          </div>
          <p className="text-lg leading-snug text-soft">
            “{phrase.en}”{phrase.note ? ` ${phrase.note}` : ""}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => (playingId === phraseId ? stop() : play(phraseId, phrase.es))}
              className="flex h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-ink active:scale-95"
            >
              <Icon name={playingId === phraseId ? "stop" : "play"} size={18} /> Escuchar
            </button>
            <SaveButton
              card={{
                id: phrase.id,
                source: "phrase",
                sourceRef: phrase.category,
                sourceTitle: "50 frases",
                es: phrase.es,
                en: phrase.en,
                note: phrase.note,
                reg: phrase.reg,
                stage1: true,
              }}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/** One-time nudges: install to the home screen, and download a Mexican voice. */
function Hints() {
  const [state, setState] = useState<{ install: boolean; voice: boolean }>({ install: false, voice: false });
  useEffect(() => {
    const dismissed = (k: string) => {
      try {
        return localStorage.getItem(k) === "1";
      } catch {
        return false;
      }
    };
    const check = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      const ios =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
      setState({
        install: ios && !standalone && !dismissed("hint-install"),
        voice: speechSupported() && !hasMexicanVoice() && !dismissed("hint-voice"),
      });
    };
    // Voices load asynchronously; give them a moment before nagging.
    const t = setTimeout(check, 1200);
    const off = onVoicesChanged(check);
    return () => {
      clearTimeout(t);
      off();
    };
  }, []);

  const dismiss = (k: "install" | "voice") => {
    try {
      localStorage.setItem(`hint-${k}`, "1");
    } catch {}
    setState((s) => ({ ...s, [k]: false }));
  };

  return (
    <>
      {state.install && (
        <Hint onClose={() => dismiss("install")}>
          <b>Install Hablarrr:</b> tap the Share button in Safari, then <b>Add to Home Screen</b>. It opens full screen
          and keeps your progress safe.
        </Hint>
      )}
      {state.voice && (
        <Hint onClose={() => dismiss("voice")}>
          <b>Get a better Mexican voice:</b> Settings → Accessibility → Spoken Content → Voices → Spanish → Spanish
          (Mexico), then download an Enhanced voice. Pick it in{" "}
          <Link href="/ajustes" className="underline">
            Ajustes
          </Link>
          .
        </Hint>
      )}
    </>
  );
}

function Hint({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-[22px] bg-[color-mix(in_srgb,var(--blue-soft)_16%,transparent)] px-5 py-4 text-base leading-snug text-soft">
      <Icon name="bulb" size={22} className="mt-0.5 shrink-0 text-blue-text" />
      <span className="flex-1">{children}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-2 p-2 text-muted">
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
