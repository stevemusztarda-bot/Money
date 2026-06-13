import { motion } from 'framer-motion';

const steps = ['Platforma', 'Budżet', 'Gatunek', 'Wyniki'];

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  background: done
                    ? 'linear-gradient(135deg,#6c63ff,#a855f7)'
                    : active
                    ? 'linear-gradient(135deg,#6c63ff,#a855f7)'
                    : 'transparent',
                  borderColor: done || active ? 'transparent' : '#333',
                }}
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold relative z-10"
                style={{ boxShadow: active ? '0 0 20px #6c63ff88' : 'none' }}
              >
                {done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span style={{ color: active ? '#fff' : '#555' }}>{i + 1}</span>
                )}
              </motion.div>
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
                style={{
                  background: done
                    ? 'linear-gradient(90deg,#6c63ff,#a855f7)'
                    : '#222',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
