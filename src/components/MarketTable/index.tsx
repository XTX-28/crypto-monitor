import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { formatPrice, formatPercent, formatFundingRate, formatVolume, formatSpread } from '../../utils/format';
import { SparkLine } from '../SparkLine';
import { TableSkeleton } from '../Skeleton';
import type { SortField, SortDirection, ColumnKey } from '../../types';
import type { TranslationKey } from '../../i18n/zh';
import styles from './MarketTable.module.css';

interface MarketTableProps {
  onSelectSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
  selectedSymbol: string | null;
}

export function MarketTable({ onSelectSymbol, onRemoveSymbol, selectedSymbol }: MarketTableProps) {
  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const prices = usePriceStore(s => s.prices);
  const priceHistory = usePriceStore(s => s.priceHistory);
  const reorderSymbols = usePriceStore(s => s.reorderSymbols);
  const settings = usePriceStore(s => s.settings);
  const updateSettings = usePriceStore(s => s.updateSettings);

  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const dragRowRef = useRef<number | null>(null);
  const prevPricesRef = useRef<Record<string, { binance: number | null; okx: number | null }>>({});
  const [flashState, setFlashState] = useState<Record<string, 'up' | 'down' | null>>({});
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Detect if data is still loading
  const isLoading = useMemo(() => {
    return symbols.length === 0 || symbols.every(s => {
      const p = prices[s];
      return !p || (p.binance.price === null && p.okx.price === null);
    });
  }, [symbols, prices]);

  // Track price changes for flash animation
  useEffect(() => {
    const newFlash: Record<string, 'up' | 'down' | null> = {};
    for (const symbol of symbols) {
      const p = prices[symbol];
      const prev = prevPricesRef.current[symbol];
      if (!p) continue;
      const curB = p.binance.price;
      const prevB = prev?.binance ?? null;
      if (curB !== null && prevB !== null && curB !== prevB) {
        newFlash[symbol] = curB > prevB ? 'up' : 'down';
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
    // Update prev prices
    const newPrev: Record<string, { binance: number | null; okx: number | null }> = {};
    for (const symbol of symbols) {
      const p = prices[symbol];
      if (p) newPrev[symbol] = { binance: p.binance.price, okx: p.okx.price };
    }
    prevPricesRef.current = newPrev;
  }, [prices, symbols]);

  const visibleColumns = settings.visibleColumns;
  const isColVisible = useCallback((col: ColumnKey) => visibleColumns.includes(col), [visibleColumns]);

  const toggleColumn = useCallback((col: ColumnKey) => {
    const current = settings.visibleColumns;
    const next = current.includes(col)
      ? current.filter(c => c !== col)
      : [...current, col];
    updateSettings({ visibleColumns: next });
  }, [settings.visibleColumns, updateSettings]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  const sortedSymbols = useMemo(() => {
    const arr = symbols.map(symbol => {
      const p = prices[symbol];
      const binancePrice = p?.binance.price ?? null;
      const okxPrice = p?.okx.price ?? null;
      const spread = formatSpread(binancePrice, okxPrice);
      return {
        symbol,
        price: binancePrice ?? okxPrice,
        spread: spread.percentValue,
        change24h: p?.binance.priceChange24h ?? p?.okx.priceChange24h ?? 0,
        volume24h: p?.binance.volume24h ?? p?.okx.volume24h ?? 0,
        fundingRate: Math.abs(p?.binance.fundingRate ?? 0) + Math.abs(p?.okx.fundingRate ?? 0),
        openInterest: p?.binance.openInterest ?? p?.okx.openInterest ?? 0,
      };
    });

    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'symbol': cmp = a.symbol.localeCompare(b.symbol); break;
        case 'price': cmp = (a.price ?? 0) - (b.price ?? 0); break;
        case 'spread': cmp = Math.abs(a.spread) - Math.abs(b.spread); break;
        case 'change24h': cmp = a.change24h - b.change24h; break;
        case 'volume24h': cmp = a.volume24h - b.volume24h; break;
        case 'fundingRate': cmp = a.fundingRate - b.fundingRate; break;
        case 'openInterest': cmp = a.openInterest - b.openInterest; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return arr.map(a => a.symbol);
  }, [symbols, prices, sortField, sortDir]);

  const handleDragStart = (idx: number) => {
    dragRowRef.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragRowRef.current !== null && dragRowRef.current !== idx) {
      reorderSymbols(dragRowRef.current, idx);
      dragRowRef.current = idx;
    }
  };

  const handleDragEnd = () => {
    dragRowRef.current = null;
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={styles.sortIcon}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  if (isLoading) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div className={styles.tableWrapper}>
      {/* Column settings button */}
      <div className={styles.columnMenuWrapper}>
        <button
          className={styles.columnMenuBtn}
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          title={t('columnSettings')}
        >
          ⚙
        </button>
        {showColumnMenu && (
          <div className={styles.columnMenu}>
            <div className={styles.columnMenuTitle}>{t('columnSettings')}</div>
            {(['volume24h', 'fundingRate', 'openInterest', 'trend'] as ColumnKey[]).map(col => (
              <label key={col} className={styles.columnMenuItem}>
                <input
                  type="checkbox"
                  checked={isColVisible(col)}
                  onChange={() => toggleColumn(col)}
                />
                {t(col as TranslationKey)}
              </label>
            ))}
          </div>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.dragCol}></th>
            <th className={styles.symbolCol} onClick={() => handleSort('symbol')}>
              {t('symbol')}<SortIcon field="symbol" />
            </th>
            <th className={styles.priceCol} onClick={() => handleSort('price')}>
              {t('binancePrice')}<SortIcon field="price" />
            </th>
            <th className={styles.priceCol}>{t('okxPrice')}</th>
            <th className={styles.spreadCol} onClick={() => handleSort('spread')}>
              {t('spread')}<SortIcon field="spread" />
            </th>
            <th className={styles.changeCol} onClick={() => handleSort('change24h')}>
              {t('change24h')}<SortIcon field="change24h" />
            </th>
            {isColVisible('volume24h') && (
              <th className={styles.volumeCol} onClick={() => handleSort('volume24h')}>
                {t('volume24h')}<SortIcon field="volume24h" />
              </th>
            )}
            {isColVisible('fundingRate') && (
              <th className={styles.frCol}>{t('fundingRate')}<br /><span className={styles.exchangeLabel}>B / O</span></th>
            )}
            {isColVisible('openInterest') && (
              <th className={styles.oiCol} onClick={() => handleSort('openInterest')}>
                {t('openInterest')}<SortIcon field="openInterest" />
              </th>
            )}
            {isColVisible('trend') && (
              <th className={styles.trendCol}>{t('trend')}</th>
            )}
            <th className={styles.actionCol}></th>
          </tr>
        </thead>
        <tbody>
          {sortedSymbols.map((symbol, idx) => {
            const p = prices[symbol];
            if (!p) return null;
            const spread = formatSpread(p.binance.price, p.okx.price);
            const change = p.binance.priceChange24h ?? p.okx.priceChange24h;
            const isSelected = selectedSymbol === symbol;
            const flash = flashState[symbol];

            return (
              <tr
                key={symbol}
                className={`${styles.row} ${isSelected ? styles.selectedRow : ''} ${flash === 'up' ? styles.flashUp : ''} ${flash === 'down' ? styles.flashDown : ''}`}
                onClick={() => onSelectSymbol(symbol)}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <td className={styles.dragCol}>
                  <span className={styles.dragHandle}>⠿</span>
                </td>
                <td className={styles.symbolCol}>
                  <span className={styles.symbolName}>{symbol.replace('USDT', '')}</span>
                  <span className={styles.symbolPair}>/USDT</span>
                </td>
                <td className={styles.priceCol}>
                  <span className={styles.priceValue}>{formatPrice(p.binance.price)}</span>
                </td>
                <td className={styles.priceCol}>
                  <span className={styles.priceValue}>{formatPrice(p.okx.price)}</span>
                </td>
                <td className={styles.spreadCol}>
                  <span className={`${styles.spreadValue} ${Math.abs(spread.percentValue) > 0.1 ? styles.spreadHighlight : ''}`}>
                    {spread.percent}
                  </span>
                </td>
                <td className={styles.changeCol}>
                  {change !== null && change !== undefined ? (
                    <span className={change >= 0 ? styles.up : styles.down}>
                      {formatPercent(change)}
                    </span>
                  ) : '--'}
                </td>
                {isColVisible('volume24h') && (
                  <td className={styles.volumeCol}>
                    <span className={styles.volumeValue}>{formatVolume(p.binance.volume24h ?? p.okx.volume24h)}</span>
                  </td>
                )}
                {isColVisible('fundingRate') && (
                  <td className={styles.frCol}>
                    <span className={styles.frPair}>
                      <span className={styles.frBinance}>{formatFundingRate(p.binance.fundingRate)}</span>
                      <span className={styles.frOkx}>{formatFundingRate(p.okx.fundingRate)}</span>
                    </span>
                  </td>
                )}
                {isColVisible('openInterest') && (
                  <td className={styles.oiCol}>
                    <span className={styles.oiValue}>{formatVolume(p.binance.openInterest ?? p.okx.openInterest)}</span>
                  </td>
                )}
                {isColVisible('trend') && (
                  <td className={styles.trendCol}>
                    <SparkLine data={priceHistory[symbol] || []} exchange="binance" />
                  </td>
                )}
                <td className={styles.actionCol}>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => { e.stopPropagation(); onRemoveSymbol(symbol); }}
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
