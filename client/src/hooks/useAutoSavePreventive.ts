import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface PreventiveDraft {
  clientName: string;
  clientCF: string;
  clientAddress: string;
  projectDescription: string;
  items: any[];
  ivaPercent: number;
  otherCosts: number;
  lastSaved: number;
}

const STORAGE_KEY = 'preventive_draft';
const AUTO_SAVE_INTERVAL = 5000; // 5 secunde

export function useAutoSavePreventive() {
  const saveDraft = useCallback((data: PreventiveDraft) => {
    try {
      const draft = {
        ...data,
        lastSaved: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      return true;
    } catch (e) {
      console.error('Error saving draft:', e);
      return false;
    }
  }, []);

  const loadDraft = useCallback((): PreventiveDraft | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (e) {
      console.error('Error loading draft:', e);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      console.error('Error clearing draft:', e);
      return false;
    }
  }, []);

  const hasDraft = useCallback((): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    STORAGE_KEY,
  };
}
