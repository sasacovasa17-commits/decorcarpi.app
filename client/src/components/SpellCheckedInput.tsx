import React, { useState, useRef, useEffect } from 'react';
import { useSpellChecker } from '@/hooks/useSpellChecker';

interface SpellCheckedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'textarea';
}

export function SpellCheckedInput({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
}: SpellCheckedInputProps) {
  const { checkWord, isLoading } = useSpellChecker();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    onChange(newValue);
    setCursorPos(e.currentTarget.selectionStart || 0);

    // Get current word at cursor position
    const words = newValue.substring(0, cursorPos).split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord && lastWord.length > 2) {
      const result = checkWord(lastWord);
      setCurrentWord(lastWord);

      if (!result.isCorrect && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (!inputRef.current) return;

    const text = value;
    const words = text.substring(0, cursorPos).split(/\s+/);
    const beforeWord = text.substring(0, text.lastIndexOf(currentWord));
    const afterWord = text.substring(text.lastIndexOf(currentWord) + currentWord.length);

    const newValue = beforeWord + suggestion + afterWord;
    onChange(newValue);
    setShowSuggestions(false);

    // Move cursor after suggestion
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = beforeWord.length + suggestion.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const commonProps = {
    ref: inputRef,
    value,
    onChange: handleChange,
    placeholder,
    className: `${className} relative`,
    disabled: isLoading,
  };

  return (
    <div className="relative">
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input {...commonProps} type="text" />
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-slate-700 border border-amber-500/50 rounded-lg shadow-lg z-50 w-full">
          <div className="p-2">
            <p className="text-xs text-amber-500 mb-2">Suggerimenti per "{currentWord}":</p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                className="block w-full text-left px-3 py-2 text-white hover:bg-amber-500/20 rounded transition text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
