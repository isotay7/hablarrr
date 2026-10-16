import { dialogues, phrases, stories } from "@/content";
import type { CharacterId, Line } from "@/content/types";
import type { NewCardInput } from "./store";

export type FeedKind = "frase" | "dialogo" | "historia" | "cultura";

export interface FeedLine {
  id: string;
  who?: CharacterId;
  es: string;
  en: string;
  line?: Line;
  card: NewCardInput;
}

export interface FeedItem {
  id: string;
  kind: FeedKind;
  context: string;
  lines: FeedLine[];
  note?: string;
  /** Culture cards: English title and text. */
  culture?: { title: string; text: string };
  href?: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  saludos: "greetings",
  respeto: "respect",
  comida: "at dinner",
  trabajo: "about your job",
  familia: "family",
  gracias: "thanks",
  despedidas: "goodbyes",
  ayuda: "when you’re lost",
};

function lineCard(lessonId: string, lessonTitle: string, kind: "dialogue" | "story", l: Line): NewCardInput {
  return {
    id: l.id,
    source: kind,
    sourceRef: lessonId,
    sourceTitle: lessonTitle,
    es: l.es,
    en: l.en,
    note: l.note,
    reg: l.reg,
  };
}

function regLabel(reg?: string) {
  return reg === "usted" ? " · usted" : reg === "tu" ? " · tú" : reg === "ustedes" ? " · ustedes" : "";
}

export function buildFeed(seed: string): FeedItem[] {
  const frases: FeedItem[] = phrases.map((p) => ({
    id: `f-${p.id}`,
    kind: "frase",
    context: `${CATEGORY_LABEL[p.category]}${regLabel(p.reg)}`,
    note: p.note,
    lines: [
      {
        id: `feed:${p.id}`,
        es: p.es,
        en: p.en,
        card: {
          id: p.id,
          source: "phrase",
          sourceRef: p.category,
          sourceTitle: "50 frases",
          es: p.es,
          en: p.en,
          note: p.note,
          reg: p.reg,
          stage1: true,
        },
      },
    ],
  }));

  const dialogos: FeedItem[] = [];
  const cultura: FeedItem[] = [];
  for (const d of dialogues) {
    for (let i = 0; i + 1 < d.lines.length; i += 2) {
      const pair = d.lines.slice(i, i + 2);
      dialogos.push({
        id: `d-${pair[0].id}`,
        kind: "dialogo",
        context: d.title,
        href: `/leer/${d.id}`,
        note: pair.find((l) => l.note)?.note,
        lines: pair.map((l) => ({
          id: `feed:${l.id}`,
          who: l.who,
          es: l.es,
          en: l.en,
          line: l,
          card: lineCard(d.id, d.title, "dialogue", l),
        })),
      });
    }
    for (const l of d.lines) {
      if (l.culture)
        cultura.push({
          id: `c-${l.id}`,
          kind: "cultura",
          context: d.title,
          culture: l.culture,
          href: `/leer/${d.id}`,
          lines: [
            {
              id: `feed:${l.id}`,
              who: l.who,
              es: l.es,
              en: l.en,
              line: l,
              card: lineCard(d.id, d.title, "dialogue", l),
            },
          ],
        });
    }
  }

  const historias: FeedItem[] = [];
  for (const s of stories) {
    const chunks = Math.ceil(s.lines.length / 3);
    for (let c = 0; c < chunks; c++) {
      const part = s.lines.slice(c * 3, c * 3 + 3);
      historias.push({
        id: `h-${part[0].id}`,
        kind: "historia",
        context: `${s.title} · ${c + 1} of ${chunks}`,
        href: `/leer/${s.id}`,
        lines: part.map((l) => ({
          id: `feed:${l.id}`,
          es: l.es,
          en: l.en,
          line: l,
          card: lineCard(s.id, s.title, "story", l),
        })),
      });
    }
  }

  // Phrases and dialogue bits shuffle freely; story parts stay in order but get spread out.
  const rand = mulberry32(hash(seed));
  const pool = shuffle([...frases, ...dialogos, ...cultura], rand);
  const out: FeedItem[] = [];
  const storyQueue = [...historias];
  let sinceStory = 0;
  for (const item of pool) {
    out.push(item);
    sinceStory++;
    if (sinceStory >= 4 && storyQueue.length) {
      out.push(storyQueue.shift()!);
      sinceStory = 0;
    }
  }
  return [...out, ...storyQueue];
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
