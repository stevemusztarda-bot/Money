import { motion } from 'framer-motion';
import { genres } from '../data/games';

export default function GenreStep({ selected, onToggle }) {
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
      <p className="text-center text-xs text-gray-600 mb-10">
        Możesz wybrać kilka ({selected.length} wybrano)
      </p>

      <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
        {genres.map((g, i) => {
          const isSelected = selected.includes(g.id);
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onToggle(g.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-full border-2 cursor-pointer font-medium transition-all duration-200"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg,#6c63ff,#a855f7)'
                  : '#ffffff08',
                borderColor: isSelected ? '#6c63ff' : '#ffffff18',
                color: isSelected ? '#fff' : '#888',
                boxShadow: isSelected ? '0 0 18px #6c63ff55' : 'none',
              }}
            >
              <span className="text-lg">{g.icon}</span>
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
