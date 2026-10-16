"use client";

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { applyNames, phrases } from "@/content";
import { resolveNames } from "@/content/people";
import type { Register } from "@/content/types";
import {
  db,
  DEFAULT_SETTINGS,
  loadAll,
  replaceAll,
  requestPersistence,
  type CardSource,
  type DayRecord,
  type DeckCard,
  type ReviewLogRecord,
  type Settings,
  type Snapshot,
  type WordRecord,
  type WordStatus,
} from "./db";
import { dayKey, isoWeek } from "./dates";
import { KNOWN_STABILITY_DAYS, newFsrs, rate, Rating, type Grade } from "./srs";
import { setSoundEnabled } from "./sounds";
import { sentenceKeys } from "./tokenize";

export interface NewCardInput {
  id: string;
  source: CardSource;
  sourceRef: string;
  sourceTitle: string;
  es: string;
  en: string;
  note?: string;
  reg?: Register;
  stage1?: boolean;
}

interface Actions {
  updateSettings(patch: Partial<Omit<Settings, "updatedAt">>): void;
  saveCard(input: NewCardInput): boolean;
  removeCard(id: string): void;
  rateCard(id: string, grade: Grade): void;
  setWordStatus(key: string, status: WordStatus): void;
  markRead(lessonId: string, linesRead: number): void;
  /** Returns true the first time a lesson is finished. */
  finishLesson(lessonId: string): boolean;
  addSeconds(seconds: number): void;
  recordMission(score: number, total: number): void;
  /** Adds the next Stage 1 phrases to the deck. Returns how many were added. */
  introduceStage1(count: number): number;
  exportJSON(): string;
  importJSON(json: string): Promise<void>;
}

interface StoreValue extends Actions {
  ready: boolean;
  data: Snapshot;
  wordStatus(key: string): WordStatus;
}

const EMPTY: Snapshot = {
  settings: DEFAULT_SETTINGS,
  deck: [],
  reviews: [],
  words: [],
  reading: [],
  days: [],
  missions: [],
};

const StoreContext = createContext<StoreValue | null>(null);

export function useStore() {
  const v = useContext(StoreContext);
  if (!v) throw new Error("useStore must be used inside AppProvider");
  return v;
}

function applyTheme(theme: Settings["theme"]) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#fbf4e8" : "#1a1310");
  try {
    localStorage.setItem("hablarrr-theme", theme);
  } catch {
    // Private mode: theme still applies for this session.
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Snapshot>(EMPTY);
  const [ready, setReady] = useState(false);
  // Bumped when names change so every screen re-renders with the new names.
  const [namesVersion, setNamesVersion] = useState(0);
  const ref = useRef<Snapshot>(EMPTY);

  const commit = useCallback((next: Snapshot) => {
    ref.current = next;
    setData(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadAll()
      .then((snap) => {
        if (cancelled) return;
        applyNames(resolveNames(snap.settings.names));
        commit(snap);
        applyTheme(snap.settings.theme);
        setSoundEnabled(snap.settings.sound);
        setReady(true);
      })
      .catch((err) => {
        console.error("Could not open local database", err);
        setReady(true);
      });
    requestPersistence();
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const wordMap = useMemo(() => new Map(data.words.map((w) => [w.key, w])), [data.words]);

  const actions = useMemo<Actions>(() => {
    const put = <T,>(store: "deck" | "reviews" | "words" | "reading" | "days" | "missions", value: T) =>
      db()
        .then((d) => d.put(store, value as never))
        .catch((e) => console.error("save failed", store, e));

    const upsert = <T extends object>(list: T[], item: T, same: (a: T) => boolean) => {
      const i = list.findIndex(same);
      if (i === -1) return [...list, item];
      const copy = list.slice();
      copy[i] = item;
      return copy;
    };

    const promoteWords = (s: Snapshot, es: string, to: WordStatus): WordRecord[] => {
      const rank: Record<WordStatus, number> = { new: 0, learning: 1, known: 2 };
      let words = s.words;
      const now = Date.now();
      for (const key of sentenceKeys(es)) {
        const cur = words.find((w) => w.key === key);
        if (cur && rank[cur.status] >= rank[to]) continue;
        const rec: WordRecord = { key, status: to, by: "review", updatedAt: now };
        words = upsert(words, rec, (w) => w.key === key);
        put("words", rec);
      }
      return words;
    };

    const bumpDay = (s: Snapshot, patch: { seconds?: number; reviews?: number }): DayRecord[] => {
      const key = dayKey();
      const cur = s.days.find((d) => d.date === key) ?? { date: key, seconds: 0, reviews: 0, updatedAt: 0 };
      const next: DayRecord = {
        ...cur,
        seconds: cur.seconds + (patch.seconds ?? 0),
        reviews: cur.reviews + (patch.reviews ?? 0),
        updatedAt: Date.now(),
      };
      put("days", next);
      return upsert(s.days, next, (d) => d.date === key);
    };

    return {
      updateSettings(patch) {
        const s = ref.current;
        const settings = { ...s.settings, ...patch, updatedAt: Date.now() };
        if (patch.theme) applyTheme(patch.theme);
        if (patch.sound !== undefined) setSoundEnabled(patch.sound);
        if (patch.names) {
          applyNames(resolveNames(settings.names));
          setNamesVersion((v) => v + 1);
        }
        commit({ ...s, settings });
        db().then((d) => d.put("kv", settings, "settings"));
      },

      saveCard(input) {
        const s = ref.current;
        if (s.deck.some((c) => c.id === input.id)) return false;
        const now = Date.now();
        const card: DeckCard = {
          ...input,
          stage1: input.stage1 ?? phrases.some((p) => p.id === input.id),
          fsrs: newFsrs(new Date(now)),
          createdAt: now,
          updatedAt: now,
        };
        put("deck", card);
        commit({ ...s, deck: [...s.deck, card] });
        return true;
      },

      removeCard(id) {
        const s = ref.current;
        db().then((d) => d.delete("deck", id));
        commit({ ...s, deck: s.deck.filter((c) => c.id !== id) });
      },

      rateCard(id, grade) {
        const s = ref.current;
        const card = s.deck.find((c) => c.id === id);
        if (!card) return;
        const now = new Date();
        const { fsrs, log } = rate(card, grade, now);
        const updated: DeckCard = { ...card, fsrs, updatedAt: now.getTime() };
        const review: ReviewLogRecord = {
          id: `${id}:${now.getTime()}`,
          cardId: id,
          rating: grade,
          stateBefore: log.state,
          reviewedAt: now.getTime(),
          scheduledDays: log.scheduled_days,
        };
        put("deck", updated);
        put("reviews", review);
        let next: Snapshot = {
          ...s,
          deck: upsert(s.deck, updated, (c) => c.id === id),
          reviews: [...s.reviews, review],
        };
        next = { ...next, days: bumpDay(next, { reviews: 1 }) };
        // Review moves words forward: recalled → learning, stable → known.
        if (grade !== Rating.Again) {
          const target: WordStatus = fsrs.stability >= KNOWN_STABILITY_DAYS ? "known" : "learning";
          next = { ...next, words: promoteWords(next, card.es, target) };
        }
        commit(next);
      },

      setWordStatus(key, status) {
        const s = ref.current;
        const rec: WordRecord = { key, status, by: "me", updatedAt: Date.now() };
        put("words", rec);
        commit({ ...s, words: upsert(s.words, rec, (w) => w.key === key) });
      },

      markRead(lessonId, linesRead) {
        const s = ref.current;
        const cur = s.reading.find((r) => r.lessonId === lessonId);
        if (cur && cur.linesRead >= linesRead) return;
        const rec = {
          lessonId,
          linesRead,
          finished: cur?.finished ?? false,
          finishedAt: cur?.finishedAt ?? null,
          updatedAt: Date.now(),
        };
        put("reading", rec);
        commit({ ...s, reading: upsert(s.reading, rec, (r) => r.lessonId === lessonId) });
      },

      finishLesson(lessonId) {
        const s = ref.current;
        const cur = s.reading.find((r) => r.lessonId === lessonId);
        if (cur?.finished) return false;
        const now = Date.now();
        const rec = { lessonId, linesRead: cur?.linesRead ?? 0, finished: true, finishedAt: now, updatedAt: now };
        put("reading", rec);
        commit({ ...s, reading: upsert(s.reading, rec, (r) => r.lessonId === lessonId) });
        return true;
      },

      addSeconds(seconds) {
        if (seconds <= 0) return;
        const s = ref.current;
        commit({ ...s, days: bumpDay(s, { seconds }) });
      },

      recordMission(score, total) {
        const s = ref.current;
        const now = Date.now();
        const rec = { id: `m${now}`, week: isoWeek(), score, total, takenAt: now };
        put("missions", rec);
        commit({ ...s, missions: [...s.missions, rec] });
      },

      introduceStage1(count) {
        const s = ref.current;
        const inDeck = new Set(s.deck.map((c) => c.id));
        const next = phrases.filter((p) => !inDeck.has(p.id)).slice(0, count);
        const now = Date.now();
        const cards: DeckCard[] = next.map((p, i) => ({
          id: p.id,
          source: "phrase",
          sourceRef: p.category,
          sourceTitle: "50 frases",
          es: p.es,
          en: p.en,
          note: p.note,
          reg: p.reg,
          stage1: true,
          fsrs: newFsrs(new Date(now + i)),
          createdAt: now + i,
          updatedAt: now + i,
        }));
        cards.forEach((c) => put("deck", c));
        if (cards.length) commit({ ...s, deck: [...s.deck, ...cards] });
        return cards.length;
      },

      exportJSON() {
        return JSON.stringify(
          { app: "hablarrr", version: 1, exportedAt: new Date().toISOString(), data: ref.current },
          null,
          1,
        );
      },

      async importJSON(json) {
        const parsed = JSON.parse(json);
        if (parsed?.app !== "hablarrr" || !parsed.data) throw new Error("This doesn’t look like a Hablarrr backup.");
        const snap: Snapshot = { ...EMPTY, ...parsed.data, settings: { ...DEFAULT_SETTINGS, ...parsed.data.settings } };
        await replaceAll(snap);
        applyNames(resolveNames(snap.settings.names));
        setNamesVersion((v) => v + 1);
        applyTheme(snap.settings.theme);
        setSoundEnabled(snap.settings.sound);
        commit(snap);
      },
    };
  }, [commit]);

  const value = useMemo<StoreValue>(
    () => ({
      ...actions,
      ready,
      data,
      wordStatus: (key: string) => wordMap.get(key)?.status ?? "new",
    }),
    [actions, ready, data, wordMap],
  );

  // Nothing renders until the saved names are in, so the defaults never flash.
  return (
    <StoreContext.Provider value={value}>
      {ready && <Fragment key={namesVersion}>{children}</Fragment>}
    </StoreContext.Provider>
  );
}
