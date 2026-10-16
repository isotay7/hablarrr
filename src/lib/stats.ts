import { lessons, missionPhrases, NEW_PER_DAY, phrases, STAGE1_TOTAL, UNLOCK_DIALOGUES, UNLOCK_STORIES } from "@/content";
import type { Mission, Phrase } from "@/content/types";
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

/** How many Start Here phrases have been through their first loop. */
export function stage1Started(deck: DeckCard[]): number {
  return deck.filter((c) => c.stage1 && STAGE1_IDS.has(c.id)).length;
}

export interface StartHere {
  /** Phrases learned so far, out of 50. */
  started: number;
  /** Phrases learned today. */
  today: number;
  /** Day N of the path: days with new phrases, counting today. */
  day: number;
  /** Next phrases to teach, up to today's limit (or a fresh 5 with `extra`). */
  next: Phrase[];
  /** Today's 5 are done. */
  doneToday: boolean;
  /** All 50 are done. */
  finished: boolean;
}

export function startHere(deck: DeckCard[], { extra = false, now = new Date() } = {}): StartHere {
  const cards = deck.filter((c) => c.stage1 && STAGE1_IDS.has(c.id));
  const have = new Set(cards.map((c) => c.id));
  const todayKey = dayKey(now);
  const today = cards.filter((c) => dayKey(new Date(c.createdAt)) === todayKey).length;
  const days = new Set(cards.map((c) => dayKey(new Date(c.createdAt))));
  days.add(todayKey);
  const remaining = phrases.filter((p) => !have.has(p.id));
  const room = extra ? NEW_PER_DAY : Math.max(0, NEW_PER_DAY - today);
  return {
    started: cards.length,
    today,
    day: days.size,
    next: remaining.slice(0, room),
    doneToday: today >= NEW_PER_DAY || remaining.length === 0,
    finished: remaining.length === 0,
  };
}

export interface MissionMeter {
  total: number;
  learned: number;
  learning: number;
}

/** Progress on one mission's Stage 1 phrases (its own plus the shared ones). */
export function missionMeter(deck: DeckCard[], m: Mission): MissionMeter {
  const ids = new Set(missionPhrases(m).map((p) => p.id));
  const cards = deck.filter((c) => c.stage1 && ids.has(c.id));
  const learned = cards.filter(isLearned).length;
  return { total: ids.size, learned, learning: cards.length - learned };
}

export function unlocks(deck: DeckCard[]) {
  const n = stage1Started(deck);
  return {
    dialogues: n >= UNLOCK_DIALOGUES,
    stories: n >= UNLOCK_STORIES,
    toDialogues: Math.max(0, UNLOCK_DIALOGUES - n),
    toStories: Math.max(0, UNLOCK_STORIES - n),
  };
}
