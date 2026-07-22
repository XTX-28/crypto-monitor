import { useState, useEffect } from 'react';
import { useBinanceWS } from './hooks/useBinanceWS';
import { useOKXWS } from './hooks/useOKXWS';
import { useAlerts } from './hooks/useAlerts';
import { useMarketData } from './hooks/useMarketData';
import { usePositionMonitor } from './hooks/usePositionMonitor';
import { usePriceStore } from './hooks/usePriceStore';
import { BottomTabBar, type TabType } from './components/BottomTabBar';
import { MarketTab } from './pages/MarketTab';
import { FundingTab } from './pages/FundingTab';
import { AlertsTab } from './pages/AlertsTab';
import { PositionsTab } from './pages/PositionsTab';
import { ProfileTab } from './pages/ProfileTab';
import { Toast } from './components/Toast';
import styles from './App.module.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const settings = usePriceStore(s => s.settings);

  // Initialize data connections
  useBinanceWS();
  useOKXWS();
  useAlerts();
  useMarketData();
  usePositionMonitor();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const renderTab = () => {
    switch (activeTab) {
      case 'market': return <MarketTab />;
      case 'funding': return <FundingTab />;
      case 'alerts': return <AlertsTab />;
      case 'positions': return <PositionsTab />;
      case 'profile': return <ProfileTab />;
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.content}>
        {renderTab()}
      </div>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <Toast />
    </div>
  );
}

export default App;
