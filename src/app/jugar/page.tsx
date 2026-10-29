"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { GAMES } from "@/components/games/catalog";
import { Icon } from "@/components/Icon";
import { PapelPicado } from "@/components/PapelPicado";
import { Kicker, Loading } from "@/components/ui";
import { learnedPhrases, MIN_LEARNED } from "@/lib/games";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import { tacoStandReady } from "@/lib/tacos";

export default function GamesPage() {
  const { ready } = useStore();
  if (!ready) return <Loading />;
  return <Games />;
}

function Games() {
  const { data } = useStore();
  const learned = learnedPhrases(data.deck);
  const tacos = tacoStandReady(learned);

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <PapelPicado className="absolute inset-x-0 top-0 h-24" />
      <div className="pt-safe mx-auto flex max-w-3xl flex-col gap-6 px-5 pb-12 sm:px-8">
        <header className="flex items-end justify-between gap-4 pt-24">
          <div className="flex flex-col gap-1">
            <Kicker className="text-accent-text">Jugar</Kicker>
            <h1 className="font-display text-[clamp(40px,7vw,56px)] font-bold leading-none tracking-[-0.02em]">
              Juegos
            </h1>
            <p className="text-muted">Practice the {learned.length} phrases you know. Misses come back in review.</p>
          </div>
          <span className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-learn px-4 text-lg font-extrabold text-accent-text">
            <Icon name="coin" size={22} /> {data.progress.pesos}
          </span>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GAMES.map((g, i) => {
            const need = MIN_LEARNED[g.id];
            const open = !g.soon && (g.id === "tacos" ? tacos.ready : learned.length >= need);
            const stats = data.progress.games[g.id];
            const shown = g.id === "loteria" ? stats?.wins : stats?.best;
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28, delay: 0.04 * i }}
              >
                <Link
                  href={g.soon ? "/jugar" : `/jugar/${g.id}`}
                  aria-disabled={g.soon}
                  onClick={() => sfx.tap()}
                  className={`relative flex h-full min-h-[170px] flex-col justify-between gap-4 overflow-hidden rounded-[30px] p-6 transition-transform active:scale-[0.98] ${
                    open ? "text-[#FFF6EA]" : "border border-dashed border-line text-muted"
                  }`}
                  style={open ? { background: g.tone } : undefined}
                >
                  {open && <span aria-hidden className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />}
                  <span className="relative flex items-start justify-between gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${open ? "bg-white/18" : "bg-surface"}`}
                    >
                      <Icon name={open ? g.icon : "lock"} size={26} />
                    </span>
                    {open && stats?.plays ? (
                      <span className="rounded-full bg-black/20 px-3 py-1 text-[14px] font-extrabold">
                        {g.best(shown ?? 0)}
                      </span>
                    ) : null}
                  </span>
                  <span className="relative flex flex-col gap-1">
                    <span lang="es" className="font-display text-[28px] font-bold leading-none">
                      {g.es}
                    </span>
                    <span className="text-base leading-snug opacity-90">
                      {open
                        ? g.en
                        : g.soon
                          ? `Muy pronto · ${g.en}`
                          : g.id === "tacos"
                          ? `Opens when you know the taco stand phrases (${tacos.have} of ${tacos.need} moments ready).`
                          : `Opens at ${need} phrases. You have ${learned.length}.`}
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
