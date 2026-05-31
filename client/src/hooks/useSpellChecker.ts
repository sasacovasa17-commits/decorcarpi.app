import { useEffect, useState, useCallback } from 'react';
// @ts-ignore
import Nspell from 'nspell';
import dictionaryItalian from 'dictionary-it';

interface SpellCheckResult {
  word: string;
  suggestions: string[];
  isCorrect: boolean;
}

export function useSpellChecker() {
  const [speller, setSpeller] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inizialeize spell checker with Italian dictionary
    const initSpeller = () => {
      try {
        const nspell = new Nspell(dictionaryItalian);
        setSpeller(nspell);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing spell checker:', error);
        setIsLoading(false);
      }
    };

    initSpeller();
  }, []);

  const checkWord = useCallback(
    (word: string): SpellCheckResult => {
      if (!speller || !word.trim()) {
        return { word, suggestions: [], isCorrect: true };
      }

      try {
        const isCorrect = speller.correct(word);
        const suggestions = isCorrect ? [] : speller.suggest(word).slice(0, 5);

        return { word, suggestions, isCorrect };
      } catch (error) {
        console.error('Spell check error:', error);
        return { word, suggestions: [], isCorrect: true };
      }
    },
    [speller]
  );

  const checkText = useCallback(
    (text: string): SpellCheckResult[] => {
      if (!speller || !text.trim()) {
        return [];
      }

      const words = text.match(/\b[\w']+\b/g) || [];
      return words.map((word) => checkWord(word));
    },
    [speller, checkWord]
  );

  return {
    speller,
    isLoading,
    checkWord,
    checkText,
  };
}
