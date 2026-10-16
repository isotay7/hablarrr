// Checks every lesson and phrase: unique ids, required fields, and a meaning for every word.
// Run with: npm run check:content
import { lessons, lexicon, missionQuestions, phrases } from "../src/content";
import { ROLES } from "../src/content/people";
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
}

for (const q of missionQuestions) {
  checkId(q.id);
  checkText(q.id, q.es, q.en);
  q.choices.forEach((c, i) => checkText(`${q.id}.${i}`, c, q.why));
  if (q.answer < 0 || q.answer >= q.choices.length) problems.push(`${q.id}: answer out of range`);
}

// Real names never go in the repo: speakers are roles, text uses {me}, {partner}, …
const roleSet = new Set<string>(ROLES);
for (const lesson of lessons) {
  for (const line of lesson.lines) {
    if (line.who && !roleSet.has(line.who) && line.who !== "abuela" && line.who !== "narrador")
      problems.push(`${line.id}: unknown speaker "${line.who}"`);
  }
}
for (const [key, where] of missing) problems.push(`no meaning for "${key}" (${where})`);

const wordCount = Object.keys(lexicon).length;
if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`Content OK: ${lessons.length} lessons, ${phrases.length} phrases, ${wordCount} glossed words.`);
