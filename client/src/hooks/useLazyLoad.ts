import { useState, useCallback } from 'react';

export type LazyModule = 'pdf' | 'canvas' | 'compression';

interface LazyLoadState {
  loading: boolean;
  error: Error | null;
  loaded: boolean;
}

export const useLazyLoad = (module: LazyModule) => {
  const [state, setState] = useState<LazyLoadState>({
    loading: false,
    error: null,
    loaded: false,
  });

  const load = useCallback(async () => {
    setState({ loading: true, error: null, loaded: false });
    try {
      switch (module) {
        case 'pdf':
          await import('jspdf');
          break;
        case 'canvas':
          await import('html2canvas');
          break;
        case 'compression':
          // Image compression would be loaded here
          break;
        default:
          throw new Error(`Unknown module: ${module}`);
      }
      setState({ loading: false, error: null, loaded: true });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ loading: false, error, loaded: false });
      console.error(`Failed to load module ${module}:`, error);
    }
  }, [module]);

  return { ...state, load };
};

// Preload modules on idle
export const usePreloadModules = (modules: LazyModule[]) => {
  const [preloaded, setPreloaded] = useState<Set<LazyModule>>(new Set());

  const preload = useCallback(async () => {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) {
      return;
    }

    requestIdleCallback(async () => {
      for (const mod of modules) {
        if (!preloaded.has(mod)) {
          try {
            switch (mod) {
              case 'pdf':
                await import('jspdf');
                break;
              case 'canvas':
                await import('html2canvas');
                break;
              case 'compression':
                // Preload compression
                break;
            }
            setPreloaded((prev) => {
              const newSet = new Set(prev);
              newSet.add(mod);
              return newSet;
            });
          } catch (err) {
            console.warn(`Failed to preload module ${mod}:`, err);
          }
        }
      }
    });
  }, [modules, preloaded]);

  return { preload, preloaded };
};
