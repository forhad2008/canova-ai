import { useState, useEffect, useCallback } from 'react';

export function useRecentSearches(storageKey: string, initialDefaults: string[] = []) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback on storage errors
    }
    return initialDefaults;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(recentSearches));
    } catch {
      // Ignore storage write issues
    }
  }, [storageKey, recentSearches]);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove existing case-insensitive duplicate and prepend
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Keep up to 5 items
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.toLowerCase() !== query.toLowerCase()));
  }, []);

  const clearSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
