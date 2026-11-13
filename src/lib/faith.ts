import { expandRef, FAITH_DAYS, MEN, type FaithDayRef, type FaithVerse, type Man } from "@/content/faith/men";
import texts from "@/content/faith/texts.json";
import type { FaithState } from "./db";
import { addDays, dayKey } from "./dates";

// The Fe path: one reading a night, in order. A day unlocks the night after the one before it.

const TEXTS = texts as Record<string, { en: string; es: string }>;

export interface PassageVerse {
  key: string;
  /** "7" or "2:7" when the passage crosses chapters. */
  label: string;
  en: string;
  /** A gap before this verse (verses skipped). */
  gap: boolean;
}

export function passage(ref: string): PassageVerse[] {
  const keys = expandRef(ref);
  const chapters = new Set(keys.map((k) => k.split(" ")[1].split(":")[0]));
  let prev: [number, number] | null = null;
  return keys.map((key) => {
    const [ch, v] = key.split(" ")[1].split(":").map(Number);
    const gap = prev !== null && !(prev[0] === ch && prev[1] + 1 === v);
    prev = [ch, v];
    return { key, label: chapters.size > 1 ? `${ch}:${v}` : String(v), en: TEXTS[key]?.en ?? "", gap };
  });
}

/** A key verse in both languages, trimmed to its excerpt when it has one. */
export function verseText(v: FaithVerse): { es: string; en: string } {
  const keys = expandRef(v.ref);
  return {
    es: v.es ?? keys.map((k) => TEXTS[k]?.es ?? "").join(" "),
    en: v.en ?? keys.map((k) => TEXTS[k]?.en ?? "").join(" "),
  };
}

/** The deck card id for a day's verse. */
export function verseCardId(ref: string) {
  return `verse:${ref}`;
}

export function isDone(faith: FaithState, id: string) {
  return Boolean(faith.done[id]);
}

export interface Tonight {
  /** The next unread day, or null when the whole path is done. */
  next: FaithDayRef | null;
  /** A reading was already finished today. */
  doneToday: boolean;
  /** The next day can be read now. */
  open: boolean;
  /** Days finished, out of the whole path. */
  count: number;
  total: number;
}

export function tonight(faith: FaithState, now = new Date()): Tonight {
  const today = dayKey(now);
  const next = FAITH_DAYS.find((d) => !faith.done[d.id]) ?? null;
  const doneToday = Object.values(faith.done).includes(today);
  return {
    next,
    doneToday,
    open: next !== null && !doneToday,
    count: FAITH_DAYS.filter((d) => faith.done[d.id]).length,
    total: FAITH_DAYS.length,
  };
}

/** A day can be opened if it's done (to read again) or it's tonight's. */
export function canRead(faith: FaithState, id: string, now = new Date()) {
  if (faith.done[id]) return true;
  const t = tonight(faith, now);
  return t.open && t.next?.id === id;
}

/** Nights in a row with a reading. Tonight not read yet doesn't break it. */
export function faithStreak(faith: FaithState, now = new Date()): number {
  const nights = new Set(Object.values(faith.done));
  let cursor = nights.has(dayKey(now)) ? now : addDays(now, -1);
  let n = 0;
  while (nights.has(dayKey(cursor))) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function manDaysDone(faith: FaithState, man: Man): number {
  return man.days.filter((_, i) => faith.done[`${man.id}-${i + 1}`]).length;
}

export function manComplete(faith: FaithState, man: Man): boolean {
  return manDaysDone(faith, man) === man.days.length;
}

export function menComplete(faith: FaithState): Man[] {
  return MEN.filter((m) => manComplete(faith, m));
}

/** "Yahweh" and "Jehová" get a short note the first time they show up in a reading. */
export const NAME_NOTE =
  "Yahweh is God’s personal name in Hebrew. Most English Bibles print it as “the LORD”; the 1909 Spanish writes it “Jehová.”";
