export type Language = 'fa' | 'en';
export type CurrencyUnit = 'toman' | 'rial';

export interface ResponseMeta {
  demo: boolean;
  source: string;
  fetched_at: string;
  cached: boolean;
  stale: boolean;
  market_status: 'OPEN' | 'CLOSED' | 'PRE_OPEN';
  circuit_breaker: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  consecutive_failures?: number;
  realtime?: boolean;
  streaming?: boolean;
  tick?: number;
}

export interface SymbolQuote {
  insCode: string;
  symbol: string;
  symbolEn: string;
  name: string;
  nameEn: string;
  market: string;
  marketEn: string;
  sectorCode: string;
  sectorName: string;
  sectorNameEn: string;
  lastPrice: number;
  lastPriceToman: number;
  closePrice: number;
  closePriceToman: number;
  yesterdayPrice: number;
  yesterdayPriceToman: number;
  priceChange: number;
  percentChange: number;
  closePriceChange: number;
  closePercentChange: number;
  highPrice: number;
  lowPrice: number;
  highLimit: number;
  lowLimit: number;
  volume: number;
  valueToman: number;
  tradeCount: number;
  eps: number;
  pe: number;
  status: string;
  statusEn: string;
  baseVolume?: number;
  shareCount?: number;
  marketCapToman?: number;
}

export interface IndexData {
  id: string;
  titleFa: string;
  titleEn: string;
  value: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  isPositive: boolean;
  publishTime?: string;
  topMovers?: { symbol: string; impact: number }[];
}

export interface MarketSummary {
  marketValueToman: number;
  marketValueRialB?: number;
  totalVolume: number;
  totalVolumeM?: number;
  totalValueToman: number;
  totalValueRialB?: number;
  tradesCount: number;
  marketStatusText?: string;
  priceDateTime?: string;
  advancersCount: number;
  declinersCount: number;
  unchangedCount: number;
  realNetCashFlowToman: number;
  historyNetCashFlow?: { date: string; valueToman: number }[];
}

export interface OrderBookRow {
  rank: number;
  buyCount: number;
  buyVolume: number;
  buyPrice: number;
  buyPriceToman: number;
  sellPrice: number;
  sellPriceToman: number;
  sellVolume: number;
  sellCount: number;
}

export interface OrderBookData {
  insCode: string;
  symbol: string;
  depth: OrderBookRow[];
}

export interface ClientTypeData {
  insCode: string;
  symbol: string;
  real: {
    buyCount: number;
    buyVolume: number;
    buyValueToman: number;
    buyPercent: number;
    sellCount: number;
    sellVolume: number;
    sellValueToman: number;
    sellPercent: number;
  };
  legal: {
    buyCount: number;
    buyVolume: number;
    buyValueToman: number;
    buyPercent: number;
    sellCount: number;
    sellVolume: number;
    sellValueToman: number;
    sellPercent: number;
  };
  analysis: {
    netRealVolume: number;
    netRealValueToman: number;
    realBuyerPower: number;
    realPerCapitaBuyToman: number;
    realPerCapitaSellToman: number;
    ownershipTransfer: string;
  };
}

export interface HistoryItem {
  dateJalali: string;
  dateGregorian: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  lastPrice: number;
  volume: number;
  valueToman: number;
  trades: number;
}

export interface SectorItem {
  sectorCode: string;
  nameFa: string;
  nameEn: string;
  symbolsCount: number;
  totalValueToman: number;
  totalVolume: number;
  averagePercentChange: number;
  topSymbol: string;
  isPositive: boolean;
  weekChange?: number;
  monthChange?: number;
  yearChange?: number;
}

export interface HealthStatus {
  status: string;
  upstream: string;
  circuit_breaker_state: string;
  consecutive_failures: number;
  last_failure_reason?: string | null;
  relay_configured: boolean;
  mock_mode: boolean;
  market_open: boolean;
  timestamp: string;
}

// ==========================================
// TECHNICAL ANALYSIS TYPES (100% INTERNAL)
// ==========================================
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface CandlestickPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  // Trend
  sma20: number;
  sma50: number;
  sma200: number;
  ema9: number;
  ema21: number;
  wma20: number;
  macd: { line: number; signal: number; histogram: number };
  adx: { adx: number; pdi: number; ndi: number };
  parabolicSar: number;
  ichimoku: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
    chikou: number;
  };
  supertrend: { value: number; direction: 'bullish' | 'bearish' };

  // Momentum
  rsi14: number;
  rsi7: number;
  stochastic: { k: number; d: number };
  cci: number;
  williamsR: number;
  roc: number;
  momentum: number;

  // Volatility
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
  };
  atr: number;
  keltnerChannels: { upper: number; middle: number; lower: number };
  donchianChannels: { upper: number; middle: number; lower: number };

  // Volume
  obv: number;
  vwap: number;
  volumeProfile: { price: number; volume: number; isPOC?: boolean }[];
  cmf: number; // Chaikin Money Flow
  mfi: number; // Money Flow Index
  accumulationDistribution: number;

  // S/R & Pivots
  pivots: {
    classic: { p: number; r1: number; r2: number; r3: number; s1: number; s2: number; s3: number };
    fibonacci: { p: number; r1: number; r2: number; r3: number; s1: number; s2: number; s3: number };
    camarilla: { r3: number; r4: number; s3: number; s4: number };
  };
  fibonacciRetracement: {
    level0: number;
    level236: number;
    level382: number;
    level50: number;
    level618: number;
    level786: number;
    level100: number;
  };
  supportZones: { from: number; to: number; strength: number }[];
  resistanceZones: { from: number; to: number; strength: number }[];

  // Pattern Recognition
  candlestickPatterns: {
    name: string;
    type: 'bullish' | 'bearish' | 'neutral';
    significance: 'high' | 'medium' | 'low';
    description: string;
  }[];
  chartPatterns: {
    name: string;
    type: 'bullish' | 'bearish';
    targetPrice: number;
    description: string;
  }[];

  // Divergence & Multi-Timeframe
  divergences: {
    indicator: 'RSI' | 'MACD';
    type: 'regular_bullish' | 'regular_bearish' | 'hidden_bullish' | 'hidden_bearish';
    description: string;
  }[];
  multiTimeframeAlignment: {
    timeframe: Timeframe;
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-100
  }[];

  // Composite Score
  technicalScore: number; // 0-100
  verdict: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  persianSummary: string;
}

// ==========================================
// FUNDAMENTAL ANALYSIS TYPES (100% INTERNAL)
// ==========================================
export interface FundamentalMetrics {
  // Valuation
  dcfIntrinsicValueToman: number;
  dcfMarginOfSafety: number; // %
  ddmIntrinsicValueToman: number;
  pe: number;
  sectorPe: number;
  marketPe: number;
  relativePeDiscount: number; // %
  pb: number;
  sectorPb: number;
  ps: number;
  evEbitda: number;
  grahamNumberToman: number;

  // Profitability
  roe: number; // Return on Equity %
  roa: number; // Return on Assets %
  roic: number; // Return on Invested Capital %
  grossMargin: number; // %
  operatingMargin: number; // %
  netMargin: number; // %

  // Liquidity
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;

  // Leverage & Solvency
  debtToEquity: number;
  debtToAssets: number;
  interestCoverage: number;

  // Efficiency / Activity
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesTurnover: number;

  // Growth
  revenueGrowthYoY: number; // %
  epsGrowthYoY: number; // %
  cagr3Year: number; // %
  revenueGrowthQoQ: number; // %

  // Dividends
  dividendYield: number; // %
  payoutRatio: number; // %
  dpsToman: number;
  dividendHistory: { year: string; dpsToman: number; payoutRatio: number }[];

  // Sector Ranking & Composite Score
  sectorRank: { rank: number; total: number; sectorName: string };
  fundamentalScore: number; // 0-100
  verdict: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'WEAK' | 'POOR';
  persianSummary: string;
}

export interface FinancialStatements {
  periods: string[];
  balanceSheet: {
    currentAssetsToman: number[];
    fixedAssetsToman: number[];
    totalAssetsToman: number[];
    currentLiabilitiesToman: number[];
    totalLiabilitiesToman: number[];
    equityToman: number[];
    registeredCapitalToman: number[];
  };
  incomeStatement: {
    revenueToman: number[];
    grossProfitToman: number[];
    operatingProfitToman: number[];
    netProfitToman: number[];
    epsToman: number[];
  };
  cashFlow: {
    operatingCashFlowToman: number[];
    investingCashFlowToman: number[];
    financingCashFlowToman: number[];
    freeCashFlowToman: number[];
  };
}

// ==========================================
// SCREENER (فیلترساز) TYPES
// ==========================================
export type ScreenerField =
  | 'pe'
  | 'pb'
  | 'eps'
  | 'rsi14'
  | 'technicalScore'
  | 'fundamentalScore'
  | 'percentChange'
  | 'volume'
  | 'valueToman'
  | 'realNetCashFlow'
  | 'marketCapToman'
  | 'dividendYield'
  | 'roe'
  | 'debtToEquity';

export type ScreenerOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'cross_above' | 'cross_below';

export interface ScreenerFilterRule {
  field: ScreenerField;
  operator: ScreenerOperator;
  value: number;
  unit?: string;
  label: string;
}

export interface SavedScreener {
  id: string;
  name: string;
  description: string;
  isPreset?: boolean;
  rules: ScreenerFilterRule[];
}

export interface ScreenerResultItem {
  symbol: SymbolQuote;
  technical: TechnicalIndicators;
  fundamental: FundamentalMetrics;
  matchedRules: string[];
}

// ==========================================
// REPORTS & ALERTS & AI CHAT
// ==========================================
export type ReportType =
  | 'technical'
  | 'fundamental'
  | 'combined'
  | 'daily_market'
  | 'sector'
  | 'comparison';

export interface GeneratedReport {
  id: string;
  type: ReportType;
  title: string;
  createdAtJalali: string;
  symbol?: SymbolQuote;
  symbols?: SymbolQuote[];
  sector?: SectorItem;
  technical?: TechnicalIndicators;
  fundamental?: FundamentalMetrics;
  summary: string;
  strengths: string[];
  risks: string[];
  verdict: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidencePercent: number;
  disclaimer: string;
}

export interface AlertItem {
  id: string;
  symbolCode: string;
  symbolName: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PERCENT_CHANGE' | 'RSI_OVERSOLD' | 'RSI_OVERBOUGHT' | 'MACD_CROSS' | 'HIGH_VOLUME' | 'REAL_CASH_INFLOW';
  targetValue: number;
  targetValueDisplay: string;
  createdAt: string;
  isActive: boolean;
  lastTriggered?: string;
  note?: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  symbolName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: { label: string; value: string }[];
  reasoning?: string[];
  confidence?: number;
  suggestedFollowUps?: string[];
  disclaimer?: string;
}

export interface GlobalIndicator {
  id: string;
  titleFa: string;
  symbol: string;
  price?: string;
  displayPrice?: string;
  change?: string;
  changeAmount?: number;
  percentChange: number;
  isPositive: boolean;
  category?: 'currency' | 'gold_coin' | 'global_commodity' | 'crypto' | 'tse_gold_fund';
  priceToman?: number;
  priceUsd?: number;
  highPrice?: number;
  lowPrice?: number;
  unit?: string;
  dataSource?: string;
  sourceVerified?: boolean;
  tgjuCode?: string;
  bubbleToman?: number;
  lastUpdatedJalali?: string;
  updatedAt?: string;
}

export interface PriceForecast {
  insCode: string;
  currentPrice: number;
  horizonDays: number;
  expectedTargetPrice: number;
  bullTarget90pct: number;
  medianTarget50pct: number;
  bearTarget10pct: number;
  regressionSlope: number;
  regressionRSquared: number;
  regressionUpper2Sigma: number;
  regressionLower2Sigma: number;
  historicalDailyVolatility: number;
  annualizedVolatility: number;
  forecastDirection: 'صعودی قوی' | 'صعودی ملایم' | 'خنثی' | 'نزولی ملایم' | 'نزولی قوی';
  confidenceScore: number;
  monteCarloPaths: number[][];
  forecastRationale: string;
}

export type ActionVerdict = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'TAKE_PROFIT' | 'EXIT';

export interface ActionableStrategy {
  insCode: string;
  symbol: string;
  nameFa: string;
  actionVerdict: ActionVerdict;
  verdictFa: string;
  currentPriceToman: number;
  entryMinToman: number;
  entryMaxToman: number;
  stopLossToman: number;
  target1Toman: number;
  target2Toman: number;
  riskRewardRatio: number;
  expectedGainPct: number;
  maxRiskPct: number;
  timeHorizon: string;
  portfolioWeightPct: number;
  compositeScore: number;
  triggerCondition: string;
  validationChecklist: Array<{
    title: string;
    passed: boolean;
    description: string;
    scoreWeight: number;
  }>;
  catalysts: string[];
  executionPlan: string;
  updatedAt: string;
}

// ==========================================
// BOURSEVIEW REVERSE-ENGINEERED TYPES
// ==========================================
export interface MonthlySalesRecord {
  monthName: string;
  monthNumber: number;
  year: string;
  revenueBillionToman: number;
  cumulativeBillionToman: number;
  growthYoYPercent: number;
  topProductName: string;
  productionQty: number;
  salesQty: number;
  rateToman: number;
  unit: string;
}

export interface AssemblyAction {
  fiscalYear: string;
  assemblyDateJalali: string;
  assemblyType: string;
  dpsToman: number;
  payoutRatioPercent: number;
  dividendPaymentDate: string;
  capitalIncreasePct?: number;
  capitalIncreaseSource?: string;
}

export interface BourseviewSensitivityScenario {
  nimaDollarToman: number;
  estimatedEpsToman: number;
  impliedPe: number;
  changeVsCurrentPct: number;
}

export interface BourseviewCompanyProfile {
  insCode: string;
  symbol: string;
  nameFa: string;
  sectorName: string;
  market: string;
  currentPriceToman: number;
  peTrailing: number;
  peForward: number;
  ps: number;
  pb: number;
  epsTrailing: number;
  epsForwardEstimated: number;
  marketCapBillionToman: number;
  roe: number;
  roa: number;
  roic: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  dcfValueToman: number;
  dcfMarginOfSafety: number;
  grahamNumberToman: number;
  ddmFairValueToman: number;
  dividendYield: number;
  payoutRatioPercent: number;
  latestMonthlySalesGrowthYoY: number;
  annualSalesBillionToman: number;
  monthlySales: MonthlySalesRecord[];
  assemblies: AssemblyAction[];
  sensitivityScenarios: BourseviewSensitivityScenario[];
  realBuyerPower: number;
  perCapitaBuyMillionToman: number;
  perCapitaSellMillionToman: number;
  netRealFlow1dBillionToman: number;
  netRealFlow5dBillionToman: number;
  netRealFlow20dBillionToman: number;
  suspiciousVolumeRatio: number;
  buyQueueBillionToman: number;
  sellQueueBillionToman: number;
  bourseviewScore: number;
  financialHealthScore: number;
  growthScore: number;
  valuationScore: number;
  verdict: 'ارزش‌گذاری استثنایی' | 'بنیاد بسیار مطلوب' | 'ارزش‌گذاری منصفانه' | 'پرریسک و حباب‌دار';
  sectorRank: number;
  sectorTotal: number;
  keyCatalysts: string[];
  riskFactors: string[];
  updatedAt: string;
}

export interface BourseviewMarketOverview {
  totalCompaniesCount: number;
  averagePeMarket: number;
  medianPeMarket: number;
  averageRoeMarket: number;
  totalMonthlySalesGrowthYoY: number;
  smartMoneyInflowTodayBillionToman: number;
  topBourseviewPicks: BourseviewCompanyProfile[];
  allProfiles: BourseviewCompanyProfile[];
}


