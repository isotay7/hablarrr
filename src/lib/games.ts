"use client";

import { useCallback, useRef } from "react";
import { phrases } from "@/content";
import type { Phrase } from "@/content/types";
import type { DeckCard } from "./db";
import type { GameId } from "./progress";
import { useStore } from "./store";

// Games only review: every phrase in them has been taught in Start Here first.

export function learnedPhrases(deck: DeckCard[]): Phrase[] {
  const have = new Set(deck.map((c) => c.id));
  return phrases.filter((p) => have.has(p.id));
}

export function shuffle<T>(list: readonly T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `n` other phrases whose meanings differ from the target's (and from each other). */
export function distractors(target: Phrase, pool: Phrase[], n: number): Phrase[] {
  const out: Phrase[] = [];
  const seen = new Set([target.en]);
  for (const p of shuffle(pool)) {
    if (out.length >= n) break;
    if (seen.has(p.en) || p.es === target.es) continue;
    seen.add(p.en);
    out.push(p);
  }
  return out;
}

/** The target plus `n` distractors, shuffled. */
export function choicesFor(target: Phrase, pool: Phrase[], n: number): Phrase[] {
  return shuffle([target, ...distractors(target, pool, n)]);
}

/** Words to rebuild in Arma la frase: phrases of 2 to 7 words. */
export function wordsOf(p: Phrase): string[] {
  return p.es.split(/\s+/).filter(Boolean);
}

/**
 * `n` phrases, preferring ones that are due, so play time lands where it helps
 * most. A small pool repeats, never twice in a row.
 */
export function pickRound(pool: Phrase[], deck: DeckCard[], n: number, now = Date.now()): Phrase[] {
  if (!pool.length) return [];
  const due = new Map(deck.map((c) => [c.id, c.fsrs.due]));
  const scored = shuffle(pool).map((p) => ({ p, urgent: (due.get(p.id) ?? Infinity) <= now }));
  scored.sort((a, b) => Number(b.urgent) - Number(a.urgent));
  const out = shuffle(scored.slice(0, n).map((x) => x.p));
  while (out.length < n) {
    const more = shuffle(pool);
    if (more[0].id === out[out.length - 1].id) more.push(more.shift()!);
    out.push(...more.slice(0, n - out.length));
  }
  return out;
}

/** Learned phrases each game needs before it opens. */
export const MIN_LEARNED: Record<GameId, number> = {
  escucha: 4,
  arma: 4,
  rayo: 4,
  parejas: 6,
  loteria: 9,
  tacos: 0, // The stand checks its own phrases.
};

/**
 * Feeds game answers to the review schedule. Each phrase counts once per game
 * for a miss and once for a hit, so one bad round doesn't pile on.
 */
export function useGameReview() {
  const { practice } = useStore();
  const missed = useRef(new Set<string>());
  const hit = useRef(new Set<string>());
  return useCallback(
    (id: string, correct: boolean) => {
      const seen = correct ? hit.current : missed.current;
      if (seen.has(id)) return;
      seen.add(id);
      practice(id, correct);
    },
    [practice],
  );
}
