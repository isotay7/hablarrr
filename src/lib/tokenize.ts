export interface Token {
  /** Text as displayed, including attached punctuation. */
  text: string;
  /** Lowercased word with punctuation stripped; "" for pure punctuation. */
  key: string;
}

const EDGE_PUNCT = /^[¡¿«»"“”'‘’(\[…]+|[!?.,;:«»"“”'‘’)\]…]+$/g;

export function wordKey(raw: string): string {
  return raw.replace(EDGE_PUNCT, "").replace(EDGE_PUNCT, "").toLowerCase();
}

export function tokenize(sentence: string): Token[] {
  return sentence
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, key: wordKey(text) }));
}

/** Unique word keys in a sentence, in order. */
export function sentenceKeys(sentence: string): string[] {
  const seen = new Set<string>();
  for (const t of tokenize(sentence)) if (t.key) seen.add(t.key);
  return [...seen];
}
