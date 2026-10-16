import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Names } from "@/content/people";
import type { Register } from "@/content/types";

// Every record carries updatedAt so Phase 3 can sync by last-write-wins.

export type ThemeName = "night" | "light";
export type SpeedName = "normal" | "slow";

export interface Settings {
  theme: ThemeName;
  sound: boolean;
  spanishOnly: boolean;
  speed: SpeedName;
  voiceURI: string | null;
  dailyGoalMinutes: number;
  /** Real names for {me}, {partner}, … Stored only on this device. */
  names: Partial<Names>;
  updatedAt: number;
}

/** ts-fsrs Card with dates stored as epoch ms. */
export interface StoredFsrs {
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: number | null;
}

export type CardSource = "phrase" | "dialogue" | "story";

export interface DeckCard {
  /** Same as the phrase or line id it came from. */
  id: string;
  source: CardSource;
  /** Lesson id for lines, category for phrases. */
  sourceRef: string;
  sourceTitle: string;
  es: string;
  en: string;
  note?: string;
  reg?: Register;
  /** Part of the 50 Stage 1 phrases. */
  stage1: boolean;
  fsrs: StoredFsrs;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewLogRecord {
  id: string;
  cardId: string;
  rating: number;
  stateBefore: number;
  reviewedAt: number;
  scheduledDays: number;
}

export type WordStatus = "new" | "learning" | "known";

export interface WordRecord {
  key: string;
  status: WordStatus;
  /** Who set the status last. */
  by: "me" | "review";
  updatedAt: number;
}

export interface ReadingRecord {
  lessonId: string;
  /** Highest line index reached (exclusive). */
  linesRead: number;
  finished: boolean;
  finishedAt: number | null;
  updatedAt: number;
}

export interface DayRecord {
  /** Local date, YYYY-MM-DD. */
  date: string;
  seconds: number;
  reviews: number;
  updatedAt: number;
}

export interface MissionCheckRecord {
  id: string;
  /** ISO week, e.g. 2026-W42. */
  week: string;
  score: number;
  total: number;
  takenAt: number;
}

interface HablarrrDB extends DBSchema {
  kv: { key: string; value: unknown };
  deck: { key: string; value: DeckCard; indexes: { due: number } };
  reviews: { key: string; value: ReviewLogRecord; indexes: { cardId: string; reviewedAt: number } };
  words: { key: string; value: WordRecord };
  reading: { key: string; value: ReadingRecord };
  days: { key: string; value: DayRecord };
  missions: { key: string; value: MissionCheckRecord };
}

let dbPromise: Promise<IDBPDatabase<HablarrrDB>> | null = null;

export function db() {
  if (!dbPromise) {
    dbPromise = openDB<HablarrrDB>("hablarrr", 1, {
      upgrade(d) {
        d.createObjectStore("kv");
        const deck = d.createObjectStore("deck", { keyPath: "id" });
        deck.createIndex("due", "fsrs.due");
        const reviews = d.createObjectStore("reviews", { keyPath: "id" });
        reviews.createIndex("cardId", "cardId");
        reviews.createIndex("reviewedAt", "reviewedAt");
        d.createObjectStore("words", { keyPath: "key" });
        d.createObjectStore("reading", { keyPath: "lessonId" });
        d.createObjectStore("days", { keyPath: "date" });
        d.createObjectStore("missions", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "night",
  sound: true,
  spanishOnly: false,
  speed: "normal",
  voiceURI: null,
  dailyGoalMinutes: 20,
  names: {},
  updatedAt: 0,
};

export interface Snapshot {
  settings: Settings;
  deck: DeckCard[];
  reviews: ReviewLogRecord[];
  words: WordRecord[];
  reading: ReadingRecord[];
  days: DayRecord[];
  missions: MissionCheckRecord[];
}

export async function loadAll(): Promise<Snapshot> {
  const d = await db();
  const [settings, deck, reviews, words, reading, days, missions] = await Promise.all([
    d.get("kv", "settings") as Promise<Settings | undefined>,
    d.getAll("deck"),
    d.getAll("reviews"),
    d.getAll("words"),
    d.getAll("reading"),
    d.getAll("days"),
    d.getAll("missions"),
  ]);
  return {
    settings: { ...DEFAULT_SETTINGS, ...settings },
    deck,
    reviews,
    words,
    reading,
    days,
    missions,
  };
}

export async function replaceAll(s: Snapshot) {
  const d = await db();
  const tx = d.transaction(["kv", "deck", "reviews", "words", "reading", "days", "missions"], "readwrite");
  await Promise.all([
    tx.objectStore("deck").clear(),
    tx.objectStore("reviews").clear(),
    tx.objectStore("words").clear(),
    tx.objectStore("reading").clear(),
    tx.objectStore("days").clear(),
    tx.objectStore("missions").clear(),
  ]);
  await tx.objectStore("kv").put(s.settings, "settings");
  for (const c of s.deck) await tx.objectStore("deck").put(c);
  for (const r of s.reviews) await tx.objectStore("reviews").put(r);
  for (const w of s.words) await tx.objectStore("words").put(w);
  for (const r of s.reading) await tx.objectStore("reading").put(r);
  for (const day of s.days) await tx.objectStore("days").put(day);
  for (const m of s.missions) await tx.objectStore("missions").put(m);
  await tx.done;
}

/** Ask the browser not to evict our data. Best effort. */
export async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    // Not supported; the home-screen app is exempt from Safari's 7-day eviction anyway.
  }
}
