"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { characters, getLesson, lessonLabel } from "@/content";
import type { Lesson, Line } from "@/content/types";
import { DeckTarget } from "@/components/DeckFly";
import { Icon } from "@/components/Icon";
import { FlagMark } from "@/components/PapelPicado";
import { PlayButtons } from "@/components/PlayButtons";
import { SaveButton } from "@/components/SaveButton";
import { Sentence } from "@/components/Sentence";
import { Avatar, Kicker, Loading, RegisterBadge, RoundButton, SpanishOnlyToggle, ThemeToggle } from "@/components/ui";
import { celebrate } from "@/lib/celebrate";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

export function Reader({ id }: { id: string }) {
  const lesson = getLesson(id);
  const { ready, data, markRead, finishLesson } = useStore();
  const { play, stop, playingId } = usePlayer();
  const [autoplay, setAutoplay] = useState(false);
  const autoRef = useRef(false);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spanishOnly = data.settings.spanishOnly;
  const reading = data.reading.find((r) => r.lessonId === id);

  // Track the furthest line you've scrolled to.
  useEffect(() => {
    if (!lesson || !ready) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.index);
          markRead(lesson.id, i + 1);
        }
      },
      { threshold: 0.6 },
    );
    lineRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [lesson, ready, markRead]);

  useEffect(() => () => stop(), [stop]);

  if (!lesson) return <div className="p-10">Lesson not found.</div>;
  if (!ready) return <Loading />;

  const playFrom = (i: number) => {
    const line = lesson.lines[i];
    if (!line || !autoRef.current) {
      autoRef.current = false;
      setAutoplay(false);
      return;
    }
    lineRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
    play(line.id, line.es, {
      onEnd: () => setTimeout(() => playFrom(i + 1), 450),
    });
  };

  const toggleAutoplay = () => {
    if (autoplay) {
      autoRef.current = false;
      setAutoplay(false);
      stop();
      return;
    }
    autoRef.current = true;
    setAutoplay(true);
    const start = Math.max(
      0,
      lesson.lines.findIndex((l) => l.id === playingId),
    );
    playFrom(start);
  };

  const finish = () => {
    markRead(lesson.id, lesson.lines.length);
    if (finishLesson(lesson.id)) celebrate("big");
    else sfx.good();
  };

  const isStory = lesson.kind === "story";
  const index = lessonLabel(lesson);

  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe shrink-0 border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-4 pt-5 sm:px-8">
          <div className="flex items-center gap-3">
            <RoundButton icon="back" label="Back to library" href="/leer" />
            <div className="min-w-0 flex-1">
              <Kicker className="truncate text-muted">
                {index} · {lesson.subtitle}
              </Kicker>
              <h1 lang="es" className="truncate font-display text-[clamp(26px,4vw,36px)] font-bold tracking-[-0.01em]">
                {lesson.title}
              </h1>
            </div>
            <ThemeToggle />
            <Link
              href="/repasar"
              aria-label={`My deck, ${data.deck.length} cards`}
              className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-surface text-accent-text"
            >
              <DeckTarget>
                <Icon name="deck" size={24} />
              </DeckTarget>
              <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-terra-soft px-1.5 text-xs font-extrabold text-white">
                {data.deck.length}
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={toggleAutoplay}
              className={`flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-bold transition-colors active:scale-95 ${
                autoplay ? "bg-accent text-accent-ink" : "bg-surface text-text"
              }`}
            >
              <Icon name={autoplay ? "stop" : "play"} size={18} />
              {autoplay ? "Parar" : "Escuchar todo"}
            </button>
            <SpanishOnlyToggle />
            <div className="ml-auto hidden items-center gap-3.5 text-[13px] font-semibold text-muted sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-b-[3px] border-dotted border-accent-text" />
                new
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-4 rounded bg-learn" />
                learning
              </span>
              <span>known</span>
            </div>
          </div>
        </div>
      </header>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-16 pt-6 sm:px-8">
          {!spanishOnly && <p className="text-[17px] leading-relaxed text-muted">{lesson.scene}</p>}

          {lesson.lines.map((line, i) => (
            <div
              key={line.id}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              data-index={i}
            >
              {isStory ? (
                <StoryLine lesson={lesson} line={line} spanishOnly={spanishOnly} />
              ) : (
                <DialogueLine lesson={lesson} line={line} spanishOnly={spanishOnly} />
              )}
            </div>
          ))}

          <div className="flex flex-col items-center gap-3 pt-6">
            {reading?.finished ? (
              <div className="flex items-center gap-2 text-lg font-bold text-accent-text">
                <Icon name="check" size={22} strokeWidth={3} /> ¡Terminado!
              </div>
            ) : null}
            <button
              type="button"
              onClick={finish}
              className="flex h-14 items-center gap-2 rounded-full bg-accent px-8 text-lg font-extrabold text-accent-ink shadow-[0_12px_30px_var(--glow)] transition-transform active:scale-95"
            >
              {reading?.finished ? "Leído otra vez" : isStory ? "Terminé la historia" : "Terminé el diálogo"}
            </button>
            <Link href="/leer" className="py-2 text-base font-semibold text-muted underline-offset-4 hover:underline">
              Back to library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function cardInput(lesson: Lesson, line: Line) {
  return {
    id: line.id,
    source: lesson.kind,
    sourceRef: lesson.id,
    sourceTitle: lesson.title,
    es: line.es,
    en: line.en,
    note: line.note,
    reg: line.reg,
  } as const;
}

function DialogueLine({ lesson, line, spanishOnly }: { lesson: Lesson; line: Line; spanishOnly: boolean }) {
  const { playingId } = usePlayer();
  const active = playingId === line.id;
  const who = line.who ?? "narrador";
  return (
    <motion.article
      layout="position"
      className={`flex gap-4 rounded-[28px] border p-5 transition-colors duration-300 sm:p-6 ${
        active ? "border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-card-active" : "border-line bg-card"
      }`}
    >
      <Avatar who={who} size={48} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[17px] font-bold">{characters[who].name}</span>
          {!spanishOnly && <RegisterBadge line={line} />}
        </div>
        <Sentence id={line.id} es={line.es} line={line} />
        {!spanishOnly && <p className="text-[19px] leading-snug text-soft">{line.en}</p>}
        {!spanishOnly && line.note && (
          <p className="flex gap-2.5 text-base leading-snug text-muted">
            <Icon name="bulb" size={20} className="mt-0.5 shrink-0 text-accent-text" />
            {line.note}
          </p>
        )}
        {!spanishOnly && line.culture && (
          <div className="flex gap-3 rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--terra-soft)_45%,transparent)] bg-[color-mix(in_srgb,var(--terra-soft)_10%,transparent)] px-4 py-3.5 text-base leading-snug text-soft">
            <FlagMark />
            <span>
              <b className="text-accent-text">Cultura · {line.culture.title}.</b> {line.culture.text}
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <PlayButtons id={line.id} text={line.es} />
          <SaveButton card={cardInput(lesson, line)} />
        </div>
      </div>
    </motion.article>
  );
}

function StoryLine({ lesson, line, spanishOnly }: { lesson: Lesson; line: Line; spanishOnly: boolean }) {
  const { playingId } = usePlayer();
  const active = playingId === line.id;
  return (
    <article
      className={`flex flex-col gap-2 rounded-[24px] px-4 py-4 transition-colors duration-300 sm:px-5 ${active ? "bg-card-active" : ""}`}
    >
      <Sentence id={line.id} es={line.es} line={line} />
      {!spanishOnly && <p className="text-[19px] leading-snug text-soft">{line.en}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        <PlayButtons id={line.id} text={line.es} compact />
        <SaveButton card={cardInput(lesson, line)} />
      </div>
    </article>
  );
}
