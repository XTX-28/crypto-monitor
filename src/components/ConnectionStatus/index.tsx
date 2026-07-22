import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import styles from './ConnectionStatus.module.css';

export function ConnectionStatus() {
  const connectionStatus = usePriceStore(s => s.connectionStatus);
  const { t } = useLocale();

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'connected': return styles.connected;
      case 'connecting': return styles.connecting;
      default: return styles.disconnected;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return t('connected');
      case 'connecting': return t('connecting');
      default: return t('disconnected');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <span className={`${styles.dot} ${getStatusClass(connectionStatus.binance)}`} />
        <span className={styles.exchange}>Binance</span>
        <span className={styles.status}>{getStatusText(connectionStatus.binance)}</span>
      </div>
      <div className={styles.item}>
        <span className={`${styles.dot} ${getStatusClass(connectionStatus.okx)}`} />
        <span className={styles.exchange}>OKX</span>
        <span className={styles.status}>{getStatusText(connectionStatus.okx)}</span>
      </div>
    </div>
  );
}
