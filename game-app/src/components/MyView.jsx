import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { games } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';
import { useReviews } from '../hooks/useReviews';
import { useT } from '../settings-context';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

export default function MyView() {
  const t = useT();
  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();
  const { reviews, removeReview } = useReviews();
  const [detail, setDetail] = useState(null);

  const liked = useMemo(() => games.filter((g) => favoriteIds.includes(g.id)), [favoriteIds]);
  const myReviews = useMemo(
    () => Object.entries(reviews).map(([id, r]) => ({ game: games.find((g) => g.id === Number(id)), ...r })).filter((x) => x.game),
    [reviews]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        ⭐ {t('my.title')}
      </h2>
      <p className="text-center text-gray-400 mb-10">{t('app.subtitle')}</p>

      {/* Polubione */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-white mb-5">❤️ {t('my.liked')} <span className="text-gray-500 text-base">({liked.length})</span></h3>
        {liked.length === 0 ? (
          <Empty>{t('my.empty.liked')}</Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {liked.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} isFavorite={isFavorite(game.id)} onToggleFavorite={toggleFavorite} onOpen={setDetail} />
            ))}
          </div>
        )}
      </section>

      {/* Moje opinie */}
      <section>
        <h3 className="text-xl font-bold text-white mb-5">✍️ {t('my.reviews')} <span className="text-gray-500 text-base">({myReviews.length})</span></h3>
        {myReviews.length === 0 ? (
          <Empty>{t('my.empty.reviews')}</Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {myReviews.map(({ game, rating, text }) => (
              <div key={game.id} className="p-4 rounded-2xl flex items-start gap-3" style={{ background: '#ffffff06', border: '1px solid #ffffff12' }}>
                <div className="flex-1">
                  <button onClick={() => setDetail(game)} className="font-bold text-white hover:underline" style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                    {game.title}
                  </button>
                  <div className="text-sm my-1" style={{ color: '#fbbf24' }}>{'★'.repeat(rating)}<span style={{ color: '#333' }}>{'★'.repeat(5 - rating)}</span></div>
                  {text && <p className="text-gray-400 text-sm">{text}</p>}
                </div>
                <button onClick={() => removeReview(game.id)} aria-label="Usuń opinię" className="text-gray-500 hover:text-red-400" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {detail && (
        <GameDetailModal game={detail} isFavorite={isFavorite(detail.id)} onToggleFavorite={toggleFavorite} onClose={() => setDetail(null)} />
      )}
    </motion.div>
  );
}

function Empty({ children }) {
  return (
    <div className="text-center py-10 rounded-2xl text-gray-400" style={{ background: '#ffffff06', border: '1px solid #ffffff12' }}>
      {children}
    </div>
  );
}
