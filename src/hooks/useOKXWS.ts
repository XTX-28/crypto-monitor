import { useEffect, useRef, useCallback } from 'react';
import { usePriceStore } from './usePriceStore';
import { OKX_WS_URL, symbolToOkxInstId, okxInstIdToSymbol } from '../utils/constants';

export function useOKXWS() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const symbols = usePriceStore(s => s.symbols);
  const updatePrice = usePriceStore(s => s.updatePrice);
  const updateTickerData = usePriceStore(s => s.updateTickerData);
  const updateFundingRate = usePriceStore(s => s.updateFundingRate);
  const setConnectionStatus = usePriceStore(s => s.setConnectionStatus);
  const symbolsRef = useRef(symbols);

  useEffect(() => { symbolsRef.current = symbols; }, [symbols]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const syms = symbolsRef.current;
    setConnectionStatus('okx', 'connecting');
    const ws = new WebSocket(OKX_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('okx', 'connected');

      // Subscribe to mark-price, tickers, and funding-rate for all symbols
      const markPriceArgs = syms.map(s => ({ channel: 'mark-price', instId: symbolToOkxInstId(s) }));
      const tickerArgs = syms.map(s => ({ channel: 'tickers', instId: symbolToOkxInstId(s) }));
      const fundingArgs = syms.map(s => ({ channel: 'funding-rate', instId: symbolToOkxInstId(s) }));

      const allArgs = [...markPriceArgs, ...tickerArgs, ...fundingArgs];
      if (allArgs.length > 0) {
        ws.send(JSON.stringify({ op: 'subscribe', args: allArgs }));
      }

      // Keepalive ping every 25s
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
    };

    ws.onmessage = (event) => {
      if (event.data === 'pong') return;
      try {
        const data = JSON.parse(event.data);
        if (!data.arg?.channel || !data.data) return;

        const channel = data.arg.channel as string;

        for (const item of data.data) {
          const instId = item.instId as string;
          const symbol = okxInstIdToSymbol(instId);
          if (!symbol) continue;

          if (channel === 'mark-price') {
            const price = parseFloat(item.markPx);
            if (!isNaN(price)) updatePrice(symbol, 'okx', price);
          }

          if (channel === 'tickers') {
            const last = parseFloat(item.last);
            const sodUtc0 = parseFloat(item.sodUtc0);
            const volCcy24h = parseFloat(item.volCcy24h);
            const high24h = parseFloat(item.high24h);
            const low24h = parseFloat(item.low24h);
            const change = sodUtc0 > 0 ? ((last - sodUtc0) / sodUtc0) * 100 : 0;
            updateTickerData(symbol, 'okx', {
              price: isNaN(last) ? null : last,
              priceChange24h: isNaN(change) ? null : change,
              volume24h: isNaN(volCcy24h) ? null : volCcy24h,
              high24h: isNaN(high24h) ? null : high24h,
              low24h: isNaN(low24h) ? null : low24h,
            });
          }

          if (channel === 'funding-rate') {
            const fundingRate = parseFloat(item.fundingRate);
            const nextFundingRate = parseFloat(item.nextFundingRate);
            const fundingTime = parseInt(item.fundingTime);
            if (!isNaN(fundingRate)) {
              updateFundingRate(symbol, 'okx', fundingRate, isNaN(fundingTime) ? undefined : fundingTime);
            }
            // Also update predicted next rate
            if (!isNaN(nextFundingRate)) {
              // Store as additional info (we'll use the main fundingRate for display)
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      setConnectionStatus('okx', 'disconnected');
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => { connect(); }, 3000);
    };
  }, [updatePrice, updateTickerData, updateFundingRate, setConnectionStatus]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    };
  }, [connect]);

  // Reconnect when symbols change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const args = symbols.flatMap(s => [
        { channel: 'mark-price', instId: symbolToOkxInstId(s) },
        { channel: 'tickers', instId: symbolToOkxInstId(s) },
        { channel: 'funding-rate', instId: symbolToOkxInstId(s) },
      ]);
      wsRef.current.send(JSON.stringify({ op: 'subscribe', args }));
    }
  }, [symbols.join(',')]);
}
