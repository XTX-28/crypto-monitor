import { useEffect, useState } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { ConnectionStatus } from '../ConnectionStatus';
import styles from './StatusBar.module.css';

export function StatusBar() {
  const { t } = useLocale();
  const prices = usePriceStore(s => s.prices);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

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
