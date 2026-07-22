import { usePriceStore } from '../../hooks/usePriceStore';
import styles from './Settings.module.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const settings = usePriceStore(s => s.settings);
  const updateSettings = usePriceStore(s => s.updateSettings);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>设置</h3>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>波动提醒阈值 (%)</label>
          <div className={styles.row}>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={settings.volatilityThreshold}
              onChange={e => updateSettings({ volatilityThreshold: parseFloat(e.target.value) })}
              className={styles.slider}
            />
            <span className={styles.value}>{settings.volatilityThreshold.toFixed(1)}%</span>
          </div>
          <p className={styles.hint}>1分钟内价格变动超过此百分比时触发提醒</p>
        </div>

        <div className={styles.section}>
          <label className={styles.toggleRow}>
            <span className={styles.label}>浏览器通知</span>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={e => updateSettings({ notificationsEnabled: e.target.checked })}
              className={styles.checkbox}
            />
            <span className={styles.toggle}></span>
          </label>
        </div>

        <div className={styles.section}>
          <label className={styles.toggleRow}>
            <span className={styles.label}>声音提醒</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => updateSettings({ soundEnabled: e.target.checked })}
              className={styles.checkbox}
            />
            <span className={styles.toggle}></span>
          </label>
        </div>
      </div>
    </div>
  );
}
