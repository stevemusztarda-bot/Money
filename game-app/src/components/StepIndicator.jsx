import { motion } from 'framer-motion';

const steps = ['Platforma', 'Budżet', 'Gatunek', 'Wyniki'];

export default function StepIndicator({ current, onStepClick }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && typeof onStepClick === 'function';
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onStepClick(i) : undefined}
                aria-label={clickable ? `Wróć do kroku: ${label}` : `Krok ${i + 1}: ${label}`}
                aria-current={active ? 'step' : undefined}
                initial={false}
                animate={{
                  background: done || active ? 'linear-gradient(135deg,#6c63ff,#a855f7)' : 'transparent',
                  borderColor: done || active ? 'transparent' : '#333',
                }}
                whileHover={clickable ? { scale: 1.12 } : {}}
                whileTap={clickable ? { scale: 0.92 } : {}}
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold relative z-10"
                style={{
                  boxShadow: active ? '0 0 20px #6c63ff88' : 'none',
                  cursor: clickable ? 'pointer' : 'default',
                  opacity: 1,
                  padding: 0,
                }}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ color: active ? '#fff' : '#555' }}>{i + 1}</span>
                )}
              </motion.button>
              <span
                className="mt-2 text-xs font-medium"
                style={{ color: active ? '#a78bfa' : done ? '#7c6fff' : '#555' }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-16 h-px mx-1 mb-5"
                style={{ background: done ? 'linear-gradient(90deg,#6c63ff,#a855f7)' : '#222' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
