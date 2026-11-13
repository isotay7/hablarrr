"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { MEN } from "@/content/faith/men";
import { ManBadge } from "@/components/faith/FaithKit";
import { TonightCard } from "@/components/faith/TonightCard";
import { Icon } from "@/components/Icon";
import { CandleGlow, Kicker, Loading } from "@/components/ui";
import { faithStreak, manComplete, manDaysDone, menComplete, tonight } from "@/lib/faith";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 300, damping: 28, delay: 0.04 * i },
});

export default function FaithPage() {
  const { ready, data } = useStore();
  if (!ready) return <Loading />;

  const t = tonight(data.faith);
  const nights = faithStreak(data.faith);
  const badges = menComplete(data.faith).length;
  const currentMan = t.next?.man.id;

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <CandleGlow />
      <div className="pt-safe relative mx-auto flex max-w-3xl flex-col gap-5 px-5 pb-10 sm:px-8">
        <motion.header {...rise(0)} className="flex flex-col gap-1.5 pt-14">
          <h1 className="font-serif text-[clamp(44px,8vw,64px)] font-semibold leading-none">Fe</h1>
          <p className="text-lg text-muted">Men of the Bible, one at a time. A few quiet minutes before bed.</p>
        </motion.header>

        <motion.div {...rise(1)} className="flex flex-wrap gap-2.5">
          <span className="flex items-center gap-2 rounded-full bg-learn px-4 py-2.5 text-[17px] font-bold text-accent-text">
            <Icon name="candle" size={20} />
            {nights === 1 ? "1 noche de fe" : `${nights} noches de fe`}
          </span>
          <span className="flex items-center rounded-full bg-surface px-4 py-2.5 text-[17px] font-semibold text-muted">
            {badges} of {MEN.length} men · {t.count}/{t.total} readings
          </span>
        </motion.div>

        <motion.div {...rise(2)}>
          <TonightCard />
        </motion.div>

        <motion.section {...rise(3)} className="flex flex-col gap-1 pt-2">
          <Kicker className="pb-3 text-muted">El camino · in Bible order</Kicker>
          <ol className="relative flex flex-col">
            <span aria-hidden className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-[var(--line)]" />
            {MEN.map((m) => {
              const done = manComplete(data.faith, m);
              const read = manDaysDone(data.faith, m);
              const current = m.id === currentMan;
              const body = (
                <>
                  <ManBadge man={m} earned={done} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`font-serif text-[22px] font-semibold leading-tight ${done || current ? "" : "text-muted"}`}>
                      {m.name}
                    </span>
                    <span className="text-[15px] text-muted">
                      {m.era} · {done ? "finished" : current ? `${read} of ${m.days.length} days` : `${m.days.length} days`}
                    </span>
                  </span>
                  {done && <Icon name="arrowRight" size={20} className="shrink-0 text-muted" />}
                  {current && (
                    <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[13px] font-extrabold text-accent-ink">
                      Now
                    </span>
                  )}
                </>
              );
              const cls = "relative flex items-center gap-4 py-2.5";
              return (
                <li key={m.id}>
                  {done || current ? (
                    <Link href={`/fe/hombre/?m=${m.id}`} onClick={() => sfx.tap()} className={`${cls} active:opacity-70`}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </motion.section>

        <p className="pt-2 text-sm leading-snug text-muted">
          English: World English Bible. Spanish: Reina-Valera 1909. Both are in the public domain.
        </p>
      </div>
    </div>
  );
}
