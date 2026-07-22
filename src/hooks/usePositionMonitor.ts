import { useEffect } from 'react';
import { usePriceStore } from './usePriceStore';
import { usePositionStore } from './usePositionStore';
import { useNotify } from './useNotify';

export function usePositionMonitor() {
  const prices = usePriceStore(s => s.prices);
  const positions = usePositionStore(s => s.positions);
  const closePosition = usePositionStore(s => s.closePosition);
  const { notify, playAlertSound } = useNotify();

  useEffect(() => {
    const openPositions = positions.filter(p => p.status === 'open');
    if (openPositions.length === 0) return;

    for (const pos of openPositions) {
      const priceData = prices[pos.symbol];
      if (!priceData) continue;

      const currentPrice = priceData[pos.exchange]?.price;
      if (currentPrice === null || currentPrice === undefined) continue;

      // Check Take Profit
      if (pos.takeProfit !== null) {
        const tpTriggered = pos.direction === 'long'
          ? currentPrice >= pos.takeProfit
          : currentPrice <= pos.takeProfit;
        if (tpTriggered) {
          closePosition(pos.id, currentPrice, 'tp');
          notify(
            `止盈触发: ${pos.symbol}`,
            `${pos.direction === 'long' ? '多' : '空'}仓 @ ${pos.entryPrice} 止盈 @ ${pos.takeProfit} 现价 ${currentPrice}`,
            'success'
          );
          playAlertSound();
          continue;
        }
      }

      // Check Stop Loss
      if (pos.stopLoss !== null) {
        const slTriggered = pos.direction === 'long'
          ? currentPrice <= pos.stopLoss
          : currentPrice >= pos.stopLoss;
        if (slTriggered) {
          closePosition(pos.id, currentPrice, 'sl');
          notify(
            `止损触发: ${pos.symbol}`,
            `${pos.direction === 'long' ? '多' : '空'}仓 @ ${pos.entryPrice} 止损 @ ${pos.stopLoss} 现价 ${currentPrice}`,
            'warning'
          );
          playAlertSound();
        }
      }
    }
  }, [prices, positions, closePosition, notify, playAlertSound]);
}
