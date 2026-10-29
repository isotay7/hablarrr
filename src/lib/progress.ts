// Pesos, XP, game records and the other fun stuff. Stored on the device in kv "progress".

export type GameId = "escucha" | "arma" | "rayo" | "parejas" | "loteria" | "tacos";

export interface GameStats {
  plays: number;
  /** Best score: correct answers, or seconds for Parejas (lower is better). */
  best: number;
  wins: number;
  /** Lotería: rounds won. Tacos: runs with every answer right. */
  perfect: number;
  lastPlayed: number;
}

/** What happened on one day, for daily quests. */
export interface DailyLog {
  games: number;
  gameIds: GameId[];
  /** Correct answers across all games. */
  correct: number;
  /** Quest ids already cashed in, plus "bonus". */
  claimed: string[];
}

export interface Progress {
  pesos: number;
  /** Pesos ever earned, so spending never lowers a level. */
  earned: number;
  xp: number;
  games: Partial<Record<GameId, GameStats>>;
  daily: Record<string, DailyLog>;
  /** Streak freezes waiting to be used. */
  freezes: number;
  /** Days a freeze covered (YYYY-MM-DD). */
  frozenDays: string[];
  /** Streak length when the last freeze was earned, so each 7 days earns one. */
  freezeEarnedAt: number;
  /** Cosmetic ids bought in the shop. */
  owned: string[];
  equipped: { cardBack: string; celebration: string };
  /** Badge id → when it was first earned. */
  badges: Record<string, number>;
  updatedAt: number;
}

export const DEFAULT_PROGRESS: Progress = {
  pesos: 0,
  earned: 0,
  xp: 0,
  games: {},
  daily: {},
  freezes: 0,
  frozenDays: [],
  freezeEarnedAt: 0,
  owned: [],
  equipped: { cardBack: "clasico", celebration: "papel" },
  badges: {},
  updatedAt: 0,
};

export const EMPTY_DAY: DailyLog = { games: 0, gameIds: [], correct: 0, claimed: [] };

export interface GameResult {
  game: GameId;
  /** Correct answers (or seconds for Parejas). */
  score: number;
  correct: number;
  won?: boolean;
  perfect?: boolean;
  /** Extra pesos, e.g. tips at the taco stand. */
  tips?: number;
}

/** Pesos and XP for a finished game. */
export function gameReward(r: GameResult): { pesos: number; xp: number } {
  const pesos = Math.min(30, 2 + r.correct) + (r.won ? 10 : 0) + (r.perfect ? 10 : 0) + (r.tips ?? 0);
  const xp = 10 + r.correct * 2 + (r.won ? 15 : 0);
  return { pesos, xp };
}

export const REWARD = {
  phrase: { pesos: 3, xp: 10 },
  review: { pesos: 0, xp: 2 },
  /** Each daily quest, and the bonus for finishing all three. */
  quest: { pesos: 10, xp: 15 },
  questBonus: { pesos: 25, xp: 40 },
};

/** Level N starts at 50·N·(N−1) XP: 0, 100, 300, 600, 1000… */
export function levelFor(xp: number) {
  let level = 1;
  while (50 * (level + 1) * level <= xp) level++;
  const start = 50 * level * (level - 1);
  const next = 50 * (level + 1) * level;
  return { level, into: xp - start, span: next - start };
}

export function isBetter(game: GameId, score: number, best: number | undefined) {
  if (best === undefined || best === 0) return score > 0;
  return game === "parejas" ? score < best : score > best;
}
