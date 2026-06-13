import { motion } from 'framer-motion';
import { useState } from 'react';

const presets = [
  { label: 'Darmowe', max: 0, icon: '🆓', desc: 'Tylko F2P' },
  { label: 'Do 20 zł', max: 20, icon: '💰', desc: 'Indie i sale' },
  { label: 'Do 100 zł', max: 100, icon: '💳', desc: 'Większość gier' },
  { label: 'Do 250 zł', max: 250, icon: '💎', desc: 'Premiery AAA' },
  { label: 'Bez limitu', max: 9999, icon: '🚀', desc: 'Wszystko' },
];

export default function BudgetStep({ selected, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Jaki masz budżet?
      </h2>
      <p className="text-center text-gray-400 mb-10">Wybierz zakres cenowy (ceny orientacyjne)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {presets.map((p, i) => {
          const isSelected = selected === p.max;
          return (
            <motion.button
              key={p.max}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(p.max)}
              className="relative flex flex-col items-start p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg,#6c63ff22,#a855f722)'
                  : '#ffffff08',
                borderColor: isSelected ? '#6c63ff' : '#ffffff15',
                boxShadow: isSelected ? '0 0 25px #6c63ff44' : 'none',
              }}
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <div className="font-bold text-lg text-white">{p.label}</div>
              <div className="text-sm text-gray-400 mt-1">{p.desc}</div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#6c63ff,#a855f7)' }}
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
