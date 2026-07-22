import { useState } from 'react';
import { usePriceStore } from '../hooks/usePriceStore';
import { useLocale } from '../i18n/useLocale';
import { formatPrice } from '../utils/format';
import styles from './AlertsTab.module.css';

export function AlertsTab() {
  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const alerts = usePriceStore(s => s.alerts);
  const toasts = usePriceStore(s => s.toasts);
  const addAlert = usePriceStore(s => s.addAlert);
  const removeAlert = usePriceStore(s => s.removeAlert);
  const toggleAlert = usePriceStore(s => s.toggleAlert);

  const [showForm, setShowForm] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0] || '');
  const [alertType, setAlertType] = useState<'upper' | 'lower'>('upper');
  const [targetPrice, setTargetPrice] = useState('');

  const handleAddAlert = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || !selectedSymbol) return;
    addAlert({
      symbol: selectedSymbol,
      type: alertType,
      price,
      enabled: true,
    });
    setTargetPrice('');
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('priceAlerts')}</h2>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '×' : '+'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('symbol')}</label>
            <select
              className={styles.select}
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
            >
              {symbols.map(s => (
                <option key={s} value={s}>{s.replace('USDT', '')}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('direction')}</label>
            <div className={styles.radioGroup}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  checked={alertType === 'upper'}
                  onChange={() => setAlertType('upper')}
                />
                {t('upperLimit')}
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  checked={alertType === 'lower'}
                  onChange={() => setAlertType('lower')}
                />
                {t('lowerLimit')}
              </label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('targetPrice')}</label>
            <input
              type="number"
              className={styles.input}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <button className={styles.submitBtn} onClick={handleAddAlert}>
            {t('add')}
          </button>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('priceAlerts')}</h3>
        <div className={styles.alertList}>
          {alerts.length === 0 ? (
            <div className={styles.empty}>{t('noAlerts')}</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={styles.alertCard}>
                <div className={styles.alertInfo}>
                  <span className={styles.alertSymbol}>{alert.symbol.replace('USDT', '')}</span>
                  <span className={styles.alertCondition}>
                    {alert.type === 'upper' ? '>' : '<'} {formatPrice(alert.price)}
                  </span>
                  <span className={`${styles.alertStatus} ${alert.enabled ? styles.enabled : styles.disabled}`}>
                    {alert.enabled ? t('enabled') : t('disabled')}
                  </span>
                </div>
                <div className={styles.alertActions}>
                  <button
                    className={styles.toggleBtn}
                    onClick={() => toggleAlert(alert.id)}
                  >
                    {alert.enabled ? '⏸' : '▶'}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeAlert(alert.id)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>提醒记录</h3>
        <div className={styles.toastList}>
          {toasts.length === 0 ? (
            <div className={styles.empty}>暂无记录</div>
          ) : (
            toasts.slice(-10).reverse().map(toast => (
              <div key={toast.id} className={styles.toastItem}>
                <span className={styles.toastTime}>
                  {new Date(toast.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                </span>
                <span className={styles.toastTitle}>{toast.title}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
