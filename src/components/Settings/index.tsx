import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import styles from './Settings.module.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const settings = usePriceStore(s => s.settings);
  const updateSettings = usePriceStore(s => s.updateSettings);
  const { t, setLanguage } = useLocale();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('settings')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>{t('volatilityThreshold')}</label>
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
          <p className={styles.hint}>{t('volatilityHint')}</p>
        </div>

        <div className={styles.section}>
          <label className={styles.toggleRow}>
            <span className={styles.label}>{t('browserNotification')}</span>
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
            <span className={styles.label}>{t('soundAlert')}</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={e => updateSettings({ soundEnabled: e.target.checked })}
              className={styles.checkbox}
            />
            <span className={styles.toggle}></span>
          </label>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>{t('language')}</label>
          <div className={styles.langGroup}>
            <button
              className={`${styles.langBtn} ${settings.language === 'zh' ? styles.activeLang : ''}`}
              onClick={() => setLanguage('zh')}
            >
              中文
            </button>
            <button
              className={`${styles.langBtn} ${settings.language === 'en' ? styles.activeLang : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
