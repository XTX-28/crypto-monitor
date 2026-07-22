import { usePriceStore } from '../../hooks/usePriceStore';
import { useLocale } from '../../i18n/useLocale';
import { ALL_COLUMNS } from '../../utils/constants';
import type { ColumnKey } from '../../types';
import styles from './Settings.module.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLUMN_LABELS: Record<ColumnKey, { zh: string; en: string }> = {
  volume24h: { zh: '24h 成交额', en: '24h Volume' },
  fundingRate: { zh: '资金费率', en: 'Funding Rate' },
  openInterest: { zh: '持仓量', en: 'Open Interest' },
  trend: { zh: '走势图', en: 'Trend Chart' },
};

export function Settings({ isOpen, onClose }: SettingsProps) {
  const settings = usePriceStore(s => s.settings);
  const updateSettings = usePriceStore(s => s.updateSettings);
  const { t, language, setLanguage } = useLocale();

  if (!isOpen) return null;

  const toggleColumn = (col: ColumnKey) => {
    const current = settings.visibleColumns;
    const next = current.includes(col)
      ? current.filter(c => c !== col)
      : [...current, col];
    updateSettings({ visibleColumns: next });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('settings')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Theme toggle */}
        <div className={styles.section}>
          <label className={styles.label}>{t('theme')}</label>
          <div className={styles.langGroup}>
            <button
              className={`${styles.langBtn} ${settings.theme === 'dark' ? styles.activeLang : ''}`}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              {t('darkMode')}
            </button>
            <button
              className={`${styles.langBtn} ${settings.theme === 'light' ? styles.activeLang : ''}`}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              {t('lightMode')}
            </button>
          </div>
        </div>

        {/* Language */}
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

        {/* Column visibility */}
        <div className={styles.section}>
          <label className={styles.label}>{t('columnSettings')}</label>
          <div className={styles.columnList}>
            {ALL_COLUMNS.map(col => (
              <label key={col} className={styles.columnItem}>
                <input
                  type="checkbox"
                  checked={settings.visibleColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className={styles.checkbox}
                />
                <span className={styles.toggle}></span>
                <span>{COLUMN_LABELS[col][language]}</span>
              </label>
            ))}
          </div>
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
      </div>
    </div>
  );
}
