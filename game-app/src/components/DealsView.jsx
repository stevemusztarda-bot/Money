import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { games, featuredDeals, upcoming, salePeriods } from '../data/games';
import { useFavorites } from '../hooks/useFavorites';
import { gamesWord } from '../utils/format';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

export default function DealsView() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [detail, setDetail] = useState(null);

  const onSale = useMemo(
    () => games.filter((g) => g.discount > 0).sort((a, b) => b.discount - a.discount),
    []
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        🔥 Promocje i premiery
      </h2>
      <p className="text-center text-gray-400 mb-10">Aktualne przeceny, nadchodzące gry i terminy wyprzedaży</p>

      {/* Aktualne promocje z katalogu */}
      <Section title="Promocje w katalogu" subtitle={`${onSale.length} ${gamesWord(onSale.length)} w obniżonej cenie`}>
        {onSale.length === 0 ? (
          <Empty>Brak aktywnych przecen w katalogu w tym momencie — zajrzyj w okresie wyprzedaży 👇</Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {onSale.map((game, i) => (
              <GameCard key={game.id} game={game} index={i} isFavorite={isFavorite(game.id)} onToggleFavorite={toggleFavorite} onOpen={setDetail} />
            ))}
          </div>
        )}
      </Section>

      {/* Gorące oferty Steam (na żywo z featuredcategories w chwili budowania) */}
      {featuredDeals?.length > 0 && (
        <Section title="Gorące oferty Steam" subtitle="Wyróżnione promocje ze sklepu Steam">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredDeals.map((d) => (
              <DealBanner key={d.store} item={d} />
            ))}
          </div>
        </Section>
      )}

      {/* Nadchodzące premiery */}
      {upcoming?.length > 0 && (
        <Section title="Nadchodzące premiery" subtitle="Gry zapowiedziane wkrótce na Steam">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((u) => (
              <UpcomingCard key={u.store} item={u} />
            ))}
          </div>
        </Section>
      )}

      {/* Kalendarz wyprzedaży */}
      <Section title="Kiedy są wyprzedaże?" subtitle="Najlepsze okazje pojawiają się cyklicznie">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {salePeriods.map((s) => (
            <div key={s.name} className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: '#ffffff06', border: '1px solid #ffffff12' }}>
              <span className="text-2xl" aria-hidden="true">{s.icon}</span>
              <div>
                <div className="font-semibold text-white text-sm">{s.name}</div>
                <div className="text-xs text-gray-400">{s.when}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-4">
          Ceny i promocje pobierane są ze Steam w chwili budowania katalogu — w sklepie mogą się różnić.
        </p>
      </Section>

      {detail && (
        <GameDetailModal game={detail} isFavorite={isFavorite(detail.id)} onToggleFavorite={toggleFavorite} onClose={() => setDetail(null)} />
      )}
    </motion.div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="mb-12">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return (
    <div className="text-center py-10 rounded-2xl text-gray-400" style={{ background: '#ffffff06', border: '1px solid #ffffff12' }}>
      {children}
    </div>
  );
}

function DealBanner({ item }) {
  const [failed, setFailed] = useState(false);
  return (
    <a
      href={item.store}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block rounded-2xl overflow-hidden group"
      style={{ background: '#0d0d1a', border: '1px solid #ffffff14' }}
    >
      <div className="relative h-32 overflow-hidden">
        {!failed && item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ background: '#111' }}>🎮</div>
        )}
        {item.discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-extrabold" style={{ background: '#16a34a', color: '#fff' }}>
            -{item.discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold text-white truncate">{item.title}</div>
        <div className="flex items-center gap-2 mt-1">
          {item.priceOld != null && item.discount > 0 && <span className="text-xs text-gray-500 line-through">{item.priceOld} zł</span>}
          <span className="text-sm font-bold" style={{ color: item.price === 0 ? '#22c55e' : '#fff' }}>
            {item.price === 0 ? 'Darmowa' : item.price != null ? `${item.price} zł` : 'Zobacz'}
          </span>
          <span className="ml-auto text-xs text-gray-500">Steam ↗</span>
        </div>
      </div>
    </a>
  );
}

function UpcomingCard({ item }) {
  const [failed, setFailed] = useState(false);
  return (
    <a
      href={item.store}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block rounded-2xl overflow-hidden group"
      style={{ background: '#0d0d1a', border: '1px solid #ffffff14' }}
    >
      <div className="relative h-32 overflow-hidden">
        {!failed && item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ background: '#111' }}>🎮</div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'linear-gradient(135deg,#6c63ff,#a855f7)', color: '#fff' }}>
          WKRÓTCE
        </span>
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-white truncate">{item.title}</div>
        <span className="text-xs text-gray-500 shrink-0">Steam ↗</span>
      </div>
    </a>
  );
}
