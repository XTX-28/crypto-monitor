import { useEffect, useRef, useCallback } from 'react';
import { usePriceStore } from './usePriceStore';
import { BINANCE_WS_URL, symbolToBinanceStream } from '../utils/constants';

export function useBinanceWS() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const symbols = usePriceStore(s => s.symbols);
  const updatePrice = usePriceStore(s => s.updatePrice);
  const symbolsRef = useRef(symbols);

  // Keep symbols ref up to date
  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const streams = symbolsRef.current.map(symbolToBinanceStream);
    if (streams.length === 0) return;

    const url = `${BINANCE_WS_URL}?streams=${streams.join('/')}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.data && data.data.p) {
          const symbol = data.data.s; // e.g., "BTCUSDT"
          const price = parseFloat(data.data.p);
          if (symbol && !isNaN(price)) {
            updatePrice(symbol, 'binance', price);
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      // Will trigger onclose
    };

    ws.onclose = () => {
      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    return () => {
      ws.close();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [updatePrice]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [connect]);

  // Reconnect when symbols change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
    };
  }, [symbols.join(','), connect]);
}
