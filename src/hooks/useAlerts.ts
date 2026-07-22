import { useEffect, useRef } from 'react';
import { usePriceStore } from './usePriceStore';
import { useNotify } from './useNotify';
import { calcAnnualizedRate } from '../utils/format';

const ARBITRAGE_THRESHOLD = 0.0005; // 0.05%

export function useAlerts() {
  const prices = usePriceStore(s => s.prices);
  const symbols = usePriceStore(s => s.symbols);
  const alerts = usePriceStore(s => s.alerts);
  const settings = usePriceStore(s => s.settings);
  const resetAlert = usePriceStore(s => s.resetAlert);
  const { notify, playAlertSound } = useNotify();
  const prevPricesRef = useRef<Record<string, { binance: number | null; time: number }>>({});
  const lastArbitrageAlertRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const now = Date.now();
    for (const [symbol, pairPrice] of Object.entries(prices)) {
      const prev = prevPricesRef.current[symbol];
      const currentPrice = pairPrice.binance.price ?? pairPrice.okx.price;

      // Check custom price alerts
      for (const alert of alerts) {
        if (!alert.enabled || alert.triggered || alert.symbol !== symbol) continue;
        if (currentPrice === null) continue;
        if (alert.type === 'upper' && currentPrice >= alert.price) {
          notify(`价格警报: ${symbol}`, `当前价格 $${currentPrice.toLocaleString()} 已突破上限 $${alert.price.toLocaleString()}`, 'warning');
          playAlertSound();
          resetAlert(alert.id);
        } else if (alert.type === 'lower' && currentPrice <= alert.price) {
          notify(`价格警报: ${symbol}`, `当前价格 $${currentPrice.toLocaleString()} 已跌破下限 $${alert.price.toLocaleString()}`, 'warning');
          playAlertSound();
          resetAlert(alert.id);
        }
      }

      // Check volatility
      if (prev && prev.binance !== null && pairPrice.binance.price !== null) {
        const elapsed = now - prev.time;
        if (elapsed > 0 && elapsed < 60000) {
          const changePercent = Math.abs((pairPrice.binance.price - prev.binance) / prev.binance) * 100;
          if (changePercent >= settings.volatilityThreshold) {
            const direction = pairPrice.binance.price > prev.binance ? '上涨' : '下跌';
            notify(`波动提醒: ${symbol}`, `${symbol} 1分钟内${direction} ${changePercent.toFixed(2)}%`, 'warning');
            playAlertSound();
          }
        }
      }

      // Check arbitrage opportunity
      const bRate = pairPrice.binance.fundingRate;
      const oRate = pairPrice.okx.fundingRate;
      if (bRate !== null && oRate !== null) {
        const diff = Math.abs(bRate - oRate);
        if (diff >= ARBITRAGE_THRESHOLD) {
          const lastAlertTime = lastArbitrageAlertRef.current[symbol] || 0;
          // Only alert once per 5 minutes per symbol
          if (now - lastAlertTime > 5 * 60 * 1000) {
            const annualized = calcAnnualizedRate(diff);
            const direction = bRate > oRate ? 'Binance→OKX' : 'OKX→Binance';
            notify(
              `套利机会: ${symbol}`,
              `费率差 ${(diff * 100).toFixed(3)}% 年化 ${annualized.toFixed(1)}% 方向: ${direction}`,
              'success'
            );
            lastArbitrageAlertRef.current[symbol] = now;
          }
        }
      }

      prevPricesRef.current[symbol] = { binance: pairPrice.binance.price, time: now };
    }
  }, [prices, symbols, alerts, settings.volatilityThreshold, notify, playAlertSound, resetAlert]);
}
