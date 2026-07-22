import { useState, useMemo } from 'react';
import { usePriceStore } from '../hooks/usePriceStore';
import { usePositionStore } from '../hooks/usePositionStore';
import { formatPrice } from '../utils/format';
import type { SimPosition } from '../types';
import styles from './PositionsTab.module.css';

export function PositionsTab() {
  const symbols = usePriceStore(s => s.symbols);
  const prices = usePriceStore(s => s.prices);
  const positions = usePositionStore(s => s.positions);
  const openPosition = usePositionStore(s => s.openPosition);
  const closePosition = usePositionStore(s => s.closePosition);
  const updateTP = usePositionStore(s => s.updateTP);
  const updateSL = usePositionStore(s => s.updateSL);
  const clearHistory = usePositionStore(s => s.clearHistory);

  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTPSL, setEditingTPSL] = useState<string | null>(null);

  // Form state
  const [formSymbol, setFormSymbol] = useState(symbols[0] || '');
  const [formExchange, setFormExchange] = useState<'binance' | 'okx'>('binance');
  const [formDirection, setFormDirection] = useState<'long' | 'short'>('long');
  const [formPrice, setFormPrice] = useState('');
  const [formLeverage, setFormLeverage] = useState(10);
  const [formQuantity, setFormQuantity] = useState('');
  const [formTP, setFormTP] = useState('');
  const [formSL, setFormSL] = useState('');

  // TP/SL editing
  const [editTP, setEditTP] = useState('');
  const [editSL, setEditSL] = useState('');

  const openPositions = positions.filter(p => p.status === 'open');
  const closedPositions = positions.filter(p => p.status === 'closed');

  const totalPnl = useMemo(() => {
    return openPositions.reduce((sum: number, pos: SimPosition) => {
      const priceData = prices[pos.symbol];
      if (!priceData) return sum;
      const currentPrice = priceData[pos.exchange]?.price;
      if (currentPrice === null || currentPrice === undefined) return sum;
      const pnl = pos.direction === 'long'
        ? (currentPrice - pos.entryPrice) * pos.quantity * pos.leverage / pos.entryPrice
        : (pos.entryPrice - currentPrice) * pos.quantity * pos.leverage / pos.entryPrice;
      return sum + pnl;
    }, 0);
  }, [openPositions, prices]);

  const totalMargin = useMemo(() => {
    return openPositions.reduce((sum: number, pos: SimPosition) => sum + pos.margin, 0);
  }, [openPositions]);

  const handleOpenPosition = () => {
    const entryPrice = formPrice ? parseFloat(formPrice) : (prices[formSymbol]?.[formExchange]?.price ?? 0);
    const quantity = parseFloat(formQuantity);
    if (!entryPrice || !quantity || !formSymbol) return;

    openPosition({
      symbol: formSymbol,
      exchange: formExchange,
      direction: formDirection,
      entryPrice,
      quantity,
      leverage: formLeverage,
    });

    setShowForm(false);
    setFormPrice('');
    setFormQuantity('');
    setFormTP('');
    setFormSL('');
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;
    const currentPrice = prices[pos.symbol]?.[pos.exchange]?.price;
    if (currentPrice === null || currentPrice === undefined) return;
    closePosition(id, currentPrice, 'manual');
  };

  const handleSaveTPSL = (id: string) => {
    if (editTP) updateTP(id, parseFloat(editTP));
    if (editSL) updateSL(id, parseFloat(editSL));
    setEditingTPSL(null);
    setEditTP('');
    setEditSL('');
  };

  const getPnl = (pos: SimPosition) => {
    const priceData = prices[pos.symbol];
    if (!priceData) return 0;
    const currentPrice = priceData[pos.exchange]?.price;
    if (currentPrice === null || currentPrice === undefined) return 0;
    return pos.direction === 'long'
      ? (currentPrice - pos.entryPrice) * pos.quantity * pos.leverage / pos.entryPrice
      : (pos.entryPrice - currentPrice) * pos.quantity * pos.leverage / pos.entryPrice;
  };

  const getCurrentPrice = (pos: SimPosition) => {
    return prices[pos.symbol]?.[pos.exchange]?.price ?? null;
  };

  if (showHistory) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => setShowHistory(false)}>←</button>
          <h2 className={styles.title}>历史记录</h2>
          {closedPositions.length > 0 && (
            <button className={styles.clearBtn} onClick={clearHistory}>清空</button>
          )}
        </div>
        <div className={styles.list}>
          {closedPositions.length === 0 ? (
            <div className={styles.empty}>暂无历史记录</div>
          ) : (
            closedPositions.map(pos => (
              <div key={pos.id} className={styles.historyCard}>
                <div className={styles.historyHeader}>
                  <span className={styles.symbolName}>{pos.symbol.replace('USDT', '')}</span>
                  <span className={pos.direction === 'long' ? styles.longTag : styles.shortTag}>
                    {pos.direction === 'long' ? '多' : '空'} {pos.leverage}x
                  </span>
                  <span className={pos.closeReason === 'tp' ? styles.tpReason : pos.closeReason === 'sl' ? styles.slReason : styles.manualReason}>
                    {pos.closeReason === 'tp' ? '止盈' : pos.closeReason === 'sl' ? '止损' : '手动'}
                  </span>
                </div>
                <div className={styles.historyDetails}>
                  <span>开: {formatPrice(pos.entryPrice)}</span>
                  <span>平: {formatPrice(pos.closePrice ?? null)}</span>
                  <span className={(pos.realizedPnl ?? 0) >= 0 ? styles.profit : styles.loss}>
                    {pos.realizedPnl !== undefined && (pos.realizedPnl >= 0 ? '+' : '')}
                    ${pos.realizedPnl?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>模拟仓位</h2>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '×' : '+'}
        </button>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>总盈亏</span>
          <span className={totalPnl >= 0 ? styles.profit : styles.loss}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>收益率</span>
          <span className={totalPnl >= 0 ? styles.profit : styles.loss}>
            {totalMargin > 0 ? ((totalPnl / totalMargin) * 100).toFixed(2) : '0.00'}%
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>保证金</span>
          <span className={styles.summaryValue}>${totalMargin.toFixed(2)}</span>
        </div>
      </div>

      {showForm && (
        <div className={styles.form}>
          <div className={styles.formRow}>
            <select
              className={styles.select}
              value={formSymbol}
              onChange={(e) => setFormSymbol(e.target.value)}
            >
              {symbols.map(s => (
                <option key={s} value={s}>{s.replace('USDT', '')}</option>
              ))}
            </select>
            <div className={styles.exchangeToggle}>
              <button
                className={formExchange === 'binance' ? styles.activeExchange : ''}
                onClick={() => setFormExchange('binance')}
              >B</button>
              <button
                className={formExchange === 'okx' ? styles.activeExchange : ''}
                onClick={() => setFormExchange('okx')}
              >O</button>
            </div>
          </div>

          <div className={styles.directionRow}>
            <button
              className={`${styles.dirBtn} ${formDirection === 'long' ? styles.longActive : ''}`}
              onClick={() => setFormDirection('long')}
            >多 Long</button>
            <button
              className={`${styles.dirBtn} ${formDirection === 'short' ? styles.shortActive : ''}`}
              onClick={() => setFormDirection('short')}
            >空 Short</button>
          </div>

          <div className={styles.formRow}>
            <input
              type="number"
              className={styles.input}
              placeholder={`开仓价 (默认: ${formatPrice(prices[formSymbol]?.[formExchange]?.price ?? null)})`}
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
          </div>

          <div className={styles.leverageRow}>
            <span className={styles.leverageLabel}>杠杆: {formLeverage}x</span>
            <input
              type="range"
              min="1"
              max="100"
              value={formLeverage}
              onChange={(e) => setFormLeverage(parseInt(e.target.value))}
              className={styles.leverageSlider}
            />
            <div className={styles.leveragePresets}>
              {[1, 5, 10, 20, 50, 100].map(lev => (
                <button
                  key={lev}
                  className={formLeverage === lev ? styles.activePreset : styles.preset}
                  onClick={() => setFormLeverage(lev)}
                >{lev}x</button>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <input
              type="number"
              className={styles.input}
              placeholder="数量 (USDT)"
              value={formQuantity}
              onChange={(e) => setFormQuantity(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <input
              type="number"
              className={styles.input}
              placeholder="止盈价格 (可选)"
              value={formTP}
              onChange={(e) => setFormTP(e.target.value)}
            />
            <input
              type="number"
              className={styles.input}
              placeholder="止损价格 (可选)"
              value={formSL}
              onChange={(e) => setFormSL(e.target.value)}
            />
          </div>

          <button className={styles.submitBtn} onClick={handleOpenPosition}>
            确认开仓
          </button>
        </div>
      )}

      <div className={styles.list}>
        {openPositions.length === 0 ? (
          <div className={styles.empty}>暂无持仓</div>
        ) : (
          openPositions.map(pos => {
            const pnl = getPnl(pos);
            const currentPrice = getCurrentPrice(pos);
            const pnlPercent = pos.margin > 0 ? (pnl / pos.margin) * 100 : 0;
            const isEditing = editingTPSL === pos.id;

            return (
              <div key={pos.id} className={styles.positionCard}>
                <div className={styles.posHeader}>
                  <span className={styles.symbolName}>{pos.symbol.replace('USDT', '')}</span>
                  <span className={pos.direction === 'long' ? styles.longTag : styles.shortTag}>
                    {pos.direction === 'long' ? '多' : '空'} {pos.leverage}x
                  </span>
                  <span className={styles.exchangeTag}>{pos.exchange === 'binance' ? 'B' : 'O'}</span>
                </div>

                <div className={styles.posInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>开仓</span>
                    <span className={styles.infoValue}>{formatPrice(pos.entryPrice)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>现价</span>
                    <span className={styles.infoValue}>{formatPrice(currentPrice)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>盈亏</span>
                    <span className={pnl >= 0 ? styles.profit : styles.loss}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className={styles.tpslForm}>
                    <input
                      type="number"
                      className={styles.smallInput}
                      placeholder={`止盈: ${pos.takeProfit ?? '未设置'}`}
                      value={editTP}
                      onChange={(e) => setEditTP(e.target.value)}
                    />
                    <input
                      type="number"
                      className={styles.smallInput}
                      placeholder={`止损: ${pos.stopLoss ?? '未设置'}`}
                      value={editSL}
                      onChange={(e) => setEditSL(e.target.value)}
                    />
                    <button className={styles.saveBtn} onClick={() => handleSaveTPSL(pos.id)}>保存</button>
                    <button className={styles.cancelBtn} onClick={() => setEditingTPSL(null)}>取消</button>
                  </div>
                ) : (
                  <div className={styles.tpslInfo}>
                    {pos.takeProfit && <span>TP: {formatPrice(pos.takeProfit)}</span>}
                    {pos.stopLoss && <span>SL: {formatPrice(pos.stopLoss)}</span>}
                  </div>
                )}

                <div className={styles.posActions}>
                  <button
                    className={styles.tpslBtn}
                    onClick={() => {
                      setEditingTPSL(pos.id);
                      setEditTP(pos.takeProfit?.toString() ?? '');
                      setEditSL(pos.stopLoss?.toString() ?? '');
                    }}
                  >止盈止损</button>
                  <button
                    className={styles.closeBtn}
                    onClick={() => handleClosePosition(pos.id)}
                  >平仓</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {closedPositions.length > 0 && (
        <button className={styles.historyBtn} onClick={() => setShowHistory(true)}>
          历史记录 ({closedPositions.length}) →
        </button>
      )}
    </div>
  );
}
