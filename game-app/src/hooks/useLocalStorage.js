import { useCallback, useEffect, useState } from 'react';

// Stan synchronizowany z localStorage. Odporny na brak/zepsute dane oraz
// na środowiska bez localStorage (np. tryb prywatny, SSR).
export function useLocalStorage(key, initialValue) {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.warn(`useLocalStorage: nie udało się odczytać klucza "${key}"`, err);
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`useLocalStorage: nie udało się zapisać klucza "${key}"`, err);
    }
  }, [key, value]);

  return [value, setValue];
}
