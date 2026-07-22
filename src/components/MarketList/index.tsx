import { useMemo, useRef, useState, useEffect } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { formatPrice, formatPercent, formatVolume, formatSpread } from '../../utils/format';
import { SparkLine } from '../SparkLine';
import { TableSkeleton } from '../Skeleton';
import styles from './MarketList.module.css';

interface MarketListProps {
  onSelectSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
  selectedSymbol: string | null;
}

export function MarketList({ onSelectSymbol, onRemoveSymbol, selectedSymbol }: MarketListProps) {
  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const prices = usePriceStore(s => s.prices);
  const priceHistory = usePriceStore(s => s.priceHistory);
  const reorderSymbols = usePriceStore(s => s.reorderSymbols);

  const prevPricesRef = useRef<Record<string, number | null>>({});
  const [flashState, setFlashState] = useState<Record<string, 'up' | 'down' | null>>({});
  const dragRowRef = useRef<number | null>(null);
  const [_swipeOpen, setSwipeOpen] = useState<string | null>(null);

  // Detect loading state
  const isLoading = useMemo(() => {
    return symbols.length === 0 || symbols.every(s => {
      const p = prices[s];
      return !p || (p.binance.price === null && p.okx.price === null);
    });
  }, [symbols, prices]);

  // Price flash animation
  useEffect(() => {
    const newFlash: Record<string, 'up' | 'down' | null> = {};
    for (const symbol of symbols) {
      const p = prices[symbol];
      const prev = prevPricesRef.current[symbol];
      if (!p) continue;
      const cur = p.binance.price ?? p.okx.price;
      if (cur !== null && prev !== null && cur !== undefined && prev !== undefined && cur !== prev) {
        newFlash[symbol] = cur > prev ? 'up' : 'down';
      }
    }
    if (Object.keys(newFlash).length > 0) {
      setFlashState(newFlash);
      setTimeout(() => setFlashState(prev => {
        const cleared = { ...prev };
        for (const k of Object.keys(newFlash)) cleared[k] = null;
        return cleared;
      }), 600);
    }
    const newPrev: Record<string, number | null> = {};
    for (const symbol of symbols) {
      const p = prices[symbol];
      if (p) newPrev[symbol] = p.binance.price ?? p.okx.price;
    }
    prevPricesRef.current = newPrev;
  }, [prices, symbols]);

  const handleDragStart = (idx: number) => { dragRowRef.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragRowRef.current !== null && dragRowRef.current !== idx) {
      reorderSymbols(dragRowRef.current, idx);
      dragRowRef.current = idx;
    }
  };
  const handleDragEnd = () => { dragRowRef.current = null; };

  if (isLoading) {
    return <TableSkeleton rows={8} />;
  }

  return (
    <div className={styles.list}>
      {symbols.map((symbol, idx) => {
        const p = prices[symbol];
        if (!p) return null;
        const binancePrice = p.binance.price;
        const okxPrice = p.okx.price;
        const mainPrice = binancePrice ?? okxPrice;
        const spread = formatSpread(binancePrice, okxPrice);
        const change = p.binance.priceChange24h ?? p.okx.priceChange24h;
        const volume = p.binance.volume24h ?? p.okx.volume24h;
        const isSelected = selectedSymbol === symbol;
        const flash = flashState[symbol];

        return (
          <div
            key={symbol}
            className={`${styles.card} ${isSelected ? styles.selected : ''} ${flash === 'up' ? styles.flashUp : ''} ${flash === 'down' ? styles.flashDown : ''}`}
            onClick={() => { setSwipeOpen(null); onSelectSymbol(symbol); }}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.cardContent}>
              <div className={styles.left}>
                <div className={styles.symbolRow}>
                  <span className={styles.symbolName}>{symbol.replace('USDT', '')}</span>
                  <span className={styles.symbolPair}>/USDT</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.mainPrice}>{formatPrice(mainPrice)}</span>
                  {change !== null && change !== undefined && (
                    <span className={change >= 0 ? styles.up : styles.down}>
                      {formatPercent(change)}
                    </span>
                  )}
                </div>
                <div className={styles.subRow}>
                  <span className={styles.subItem}>
                    <span className={styles.exchangeLabel}>B</span>
                    {formatPrice(binancePrice)}
                  </span>
                  <span className={styles.subItem}>
                    <span className={styles.exchangeLabelOkx}>O</span>
                    {formatPrice(okxPrice)}
                  </span>
                  <span className={styles.spread}>
                    {t('spread')}: {spread.percent}
                  </span>
                  {volume !== null && (
                    <span className={styles.volume}>
                      Vol: {formatVolume(volume)}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.right}>
                <SparkLine data={priceHistory[symbol] || []} exchange="binance" />
              </div>
            </div>
            {/* Swipe to delete */}
            <button
              className={styles.deleteBtn}
              onClick={(e) => { e.stopPropagation(); onRemoveSymbol(symbol); setSwipeOpen(null); }}
            >
              {t('delete')}
            </button>
          </div>
        );
      })}
    </div>
  );
}
