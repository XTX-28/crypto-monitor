import { useState, useRef, useCallback, useEffect } from 'react';
import { useBinanceWS } from './hooks/useBinanceWS';
import { useOKXWS } from './hooks/useOKXWS';
import { useAlerts } from './hooks/useAlerts';
import { useMarketData } from './hooks/useMarketData';
import { useKeyboard } from './hooks/useKeyboard';
import { usePriceStore } from './hooks/usePriceStore';
import { useLocale } from './i18n/useLocale';
import { MarketTable } from './components/MarketTable';
import { DetailView } from './components/DetailView';
import { FundingRatePanel } from './components/FundingRatePanel';
import { AlertPanel } from './components/AlertPanel';
import { PairSelector } from './components/PairSelector';
import { StatusBar } from './components/StatusBar';
import { Toast } from './components/Toast';
import { Settings } from './components/Settings';
import { PriceCard } from './components/PriceCard';
import { MobileTabs } from './components/MobileTabs';
import styles from './App.module.css';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileTab, setMobileTab] = useState<'market' | 'funding' | 'alerts' | 'settings'>('market');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { t } = useLocale();
  const symbols = usePriceStore(s => s.symbols);
  const selectedSymbol = usePriceStore(s => s.selectedSymbol);
  const addSymbol = usePriceStore(s => s.addSymbol);
  const removeSymbol = usePriceStore(s => s.removeSymbol);
  const setSelectedSymbol = usePriceStore(s => s.setSelectedSymbol);
  const settings = usePriceStore(s => s.settings);
  const updateSettings = usePriceStore(s => s.updateSettings);

  // Initialize data connections
  useBinanceWS();
  useOKXWS();
  useAlerts();
  useMarketData();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  // Handlers for keyboard shortcuts
  const handleToggleView = useCallback(() => {
    updateSettings({ viewMode: settings.viewMode === 'table' ? 'card' : 'table' });
  }, [settings.viewMode, updateSettings]);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleToggleAlerts = useCallback(() => {
    setShowAlerts(prev => !prev);
  }, []);

  useKeyboard({
    searchInputRef,
    onToggleView: handleToggleView,
    onToggleFullscreen: handleToggleFullscreen,
    onToggleAlerts: handleToggleAlerts,
  });

  // Track fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol === selectedSymbol ? null : symbol);
  };

  const isFullscreenMode = isFullscreen || settings.fullscreen;

  return (
    <div className={`${styles.app} ${isFullscreenMode ? styles.fullscreenApp : ''}`}>
      {/* Header */}
      {!isFullscreenMode && (
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>CryptoMonitor</h1>
            <span className={styles.subtitle}>{t('subtitle')}</span>
          </div>
          <div className={styles.headerCenter}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`${t('addPair')}  (Ctrl+K)`}
                className={styles.searchInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = e.currentTarget.value.toUpperCase().trim();
                    if (val) {
                      const sym = val.includes('USDT') ? val : val + 'USDT';
                      addSymbol(sym);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className={styles.headerRight}>
            <button
              className={`${styles.headerBtn} ${showAlerts ? styles.activeBtn : ''}`}
              onClick={() => setShowAlerts(!showAlerts)}
              title={t('alerts') + ' (A)'}
            >
              {t('alerts')}
            </button>
            <button
              className={`${styles.headerBtn} ${showFunding ? styles.activeBtn : ''}`}
              onClick={() => setShowFunding(!showFunding)}
            >
              {t('fundingRate')}
            </button>
            <button
              className={styles.headerBtn}
              onClick={handleToggleFullscreen}
              title={t('fullscreen') + ' (F)'}
            >
              ⛶
            </button>
            <button
              className={styles.headerBtn}
              onClick={() => setShowShortcuts(!showShortcuts)}
              title={t('shortcuts') + ' (?)'}
            >
              ?
            </button>
            <button
              className={styles.headerBtn}
              onClick={() => setSettingsOpen(true)}
            >
              {t('settings')}
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={styles.main}>
        {/* Toolbar */}
        {!isFullscreenMode && (
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button
                className={`${styles.viewBtn} ${settings.viewMode === 'table' ? styles.activeViewBtn : ''}`}
                onClick={() => updateSettings({ viewMode: 'table' })}
              >
                {t('tableView')}
              </button>
              <button
                className={`${styles.viewBtn} ${settings.viewMode === 'card' ? styles.activeViewBtn : ''}`}
                onClick={() => updateSettings({ viewMode: 'card' })}
              >
                {t('cardView')}
              </button>
            </div>
            <div className={styles.toolbarRight}>
              <span className={styles.symbolCount}>{symbols.length} {t('symbol')}</span>
            </div>
          </div>
        )}

        {/* Quick add (non-fullscreen) */}
        {!isFullscreenMode && (
          <div className={styles.quickAddSection}>
            <PairSelector onAdd={addSymbol} existingSymbols={symbols} />
          </div>
        )}

        {/* Content Layout */}
        <div className={styles.contentLayout}>
          {/* Left: Market Data */}
          <div className={`${styles.leftPanel} ${selectedSymbol ? styles.leftPanelSplit : ''}`}>
            {settings.viewMode === 'table' ? (
              <MarketTable
                onSelectSymbol={handleSelectSymbol}
                onRemoveSymbol={removeSymbol}
                selectedSymbol={selectedSymbol}
              />
            ) : (
              <div className={styles.cardsGrid}>
                {symbols.map(symbol => (
                  <PriceCard
                    key={symbol}
                    symbol={symbol}
                    isSelected={selectedSymbol === symbol}
                    onSelect={handleSelectSymbol}
                    onRemove={removeSymbol}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail Panel */}
          {selectedSymbol && (
            <div className={styles.rightPanel}>
              <DetailView key={selectedSymbol} symbol={selectedSymbol} />
            </div>
          )}
        </div>

        {/* Funding Rate Panel */}
        {showFunding && !isFullscreenMode && (
          <section className={styles.section}>
            <FundingRatePanel />
          </section>
        )}

        {/* Alerts Panel */}
        {showAlerts && !isFullscreenMode && (
          <section className={styles.section}>
            <AlertPanel />
          </section>
        )}

        {/* Shortcuts Help */}
        {showShortcuts && !isFullscreenMode && (
          <div className={styles.shortcutsOverlay} onClick={() => setShowShortcuts(false)}>
            <div className={styles.shortcutsPanel} onClick={e => e.stopPropagation()}>
              <h3 className={styles.shortcutsTitle}>{t('shortcuts')}</h3>
              <div className={styles.shortcutRow}><kbd>Ctrl+K</kbd><span>{t('searchFocus')}</span></div>
              <div className={styles.shortcutRow}><kbd>1</kbd> / <kbd>2</kbd><span>{t('toggleView')}</span></div>
              <div className={styles.shortcutRow}><kbd>F</kbd><span>{t('fullscreen')}</span></div>
              <div className={styles.shortcutRow}><kbd>Esc</kbd><span>{t('exitFullscreen')}</span></div>
              <div className={styles.shortcutRow}><kbd>↑</kbd> / <kbd>↓</kbd><span>{t('selectUp')} / {t('selectDown')}</span></div>
              <div className={styles.shortcutRow}><kbd>A</kbd><span>{t('addAlertShort')}</span></div>
              <div className={styles.shortcutRow}><kbd>?</kbd><span>{t('showHelp')}</span></div>
              <button className={styles.shortcutsClose} onClick={() => setShowShortcuts(false)}>×</button>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      {!isFullscreenMode && <StatusBar />}

      {/* Mobile Tab Navigation */}
      {!isFullscreenMode && (
        <MobileTabs
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* Overlays */}
      <Toast />
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;
