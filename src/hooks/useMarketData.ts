import { useEffect, useRef } from 'react';
import { usePriceStore } from './usePriceStore';
import { BINANCE_REST_BASE, OKX_REST_BASE, symbolToOkxInstId } from '../utils/constants';

// Poll Binance funding rates and open interest every 60s
export function useMarketData() {
  const symbols = usePriceStore(s => s.symbols);
  const updateFundingRate = usePriceStore(s => s.updateFundingRate);
  const updateOpenInterest = usePriceStore(s => s.updateOpenInterest);
  const addFundingRateHistory = usePriceStore(s => s.addFundingRateHistory);
  const symbolsRef = useRef(symbols);

  useEffect(() => { symbolsRef.current = symbols; }, [symbols]);

  useEffect(() => {
    const fetchBinanceData = async () => {
      const syms = symbolsRef.current;
      if (syms.length === 0) return;

      try {
        // Fetch premium index (includes funding rate and next funding time)
        const res = await fetch(`${BINANCE_REST_BASE}/fapi/v1/premiumIndex`);
        if (!res.ok) return;
        const data = await res.json();

        for (const item of data) {
          const symbol = item.symbol as string;
          if (!syms.includes(symbol)) continue;
          const rate = parseFloat(item.lastFundingRate);
          const nextTime = parseInt(item.nextFundingTime);
          if (!isNaN(rate)) {
            updateFundingRate(symbol, 'binance', rate, isNaN(nextTime) ? undefined : nextTime);
          }
        }

        // Record funding rate history
        for (const symbol of syms) {
          const prices = usePriceStore.getState().prices[symbol];
          if (prices) {
            addFundingRateHistory(symbol, prices.binance.fundingRate, prices.okx.fundingRate);
          }
        }
      } catch {
        // Network error, ignore
      }

      try {
        // Fetch open interest for each symbol
        for (const symbol of syms) {
          const res = await fetch(`${BINANCE_REST_BASE}/fapi/v1/openInterest?symbol=${symbol}`);
          if (!res.ok) continue;
          const data = await res.json();
          const oi = parseFloat(data.openInterest) * parseFloat(data.symbol ? (await getMarkPrice(symbol)) : '1');
          if (!isNaN(oi)) {
            updateOpenInterest(symbol, 'binance', oi);
          }
        }
      } catch {
        // Network error, ignore
      }
    };

    const fetchOKXData = async () => {
      const syms = symbolsRef.current;
      if (syms.length === 0) return;

      try {
        // Fetch funding rates
        for (const symbol of syms) {
          const instId = symbolToOkxInstId(symbol);
          const res = await fetch(`${OKX_REST_BASE}/api/v5/public/funding-rate?instId=${instId}`);
          if (!res.ok) continue;
          const json = await res.json();
          if (json.data?.[0]) {
            const item = json.data[0];
            const rate = parseFloat(item.fundingRate);
            const nextTime = parseInt(item.nextFundingTime);
            if (!isNaN(rate)) {
              updateFundingRate(symbol, 'okx', rate, isNaN(nextTime) ? undefined : nextTime);
            }
          }
        }
      } catch {
        // Network error, ignore
      }

      try {
        // Fetch open interest
        for (const symbol of syms) {
          const instId = symbolToOkxInstId(symbol);
          const res = await fetch(`${OKX_REST_BASE}/api/v5/public/open-interest?instType=SWAP&instId=${instId}`);
          if (!res.ok) continue;
          const json = await res.json();
          if (json.data?.[0]) {
            const oi = parseFloat(json.data[0].oi) * parseFloat(json.data[0].markPx || '1');
            if (!isNaN(oi)) {
              updateOpenInterest(symbol, 'okx', oi);
            }
          }
        }
      } catch {
        // Network error, ignore
      }
    };

    const fetchAll = async () => {
      await Promise.allSettled([fetchBinanceData(), fetchOKXData()]);
    };

    // Initial fetch
    fetchAll();

    // Poll every 60 seconds
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [symbols.join(',')]);
}

// Helper to get mark price for OI calculation
async function getMarkPrice(symbol: string): Promise<string> {
  try {
    const res = await fetch(`${BINANCE_REST_BASE}/fapi/v1/premiumIndex?symbol=${symbol}`);
    if (!res.ok) return '1';
    const data = await res.json();
    return data.markPrice || '1';
  } catch {
    return '1';
  }
}
