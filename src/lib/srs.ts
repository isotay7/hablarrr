import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";
import type { DeckCard, StoredFsrs } from "./db";

export { Rating, State };
export type { Grade };

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ["1m", "10m"],
  relearning_steps: ["10m"],
});

export function toStored(card: Card): StoredFsrs {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.getTime() : null,
  };
}

export function fromStored(s: StoredFsrs): Card {
  return {
    ...s,
    due: new Date(s.due),
    state: s.state as State,
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  };
}

export function newFsrs(now = new Date()): StoredFsrs {
  return toStored(createEmptyCard(now));
}

export function rate(card: DeckCard, grade: Grade, now = new Date()) {
  const result = scheduler.next(fromStored(card.fsrs), now, grade);
  return { fsrs: toStored(result.card), log: result.log };
}

/** Would this answer bring the card back within `ms`? */
export function dueWithin(card: DeckCard, grade: Grade, ms: number, now = new Date()) {
  return rate(card, grade, now).fsrs.due - now.getTime() < ms;
}

/** Human interval for each answer button, e.g. "1 min", "10 min", "3 days". */
export function previewIntervals(card: DeckCard, now = new Date()): Record<Grade, string> {
  const preview = scheduler.repeat(fromStored(card.fsrs), now);
  const fmt = (due: Date) => formatInterval(due.getTime() - now.getTime());
  return {
    [Rating.Again]: fmt(preview[Rating.Again].card.due),
    [Rating.Hard]: fmt(preview[Rating.Hard].card.due),
    [Rating.Good]: fmt(preview[Rating.Good].card.due),
    [Rating.Easy]: fmt(preview[Rating.Easy].card.due),
  } as Record<Grade, string>;
}

export function formatInterval(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 31) return days === 1 ? "1 day" : `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

export function isDue(card: DeckCard, now = Date.now()) {
  return card.fsrs.due <= now;
}

export function retrievability(card: DeckCard, now = new Date()): number {
  if (card.fsrs.state === State.New) return 0;
  return scheduler.get_retrievability(fromStored(card.fsrs), now, false);
}

/** Graduated out of learning: the phrase has been recalled on separate days. */
export function isLearned(card: DeckCard) {
  return card.fsrs.state === State.Review;
}

/** Stable enough that its words count as known. */
export const KNOWN_STABILITY_DAYS = 21;
