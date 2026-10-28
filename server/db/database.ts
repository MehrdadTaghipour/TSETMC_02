import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'market.sqlite');

let dbInstance: SqlJsDatabase | null = null;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('✅ SQLite Database loaded from existing file:', DB_FILE);
    } catch (err) {
      console.warn('⚠️ Could not open existing SQLite database, creating new:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('✅ New SQLite Database initialized');
  }

  initSchema(dbInstance);
  saveDatabase();
  return dbInstance;
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

function initSchema(db: SqlJsDatabase) {
  db.run(`
    -- Symbols Table (All Tehran Stock Exchange Symbols)
    CREATE TABLE IF NOT EXISTS symbols (
      ins_code TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      sector_code TEXT,
      sector_name TEXT,
      market TEXT,
      yesterday_price INTEGER,
      last_price INTEGER,
      close_price INTEGER,
      high_price INTEGER,
      low_price INTEGER,
      high_limit INTEGER,
      low_limit INTEGER,
      volume INTEGER,
      value INTEGER,
      trade_count INTEGER,
      shares_count INTEGER,
      base_volume INTEGER,
      eps INTEGER,
      pe REAL,
      psr REAL,
      flow_type TEXT,
      status TEXT,
      updated_at TEXT
    );

    -- Historical Daily Candlesticks (OHLCV)
    CREATE TABLE IF NOT EXISTS ohlcv_daily (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ins_code TEXT NOT NULL,
      date_jalali TEXT NOT NULL,
      date_gregorian TEXT,
      open_price INTEGER NOT NULL,
      high_price INTEGER NOT NULL,
      low_price INTEGER NOT NULL,
      close_price INTEGER NOT NULL,
      last_price INTEGER NOT NULL,
      volume INTEGER NOT NULL,
      value INTEGER NOT NULL,
      trade_count INTEGER NOT NULL,
      UNIQUE(ins_code, date_jalali)
    );

    -- Financial Statements (Codal Data: Balance Sheet, Income Statement, Cash Flow)
    CREATE TABLE IF NOT EXISTS financial_statements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ins_code TEXT NOT NULL,
      fiscal_period TEXT NOT NULL,
      date_jalali TEXT,
      revenue INTEGER,
      cost_of_goods INTEGER,
      gross_profit INTEGER,
      operating_expenses INTEGER,
      operating_profit INTEGER,
      finance_costs INTEGER,
      other_income INTEGER,
      net_profit INTEGER,
      current_assets INTEGER,
      cash_and_equivalents INTEGER,
      receivables INTEGER,
      inventories INTEGER,
      non_current_assets INTEGER,
      total_assets INTEGER,
      current_liabilities INTEGER,
      non_current_liabilities INTEGER,
      total_liabilities INTEGER,
      equity INTEGER,
      operating_cash_flow INTEGER,
      capex INTEGER,
      free_cash_flow INTEGER,
      eps INTEGER,
      dps INTEGER,
      UNIQUE(ins_code, fiscal_period)
    );

    -- Parallel & Global Markets (Real Authentic Rates: Gold, Coin, Forex, Oil, Metals, Crypto)
    CREATE TABLE IF NOT EXISTS parallel_markets (
      id TEXT PRIMARY KEY,
      title_fa TEXT NOT NULL,
      symbol TEXT NOT NULL,
      category TEXT NOT NULL, -- 'currency', 'gold_coin', 'global_commodity', 'crypto'
      price_toman REAL,
      price_usd REAL,
      display_price TEXT NOT NULL,
      change_amount REAL,
      percent_change REAL,
      high_price REAL,
      low_price REAL,
      open_price REAL,
      is_positive INTEGER,
      unit TEXT NOT NULL,
      data_source TEXT NOT NULL,
      source_verified INTEGER DEFAULT 1,
      last_updated_jalali TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Computed Technical Indicators Cache
    CREATE TABLE IF NOT EXISTS technical_indicators (
      ins_code TEXT NOT NULL,
      timeframe TEXT NOT NULL, -- '1D', '1W', '1M', '1H', '15m'
      rsi14 REAL,
      rsi7 REAL,
      macd_line REAL,
      macd_signal REAL,
      macd_hist REAL,
      sma20 REAL,
      sma50 REAL,
      sma200 REAL,
      ema9 REAL,
      ema21 REAL,
      ema55 REAL,
      bollinger_upper REAL,
      bollinger_middle REAL,
      bollinger_lower REAL,
      bollinger_width REAL,
      ichimoku_tenkan REAL,
      ichimoku_kijun REAL,
      ichimoku_span_a REAL,
      ichimoku_span_b REAL,
      ichimoku_chikou REAL,
      stoch_k REAL,
      stoch_d REAL,
      atr14 REAL,
      supertrend_value REAL,
      supertrend_trend TEXT,
      pivot_point REAL,
      r1 REAL,
      r2 REAL,
      r3 REAL,
      s1 REAL,
      s2 REAL,
      s3 REAL,
      technical_score INTEGER,
      technical_verdict TEXT,
      detected_patterns TEXT, -- JSON array of detected candlestick & chart patterns
      updated_at TEXT,
      PRIMARY KEY (ins_code, timeframe)
    );

    -- Computed Fundamental Valuation & Scores
    CREATE TABLE IF NOT EXISTS fundamental_scores (
      ins_code TEXT PRIMARY KEY,
      dcf_intrinsic_value INTEGER,
      dcf_margin_of_safety REAL,
      dcf_wacc REAL,
      dcf_growth_rate REAL,
      graham_number INTEGER,
      graham_discount REAL,
      ddm_fair_value INTEGER,
      ddm_dividend_yield REAL,
      pe_ratio REAL,
      pe_sector_median REAL,
      pe_market_median REAL,
      pe_percentile REAL,
      pb_ratio REAL,
      ps_ratio REAL,
      ev_ebitda REAL,
      roe REAL,
      roa REAL,
      roic REAL,
      gross_margin REAL,
      operating_margin REAL,
      net_margin REAL,
      current_ratio REAL,
      quick_ratio REAL,
      debt_to_equity REAL,
      debt_to_assets REAL,
      interest_coverage REAL,
      altman_z_score REAL,
      fundamental_score INTEGER,
      fundamental_verdict TEXT,
      sector_rank INTEGER,
      sector_total INTEGER,
      updated_at TEXT
    );

    -- Price Forecasting & Predictive Models (Monte Carlo & Regression Channels)
    CREATE TABLE IF NOT EXISTS price_forecasts (
      ins_code TEXT PRIMARY KEY,
      horizon_days INTEGER NOT NULL,
      current_price INTEGER NOT NULL,
      expected_target_price INTEGER NOT NULL,
      bull_target_90pct INTEGER NOT NULL,
      median_target_50pct INTEGER NOT NULL,
      bear_target_10pct INTEGER NOT NULL,
      regression_slope REAL NOT NULL,
      regression_r_squared REAL NOT NULL,
      regression_upper_2sigma INTEGER NOT NULL,
      regression_lower_2sigma INTEGER NOT NULL,
      historical_daily_volatility REAL NOT NULL,
      annualized_volatility REAL NOT NULL,
      forecast_direction TEXT NOT NULL, -- 'صعودی قوی', 'صعودی ملایم', 'خنثی', 'نزولی ملایم', 'نزولی قوی'
      confidence_score INTEGER NOT NULL,
      monte_carlo_paths_json TEXT, -- sampled paths for UI chart visualization
      forecast_rationale TEXT NOT NULL,
      updated_at TEXT
    );

    -- User Personal Watchlists
    CREATE TABLE IF NOT EXISTS watchlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ins_codes TEXT NOT NULL, -- JSON array of ins_codes
      created_at TEXT NOT NULL
    );

    -- User Alerts
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      ins_code TEXT NOT NULL,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL,
      condition TEXT NOT NULL,
      threshold REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      triggered INTEGER DEFAULT 0,
      triggered_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Order Book Snapshots
    CREATE TABLE IF NOT EXISTS order_books (
      ins_code TEXT NOT NULL,
      level INTEGER NOT NULL,
      buy_count INTEGER,
      buy_volume INTEGER,
      buy_price INTEGER,
      sell_price INTEGER,
      sell_volume INTEGER,
      sell_count INTEGER,
      updated_at TEXT,
      PRIMARY KEY (ins_code, level)
    );

    -- Institutional Actionable Trading & Investment Strategy Signals
    CREATE TABLE IF NOT EXISTS actionable_signals (
      ins_code TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      name_fa TEXT NOT NULL,
      action_verdict TEXT NOT NULL,
      verdict_fa TEXT NOT NULL,
      current_price_toman INTEGER NOT NULL,
      entry_min_toman INTEGER NOT NULL,
      entry_max_toman INTEGER NOT NULL,
      stop_loss_toman INTEGER NOT NULL,
      target_1_toman INTEGER NOT NULL,
      target_2_toman INTEGER NOT NULL,
      risk_reward_ratio REAL NOT NULL,
      expected_gain_pct REAL NOT NULL,
      max_risk_pct REAL NOT NULL,
      time_horizon TEXT NOT NULL,
      portfolio_weight_pct INTEGER NOT NULL,
      composite_score INTEGER NOT NULL,
      trigger_condition TEXT NOT NULL,
      validation_checklist_json TEXT NOT NULL,
      catalysts_json TEXT NOT NULL,
      execution_plan TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Indexes for high-speed queries
    CREATE INDEX IF NOT EXISTS idx_ohlcv_ins_date ON ohlcv_daily(ins_code, date_jalali);
    CREATE INDEX IF NOT EXISTS idx_symbols_sector ON symbols(sector_code);
  `);
}
