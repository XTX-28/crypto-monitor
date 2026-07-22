import { useState } from 'react';
import { usePriceStore } from '../hooks/usePriceStore';
import { useLocale } from '../i18n/useLocale';
import { ALL_COLUMNS } from '../utils/constants';
import type { ColumnKey } from '../types';
import styles from './ProfileTab.module.css';

const COLUMN_LABELS: Record<ColumnKey, { zh: string; en: string }> = {
  volume24h: { zh: '24h 成交额', en: '24h Volume' },
  fundingRate: { zh: '资金费率', en: 'Funding Rate' },
  openInterest: { zh: '持仓量', en: 'Open Interest' },
  trend: { zh: '走势图', en: 'Trend Chart' },
};

export function ProfileTab() {
  const { t, language, setLanguage } = useLocale();
  const settings = usePriceStore(s => s.settings);
  const updateSettings = usePriceStore(s => s.updateSettings);

  const [showColumns, setShowColumns] = useState(false);

  const handleThemeChange = (theme: 'dark' | 'light') => {
    updateSettings({ theme });
  };

  const handleToggleColumn = (col: ColumnKey) => {
    const current = settings.visibleColumns;
    const newCols = current.includes(col)
      ? current.filter(c => c !== col)
      : [...current, col];
    updateSettings({ visibleColumns: newCols });
  };

  const handleInstall = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    alert('提示：在浏览器菜单中选择"添加到主屏幕"即可安装应用');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('settings')}</h2>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('theme')}</h3>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${settings.theme === 'dark' ? styles.activeToggle : ''}`}
            onClick={() => handleThemeChange('dark')}
          >{t('darkMode')}</button>
          <button
            className={`${styles.toggleBtn} ${settings.theme === 'light' ? styles.activeToggle : ''}`}
            onClick={() => handleThemeChange('light')}
          >{t('lightMode')}</button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('language')}</h3>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${language === 'zh' ? styles.activeToggle : ''}`}
            onClick={() => setLanguage('zh')}
          >中文</button>
          <button
            className={`${styles.toggleBtn} ${language === 'en' ? styles.activeToggle : ''}`}
            onClick={() => setLanguage('en')}
          >English</button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('columnSettings')}</h3>
        <button
          className={styles.expandBtn}
          onClick={() => setShowColumns(!showColumns)}
        >
          {showColumns ? '收起' : '展开'}
        </button>
        {showColumns && (
          <div className={styles.columnList}>
            {ALL_COLUMNS.map(col => (
              <label key={col} className={styles.columnItem}>
                <input
                  type="checkbox"
                  checked={settings.visibleColumns.includes(col)}
                  onChange={() => handleToggleColumn(col)}
                />
                <span>{COLUMN_LABELS[col][language]}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>通知</h3>
        <div className={styles.settingRow}>
          <span>{t('browserNotification')}</span>
          <button
            className={`${styles.switchBtn} ${settings.notificationsEnabled ? styles.switchOn : ''}`}
            onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
          >
            <div className={styles.switchDot} />
          </button>
        </div>
        <div className={styles.settingRow}>
          <span>{t('soundAlert')}</span>
          <button
            className={`${styles.switchBtn} ${settings.soundEnabled ? styles.switchOn : ''}`}
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          >
            <div className={styles.switchDot} />
          </button>
        </div>
        <div className={styles.settingRow}>
          <span>{t('volatilityThreshold')}</span>
          <div className={styles.sliderRow}>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={settings.volatilityThreshold}
              onChange={(e) => updateSettings({ volatilityThreshold: parseFloat(e.target.value) })}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{settings.volatilityThreshold}%</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>关于</h3>
        <div className={styles.aboutRow}>
          <span>版本</span>
          <span className={styles.version}>1.0.0</span>
        </div>
        <button className={styles.installBtn} onClick={handleInstall}>
          安装到主屏幕
        </button>
      </div>
    </div>
  );
}
