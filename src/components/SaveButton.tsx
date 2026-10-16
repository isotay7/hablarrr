"use client";

import { useRef } from "react";
import { useStore, type NewCardInput } from "@/lib/store";
import { useDeckFly } from "./DeckFly";
import { Icon } from "./Icon";

export function useSaved(id: string) {
  const { data } = useStore();
  return data.deck.some((c) => c.id === id);
}

/** Saves a sentence to the deck; the bookmark flies into the deck icon. */
export function SaveButton({
  card,
  variant = "pill",
  className = "",
}: {
  card: NewCardInput;
  variant?: "pill" | "round";
  className?: string;
}) {
  const { saveCard } = useStore();
  const { fly } = useDeckFly();
  const saved = useSaved(card.id);
  const ref = useRef<HTMLButtonElement>(null);

  const onClick = () => {
    if (saved) return;
    if (saveCard(card) && ref.current) fly(ref.current);
  };

  if (variant === "round")
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={saved ? "Saved to my deck" : "Save to my deck"}
        aria-pressed={saved}
        className={`flex h-16 w-16 items-center justify-center rounded-full border transition-transform active:scale-90 ${
          saved
            ? "border-accent bg-accent text-accent-ink"
            : "border-[color-mix(in_srgb,var(--text)_22%,transparent)] bg-black/25 text-text"
        } ${className}`}
      >
        <Icon name={saved ? "bookmarkFilled" : "bookmark"} size={24} />
      </button>
    );

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={`flex h-12 items-center gap-2 rounded-full border px-[18px] text-base font-semibold transition-transform active:scale-95 ${
        saved ? "border-transparent bg-learn text-accent-text" : "border-line text-text"
      } ${className}`}
    >
      <Icon name={saved ? "bookmarkFilled" : "bookmark"} size={18} />
      {saved ? "Guardada" : "Guardar"}
    </button>
  );
}
