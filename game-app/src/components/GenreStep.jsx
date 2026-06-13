import { motion } from 'framer-motion';
import { genres } from '../data/games';
import { genresWord } from '../utils/format';

export default function GenreStep({ selected, onToggle, onSelectAll, onClear }) {
  const allSelected = selected.length === genres.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Co lubisz grać?
      </h2>
      <p className="text-center text-gray-400 mb-2">Wybierz gatunki które Cię interesują</p>
      <p className="text-center text-xs text-gray-600 mb-5">
        Możesz wybrać kilka ({selected.length} {genresWord(selected.length)})
      </p>

      {/* Bulk actions */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={allSelected ? onClear : onSelectAll}
          className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
          style={{ background: '#6c63ff1a', color: '#a78bfa', border: '1px solid #6c63ff33', cursor: 'pointer' }}
        >
          {allSelected ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
        </button>
        {selected.length > 0 && !allSelected && (
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
            style={{ background: '#ffffff08', color: '#888', border: '1px solid #ffffff15', cursor: 'pointer' }}
          >
            Wyczyść
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
        {genres.map((g, i) => {
          const isSelected = selected.includes(g.id);
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i, 10) * 0.04 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onToggle(g.id)}
              aria-pressed={isSelected}
              className="flex items-center gap-2 px-5 py-3 rounded-full border-2 cursor-pointer font-medium transition-all duration-200"
              style={{
                background: isSelected ? 'linear-gradient(135deg,#6c63ff,#a855f7)' : '#ffffff08',
                borderColor: isSelected ? '#6c63ff' : '#ffffff18',
                color: isSelected ? '#fff' : '#888',
                boxShadow: isSelected ? '0 0 18px #6c63ff55' : 'none',
              }}
            >
              <span className="text-lg" aria-hidden="true">{g.icon}</span>
              <span>{g.label}</span>
            </motion.button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 text-sm mt-8"
        >
          Pomiń i zobaczysz wszystkie gry pasujące do Twojej platformy i budżetu
        </motion.p>
      )}
    </motion.div>
  );
}
