import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { games, SORT_OPTIONS, PLATFORM_META } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';
import { gamesWord, genresWord } from '../utils/format';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

const comparators = {
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  reviews: (a, b) => (b.review?.count || 0) - (a.review?.count || 0),
  'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity) || (b.rating || 0) - (a.rating || 0),
  'price-desc': (a, b) => (b.price ?? -1) - (a.price ?? -1) || (b.rating || 0) - (a.rating || 0),
  year: (a, b) => (b.year || 0) - (a.year || 0) || (b.rating || 0) - (a.rating || 0),
  name: (a, b) => a.title.localeCompare(b.title, 'pl'),
};

export default function ResultsStep({ platform, budget, genres, onReset }) {
  const { favoriteSet, isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('rating');
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [detail, setDetail] = useState(null);
  const [limit, setLimit] = useState(60); // ile kart pokazać (płynność przy setkach gier)
  // Reset porcji przy zmianie filtrów (wzorzec „dostosuj stan w trakcie renderu", bez useEffect)
  const filterKey = `${platform}|${budget}|${genres.join(',')}|${onlyFree}|${onlyFavorites}|${query}|${sort}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setLimit(60);
  }

  // Liczba gier pasujących do wyborów z kreatora (bez filtrów paska narzędzi) —
  // do pokazania, ile odsiewają dodatkowe filtry.
  const baseCount = useMemo(
    () =>
      games.filter(
        (g) =>
          g.platform.includes(platform) &&
          (budget === 9999 || g.price <= budget) &&
          (genres.length === 0 || g.genre.some((x) => genres.includes(x)))
      ).length,
    [platform, budget, genres]
  );

  // Jeden przebieg: filtr (platforma, budżet, gatunki, pasek) + sortowanie.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = games.filter((g) => {
      if (!g.platform.includes(platform)) return false;
      if (budget !== 9999 && g.price > budget) return false;
      if (genres.length > 0 && !g.genre.some((x) => genres.includes(x))) return false;
      if (onlyFree && g.price !== 0) return false;
      if (onlyFavorites && !favoriteSet.has(g.id)) return false;
      if (
        q &&
        !g.title.toLowerCase().includes(q) &&
        !g.tags.some((t) => t.toLowerCase().includes(q))
      )
        return false;
      return true;
    });
    return list.sort(comparators[sort] || comparators.rating);
  }, [platform, budget, genres, onlyFree, onlyFavorites, query, sort, favoriteSet]);

  const visible = results.slice(0, limit);

  const platformLabel = PLATFORM_META[platform]?.label ?? platform;
  const budgetLabel =
    budget === 0 ? '🆓 Darmowe' : budget === 9999 ? '🚀 Bez limitu' : `💰 do ${budget} zł`;

  const summaryChips = [
    `${PLATFORM_META[platform]?.icon ?? '🎮'} ${platformLabel}`,
    budgetLabel,
    ...(genres.length > 0 ? [`🎯 ${genres.length} ${genresWord(genres.length)}`] : []),
  ];

  const filtersActive = onlyFree || onlyFavorites || query.trim().length > 0;
  const clearToolbarFilters = () => {
    setQuery('');
    setOnlyFree(false);
    setOnlyFavorites(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Twoje rekomendacje
      </h2>
      <p className="text-center text-gray-400 mb-4">
        Znaleziono <span className="text-purple-400 font-bold">{results.length}</span>{' '}
        {gamesWord(results.length)}
        {results.length !== baseCount && (
          <span className="text-gray-600"> z {baseCount} pasujących</span>
        )}
      </p>

      {/* Active wizard filters */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
        {summaryChips.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: '#6c63ff22', color: '#a78bfa', border: '1px solid #6c63ff33' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Toolbar: search + sort + quick filters */}
      <div
        className="flex flex-wrap items-center gap-3 mb-8 p-3 rounded-2xl"
        style={{ background: '#ffffff06', border: '1px solid #ffffff10' }}
      >
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">
            🔎
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj po nazwie lub tagu…"
            aria-label="Szukaj gry"
            className="w-full rounded-full text-sm text-white outline-none"
            style={{
              padding: '10px 14px 10px 38px',
              background: '#0d0d1a',
              border: '1px solid #ffffff18',
            }}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-400">
          <span className="hidden sm:inline">Sortuj:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sortowanie wyników"
            className="rounded-full text-sm text-white outline-none cursor-pointer"
            style={{ padding: '10px 14px', background: '#0d0d1a', border: '1px solid #ffffff18' }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id} style={{ background: '#0d0d1a' }}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <ToggleChip active={onlyFree} onClick={() => setOnlyFree((v) => !v)}>
          🆓 Darmowe
        </ToggleChip>
        <ToggleChip active={onlyFavorites} onClick={() => setOnlyFavorites((v) => !v)}>
          ❤️ Ulubione
        </ToggleChip>
      </div>

      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="text-6xl mb-4">{onlyFavorites ? '💔' : '😕'}</div>
          <h3 className="text-xl font-bold text-white mb-2">Brak wyników</h3>
          <p className="text-gray-400 mb-6">
            {onlyFavorites
              ? 'Nie masz tu jeszcze ulubionych gier — kliknij serduszko na karcie.'
              : 'Spróbuj zmienić filtry — zwiększ budżet lub wybierz inne gatunki.'}
          </p>
          {filtersActive && (
            <button
              onClick={clearToolbarFilters}
              className="px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: '#6c63ff22', color: '#a78bfa', border: '1px solid #6c63ff44', cursor: 'pointer' }}
            >
              Wyczyść filtry wyszukiwania
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {visible.map((game, i) => (
              <GameCard
                key={game.id}
                game={game}
                index={i}
                isFavorite={isFavorite(game.id)}
                onToggleFavorite={toggleFavorite}
                onOpen={setDetail}
              />
            ))}
          </div>
          {results.length > limit && (
            <div className="flex justify-center mb-10">
              <button
                onClick={() => setLimit((l) => l + 60)}
                className="px-6 py-3 rounded-full text-sm font-semibold"
                style={{ background: '#6c63ff22', color: '#a78bfa', border: '1px solid #6c63ff44', cursor: 'pointer' }}
              >
                Pokaż więcej ({results.length - limit})
              </button>
            </div>
          )}
        </>
      )}

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onReset}
          className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all"
          style={{ background: '#ffffff10', border: '1px solid #ffffff20', color: '#ccc', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Zacznij od nowa
        </motion.button>
      </div>

      {detail && (
        <GameDetailModal
          game={detail}
          isFavorite={isFavorite(detail.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setDetail(null)}
        />
      )}
    </motion.div>
  );
}

function ToggleChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
      style={{
        background: active ? 'linear-gradient(135deg,#6c63ff,#a855f7)' : '#0d0d1a',
        color: active ? '#fff' : '#888',
        border: active ? '1px solid transparent' : '1px solid #ffffff18',
        boxShadow: active ? '0 0 16px #6c63ff55' : 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
