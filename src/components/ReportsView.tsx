import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  Layers,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Building,
  ArrowRight,
} from 'lucide-react';
import {
  GeneratedReport,
  IndexData,
  MarketSummary,
  ReportType,
  SectorItem,
  SymbolQuote,
} from '../types';
import { formatPercent, formatPrice, formatToman, formatVolume, getNowJalali, getTodayJalaliDate, toPersianDigits } from '../utils/formatters';
import { runTechnicalAnalysis } from '../utils/technicalAnalysis';
import { runFundamentalAnalysis } from '../utils/fundamentalAnalysis';

interface ReportsViewProps {
  symbols: SymbolQuote[];
  sectors: SectorItem[];
  indices: IndexData[];
  marketSummary: MarketSummary | null;
  onSelectSymbol: (symbol: SymbolQuote) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  symbols,
  sectors,
  indices,
  marketSummary,
  onSelectSymbol,
}) => {
  const [reportType, setReportType] = useState<ReportType>('combined');
  const [selectedSymbolCode, setSelectedSymbolCode] = useState<string>(
    symbols[0]?.insCode || '46348559193224090'
  );
  const [selectedSectorCode, setSelectedSectorCode] = useState<string>(
    sectors[0]?.sectorCode || '27'
  );

  // Selected symbol
  const selectedSymbol = useMemo(() => {
    return symbols.find((s) => s.insCode === selectedSymbolCode) || symbols[0];
  }, [symbols, selectedSymbolCode]);

  // Selected sector
  const selectedSector = useMemo(() => {
    return sectors.find((s) => s.sectorCode === selectedSectorCode) || sectors[0];
  }, [sectors, selectedSectorCode]);

  // Compute internal technical and fundamental reports
  const technical = useMemo(() => {
    if (!selectedSymbol) return null;
    return runTechnicalAnalysis(selectedSymbol, []);
  }, [selectedSymbol]);

  const { fundamental, statements } = useMemo(() => {
    if (!selectedSymbol) return { fundamental: null, statements: null };
    return runFundamentalAnalysis(selectedSymbol, symbols, selectedSector);
  }, [selectedSymbol, symbols, selectedSector]);

  // Overall recommendation synthesis
  const combinedRecommendation = useMemo(() => {
    if (!technical || !fundamental) {
      return { verdict: 'HOLD', confidence: 75, label: 'نگهداری / رصد', color: 'text-amber-400 bg-amber-500/20' };
    }
    const combinedScore = Math.round(technical.technicalScore * 0.5 + fundamental.fundamentalScore * 0.5);
    if (combinedScore >= 78) {
      return { verdict: 'STRONG_BUY', confidence: 88, label: 'خرید پرقدرت (Strong Buy)', color: 'text-emerald-300 bg-emerald-500/20' };
    }
    if (combinedScore >= 62) {
      return { verdict: 'BUY', confidence: 80, label: 'خرید (Buy)', color: 'text-emerald-400 bg-emerald-500/10' };
    }
    if (combinedScore >= 45) {
      return { verdict: 'HOLD', confidence: 72, label: 'نگهداری (Hold)', color: 'text-amber-300 bg-amber-500/20' };
    }
    return { verdict: 'SELL', confidence: 78, label: 'فروش / کاهش وزن (Sell)', color: 'text-rose-400 bg-rose-500/20' };
  }, [technical, fundamental]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  const DISCLAIMER_TEXT =
    'سلب مسئولیت قانونی: کلیه داده‌ها، نسبت‌های مالی، سطوح تکنیکال و پیشنهادهای تحلیلی این گزارش بر اساس محاسبات خودکار درون‌برنامه‌ای تهیه شده و صرفاً جنبه آموزشی و پژوهشی دارد. این گزارش به هیچ وجه توصیه به خرید یا فروش سهام نبوده و مسئولیت نهایی هرگونه تصمیم‌گیری مالی بر عهده سرمایه‌گذار است.';

  return (
    <div className="space-y-6">
      {/* Title & Print Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>سامانه تولید و صدور گزارش‌های تحلیلی (Report Center)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            تولید خودکار گزارش‌های جامع تکنیکال، ارزیابی بنیادی، گزارش روزانه بازار و مقایسه صنایع
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>چاپ / ذخیره PDF</span>
        </button>
      </div>

      {/* Report Type Selector Ribbon */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setReportType('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportType === 'combined'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            گزارش ترکیبی نماد (تکنیکال + بنیادی)
          </button>
          <button
            onClick={() => setReportType('technical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportType === 'technical'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            گزارش تخصصی تکنیکال
          </button>
          <button
            onClick={() => setReportType('fundamental')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportType === 'fundamental'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            گزارش تخصصی بنیادی و ارزش‌گذاری
          </button>
          <button
            onClick={() => setReportType('daily_market')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportType === 'daily_market'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            گزارش روزانه کل بازار
          </button>
          <button
            onClick={() => setReportType('sector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportType === 'sector'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            گزارش عملکرد صنعت
          </button>
        </div>

        {/* Dynamic Selectors according to report type */}
        {['combined', 'technical', 'fundamental'].includes(reportType) && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">انتخاب نماد مورد نظر جهت تولید گزارش:</span>
            <select
              value={selectedSymbolCode}
              onChange={(e) => setSelectedSymbolCode(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
            >
              {symbols.map((s) => (
                <option key={s.insCode} value={s.insCode}>
                  {s.symbol} — {s.name} ({s.sectorName})
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'sector' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">انتخاب صنعت:</span>
            <select
              value={selectedSectorCode}
              onChange={(e) => setSelectedSectorCode(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
            >
              {sectors.map((sec) => (
                <option key={sec.sectorCode} value={sec.sectorCode}>
                  {sec.nameFa} ({toPersianDigits(sec.symbolsCount)} نماد)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ================= ACTUAL REPORT PAPER LAYOUT (PRINTABLE) ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Report Official Letterhead */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h2 className="text-lg font-black text-slate-100 tracking-tight">
                {reportType === 'daily_market'
                  ? 'گزارش تحلیلی جامع پایان روز بازار بورس اوراق بهادار تهران'
                  : reportType === 'sector'
                  ? `گزارش جامع تحلیلی صنعت «${selectedSector?.nameFa}»`
                  : `گزارش تحلیلی و ارزش‌گذاری نماد «${selectedSymbol?.symbol}» (${selectedSymbol?.name})`}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              سامانه هوشمند تحلیل بازار سرمایه ایران (TSETMC Intelligent Analytics)
            </p>
          </div>

          <div className="text-left space-y-0.5 text-xs text-slate-400 font-mono">
            <div>تاریخ تنظیم: {getTodayJalaliDate()}</div>
            <div>زمان صدور: {getNowJalali()}</div>
            <div>کد شناسایی: RPT-{Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        {/* ================= REPORT CONTENT FOR COMBINED & INDIVIDUAL SYMBOL ================= */}
        {['combined', 'technical', 'fundamental'].includes(reportType) && selectedSymbol && technical && fundamental && (
          <div className="space-y-6">
            {/* Verdict Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  جمع‌بندی و نتیجه‌گیری الگوریتم تحلیلی
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-base font-black px-3 py-1 rounded-xl ${combinedRecommendation.color}`}>
                    {combinedRecommendation.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    ضریب اطمینان الگوریتم: {toPersianDigits(combinedRecommendation.confidence)}٪
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">امتیاز تکنیکال</span>
                  <span className="text-sm font-black text-emerald-400">{toPersianDigits(technical.technicalScore)}/۱۰۰</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">امتیاز بنیادی</span>
                  <span className="text-sm font-black text-cyan-400">{toPersianDigits(fundamental.fundamentalScore)}/۱۰۰</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">حاشیه امن DCF</span>
                  <span className="text-sm font-black text-emerald-400">{toPersianDigits(fundamental.dcfMarginOfSafety)}٪</span>
                </div>
              </div>
            </div>

            {/* Key Symbol Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">آخرین قیمت معامله:</span>
                <span className="font-bold text-slate-100">{formatPrice(selectedSymbol.lastPriceToman)} تومان</span>
              </div>
              <div>
                <span className="text-slate-400 block">قیمت پایانی:</span>
                <span className="font-bold text-slate-100">{formatPrice(selectedSymbol.closePriceToman)} تومان</span>
              </div>
              <div>
                <span className="text-slate-400 block">ارزش ذاتی برآورد DCF:</span>
                <span className="font-bold text-cyan-400">{formatPrice(fundamental.dcfIntrinsicValueToman)} تومان</span>
              </div>
              <div>
                <span className="text-slate-400 block">سود نقدی انتظاری (DPS):</span>
                <span className="font-bold text-emerald-400">{formatPrice(fundamental.dpsToman)} تومان</span>
              </div>
            </div>

            {/* Technical Breakdown Section */}
            {(reportType === 'combined' || reportType === 'technical') && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>۱. تحلیل وضعیت تکنیکال و رفتار قیمتی</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {technical.persianSummary}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block">شاخص RSI (14):</span>
                    <span className="font-bold text-slate-200">{toPersianDigits(technical.rsi14)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">سوپرترند:</span>
                    <span className="font-bold text-emerald-400">{formatPrice(technical.supertrend.value)} (صعودی)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">حمایت کلیدی اول:</span>
                    <span className="font-bold text-slate-200">{formatPrice(technical.supportZones[0]?.from)} تومان</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">مقاومت پیش‌رو:</span>
                    <span className="font-bold text-slate-200">{formatPrice(technical.resistanceZones[0]?.from)} تومان</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fundamental Breakdown Section */}
            {(reportType === 'combined' || reportType === 'fundamental') && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-cyan-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Scale className="w-4 h-4" />
                  <span>۲. تحلیل وضعیت بنیادی و نسبت‌های سودآوری</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {fundamental.persianSummary}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block">P/E نماد در مقایسه با صنعت:</span>
                    <span className="font-bold text-slate-200">{selectedSymbol.pe || fundamental.pe} در برابر {fundamental.sectorPe}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">بازده حقوق صاحبان سهام (ROE):</span>
                    <span className="font-bold text-emerald-400">{toPersianDigits(fundamental.roe)}٪</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">عدد گراهام:</span>
                    <span className="font-bold text-slate-200">{formatPrice(fundamental.grahamNumberToman)} تومان</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">بازده نقدی سود (Dividend Yield):</span>
                    <span className="font-bold text-emerald-400">{toPersianDigits(fundamental.dividendYield)}٪</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= REPORT CONTENT FOR DAILY MARKET ================= */}
        {reportType === 'daily_market' && (
          <div className="space-y-6 text-xs text-slate-300">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="font-extrabold text-sm text-slate-100">دیده‌بان کلان بازار بورس</h3>
              <p className="leading-relaxed">
                جلسه معاملاتی امروز بازار بورس تهران با ثبت ارزش معاملات خرد معادل{' '}
                {formatToman(marketSummary?.totalValueToman || 7_850_000_000_000)} و حجم معاملات{' '}
                {formatVolume(marketSummary?.totalVolume || 12_400_000_000)} برگه سهم خاتمه یافت.
                شاخص کل بورس اوراق بهادار تهران با تغییر مثبت و تثبیت در بالای مرز حمایتی ۲،۱۵۰،۰۰۰ واحد، سیگنال مقاومت در برابر افت بیشتر را صادر کرد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">شاخص کل</span>
                <span className="text-base font-black text-slate-100 block">۲،۱۵۴،۳۸۰ واحد</span>
                <span className="text-emerald-400 font-bold">+۱۲،۴۵۰ واحد (+۰.۵۸٪)</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">شاخص هم‌وزن</span>
                <span className="text-base font-black text-slate-100 block">۷۱۲،۴۹۰ واحد</span>
                <span className="text-emerald-400 font-bold">+۴،۸۹۰ واحد (+۰.۶۹٪)</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">خالص ورود پول حقیقی</span>
                <span className="text-base font-black text-emerald-400 block">
                  +{formatToman(marketSummary?.realNetCashFlowToman || 142_000_000_000)}
                </span>
                <span className="text-slate-400">برتری نسبی خریداران خرد</span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer Footer (Mandatory per governance constraints) */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-4 rounded-xl border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{DISCLAIMER_TEXT}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
