import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PLATFORM_META, PLAYER_META, genres as ALL_GENRES } from '../data/games';
import { formatPrice } from '../utils/format';
import { buildStores, imageUrl } from '../utils/stores';
import { compatFor } from '../utils/compat';
import { useReviews } from '../hooks/useReviews';
import { useT } from '../settings-context';

const reviewColor = (label = '') => {
  const l = label.toLowerCase();
  if (l.includes('przytłacz') || l.includes('uniwersalne')) return '#22c55e';
  if (l.includes('pozytywne')) return '#4ade80';
  if (l.includes('mieszane')) return '#fbbf24';
  if (l.includes('negatywne')) return '#ef4444';
  return '#a78bfa';
};
const genreLabel = (id) => ALL_GENRES.find((g) => g.id === id)?.label || id;

export default function GameDetailModal({ game, isFavorite, onToggleFavorite, onClose, specs }) {
  const [imgFailed, setImgFailed] = useState(false);
  const t = useT();
  const { getReview, saveReview } = useReviews();
  const existing = game ? getReview(game.id) : null;
  // Wczytanie zapisanej opinii bez useEffect (wzorzec „dostosuj stan w renderze")
  const [draftId, setDraftId] = useState(game?.id);
  const [rating, setRating] = useState(existing?.rating || 0);
  const [text, setText] = useState(existing?.text || '');
  const [saved, setSaved] = useState(false);
  if (game && draftId !== game.id) {
    setDraftId(game.id);
    setRating(existing?.rating || 0);
    setText(existing?.text || '');
    setSaved(false);
  }

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!game) return null;
  const isFree = game.price === 0;
  const onSale = game.discount > 0 && game.priceOld;
  const stores = buildStores(game);
  const imgSrc = imageUrl(game);
  const compat = compatFor(game, specs);
  const showReq = game.platform.includes('pc') && (game.req || game.minRam || compat);

  // Portal do document.body — modal nie może być wewnątrz karty z backdrop-filter,
  // bo wtedy position:fixed liczy się względem karty, a nie ekranu.
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Szczegóły gry ${game.title}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: '#000000cc',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.94, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 640,
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 24,
            background: '#0c0c18',
            border: '1px solid #ffffff18',
            boxShadow: '0 40px 100px #000000aa',
          }}
        >
          {/* Header image */}
          <div style={{ position: 'relative', height: 224, overflow: 'hidden' }}>
            {!imgFailed && imgSrc ? (
              <img src={imgSrc} alt={game.title} onError={() => setImgFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, background: '#111' }}>🎮</div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 30%,#0c0c18)' }} />

            <button
              onClick={onClose}
              aria-label="Zamknij"
              style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 999, background: '#000000aa', border: '1px solid #ffffff22', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
            >
              ✕
            </button>

            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
              {game.rating != null && <span style={{ padding: '5px 11px', borderRadius: 999, fontSize: 14, fontWeight: 700, background: '#00000099', color: '#fbbf24' }}>★ {game.rating}</span>}
              {isFree && <span style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}>DARMOWA</span>}
              {onSale && <span style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 800, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}>-{game.discount}%</span>}
            </div>

            <button
              onClick={() => onToggleFavorite(game.id)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              style={{ position: 'absolute', bottom: 14, right: 14, width: 42, height: 42, borderRadius: 999, fontSize: 20, lineHeight: 1, cursor: 'pointer', background: isFavorite ? 'linear-gradient(135deg,#ec4899,#a855f7)' : '#000000aa', border: '1px solid #ffffff22', boxShadow: isFavorite ? '0 0 18px #ec489966' : 'none' }}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '8px 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>{game.title}</h2>
              {game.year && <span style={{ color: '#777', fontSize: 14, flexShrink: 0 }}>{game.year}</span>}
            </div>

            {game.review?.label && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, color: reviewColor(game.review.label), fontWeight: 600, fontSize: 14 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: 'currentColor' }} />
                {game.review.label}
                {game.review.score != null && <span style={{ color: '#777', fontWeight: 400 }}>· {game.review.score}/100</span>}
              </div>
            )}

            {game.description && <p style={{ color: '#bcbcd0', lineHeight: 1.6, marginTop: 14 }}>{game.description}</p>}

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 18, fontSize: 14 }}>
              <Meta label="Platformy" value={game.platform.map((p) => `${PLATFORM_META[p]?.icon} ${PLATFORM_META[p]?.label}`).join('  ')} />
              <Meta label="Tryb gry" value={game.players?.map((p) => `${PLAYER_META[p]?.icon} ${PLAYER_META[p]?.label}`).join('  ')} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {game.genre.map((id) => (
                <span key={id} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: '#6c63ff18', color: '#a78bfa', border: '1px solid #6c63ff30' }}>
                  {genreLabel(id)}
                </span>
              ))}
            </div>

            {/* Wymagania PC + dopasowanie do sprzętu */}
            {showReq && (
              <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: '#ffffff06', border: '1px solid #ffffff12' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#777', marginBottom: 8 }}>💻 Wymagania (minimalne)</div>
                {compat && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '5px 10px', borderRadius: 8, fontWeight: 700, fontSize: 13, background: `${compat.color}22`, color: compat.color, border: `1px solid ${compat.color}44` }}>
                    {compat.icon} {compat.label}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#bbb' }}>
                  {game.req?.cpu && <div><span style={{ color: '#777' }}>Procesor:</span> {game.req.cpu}</div>}
                  {game.req?.gpu && <div><span style={{ color: '#777' }}>Grafika:</span> {game.req.gpu}</div>}
                  {game.minRam && <div><span style={{ color: '#777' }}>RAM:</span> {game.minRam} GB</div>}
                  {!game.req && !game.minRam && <div style={{ color: '#777' }}>Brak szczegółowych wymagań — poziom: {'★'.repeat(game.reqTier || 0)}</div>}
                </div>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: isFree ? '#22c55e' : '#fff' }}>{formatPrice(game.price)}</span>
              {onSale && (
                <>
                  <span style={{ color: '#666', textDecoration: 'line-through', fontSize: 18 }}>{game.priceOld} zł</span>
                  <span style={{ padding: '3px 9px', borderRadius: 8, fontSize: 13, fontWeight: 800, background: '#16a34a', color: '#fff' }}>-{game.discount}%</span>
                </>
              )}
            </div>

            {/* Stores */}
            {stores.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#777', marginBottom: 10 }}>Gdzie kupić — oficjalne sklepy</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {stores.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '10px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', background: '#ffffff0e', border: '1px solid #ffffff1f' }}
                    >
                      {s.name} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Twoja opinia (zapis lokalny w przeglądarce) */}
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #ffffff12' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#777', marginBottom: 10 }}>{t('review.your')}</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setRating(s); setSaved(false); }}
                    aria-label={`${s}/5`}
                    style={{ fontSize: 26, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', color: s <= rating ? '#fbbf24' : '#444' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setSaved(false); }}
                placeholder={t('review.placeholder')}
                rows={3}
                style={{ width: '100%', resize: 'vertical', borderRadius: 12, padding: '10px 14px', background: '#0d0d1a', border: '1px solid #ffffff18', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
              />
              <button
                onClick={() => { if (rating > 0) { saveReview(game.id, rating, text); setSaved(true); } }}
                disabled={rating === 0}
                style={{ marginTop: 10, padding: '10px 20px', borderRadius: 999, fontWeight: 600, color: '#fff', border: 'none', cursor: rating ? 'pointer' : 'not-allowed', opacity: rating ? 1 : 0.4, background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}
              >
                {saved ? '✓ Zapisano' : t('review.save')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ color: '#777', fontSize: 12, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#ddd' }}>{value}</div>
    </div>
  );
}
