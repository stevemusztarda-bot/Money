import { motion } from 'framer-motion';

const platforms = [
  {
    id: 'pc',
    label: 'PC / Komputer',
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    desc: 'Steam, Epic, GOG i inne',
    gradient: 'from-blue-600/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    glow: '#3b82f688',
    activeGradient: 'from-blue-600/40 to-cyan-500/40',
  },
  {
    id: 'mobile',
    label: 'Telefon',
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    desc: 'Android i iOS',
    gradient: 'from-green-600/20 to-emerald-500/20',
    border: 'border-green-500/30',
    glow: '#22c55e88',
    activeGradient: 'from-green-600/40 to-emerald-500/40',
  },
  {
    id: 'console',
    label: 'Konsola',
    icon: (
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 12h4M8 10v4M15 11h.01M17 13h.01" />
        <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
      </svg>
    ),
    desc: 'PlayStation, Xbox, Nintendo',
    gradient: 'from-purple-600/20 to-pink-500/20',
    border: 'border-purple-500/30',
    glow: '#a855f788',
    activeGradient: 'from-purple-600/40 to-pink-500/40',
  },
];

export default function PlatformStep({ selected, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Na czym grasz?
      </h2>
      <p className="text-center text-gray-400 mb-10">Wybierz swoją platformę</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mx-auto">
        {platforms.map((p, i) => {
          const isSelected = selected === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(p.id)}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-gradient-to-br ${
                isSelected ? p.activeGradient : p.gradient
              } ${isSelected ? 'border-purple-500' : p.border}`}
              style={{
                boxShadow: isSelected ? `0 0 30px ${p.glow}` : 'none',
              }}
            >
              {isSelected && (
                <motion.div
                  layoutId="platform-glow"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg,#6c63ff15,#a855f715)',
                    border: '2px solid #6c63ff',
                  }}
                />
              )}
              <div
                style={{ color: isSelected ? '#a78bfa' : '#666' }}
                className="transition-colors duration-300 relative z-10"
              >
                {p.icon}
              </div>
              <span className="mt-4 font-bold text-lg text-white relative z-10">{p.label}</span>
              <span className="mt-1 text-sm text-gray-400 relative z-10">{p.desc}</span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
