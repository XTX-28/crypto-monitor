export type Exchange = 'binance' | 'okx';

export interface PriceData {
  symbol: string;
  exchange: Exchange;
  price: number;
  timestamp: number;
}

export interface PairPriceState {
  binance: number | null;
  okx: number | null;
  binanceTimestamp: number | null;
  okxTimestamp: number | null;
}

export interface PriceHistoryPoint {
  time: number;
  binance: number | null;
  okx: number | null;
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'upper' | 'lower';
  price: number;
  enabled: boolean;
  triggered: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success';
  timestamp: number;
}

export interface AppSettings {
  volatilityThreshold: number; // 波动提醒百分比阈值
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}
