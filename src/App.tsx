import { useState } from 'react';
import { useBinanceWS } from './hooks/useBinanceWS';
import { useOKXWS } from './hooks/useOKXWS';
import { useAlerts } from './hooks/useAlerts';
import { usePriceStore } from './hooks/usePriceStore';
import { PriceCard } from './components/PriceCard';
import { PairSelector } from './components/PairSelector';
import { PriceChart } from './components/PriceChart';
import { AlertPanel } from './components/AlertPanel';
import { Toast } from './components/Toast';
import { Settings } from './components/Settings';
import styles from './App.module.css';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const symbols = usePriceStore(s => s.symbols);
  const selectedSymbol = usePriceStore(s => s.selectedSymbol);
  const addSymbol = usePriceStore(s => s.addSymbol);
  const removeSymbol = usePriceStore(s => s.removeSymbol);
  const setSelectedSymbol = usePriceStore(s => s.setSelectedSymbol);

  // Initialize WebSocket connections
  useBinanceWS();
  useOKXWS();
  
  // Initialize alert monitoring
  useAlerts();

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol === selectedSymbol ? null : symbol);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>CryptoMonitor</h1>
          <span className={styles.subtitle}>合约价格实时监控</span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.headerBtn} ${showAlerts ? styles.activeBtn : ''}`}
            onClick={() => setShowAlerts(!showAlerts)}
          >
            警报
          </button>
          <button
            className={styles.headerBtn}
            onClick={() => setSettingsOpen(true)}
          >
            设置
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.selectorSection}>
          <PairSelector onAdd={addSymbol} existingSymbols={symbols} />
        </section>

        <section className={styles.cardsGrid}>
          {symbols.map(symbol => (
            <PriceCard
              key={symbol}
              symbol={symbol}
              isSelected={selectedSymbol === symbol}
              onSelect={handleSelectSymbol}
              onRemove={removeSymbol}
            />
          ))}
        </section>

        {selectedSymbol && (
          <section className={styles.chartSection}>
            <PriceChart symbol={selectedSymbol} />
          </section>
        )}

        {showAlerts && (
          <section className={styles.alertsSection}>
            <AlertPanel />
          </section>
        )}
      </main>

      <Toast />
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
