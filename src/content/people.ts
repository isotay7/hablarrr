// Real names never go in the repo. Content says {me}, {partner}, {mom}, {dad}
// and {sibling}; applyNames() fills them in from the names saved on the device.
import type { Lexicon, Role } from "./types";

export type Names = Record<Role, string>;

export const ROLES: Role[] = ["me", "partner", "mom", "dad", "sibling"];

/** Shown until real names are entered in Settings. */
export const DEFAULT_NAMES: Names = {
  me: "Sam",
  partner: "Alex",
  mom: "Rosa",
  dad: "Miguel",
  sibling: "Dani",
};

export const ROLE_LABELS: Record<Role, string> = {
  me: "You",
  partner: "Your partner",
  mom: "Their mom",
  dad: "Their dad",
  sibling: "Their sibling",
};

const PLACEHOLDER = /\{(me|partner|mom|dad|sibling)\}/g;

export function fillNames(text: string, names: Names): string {
  return text.replace(PLACEHOLDER, (_, role: Role) => names[role]);
}

export function resolveNames(saved?: Partial<Names>): Names {
  const out = { ...DEFAULT_NAMES };
  for (const r of ROLES) {
    const v = saved?.[r]?.trim();
    if (v) out[r] = v;
  }
  return out;
}

/** Name → gloss entries, so tapping a name in the reader explains who it is. */
export function nameGlosses(names: Names): Lexicon {
  const who: Record<Role, string> = {
    me: "that’s you!",
    partner: "your partner",
    mom: `${names.partner}’s mom`,
    dad: `${names.partner}’s dad`,
    sibling: `${names.partner}’s sibling`,
  };
  const out: Lexicon = {};
  for (const r of ROLES) {
    for (const part of names[r].toLowerCase().split(/\s+/)) {
      if (part) out[part] = { g: `${names[r]} (${who[r]})` };
    }
  }
  return out;
}
