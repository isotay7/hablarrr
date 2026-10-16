// Shapes of the JSON content files in src/content.

export type Register = "usted" | "tu" | "ustedes";

/** The real people. Their names live only on the device (see people.ts). */
export type Role = "me" | "partner" | "mom" | "dad" | "sibling";

export type CharacterId = Role | "abuela" | "narrador";

export interface Gloss {
  /** English meaning, short. */
  g: string;
  /** Dictionary form, when the word is conjugated or inflected. */
  l?: string;
  /** Extra note: Mexican usage, grammar, pronunciation. */
  n?: string;
}

export interface CultureNote {
  title: string;
  text: string;
}

export interface Line {
  id: string;
  who?: CharacterId;
  es: string;
  en: string;
  /** Who this line is addressed to and in which register. */
  reg?: Register;
  to?: string;
  note?: string;
  culture?: CultureNote;
  /** Per-line meaning overrides keyed by the lowercased word. */
  gloss?: Record<string, Gloss>;
}

export interface Lesson {
  id: string;
  kind: "dialogue" | "story";
  title: string;
  /** English subtitle. */
  subtitle: string;
  /** One-line scene description in English. */
  scene: string;
  lines: Line[];
}

export type PhraseCategory =
  "saludos" | "respeto" | "comida" | "trabajo" | "familia" | "gracias" | "despedidas" | "ayuda";

export interface Phrase {
  id: string;
  es: string;
  en: string;
  category: PhraseCategory;
  reg?: Register;
  note?: string;
}

export type Lexicon = Record<string, Gloss>;
