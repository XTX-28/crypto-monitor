export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '--';
  if (price >= 10000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 100) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  } else if (price >= 0.01) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 5, maximumFractionDigits: 5 });
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 });
  }
}

export function formatPercent(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return '--';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatFundingRate(rate: number | null): string {
  if (rate === null || rate === undefined) return '--';
  return (rate * 100).toFixed(4) + '%';
}

export function formatVolume(volume: number | null): string {
  if (volume === null || volume === undefined) return '--';
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
  return volume.toFixed(2);
}

export function formatSpread(binancePrice: number | null, okxPrice: number | null): { absolute: string; percent: string; percentValue: number } {
  if (binancePrice === null || okxPrice === null) {
    return { absolute: '--', percent: '--', percentValue: 0 };
  }
  const diff = binancePrice - okxPrice;
  const avgPrice = (binancePrice + okxPrice) / 2;
  const percent = avgPrice > 0 ? (diff / avgPrice) * 100 : 0;
  return {
    absolute: formatPrice(Math.abs(diff)),
    percent: formatPercent(percent, 3),
    percentValue: percent,
  };
}

export function formatCountdown(timestamp: number): string {
  const diff = timestamp - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour12: false });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function calcAnnualizedRate(rateDiff: number): number {
  // 3 settlements per day, 365 days
  return rateDiff * 3 * 365 * 100;
}
