import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { games } from '../data/games';
import { buildStores } from '../utils/stores';
import { useT } from '../settings-context';

const readFavs = () => {
  try {
    return JSON.parse(localStorage.getItem('gamepicker:favorites') || '[]');
  } catch {
    return [];
  }
};

export default function NotificationsBell() {
  const t = useT();
  const [open, setOpen] = useState(false);
  // Promocje na ulubione liczymy świeżo (po kliknięciu) z localStorage.
  const [deals, setDeals] = useState(() => computeDeals());

  function computeDeals() {
    const favs = new Set(readFavs());
    return games.filter((g) => favs.has(g.id) && g.discount > 0).sort((a, b) => b.discount - a.discount);
  }

  const toggle = () => {
    if (!open) setDeals(computeDeals());
    setOpen((v) => !v);
  };

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={t('notif.title')}
        style={{
          width: 40, height: 40, borderRadius: 999, fontSize: 18, cursor: 'pointer',
          background: '#ffffff0a', border: '1px solid #ffffff14', color: '#fff', position: 'relative',
        }}
      >
        🔔
        {deals.length > 0 && (
          <span
            style={{
              position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, padding: '0 5px',
              borderRadius: 999, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: '#ef4444', color: '#fff',
            }}
          >
            {deals.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              style={{
                position: 'absolute', right: 0, top: 48, width: 300, maxHeight: 360, overflowY: 'auto', zIndex: 41,
                background: '#0c0c18', border: '1px solid #ffffff1f', borderRadius: 16, boxShadow: '0 24px 60px #000000aa', padding: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 10, fontSize: 14 }}>🔔 {t('notif.title')}</div>
              {deals.length === 0 ? (
                <div style={{ color: '#888', fontSize: 13, padding: '8px 4px' }}>{t('notif.empty')}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {deals.map((g) => (
                    <a
                      key={g.id}
                      href={buildStores(g)[0]?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                        padding: '8px 10px', borderRadius: 10, textDecoration: 'none', background: '#ffffff06', border: '1px solid #ffffff12',
                      }}
                    >
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ background: '#16a34a', color: '#fff', borderRadius: 6, padding: '1px 6px', fontSize: 11, fontWeight: 800 }}>-{g.discount}%</span>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{g.price} zł</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
