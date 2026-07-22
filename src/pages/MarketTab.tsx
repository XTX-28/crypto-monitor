import { useState } from 'react';
import { usePriceStore } from '../hooks/usePriceStore';
import { SearchBar } from '../components/SearchBar';
import { MarketList } from '../components/MarketList';
import { DetailSheet } from '../components/DetailSheet';

export function MarketTab() {
  const selectedSymbol = usePriceStore(s => s.selectedSymbol);
  const setSelectedSymbol = usePriceStore(s => s.setSelectedSymbol);
  const removeSymbol = usePriceStore(s => s.removeSymbol);
  const [detailSymbol, setDetailSymbol] = useState<string | null>(null);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setDetailSymbol(symbol);
  };

  const handleCloseDetail = () => {
    setDetailSymbol(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SearchBar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <MarketList
          onSelectSymbol={handleSelectSymbol}
          onRemoveSymbol={removeSymbol}
          selectedSymbol={selectedSymbol}
        />
      </div>
      {detailSymbol && (
        <DetailSheet symbol={detailSymbol} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
