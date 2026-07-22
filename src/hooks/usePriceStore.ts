import { create } from 'zustand';
import type { PairPriceState, PriceHistoryPoint, Alert, ToastMessage, AppSettings } from '../types';
import { DEFAULT_SYMBOLS, DEFAULT_SETTINGS } from '../utils/constants';
import { generateId } from '../utils/format';

interface PriceStore {
  // Symbols
  symbols: string[];
  selectedSymbol: string | null;
  
  // Prices per symbol per exchange
  prices: Record<string, PairPriceState>;
  
  // Price history for charts (per symbol)
  priceHistory: Record<string, PriceHistoryPoint[]>;
  
  // Alerts
  alerts: Alert[];
  
  // Toast messages
  toasts: ToastMessage[];
  
  // Settings
  settings: AppSettings;
  
  // Actions
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  updatePrice: (symbol: string, exchange: 'binance' | 'okx', price: number) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  resetAlert: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const MAX_HISTORY_POINTS = 500;

function initPrices(symbols: string[]): Record<string, PairPriceState> {
  const prices: Record<string, PairPriceState> = {};
  for (const symbol of symbols) {
    prices[symbol] = {
      binance: null,
      okx: null,
      binanceTimestamp: null,
      okxTimestamp: null,
    };
  }
  return prices;
}

function initHistory(symbols: string[]): Record<string, PriceHistoryPoint[]> {
  const history: Record<string, PriceHistoryPoint[]> = {};
  for (const symbol of symbols) {
    history[symbol] = [];
  }
  return history;
}

export const usePriceStore = create<PriceStore>((set, get) => ({
  symbols: [...DEFAULT_SYMBOLS],
  selectedSymbol: DEFAULT_SYMBOLS[0] || null,
  prices: initPrices(DEFAULT_SYMBOLS),
  priceHistory: initHistory(DEFAULT_SYMBOLS),
  alerts: [],
  toasts: [],
  settings: { ...DEFAULT_SETTINGS },

  addSymbol: (symbol: string) => {
    const { symbols, prices, priceHistory } = get();
    const upper = symbol.toUpperCase();
    if (symbols.includes(upper)) return;
    
    set({
      symbols: [...symbols, upper],
      prices: {
        ...prices,
        [upper]: { binance: null, okx: null, binanceTimestamp: null, okxTimestamp: null },
      },
      priceHistory: {
        ...priceHistory,
        [upper]: [],
      },
    });
  },

  removeSymbol: (symbol: string) => {
    const { symbols, prices, priceHistory, selectedSymbol } = get();
    const newSymbols = symbols.filter(s => s !== symbol);
    const newPrices = { ...prices };
    const newHistory = { ...priceHistory };
    delete newPrices[symbol];
    delete newHistory[symbol];
    
    set({
      symbols: newSymbols,
      prices: newPrices,
      priceHistory: newHistory,
      selectedSymbol: selectedSymbol === symbol ? (newSymbols[0] || null) : selectedSymbol,
    });
  },

  setSelectedSymbol: (symbol: string | null) => {
    set({ selectedSymbol: symbol });
  },

  updatePrice: (symbol: string, exchange: 'binance' | 'okx', price: number) => {
    const { prices, priceHistory } = get();
    const current = prices[symbol];
    if (!current) return;
    
    const now = Date.now();
    const updated = {
      ...current,
      [exchange]: price,
      [`${exchange}Timestamp`]: now,
    };
    
    // Update history
    const history = priceHistory[symbol] || [];
    const lastPoint = history[history.length - 1];
    const timeBucket = Math.floor(now / 1000); // 1-second buckets
    
    let newHistory: PriceHistoryPoint[];
    if (lastPoint && Math.floor(lastPoint.time / 1000) === timeBucket) {
      // Update existing bucket
      newHistory = [...history];
      newHistory[newHistory.length - 1] = {
        ...lastPoint,
        [exchange]: price,
      };
    } else {
      // New bucket
      newHistory = [
        ...history,
        {
          time: now,
          binance: exchange === 'binance' ? price : null,
          okx: exchange === 'okx' ? price : null,
        },
      ];
      // Keep max history points
      if (newHistory.length > MAX_HISTORY_POINTS) {
        newHistory = newHistory.slice(-MAX_HISTORY_POINTS);
      }
    }
    
    set({
      prices: { ...prices, [symbol]: updated },
      priceHistory: { ...priceHistory, [symbol]: newHistory },
    });
  },

  addAlert: (alert) => {
    const { alerts } = get();
    set({ alerts: [...alerts, { ...alert, id: generateId(), triggered: false }] });
  },

  removeAlert: (id: string) => {
    const { alerts } = get();
    set({ alerts: alerts.filter(a => a.id !== id) });
  },

  toggleAlert: (id: string) => {
    const { alerts } = get();
    set({
      alerts: alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a),
    });
  },

  resetAlert: (id: string) => {
    const { alerts } = get();
    set({
      alerts: alerts.map(a => a.id === id ? { ...a, triggered: false } : a),
    });
  },

  addToast: (toast) => {
    const { toasts } = get();
    const newToast: ToastMessage = {
      ...toast,
      id: generateId(),
      timestamp: Date.now(),
    };
    set({ toasts: [...toasts, newToast] });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeToast(newToast.id);
    }, 5000);
  },

  removeToast: (id: string) => {
    const { toasts } = get();
    set({ toasts: toasts.filter(t => t.id !== id) });
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
  },
}));
