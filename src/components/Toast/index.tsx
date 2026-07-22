import { usePriceStore } from '../../hooks/usePriceStore';
import styles from './Toast.module.css';

export function Toast() {
  const toasts = usePriceStore(s => s.toasts);
  const removeToast = usePriceStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.content}>
            <div className={styles.title}>{toast.title}</div>
            <div className={styles.body}>{toast.body}</div>
          </div>
          <button className={styles.close} onClick={() => removeToast(toast.id)}>
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
