// Shapes of the JSON content files in src/content.

export type Register = "usted" | "tu" | "ustedes";

/** The real people. Their names live only on the device (see people.ts). */
export type Role = "me" | "partner" | "mom" | "dad" | "sibling";

/** People you meet while traveling. Shown by job, not by name. */
export type TravelRole =
  | "taquero"
  | "mesera"
  | "recepcionista"
  | "despachador"
  | "vendedora"
  | "taxista"
  | "local"
  | "farmaceutico";

export type CharacterId = Role | TravelRole | "abuela" | "narrador";

/** Which mission something serves. Phrases can serve both. */
export type Mission = "family" | "travel";
export type MissionTag = Mission | "both";

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
  /** Dialogues only; family when missing. */
  mission?: Mission;
  title: string;
  /** English subtitle. */
  subtitle: string;
  /** One-line scene description in English. */
  scene: string;
  lines: Line[];
}

export type PhraseCategory =
  | "saludos"
  | "respeto"
  | "comida"
  | "trabajo"
  | "familia"
  | "gracias"
  | "despedidas"
  | "ayuda"
  | "direcciones"
  | "dinero"
  | "hotel"
  | "transporte"
  | "compras"
  | "salud"
  | "tiempo";

export interface SceneLine {
  who: CharacterId;
  es: string;
  en: string;
}

/** A two-line moment that shows a phrase in use. */
export interface Scene {
  /** English, e.g. "At a taco stand". */
  where: string;
  mission: Mission;
  lines: SceneLine[];
}

export interface Phrase {
  id: string;
  es: string;
  en: string;
  category: PhraseCategory;
  mission: MissionTag;
  /** Pronunciation for English speakers, stressed syllable in caps: "MOO-choh GOOS-toh". */
  say: string;
  scene: Scene;
  reg?: Register;
  /** When to use it. No grammar: Stage 1 teaches whole chunks. */
  note?: string;
}

export type Lexicon = Record<string, Gloss>;
