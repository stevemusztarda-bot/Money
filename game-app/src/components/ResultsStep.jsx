import { motion } from 'framer-motion';
import { games } from '../data/games';
import GameCard from './GameCard';

export default function ResultsStep({ platform, budget, genres, onReset }) {
  const filtered = games
    .filter((g) => g.platform.includes(platform))
    .filter((g) => budget === 9999 || g.price <= budget)
    .filter((g) => genres.length === 0 || g.genre.some((genre) => genres.includes(genre)))
    .sort((a, b) => b.rating - a.rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <h2
        className="text-3xl font-bold text-center mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        Twoje rekomendacje
      </h2>
      <p className="text-center text-gray-400 mb-2">
        Znaleziono{' '}
        <span className="text-purple-400 font-bold">{filtered.length}</span> gier dla Ciebie
      </p>

      {/* Active filters */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
        {[
          platform === 'pc' ? '🖥️ PC' : platform === 'mobile' ? '📱 Mobile' : '🎮 Konsola',
          budget === 0 ? '🆓 Darmowe' : budget === 9999 ? '🚀 Bez limitu' : `💰 do ${budget} zł`,
          ...(genres.length > 0 ? [`🎯 ${genres.length} gatunki`] : []),
        ].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ background: '#6c63ff22', color: '#a78bfa', border: '1px solid #6c63ff33' }}
          >
            {tag}
          </span>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold text-white mb-2">Brak wyników</h3>
          <p className="text-gray-400">Spróbuj zmienić filtry — zwiększ budżet lub wybierz inne gatunki.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filtered.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={onReset}
          className="flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-all"
          style={{
            background: '#ffffff10',
            border: '1px solid #ffffff20',
            color: '#ccc',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Zacznij od nowa
        </motion.button>
      </div>
    </motion.div>
  );
}
