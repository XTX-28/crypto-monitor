import { useLocale } from '../../i18n/useLocale';
import styles from './MobileTabs.module.css';

type TabKey = 'market' | 'funding' | 'alerts' | 'settings';

interface MobileTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenSettings: () => void;
}

export function MobileTabs({ activeTab, onTabChange, onOpenSettings }: MobileTabsProps) {
  const { t } = useLocale();

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'market', label: t('market'), icon: '📊' },
    { key: 'funding', label: t('fundingRate'), icon: '💰' },
    { key: 'alerts', label: t('alerts'), icon: '🔔' },
    { key: 'settings', label: t('settings'), icon: '⚙' },
  ];

  const handleTabClick = (key: TabKey) => {
    if (key === 'settings') {
      onOpenSettings();
    } else {
      onTabChange(key);
    }
  };

  return (
    <nav className={styles.tabBar}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
          onClick={() => handleTabClick(tab.key)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
