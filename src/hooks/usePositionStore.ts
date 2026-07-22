import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SimPosition } from '../types';
import { generateId } from '../utils/format';

interface OpenPositionParams {
  symbol: string;
  exchange: 'binance' | 'okx';
  direction: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  leverage: number;
}

interface PositionStore {
  positions: SimPosition[];
  openPosition: (params: OpenPositionParams) => void;
  closePosition: (id: string, price: number, reason: 'manual' | 'tp' | 'sl') => void;
  updateTP: (id: string, price: number | null) => void;
  updateSL: (id: string, price: number | null) => void;
  clearHistory: () => void;
}

export const usePositionStore = create<PositionStore>()(
  persist(
    (set, get) => ({
      positions: [],

      openPosition: (params) => {
        const { positions } = get();
        const margin = params.quantity / params.leverage;
        const newPosition: SimPosition = {
          id: generateId(),
          symbol: params.symbol,
          exchange: params.exchange,
          direction: params.direction,
          entryPrice: params.entryPrice,
          quantity: params.quantity,
          leverage: params.leverage,
          margin,
          takeProfit: null,
          stopLoss: null,
          openTime: Date.now(),
          status: 'open',
        };
        set({ positions: [...positions, newPosition] });
      },

      closePosition: (id, price, reason) => {
        const { positions } = get();
        set({
          positions: positions.map(p => {
            if (p.id !== id) return p;
            const pnl = p.direction === 'long'
              ? (price - p.entryPrice) * p.quantity * p.leverage / p.entryPrice
              : (p.entryPrice - price) * p.quantity * p.leverage / p.entryPrice;
            return {
              ...p,
              status: 'closed' as const,
              closePrice: price,
              closeTime: Date.now(),
              realizedPnl: pnl,
              closeReason: reason,
            };
          }),
        });
      },

      updateTP: (id, price) => {
        const { positions } = get();
        set({
          positions: positions.map(p =>
            p.id === id ? { ...p, takeProfit: price } : p
          ),
        });
      },

      updateSL: (id, price) => {
        const { positions } = get();
        set({
          positions: positions.map(p =>
            p.id === id ? { ...p, stopLoss: price } : p
          ),
        });
      },

      clearHistory: () => {
        const { positions } = get();
        set({ positions: positions.filter(p => p.status === 'open') });
      },
    }),
    {
      name: 'crypto-monitor-positions',
    }
  )
);
