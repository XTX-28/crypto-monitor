import { useEffect, useCallback } from 'react';
import { usePriceStore } from './usePriceStore';

interface UseKeyboardOptions {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onToggleView: () => void;
  onToggleFullscreen: () => void;
  onToggleAlerts: () => void;
}

export function useKeyboard({ searchInputRef, onToggleView, onToggleFullscreen, onToggleAlerts }: UseKeyboardOptions) {
  const symbols = usePriceStore(s => s.symbols);
  const selectedSymbol = usePriceStore(s => s.selectedSymbol);
  const setSelectedSymbol = usePriceStore(s => s.setSelectedSymbol);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore when typing in input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      if (e.key === 'Escape') {
        (target as HTMLInputElement).blur();
      }
      return;
    }

    switch (e.key) {
      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
        break;
      case '1':
        onToggleView();
        break;
      case '2':
        onToggleView();
        break;
      case 'f':
      case 'F':
        onToggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (selectedSymbol) {
          const idx = symbols.indexOf(selectedSymbol);
          if (idx > 0) setSelectedSymbol(symbols[idx - 1]);
        } else if (symbols.length > 0) {
          setSelectedSymbol(symbols[0]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (selectedSymbol) {
          const idx = symbols.indexOf(selectedSymbol);
          if (idx < symbols.length - 1) setSelectedSymbol(symbols[idx + 1]);
        } else if (symbols.length > 0) {
          setSelectedSymbol(symbols[0]);
        }
        break;
      case 'Enter':
        if (selectedSymbol) {
          // Already selected, could toggle detail view
        }
        break;
      case 'a':
      case 'A':
        onToggleAlerts();
        break;
    }
  }, [symbols, selectedSymbol, setSelectedSymbol, searchInputRef, onToggleView, onToggleFullscreen, onToggleAlerts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
