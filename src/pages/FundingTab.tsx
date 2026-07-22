import { useMemo } from 'react';
import { usePriceStore } from '../hooks/usePriceStore';
import { useLocale } from '../i18n/useLocale';
import { formatFundingRate, calcAnnualizedRate } from '../utils/format';
import styles from './FundingTab.module.css';

export function FundingTab() {
  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const prices = usePriceStore(s => s.prices);

  const fundingData = useMemo(() => {
    const data = symbols.map(symbol => {
      const p = prices[symbol];
      if (!p) return null;
      const bRate = p.binance.fundingRate;
      const oRate = p.okx.fundingRate;
      if (bRate === null || oRate === null) return null;
      const diff = Math.abs(bRate - oRate);
      const annualized = calcAnnualizedRate(diff);
      const direction = bRate > oRate ? 'B→O' : 'O→B';
      return { symbol, bRate, oRate, diff, annualized, direction };
    }).filter((d): d is NonNullable<typeof d> => d !== null);
    data.sort((a, b) => b.diff - a.diff);
    return data;
  }, [symbols, prices]);

  const bestArbitrage = fundingData[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('fundingRateComparison')}</h2>
      </div>

      <div className={styles.list}>
        {fundingData.map(item => (
          <div key={item.symbol} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.symbolName}>{item.symbol.replace('USDT', '')}</span>
              <span className={styles.direction}>{item.direction}</span>
            </div>
            <div className={styles.rates}>
              <div className={styles.rateItem}>
                <span className={styles.exchangeLabel}>B:</span>
                <span className={styles.rateValue}>{formatFundingRate(item.bRate)}</span>
              </div>
              <div className={styles.rateItem}>
                <span className={styles.exchangeLabelOkx}>O:</span>
                <span className={styles.rateValue}>{formatFundingRate(item.oRate)}</span>
              </div>
            </div>
            <div className={styles.footer}>
              <span className={styles.diff}>{t('rateDiff')}: {(item.diff * 100).toFixed(3)}%</span>
              <span className={styles.annualized}>{t('annualized')}: {item.annualized.toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>

      {bestArbitrage && (
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>{t('bestArbitrage')}:</span>
          <span className={styles.summaryValue}>
            {bestArbitrage.symbol.replace('USDT', '')} {(bestArbitrage.diff * 100).toFixed(3)}% {bestArbitrage.annualized.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
