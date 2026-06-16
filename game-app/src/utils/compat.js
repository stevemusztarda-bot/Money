// Dopasowanie wymagań gry do sprzętu użytkownika (opcjonalne, tylko PC).
export const RAM_OPTIONS = [4, 8, 16, 32];
export const GPU_TIERS = [
  { id: 1, label: 'Zintegrowana', hint: 'Intel HD / iGPU' },
  { id: 2, label: 'Podstawowa', hint: 'GTX 1050 / RX 560' },
  { id: 3, label: 'Średnia', hint: 'GTX 1660 / RX 5600' },
  { id: 4, label: 'Mocna', hint: 'RTX 3060 / RX 6700' },
  { id: 5, label: 'Topowa', hint: 'RTX 4070+ / RX 7800+' },
];

export const hasSpecs = (specs) => !!specs && (specs.ram != null || specs.gpu != null);

// Zwraca { level, label, color, icon } albo null, gdy nie da się ocenić.
export function compatFor(game, specs) {
  if (!hasSpecs(specs) || !game.platform.includes('pc') || game.reqTier == null) return null;
  const userTier = specs.gpu || 3;
  const userRam = specs.ram || 8;
  const ramOk = game.minRam == null || game.minRam <= userRam;
  const tier = game.reqTier;
  if (tier <= userTier && ramOk) return { level: 'ok', label: 'Twój PC to uciągnie', color: '#22c55e', icon: '✅' };
  if (tier <= userTier + 1 && (game.minRam == null || game.minRam <= userRam + 4))
    return { level: 'maybe', label: 'Pójdzie na minimalnych', color: '#fbbf24', icon: '⚠️' };
  return { level: 'no', label: 'Za wymagająca', color: '#ef4444', icon: '⛔' };
}
