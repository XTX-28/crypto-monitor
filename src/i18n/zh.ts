const zh = {
  // Header
  appTitle: 'CryptoMonitor',
  subtitle: '合约价格实时监控',
  alerts: '警报',
  settings: '设置',
  fullscreen: '全屏',
  language: '语言',

  // Market Table
  symbol: '币种',
  binancePrice: 'Binance 价格',
  okxPrice: 'OKX 价格',
  spread: '价差',
  change24h: '24h涨跌',
  volume24h: '24h成交额',
  fundingRate: '资金费率',
  openInterest: '持仓量',
  trend: '走势',
  noData: '暂无数据',
  market: '行情',

  // Connection
  connected: '已连接',
  connecting: '连接中',
  disconnected: '已断开',

  // Settings
  volatilityThreshold: '波动提醒阈值 (%)',
  volatilityHint: '1分钟内价格变动超过此百分比时触发提醒',
  browserNotification: '浏览器通知',
  soundAlert: '声音提醒',
  viewMode: '视图模式',
  tableView: '表格视图',
  cardView: '卡片视图',
  theme: '主题',
  darkMode: '暗色',
  lightMode: '亮色',
  columnSettings: '列设置',

  // Alerts
  priceAlerts: '价格警报',
  upperLimit: '突破上限',
  lowerLimit: '跌破下限',
  targetPrice: '目标价格',
  add: '添加',
  enabled: '已启用',
  disabled: '已禁用',
  triggered: '已触发',
  delete: '删除',
  noAlerts: '暂无警报',

  // Pair Selector
  addPair: '输入币种 (如 BTC, ETH, SOL...)',
  quickAdd: '快捷添加:',

  // Funding Rate
  fundingRateComparison: '资金费率对比',
  binanceRate: 'Binance费率',
  okxRate: 'OKX费率',
  rateDiff: '费率差',
  annualized: '年化收益',
  direction: '方向',
  nextSettlement: '下次结算',
  arbitrageOpportunity: '套利机会',
  bestArbitrage: '最佳套利',

  // Detail View
  priceChart: '价格走势',
  exchangeComparison: '交易所对比',
  fundingRateHistory: '资金费率历史',

  // Status Bar
  lastUpdate: '最后更新',
  latency: '延迟',

  // Keyboard shortcuts
  shortcuts: '快捷键',
  searchFocus: '聚焦搜索',
  toggleView: '切换视图',
  exitFullscreen: '退出全屏',
  selectUp: '向上选择',
  selectDown: '向下选择',
  expandDetail: '展开详情',
  addAlertShort: '添加警报',
  showHelp: '显示帮助',

  // Positions
  positions: '仓位',
};

export type TranslationKey = keyof typeof zh;
export default zh;
