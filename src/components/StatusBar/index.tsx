import { useEffect, useState, useMemo } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { calcAnnualizedRate } from '../../utils/format';
import { ConnectionStatus } from '../ConnectionStatus';
import styles from './StatusBar.module.css';

export function StatusBar() {
  const { t } = useLocale();
  const prices = usePriceStore(s => s.prices);
  const symbols = usePriceStore(s => s.symbols);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find best arbitrage opportunity
  const bestArbitrage = useMemo(() => {
    let best: { symbol: string; diff: number; annualized: number } | null = null;
    for (const symbol of symbols) {
      const p = prices[symbol];
      if (!p) continue;
      const bRate = p.binance.fundingRate;
      const oRate = p.okx.fundingRate;
      if (bRate === null || oRate === null) continue;
      const diff = Math.abs(bRate - oRate);
      if (diff <= 0) continue;
      const annualized = calcAnnualizedRate(diff);
      if (!best || diff > best.diff) {
        best = { symbol: symbol.replace('USDT', ''), diff, annualized };
      }
    }
    return best;
  }, [prices, symbols]);

  // Find the most recent timestamp from all prices
  let newestTimestamp = 0;
  for (const p of Object.values(prices)) {
    if (p.binance.timestamp && p.binance.timestamp > newestTimestamp) {
      newestTimestamp = p.binance.timestamp;
    }
    if (p.okx.timestamp && p.okx.timestamp > newestTimestamp) {
      newestTimestamp = p.okx.timestamp;
    }
  }

  const latency = newestTimestamp > 0 ? Date.now() - newestTimestamp : null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('zh-CN', { hour12: false });
  };

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <ConnectionStatus />
      </div>
      <div className={styles.center}>
        {bestArbitrage && bestArbitrage.diff > 0.0001 && (
          <span className={`${styles.arbitrage} ${bestArbitrage.diff > 0.0005 ? styles.arbitrageHighlight : ''}`}>
            {t('bestArbitrage')}: {bestArbitrage.symbol} {t('rateDiff')} {(bestArbitrage.diff * 100).toFixed(3)}% {t('annualized')}: {bestArbitrage.annualized.toFixed(1)}%
          </span>
        )}
      </div>
      <div className={styles.right}>
        {newestTimestamp > 0 && (
          <>
            <span className={styles.item}>
              <span className={styles.label}>{t('lastUpdate')}:</span>
              <span className={styles.value}>{formatTime(newestTimestamp)}</span>
            </span>
            {latency !== null && (
              <span className={styles.item}>
                <span className={styles.label}>{t('latency')}:</span>
                <span className={`${styles.value} ${latency < 2000 ? styles.goodLatency : styles.badLatency}`}>
                  {latency}ms
                </span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
