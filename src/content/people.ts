// Real names and personal details never go in the repo. Content says {me},
// {partner}, {mom}, {dad}, {sibling}, {home} and {age}; applyNames() fills them
// in from what's saved on the device.
import type { Lexicon, Role } from "./types";

/** Personal details that aren't people: where you're from and how old you are. */
export type Detail = "home" | "age";
export type Field = Role | Detail;

export type Names = Record<Field, string>;

export const ROLES: Role[] = ["me", "partner", "mom", "dad", "sibling"];
export const DETAILS: Detail[] = ["home", "age"];
export const FIELDS: Field[] = [...ROLES, ...DETAILS];

/** Shown until the real ones are entered in Settings. */
export const DEFAULT_NAMES: Names = {
  me: "Sam",
  partner: "Alex",
  mom: "Rosa",
  dad: "Miguel",
  sibling: "Dani",
  home: "Ohio",
  age: "30",
};

export const ROLE_LABELS: Record<Field, string> = {
  me: "You",
  partner: "Your partner",
  mom: "Their mom",
  dad: "Their dad",
  sibling: "Their sibling",
  home: "Where you’re from (state)",
  age: "Your age",
};

const PLACEHOLDER = /\{(me|partner|mom|dad|sibling|home|age)\}/g;

export function fillNames(text: string, names: Names): string {
  return text.replace(PLACEHOLDER, (_, field: Field) => names[field]);
}

export function resolveNames(saved?: Partial<Names>): Names {
  const out = { ...DEFAULT_NAMES };
  for (const f of FIELDS) {
    const v = saved?.[f]?.trim();
    if (v) out[f] = v;
  }
  return out;
}

/** Name → gloss entries, so tapping a name in the reader explains who it is. */
export function nameGlosses(names: Names): Lexicon {
  const who: Record<Field, string> = {
    me: "that’s you!",
    partner: "your partner",
    mom: `${names.partner}’s mom`,
    dad: `${names.partner}’s dad`,
    sibling: `${names.partner}’s sibling`,
    home: "where you’re from",
    age: "your age",
  };
  const out: Lexicon = {};
  for (const f of FIELDS) {
    for (const part of names[f].toLowerCase().split(/\s+/)) {
      if (part) out[part] = { g: `${names[f]} (${who[f]})` };
    }
  }
  return out;
}
