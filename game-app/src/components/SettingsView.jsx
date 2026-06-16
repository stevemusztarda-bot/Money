import { motion } from 'framer-motion';
import { useSettings } from '../settings-context';
import { LANGUAGES } from '../i18n';

const ACCENTS = [
  { id: 'purple', label: 'Fiolet', c1: '#6c63ff', c2: '#a855f7' },
  { id: 'red', label: 'Czerwony', c1: '#ef4444', c2: '#f97316' },
  { id: 'blue', label: 'Niebieski', c1: '#3b82f6', c2: '#22d3ee' },
  { id: 'green', label: 'Zielony', c1: '#22c55e', c2: '#84cc16' },
  { id: 'pink', label: 'Różowy', c1: '#ec4899', c2: '#f472b6' },
];
const AVATARS = ['🎮', '🕹️', '👾', '🚀', '🐱', '🦊', '😎', '🎧', '🔥', '👑'];

export default function SettingsView() {
  const { lang, setLang, accent, setAccent, profile, setProfile, t } = useSettings();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        ⚙️ {t('settings.title')}
      </h2>
      <p className="text-center text-gray-400 mb-10">{t('app.subtitle')}</p>

      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {/* Profil */}
        <Section title={`👤 ${t('settings.profile')}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}
            >
              {profile.avatar}
            </div>
            <input
              type="text"
              value={profile.nick}
              maxLength={20}
              onChange={(e) => setProfile({ ...profile, nick: e.target.value })}
              placeholder={t('settings.nick')}
              aria-label={t('settings.nick')}
              className="flex-1 min-w-[160px] rounded-xl text-white outline-none"
              style={{ padding: '12px 16px', background: '#0d0d1a', border: '1px solid #ffffff18' }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setProfile({ ...profile, avatar: a })}
                aria-label={`Awatar ${a}`}
                className="w-11 h-11 rounded-xl text-xl transition-transform hover:scale-110"
                style={{
                  background: profile.avatar === a ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : '#ffffff0a',
                  border: '1px solid #ffffff18',
                  cursor: 'pointer',
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </Section>

        {/* Kolor motywu */}
        <Section title={`🎨 ${t('settings.accent')}`}>
          <div className="flex flex-wrap gap-3">
            {ACCENTS.map((a) => {
              const active = accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  aria-pressed={active}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all"
                  style={{
                    background: active ? '#ffffff12' : '#ffffff06',
                    border: active ? '2px solid #fff' : '2px solid #ffffff14',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <span className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg,${a.c1},${a.c2})` }} />
                  {a.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Język */}
        <Section title={`🌐 ${t('settings.language')}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LANGUAGES.map((l) => {
              const active = lang === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  aria-pressed={active}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all"
                  style={{
                    background: active ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : '#ffffff06',
                    color: active ? '#fff' : '#aaa',
                    border: active ? '1px solid transparent' : '1px solid #ffffff14',
                    cursor: 'pointer',
                  }}
                >
                  <span className="text-lg">{l.flag}</span>
                  {l.label}
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <section className="p-5 rounded-2xl" style={{ background: '#ffffff06', border: '1px solid #ffffff12' }}>
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </section>
  );
}
