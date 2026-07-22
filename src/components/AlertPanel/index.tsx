import { useState } from 'react';
import { usePriceStore } from '../../hooks/usePriceStore';
import { formatPrice } from '../../utils/format';
import styles from './AlertPanel.module.css';

export function AlertPanel() {
  const alerts = usePriceStore(s => s.alerts);
  const symbols = usePriceStore(s => s.symbols);
  const addAlert = usePriceStore(s => s.addAlert);
  const removeAlert = usePriceStore(s => s.removeAlert);
  const toggleAlert = usePriceStore(s => s.toggleAlert);

  const [symbol, setSymbol] = useState(symbols[0] || '');
  const [type, setType] = useState<'upper' | 'lower'>('upper');
  const [price, setPrice] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!symbol || isNaN(priceNum)) return;

    addAlert({ symbol, type, price: priceNum, enabled: true });
    setPrice('');
  };

  const symbolAlerts = alerts.filter(a => a.symbol === symbol);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>价格警报</h3>

      <form onSubmit={handleAdd} className={styles.form}>
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className={styles.select}
        >
          {symbols.map(s => (
            <option key={s} value={s}>{s.replace('USDT', '')}/USDT</option>
          ))}
        </select>

        <select
          value={type}
          onChange={e => setType(e.target.value as 'upper' | 'lower')}
          className={styles.select}
        >
          <option value="upper">突破上限</option>
          <option value="lower">跌破下限</option>
        </select>

        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="目标价格"
          className={styles.input}
          step="any"
        />

        <button type="submit" className={styles.addBtn}>添加</button>
      </form>

      <div className={styles.list}>
        {symbolAlerts.length === 0 ? (
          <div className={styles.empty}>暂无警报</div>
        ) : (
          symbolAlerts.map(alert => (
            <div key={alert.id} className={`${styles.alertItem} ${alert.triggered ? styles.triggered : ''}`}>
              <div className={styles.alertInfo}>
                <span className={`${styles.badge} ${alert.type === 'upper' ? styles.upperBadge : styles.lowerBadge}`}>
                  {alert.type === 'upper' ? '上限' : '下限'}
                </span>
                <span className={styles.alertPrice}>${formatPrice(alert.price)}</span>
                {alert.triggered && <span className={styles.triggeredLabel}>已触发</span>}
              </div>
              <div className={styles.alertActions}>
                <button
                  className={`${styles.toggleBtn} ${alert.enabled ? styles.enabledBtn : ''}`}
                  onClick={() => toggleAlert(alert.id)}
                >
                  {alert.enabled ? '已启用' : '已禁用'}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeAlert(alert.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
