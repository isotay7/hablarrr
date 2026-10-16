import type { CharacterId, Gloss, Lesson, Lexicon, Line, Phrase } from "./types";
import { DEFAULT_NAMES, fillNames, nameGlosses, ROLES, type Names } from "./people";
import d01 from "./lessons/d01.json";
import d02 from "./lessons/d02.json";
import d03 from "./lessons/d03.json";
import d04 from "./lessons/d04.json";
import d05 from "./lessons/d05.json";
import d06 from "./lessons/d06.json";
import d07 from "./lessons/d07.json";
import d08 from "./lessons/d08.json";
import d09 from "./lessons/d09.json";
import d10 from "./lessons/d10.json";
import s01 from "./lessons/s01.json";
import s02 from "./lessons/s02.json";
import s03 from "./lessons/s03.json";
import phrasesJson from "./phrases.json";
import lexiconJson from "./lexicon.json";
import missionJson from "./mission.json";

export const lessons = [d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, s01, s02, s03] as Lesson[];
export const dialogues = lessons.filter((l) => l.kind === "dialogue");
export const stories = lessons.filter((l) => l.kind === "story");
export const phrases = phrasesJson as Phrase[];
export const lexicon = lexiconJson as Lexicon;

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function findLine(lineId: string): { lesson: Lesson; line: Line } | undefined {
  for (const lesson of lessons) {
    const line = lesson.lines.find((l) => l.id === lineId);
    if (line) return { lesson, line };
  }
  return undefined;
}

export function glossFor(key: string, line?: Line): Gloss | undefined {
  return line?.gloss?.[key] ?? lexicon[key];
}

export interface Character {
  name: string;
  initial: string;
  /** Avatar background and foreground. */
  bg: string;
  fg: string;
}

export const characters: Record<CharacterId, Character> = {
  me: { name: "", initial: "", bg: "#F2A93B", fg: "#2B1D15" },
  partner: { name: "", initial: "", bg: "#7A5C46", fg: "#FFF6EA" },
  mom: { name: "", initial: "", bg: "#B4532F", fg: "#FFF6EA" },
  dad: { name: "", initial: "", bg: "#2F5DA8", fg: "#F4F7FF" },
  sibling: { name: "", initial: "", bg: "#E6D6C3", fg: "#2B1D15" },
  abuela: { name: "Abuela", initial: "A", bg: "#6B4E8A", fg: "#F7F0FF" },
  narrador: { name: "", initial: "", bg: "transparent", fg: "inherit" },
};

export interface MissionQuestion {
  id: string;
  who: CharacterId;
  /** "asks you at dinner" — follows the speaker's name. */
  setup: string;
  es: string;
  en: string;
  choices: string[];
  answer: number;
  why: string;
}

/** Hand-written questions, several of which test usted vs tú. */
export const missionQuestions = missionJson as MissionQuestion[];

/** Someone in a dialogue says a line and you reply: the reply is the answer. */
export function dialogueQuestions(): MissionQuestion[] {
  const myLines = dialogues.flatMap((d) => d.lines.filter((l) => l.who === "me"));
  const out: MissionQuestion[] = [];
  for (const d of dialogues) {
    d.lines.forEach((l, i) => {
      const reply = d.lines[i + 1];
      if (!l.who || l.who === "me" || !reply || reply.who !== "me" || !l.es.includes("?")) return;
      const distractors = myLines.filter((t) => t.id !== reply.id && t.es !== reply.es);
      out.push({
        id: `q-${l.id}`,
        who: l.who,
        setup: `asks you · ${d.title}`,
        es: l.es,
        en: l.en,
        choices: [reply.es, ...pickDeterministic(distractors, l.id, 2).map((t) => t.es)],
        answer: 0,
        why: `“${reply.en}”${reply.note ? ` ${reply.note}` : ""}`,
      });
    });
  }
  return out;
}

function pickDeterministic<T>(list: T[], seed: string, n: number): T[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const out: T[] = [];
  const used = new Set<number>();
  while (out.length < n && used.size < list.length) {
    h = (h * 1103515245 + 12345) >>> 0;
    const i = h % list.length;
    if (!used.has(i)) {
      used.add(i);
      out.push(list[i]);
    }
  }
  return out;
}

export const STAGE1_TOTAL = phrases.length;
export const STAGE2_GOAL = 800;

// Templates with {role} placeholders, kept so names can be changed later.
const RAW = structuredClone({ lessons, phrases, missionQuestions });
const BASE_LEXICON: Lexicon = { ...lexicon };

/** Copies every string from the template into the live object, with names filled in. */
function fillInto(raw: unknown, live: unknown, names: Names) {
  if (!raw || typeof raw !== "object" || !live || typeof live !== "object") return;
  const r = raw as Record<string, unknown>;
  const l = live as Record<string, unknown>;
  for (const k of Object.keys(r)) {
    if (typeof r[k] === "string") l[k] = fillNames(r[k] as string, names);
    else fillInto(r[k], l[k], names);
  }
}

/**
 * Puts real names into all content. The content objects are updated in place,
 * so call this before rendering anything that reads them.
 */
export function applyNames(names: Names) {
  fillInto(RAW.lessons, lessons, names);
  fillInto(RAW.phrases, phrases, names);
  fillInto(RAW.missionQuestions, missionQuestions, names);
  for (const r of ROLES) {
    characters[r].name = names[r];
    characters[r].initial = names[r].charAt(0).toUpperCase();
  }
  for (const k of Object.keys(lexicon)) if (!(k in BASE_LEXICON)) delete lexicon[k];
  Object.assign(lexicon, BASE_LEXICON, nameGlosses(names));
}

applyNames(DEFAULT_NAMES);
