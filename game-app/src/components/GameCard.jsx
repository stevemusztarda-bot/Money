import { motion } from 'framer-motion';

const starColor = (r) => r >= 9.5 ? '#fbbf24' : r >= 9.0 ? '#f59e0b' : '#d97706';

export default function GameCard({ game, index }) {
  const isFree = game.price === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: '#0d0d1a',
        border: '1px solid #ffffff12',
        boxShadow: '0 4px 24px #00000066',
      }}
    >
      {/* Game image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className="absolute inset-0 items-center justify-center text-5xl"
          style={{ display: 'none', background: '#111' }}
        >
          🎮
        </div>
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
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-base text-white leading-tight mb-1">{game.title}</h3>
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

        {/* Price */}
        <div className="flex items-center justify-between">
          <span
            className="font-bold text-lg"
            style={{
              color: isFree
                ? '#22c55e'
                : '#fff',
            }}
          >
            {isFree ? 'Darmowa' : `~${game.price} zł`}
          </span>
          <div className="flex gap-1.5">
            {game.platform.map((p) => {
              const icons = { pc: '🖥️', mobile: '📱', console: '🎮' };
              return (
                <span key={p} className="text-lg" title={p}>
                  {icons[p]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
