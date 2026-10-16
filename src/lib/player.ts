"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SpeedName } from "./db";
import { markActive } from "./activity";
import { speak, stopSpeaking } from "./speech";
import { useStore } from "./store";

// One global player: only one sentence speaks and highlights at a time.

interface PlayerState {
  id: string | null;
  word: number;
}

let state: PlayerState = { id: null, word: -1 };
const listeners = new Set<() => void>();

function set(next: PlayerState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const SERVER_STATE: PlayerState = { id: null, word: -1 };

export function usePlayer() {
  const { data } = useStore();
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );

  const play = useCallback(
    (id: string, text: string, opts?: { speed?: SpeedName; onEnd?: () => void }) => {
      markActive();
      set({ id, word: -1 });
      speak(text, {
        speed: opts?.speed ?? data.settings.speed,
        voiceURI: data.settings.voiceURI,
        onWord: (word) => {
          markActive();
          if (state.id === id) set({ id: word === -1 ? null : id, word });
        },
        onEnd: () => {
          if (state.id === id) set({ id: null, word: -1 });
          opts?.onEnd?.();
        },
      });
    },
    [data.settings.speed, data.settings.voiceURI],
  );

  const stop = useCallback(() => {
    stopSpeaking();
    set({ id: null, word: -1 });
  }, []);

  return { playingId: snap.id, wordIndex: snap.word, play, stop };
}
