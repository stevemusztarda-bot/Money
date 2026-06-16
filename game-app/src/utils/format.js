// Polska odmiana liczebników: plural(2, 'gra', 'gry', 'gier') -> 'gry'
export function plural(n, one, few, many) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export const gamesWord = (n) => plural(n, 'gra', 'gry', 'gier');
export const genresWord = (n) => plural(n, 'gatunek', 'gatunki', 'gatunków');

// Formatowanie ceny gry
export const formatPrice = (price) =>
  price == null ? 'Sprawdź w sklepie' : price === 0 ? 'Darmowa' : `~${price} zł`;
