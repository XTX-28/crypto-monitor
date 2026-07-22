export function formatPrice(price: number | null, symbol?: string): string {
  if (price === null || price === undefined) return '--';
  
  // Determine decimal places based on price magnitude
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  }
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
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
    percent: formatPercent(percent),
    percentValue: percent,
  };
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour12: false });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
