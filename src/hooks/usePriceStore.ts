import { create } from 'zustand';
import type { PairPriceState, ExchangeMarketData, PriceHistoryPoint, FundingRateHistoryPoint, Alert, ToastMessage, AppSettings, WsConnectionStatus } from '../types';
import { DEFAULT_SYMBOLS, DEFAULT_SETTINGS } from '../utils/constants';
import { generateId } from '../utils/format';

const emptyMarketData: ExchangeMarketData = {
  price: null,
  fundingRate: null,
  nextFundingTime: null,
  volume24h: null,
  priceChange24h: null,
  openInterest: null,
  high24h: null,
  low24h: null,
  timestamp: null,
};

interface PriceStore {
  symbols: string[];
  selectedSymbol: string | null;
  prices: Record<string, PairPriceState>;
  priceHistory: Record<string, PriceHistoryPoint[]>;
  fundingRateHistory: Record<string, FundingRateHistoryPoint[]>;
  alerts: Alert[];
  toasts: ToastMessage[];
  settings: AppSettings;
  connectionStatus: { binance: WsConnectionStatus; okx: WsConnectionStatus };

  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  updatePrice: (symbol: string, exchange: 'binance' | 'okx', price: number) => void;
  updateTickerData: (symbol: string, exchange: 'binance' | 'okx', data: Partial<ExchangeMarketData>) => void;
  updateFundingRate: (symbol: string, exchange: 'binance' | 'okx', rate: number, nextTime?: number) => void;
  updateOpenInterest: (symbol: string, exchange: 'binance' | 'okx', oi: number) => void;
  addFundingRateHistory: (symbol: string, binance: number | null, okx: number | null) => void;
  setConnectionStatus: (exchange: 'binance' | 'okx', status: WsConnectionStatus) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  resetAlert: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  reorderSymbols: (fromIndex: number, toIndex: number) => void;
}

const MAX_HISTORY_POINTS = 500;
const MAX_FUNDING_HISTORY = 200;

function initPrices(symbols: string[]): Record<string, PairPriceState> {
  const prices: Record<string, PairPriceState> = {};
  for (const symbol of symbols) {
    prices[symbol] = {
      binance: { ...emptyMarketData },
      okx: { ...emptyMarketData },
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

function initFundingHistory(symbols: string[]): Record<string, FundingRateHistoryPoint[]> {
  const history: Record<string, FundingRateHistoryPoint[]> = {};
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
  fundingRateHistory: initFundingHistory(DEFAULT_SYMBOLS),
  alerts: [],
  toasts: [],
  settings: { ...DEFAULT_SETTINGS },
  connectionStatus: { binance: 'connecting', okx: 'connecting' },

  addSymbol: (symbol: string) => {
    const { symbols, prices, priceHistory, fundingRateHistory } = get();
    const upper = symbol.toUpperCase();
    if (symbols.includes(upper)) return;
    set({
      symbols: [...symbols, upper],
      prices: { ...prices, [upper]: { binance: { ...emptyMarketData }, okx: { ...emptyMarketData } } },
      priceHistory: { ...priceHistory, [upper]: [] },
      fundingRateHistory: { ...fundingRateHistory, [upper]: [] },
    });
  },

  removeSymbol: (symbol: string) => {
    const { symbols, prices, priceHistory, fundingRateHistory, selectedSymbol } = get();
    const newSymbols = symbols.filter(s => s !== symbol);
    const newPrices = { ...prices };
    const newHistory = { ...priceHistory };
    const newFundingHistory = { ...fundingRateHistory };
    delete newPrices[symbol];
    delete newHistory[symbol];
    delete newFundingHistory[symbol];
    set({
      symbols: newSymbols,
      prices: newPrices,
      priceHistory: newHistory,
      fundingRateHistory: newFundingHistory,
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
      [exchange]: { ...current[exchange], price, timestamp: now },
    };
    // Update price history
    const history = priceHistory[symbol] || [];
    const lastPoint = history[history.length - 1];
    const timeBucket = Math.floor(now / 1000);
    let newHistory: PriceHistoryPoint[];
    if (lastPoint && Math.floor(lastPoint.time / 1000) === timeBucket) {
      newHistory = [...history];
      newHistory[newHistory.length - 1] = { ...lastPoint, [exchange]: price };
    } else {
      newHistory = [...history, { time: now, binance: exchange === 'binance' ? price : null, okx: exchange === 'okx' ? price : null }];
      if (newHistory.length > MAX_HISTORY_POINTS) {
        newHistory = newHistory.slice(-MAX_HISTORY_POINTS);
      }
    }
    set({ prices: { ...prices, [symbol]: updated }, priceHistory: { ...priceHistory, [symbol]: newHistory } });
  },

  updateTickerData: (symbol: string, exchange: 'binance' | 'okx', data: Partial<ExchangeMarketData>) => {
    const { prices } = get();
    const current = prices[symbol];
    if (!current) return;
    set({
      prices: {
        ...prices,
        [symbol]: { ...current, [exchange]: { ...current[exchange], ...data } },
      },
    });
  },

  updateFundingRate: (symbol: string, exchange: 'binance' | 'okx', rate: number, nextTime?: number) => {
    const { prices } = get();
    const current = prices[symbol];
    if (!current) return;
    set({
      prices: {
        ...prices,
        [symbol]: {
          ...current,
          [exchange]: {
            ...current[exchange],
            fundingRate: rate,
            nextFundingTime: nextTime ?? current[exchange].nextFundingTime,
          },
        },
      },
    });
  },

  updateOpenInterest: (symbol: string, exchange: 'binance' | 'okx', oi: number) => {
    const { prices } = get();
    const current = prices[symbol];
    if (!current) return;
    set({
      prices: {
        ...prices,
        [symbol]: { ...current, [exchange]: { ...current[exchange], openInterest: oi } },
      },
    });
  },

  addFundingRateHistory: (symbol: string, binance: number | null, okx: number | null) => {
    const { fundingRateHistory } = get();
    const history = fundingRateHistory[symbol] || [];
    const newHistory = [...history, { time: Date.now(), binance, okx }];
    if (newHistory.length > MAX_FUNDING_HISTORY) {
      set({ fundingRateHistory: { ...fundingRateHistory, [symbol]: newHistory.slice(-MAX_FUNDING_HISTORY) } });
    } else {
      set({ fundingRateHistory: { ...fundingRateHistory, [symbol]: newHistory } });
    }
  },

  setConnectionStatus: (exchange: 'binance' | 'okx', status: WsConnectionStatus) => {
    set({ connectionStatus: { ...get().connectionStatus, [exchange]: status } });
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
    set({ alerts: alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a) });
  },

  resetAlert: (id: string) => {
    const { alerts } = get();
    set({ alerts: alerts.map(a => a.id === id ? { ...a, triggered: false } : a) });
  },

  addToast: (toast) => {
    const { toasts } = get();
    const newToast: ToastMessage = { ...toast, id: generateId(), timestamp: Date.now() };
    set({ toasts: [...toasts, newToast] });
    setTimeout(() => { get().removeToast(newToast.id); }, 5000);
  },

  removeToast: (id: string) => {
    const { toasts } = get();
    set({ toasts: toasts.filter(t => t.id !== id) });
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
  },

  reorderSymbols: (fromIndex: number, toIndex: number) => {
    const { symbols } = get();
    const newSymbols = [...symbols];
    const [removed] = newSymbols.splice(fromIndex, 1);
    newSymbols.splice(toIndex, 0, removed);
    set({ symbols: newSymbols });
  },
}));
