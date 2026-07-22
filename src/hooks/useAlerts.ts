import { useEffect, useRef } from 'react';
import { usePriceStore } from './usePriceStore';
import { useNotify } from './useNotify';

export function useAlerts() {
  const prices = usePriceStore(s => s.prices);
  const alerts = usePriceStore(s => s.alerts);
  const settings = usePriceStore(s => s.settings);
  const resetAlert = usePriceStore(s => s.resetAlert);
  const { notify, playAlertSound } = useNotify();
  
  // Track previous prices for volatility detection
  const prevPricesRef = useRef<Record<string, { binance: number | null; okx: number | null; time: number }>>({});

  useEffect(() => {
    const now = Date.now();

    for (const [symbol, pairPrice] of Object.entries(prices)) {
      const prev = prevPricesRef.current[symbol];

      // Check custom price alerts
      for (const alert of alerts) {
        if (!alert.enabled || alert.triggered || alert.symbol !== symbol) continue;

        const currentPrice = pairPrice.binance ?? pairPrice.okx;
        if (currentPrice === null) continue;

        if (alert.type === 'upper' && currentPrice >= alert.price) {
          notify(
            `价格警报: ${symbol}`,
            `当前价格 $${currentPrice.toLocaleString()} 已突破上限 $${alert.price.toLocaleString()}`,
            'warning'
          );
          playAlertSound();
          resetAlert(alert.id);
        } else if (alert.type === 'lower' && currentPrice <= alert.price) {
          notify(
            `价格警报: ${symbol}`,
            `当前价格 $${currentPrice.toLocaleString()} 已跌破下限 $${alert.price.toLocaleString()}`,
            'warning'
          );
          playAlertSound();
          resetAlert(alert.id);
        }
      }

      // Check volatility
      if (prev && prev.binance !== null && pairPrice.binance !== null) {
        const elapsed = now - prev.time;
        if (elapsed > 0 && elapsed < 60000) { // Within 60 seconds
          const changePercent = Math.abs((pairPrice.binance - prev.binance) / prev.binance) * 100;
          if (changePercent >= settings.volatilityThreshold) {
            const direction = pairPrice.binance > prev.binance ? '上涨' : '下跌';
            notify(
              `波动提醒: ${symbol}`,
              `${symbol} 1分钟内${direction} ${changePercent.toFixed(2)}%`,
              'warning'
            );
            playAlertSound();
          }
        }
      }

      // Update previous prices
      prevPricesRef.current[symbol] = {
        binance: pairPrice.binance,
        okx: pairPrice.okx,
        time: now,
      };
    }
  }, [prices, alerts, settings.volatilityThreshold, notify, playAlertSound, resetAlert]);
}
