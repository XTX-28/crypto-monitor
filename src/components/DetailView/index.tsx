import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, LineSeries, type IChartApi, type ISeriesApi, ColorType } from 'lightweight-charts';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { formatPrice, formatPercent, formatFundingRate, formatVolume, formatCountdown } from '../../utils/format';
import styles from './DetailView.module.css';

interface DetailViewProps {
  symbol: string;
}

type TimeRange = '1m' | '5m' | '15m' | '1h';

export function DetailView({ symbol }: DetailViewProps) {
  const { t } = useLocale();
  const prices = usePriceStore(s => s.prices[symbol]);
  const priceHistory = usePriceStore(s => s.priceHistory[symbol]);
  const fundingRateHistory = usePriceStore(s => s.fundingRateHistory[symbol]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const binanceSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const okxSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('5m');
  const [showFundingHistory, setShowFundingHistory] = useState(false);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1e2329' },
        textColor: '#8b949e',
      },
      grid: {
        vertLines: { color: '#2b3139' },
        horzLines: { color: '#2b3139' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#2b3139' },
      timeScale: { borderColor: '#2b3139', timeVisible: true, secondsVisible: false },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    const binanceSeries = chart.addSeries(LineSeries, {
      color: '#f0b90b', lineWidth: 2, title: 'Binance',
    });
    const okxSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6', lineWidth: 2, title: 'OKX',
    });

    chartRef.current = chart;
    binanceSeriesRef.current = binanceSeries;
    okxSeriesRef.current = okxSeries;

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
    if (!priceHistory || !binanceSeriesRef.current || !okxSeriesRef.current) return;
    const now = Date.now();
    let cutoff = 0;
    switch (timeRange) {
      case '1m': cutoff = now - 60 * 1000; break;
      case '5m': cutoff = now - 5 * 60 * 1000; break;
      case '15m': cutoff = now - 15 * 60 * 1000; break;
      case '1h': cutoff = now - 60 * 60 * 1000; break;
    }
    const filtered = priceHistory.filter(p => p.time >= cutoff);
    binanceSeriesRef.current.setData(
      filtered.filter(p => p.binance !== null).map(p => ({ time: (p.time / 1000) as any, value: p.binance! }))
    );
    okxSeriesRef.current.setData(
      filtered.filter(p => p.okx !== null).map(p => ({ time: (p.time / 1000) as any, value: p.okx! }))
    );
  }, [priceHistory, timeRange]);

  const spread = useMemo(() => {
    if (!prices) return null;
    const bp = prices.binance.price;
    const op = prices.okx.price;
    if (bp === null || op === null) return null;
    const diff = bp - op;
    const avg = (bp + op) / 2;
    return { diff, percent: avg > 0 ? (diff / avg) * 100 : 0 };
  }, [prices]);

  if (!prices) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.symbolName}>{symbol.replace('USDT', '')}</span>
          <span className={styles.symbolPair}>/USDT</span>
        </div>
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
      </div>

      {/* Chart */}
      <div className={styles.chartSection}>
        <div ref={chartContainerRef} className={styles.chart} />
        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={`${styles.dot} ${styles.binanceDot}`} />Binance</span>
          <span className={styles.legendItem}><span className={`${styles.dot} ${styles.okxDot}`} />OKX</span>
        </div>
      </div>

      {/* Data Grid */}
      <div className={styles.dataGrid}>
        <div className={styles.dataCard}>
          <div className={styles.dataLabel}>Binance</div>
          <div className={styles.dataValue}>{formatPrice(prices.binance.price)}</div>
          <div className={styles.dataSub}>
            <span>FR: {formatFundingRate(prices.binance.fundingRate)}</span>
            <span>OI: {formatVolume(prices.binance.openInterest)}</span>
          </div>
        </div>
        <div className={styles.dataCard}>
          <div className={styles.dataLabel}>OKX</div>
          <div className={styles.dataValue}>{formatPrice(prices.okx.price)}</div>
          <div className={styles.dataSub}>
            <span>FR: {formatFundingRate(prices.okx.fundingRate)}</span>
            <span>OI: {formatVolume(prices.okx.openInterest)}</span>
          </div>
        </div>
        <div className={styles.dataCard}>
          <div className={styles.dataLabel}>{t('spread')}</div>
          <div className={styles.dataValue}>
            {spread ? (
              <span className={spread.percent >= 0 ? styles.upValue : styles.downValue}>
                {spread.percent >= 0 ? '+' : ''}{spread.percent.toFixed(3)}%
              </span>
            ) : '--'}
          </div>
        </div>
        <div className={styles.dataCard}>
          <div className={styles.dataLabel}>24h</div>
          <div className={styles.dataValue}>
            {prices.binance.priceChange24h !== null ? (
              <span className={prices.binance.priceChange24h >= 0 ? styles.upValue : styles.downValue}>
                {formatPercent(prices.binance.priceChange24h)}
              </span>
            ) : (
              <span className={prices.okx.priceChange24h !== null ? (prices.okx.priceChange24h >= 0 ? styles.upValue : styles.downValue) : ''}>
                {formatPercent(prices.okx.priceChange24h)}
              </span>
            )}
          </div>
          <div className={styles.dataSub}>
            <span>Vol: {formatVolume(prices.binance.volume24h ?? prices.okx.volume24h)}</span>
          </div>
        </div>
        {prices.binance.nextFundingTime && (
          <div className={styles.dataCard}>
            <div className={styles.dataLabel}>{t('nextSettlement')}</div>
            <div className={styles.dataValue}>{formatCountdown(prices.binance.nextFundingTime)}</div>
          </div>
        )}
      </div>

      {/* Funding Rate History Toggle */}
      <div className={styles.fundingSection}>
        <button
          className={styles.toggleBtn}
          onClick={() => setShowFundingHistory(!showFundingHistory)}
        >
          {t('fundingRateHistory')} {showFundingHistory ? '▲' : '▼'}
        </button>
        {showFundingHistory && fundingRateHistory && fundingRateHistory.length > 0 && (
          <div className={styles.fundingList}>
            {fundingRateHistory.slice(-20).reverse().map((point, i) => (
              <div key={i} className={styles.fundingRow}>
                <span className={styles.fundingTime}>
                  {new Date(point.time).toLocaleTimeString('zh-CN', { hour12: false })}
                </span>
                <span className={styles.fundingBinance}>{formatFundingRate(point.binance)}</span>
                <span className={styles.fundingOkx}>{formatFundingRate(point.okx)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
