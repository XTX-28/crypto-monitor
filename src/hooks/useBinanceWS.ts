import { useEffect, useRef, useCallback } from 'react';
import { usePriceStore } from './usePriceStore';
import { BINANCE_WS_URL, symbolToBinanceStream, symbolToBinanceTickerStream } from '../utils/constants';

export function useBinanceWS() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const symbols = usePriceStore(s => s.symbols);
  const updatePrice = usePriceStore(s => s.updatePrice);
  const updateTickerData = usePriceStore(s => s.updateTickerData);
  const setConnectionStatus = usePriceStore(s => s.setConnectionStatus);
  const symbolsRef = useRef(symbols);

  useEffect(() => { symbolsRef.current = symbols; }, [symbols]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const syms = symbolsRef.current;
    if (syms.length === 0) return;

    // Combine markPrice and ticker streams
    const markPriceStreams = syms.map(symbolToBinanceStream);
    const tickerStreams = syms.map(symbolToBinanceTickerStream);
    const allStreams = [...markPriceStreams, ...tickerStreams];
    const url = `${BINANCE_WS_URL}?streams=${allStreams.join('/')}`;

    setConnectionStatus('binance', 'connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('binance', 'connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const streamData = data.data;
        if (!streamData) return;

        // Mark price stream (has 'p' field)
        if (streamData.p && streamData.s) {
          const symbol = streamData.s as string;
          const price = parseFloat(streamData.p);
          if (!isNaN(price)) {
            updatePrice(symbol, 'binance', price);
          }
        }

        // Ticker stream (has 'P' for price change % and 'q' for quote volume)
        if (streamData.P !== undefined && streamData.s) {
          const symbol = streamData.s as string;
          const priceChange = parseFloat(streamData.P);
          const volume = parseFloat(streamData.q);
          const high = parseFloat(streamData.h);
          const low = parseFloat(streamData.l);
          updateTickerData(symbol, 'binance', {
            priceChange24h: isNaN(priceChange) ? null : priceChange,
            volume24h: isNaN(volume) ? null : volume,
            high24h: isNaN(high) ? null : high,
            low24h: isNaN(low) ? null : low,
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      setConnectionStatus('binance', 'disconnected');
      reconnectTimerRef.current = setTimeout(() => { connect(); }, 3000);
    };
  }, [updatePrice, updateTickerData, setConnectionStatus]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connect]);

  // Reconnect when symbols change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [symbols.join(','), connect]);
}
