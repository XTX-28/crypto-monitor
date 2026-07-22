import { useLocale } from '../../i18n/useLocale';
import styles from './BottomTabBar.module.css';

export type TabType = 'market' | 'funding' | 'alerts' | 'positions' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const { t } = useLocale();

  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'market', icon: '📈', label: t('market') },
    { id: 'funding', icon: '💰', label: t('fundingRate') },
    { id: 'alerts', icon: '🔔', label: t('alerts') },
    { id: 'positions', icon: '📊', label: t('positions') },
    { id: 'profile', icon: '⚙️', label: t('settings') },
  ];

  return (
    <div className={styles.tabBar}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
