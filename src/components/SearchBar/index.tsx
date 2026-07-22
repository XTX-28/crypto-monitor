import { useState, useRef } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { POPULAR_SYMBOLS } from '../../utils/constants';
import styles from './SearchBar.module.css';

export function SearchBar() {
  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const addSymbol = usePriceStore(s => s.addSymbol);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (val: string) => {
    const sym = val.toUpperCase().trim();
    if (!sym) return;
    const full = sym.includes('USDT') ? sym : sym + 'USDT';
    addSymbol(full);
    if (inputRef.current) inputRef.current.value = '';
  };

  const availableSymbols = POPULAR_SYMBOLS.filter(s => !symbols.includes(s));

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <span className={styles.icon}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={t('addPair')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
      {availableSymbols.length > 0 && (
        <div className={styles.tags}>
          <span className={styles.tagLabel}>{t('quickAdd')}</span>
          {(expanded ? availableSymbols : availableSymbols.slice(0, 8)).map(sym => (
            <button
              key={sym}
              className={styles.tag}
              onClick={() => addSymbol(sym)}
            >
              {sym.replace('USDT', '')}
            </button>
          ))}
          {availableSymbols.length > 8 && (
            <button
              className={styles.tagMore}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '收起' : `+${availableSymbols.length - 8}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
