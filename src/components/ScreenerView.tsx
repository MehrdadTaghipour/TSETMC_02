import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Play,
  Save,
  Download,
  Star,
  Bell,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  SavedScreener,
  ScreenerField,
  ScreenerFilterRule,
  ScreenerOperator,
  SymbolQuote,
} from '../types';
import { formatPercent, formatPrice, formatToman, formatVolume, toPersianDigits } from '../utils/formatters';
import { runTechnicalAnalysis } from '../utils/technicalAnalysis';
import { runFundamentalAnalysis } from '../utils/fundamentalAnalysis';

interface ScreenerViewProps {
  symbols: SymbolQuote[];
  watchlist: string[];
  onToggleWatchlist: (insCode: string) => void;
  onSelectSymbol: (symbol: SymbolQuote) => void;
  onCreateAlert?: (alertInfo: { title: string; screenerName: string }) => void;
}

// Preset Screeners
const PRESET_SCREENERS: SavedScreener[] = [
  {
    id: 'oversold_rsi',
    name: 'اشباع فروش (RSI < 30)',
    description: 'نمادهای ارزنده در کف قیمتی که شاخص قدرت نسبی آن‌ها زیر ۳۰ قرار دارد.',
    isPreset: true,
    rules: [{ field: 'rsi14', operator: 'lte', value: 32, label: 'RSI(14) کمتر از ۳۲' }],
  },
  {
    id: 'value_stocks',
    name: 'سهام ارزشی و ارزان (Value Stocks)',
    description: 'شرکت‌های با نسبت P/E زیر ۶ و بازده حقوق صاحبان سهام (ROE) بالاتر از ۲۰٪.',
    isPreset: true,
    rules: [
      { field: 'pe', operator: 'lte', value: 6.0, label: 'P/E کمتر یا مساوی ۶' },
      { field: 'roe', operator: 'gte', value: 20.0, label: 'ROE بالاتر از ۲۰٪' },
    ],
  },
  {
    id: 'dividend_plays',
    name: 'سهام با سود تقسیمی بالا (High Dividend Yield)',
    description: 'شرکت‌های با سود نقدی (DPS Yield) بالاتر از ۱۲٪ با بنیاد پایدار.',
    isPreset: true,
    rules: [{ field: 'dividendYield', operator: 'gte', value: 12.0, label: 'بازده سود نقدی بالاتر از ۱۲٪' }],
  },
  {
    id: 'golden_cross',
    name: 'تقاطع طلایی و روند صعودی (Golden Cross)',
    description: 'نمادهای با امتیاز تکنیکال بالای ۷۰ و استقرار در کانال صعودی.',
    isPreset: true,
    rules: [{ field: 'technicalScore', operator: 'gte', value: 70, label: 'امتیاز تکنیکال بالای ۷۰' }],
  },
  {
    id: 'bourseview_value_growth',
    name: 'بورس‌ویو: سهام زیر ارزش ذاتی (P/E < 6.5 & بنیاد > 70)',
    description: 'نمادهای گلچین بورس‌ویو با نمره بنیادی بالاتر از ۷۰، حاشیه امنیت سودآوری و P/E جذاب.',
    isPreset: true,
    rules: [
      { field: 'pe', operator: 'lte', value: 6.5, label: 'P/E کمتر یا مساوی ۶.۵' },
      { field: 'fundamentalScore', operator: 'gte', value: 70, label: 'امتیاز بنیادی بالای ۷۰' },
    ],
  },
  {
    id: 'bourseview_smart_money',
    name: 'بورس‌ویو: ورود پول هوشمند و تجمیع نقدینگی',
    description: 'شرکت‌های با ورود جریان خالص نقدینگی حقیقی و رشد قیمت معاملات روزانه.',
    isPreset: true,
    rules: [
      { field: 'realNetCashFlow', operator: 'gte', value: 2_000_000_000, label: 'ورود پول حقیقی بالای ۲ میلیارد تومان' },
      { field: 'percentChange', operator: 'gte', value: 1.5, label: 'رشد قیمت بالاتر از ۱.۵٪' },
    ],
  },
  {
    id: 'high_volume',
    name: 'حجم مشکوک و ورود پول (High Volume Surge)',
    description: 'نمادهای با ارزش معاملات سنگین و رشد مثبت قیمت روز.',
    isPreset: true,
    rules: [
      { field: 'percentChange', operator: 'gte', value: 2.0, label: 'رشد قیمت بیشتر از ۲٪' },
      { field: 'valueToman', operator: 'gte', value: 10_000_000_000, label: 'ارزش معاملات بالای ۱۰ میلیارد تومان' },
    ],
  },
];

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  symbols,
  watchlist,
  onToggleWatchlist,
  onSelectSymbol,
  onCreateAlert,
}) => {
  const [activeScreenerId, setActiveScreenerId] = useState<string>('oversold_rsi');
  const [savedScreeners, setSavedScreeners] = useState<SavedScreener[]>(() => {
    try {
      const stored = localStorage.getItem('tsetmc_saved_screeners');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current active filter rules
  const [currentRules, setCurrentRules] = useState<ScreenerFilterRule[]>(
    PRESET_SCREENERS[0].rules
  );
  const [newScreenerName, setNewScreenerName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New rule builder form states
  const [selectedField, setSelectedField] = useState<ScreenerField>('rsi14');
  const [selectedOperator, setSelectedOperator] = useState<ScreenerOperator>('lte');
  const [ruleValue, setRuleValue] = useState<number>(30);

  // Combine presets with user saved
  const allScreeners = useMemo(() => {
    return [...PRESET_SCREENERS, ...savedScreeners];
  }, [savedScreeners]);

  // Load a screener
  const handleSelectScreener = (scr: SavedScreener) => {
    setActiveScreenerId(scr.id);
    setCurrentRules([...scr.rules]);
  };

  // Add rule
  const handleAddRule = () => {
    const fieldLabels: Record<ScreenerField, string> = {
      pe: 'P/E',
      pb: 'P/B',
      eps: 'EPS سود هر سهم',
      rsi14: 'شاخص RSI',
      technicalScore: 'امتیاز تکنیکال',
      fundamentalScore: 'امتیاز بنیادی',
      percentChange: 'درصد تغییر قیمت',
      volume: 'حجم معاملات',
      valueToman: 'ارزش معاملات',
      realNetCashFlow: 'خالص پول حقیقی',
      marketCapToman: 'ارزش کل بازار',
      dividendYield: 'بازده نقدی سود',
      roe: 'بازده حقوق صاحبان سهام (ROE)',
      debtToEquity: 'نسبت بدهی به حقوق صاحبان سهام',
    };

    const opLabels: Record<ScreenerOperator, string> = {
      gt: 'بیشتر از',
      gte: 'بیشتر یا مساوی',
      lt: 'کمتر از',
      lte: 'کمتر یا مساوی',
      eq: 'برابر با',
      cross_above: 'تقاطع رو به بالا',
      cross_below: 'تقاطع رو به پایین',
    };

    const newRule: ScreenerFilterRule = {
      field: selectedField,
      operator: selectedOperator,
      value: ruleValue,
      label: `${fieldLabels[selectedField]} ${opLabels[selectedOperator]} ${ruleValue}`,
    };

    setCurrentRules([...currentRules, newRule]);
  };

  // Remove rule
  const handleRemoveRule = (index: number) => {
    setCurrentRules(currentRules.filter((_, i) => i !== index));
  };

  // Save custom screener
  const handleSaveScreener = () => {
    if (!newScreenerName.trim() || currentRules.length === 0) return;
    const newScreener: SavedScreener = {
      id: `custom_${Date.now()}`,
      name: newScreenerName.trim(),
      description: 'فیلتر شخصی سفارشی',
      isPreset: false,
      rules: currentRules,
    };
    const updated = [...savedScreeners, newScreener];
    setSavedScreeners(updated);
    localStorage.setItem('tsetmc_saved_screeners', JSON.stringify(updated));
    setActiveScreenerId(newScreener.id);
    setNewScreenerName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Delete custom screener
  const handleDeleteScreener = (id: string) => {
    const updated = savedScreeners.filter((s) => s.id !== id);
    setSavedScreeners(updated);
    localStorage.setItem('tsetmc_saved_screeners', JSON.stringify(updated));
    if (activeScreenerId === id) {
      setActiveScreenerId(PRESET_SCREENERS[0].id);
      setCurrentRules(PRESET_SCREENERS[0].rules);
    }
  };

  // Run filter against all symbols internally
  const screenedResults = useMemo(() => {
    if (currentRules.length === 0) return [];

    return symbols.filter((s) => {
      // Calculate technical and fundamental for this symbol
      const tech = runTechnicalAnalysis(s, []);
      const { fundamental } = runFundamentalAnalysis(s, symbols);

      return currentRules.every((rule) => {
        let val = 0;
        switch (rule.field) {
          case 'pe':
            val = s.pe || fundamental.pe;
            break;
          case 'pb':
            val = fundamental.pb;
            break;
          case 'eps':
            val = s.eps || fundamental.dpsToman;
            break;
          case 'rsi14':
            val = tech.rsi14;
            break;
          case 'technicalScore':
            val = tech.technicalScore;
            break;
          case 'fundamentalScore':
            val = fundamental.fundamentalScore;
            break;
          case 'percentChange':
            val = s.percentChange;
            break;
          case 'volume':
            val = s.volume;
            break;
          case 'valueToman':
            val = s.valueToman;
            break;
          case 'dividendYield':
            val = fundamental.dividendYield;
            break;
          case 'roe':
            val = fundamental.roe;
            break;
          case 'debtToEquity':
            val = fundamental.debtToEquity;
            break;
          default:
            val = 0;
        }

        if (rule.operator === 'gt') return val > rule.value;
        if (rule.operator === 'gte') return val >= rule.value;
        if (rule.operator === 'lt') return val < rule.value;
        if (rule.operator === 'lte') return val <= rule.value;
        if (rule.operator === 'eq') return val === rule.value;
        return true;
      });
    });
  }, [symbols, currentRules]);

  // Export results to CSV
  const handleExportCSV = () => {
    const headers = ['نماد', 'نام شرکت', 'آخرین قیمت (تومان)', 'درصد تغییر', 'ارزش معاملات (تومان)', 'حجم معاملات', 'P/E'];
    const rows = screenedResults.map((s) => [
      s.symbol,
      `"${s.name}"`,
      s.lastPriceToman,
      s.percentChange,
      s.valueToman,
      s.volume,
      s.pe || '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tsetmc_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
          <span>اسکرینر و فیلترساز حرفه‌ای (Screener Engine)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          غربالگری هوشمند سهام بر اساس ترکیبی از شروط تکنیکال، بنیادی، نقدینگی و تابلوخوانی بدون نیاز به کدنویسی
        </p>
      </div>

      {/* Preset and Saved Screeners Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
          <span className="font-bold text-slate-300">فیلترهای پیش‌فرض و ذخیره‌شده:</span>
          <span className="text-slate-400">{toPersianDigits(allScreeners.length)} فیلتر آماده</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allScreeners.map((scr) => (
            <div
              key={scr.id}
              onClick={() => handleSelectScreener(scr)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeScreenerId === scr.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{scr.name}</span>
              {!scr.isPreset && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteScreener(scr.id);
                  }}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Rules Editor & Rule Builder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <span>شروط فعال فیلتر:</span>
            <span className="text-emerald-400">({toPersianDigits(currentRules.length)} شرط)</span>
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="نام فیلتر جدید..."
              value={newScreenerName}
              onChange={(e) => setNewScreenerName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-36"
            />
            <button
              onClick={handleSaveScreener}
              disabled={!newScreenerName.trim()}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره فیلتر</span>
            </button>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ذخیره شد
              </span>
            )}
          </div>
        </div>

        {/* Existing Rules Pills */}
        <div className="flex flex-wrap gap-2">
          {currentRules.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300"
            >
              <span>{r.label}</span>
              <button
                onClick={() => handleRemoveRule(idx)}
                className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add New Rule Form */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">افزودن شرط جدید به فیلتر:</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value as ScreenerField)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="rsi14">شاخص RSI (۱۴ روزه)</option>
              <option value="technicalScore">امتیاز تکنیکال (۰ تا ۱۰۰)</option>
              <option value="fundamentalScore">امتیاز بنیادی (۰ تا ۱۰۰)</option>
              <option value="pe">نسبت P/E</option>
              <option value="pb">نسبت P/B</option>
              <option value="roe">بازده حقوق صاحبان سهام (ROE ٪)</option>
              <option value="dividendYield">بازده سود نقدی (DPS Yield ٪)</option>
              <option value="percentChange">درصد تغییر روزانه قیمت</option>
              <option value="valueToman">ارزش معاملات (تومان)</option>
              <option value="debtToEquity">نسبت بدهی به حقوق صاحبان سهام (D/E)</option>
            </select>

            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value as ScreenerOperator)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="lte">کمتر یا مساوی (≤)</option>
              <option value="gte">بزرگتر یا مساوی (≥)</option>
              <option value="lt">کمتر از (&lt;)</option>
              <option value="gt">بزرگتر از (&gt;)</option>
              <option value="eq">برابر با (=)</option>
            </select>

            <input
              type="number"
              value={ruleValue}
              onChange={(e) => setRuleValue(parseFloat(e.target.value) || 0)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <button
              onClick={handleAddRule}
              className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg p-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن شرط</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screened Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
              <span>نتایج غربالگری نمادها</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                {toPersianDigits(screenedResults.length)} نماد منطبق
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {onCreateAlert && (
              <button
                onClick={() =>
                  onCreateAlert({
                    title: 'هشدار تطابق فیلتر',
                    screenerName: allScreeners.find((s) => s.id === activeScreenerId)?.name || 'فیلتر اختصاصی',
                  })
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>تنظیم هشدار ورود نماد جدید</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={screenedResults.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی اکسل (CSV)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80">
                <th className="py-2.5 px-3 text-center w-10">★</th>
                <th className="py-2.5 px-3">نماد</th>
                <th className="py-2.5 px-3">نام شرکت</th>
                <th className="py-2.5 px-3">صنعت</th>
                <th className="py-2.5 px-3">قیمت پایانی</th>
                <th className="py-2.5 px-3">درصد تغییر</th>
                <th className="py-2.5 px-3">ارزش معاملات</th>
                <th className="py-2.5 px-3">P/E</th>
                <th className="py-2.5 px-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {screenedResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    هیچ نمادی با ترکیب شروط انتخاب‌شده تطابق ندارد. شروط را تعدیل فرمایید.
                  </td>
                </tr>
              ) : (
                screenedResults.map((s) => {
                  const isWatched = watchlist.includes(s.insCode);
                  const isPos = s.percentChange > 0;

                  return (
                    <tr
                      key={s.insCode}
                      onClick={() => onSelectSymbol(s)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(s.insCode);
                        }}
                      >
                        <button
                          className={`p-1 rounded cursor-pointer ${
                            isWatched ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-100">{s.symbol}</td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[160px]">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.sectorName}</td>
                      <td className="py-2.5 px-3 font-bold">{formatPrice(s.lastPriceToman)} تومان</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-black dir-ltr ${
                            isPos ? 'text-emerald-400' : s.percentChange < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {isPos ? '+' : ''}{toPersianDigits(s.percentChange)}٪
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{formatToman(s.valueToman)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{s.pe || '---'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded font-bold transition-colors">
                          مشاهده تحلیل
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
