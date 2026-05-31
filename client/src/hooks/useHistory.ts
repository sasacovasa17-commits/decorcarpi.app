import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialValue: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialValue,
    future: [],
  });

  // Aggiungi o nouă stare în history
  const push = useCallback((newValue: T) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newValue,
      future: [],
    }));
  }, []);

  // Undo - revine la starea anterioară
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  // Redo - merge la starea următoare
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  // Reset la valoarea inițială
  const reset = useCallback(() => {
    setHistory({
      past: [],
      present: initialValue,
      future: [],
    });
  }, [initialValue]);

  // Verifica dacă pot face undo/redo
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    push,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
