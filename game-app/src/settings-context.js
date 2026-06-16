import { createContext, useContext } from 'react';

export const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings musi być wewnątrz <SettingsProvider>');
  return ctx;
}

// Wygodny skrót do tłumaczeń
export function useT() {
  return useSettings().t;
}
