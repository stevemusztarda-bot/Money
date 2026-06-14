import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Opinie użytkownika trzymane lokalnie: { [gameId]: { rating, text, date } }
export function useReviews() {
  const [reviews, setReviews] = useLocalStorage('gamepicker:reviews', {});

  const getReview = useCallback((id) => reviews[id] || null, [reviews]);

  const saveReview = useCallback(
    (id, rating, text) =>
      setReviews((prev) => ({ ...prev, [id]: { rating, text: text.trim(), date: new Date().toISOString() } })),
    [setReviews]
  );

  const removeReview = useCallback(
    (id) =>
      setReviews((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [setReviews]
  );

  const reviewedIds = useMemo(() => Object.keys(reviews).map(Number), [reviews]);

  return { reviews, getReview, saveReview, removeReview, reviewedIds };
}
