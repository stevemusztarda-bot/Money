import { useState } from 'react';
import { motion } from 'framer-motion';
import { featuredPremiere, upcoming } from '../data/games';
import { PLATFORM_META } from '../data/games';

export default function PremieresView() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        🚀 Premiery
      </h2>
      <p className="text-center text-gray-400 mb-8">Najbardziej wyczekiwane i nadchodzące gry</p>

      {featuredPremiere && <FeaturedPremiere item={featuredPremiere} />}

      {upcoming?.length > 0 && (
        <section className="mt-12">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-white">Wkrótce na Steam</h3>
            <p className="text-sm text-gray-500">Zapowiedziane gry, które niedługo zadebiutują</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((u, i) => (
              <UpcomingCard key={u.store} item={u} index={i} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function FeaturedPremiere({ item }) {
  const [failed, setFailed] = useState(false);
  return (
    <motion.a
      href={item.store}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="relative block rounded-3xl overflow-hidden"
      style={{ border: '1px solid #ffffff1a', boxShadow: '0 24px 60px #00000088' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Okładka */}
        <div className="relative md:w-1/2 h-56 md:h-auto overflow-hidden" style={{ background: '#111', minHeight: 240 }}>
          {!failed && item.image ? (
            <img src={item.image} alt={item.title} onError={() => setFailed(true)} className="w-full h-full object-cover" style={{ minHeight: 240 }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl">🎮</div>
          )}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)', color: '#fff', boxShadow: '0 0 18px #ec489966' }}>
            ⭐ WYRÓŻNIONA PREMIERA
          </span>
        </div>
        {/* Opis */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center" style={{ background: 'linear-gradient(135deg,#15102e,#0c0c18)' }}>
          <div className="text-sm font-semibold mb-2" style={{ color: '#f0abfc' }}>{item.when}</div>
          <h3 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</h3>
          <p className="text-gray-300 leading-relaxed mb-4">{item.description}</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {item.tags?.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#6c63ff22', color: '#a78bfa', border: '1px solid #6c63ff33' }}>{t}</span>
            ))}
            {item.platform?.map((p) => (
              <span key={p} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#ffffff0a', color: '#bbb', border: '1px solid #ffffff18' }}>
                {PLATFORM_META[p]?.icon} {PLATFORM_META[p]?.label}
              </span>
            ))}
          </div>
          <span className="self-start px-5 py-2.5 rounded-full text-sm font-semibold" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', boxShadow: '0 0 20px #6c63ff55' }}>
            Strona oficjalna ↗
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function UpcomingCard({ item, index }) {
  const [failed, setFailed] = useState(false);
  return (
    <motion.a
      href={item.store}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -5 }}
      className="relative block rounded-2xl overflow-hidden group"
      style={{ background: '#0d0d1a', border: '1px solid #ffffff14' }}
    >
      <div className="relative h-32 overflow-hidden">
        {!failed && item.image ? (
          <img src={item.image} alt={item.title} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ background: '#111' }}>🎮</div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff' }}>
          WKRÓTCE
        </span>
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-white truncate">{item.title}</div>
        <span className="text-xs text-gray-500 shrink-0">Steam ↗</span>
      </div>
    </motion.a>
  );
}
