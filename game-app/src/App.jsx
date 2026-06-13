import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from './components/StepIndicator';
import PlatformStep from './components/PlatformStep';
import BudgetStep from './components/BudgetStep';
import GenreStep from './components/GenreStep';
import ResultsStep from './components/ResultsStep';
import './index.css';

export default function App() {
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState(null);
  const [budget, setBudget] = useState(null);
  const [genres, setGenres] = useState([]);

  const canNext = () => {
    if (step === 0) return !!platform;
    if (step === 1) return budget !== null;
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const toggleGenre = (id) =>
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  const reset = () => {
    setPlatform(null);
    setBudget(null);
    setGenres([]);
    setStep(0);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(ellipse at 20% 0%,#1a0d3d 0%,#060611 50%),radial-gradient(ellipse at 80% 100%,#0d1a3d 0%,transparent 60%)',
        position: 'relative',
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '25%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: '#6c63ff0d',
          filter: 'blur(80px)',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: '25%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: '#a855f70d',
          filter: 'blur(80px)',
          transform: 'translateY(50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 8, paddingLeft: 24, paddingRight: 24, position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                background: 'linear-gradient(135deg,#6c63ff,#a855f7)',
              }}
            >
              🎮
            </div>
            <span
              style={{
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg,#e0d9ff,#c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GamePicker
            </span>
          </div>
          <p style={{ color: '#555', fontSize: 14, margin: 0 }}>Znajdź idealną grę dla siebie w kilka sekund</p>
        </motion.div>
      </header>

      {/* Main card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '40px 16px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: '100%',
            maxWidth: 900,
            borderRadius: 28,
            padding: '48px 40px',
            background: '#0a0a18ee',
            border: '1px solid #ffffff0d',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 80px #00000088, inset 0 1px 0 #ffffff08',
          }}
        >
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {step === 0 && <PlatformStep key="platform" selected={platform} onSelect={setPlatform} />}
            {step === 1 && <BudgetStep key="budget" selected={budget} onSelect={setBudget} />}
            {step === 2 && <GenreStep key="genre" selected={genres} onToggle={toggleGenre} />}
            {step === 3 && (
              <ResultsStep key="results" platform={platform} budget={budget} genres={genres} onReset={reset} />
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 48,
                paddingTop: 24,
                borderTop: '1px solid #ffffff0a',
              }}
            >
              <button
                onClick={back}
                disabled={step === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  background: '#ffffff0a',
                  color: step === 0 ? '#333' : '#888',
                  border: '1px solid #ffffff12',
                  cursor: step === 0 ? 'not-allowed' : 'pointer',
                  opacity: step === 0 ? 0.3 : 1,
                  fontFamily: 'inherit',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Wstecz
              </button>

              <motion.button
                whileHover={canNext() ? { scale: 1.04 } : {}}
                whileTap={canNext() ? { scale: 0.97 } : {}}
                onClick={canNext() ? next : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  background: canNext() ? 'linear-gradient(135deg,#6c63ff,#a855f7)' : '#222',
                  color: '#fff',
                  border: 'none',
                  cursor: canNext() ? 'pointer' : 'not-allowed',
                  opacity: canNext() ? 1 : 0.3,
                  boxShadow: canNext() ? '0 0 24px #6c63ff55' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                {step === 2 ? 'Pokaż gry 🎮' : 'Dalej'}
                {step !== 2 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: 24, color: '#333', fontSize: 12, position: 'relative', zIndex: 10 }}>
        GamePicker • Znajdź swoją idealną grę
      </footer>
    </div>
  );
}
