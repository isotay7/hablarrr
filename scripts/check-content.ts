// Checks every lesson and phrase: unique ids, required fields, and a meaning for every word.
// Run with: npm run check:content
import { characters, lessons, lexicon, missionQuestions, phrases } from "../src/content";
import { expandRef, MEN } from "../src/content/faith/men";
import faithTexts from "../src/content/faith/texts.json";
import { tokenize } from "../src/lib/tokenize";

const problems: string[] = [];
const missing = new Map<string, string>();
const ids = new Set<string>();

function checkId(id: string) {
  if (ids.has(id)) problems.push(`duplicate id ${id}`);
  ids.add(id);
}

function checkText(id: string, es: string, en: string, overrides?: Record<string, unknown>) {
  if (!es.trim() || !en.trim()) problems.push(`${id}: empty es/en`);
  for (const t of tokenize(es)) {
    if (!t.key) continue;
    if (!lexicon[t.key] && !overrides?.[t.key] && !missing.has(t.key)) missing.set(t.key, `${id}: ${es}`);
  }
}

for (const lesson of lessons) {
  checkId(lesson.id);
  for (const line of lesson.lines) {
    checkId(line.id);
    if (!line.id.startsWith(lesson.id + "-")) problems.push(`${line.id}: id should start with ${lesson.id}-`);
    if (line.reg && !line.to) problems.push(`${line.id}: reg without to`);
    checkText(line.id, line.es, line.en, line.gloss);
  }
}
for (const p of phrases) {
  checkId(p.id);
  checkText(p.id, p.es, p.en);
  if (!p.say?.trim()) problems.push(`${p.id}: no pronunciation guide`);
  if (!["family", "travel", "both"].includes(p.mission)) problems.push(`${p.id}: mission must be family, travel or both`);
  if (p.scene?.lines.length !== 2) problems.push(`${p.id}: the mini scene needs exactly 2 lines`);
  const bare = (t: string) => t.toLowerCase().replace(/[¡!¿?.,]/g, "").trim();
  const inScene = p.scene?.lines.some((l) => bare(l.es).includes(bare(p.es)));
  if (!inScene) problems.push(`${p.id}: the mini scene doesn’t use the phrase`);
  p.scene?.lines.forEach((l, i) => {
    if (!(l.who in characters)) problems.push(`${p.id}.scene.${i}: unknown speaker "${l.who}"`);
    checkText(`${p.id}.scene.${i}`, l.es, l.en);
  });
}

for (const q of missionQuestions) {
  checkId(q.id);
  checkText(q.id, q.es, q.en);
  q.choices.forEach((c, i) => checkText(`${q.id}.${i}`, c, q.why));
  if (q.answer < 0 || q.answer >= q.choices.length) problems.push(`${q.id}: answer out of range`);
}

// Real names never go in the repo: speakers are roles, text uses {me}, {partner}, …
for (const lesson of lessons) {
  for (const line of lesson.lines) {
    if (line.who && !(line.who in characters)) problems.push(`${line.id}: unknown speaker "${line.who}"`);
  }
}
for (const q of missionQuestions) {
  if (q.mission !== "family" && q.mission !== "travel") problems.push(`${q.id}: mission must be family or travel`);
}
// The Fe path: every verse it shows must be in texts.json (built by scripts/faith-texts.ts).
const verses = faithTexts as Record<string, { en: string; es: string }>;
let faithDays = 0;
for (const m of MEN) {
  checkId(`fe:${m.id}`);
  if (m.days.length < 3 || m.days.length > 5) problems.push(`fe:${m.id}: needs 3–5 days`);
  for (const d of m.days) {
    faithDays++;
    if (d.facts.length < 4 || d.facts.length > 6) problems.push(`fe:${m.id} “${d.title}”: needs 4–6 facts`);
    if (!d.question.trim()) problems.push(`fe:${m.id} “${d.title}”: no question`);
    for (const ref of [d.read, ...(d.verse ? [d.verse.ref] : [])])
      for (const k of expandRef(ref)) if (!verses[k]) problems.push(`fe:${m.id}: ${k} missing from texts.json`);
  }
  for (const k of expandRef(m.recap.verse.ref)) if (!verses[k]) problems.push(`fe:${m.id} recap: ${k} missing`);
  if (!m.recap.timeline.length || !m.recap.strengths.length || !m.recap.failures.length)
    problems.push(`fe:${m.id}: recap needs a timeline, strengths and failures`);
}

for (const [key, where] of missing) problems.push(`no meaning for "${key}" (${where})`);

const wordCount = Object.keys(lexicon).length;
if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(
  `Content OK: ${lessons.length} lessons, ${phrases.length} phrases, ${wordCount} glossed words, ${MEN.length} men / ${faithDays} faith readings.`,
);
