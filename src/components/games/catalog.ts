import type { IconName } from "@/components/Icon";
import type { GameId } from "@/lib/progress";

export interface GameInfo {
  id: GameId;
  es: string;
  en: string;
  icon: IconName;
  tone: string;
  /** How the best result reads on the game card. */
  best: (n: number) => string;
  /** Still being built: shown, but not playable yet. */
  soon?: boolean;
}

export const GAMES: GameInfo[] = [
  {
    id: "loteria",
    es: "Lotería",
    en: "Hear the call, mark your board, shout ¡Lotería!",
    icon: "grid",
    tone: "#B4532F",
    best: (n) => `${n} ${n === 1 ? "win" : "wins"}`,
    soon: true,
  },
  {
    id: "escucha",
    es: "Escucha y toca",
    en: "Hear a phrase, tap what it means. Streaks speed it up.",
    icon: "ear",
    tone: "#2F5DA8",
    best: (n) => `Best streak ${n}`,
  },
  {
    id: "arma",
    es: "Arma la frase",
    en: "Put the words back in order.",
    icon: "blocks",
    tone: "#3F8A6B",
    best: (n) => `Best ${n}`,
  },
  {
    id: "parejas",
    es: "Parejas",
    en: "Match Spanish to English against the clock.",
    icon: "cards",
    tone: "#6B4E8A",
    best: (n) => `Best ${n}s`,
    soon: true,
  },
  {
    id: "rayo",
    es: "Rayo",
    en: "60 seconds. As many as you can.",
    icon: "bolt",
    tone: "#C2432B",
    best: (n) => `Record ${n}`,
  },
  {
    id: "tacos",
    es: "El puesto de tacos",
    en: "Order, eat and pay. Good answers earn tips.",
    icon: "taco",
    tone: "#8A5A2B",
    best: (n) => `Best tips $${n}`,
    soon: true,
  },
];

export function gameInfo(id: GameId): GameInfo {
  return GAMES.find((g) => g.id === id)!;
}
