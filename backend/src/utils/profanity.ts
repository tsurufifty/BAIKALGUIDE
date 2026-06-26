/**
 * Lightweight Russian profanity stop-list for auto-moderation of comments.
 * Strategy: normalise the text (lowercase, ё→е, common latin/leet look-alikes,
 * collapse repeated chars), split into word tokens, and flag a token if it
 * starts with one of the profanity roots. Root-prefix matching keeps false
 * positives low (almost no normal Russian word starts with these roots).
 */

const LATIN: Record<string, string> = {
  a: 'а', o: 'о', e: 'е', c: 'с', p: 'р', x: 'х', y: 'у', k: 'к',
  m: 'м', t: 'т', h: 'н', b: 'в', '3': 'з', '0': 'о', '@': 'а', '4': 'ч',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[a-z0-9@]/g, (c) => LATIN[c] ?? c)
    .replace(/(.)\1{2,}/g, '$1$1');
}

// Token must START WITH one of these roots to be flagged.
const ROOTS = [
  'хуй', 'хуя', 'хуе', 'хую', 'пизд', 'пезд', 'бля', 'еб', 'выеб', 'наеб',
  'уеб', 'заеб', 'въеб', 'подъеб', 'разъеб', 'отъеб', 'муда', 'муде', 'муди',
  'мудак', 'мудил', 'залуп', 'гондон', 'гандон', 'долбо', 'пидор', 'пидар',
  'педик', 'манда', 'дроч', 'говн', 'гавн', 'чмо', 'мраз', 'ссан', 'хуе',
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const tokens = normalize(text).split(/[^а-я]+/).filter(Boolean);
  return tokens.some((tok) => ROOTS.some((root) => tok.startsWith(root)));
}
