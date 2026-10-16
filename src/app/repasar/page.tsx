"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PapelPicado } from "@/components/PapelPicado";
import { Kicker, Loading } from "@/components/ui";
import type { DeckCard } from "@/lib/db";
import { formatInterval, isDue, State } from "@/lib/srs";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

export default function DeckPage() {
  const { ready } = useStore();
  if (!ready) return <Loading />;
  return <Deck />;
}

function Deck() {
  const { data } = useStore();
  const [filter, setFilter] = useState<"all" | "stage1" | "saved">("all");
  // Fixed for this visit so the list doesn't reshuffle while you look at it.
  const [now] = useState(() => Date.now());
  const due = data.deck.filter((c) => isDue(c, now));
  const cards = data.deck
    .filter((c) => (filter === "stage1" ? c.stage1 : filter === "saved" ? !c.stage1 : true))
    .sort((a, b) => a.fsrs.due - b.fsrs.due);

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto">
      <PapelPicado className="absolute inset-x-0 top-0 h-24" />
      <div className="pt-safe mx-auto flex max-w-3xl flex-col gap-6 px-5 pb-12 sm:px-8">
        <header className="flex flex-col gap-1 pt-24">
          <Kicker className="text-accent-text">Repasar</Kicker>
          <h1 className="font-display text-[clamp(40px,7vw,56px)] font-bold leading-none tracking-[-0.02em]">
            Mi mazo
          </h1>
          <p className="text-muted">My deck: {data.deck.length} cards</p>
        </header>

        <div className="flex flex-col gap-4 rounded-[32px] bg-blue p-6 text-[#F4F7FF] sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="font-display text-5xl font-extrabold">{due.length}</div>
            <div className="text-lg text-[#E3EBFF]">{due.length === 1 ? "card due now" : "cards due now"}</div>
          </div>
          {due.length > 0 ? (
            <Link
              href="/repasar/sesion"
              onClick={() => sfx.tap()}
              className="flex h-16 items-center justify-center gap-2 rounded-full bg-[#F4F7FF] px-8 text-lg font-extrabold text-[#1D3D75] active:scale-95"
            >
              Empezar repaso <Icon name="arrowRight" size={20} />
            </Link>
          ) : (
            <div className="text-lg text-[#E3EBFF]">
              {data.deck.length ? "All caught up. ¡Muy bien!" : "Save sentences from Leer or Chill to start."}
            </div>
          )}
        </div>

        {data.deck.length > 0 && (
          <>
            <div role="group" aria-label="Filter cards" className="flex gap-2">
              {(
                [
                  ["all", "Todas"],
                  ["stage1", "50 frases"],
                  ["saved", "Guardadas"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                  className={`h-11 rounded-full px-5 text-[15px] font-bold ${
                    filter === k ? "bg-accent text-accent-ink" : "bg-surface text-text"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className="flex flex-col gap-2.5">
              {cards.map((c) => (
                <CardRow key={c.id} card={c} now={now} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function CardRow({ card, now }: { card: DeckCard; now: number }) {
  const { removeCard } = useStore();
  const [confirm, setConfirm] = useState(false);
  const due = card.fsrs.due <= now;
  const status = card.fsrs.state === State.New ? "new" : due ? "due now" : `in ${formatInterval(card.fsrs.due - now)}`;
  return (
    <li className="flex items-center gap-4 rounded-[22px] border border-line bg-card px-5 py-4">
      <div className="min-w-0 flex-1">
        <div lang="es" className="font-display text-xl font-semibold leading-snug">
          {card.es}
        </div>
        <div className="text-[15px] text-muted">{card.en}</div>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-bold ${
          due ? "bg-learn text-accent-text" : "bg-surface text-muted"
        }`}
      >
        {status}
      </span>
      {confirm ? (
        <button
          type="button"
          onClick={() => removeCard(card.id)}
          className="h-11 shrink-0 rounded-full bg-terra px-4 text-sm font-bold text-[#FFF6EA]"
        >
          Remove
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Remove “${card.es}” from deck`}
          onClick={() => setConfirm(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted"
        >
          <Icon name="trash" size={20} />
        </button>
      )}
    </li>
  );
}
