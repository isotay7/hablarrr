"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { dialogues, lessons, STAGE2_GOAL, stories } from "@/content";
import { Icon } from "@/components/Icon";
import { Bar, Ring } from "@/components/Meters";
import { Kicker, Loading } from "@/components/ui";
import { isoWeek, lastSevenDays } from "@/lib/dates";
import { minutesOn, STAGE1_GOAL, stage1Progress, streak, wordsKnown } from "@/lib/stats";
import { useStore } from "@/lib/store";

export default function ProgressPage() {
  const { ready, data } = useStore();
  const [replay, setReplay] = useState(0);
  if (!ready) return <Loading />;

  const s1 = stage1Progress(data.deck, data.reviews);
  const known = wordsKnown(data.words);
  const learningWords = data.words.filter((w) => w.status === "learning").length;
  const week = lastSevenDays();
  const weekMinutes = week.map((d) => minutesOn(data.days, d.key));
  const weekTotal = weekMinutes.reduce((a, b) => a + b, 0);
  const weekGoal = data.settings.dailyGoalMinutes * 7;
  const nights = streak(data.days);
  const maxDay = Math.max(data.settings.dailyGoalMinutes, ...weekMinutes);
  const finished = new Set(data.reading.filter((r) => r.finished).map((r) => r.lessonId));
  const lastCheck = [...data.missions].sort((a, b) => b.takenAt - a.takenAt)[0];
  const checkedThisWeek = data.missions.some((m) => m.week === isoWeek());

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div key={replay} className="pt-safe mx-auto flex max-w-3xl flex-col gap-5 px-5 pb-12 pt-10 sm:px-8">
        <header className="flex items-end justify-between gap-4 pt-6">
          <div className="flex flex-col gap-1">
            <Kicker className="text-accent-text">Misión · la cena con la familia</Kicker>
            <h1 className="font-display text-[clamp(40px,7vw,52px)] font-bold leading-none tracking-[-0.02em]">
              Progreso
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setReplay((r) => r + 1)}
            className="h-11 shrink-0 rounded-full border border-line px-4 text-sm font-bold text-text active:scale-95"
          >
            Replay
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="flex flex-col gap-3.5 rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-extrabold tracking-[0.04em] text-accent-ink">
                ETAPA 1 · {s1.complete ? "DONE" : "NOW"}
              </span>
              <span className="text-sm font-semibold text-muted">goal: 80% recall</span>
            </div>
            <h2 className="font-display text-[26px] font-bold leading-tight">50 frases de confianza</h2>
            <div className="flex items-center gap-4">
              <Ring
                value={s1.recall ?? 0}
                size={110}
                stroke={12}
                marker={STAGE1_GOAL}
                label={s1.recall === null ? "Recall not measured yet" : `Recall ${Math.round(s1.recall * 100)} percent`}
              >
                <span className="font-display text-2xl font-extrabold">
                  {s1.recall === null ? "—" : `${Math.round(s1.recall * 100)}%`}
                </span>
                <span className="text-xs font-semibold text-muted">recall</span>
              </Ring>
              <div className="flex flex-col gap-1 text-base leading-snug text-soft">
                <span>
                  <b className="text-[22px] text-text">{s1.learned}</b> learned
                </span>
                <span>
                  <b className="text-text">{s1.learning}</b> learning · <b className="text-text">{s1.notStarted}</b> new
                </span>
                {s1.recall === null && (
                  <span className="text-sm text-muted">Recall shows after {10} reviews of these phrases.</span>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3.5 rounded-[28px] border border-line bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[var(--line)] px-3 py-1.5 text-xs font-extrabold tracking-[0.04em] text-soft">
                ETAPA 2 · {s1.complete ? "NOW" : "NEXT"}
              </span>
              <span className="text-sm font-semibold text-muted">{s1.complete ? "unlocked" : "unlocks at 80%"}</span>
            </div>
            <h2 className="font-display text-[26px] font-bold leading-tight">800 palabras para la familia</h2>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-display text-[44px] font-extrabold text-accent-text">{known}</span>
              <span className="text-lg text-muted">/ {STAGE2_GOAL} known</span>
            </div>
            <Bar value={known / STAGE2_GOAL} color="var(--blue-soft)" />
            <span className="text-[15px] text-muted">
              {learningWords} more learning. Mark words in the reader, or let review promote them.
            </span>
          </section>
        </div>

        <Link
          href="/mision"
          className="flex items-center gap-4 rounded-[24px] bg-blue p-5 text-[#F4F7FF] transition-transform active:scale-[0.99]"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/16">
            <Icon name="target" size={26} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="font-display text-[22px] font-bold">
              Mission check · {checkedThisWeek ? "done this week" : "due this week"}
            </span>
            <span className="text-[#E3EBFF]">
              {lastCheck
                ? `Last: ${lastCheck.score} of ${lastCheck.total} right replies at the dinner table`
                : "Listen to the family and pick the right reply. 5 questions."}
            </span>
          </span>
          <span className="hidden h-12 shrink-0 items-center rounded-full bg-[#F4F7FF] px-5 font-extrabold text-[#1D3D75] sm:flex">
            {checkedThisWeek ? "Practice" : "Start"}
          </span>
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <RingTile
            value={known / Math.max(50, Math.ceil((known + 1) / 50) * 50)}
            color="var(--accent)"
            big={known}
            label="Palabras"
            sub="words known"
          />
          <RingTile
            value={weekTotal / weekGoal}
            color="var(--terra-soft)"
            big={weekTotal}
            label="Minutos"
            sub={`of ${weekGoal} this week`}
          />
          <RingTile value={nights / 7} color="var(--blue-soft)" big={nights} label="Racha" sub="nights in a row" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="flex flex-col gap-3 rounded-[26px] bg-surface p-5">
            <h2 className="font-bold">Minutes this week</h2>
            <div className="grid h-[130px] grid-cols-7 items-end gap-2.5">
              {week.map((d, i) => {
                const m = weekMinutes[i];
                const hit = m >= data.settings.dailyGoalMinutes;
                return (
                  <div key={d.key} className="flex h-full flex-col items-center justify-end gap-1.5">
                    <motion.div
                      className="w-full rounded-lg"
                      style={{
                        background: hit
                          ? "var(--accent)"
                          : m > 0
                            ? "color-mix(in srgb, var(--accent) 45%, transparent)"
                            : "var(--line)",
                      }}
                      initial={{ height: 6 }}
                      animate={{ height: Math.max(6, (m / maxDay) * 100) }}
                      transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.05 * i }}
                      title={`${m} min`}
                    />
                    <span className={`text-[13px] font-bold ${d.isToday ? "text-accent-text" : "text-muted"}`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="flex flex-col gap-3 rounded-[26px] bg-surface p-5">
            <h2 className="font-bold">
              Historias y diálogos{" "}
              <span className="font-normal text-muted">
                · {finished.size} of {lessons.length} finished
              </span>
            </h2>
            {[...stories, { id: "all-d", title: "Diálogos de familia" } as const].map((l) => {
              const pct =
                l.id === "all-d"
                  ? dialogues.filter((d) => finished.has(d.id)).length / dialogues.length
                  : finished.has(l.id)
                    ? 1
                    : (data.reading.find((r) => r.lessonId === l.id)?.linesRead ?? 0) /
                      (stories.find((s) => s.id === l.id)?.lines.length ?? 1);
              return (
                <div key={l.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[15px]">
                    <span lang="es">{l.title}</span>
                    <span className="font-bold text-muted">{pct >= 1 ? "Terminada" : `${Math.round(pct * 100)}%`}</span>
                  </div>
                  <Bar value={pct} color={pct >= 1 ? "var(--accent)" : "var(--terra-soft)"} className="h-2" />
                </div>
              );
            })}
          </section>
        </div>

        <Link href="/ajustes" className="flex items-center justify-center gap-2 py-3 font-semibold text-muted">
          <Icon name="settings" size={18} /> Ajustes · settings, voice and backup
        </Link>
      </div>
    </div>
  );
}

function RingTile({
  value,
  color,
  big,
  label,
  sub,
}: {
  value: number;
  color: string;
  big: number;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[26px] bg-surface px-2 py-4 text-center">
      <Ring value={value} color={color} size={112} stroke={13} label={`${label}: ${big}, ${sub}`}>
        <span className="font-display text-[28px] font-extrabold">{big}</span>
      </Ring>
      <span className="font-bold">{label}</span>
      <span className="text-[13px] leading-tight text-muted">{sub}</span>
    </div>
  );
}
