import { lessons, phrases, STAGE1_TOTAL } from "@/content";
import type { DayRecord, DeckCard, ReadingRecord, ReviewLogRecord, WordRecord } from "./db";
import { addDays, dayKey } from "./dates";
import { isLearned, Rating } from "./srs";

/** A day counts toward the streak after one minute of practice. */
export const STREAK_MIN_SECONDS = 60;

export function streak(days: DayRecord[], today = new Date()): number {
  const active = new Set(days.filter((d) => d.seconds >= STREAK_MIN_SECONDS).map((d) => d.date));
  // Today not done yet doesn't break the streak.
  let cursor = active.has(dayKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (active.has(dayKey(cursor))) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function minutesOn(days: DayRecord[], key: string): number {
  return Math.floor((days.find((d) => d.date === key)?.seconds ?? 0) / 60);
}

export function wordsKnown(words: WordRecord[]): number {
  return words.filter((w) => w.status === "known").length;
}

export function storiesFinished(reading: ReadingRecord[]) {
  const finished = new Set(reading.filter((r) => r.finished).map((r) => r.lessonId));
  return lessons.filter((l) => finished.has(l.id));
}

const STAGE1_IDS = new Set(phrases.map((p) => p.id));
export const RECALL_WINDOW_DAYS = 14;
export const RECALL_MIN_REVIEWS = 10;
export const STAGE1_GOAL = 0.8;

export interface Stage1Progress {
  total: number;
  learned: number;
  learning: number;
  notStarted: number;
  /** Share of Stage 1 reviews in the window not answered "Again"; null until enough reviews. */
  recall: number | null;
  reviewsInWindow: number;
  complete: boolean;
}

export function stage1Progress(deck: DeckCard[], reviews: ReviewLogRecord[], now = Date.now()): Stage1Progress {
  const cards = deck.filter((c) => c.stage1 && STAGE1_IDS.has(c.id));
  const learned = cards.filter(isLearned).length;
  const since = now - RECALL_WINDOW_DAYS * 86400000;
  const recent = reviews.filter((r) => STAGE1_IDS.has(r.cardId) && r.reviewedAt >= since);
  const recall =
    recent.length >= RECALL_MIN_REVIEWS ? recent.filter((r) => r.rating !== Rating.Again).length / recent.length : null;
  return {
    total: STAGE1_TOTAL,
    learned,
    learning: cards.length - learned,
    notStarted: STAGE1_TOTAL - cards.length,
    recall,
    reviewsInWindow: recent.length,
    complete: learned >= STAGE1_TOTAL && recall !== null && recall >= STAGE1_GOAL,
  };
}
