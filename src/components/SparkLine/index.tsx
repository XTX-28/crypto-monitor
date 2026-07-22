import { useMemo } from 'react';
import type { PriceHistoryPoint } from '../../types';
import styles from './SparkLine.module.css';

interface SparkLineProps {
  data: PriceHistoryPoint[];
  exchange: 'binance' | 'okx';
  width?: number;
  height?: number;
}

export function SparkLine({ data, exchange, width = 80, height = 30 }: SparkLineProps) {
  const pathD = useMemo(() => {
    if (data.length < 2) return '';
    const recent = data.slice(-30); // last 30 points
    const values = recent.map(p => p[exchange]).filter((v): v is number => v !== null);
    if (values.length < 2) return '';

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / (values.length - 1);

    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    return `M${points.join('L')}`;
  }, [data, exchange, width, height]);

  const isUp = useMemo(() => {
    const recent = data.slice(-30);
    const values = recent.map(p => p[exchange]).filter((v): v is number => v !== null);
    if (values.length < 2) return true;
    return values[values.length - 1] >= values[0];
  }, [data, exchange]);

  if (!pathD) return <div className={styles.empty} />;

  return (
    <svg width={width} height={height} className={styles.svg}>
      <path
        d={pathD}
        fill="none"
        stroke={isUp ? '#0ecb81' : '#f6465d'}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
