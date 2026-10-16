"use client";

import Link from "next/link";
import { characters, familyDialogues, stories, travelDialogues, UNLOCK_DIALOGUES, UNLOCK_STORIES } from "@/content";
import type { Lesson } from "@/content/types";
import { Icon } from "@/components/Icon";
import { PapelPicado } from "@/components/PapelPicado";
import { Kicker, Loading } from "@/components/ui";
import { sfx } from "@/lib/sounds";
import { unlocks } from "@/lib/stats";
import { useStore } from "@/lib/store";

export default function Library() {
  const { ready, data } = useStore();
  if (!ready) return <Loading />;
  const open = unlocks(data.deck);
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
        <Section
          title="Diálogos de familia"
          subtitle={`Dinner with ${characters.partner.name}’s family, scene by scene`}
          lessons={familyDialogues}
          locked={!open.dialogues}
          unlockAt={UNLOCK_DIALOGUES}
        />
        <Section
          title="Diálogos de viaje"
          subtitle="Tacos, directions, hotels, gas, markets and help"
          lessons={travelDialogues}
          locked={!open.dialogues}
          unlockAt={UNLOCK_DIALOGUES}
        />
        <Section
          title="Historias"
          subtitle="Bible stories, retold in simple present tense"
          lessons={stories}
          locked={!open.stories}
          unlockAt={UNLOCK_STORIES}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  lessons,
  locked,
  unlockAt,
}: {
  title: string;
  subtitle: string;
  lessons: Lesson[];
  locked: boolean;
  unlockAt: number;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-display text-[26px] font-bold">
          {locked && <Icon name="lock" size={22} className="text-muted" />}
          {title}
        </h2>
        <p className="text-muted">
          {locked ? `Unlocks after ${unlockAt} Start Here phrases. You can peek now.` : subtitle}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <LessonCard lesson={l} n={i + 1} locked={locked} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LessonCard({ lesson, n, locked }: { lesson: Lesson; n: number; locked: boolean }) {
  const { data } = useStore();
  const r = data.reading.find((x) => x.lessonId === lesson.id);
  const pct = r?.finished ? 1 : Math.min(1, (r?.linesRead ?? 0) / lesson.lines.length);

  if (locked)
    return (
      <div className="flex h-full items-center gap-4 rounded-[24px] border border-dashed border-line p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-muted">
          <Icon name="lock" size={22} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span lang="es" className="truncate font-display text-[21px] font-bold leading-tight text-soft">
            {lesson.title}
          </span>
          <span className="truncate text-[15px] text-muted">{lesson.subtitle}</span>
        </span>
        <Link
          href={`/leer/${lesson.id}`}
          onClick={() => sfx.tap()}
          className="flex h-11 shrink-0 items-center rounded-full border border-line px-4 text-[15px] font-bold active:scale-95"
        >
          Peek
        </Link>
      </div>
    );

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
