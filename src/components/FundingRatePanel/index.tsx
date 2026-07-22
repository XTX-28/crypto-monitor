import { useMemo, useEffect, useState } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { formatFundingRate, formatCountdown, calcAnnualizedRate } from '../../utils/format';
import styles from './FundingRatePanel.module.css';

export function FundingRatePanel() {
  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const prices = usePriceStore(s => s.prices);
  const [, setTick] = useState(0);

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const fundingData = useMemo(() => {
    return symbols.map(symbol => {
      const p = prices[symbol];
      const bRate = p?.binance.fundingRate ?? null;
      const oRate = p?.okx.fundingRate ?? null;
      const diff = (bRate ?? 0) - (oRate ?? 0);
      const nextTime = p?.binance.nextFundingTime ?? p?.okx.nextFundingTime ?? null;

      return {
        symbol,
        binanceRate: bRate,
        okxRate: oRate,
        diff,
        absDiff: Math.abs(diff),
        annualized: calcAnnualizedRate(Math.abs(diff)),
        direction: diff > 0 ? 'B→O' : diff < 0 ? 'O→B' : '-',
        nextTime,
      };
    }).sort((a, b) => b.absDiff - a.absDiff);
  }, [symbols, prices]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('fundingRateComparison')}</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.symbolTh}>{t('symbol')}</th>
              <th>{t('binanceRate')}</th>
              <th>{t('okxRate')}</th>
              <th>{t('rateDiff')}</th>
              <th>{t('annualized')}</th>
              <th>{t('direction')}</th>
              <th>{t('nextSettlement')}</th>
            </tr>
          </thead>
          <tbody>
            {fundingData.map(item => (
              <tr key={item.symbol} className={item.absDiff > 0.001 ? styles.highlightRow : ''}>
                <td className={styles.symbolTd}>
                  <span className={styles.symbolName}>{item.symbol.replace('USDT', '')}</span>
                  <span className={styles.symbolPair}>/USDT</span>
                </td>
                <td className={styles.rateCell}>
                  <span className={styles.binanceRate}>{formatFundingRate(item.binanceRate)}</span>
                </td>
                <td className={styles.rateCell}>
                  <span className={styles.okxRate}>{formatFundingRate(item.okxRate)}</span>
                </td>
                <td className={styles.rateCell}>
                  <span className={styles.diffValue}>
                    {(item.diff * 100).toFixed(4)}%
                  </span>
                </td>
                <td className={styles.rateCell}>
                  <span className={styles.annualizedValue}>{item.annualized}</span>
                </td>
                <td className={styles.directionCell}>
                  <span className={item.absDiff > 0.001 ? styles.arbitrageDir : ''}>
                    {item.direction}
                  </span>
                </td>
                <td className={styles.countdownCell}>
                  {item.nextTime ? formatCountdown(item.nextTime) : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
