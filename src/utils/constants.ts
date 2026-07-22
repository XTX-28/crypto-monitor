import type { AppSettings } from '../types';

export const BINANCE_WS_URL = 'wss://fstream.binance.com/stream';
export const OKX_WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';

export const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
];

export const POPULAR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'LTCUSDT',
  'ATOMUSDT',
  'NEARUSDT',
  'APTUSDT',
  'ARBUSDT',
  'OPUSDT',
  'INJUSDT',
  'SUIUSDT',
  'SEIUSDT',
];

export const DEFAULT_SETTINGS: AppSettings = {
  volatilityThreshold: 1.0,
  soundEnabled: true,
  notificationsEnabled: true,
};

// OKX uses different format: BTC-USDT-SWAP
export function symbolToOkxInstId(symbol: string): string {
  // BTCUSDT -> BTC-USDT-SWAP
  const match = symbol.match(/^([A-Z]+)(USDT)$/);
  if (match) {
    return `${match[1]}-USDT-SWAP`;
  }
  return `${symbol}-SWAP`;
}

// Binance lowercase stream name
export function symbolToBinanceStream(symbol: string): string {
  return `${symbol.toLowerCase()}@markPrice@1s`;
}
