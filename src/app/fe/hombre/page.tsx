"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { manById, MEN, refLabel, type Man } from "@/content/faith/men";
import { ManBadge, VerseCard } from "@/components/faith/FaithKit";
import { Icon } from "@/components/Icon";
import { CandleGlow, Kicker, Loading, RoundButton } from "@/components/ui";
import { canRead, manComplete, manDaysDone } from "@/lib/faith";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

// One man: his days, and once they're all read, the recap card.

export default function ManPage() {
  const { ready } = useStore();
  const [man] = useState<Man | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return manById(new URLSearchParams(window.location.search).get("m") ?? "") ?? MEN[0];
  });
  if (!ready || !man) return <Loading />;
  return <ManView man={man} />;
}

function ManView({ man }: { man: Man }) {
  const { data } = useStore();
  const done = manComplete(data.faith, man);
  const read = manDaysDone(data.faith, man);
  const { recap } = man;

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <CandleGlow />
      <div className="pt-safe relative mx-auto flex max-w-2xl flex-col gap-6 px-5 pb-12 sm:px-8">
        <div className="flex items-center gap-3 pt-5">
          <RoundButton icon="back" label="Back to Fe" href="/fe" />
          <Kicker className="text-muted">Fe · {man.era}</Kicker>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5"
        >
          <ManBadge man={man} earned={done} size={84} />
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-[clamp(34px,6vw,48px)] font-semibold leading-none">{man.name}</h1>
            <span lang="es" className="text-lg text-muted">
              {man.es} · {done ? "badge earned" : `${read} of ${man.days.length} days read`}
            </span>
          </div>
        </motion.header>

        {done ? (
          <>
            <Section title="Timeline">
              <ol className="relative flex flex-col gap-3 pl-6">
                <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-0.5 bg-[var(--line)]" />
                {recap.timeline.map((e, n) => (
                  <li key={n} className="relative text-lg leading-snug">
                    <span className="absolute -left-6 top-2 h-3 w-3 rounded-full bg-accent shadow-[0_0_10px_var(--glow)]" />
                    {e}
                  </li>
                ))}
              </ol>
            </Section>
            <div className="grid gap-4 sm:grid-cols-2">
              <Section title="Strengths">
                <List items={recap.strengths} />
              </Section>
              <Section title="Failures">
                <List items={recap.failures} />
              </Section>
            </div>
            <Section title="Key verse">
              <VerseCard verse={recap.verse} />
            </Section>
          </>
        ) : (
          <p className="rounded-[22px] bg-note px-5 py-4 text-lg leading-snug text-soft">
            His recap (timeline, strengths, failures and a key verse) opens after his last day.
          </p>
        )}

        <Section title="His days">
          <ul className="flex flex-col gap-2">
            {man.days.map((d, i) => {
              const id = `${man.id}-${i + 1}`;
              const isRead = Boolean(data.faith.done[id]);
              const open = canRead(data.faith, id);
              const row = (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ${
                      isRead ? "bg-learn text-accent-text" : open ? "bg-accent text-accent-ink" : "bg-surface text-muted"
                    }`}
                  >
                    {isRead ? <Icon name="check" size={18} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`font-serif text-xl font-semibold ${open ? "" : "text-muted"}`}>{d.title}</span>
                    <span className="text-[15px] text-muted">{refLabel(d.read)}</span>
                  </span>
                  {open ? (
                    <Icon name={isRead ? "arrowRight" : "play"} size={20} className="shrink-0 text-muted" />
                  ) : (
                    <Icon name="lock" size={18} className="shrink-0 text-muted" />
                  )}
                </>
              );
              const cls = "flex items-center gap-4 rounded-[20px] bg-surface px-4 py-3";
              return (
                <li key={id}>
                  {open ? (
                    <Link href={`/fe/noche/?d=${id}`} onClick={() => sfx.tap()} className={`${cls} active:scale-[0.99]`}>
                      {row}
                    </Link>
                  ) : (
                    <div className={cls}>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-[28px] border border-line bg-card px-5 py-5">
      <Kicker className="text-accent-text">{title}</Kicker>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((s, n) => (
        <li key={n} className="flex gap-3 text-lg leading-snug">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}
