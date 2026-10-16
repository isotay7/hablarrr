"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { characters, lessonLabel, lessons, phrases, STAGE1_TOTAL, STAGE2_GOAL } from "@/content";
import { Icon } from "@/components/Icon";
import { SegmentMeter } from "@/components/Meters";
import { PapelPicado } from "@/components/PapelPicado";
import { SaveButton } from "@/components/SaveButton";
import { CandleGlow, Kicker, Loading, MissionChip, RoundButton, SoundToggle, ThemeToggle } from "@/components/ui";
import { dayKey, greeting, isoWeek } from "@/lib/dates";
import { usePlayer } from "@/lib/player";
import { hasMexicanVoice, onVoicesChanged, speechSupported } from "@/lib/speech";
import { isDue } from "@/lib/srs";
import {
  minutesOn,
  missionMeter,
  stage1Progress,
  startHere,
  streak,
  unlocks,
  wordsKnown,
  type MissionMeter,
} from "@/lib/stats";
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

  const open = unlocks(data.deck);
  const readable = lessons.filter((l) => (l.kind === "story" ? open.stories : true));
  const inProgress =
    readable.find((l) => {
      const r = data.reading.find((x) => x.lessonId === l.id);
      return r && !r.finished && r.linesRead > 0;
    }) ?? readable.find((l) => !data.reading.find((x) => x.lessonId === l.id)?.finished);
  const reading = inProgress && data.reading.find((r) => r.lessonId === inProgress.id);

  // Phrase of the night: same all day, different tomorrow.
  const n = [...dayKey()].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const met = phrases.filter((p) => data.deck.some((c) => c.id === p.id));
  const pool = met.length ? met : phrases.slice(0, 5);
  const phrase = pool[n % pool.length];
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
          <StartHereCard />
        </motion.div>

        <motion.div {...rise(2)}>
          <Link
            href="/progreso"
            className="flex flex-col gap-4 rounded-[28px] border border-line bg-card px-6 py-5 transition-transform active:scale-[0.99]"
          >
            <Kicker className="text-muted">Tus misiones · 50 frases</Kicker>
            <MissionRow
              label="Familia"
              hint={`Dinner with ${characters.partner.name}’s family`}
              meter={missionMeter(data.deck, "family")}
            />
            <MissionRow label="Viaje" hint="Getting around Mexico" meter={missionMeter(data.deck, "travel")} />
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
              <span className="flex items-center gap-1.5">
                {!s1.complete && <Icon name="lock" size={15} strokeWidth={2.4} />} Etapa 2 ·{" "}
                {s1.complete ? `${known} / ${STAGE2_GOAL}` : STAGE2_GOAL} palabras
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div {...rise(3)} className="flex flex-wrap gap-2.5">
          <span className="flex items-center gap-2 rounded-full bg-learn px-4 py-2.5 text-[17px] font-bold text-accent-text">
            <Icon name="flame" size={20} />
            {nights === 1 ? "Racha de 1 noche" : `Racha de ${nights} noches`}
          </span>
          <span className="flex items-center rounded-full bg-surface px-4 py-2.5 text-[17px] font-semibold text-muted">
            {today} de {goal} min hoy
          </span>
        </motion.div>

        <motion.div {...rise(4)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                15–20 min · {due ? `${due} ${due === 1 ? "card" : "cards"} due` : "a quick review"}, then listen and repeat
                out loud.
              </span>
            </span>
          </Link>
        </motion.div>

        {!open.dialogues && (
          <motion.div {...rise(5)}>
            <Link
              href="/leer"
              className="flex items-center gap-4 rounded-[28px] border border-dashed border-line px-5 py-4 text-muted transition-transform active:scale-[0.99]"
            >
              <Icon name="lock" size={22} className="shrink-0" />
              <span className="flex-1 text-[17px] leading-snug">
                <b className="text-text">Dialogues unlock in {open.toDialogues} phrases.</b> Stories unlock at 50. You can
                peek anytime in the library.
              </span>
              <Icon name="arrowRight" size={20} className="shrink-0" />
            </Link>
          </motion.div>
        )}

        {inProgress && open.dialogues && (
          <motion.div {...rise(5)}>
            <Link
              href={`/leer/${inProgress.id}`}
              className="flex items-center gap-5 rounded-[28px] border border-line bg-surface p-5 transition-transform active:scale-[0.99]"
            >
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-surface-2 text-accent-text">
                <Icon name={inProgress.kind === "story" ? "book" : "bowl"} size={40} strokeWidth={1.6} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Kicker className="text-muted">
                  {reading?.linesRead ? "Keep reading" : "Next up"} · {lessonLabel(inProgress)}
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
          {...rise(6)}
          className="flex flex-col gap-2.5 rounded-[28px] border border-dashed border-[color-mix(in_srgb,var(--accent)_38%,transparent)] bg-card px-6 py-5"
        >
          <div className="flex items-center justify-between">
            <Kicker className="text-accent-text">Frase de la noche</Kicker>
            <MissionChip mission={phrase.mission} />
          </div>
          <div lang="es" className="font-display text-[clamp(32px,5.5vw,44px)] font-bold leading-[1.05]">
            {phrase.es}
          </div>
          <div className="font-display text-xl font-semibold text-muted">{phrase.say}</div>
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
                sourceTitle: "Empieza aquí",
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

/** The guided path for beginners. Always first on Home until all 50 are done. */
function StartHereCard() {
  const { data } = useStore();
  const sh = startHere(data.deck);
  const preview = sh.next.map((p) => p.es.replace(/[.!¡]/g, "")).join(" · ");

  if (sh.finished)
    return (
      <Link
        href="/empezar"
        className="flex items-center gap-4 rounded-[28px] bg-learn px-6 py-5 transition-transform active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
          <Icon name="check" size={26} strokeWidth={3} />
        </span>
        <span className="flex flex-col">
          <span className="font-display text-2xl font-bold">Las 50 frases ✓</span>
          <span className="text-muted">Stories and Solo español are unlocked. Tap for a quick review.</span>
        </span>
      </Link>
    );

  if (sh.doneToday)
    return (
      <div className="flex flex-col gap-4 rounded-[32px] border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-card px-6 py-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Icon name="check" size={28} strokeWidth={3} />
          </span>
          <span className="flex flex-col">
            <Kicker className="text-accent-text">Empieza aquí · Día {sh.day}</Kicker>
            <span className="font-display text-[clamp(24px,4vw,32px)] font-bold leading-tight">¡Hoy ya terminaste!</span>
            <span className="text-muted">
              {sh.started} of {STAGE1_TOTAL} phrases · 5 new ones tomorrow
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/empezar"
            onClick={() => sfx.tap()}
            className="flex h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-ink active:scale-95"
          >
            <Icon name="deck" size={18} /> Repasar
          </Link>
          <Link
            href="/empezar/#mas"
            onClick={() => sfx.tap()}
            className="flex h-12 items-center rounded-full border border-line px-5 font-bold active:scale-95"
          >
            Learn 5 more
          </Link>
        </div>
      </div>
    );

  return (
    <Link
      href="/empezar"
      onClick={() => sfx.tap()}
      className="relative flex flex-col gap-5 overflow-hidden rounded-[32px] bg-accent p-6 text-accent-ink shadow-[0_24px_60px_color-mix(in_srgb,var(--accent)_35%,transparent)] transition-transform active:scale-[0.98] sm:p-7"
    >
      <span aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/15" />
      <span aria-hidden className="absolute -bottom-16 right-16 h-40 w-40 rounded-full bg-white/10" />
      <span className="relative flex items-center justify-between gap-4">
        <span className="text-[13px] font-extrabold uppercase tracking-[0.08em] opacity-80">
          Empieza aquí · Día {sh.day}
        </span>
        <span className="font-display text-xl font-extrabold tabular-nums">
          {sh.started}
          <span className="opacity-60"> / {STAGE1_TOTAL}</span>
        </span>
      </span>
      <span className="relative flex flex-col gap-1.5">
        <span className="font-display text-[clamp(32px,6vw,48px)] font-extrabold leading-none tracking-[-0.02em]">
          {sh.today ? `${sh.next.length} frases más` : `${sh.next.length} frases nuevas`}
        </span>
        <span lang="es" className="truncate text-lg font-semibold opacity-80">
          {preview}
        </span>
      </span>
      <span className="relative flex items-center justify-between gap-4">
        <span className="text-base font-semibold opacity-80">About 10 minutes · listen, say, quiz</span>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-ink text-accent">
          <Icon name="play" size={24} />
        </span>
      </span>
    </Link>
  );
}

function MissionRow({ label, hint, meter }: { label: string; hint: string; meter: MissionMeter }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-baseline gap-2">
          <span className="font-display text-[22px] font-bold">{label}</span>
          <span className="hidden text-[15px] text-muted sm:inline">{hint}</span>
        </span>
        <span className="font-display text-xl font-extrabold tabular-nums text-accent-text">
          {meter.learned + meter.learning}
          <span className="text-base text-muted"> / {meter.total}</span>
        </span>
      </div>
      <SegmentMeter learned={meter.learned} learning={meter.learning} total={meter.total} />
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
