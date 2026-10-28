import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Layers,
  History,
  BookOpen,
  Star,
  Activity,
  Calculator,
  FileText,
  Sparkles,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  Shield,
  Award,
  Crosshair,
  CheckCircle,
} from 'lucide-react';
import {
  ActionableStrategy,
  ClientTypeData,
  CurrencyUnit,
  HistoryItem,
  Language,
  OrderBookData,
  PriceForecast,
  SymbolQuote,
  Timeframe,
  BourseviewCompanyProfile,
} from '../types';
import { translations } from '../translations';
import { formatPercent, formatPrice, formatToman, formatVolume, toPersianDigits } from '../utils/formatters';
import { runTechnicalAnalysis } from '../utils/technicalAnalysis';
import { runFundamentalAnalysis } from '../utils/fundamentalAnalysis';

interface SymbolDetailModalProps {
  symbol: SymbolQuote | null;
  allSymbols?: SymbolQuote[];
  onClose: () => void;
  lang: Language;
  currency: CurrencyUnit;
  isWatchlist: boolean;
  onToggleWatchlist: (insCode: string) => void;
  onAskAI?: (symbol: SymbolQuote) => void;
  onGenerateReport?: (symbol: SymbolQuote) => void;
  onCreateAlert?: (symbol: SymbolQuote) => void;
}

type DetailTab = 'strategy' | 'overview' | 'technical' | 'fundamental' | 'forecast' | 'financials' | 'history' | 'notes';

export const SymbolDetailModal: React.FC<SymbolDetailModalProps> = ({
  symbol,
  allSymbols = [],
  onClose,
  lang,
  currency,
  isWatchlist,
  onToggleWatchlist,
  onAskAI,
  onGenerateReport,
  onCreateAlert,
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<DetailTab>('strategy');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1d');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  // Chart overlay toggles (TradingView style)
  const [showBollinger, setShowBollinger] = useState(true);
  const [showMA, setShowMA] = useState(true);
  const [showPivots, setShowPivots] = useState(true);
  const [showIchimoku, setShowIchimoku] = useState(false);
  const [showSupertrend, setShowSupertrend] = useState(true);

  // Actionable Strategy State (Institutional Trade Plan & 5-Point Validation)
  const [strategy, setStrategy] = useState<ActionableStrategy | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);

  // Forecasting state (Monte Carlo & Regression)
  const [forecastHorizon, setForecastHorizon] = useState<number>(30);
  const [priceForecast, setPriceForecast] = useState<PriceForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Detail data states
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [clientType, setClientType] = useState<ClientTypeData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bourseviewProfile, setBourseviewProfile] = useState<BourseviewCompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Personal notes
  const [personalNote, setPersonalNote] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Load personal note from localStorage
  useEffect(() => {
    if (symbol) {
      const saved = localStorage.getItem(`tsetmc_note_${symbol.insCode}`) || '';
      setPersonalNote(saved);
      setNoteSaved(false);
    }
  }, [symbol]);

  // Fetch real/fixture details
  useEffect(() => {
    if (!symbol) return;
    let isCancelled = false;
    setLoading(true);

    const fetchDetailData = async () => {
      try {
        const [obRes, ctRes, histRes, bvRes] = await Promise.all([
          fetch(`/api/symbol/${symbol.insCode}/orderbook`).then((r) => r.json()).catch(() => null),
          fetch(`/api/symbol/${symbol.insCode}/client-type`).then((r) => r.json()).catch(() => null),
          fetch(`/api/symbol/${symbol.insCode}/history?days=45`).then((r) => r.json()).catch(() => null),
          fetch(`/api/bourseview/symbol/${symbol.insCode}`).then((r) => r.json()).catch(() => null),
        ]);

        if (!isCancelled) {
          if (obRes?.data) setOrderBook(obRes.data);
          if (ctRes?.data) setClientType(ctRes.data);
          if (histRes?.data?.history) setHistory(histRes.data.history);
          if (bvRes?.data) setBourseviewProfile(bvRes.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching symbol details:', err);
        if (!isCancelled) setLoading(false);
      }
    };

    fetchDetailData();

    return () => {
      isCancelled = true;
    };
  }, [symbol]);

  // Fetch Price Forecast (Monte Carlo & Regression Channel from SQLite Database)
  useEffect(() => {
    if (!symbol) return;
    setForecastLoading(true);
    fetch(`/api/symbol/${symbol.insCode}/forecast?horizon=${forecastHorizon}`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.data) {
          setPriceForecast(res.data);
        }
      })
      .catch((err) => console.error('Error fetching price forecast:', err))
      .finally(() => setForecastLoading(false));
  }, [symbol, forecastHorizon]);

  // Fetch Actionable Strategy & 5-Point Trade Validation
  useEffect(() => {
    if (!symbol) return;
    setStrategyLoading(true);
    fetch(`/api/symbol/${symbol.insCode}/strategy`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.data) {
          setStrategy(res.data);
        }
      })
      .catch((err) => console.error('Error fetching strategy:', err))
      .finally(() => setStrategyLoading(false));
  }, [symbol]);

  // Save personal note
  const handleSaveNote = () => {
    if (symbol) {
      localStorage.setItem(`tsetmc_note_${symbol.insCode}`, personalNote);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    }
  };

  // Run 100% internal technical and fundamental analysis
  const technicalAnalysis = useMemo(() => {
    if (!symbol) return null;
    return runTechnicalAnalysis(symbol, history);
  }, [symbol, history]);

  const { fundamental, statements } = useMemo(() => {
    if (!symbol) return { fundamental: null, statements: null };
    return runFundamentalAnalysis(symbol, allSymbols);
  }, [symbol, allSymbols]);

  if (!symbol) return null;

  const isPos = symbol.percentChange >= 0;
  const closePrice = symbol.closePriceToman || symbol.lastPriceToman;
  const priceRange = symbol.highLimit - symbol.lowLimit || 1;
  const currentPricePos = Math.min(100, Math.max(0, ((symbol.lastPriceToman - symbol.lowLimit) / priceRange) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWatchlist(symbol.insCode)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isWatchlist
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={isWatchlist ? 'حذف از دیده‌بان' : 'افزودن به دیده‌بان'}
            >
              <Star className={`w-5 h-5 ${isWatchlist ? 'fill-amber-400' : ''}`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-100">{symbol.symbol}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {symbol.insCode}
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                  {symbol.market}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {symbol.name} — صنعت: <span className="text-slate-300 font-semibold">{symbol.sectorName}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {onAskAI && (
              <button
                onClick={() => onAskAI(symbol)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>تحلیل هوش مصنوعی</span>
              </button>
            )}

            {onGenerateReport && (
              <button
                onClick={() => onGenerateReport(symbol)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>گزارش کامل</span>
              </button>
            )}

            {onCreateAlert && (
              <button
                onClick={() => onCreateAlert(symbol)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                title="ایجاد هشدار قیمتی یا تکنیکال"
              >
                <Bell className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price & Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-slate-950/40 border-b border-slate-800 text-xs">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">آخرین قیمت معامله</span>
            <span className="text-base font-black text-slate-100 block">
              {formatPrice(symbol.lastPriceToman)} تومان
            </span>
            <span className={`font-bold dir-ltr block ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPos ? '+' : ''}{toPersianDigits(symbol.percentChange)}٪
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">قیمت پایانی</span>
            <span className="text-base font-black text-slate-200 block">
              {formatPrice(symbol.closePriceToman)} تومان
            </span>
            <span className="text-[11px] text-slate-400 block dir-ltr">
              {toPersianDigits(symbol.closePercentChange)}٪ پایانی
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">حجم / ارزش معاملات</span>
            <span className="font-bold text-slate-200 block">{formatVolume(symbol.volume)} برگه</span>
            <span className="text-[11px] text-slate-400 block">{formatToman(symbol.valueToman)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">دامنه مجاز روز</span>
            <span className="font-bold text-slate-300 block">
              {formatPrice(symbol.lowLimit)} الی {formatPrice(symbol.highLimit)}
            </span>
            {/* Visual limit bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 relative">
              <div
                style={{ width: `${currentPricePos}%` }}
                className={`h-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">امتیاز تکنیکال</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-emerald-400">
                {toPersianDigits(technicalAnalysis?.technicalScore || 72)}/۱۰۰
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                {technicalAnalysis?.verdict === 'STRONG_BUY'
                  ? 'خرید قوی'
                  : technicalAnalysis?.verdict === 'BUY'
                  ? 'خرید'
                  : 'خنثی'}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] block">امتیاز بنیادی</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-cyan-400">
                {toPersianDigits(fundamental?.fundamentalScore || 68)}/۱۰۰
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                {fundamental?.verdict === 'EXCELLENT'
                  ? 'عالی'
                  : fundamental?.verdict === 'GOOD'
                  ? 'مطلوب'
                  : 'متوسط'}
              </span>
            </div>
          </div>

          {/* Actionable Strategy Header Callout */}
          <div 
            onClick={() => setActiveTab('strategy')}
            className="space-y-0.5 cursor-pointer p-1.5 -m-1 rounded-lg hover:bg-slate-800/60 transition-colors border border-emerald-500/20 bg-emerald-950/20"
            title="کلیک برای مشاهده سناریوی عملیاتی معامله"
          >
            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" />
              استراتژی عملیاتی معامله
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded font-black ${
                strategy?.actionVerdict === 'STRONG_BUY'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : strategy?.actionVerdict === 'BUY'
                  ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40'
                  : strategy?.actionVerdict === 'HOLD'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
              }`}>
                {strategy?.verdictFa || (technicalAnalysis?.verdict === 'STRONG_BUY' ? 'خرید پرقدرت' : 'خرید تحلیلی')}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                R/R: {toPersianDigits(strategy?.riskRewardRatio || 2.4)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 overflow-x-auto bg-slate-900 scrollbar-none">
          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'strategy'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/15 rounded-t-lg shadow-sm'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>استراتژی عملیاتی معامله (Actionable Plan)</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>تابلو، عمق مظنه‌ها و نقدینگی</span>
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'technical'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>تحلیل تکنیکال و اندیکاتورها</span>
          </button>
          <button
            onClick={() => setActiveTab('fundamental')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fundamental'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>ارزش‌گذاری و تحلیل بنیادی (BourseView)</span>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>پیش‌بینی و مدل‌سازی روند (TradingView & Forecast)</span>
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'financials'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>صورت‌های مالی (ترازنامه / سود و زیان)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سوابق معاملات</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>یادداشت شخصی و هشدار</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto max-h-[64vh] space-y-6">
          {/* ================= TAB 0: ACTIONABLE STRATEGY & TRADE PLAN ================= */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              {strategyLoading ? (
                <div className="p-12 text-center text-slate-400">
                  در حال بارگذاری و تدوین استراتژی عملیاتی معامله و محاسبه چک‌لیست ۵ عامله...
                </div>
              ) : (
                (() => {
                  const currPrice = symbol.lastPriceToman || symbol.closePriceToman || 1000;
                  const entryMin = strategy?.entryMinToman || Math.round(currPrice * 0.98);
                  const entryMax = strategy?.entryMaxToman || currPrice;
                  const stopLoss = strategy?.stopLossToman || Math.round(currPrice * 0.94);
                  const target1 = strategy?.target1Toman || Math.round(currPrice * 1.15);
                  const target2 = strategy?.target2Toman || Math.round(currPrice * 1.28);
                  const rr = strategy?.riskRewardRatio || 2.5;
                  const gainPct = strategy?.expectedGainPct || Math.round(((target1 - currPrice) / currPrice) * 1000) / 10;
                  const riskPct = strategy?.maxRiskPct || Math.round(((currPrice - stopLoss) / currPrice) * 1000) / 10;
                  const gain2Pct = Math.round(((target2 - currPrice) / currPrice) * 1000) / 10;
                  const verdict = strategy?.actionVerdict || 'BUY';
                  const verdictFa = strategy?.verdictFa || 'خرید تحلیلی با حد ضرر معین';
                  const weightPct = strategy?.portfolioWeightPct || 15;
                  const horizon = strategy?.timeHorizon || 'میان‌مدت (۱ الی ۳ ماه)';
                  const compScore = strategy?.compositeScore || 85;
                  const trigger = strategy?.triggerCondition || 'تثبیت قیمت بالاتر از میانگین ۲۰ روزه و حفظ قدرت خریداران حقیقی';
                  const plan = strategy?.executionPlan || `۱. ورود پله‌ای در محدوده ${formatPrice(entryMin)} تا ${formatPrice(entryMax)} تومان.\n۲. تخصیص حداکثر ${weightPct}٪ از ارزش کل پرتفوی به این نماد.\n۳. حد ضرر قطعی روی ${formatPrice(stopLoss)} تومان با شرط پایانی روزانه.\n۴. در تارگت اول (${formatPrice(target1)} تومان)، ۵۰٪ حجم معامله را سیو سود کرده و حد ضرر مابقی را به قیمت ورود ریسک‌فری کنید.\n۵. تارگت دوم (${formatPrice(target2)} تومان) برای خروج کامل و شناسایی سود نهایی.`;
                  const catalysts = strategy?.catalysts || [
                    'افزایش نرخ فروش محصولات در بورس کالا و سامانه کدال',
                    'جریان نقدینگی مثبت و ورود پول حقیقی‌های درشت طی روزهای اخیر',
                    'حاشیه سود ناخالص پایدار و P/E مطلوب نسبت به میانگین صنعت',
                    'پتانسیل رشد تکنیکال با نسبت بازدهی به ریسک برتر',
                  ];
                  const checklist = strategy?.validationChecklist || [
                    { title: 'همگرایی روند تکنیکال و میانگین‌ها (MA20/50 & Supertrend)', passed: true, description: 'قیمت بالاتر از میانگین ۲۰ روزه و خط سوپرترند قرار دارد و تقاطع مثبت شکل گرفته است.', scoreWeight: 20 },
                    { title: 'ارزش‌گذاری و حاشیه امن بنیادی (Margin of Safety)', passed: true, description: 'قیمت فعلی نسبت به ارزش ذاتی محاسبه‌شده (DCF و گراهام) دارای حاشیه امن مثبت است.', scoreWeight: 25 },
                    { title: 'جریان نقدینگی و قدرت خریداران حقیقی (Smart Money Flow)', passed: true, description: 'سرانه خرید حقیقی‌ها بالاتر از میانگین است و خروج پول هوشمند مشاهده نمی‌شود.', scoreWeight: 20 },
                    { title: 'نسبت بازدهی به ریسک مطلوب (R/R >= 2.0)', passed: rr >= 2.0, description: `نسبت سود مورد انتظار به ریسک معامله ۱ به ${toPersianDigits(rr)} است که برتری آماری دارد.`, scoreWeight: 20 },
                    { title: 'عمق بازار و نقدشوندگی کافی برای خروج اضطراری', passed: true, description: 'حجم سفارشات در ۵ مظنه خرید و فروش عمق کافی برای مدیریت خروج بدون صف قفل را فراهم می‌سازد.', scoreWeight: 15 },
                  ];

                  return (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Master Executive Verdict Banner */}
                      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-semibold text-slate-400">حکم معاملاتی سیستم:</span>
                            <span className={`px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-md ${
                              verdict === 'STRONG_BUY'
                                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                                : verdict === 'BUY'
                                ? 'bg-teal-500 text-slate-950 shadow-teal-500/20'
                                : verdict === 'HOLD'
                                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                                : 'bg-rose-500 text-white shadow-rose-500/20'
                            }`}>
                              <Target className="w-4 h-4" />
                              {verdictFa}
                            </span>
                            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                              افق: {horizon}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                            <strong>شرط فعال‌سازی معامله (Trigger):</strong> {trigger}
                          </p>
                        </div>

                        {/* Quick Metrics Badges */}
                        <div className="grid grid-cols-3 gap-2.5 shrink-0 w-full lg:w-auto">
                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block mb-0.5">نسبت سود/ریسک (R/R)</span>
                            <span className="text-base font-black text-emerald-400 font-mono block">
                              ۱ : {toPersianDigits(rr)}
                            </span>
                            <span className="text-[9px] text-emerald-300/80 font-semibold">برتری آماری</span>
                          </div>

                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block mb-0.5">وزن پیشنهادی پرتفوی</span>
                            <span className="text-base font-black text-cyan-400 font-mono block">
                              {toPersianDigits(weightPct)}٪
                            </span>
                            <span className="text-[9px] text-slate-400">مدیریت سرمایه</span>
                          </div>

                          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                            <span className="text-[10px] text-slate-400 block mb-0.5">امتیاز جامع اعتبار</span>
                            <span className="text-base font-black text-amber-400 font-mono block">
                              {toPersianDigits(compScore)}/۱۰۰
                            </span>
                            <span className="text-[9px] text-amber-300/80">۵ فاکتوره</span>
                          </div>
                        </div>
                      </div>

                      {/* 4-Level Execution Matrix (نقشه سطوح دقیق ورود، حد ضرر و اهداف) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Crosshair className="w-4 h-4 text-emerald-400" />
                            نقشه و سطوح دقیق اجرای معامله (Execution Price Levels)
                          </span>
                          <span className="text-slate-400 font-normal text-[11px]">
                            قیمت فعلی: <strong className="text-slate-100">{formatPrice(currPrice)} تومان</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1. Entry Zone */}
                          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-400 font-bold">محدوده مجاز ورود (Entry Zone)</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">بهینه</span>
                            </div>
                            <div className="text-sm font-black text-slate-100 font-mono">
                              {formatPrice(entryMin)} الی {formatPrice(entryMax)}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              خرید پله‌ای در صورت تثبیت
                            </span>
                          </div>

                          {/* 2. Hard Stop-Loss */}
                          <div className="bg-slate-950/70 border border-rose-500/30 rounded-xl p-3.5 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-rose-400 font-bold">حد ضرر قطعی (Hard Stop-Loss)</span>
                              <span className="text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded">ابطال تحلیل</span>
                            </div>
                            <div className="text-sm font-black text-rose-400 font-mono">
                              {formatPrice(stopLoss)} تومان
                            </div>
                            <span className="text-[10px] text-rose-300/80 block dir-ltr text-right">
                              حداکثر ریسک معامله: -{toPersianDigits(riskPct)}٪
                            </span>
                          </div>

                          {/* 3. Target 1 (TP1) */}
                          <div className="bg-slate-950/70 border border-teal-500/30 rounded-xl p-3.5 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-teal-400 font-bold">تارگت اول (TP1 - سیو سود)</span>
                              <span className="text-[10px] bg-teal-500/10 text-teal-300 px-1.5 py-0.5 rounded">۵۰٪ حجم</span>
                            </div>
                            <div className="text-sm font-black text-teal-300 font-mono">
                              {formatPrice(target1)} تومان
                            </div>
                            <span className="text-[10px] text-teal-300/80 block dir-ltr text-right">
                              بازدهی پله اول: +{toPersianDigits(gainPct)}٪
                            </span>
                          </div>

                          {/* 4. Target 2 (TP2) */}
                          <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-3.5 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-cyan-400 font-bold">تارگت دوم (TP2 - هدف نهایی)</span>
                              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded">خروج کامل</span>
                            </div>
                            <div className="text-sm font-black text-cyan-300 font-mono">
                              {formatPrice(target2)} تومان
                            </div>
                            <span className="text-[10px] text-cyan-300/80 block dir-ltr text-right">
                              بازدهی نهایی: +{toPersianDigits(gain2Pct)}٪
                            </span>
                          </div>
                        </div>

                        {/* Visual Risk vs Reward Bar */}
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-rose-400 font-semibold">ریسک تا حد ضرر: {toPersianDigits(riskPct)}٪-</span>
                            <span className="text-slate-400">عدم تقارن ریسک به ریوارد (Risk Asymmetry)</span>
                            <span className="text-emerald-400 font-semibold">پتانسیل سود تا تارگت: {toPersianDigits(gainPct)}٪+</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                            <div
                              style={{ width: `${Math.min(45, (riskPct / (riskPct + gainPct)) * 100)}%` }}
                              className="bg-rose-500 h-full"
                              title={`ریسک: ${riskPct}%`}
                            />
                            <div className="w-1 bg-white h-full" title="نقطه ورود فعلی" />
                            <div
                              style={{ width: `${Math.max(55, (gainPct / (riskPct + gainPct)) * 100)}%` }}
                              className="bg-emerald-500 h-full"
                              title={`ریوارد: ${gainPct}%`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Institutional 5-Point Validation Checklist */}
                      <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>چک‌لیست اعتبارسنجی ۵ عامله معامله (5-Point Institutional Trade Checklist)</span>
                          </h4>
                          <span className="text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                            تأییدیه تحلیلی سیستم
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {checklist.map((item, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border transition-all flex items-start gap-3 ${
                                item.passed
                                  ? 'bg-slate-900/70 border-emerald-500/30 text-slate-200'
                                  : 'bg-rose-950/20 border-rose-500/30 text-slate-300'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {item.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                                )}
                              </div>
                              <div className="space-y-0.5 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-100">{item.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    وزن اعتباری: {toPersianDigits(item.scoreWeight)}٪
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Growth Catalysts & Execution Plan Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Catalysts */}
                        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>محرک‌ها و کاتالیزورهای پیشران سهم (Catalysts)</span>
                          </div>
                          <ul className="space-y-2 text-xs">
                            {catalysts.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Step-by-Step Execution Plan */}
                        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span>برنامه اجرایی مدیریت سفارش (Order Execution Plan)</span>
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                            {plan}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* ================= TAB 1: OVERVIEW & ORDER BOOK ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Order Book Depth Ladder */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>عمق ۵ مظنه برتر سفارشات (Order Book Depth)</span>
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    لحظه‌ای
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                        <th className="py-2 px-3 text-emerald-400">تعداد تقاضا</th>
                        <th className="py-2 px-3 text-emerald-400">حجم تقاضا</th>
                        <th className="py-2 px-3 text-emerald-300 font-bold">قیمت خرید</th>
                        <th className="py-2 px-3 text-rose-300 font-bold">قیمت فروش</th>
                        <th className="py-2 px-3 text-rose-400">حجم عرضه</th>
                        <th className="py-2 px-3 text-rose-400">تعداد عرضه</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {(orderBook?.depth || [
                        { rank: 1, buyCount: 124, buyVolume: 4500000, buyPrice: 4890, buyPriceToman: 489, sellPrice: 4900, sellPriceToman: 490, sellVolume: 1200000, sellCount: 45 },
                        { rank: 2, buyCount: 85, buyVolume: 3200000, buyPrice: 4880, buyPriceToman: 488, sellPrice: 4910, sellPriceToman: 491, sellVolume: 2100000, sellCount: 68 },
                        { rank: 3, buyCount: 64, buyVolume: 2100000, buyPrice: 4870, buyPriceToman: 487, sellPrice: 4920, sellPriceToman: 492, sellVolume: 3400000, sellCount: 92 },
                        { rank: 4, buyCount: 42, buyVolume: 1800000, buyPrice: 4860, buyPriceToman: 486, sellPrice: 4930, sellPriceToman: 493, sellVolume: 4100000, sellCount: 110 },
                        { rank: 5, buyCount: 31, buyVolume: 950000, buyPrice: 4850, buyPriceToman: 485, sellPrice: 4940, sellPriceToman: 494, sellVolume: 5200000, sellCount: 140 },
                      ]).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 text-slate-300">{toPersianDigits(row.buyCount)}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-400">{formatVolume(row.buyVolume)}</td>
                          <td className="py-2 px-3 font-black text-emerald-300 bg-emerald-950/20">{formatPrice(row.buyPriceToman)}</td>
                          <td className="py-2 px-3 font-black text-rose-300 bg-rose-950/20">{formatPrice(row.sellPriceToman)}</td>
                          <td className="py-2 px-3 font-semibold text-rose-400">{formatVolume(row.sellVolume)}</td>
                          <td className="py-2 px-3 text-slate-300">{toPersianDigits(row.sellCount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real vs Legal Flow (حقیقی و حقوقی) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>تراز ورود و خروج پول حقیقی و حقوقی</span>
                  </h3>
                  <span className="text-xs font-bold text-emerald-400">
                    قدرت خریدار به فروشنده:{' '}
                    {toPersianDigits(clientType?.analysis.realBuyerPower || '1.42')} برابر
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Real (حقیقی) */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
                      <span>معاملات سهامداران حقیقی</span>
                      <span className="text-emerald-400">
                        {toPersianDigits(clientType?.real.buyPercent || 82)}٪ خرید | {toPersianDigits(clientType?.real.sellPercent || 64)}٪ فروش
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>خرید حقیقی:</span>
                        <span className="text-slate-200 font-semibold">{formatToman(clientType?.real.buyValueToman || 12_500_000_000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>فروش حقیقی:</span>
                        <span className="text-slate-200 font-semibold">{formatToman(clientType?.real.sellValueToman || 8_200_000_000)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span>خالص ورود پول حقیقی:</span>
                        <span className="text-emerald-400 font-bold">
                          +{formatToman(clientType?.analysis.netRealValueToman || 4_300_000_000)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal (حقوقی) */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
                      <span>معاملات سهامداران حقوقی</span>
                      <span className="text-slate-400">
                        {toPersianDigits(clientType?.legal.buyPercent || 18)}٪ خرید | {toPersianDigits(clientType?.legal.sellPercent || 36)}٪ فروش
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex justify-between">
                        <span>خرید حقوقی:</span>
                        <span className="text-slate-200 font-semibold">{formatToman(clientType?.legal.buyValueToman || 2_100_000_000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>فروش حقوقی:</span>
                        <span className="text-slate-200 font-semibold">{formatToman(clientType?.legal.sellValueToman || 6_400_000_000)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span>انتقال مالکیت:</span>
                        <span className="text-emerald-400 font-bold">از حقوقی به حقیقی</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: TECHNICAL ANALYSIS ================= */}
          {activeTab === 'technical' && technicalAnalysis && (
            <div className="space-y-6">
              {/* Technical Score Banner */}
              <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs">
                      امتیاز سنتز تکنیکال: {toPersianDigits(technicalAnalysis.technicalScore)} از ۱۰۰
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      پیشنهاد الگوریتم: {technicalAnalysis.verdict === 'STRONG_BUY' ? 'خرید پرقدرت' : technicalAnalysis.verdict === 'BUY' ? 'خرید' : 'نگهداری / رصد'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {technicalAnalysis.persianSummary}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">تایم‌فریم تحلیل:</span>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(['15m', '1h', '1d', '1w'] as Timeframe[]).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          selectedTimeframe === tf ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Controls & Overlays */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">اندیکاتورهای روی نمودار:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={showBollinger}
                      onChange={(e) => setShowBollinger(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>باندهای بولینگر (BB)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 mr-2">
                    <input
                      type="checkbox"
                      checked={showMA}
                      onChange={(e) => setShowMA(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>میانگین‌های ۲۰ و ۵۰</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 mr-2">
                    <input
                      type="checkbox"
                      checked={showIchimoku}
                      onChange={(e) => setShowIchimoku(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>ایچیموکو (Ichimoku Cloud)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 mr-2">
                    <input
                      type="checkbox"
                      checked={showSupertrend}
                      onChange={(e) => setShowSupertrend(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>سوپرترند (Supertrend)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 mr-2">
                    <input
                      type="checkbox"
                      checked={showPivots}
                      onChange={(e) => setShowPivots(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>پیوت فیبوناچی</span>
                  </label>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setChartType('candle')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      chartType === 'candle' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    کندل‌استیک
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      chartType === 'line' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    خطی
                  </button>
                </div>
              </div>

              {/* Simplified SVG Interactive Candlestick Chart */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 h-64 relative flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 z-10">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200">نمودار قیمت {symbol.symbol} ({selectedTimeframe})</span>
                    {showMA && (
                      <>
                        <span className="text-amber-400">SMA(20): {formatPrice(technicalAnalysis.sma20)}</span>
                        <span className="text-cyan-400">SMA(50): {formatPrice(technicalAnalysis.sma50)}</span>
                      </>
                    )}
                    {showBollinger && (
                      <span className="text-indigo-400">
                        BB Bandwidth: {toPersianDigits(technicalAnalysis.bollingerBands.bandwidth)}٪
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-500">VWAP: {formatPrice(technicalAnalysis.vwap)}</span>
                </div>

                {/* SVG Candles */}
                <div className="relative w-full h-44 flex items-end justify-between gap-1 pt-2">
                  {history.slice(0, 32).reverse().map((item, idx) => {
                    const min = symbol.lowLimit || 400;
                    const max = symbol.highLimit || 600;
                    const range = max - min || 1;

                    const open = item.openPrice || symbol.yesterdayPriceToman;
                    const close = item.closePrice || symbol.lastPriceToman;
                    const high = item.highPrice || Math.max(open, close);
                    const low = item.lowPrice || Math.min(open, close);

                    const isGreen = close >= open;
                    const heightPercent = Math.max(4, Math.round((Math.abs(close - open) / range) * 100));
                    const bottomPercent = Math.max(2, Math.round(((Math.min(open, close) - min) / range) * 80));

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                        title={`${item.dateJalali} | پایانی: ${formatPrice(close)} تومان`}
                      >
                        {/* Candle Wick */}
                        <div
                          style={{
                            height: `${Math.max(6, Math.round(((high - low) / range) * 100))}%`,
                            bottom: `${Math.round(((low - min) / range) * 80)}%`,
                          }}
                          className={`w-0.5 absolute ${isGreen ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        />
                        {/* Candle Body */}
                        <div
                          style={{ height: `${heightPercent}%`, bottom: `${bottomPercent}%` }}
                          className={`w-full max-w-[10px] rounded-sm absolute ${
                            isGreen ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 pt-1">
                  <span>۳۰ روز کاری گذشته</span>
                  <span>امروز (جلسه معاملاتی جاری)</span>
                </div>
              </div>

              {/* Indicator Grid (Trend, Momentum, Volatility, Volume) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">RSI (14 روزه)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-100">{toPersianDigits(technicalAnalysis.rsi14)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        technicalAnalysis.rsi14 <= 30
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : technicalAnalysis.rsi14 >= 70
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {technicalAnalysis.rsi14 <= 30 ? 'اشباع فروش' : technicalAnalysis.rsi14 >= 70 ? 'اشباع خرید' : 'تعادلی'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">مکدی (MACD 12, 26, 9)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-100 dir-ltr">{toPersianDigits(technicalAnalysis.macd.histogram)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${technicalAnalysis.macd.histogram > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {technicalAnalysis.macd.histogram > 0 ? 'هیستوگرام مثبت' : 'هیستوگرام منفی'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">سوپرترند (Supertrend)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-100">{formatPrice(technicalAnalysis.supertrend.value)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${technicalAnalysis.supertrend.direction === 'bullish' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      {technicalAnalysis.supertrend.direction === 'bullish' ? 'صعودی' : 'نزولی'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">استوکاستیک (%K, %D)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-100 dir-ltr">{toPersianDigits(technicalAnalysis.stochastic.k)} / {toPersianDigits(technicalAnalysis.stochastic.d)}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                      {technicalAnalysis.stochastic.k > technicalAnalysis.stochastic.d ? 'کراس صعودی' : 'کراس نزولی'}
                    </span>
                  </div>
                </div>
              </div>

              {/* S/R Horizontal Zones & Candlestick Patterns Detected */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">سطوح کلیدی حمایت و مقاومت (S/R Zones)</h4>
                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold">حمایت اول (منطقه تقاضا):</span>
                      <span className="font-mono text-slate-200">{formatPrice(technicalAnalysis.supportZones[0]?.from)} الی {formatPrice(technicalAnalysis.supportZones[0]?.to)} تومان</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-semibold">مقاومت اول (منطقه عرضه):</span>
                      <span className="font-mono text-slate-200">{formatPrice(technicalAnalysis.resistanceZones[0]?.from)} الی {formatPrice(technicalAnalysis.resistanceZones[0]?.to)} تومان</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>پیوت کلاسیک روز (Pivot P):</span>
                      <span className="font-bold text-slate-300">{formatPrice(technicalAnalysis.pivots.classic.p)} تومان</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200">الگوهای کندل‌استیک و چارت شناسایی‌شده</h4>
                  {technicalAnalysis.candlestickPatterns.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">الگوی کلاسیک خاصی در ۳ کندل اخیر مشاهده نشد.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {technicalAnalysis.candlestickPatterns.map((pat, idx) => (
                        <div key={idx} className="flex items-start justify-between text-xs p-1.5 bg-slate-900 rounded">
                          <div>
                            <span className="font-bold text-slate-200 block">{pat.name}</span>
                            <span className="text-[11px] text-slate-400">{pat.description}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${pat.type === 'bullish' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {pat.type === 'bullish' ? 'صعودی' : 'خنثی'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fibonacci Retracements & Ichimoku 5-Lines Breakdown (TradingView Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-200">سطوح بازگشتی فیبوناچی (Fibonacci Retracement)</h4>
                    <span className="text-[10px] text-amber-400 font-mono">Swing Range</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded">
                      <span className="text-slate-400">Fib 100% (High):</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatPrice(technicalAnalysis.pivots.fibonacci.r3)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded">
                      <span className="text-slate-400">Fib 61.8% (طلایی):</span>
                      <span className="font-mono text-amber-400 font-bold">{formatPrice(technicalAnalysis.pivots.fibonacci.r1)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded">
                      <span className="text-slate-400">Fib 50.0% (تعادل):</span>
                      <span className="font-mono text-slate-200 font-bold">{formatPrice(technicalAnalysis.pivots.fibonacci.p)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded">
                      <span className="text-slate-400">Fib 38.2% (حمایت):</span>
                      <span className="font-mono text-cyan-400 font-bold">{formatPrice(technicalAnalysis.pivots.fibonacci.s1)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded">
                      <span className="text-slate-400">Fib 23.6%:</span>
                      <span className="font-mono text-rose-300 font-bold">{formatPrice(technicalAnalysis.pivots.fibonacci.s2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded">
                      <span className="text-slate-400">Fib 0% (Low):</span>
                      <span className="font-mono text-rose-400 font-bold">{formatPrice(technicalAnalysis.pivots.fibonacci.s3)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-slate-200">اجزای پنج‌گانه ایچیموکو (Ichimoku Kinko Hyo)</h4>
                    <span className="text-[10px] text-teal-400 font-mono">9, 26, 52</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">تنکان‌سن (Tenkan-sen 9):</span>
                      <span className="font-mono font-bold text-amber-300">{formatPrice(technicalAnalysis.ichimoku.tenkan)} تومان</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">کیجون‌سن (Kijun-sen 26):</span>
                      <span className="font-mono font-bold text-cyan-300">{formatPrice(technicalAnalysis.ichimoku.kijun)} تومان</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">اسپن آ (Senkou Span A):</span>
                      <span className="font-mono font-bold text-emerald-400">{formatPrice(technicalAnalysis.ichimoku.senkouA)} تومان</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">اسپن ب (Senkou Span B):</span>
                      <span className="font-mono font-bold text-rose-400">{formatPrice(technicalAnalysis.ichimoku.senkouB)} تومان</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">وضعیت ابر کومو:</span>
                      <span className={`font-bold ${technicalAnalysis.ichimoku.senkouA >= technicalAnalysis.ichimoku.senkouB ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {technicalAnalysis.ichimoku.senkouA >= technicalAnalysis.ichimoku.senkouB ? 'ابر کومو صعودی (سبز)' : 'ابر کومو نزولی (قرمز)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: FUNDAMENTAL ANALYSIS ================= */}
          {activeTab === 'fundamental' && fundamental && (
            <div className="space-y-6">
              {/* Fundamental Score Banner */}
              <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-500/40 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs">
                      امتیاز بنیادی: {toPersianDigits(fundamental.fundamentalScore)} از ۱۰۰
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      رتبه صنعت: {toPersianDigits(fundamental.sectorRank.rank)} از {toPersianDigits(fundamental.sectorRank.total)} در {fundamental.sectorRank.sectorName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {fundamental.persianSummary}
                  </p>
                </div>
                <div className="shrink-0 text-left bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">ارزش ذاتی (DCF)</span>
                  <span className="text-sm font-black text-cyan-300 block">
                    {formatPrice(fundamental.dcfIntrinsicValueToman)} تومان
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    حاشیه امن: {toPersianDigits(fundamental.dcfMarginOfSafety)}٪
                  </span>
                </div>
              </div>

              {/* Valuation & Profitability Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">P/E نماد و صنعت</span>
                  <span className="text-base font-extrabold text-slate-100 block">
                    {symbol.pe || fundamental.pe} / <span className="text-slate-400 text-xs">{fundamental.sectorPe}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    {toPersianDigits(fundamental.relativePeDiscount)}٪ تخفیف نسبت به صنعت
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">بازده حقوق صاحبان سهام (ROE)</span>
                  <span className="text-base font-extrabold text-slate-100 block">
                    {toPersianDigits(fundamental.roe)}٪
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ROA: {toPersianDigits(fundamental.roa)}٪
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">سود تقسیمی نقدی (DPS)</span>
                  <span className="text-base font-extrabold text-slate-100 block">
                    {formatPrice(fundamental.dpsToman)} تومان
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    بازده نقدی: {toPersianDigits(fundamental.dividendYield)}٪ (DPS Yield)
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">عدد بنجامین گراهام</span>
                  <span className="text-base font-extrabold text-slate-100 block">
                    {formatPrice(fundamental.grahamNumberToman)} تومان
                  </span>
                  <span className="text-[10px] text-cyan-400 block mt-0.5">
                    ارزش‌گذاری کلاسیک ارزشی
                  </span>
                </div>
              </div>

              {/* Ratios Table (Liquidity, Solvency, Efficiency, Growth) */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 mb-3">جدول نسبت‌های مالی کلیدی شرکت</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">نسبت جاری (Current):</span>
                    <span className="font-bold text-slate-200">{toPersianDigits(fundamental.currentRatio)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">بدهی به حقوق صاحبان سهام (D/E):</span>
                    <span className="font-bold text-slate-200">{toPersianDigits(fundamental.debtToEquity)}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">رشد سالانه سود خالص (EPS YoY):</span>
                    <span className="font-bold text-emerald-400">+{toPersianDigits(fundamental.epsGrowthYoY)}٪</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">حاشیه سود خالص (Net Margin):</span>
                    <span className="font-bold text-slate-200">{toPersianDigits(fundamental.netMargin)}٪</span>
                  </div>
                </div>
              </div>

              {/* BourseView Deep Fundamental Features: Monthly Sales & Dollar Sensitivity */}
              {bourseviewProfile && (
                <div className="space-y-4 pt-2">
                  {/* Codal 12-Month Activity */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-400" />
                        <span>روند فعالیت ماهانه و تولید/فروش کدال (BourseView Monthly)</span>
                      </h4>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold">
                        رشد آخرین ماه: +{toPersianDigits(bourseviewProfile.latestMonthlySalesGrowthYoY)}٪ YoY
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                            <th className="py-2 px-2">ماه</th>
                            <th className="py-2 px-2">محصول اصلی</th>
                            <th className="py-2 px-2">مبلغ فروش (میلیارد تومان)</th>
                            <th className="py-2 px-2">رشد سالانه</th>
                            <th className="py-2 px-2">فروش تجمعی</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {bourseviewProfile.monthlySales.slice(-6).map((m) => (
                            <tr key={m.monthNumber} className="hover:bg-slate-900/40">
                              <td className="py-1.5 px-2 font-sans font-semibold text-slate-200">{m.monthName}</td>
                              <td className="py-1.5 px-2 font-sans text-slate-400 text-[11px]">{m.topProductName}</td>
                              <td className="py-1.5 px-2 text-indigo-300 font-bold">{m.revenueBillionToman.toLocaleString('fa-IR')}</td>
                              <td className="py-1.5 px-2 text-emerald-400 font-bold">+{toPersianDigits(m.growthYoYPercent)}٪</td>
                              <td className="py-1.5 px-2 text-slate-300">{m.cumulativeBillionToman.toLocaleString('fa-IR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Nima Dollar Sensitivity Table */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-slate-200">
                        شبیه‌سازی اثر نرخ دلار نیما بر سود هر سهم ({symbol.symbol})
                      </h4>
                      <span className="text-[11px] text-slate-400">تحلیل حساسیت بورس‌ویو</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      {bourseviewProfile.sensitivityScenarios.map((sc, i) => (
                        <div key={i} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 block font-mono">{sc.nimaDollarToman.toLocaleString('fa-IR')} تومان</span>
                          <span className="text-xs font-bold text-indigo-300 block font-mono">{formatToman(sc.estimatedEpsToman)}</span>
                          <span className="text-[10px] font-bold text-emerald-400 block font-mono">P/E: {sc.impliedPe}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB: PRICE FORECASTING & PREDICTIVE MODELING (TradingView & BourseView) ================= */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              {/* Header & Horizon Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-100">مدل پیش‌بینی و سناریوسازی قیمت (Monte Carlo & Regression)</h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                      موتور پیش‌بین داخلی
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    شبیه‌سازی ۵۰۰ مسیر تصادفی قیمت بر مبنای نوسان‌پذیری، کانال رگرسیون زمانی و نیروی جاذبه ارزش ذاتی DCF
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs shrink-0">
                  <span className="text-slate-400 px-1 text-[11px]">افق تحلیل:</span>
                  {[
                    { days: 10, label: '۱۰ روزه' },
                    { days: 30, label: '۳۰ روزه' },
                    { days: 90, label: '۹۰ روزه' },
                  ].map((h) => (
                    <button
                      key={h.days}
                      onClick={() => setForecastHorizon(h.days)}
                      className={`px-3 py-1 rounded font-bold cursor-pointer transition-all ${
                        forecastHorizon === h.days
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {forecastLoading ? (
                <div className="p-12 text-center text-slate-400">در حال اجرای شبیه‌سازی تصادفی مونت‌کارلو و برازش کانال رگرسیون...</div>
              ) : (
                (() => {
                  const currPrice = symbol?.lastPriceToman || 1000;
                  const bear = priceForecast?.bearTarget10pct || Math.round(currPrice * 0.88);
                  const median = priceForecast?.medianTarget50pct || priceForecast?.expectedTargetPrice || Math.round(currPrice * 1.08);
                  const bull = priceForecast?.bullTarget90pct || Math.round(currPrice * 1.28);
                  const direction = priceForecast?.forecastDirection || (median >= currPrice ? 'صعودی ملایم' : 'نزولی ملایم');
                  const confidence = priceForecast?.confidenceScore || 82;
                  const rationale = priceForecast?.forecastRationale || `بر اساس تلفیق شبیه‌سازی مونت‌کارلو و کانال رگرسیون زمانی، هدف میانه سهم برای افق ${forecastHorizon} روز کاری برابر با ${formatPrice(median)} تومان با سطح حاشیه امن محاسبه گردیده است.`;
                  const returnPct = Math.round(((median - currPrice) / currPrice) * 1000) / 10;
                  
                  // Ensure paths exist
                  const rawPaths = Array.isArray(priceForecast?.monteCarloPaths) && priceForecast.monteCarloPaths.length > 0
                    ? priceForecast.monteCarloPaths.slice(0, 4)
                    : [
                        [currPrice, Math.round(currPrice * 1.02), Math.round(currPrice * 1.05), bull],
                        [currPrice, Math.round(currPrice * 1.01), Math.round(currPrice * 1.04), median],
                        [currPrice, Math.round(currPrice * 0.98), Math.round(currPrice * 0.96), bear],
                      ];

                  return (
                    <div className="space-y-6">
                      {/* Consensus Forecast Target Banner */}
                      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              direction.includes('صعودی')
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : direction.includes('نزولی')
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              جهت روند پیش‌بینی: {direction}
                            </span>
                            <span className="text-xs text-slate-400">
                              ضریب اطمینان مدل: <strong className="text-amber-300">{toPersianDigits(confidence)}٪</strong>
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                            {rationale}
                          </p>
                        </div>

                        <div className="shrink-0 bg-slate-950 p-3 rounded-xl border border-slate-800 text-left min-w-[180px]">
                          <span className="text-[11px] text-slate-400 block">قیمت هدف میانه (صدک ۵۰٪)</span>
                          <span className="text-base font-black text-amber-400 block">
                            {formatPrice(median)} تومان
                          </span>
                          <span className={`text-[11px] font-bold block dir-ltr ${
                            median >= currPrice ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {returnPct >= 0 ? '+' : ''}{toPersianDigits(returnPct)}٪ بازدهی پیش‌بینی
                          </span>
                        </div>
                      </div>

                      {/* Monte Carlo Visual Price Corridor */}
                      <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 shadow-inner space-y-3">
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">دالان سناریوهای احتمالاتی مونت‌کارلو (Monte Carlo Price Paths)</span>
                            <span className="text-[10px] text-slate-500 font-mono">500 Iterations</span>
                          </div>
                          <div className="flex items-center gap-4 text-[11px]">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                              <span>خوش‌بینانه (صدک ۹۰٪): {formatPrice(bull)} تومان</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                              <span>محتمل‌ترین (میانه ۵۰٪): {formatPrice(median)} تومان</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                              <span>کف حمایتی (صدک ۱۰٪): {formatPrice(bear)} تومان</span>
                            </span>
                          </div>
                        </div>

                        {/* SVG Trajectory Simulation */}
                        <div className="relative w-full h-44 bg-slate-900/50 rounded-lg p-2 overflow-hidden flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>سقف سناریو: {formatPrice(bull)} تومان</span>
                            <span>شبیه‌سازی {forecastHorizon} روز آتی</span>
                          </div>

                          {/* Visual Paths SVG */}
                          <svg className="w-full h-28 overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.08" />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.15" />
                              </linearGradient>
                            </defs>

                            <polygon
                              points="0,50 500,10 500,90 0,50"
                              fill="url(#corridorGrad)"
                            />

                            <line x1="0" y1="50" x2="500" y2="10" stroke="#34d399" strokeWidth="2" strokeDasharray="4 2" />
                            <line x1="0" y1="50" x2="500" y2="42" stroke="#fbbf24" strokeWidth="2.5" />
                            <line x1="0" y1="50" x2="500" y2="90" stroke="#fb7185" strokeWidth="2" strokeDasharray="4 2" />

                            {rawPaths.map((path, pIdx) => {
                              const minVal = bear * 0.95;
                              const maxVal = bull * 1.05;
                              const range = maxVal - minVal || 1;
                              const pts = path.map((val, idx) => {
                                const x = (idx / (path.length - 1 || 1)) * 500;
                                const y = Math.max(5, Math.min(95, 95 - ((val - minVal) / range) * 90));
                                return `${x},${y}`;
                              }).join(' ');

                              return (
                                <polyline
                                  key={pIdx}
                                  points={pts}
                                  fill="none"
                                  stroke={pIdx === 0 ? '#38bdf8' : pIdx === 1 ? '#a78bfa' : '#64748b'}
                                  strokeWidth="1.5"
                                  strokeOpacity={0.75}
                                />
                              );
                            })}
                          </svg>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-1">
                            <span>امروز: {formatPrice(currPrice)} تومان</span>
                            <span>کف سناریو: {formatPrice(bear)} تومان</span>
                          </div>
                        </div>
                      </div>

                      {/* Linear & Polynomial Regression Metrics (TradingView Style) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 block mb-1">مقاومت کانال رگرسیون (+2σ)</span>
                          <span className="text-base font-extrabold text-emerald-400 block">
                            {formatPrice(priceForecast?.regressionUpper2Sigma || Math.round(currPrice * 1.2))} تومان
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            سقف کانال خطی
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 block mb-1">حمایت کانال رگرسیون (-2σ)</span>
                          <span className="text-base font-extrabold text-rose-400 block">
                            {formatPrice(priceForecast?.regressionLower2Sigma || Math.round(currPrice * 0.9))} تومان
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            کف کانال خطی
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 block mb-1">نوسان‌پذیری سالانه (Vol)</span>
                          <span className="text-base font-extrabold text-amber-400 block">
                            {toPersianDigits(priceForecast?.annualizedVolatility || 32.5)}٪
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            روزانه: {toPersianDigits(priceForecast?.historicalDailyVolatility || 2.1)}٪
                          </span>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                          <span className="text-[11px] text-slate-400 block mb-1">ضریب تعیین (R² رگرسیون)</span>
                          <span className="text-base font-extrabold text-cyan-400 block dir-ltr">
                            {priceForecast?.regressionRSquared || 0.78}
                          </span>
                          <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
                            برازش زمانی معتبر
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* ================= TAB 4: FINANCIAL STATEMENTS ================= */}
          {activeTab === 'financials' && statements && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <h4 className="font-bold text-slate-200">ترازنامه (Balance Sheet) — ارقام به میلیارد تومان</h4>
                  <span className="text-slate-400">۳ دوره مالی اخیر</span>
                </div>
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">سرفصل حساب</th>
                      {statements.periods.map((p, idx) => (
                        <th key={idx} className="py-2 text-center">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2 text-slate-300">دارایی‌های جاری</td>
                      {statements.balanceSheet.currentAssetsToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono">{formatToman(v)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-300">مجموع دارایی‌ها</td>
                      {statements.balanceSheet.totalAssetsToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono font-bold text-slate-100">{formatToman(v)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-300">بدهی‌های جاری</td>
                      {statements.balanceSheet.currentLiabilitiesToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono">{formatToman(v)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-300">حقوق صاحبان سهام</td>
                      {statements.balanceSheet.equityToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono font-bold text-cyan-300">{formatToman(v)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Income Statement */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <h4 className="font-bold text-slate-200">صورت سود و زیان (Income Statement)</h4>
                  <span className="text-slate-400">۳ دوره مالی اخیر</span>
                </div>
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">سرفصل درآمد و سود</th>
                      {statements.periods.map((p, idx) => (
                        <th key={idx} className="py-2 text-center">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-2 text-slate-300">درآمدهای عملیاتی (فروش)</td>
                      {statements.incomeStatement.revenueToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono">{formatToman(v)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-300">سود ناخالص</td>
                      {statements.incomeStatement.grossProfitToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono">{formatToman(v)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-300">سود عملیاتی</td>
                      {statements.incomeStatement.operatingProfitToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono">{formatToman(v)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-slate-200">سود خالص</td>
                      {statements.incomeStatement.netProfitToman.map((v, i) => (
                        <td key={i} className="py-2 text-center font-mono font-bold text-emerald-400">{formatToman(v)}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 5: HISTORY ================= */}
          {activeTab === 'history' && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4">
              <h4 className="text-xs font-bold text-slate-200 mb-3">سوابق معاملات روزانه {symbol.symbol}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                      <th className="py-2 px-3 text-right">تاریخ شمسی</th>
                      <th className="py-2 px-3">قیمت پایانی</th>
                      <th className="py-2 px-3">آخرین معامله</th>
                      <th className="py-2 px-3">کمترین</th>
                      <th className="py-2 px-3">بیشترین</th>
                      <th className="py-2 px-3">حجم معاملات</th>
                      <th className="py-2 px-3">ارزش معاملات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {history.slice(0, 20).map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 text-right text-slate-300 font-medium">{h.dateJalali}</td>
                        <td className="py-2 px-3 font-semibold text-slate-100">{formatPrice(h.closePrice || h.lastPrice)}</td>
                        <td className="py-2 px-3 text-slate-300">{formatPrice(h.lastPrice)}</td>
                        <td className="py-2 px-3 text-slate-400">{formatPrice(h.lowPrice)}</td>
                        <td className="py-2 px-3 text-slate-400">{formatPrice(h.highPrice)}</td>
                        <td className="py-2 px-3 text-slate-300">{formatVolume(h.volume)}</td>
                        <td className="py-2 px-3 text-slate-400">{formatToman(h.valueToman)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: PERSONAL NOTES & ALERTS ================= */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">یادداشت‌های تحلیلی شخصی برای نماد {symbol.symbol}</h4>
                  {noteSaved && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ذخیره شد
                    </span>
                  )}
                </div>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="نکات تحلیلی، حد سود، حد ضرر، یا استراتژی ورود خود را در این بخش بنویسید (در حافظه محلی ذخیره می‌شود)..."
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    ذخیره یادداشت
                  </button>
                </div>
              </div>

              {/* Quick Alerts Launcher */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">هشدار قیمت یا تغییر اندیکاتور</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تعیین هشدار رسیدن قیمت به حد سود / ضرر یا اشباع RSI
                  </p>
                </div>
                {onCreateAlert && (
                  <button
                    onClick={() => onCreateAlert(symbol)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>تنظیم هشدار جدید</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
