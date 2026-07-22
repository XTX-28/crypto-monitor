import type { AppSettings } from '../types';

export const BINANCE_WS_URL = 'wss://fstream.binance.com/stream';
export const OKX_WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';
export const BINANCE_REST_BASE = 'https://fapi.binance.com';
export const OKX_REST_BASE = 'https://www.okx.com';

export const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
];

export const POPULAR_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT',
  'MATICUSDT', 'LTCUSDT', 'ATOMUSDT', 'NEARUSDT', 'APTUSDT',
  'ARBUSDT', 'OPUSDT', 'INJUSDT', 'SUIUSDT', 'SEIUSDT',
  'TRXUSDT', 'FILUSDT', 'AAVEUSDT', 'UNIUSDT', 'MKRUSDT',
];

export const ALL_COLUMNS: import('../types').ColumnKey[] = ['volume24h', 'fundingRate', 'openInterest', 'trend'];

export const DEFAULT_SETTINGS: AppSettings = {
  volatilityThreshold: 1.0,
  soundEnabled: true,
  notificationsEnabled: true,
  language: 'zh',
  viewMode: 'table',
  fullscreen: false,
  theme: 'dark',
  visibleColumns: [...ALL_COLUMNS],
};

export function symbolToOkxInstId(symbol: string): string {
  const match = symbol.match(/^([A-Z]+)(USDT)$/);
  if (match) {
    return `${match[1]}-USDT-SWAP`;
  }
  return `${symbol}-SWAP`;
}

export function okxInstIdToSymbol(instId: string): string {
  return instId.replace(/-USDT-SWAP$/, 'USDT').replace(/-/g, '');
}

export function symbolToBinanceStream(symbol: string): string {
  return `${symbol.toLowerCase()}@markPrice@1s`;
}

export function symbolToBinanceTickerStream(symbol: string): string {
  return `${symbol.toLowerCase()}@ticker`;
}
