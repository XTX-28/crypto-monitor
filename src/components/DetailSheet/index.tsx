import { useEffect, useRef, useState } from 'react';
import { createChart, LineSeries, type IChartApi, ColorType } from 'lightweight-charts';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { formatPrice, formatPercent, formatFundingRate, formatVolume, formatCountdown } from '../../utils/format';
import styles from './DetailSheet.module.css';

interface DetailSheetProps {
  symbol: string;
  onClose: () => void;
}

type TimeRange = '1m' | '5m' | '15m' | '1h';

export function DetailSheet({ symbol, onClose }: DetailSheetProps) {
  const { t } = useLocale();
  const prices = usePriceStore(s => s.prices[symbol]);
  const priceHistory = usePriceStore(s => s.priceHistory[symbol]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const [expanded, setExpanded] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: 'rgba(43, 49, 57, 0.3)' },
        horzLines: { color: 'rgba(43, 49, 57, 0.3)' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#2b3139' },
      timeScale: { borderColor: '#2b3139', timeVisible: true, secondsVisible: false },
      width: chartContainerRef.current.clientWidth,
      height: 200,
    });

    chart.addSeries(LineSeries, {
      color: '#f0b90b', lineWidth: 2, title: 'Binance',
    });
    chart.addSeries(LineSeries, {
      color: '#3b82f6', lineWidth: 2, title: 'OKX',
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!priceHistory || !chartRef.current) return;
    const now = Date.now();
    let cutoff = 0;
    switch (timeRange) {
      case '1m': cutoff = now - 60 * 1000; break;
      case '5m': cutoff = now - 5 * 60 * 1000; break;
      case '15m': cutoff = now - 15 * 60 * 1000; break;
      case '1h': cutoff = now - 60 * 60 * 1000; break;
    }
    priceHistory.filter(p => p.time >= cutoff);
    chartRef.current.timeScale().fitContent();
  }, [priceHistory, timeRange]);

  // Touch handlers for drag-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - dragStartY;
    if (deltaY > 100 && !expanded) {
      onClose();
    }
    setDragStartY(null);
  };

  if (!prices) return null;

  const binancePrice = prices.binance.price;
  const okxPrice = prices.okx.price;
  const change = prices.binance.priceChange24h ?? prices.okx.priceChange24h;

  return (
    <div className={`${styles.overlay} ${expanded ? styles.expandedOverlay : ''}`} onClick={onClose}>
      <div
        className={`${styles.sheet} ${expanded ? styles.expanded : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className={styles.handle} onClick={() => setExpanded(!expanded)}>
          <div className={styles.handleBar} />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.symbolName}>{symbol.replace('USDT', '')}</span>
            <span className={styles.symbolPair}>/USDT</span>
            {change !== null && change !== undefined && (
              <span className={change >= 0 ? styles.up : styles.down}>
                {formatPercent(change)}
              </span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Time range selector */}
        <div className={styles.timeRange}>
          {(['1m', '5m', '15m', '1h'] as TimeRange[]).map(range => (
            <button
              key={range}
              className={`${styles.rangeBtn} ${timeRange === range ? styles.activeRange : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className={styles.chartSection}>
          <div ref={chartContainerRef} className={styles.chart} />
          <div className={styles.legend}>
            <span className={styles.legendItem}><span className={`${styles.dot} ${styles.binanceDot}`} />B</span>
            <span className={styles.legendItem}><span className={`${styles.dot} ${styles.okxDot}`} />O</span>
          </div>
        </div>

        {/* Data grid */}
        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>Binance</span>
            <span className={styles.dataValue}>{formatPrice(binancePrice)}</span>
            <span className={styles.dataSub}>FR: {formatFundingRate(prices.binance.fundingRate)}</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>OKX</span>
            <span className={styles.dataValue}>{formatPrice(okxPrice)}</span>
            <span className={styles.dataSub}>FR: {formatFundingRate(prices.okx.fundingRate)}</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>OI(B)</span>
            <span className={styles.dataValue}>{formatVolume(prices.binance.openInterest)}</span>
          </div>
          <div className={styles.dataItem}>
            <span className={styles.dataLabel}>OI(O)</span>
            <span className={styles.dataValue}>{formatVolume(prices.okx.openInterest)}</span>
          </div>
        </div>

        {/* Settlement countdown */}
        {prices.binance.nextFundingTime && (
          <div className={styles.settlement}>
            {t('nextSettlement')}: <span className={styles.countdown}>{formatCountdown(prices.binance.nextFundingTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
