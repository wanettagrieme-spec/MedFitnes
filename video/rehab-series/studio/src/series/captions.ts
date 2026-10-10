export type Word = { text: string; startMs: number; endMs: number; scene?: number };
export type Page = { startMs: number; endMs: number; text: string; words: Word[] };
export type CaptionsJson = { words: Word[]; pages: Page[] };

const norm = (w: string) => w.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]/gu, '');

// Время (в секундах), когда в озвучке звучит слово: n-е вхождение, точное совпадение (или по началу слова)
export const makeWordTime = (c: CaptionsJson) => (word: string, n = 1, prefix = false): number => {
  const target = norm(word);
  let k = 0;
  for (const w of c.words) {
    const t = norm(w.text);
    if (prefix ? t.startsWith(target) : t === target) {
      k++;
      if (k === n) return w.startMs / 1000;
    }
  }
  throw new Error(`Слово «${word}» (${n}-е) не найдено в субтитрах`);
};
