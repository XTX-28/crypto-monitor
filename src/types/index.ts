export type Exchange = 'binance' | 'okx';

export interface ExchangeMarketData {
  price: number | null;
  fundingRate: number | null;
  nextFundingTime: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  openInterest: number | null;
  high24h: number | null;
  low24h: number | null;
  timestamp: number | null;
}

export interface PairPriceState {
  binance: ExchangeMarketData;
  okx: ExchangeMarketData;
}

export interface PriceHistoryPoint {
  time: number;
  binance: number | null;
  okx: number | null;
}

export interface FundingRateHistoryPoint {
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

export type ColumnKey = 'volume24h' | 'fundingRate' | 'openInterest' | 'trend';

export interface AppSettings {
  volatilityThreshold: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  language: 'zh' | 'en';
  viewMode: 'table' | 'card';
  fullscreen: boolean;
  theme: 'dark' | 'light';
  visibleColumns: ColumnKey[];
}

export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface ConnectionState {
  binance: WsConnectionStatus;
  okx: WsConnectionStatus;
}

export type SortField = 'symbol' | 'price' | 'spread' | 'change24h' | 'volume24h' | 'fundingRate' | 'openInterest';
export type SortDirection = 'asc' | 'desc';

export interface SimPosition {
  id: string;
  symbol: string;
  exchange: 'binance' | 'okx';
  direction: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  leverage: number;
  margin: number;
  takeProfit: number | null;
  stopLoss: number | null;
  openTime: number;
  status: 'open' | 'closed';
  closePrice?: number;
  closeTime?: number;
  realizedPnl?: number;
  closeReason?: 'manual' | 'tp' | 'sl';
}
