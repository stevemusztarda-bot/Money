import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { PLATFORM_META, PLAYER_META } from '../data/games';
import { formatPrice } from '../utils/format';

const starColor = (r) => (r >= 9.5 ? '#fbbf24' : r >= 9.0 ? '#f59e0b' : '#d97706');

function GameCard({ game, index, isFavorite, onToggleFavorite }) {
  const isFree = game.price === 0;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      // Kaskadę ograniczamy, by przy wielu kartach nie czekać sekund na ostatnią.
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: '#0d0d1a',
        border: '1px solid #ffffff12',
        boxShadow: '0 4px 24px #00000066',
      }}
    >
      {/* Game image */}
      <div className="relative h-40 overflow-hidden">
        {!imgFailed ? (
          <img
            src={game.image}
            alt={`Okładka gry ${game.title}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-5xl"
            style={{ background: '#111' }}
            aria-hidden="true"
          >
            🎮
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom,transparent 40%,#0d0d1a)' }}
        />

        {/* Rating badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold"
          style={{ background: '#00000088', color: starColor(game.rating) }}
        >
          ★ {game.rating}
        </div>

        {/* Free badge */}
        {isFree && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}
          >
            DARMOWA
          </div>
        )}

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(game.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Usuń ${game.title} z ulubionych` : `Dodaj ${game.title} do ulubionych`}
          title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110 active:scale-90"
          style={{
            background: isFavorite ? 'linear-gradient(135deg,#ec4899,#a855f7)' : '#00000099',
            border: '1px solid #ffffff22',
            boxShadow: isFavorite ? '0 0 16px #ec489966' : 'none',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          <span aria-hidden="true">{isFavorite ? '❤️' : '🤍'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-base text-white leading-tight">{game.title}</h3>
          {game.year && (
            <span className="shrink-0 text-xs font-medium text-gray-500 mt-0.5">{game.year}</span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{game.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ background: '#6c63ff18', color: '#a78bfa', border: '1px solid #6c63ff30' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + platforms + players */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-lg" style={{ color: isFree ? '#22c55e' : '#fff' }}>
            {formatPrice(game.price)}
          </span>
          <div className="flex items-center gap-2.5">
            {game.players?.length > 0 && (
              <div className="flex gap-1" title={game.players.map((p) => PLAYER_META[p]?.label).join(', ')}>
                {game.players.map((p) => (
                  <span key={p} className="text-sm opacity-80" aria-hidden="true">
                    {PLAYER_META[p]?.icon}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              {game.platform.map((p) => (
                <span key={p} className="text-lg" title={PLATFORM_META[p]?.label} aria-hidden="true">
                  {PLATFORM_META[p]?.icon}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// React.memo: karta przerenderuje się tylko gdy zmieni się jej gra lub status ulubionej.
export default memo(GameCard);
