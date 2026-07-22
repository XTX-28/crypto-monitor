import { usePriceStore } from '../../hooks/usePriceStore';
import { formatPrice, formatPercent, formatFundingRate, formatSpread } from '../../utils/format';
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

  const spread = formatSpread(prices.binance.price, prices.okx.price);
  const change = prices.binance.priceChange24h ?? prices.okx.priceChange24h;

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
          onClick={(e) => { e.stopPropagation(); onRemove(symbol); }}
          title="Remove"
        >
          ×
        </button>
      </div>

      <div className={styles.prices}>
        <div className={styles.exchangeRow}>
          <span className={`${styles.exchangeLabel} ${styles.binanceLabel}`}>Binance</span>
          <span className={styles.price}>{formatPrice(prices.binance.price)}</span>
        </div>
        <div className={styles.exchangeRow}>
          <span className={`${styles.exchangeLabel} ${styles.okxLabel}`}>OKX</span>
          <span className={styles.price}>{formatPrice(prices.okx.price)}</span>
        </div>
      </div>

      <div className={styles.dataRow}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>Spread</span>
          <span className={`${styles.dataValue} ${Math.abs(spread.percentValue) > 0.1 ? styles.spreadHighlight : ''}`}>
            {spread.percent}
          </span>
        </div>
        {change !== null && change !== undefined && (
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>24h</span>
            <span className={change >= 0 ? styles.up : styles.down}>
              {formatPercent(change)}
            </span>
          </div>
        )}
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>FR</span>
          <span className={styles.frValue}>{formatFundingRate(prices.binance.fundingRate)}</span>
        </div>
      </div>
    </div>
  );
}
