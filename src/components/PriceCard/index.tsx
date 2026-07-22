import { usePriceStore } from '../../hooks/usePriceStore';
import { formatPrice, formatSpread } from '../../utils/format';
import styles from './PriceCard.module.css';

interface PriceCardProps {
  symbol: string;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

export function PriceCard({ symbol, isSelected, onSelect, onRemove }: PriceCardProps) {
  const prices = usePriceStore(s => s.prices[symbol]);

  if (!prices) return null;

  const spread = formatSpread(prices.binance, prices.okx);
  const spreadAbs = Math.abs(spread.percentValue);

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(symbol)}
    >
      <div className={styles.header}>
        <span className={styles.symbol}>{symbol.replace('USDT', '')}</span>
        <span className={styles.pair}>/USDT</span>
        <button
          className={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(symbol);
          }}
          title="移除"
        >
          &times;
        </button>
      </div>

      <div className={styles.prices}>
        <div className={styles.exchangeRow}>
          <span className={styles.exchangeLabel}>Binance</span>
          <span className={styles.price}>{formatPrice(prices.binance)}</span>
        </div>
        <div className={styles.exchangeRow}>
          <span className={styles.exchangeLabel}>OKX</span>
          <span className={styles.price}>{formatPrice(prices.okx)}</span>
        </div>
      </div>

      <div className={`${styles.spread} ${spreadAbs > 0.1 ? styles.spreadHighlight : ''}`}>
        <span className={styles.spreadLabel}>价差</span>
        <span className={`${styles.spreadValue} ${spread.percentValue >= 0 ? styles.positive : styles.negative}`}>
          {spread.percent}
        </span>
      </div>
    </div>
  );
}
