import { useState } from 'react';
import { POPULAR_SYMBOLS } from '../../utils/constants';
import styles from './PairSelector.module.css';

interface PairSelectorProps {
  onAdd: (symbol: string) => void;
  existingSymbols: string[];
}

export function PairSelector({ onAdd, existingSymbols }: PairSelectorProps) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredSymbols = POPULAR_SYMBOLS.filter(
    s => !existingSymbols.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  const handleAdd = (symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    if (upper && !existingSymbols.includes(upper)) {
      onAdd(upper);
      setInput('');
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      let symbol = input.toUpperCase().trim();
      if (!symbol.includes('USDT')) {
        symbol = symbol + 'USDT';
      }
      handleAdd(symbol);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="输入币种 (如 BTC, ETH, SOL...)"
          className={styles.input}
        />
        <button type="submit" className={styles.addBtn}>添加</button>
      </form>

      {showDropdown && input.length > 0 && (
        <div className={styles.dropdown}>
          {filteredSymbols.length > 0 ? (
            filteredSymbols.map(symbol => (
              <button
                key={symbol}
                className={styles.dropdownItem}
                onClick={() => handleAdd(symbol)}
              >
                {symbol.replace('USDT', '')}/USDT
              </button>
            ))
          ) : (
            <div className={styles.noResult}>
              输入完整交易对如 {input.toUpperCase()}USDT
            </div>
          )}
        </div>
      )}

      <div className={styles.quickAdd}>
        <span className={styles.quickLabel}>快捷添加:</span>
        {POPULAR_SYMBOLS.filter(s => !existingSymbols.includes(s)).slice(0, 8).map(symbol => (
          <button
            key={symbol}
            className={styles.quickBtn}
            onClick={() => handleAdd(symbol)}
          >
            {symbol.replace('USDT', '')}
          </button>
        ))}
      </div>
    </div>
  );
}
