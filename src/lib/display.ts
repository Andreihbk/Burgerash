// The display font (.font-bebas, Eatvetica) has no Romanian diacritics, so every
// display-font string is transliterated at render time. Body text (Nunito) keeps its diacritics.
// Catalog data is never changed: call this where the string is rendered.
const MAP: Record<string, string> = {
  ă: "a", â: "a", î: "i", ș: "s", ş: "s", ț: "t", ţ: "t",
  Ă: "A", Â: "A", Î: "I", Ș: "S", Ş: "S", Ț: "T", Ţ: "T",
};

export function stripDiacritics(text: string): string {
  return text.replace(/[ăâîșşțţĂÂÎȘŞȚŢ]/g, (c) => MAP[c] ?? c);
}

/** Splits text into alternating [text, digits, text, digits...] parts; digits keep decimal/time separators (12,50 / 10:30). */
export function splitDigits(text: string): string[] {
  return text.split(/(\d+(?:[.,:]\d+)*)/);
}
