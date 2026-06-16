import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Ulubione gry trzymane jako tablica id w localStorage.
export function useFavorites() {
  const [ids, setIds] = useLocalStorage('gamepicker:favorites', []);

  const favoriteSet = useMemo(() => new Set(ids), [ids]);

  const isFavorite = useCallback((id) => favoriteSet.has(id), [favoriteSet]);

  const toggleFavorite = useCallback(
    (id) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      ),
    [setIds]
  );

  const clearFavorites = useCallback(() => setIds([]), [setIds]);

  return { favoriteIds: ids, favoriteSet, isFavorite, toggleFavorite, clearFavorites };
}
