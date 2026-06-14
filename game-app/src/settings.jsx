import { useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { translate } from './i18n';
import { SettingsContext } from './settings-context';

export function SettingsProvider({ children }) {
  const [lang, setLang] = useLocalStorage('gamepicker:lang', 'pl');
  const [accent, setAccent] = useLocalStorage('gamepicker:accent', 'purple');
  const [profile, setProfile] = useLocalStorage('gamepicker:profile', { nick: '', avatar: '🎮' });

  // Kolor akcentu sterowany atrybutem na <html> (CSS w index.css).
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  const t = (key) => translate(lang, key);

  return (
    <SettingsContext.Provider value={{ lang, setLang, accent, setAccent, profile, setProfile, t }}>
      {children}
    </SettingsContext.Provider>
  );
}
