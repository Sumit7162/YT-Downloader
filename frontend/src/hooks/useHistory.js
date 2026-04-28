/**
 * useHistory.js — Custom hook for managing download history in localStorage
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yt_downloader_history';
const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      setHistory([]);
    }
  }, []);

  // Persist whenever history changes
  const persist = useCallback((items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage full — ignore
    }
  }, []);

  const addToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...entry,
      };
      // Remove duplicate (same video + quality)
      const filtered = prev.filter(
        (item) => !(item.videoId === entry.videoId && item.formatId === entry.formatId)
      );
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
