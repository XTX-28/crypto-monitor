import { useEffect, useRef, useCallback } from 'react';
import { usePriceStore } from './usePriceStore';
import { OKX_WS_URL, symbolToOkxInstId } from '../utils/constants';

export function useOKXWS() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const symbols = usePriceStore(s => s.symbols);
  const updatePrice = usePriceStore(s => s.updatePrice);
  const symbolsRef = useRef(symbols);

  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const ws = new WebSocket(OKX_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // Subscribe to mark-price for all symbols
      const args = symbolsRef.current.map(symbol => ({
        channel: 'mark-price',
        instId: symbolToOkxInstId(symbol),
      }));

      if (args.length > 0) {
        ws.send(JSON.stringify({ op: 'subscribe', args }));
      }

      // OKX requires ping every 25s to keep connection alive
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      if (event.data === 'pong') return;
      
      try {
        const data = JSON.parse(event.data);
        if (data.arg?.channel === 'mark-price' && data.data) {
          for (const item of data.data) {
            // instId format: "BTC-USDT-SWAP"
            const instId = item.instId as string;
            const price = parseFloat(item.markPx);
            
            // Convert back to symbol format: BTC-USDT-SWAP -> BTCUSDT
            const symbol = instId.replace(/-USDT-SWAP$/, 'USDT').replace(/-/g, '');
            
            if (!isNaN(price) && symbol) {
              updatePrice(symbol, 'okx', price);
            }
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
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
      }
      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [updatePrice]);

  useEffect(() => {
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
      }
    };
  }, [connect]);

  // Reconnect when symbols change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Unsubscribe all, then resubscribe
      const args = symbols.map(symbol => ({
        channel: 'mark-price',
        instId: symbolToOkxInstId(symbol),
      }));
      
      wsRef.current.send(JSON.stringify({ op: 'unsubscribe', args }));
      if (args.length > 0) {
        wsRef.current.send(JSON.stringify({ op: 'subscribe', args }));
      }
    }
  }, [symbols.join(',')]);
}
