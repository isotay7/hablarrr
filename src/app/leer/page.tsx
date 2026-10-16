"use client";

import Link from "next/link";
import { characters, dialogues, stories } from "@/content";
import type { Lesson } from "@/content/types";
import { Icon } from "@/components/Icon";
import { PapelPicado } from "@/components/PapelPicado";
import { Kicker, Loading } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Library() {
  const { ready } = useStore();
  if (!ready) return <Loading />;
  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <PapelPicado className="absolute inset-x-0 top-0 h-24" />
      <div className="pt-safe mx-auto flex max-w-3xl flex-col gap-8 px-5 pb-12 sm:px-8">
        <header className="flex flex-col gap-1 pt-24">
          <Kicker className="text-accent-text">Leer</Kicker>
          <h1 className="font-display text-[clamp(40px,7vw,56px)] font-bold leading-none tracking-[-0.02em]">
            Biblioteca
          </h1>
        </header>
        <Section title="Diálogos de familia" subtitle={`Dinner with ${characters.partner.name}’s family, scene by scene`} lessons={dialogues} />
        <Section title="Historias" subtitle="Bible stories, retold in simple present tense" lessons={stories} />
      </div>
    </div>
  );
}

function Section({ title, subtitle, lessons }: { title: string; subtitle: string; lessons: Lesson[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-[26px] font-bold">{title}</h2>
        <p className="text-muted">{subtitle}</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <LessonCard lesson={l} n={i + 1} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LessonCard({ lesson, n }: { lesson: Lesson; n: number }) {
  const { data } = useStore();
  const r = data.reading.find((x) => x.lessonId === lesson.id);
  const pct = r?.finished ? 1 : Math.min(1, (r?.linesRead ?? 0) / lesson.lines.length);
  return (
    <Link
      href={`/leer/${lesson.id}`}
      className="flex h-full items-center gap-4 rounded-[24px] border border-line bg-card p-4 transition-transform duration-150 active:scale-[0.98]"
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-extrabold ${
          r?.finished ? "bg-accent text-accent-ink" : "bg-surface-2 text-accent-text"
        }`}
      >
        {r?.finished ? <Icon name="check" size={26} strokeWidth={3} /> : n}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span lang="es" className="truncate font-display text-[21px] font-bold leading-tight">
          {lesson.title}
        </span>
        <span className="truncate text-[15px] text-muted">{lesson.subtitle}</span>
        <span className="h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
          <span
            className="block h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${pct * 100}%` }}
          />
        </span>
      </span>
    </Link>
  );
}
