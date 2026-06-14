import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepIndicator from './components/StepIndicator';
import PlatformStep from './components/PlatformStep';
import BudgetStep from './components/BudgetStep';
import GenreStep from './components/GenreStep';
import ResultsStep from './components/ResultsStep';
import DealsView from './components/DealsView';
import PremieresView from './components/PremieresView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { genres as ALL_GENRES } from './data/games';
import './index.css';

const LAST_STEP = 3;
const INTERACTIVE = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'A']);

export default function App() {
  // Aktywny widok: kreator gier lub promocje.
  const [view, setView] = useLocalStorage('gamepicker:view', 'finder');
  // Postęp kreatora zapisywany w localStorage — odświeżenie nie gubi wyborów.
  const [step, setStep] = useLocalStorage('gamepicker:step', 0);
  const [platform, setPlatform] = useLocalStorage('gamepicker:platform', null);
  const [budget, setBudget] = useLocalStorage('gamepicker:budget', null);
  const [genres, setGenres] = useLocalStorage('gamepicker:genres', []);

  const canNext = useCallback(() => {
    if (step === 0) return !!platform;
    if (step === 1) return budget !== null;
    return true;
  }, [step, platform, budget]);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, LAST_STEP)), [setStep]);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [setStep]);
  const goToStep = useCallback((i) => setStep(i), [setStep]);

  const toggleGenre = useCallback(
    (id) => setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])),
    [setGenres]
  );
  const selectAllGenres = useCallback(() => setGenres(ALL_GENRES.map((g) => g.id)), [setGenres]);
  const clearGenres = useCallback(() => setGenres([]), [setGenres]);

  const reset = useCallback(() => {
    setPlatform(null);
    setBudget(null);
    setGenres([]);
    setStep(0);
  }, [setPlatform, setBudget, setGenres, setStep]);

  // Nawigacja klawiaturą (Enter = dalej), gdy fokus nie jest na elemencie interaktywnym.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      if (INTERACTIVE.has(document.activeElement?.tagName)) return;
      if (step < LAST_STEP && canNext()) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, canNext, next]);

  const nextDisabled = !canNext();

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
      <div style={blob({ top: 0, left: '25%', transform: 'translateY(-50%)' }, 400, '#6c63ff0d')} />
      <div style={blob({ bottom: 0, right: '25%', transform: 'translateY(50%)' }, 320, '#a855f70d')} />

      {/* Header */}
      <header
        style={{
          textAlign: 'center',
          paddingTop: 'clamp(32px, 6vw, 48px)',
          paddingBottom: 8,
          paddingLeft: 24,
          paddingRight: 24,
          position: 'relative',
          zIndex: 10,
        }}
      >
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
          <p style={{ color: '#8a8aa0', fontSize: 14, margin: 0 }}>Znajdź idealną grę dla siebie w kilka sekund</p>
        </motion.div>

        {/* Nawigacja: kreator / promocje */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {[
            { id: 'finder', label: '🔎 Znajdź grę' },
            { id: 'deals', label: '🔥 Promocje' },
            { id: 'premiery', label: '🚀 Premiery' },
          ].map((tab) => {
            const active = view === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setView(tab.id)}
                aria-pressed={active}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '9px 20px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: active ? '#fff' : '#9a9ab0',
                  background: active ? 'linear-gradient(135deg,#6c63ff,#a855f7)' : '#ffffff0a',
                  border: active ? '1px solid transparent' : '1px solid #ffffff14',
                  boxShadow: active ? '0 0 20px #6c63ff55' : 'none',
                }}
              >
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </header>

      {/* Main card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'clamp(24px, 4vw, 40px) 16px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <AnimatePresence mode="wait">
        {view !== 'finder' ? (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            style={{
              width: '100%',
              maxWidth: 1100,
              borderRadius: 28,
              padding: 'clamp(20px, 5vw, 48px) clamp(16px, 4vw, 40px)',
              background: '#0a0a18ee',
              border: '1px solid #ffffff0d',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 32px 80px #00000088, inset 0 1px 0 #ffffff08',
            }}
          >
            {view === 'deals' ? <DealsView /> : <PremieresView />}
          </motion.div>
        ) : (
        <motion.div
          key="wizard"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          style={{
            width: '100%',
            maxWidth: 900,
            borderRadius: 28,
            padding: 'clamp(24px, 5vw, 48px) clamp(20px, 4vw, 40px)',
            background: '#0a0a18ee',
            border: '1px solid #ffffff0d',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 80px #00000088, inset 0 1px 0 #ffffff08',
          }}
        >
          <StepIndicator current={step} onStepClick={goToStep} />

          <AnimatePresence mode="wait">
            {step === 0 && <PlatformStep key="platform" selected={platform} onSelect={setPlatform} />}
            {step === 1 && <BudgetStep key="budget" selected={budget} onSelect={setBudget} />}
            {step === 2 && (
              <GenreStep
                key="genre"
                selected={genres}
                onToggle={toggleGenre}
                onSelectAll={selectAllGenres}
                onClear={clearGenres}
              />
            )}
            {step === 3 && (
              <ResultsStep key="results" platform={platform} budget={budget} genres={genres} onReset={reset} />
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < LAST_STEP && (
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
                aria-label="Wróć do poprzedniego kroku"
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
                whileHover={nextDisabled ? {} : { scale: 1.04 }}
                whileTap={nextDisabled ? {} : { scale: 0.97 }}
                onClick={nextDisabled ? undefined : next}
                disabled={nextDisabled}
                aria-label={step === 2 ? 'Pokaż dopasowane gry' : 'Przejdź dalej'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 28px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  background: nextDisabled ? '#222' : 'linear-gradient(135deg,#6c63ff,#a855f7)',
                  color: '#fff',
                  border: 'none',
                  cursor: nextDisabled ? 'not-allowed' : 'pointer',
                  opacity: nextDisabled ? 0.3 : 1,
                  boxShadow: nextDisabled ? 'none' : '0 0 24px #6c63ff55',
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
        )}
        </AnimatePresence>
      </main>

      <footer style={{ textAlign: 'center', paddingBottom: 24, color: '#444', fontSize: 12, position: 'relative', zIndex: 10 }}>
        GamePicker • Znajdź swoją idealną grę
      </footer>
    </div>
  );
}

// Pomocnik dla dekoracyjnych, rozmytych kół w tle.
function blob(pos, size, color) {
  return {
    position: 'fixed',
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
    ...pos,
  };
}
