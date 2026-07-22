import { useState } from 'react';
import { POPULAR_SYMBOLS } from '../../utils/constants';
import { useLocale } from '../../i18n/useLocale';
import styles from './PairSelector.module.css';

interface PairSelectorProps {
  onAdd: (symbol: string) => void;
  existingSymbols: string[];
}

export function PairSelector({ onAdd, existingSymbols }: PairSelectorProps) {
  const { t } = useLocale();
  const [showQuick, setShowQuick] = useState(false);

  const filteredQuick = POPULAR_SYMBOLS.filter(s => !existingSymbols.includes(s)).slice(0, 12);

  const handleAdd = (symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    if (upper && !existingSymbols.includes(upper)) {
      onAdd(upper);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.quickAdd}>
        <span className={styles.quickLabel}>{t('quickAdd')}</span>
        {filteredQuick.map(symbol => (
          <button
            key={symbol}
            className={styles.quickBtn}
            onClick={() => handleAdd(symbol)}
          >
            {symbol.replace('USDT', '')}
          </button>
        ))}
        {filteredQuick.length > 0 && (
          <button
            className={styles.moreBtn}
            onClick={() => setShowQuick(!showQuick)}
          >
            {showQuick ? '▲' : '▼'}
          </button>
        )}
      </div>

      {showQuick && (
        <div className={styles.extendedList}>
          {POPULAR_SYMBOLS.filter(s => !existingSymbols.includes(s)).map(symbol => (
            <button
              key={symbol}
              className={styles.extendedBtn}
              onClick={() => handleAdd(symbol)}
            >
              {symbol.replace('USDT', '')}/USDT
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
