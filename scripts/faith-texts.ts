// Builds src/content/faith/texts.json from the public-domain verse-per-line files on eBible.org:
//   https://ebible.org/Scriptures/eng-web_vpl.zip     (World English Bible)
//   https://ebible.org/Scriptures/spaRV1909_vpl.zip   (Reina-Valera 1909)
// Run with: npx tsx scripts/faith-texts.ts <eng-web_vpl.txt> <spaRV1909_vpl.txt>
// Every verse the Fe path uses is copied verbatim; excerpts in men.ts must match exactly.
import { readFileSync, writeFileSync } from "node:fs";
import { expandRef, MEN } from "../src/content/faith/men";

const [webPath, rvPath] = process.argv.slice(2);
if (!webPath || !rvPath) {
  console.error("usage: tsx scripts/faith-texts.ts <eng-web_vpl.txt> <spaRV1909_vpl.txt>");
  process.exit(1);
}

function load(path: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = /^(\S+ \d+:\d+) (.*)$/.exec(line);
    // [brackets] mark words the translators supplied (italics in print); keep the words.
    if (m) map.set(m[1], m[2].replace(/[[\]]/g, "").trim());
  }
  return map;
}

const web = load(webPath);
const rv = load(rvPath);
const keys = new Set<string>();
const problems: string[] = [];

const verses = MEN.flatMap((m) => [...m.days.flatMap((d) => (d.verse ? [d.verse] : [])), m.recap.verse]);
for (const m of MEN) for (const d of m.days) expandRef(d.read).forEach((k) => keys.add(k));
for (const v of verses) expandRef(v.ref).forEach((k) => keys.add(k));

const out: Record<string, { en: string; es: string }> = {};
for (const k of [...keys].sort()) {
  const en = web.get(k);
  const es = rv.get(k);
  if (!en || !es) problems.push(`missing ${k}`);
  else out[k] = { en, es };
}
for (const v of verses) {
  const full = expandRef(v.ref).map((k) => out[k]);
  if (full.some((x) => !x)) continue;
  if (v.es && !full.some((x) => x.es.includes(v.es!))) problems.push(`${v.ref}: Spanish excerpt not found: ${v.es}`);
  if (v.en && !full.some((x) => x.en.includes(v.en!))) problems.push(`${v.ref}: English excerpt not found: ${v.en}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
writeFileSync(new URL("../src/content/faith/texts.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`Wrote ${Object.keys(out).length} verses.`);
