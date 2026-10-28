import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity,
  FileSpreadsheet,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
  ExternalLink,
} from 'lucide-react';
import {
  BourseviewCompanyProfile,
  BourseviewMarketOverview,
  CurrencyUnit,
  Language,
  MonthlySalesRecord,
  SymbolQuote,
} from '../types';
import { formatPercent, formatPrice, formatToman, toPersianDigits } from '../utils/formatters';

interface BourseViewTerminalProps {
  symbols: SymbolQuote[];
  currency: CurrencyUnit;
  lang: Language;
  onSelectSymbol: (symbol: SymbolQuote) => void;
  onAskAI?: (symbol: SymbolQuote) => void;
}

type BourseviewTab = 'ranking' | 'monthly_sales' | 'valuation_sensitivity' | 'assemblies' | 'smart_tape';

export const BourseViewTerminal: React.FC<BourseViewTerminalProps> = ({
  symbols,
  currency,
  lang,
  onSelectSymbol,
  onAskAI,
}) => {
  const [activeTab, setActiveTab] = useState<BourseviewTab>('ranking');
  const [overview, setOverview] = useState<BourseviewMarketOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<BourseviewCompanyProfile | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [strategicFilter, setStrategicFilter] = useState<'all' | 'undervalued' | 'smart_money' | 'sales_growth' | 'high_dps'>('all');
  const [sortField, setSortField] = useState<keyof BourseviewCompanyProfile>('bourseviewScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchBourseviewData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bourseview/overview');
      const json = await res.json();
      if (json.data) {
        setOverview(json.data);
        if (!selectedProfile && json.data.allProfiles?.length > 0) {
          setSelectedProfile(json.data.allProfiles[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching Bourseview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBourseviewData();
  }, []);

  // Update selected profile if symbol selection changes
  const handleSelectCompany = (profile: BourseviewCompanyProfile) => {
    setSelectedProfile(profile);
  };

  // Find matching SymbolQuote for full app modal integration
  const handleOpenSymbolModal = (profile: BourseviewCompanyProfile) => {
    const sym = symbols.find((s) => s.insCode === profile.insCode);
    if (sym) {
      onSelectSymbol(sym);
    }
  };

  // Unique sectors
  const sectors = useMemo(() => {
    if (!overview) return [];
    const set = new Set<string>();
    overview.allProfiles.forEach((p) => set.add(p.sectorName));
    return Array.from(set);
  }, [overview]);

  // Filtered and sorted profiles
  const filteredProfiles = useMemo(() => {
    if (!overview) return [];
    return overview.allProfiles
      .filter((p) => {
        // Search term
        const matchesSearch =
          !searchTerm ||
          p.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nameFa.includes(searchTerm);

        // Sector filter
        const matchesSector = selectedSector === 'all' || p.sectorName === selectedSector;

        // Strategic preset filter
        let matchesStrategic = true;
        if (strategicFilter === 'undervalued') {
          matchesStrategic = p.peTrailing <= 6.5 && p.roe >= 20 && p.dcfMarginOfSafety > 10;
        } else if (strategicFilter === 'smart_money') {
          matchesStrategic = p.realBuyerPower >= 1.3 && p.netRealFlow5dBillionToman > 0;
        } else if (strategicFilter === 'sales_growth') {
          matchesStrategic = p.latestMonthlySalesGrowthYoY >= 35;
        } else if (strategicFilter === 'high_dps') {
          matchesStrategic = p.dividendYield >= 11;
        }

        return matchesSearch && matchesSector && matchesStrategic;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'desc' ? valB - valA : valA - valB;
        }
        return 0;
      });
  }, [overview, searchTerm, selectedSector, strategicFilter, sortField, sortOrder]);

  const toggleSort = (field: keyof BourseviewCompanyProfile) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BourseView Terminal Brand Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-100">
                    سامانه تحلیل بنیادی و هوشمند بورس‌ویو (BourseView)
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                    PRO ANALYTICS
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  مهندسی معکوس و توسعه‌یافته بر اساس استانداردهای bourseview.com | تحلیل ۱۲ ماهه فعالیت کدال، حساسیت سود هر سهم، مجامع و DPS، و تابلوخوانی هوشمند
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://www.bourseview.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>مشاهده سامانه bourseview.com</span>
            </a>
            <button
              onClick={fetchBourseviewData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>به‌روزرسانی داده‌ها</span>
            </button>
          </div>
        </div>

        {/* Market Benchmark Summary Bar */}
        {overview && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">P/E میانه بازار</span>
              <span className="text-sm font-bold text-slate-100 font-mono">{overview.medianPeMarket}</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">میانگین بازده ROE</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">٪{overview.averageRoeMarket}</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">رشد فروش ماهانه کدال</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">٪{overview.totalMonthlySalesGrowthYoY}+</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">تعداد شرکت‌های رصد شده</span>
              <span className="text-sm font-bold text-slate-100 font-mono">{overview.totalCompaniesCount} شرکت</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">ورود پول حقیقی امروز</span>
              <span className={`text-sm font-bold font-mono ${overview.smartMoneyInflowTodayBillionToman >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {overview.smartMoneyInflowTodayBillionToman > 0 ? '+' : ''}{overview.smartMoneyInflowTodayBillionToman.toLocaleString('fa-IR')} م.ت
              </span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">مرجع راستی‌آزمایی</span>
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                کدال و TSETMC
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 scrollbar-none text-xs font-bold">
        {[
          { id: 'ranking', label: 'میز کار بنیادی و رتبه‌بندی نمادها', icon: Award },
          { id: 'monthly_sales', label: 'گزارش ۱۲ ماهه فعالیت کدال (تولید و فروش)', icon: FileSpreadsheet },
          { id: 'valuation_sensitivity', label: 'ارزش‌گذاری و تحلیل حساسیت دلار نیما', icon: DollarSign },
          { id: 'assemblies', label: 'تقویم مجامع، افزایش سرمایه و DPS', icon: Calendar },
          { id: 'smart_tape', label: 'رادار جریان هوشمند و تابلوخوانی بورس‌ویو', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BourseviewTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Ranking & Comprehensive Fundamental Board */}
      {activeTab === 'ranking' && (
        <div className="space-y-4">
          {/* Controls & Strategic Screeners */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجوی نماد یا نام شرکت..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">همه صنایع بورس</option>
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Strategic Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'همه' },
                { id: 'undervalued', label: 'زیر ارزش ذاتی (P/E < 6.5)' },
                { id: 'smart_money', label: 'ورود پول هوشمند' },
                { id: 'sales_growth', label: 'جهش فروش کدال (+35%)' },
                { id: 'high_dps', label: 'سود نقدی بالا (DPS > 11%)' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setStrategicFilter(btn.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    strategicFilter === btn.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master Ranking Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold">
                  <th className="py-3 px-3">رتبه</th>
                  <th className="py-3 px-3">نماد و شرکت</th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('bourseviewScore')}>
                    <span className="flex items-center gap-1">
                      نمره بورس‌ویو
                      {sortField === 'bourseviewScore' && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                    </span>
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('currentPriceToman')}>
                    قیمت (تومان)
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('peTrailing')}>
                    P/E TTM
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('peForward')}>
                    P/E تحلیلی
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('roe')}>
                    بازده ROE
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('latestMonthlySalesGrowthYoY')}>
                    رشد فروش کدال
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('dcfMarginOfSafety')}>
                    حاشیه امن DCF
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('realBuyerPower')}>
                    قدرت خریدار
                  </th>
                  <th className="py-3 px-3 cursor-pointer" onClick={() => toggleSort('netRealFlow5dBillionToman')}>
                    جریان ۵ روزه
                  </th>
                  <th className="py-3 px-3 text-center">اقدامات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProfiles.map((p, idx) => (
                  <tr
                    key={p.insCode}
                    onClick={() => handleSelectCompany(p)}
                    className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      selectedProfile?.insCode === p.insCode ? 'bg-indigo-950/30 border-r-2 border-indigo-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">{toPersianDigits(idx + 1)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{p.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({p.nameFa})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{p.sectorName}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                            p.bourseviewScore >= 80
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.bourseviewScore >= 65
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.bourseviewScore}
                        </span>
                        <span className="text-[10px] text-slate-400 hidden xl:inline">{p.verdict}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                      {formatToman(p.currentPriceToman)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{p.peTrailing}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-300 font-bold">{p.peForward}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">٪{p.roe}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-300">
                      <span className="flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                        {toPersianDigits(p.latestMonthlySalesGrowthYoY)}٪
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold">
                      <span className={p.dcfMarginOfSafety > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                        {p.dcfMarginOfSafety > 0 ? '+' : ''}{toPersianDigits(p.dcfMarginOfSafety)}٪
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      <span className={p.realBuyerPower >= 1.3 ? 'text-emerald-400' : 'text-slate-300'}>
                        {p.realBuyerPower}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={p.netRealFlow5dBillionToman >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {p.netRealFlow5dBillionToman > 0 ? '+' : ''}{p.netRealFlow5dBillionToman.toLocaleString('fa-IR')} م.ت
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenSymbolModal(p)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold border border-slate-700 transition-colors"
                      >
                        پرونده نماد
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: 12-Month Monthly Codal Activity & Production/Sales */}
      {activeTab === 'monthly_sales' && (
        <div className="space-y-4">
          {/* Symbol Selector Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">انتخاب نماد برای بررسی گزارش ماهانه:</span>
              <div className="flex items-center gap-1.5">
                {overview?.allProfiles.slice(0, 8).map((p) => (
                  <button
                    key={p.insCode}
                    onClick={() => setSelectedProfile(p)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedProfile?.insCode === p.insCode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {p.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Sales Chart & Visual Summary */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      <span>روند درآمد ماهانه {selectedProfile.symbol}</span>
                    </h3>
                    <span className="text-xs text-slate-400">{selectedProfile.nameFa}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                    سال مالی ۱۴۰۳
                  </span>
                </div>

                {/* 12-Month Bar Chart */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    نمودار میله‌ای مبلغ فروش (میلیارد تومان):
                  </span>
                  <div className="space-y-1.5">
                    {selectedProfile.monthlySales.map((m) => {
                      const maxRevenue = Math.max(...selectedProfile.monthlySales.map((x) => x.revenueBillionToman));
                      const barPct = Math.round((m.revenueBillionToman / (maxRevenue || 1)) * 100);
                      return (
                        <div key={m.monthNumber} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 w-16">{m.monthName}</span>
                            <span className="font-mono text-slate-200 font-bold">
                              {m.revenueBillionToman.toLocaleString('fa-IR')} م.ت
                            </span>
                            <span className="font-mono text-emerald-400 text-[10px]">+{m.growthYoYPercent}٪</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all"
                              style={{ width: `${barPct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">مجموع فروش تجمعی امسال:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {selectedProfile.monthlySales[selectedProfile.monthlySales.length - 1]?.cumulativeBillionToman.toLocaleString('fa-IR')} میلیارد تومان
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">میانگین رشد سالانه (YoY):</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      ٪{selectedProfile.latestMonthlySalesGrowthYoY}+
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Codal Production/Sales Matrix */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-100">
                    جدول تفصیلی تولید و فروش ماهانه سامانه کدال ({selectedProfile.symbol})
                  </h3>
                  <span className="text-[11px] text-slate-400">واحد مبالغ: میلیارد تومان</span>
                </div>

                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">دوره ماهانه</th>
                      <th className="py-2.5 px-3">محصول کلیدی</th>
                      <th className="py-2.5 px-3">مقدار تولید</th>
                      <th className="py-2.5 px-3">مقدار فروش</th>
                      <th className="py-2.5 px-3">نرخ فروش (تومان)</th>
                      <th className="py-2.5 px-3">مبلغ فروش ماه</th>
                      <th className="py-2.5 px-3">رشد نسبت به سال قبل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedProfile.monthlySales.map((m) => (
                      <tr key={m.monthNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{m.monthName} ۱۴۰۳</td>
                        <td className="py-2.5 px-3 text-slate-300">{m.topProductName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {m.productionQty.toLocaleString('fa-IR')} {m.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {m.salesQty.toLocaleString('fa-IR')} {m.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-200 font-bold">
                          {formatToman(m.rateToman)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-indigo-300 font-bold">
                          {m.revenueBillionToman.toLocaleString('fa-IR')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                          +{toPersianDigits(m.growthYoYPercent)}٪
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Valuation Models & Dollar Nima Sensitivity Analysis */}
      {activeTab === 'valuation_sensitivity' && (
        <div className="space-y-4">
          {/* Symbol Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">تحلیل ارزش‌گذاری و شبیه‌سازی سود هر سهم نماد:</span>
            <div className="flex items-center gap-1.5">
              {overview?.allProfiles.slice(0, 8).map((p) => (
                <button
                  key={p.insCode}
                  onClick={() => setSelectedProfile(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedProfile?.insCode === p.insCode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p.symbol}
                </button>
              ))}
            </div>
          </div>

          {selectedProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 4-Model Valuation Dashboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>ماتریس مدل‌های ارزش‌گذاری ذاتی ({selectedProfile.symbol})</span>
                  </h3>
                  <span className="text-xs text-indigo-300 font-mono">قیمت فعلی: {formatToman(selectedProfile.currentPriceToman)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">ارزش ذاتی تنزیل جریان نقد (DCF)</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {formatToman(selectedProfile.dcfValueToman)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      حاشیه امنیت: {toPersianDigits(selectedProfile.dcfMarginOfSafety)}٪
                    </span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">عدد بنجامین گراهام (Graham Value)</span>
                    <span className="text-base font-black text-indigo-300 font-mono">
                      {formatToman(selectedProfile.grahamNumberToman)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">بر مبنای دارایی‌های دفتری و سود هر سهم</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">ارزش ذاتی سود نقدی گوردون (DDM)</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      {formatToman(selectedProfile.ddmFairValueToman)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">بازده نقدی DPS: {selectedProfile.dividendYield}٪</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">P/E فوروارد تحلیلی</span>
                    <span className="text-base font-black text-slate-100 font-mono">
                      {selectedProfile.peForward}
                    </span>
                    <span className="text-[10px] text-slate-400 block">سود تحلیلی: {formatToman(selectedProfile.epsForwardEstimated)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/90 rounded-lg border border-indigo-500/20 text-xs space-y-1 text-slate-300">
                  <div className="font-bold text-indigo-300">کاتالیزورهای بنیادی بورس‌ویو:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                    {selectedProfile.keyCatalysts.map((cat, i) => (
                      <li key={i}>{cat}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nima Dollar Sensitivity Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>تحلیل حساسیت سود هر سهم نسبت به نرخ دلار نیما</span>
                  </h3>
                  <span className="text-xs text-slate-400">سامانه کدال / تسعیر ارز</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  جدول زیر اثر مستقیم افزایش نرخ ارز در سامانه نیما (از ۵۰,۰۰۰ تا ۷۰,۰۰۰ تومان) را بر سود خالص هر سهم (EPS) و نسبت P/E تحلیلی <strong>{selectedProfile.symbol}</strong> شبیه‌سازی می‌کند:
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/70 font-semibold">
                        <th className="py-2.5 px-3">نرخ فرضی دلار نیما</th>
                        <th className="py-2.5 px-3">سود تحلیلی هر سهم (EPS)</th>
                        <th className="py-2.5 px-3">P/E تحلیلی جدید</th>
                        <th className="py-2.5 px-3">درصد تغییر نسبت به سود کنونی</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedProfile.sensitivityScenarios.map((sc, i) => (
                        <tr key={i} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-100">
                            {sc.nimaDollarToman.toLocaleString('fa-IR')} تومان
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-300">
                            {formatToman(sc.estimatedEpsToman)}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-emerald-400">{sc.impliedPe}</td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className={sc.changeVsCurrentPct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {sc.changeVsCurrentPct > 0 ? '+' : ''}{toPersianDigits(sc.changeVsCurrentPct)}٪
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Assemblies, DPS & Capital Increases */}
      {activeTab === 'assemblies' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">تقویم مجامع، سابقه تقسیم سود (DPS) و افزایش سرمایه</h3>
                <span className="text-xs text-slate-400">سامانه کدال و رصد دوره‌ای مجامع عمومی بورس تهران</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview?.allProfiles.map((p) => (
                <div key={p.insCode} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100 text-sm">{p.symbol}</span>
                      <span className="text-[10px] text-slate-500 block">{p.nameFa}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      بازده DPS: {p.dividendYield}٪
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-slate-800/80 pt-2 text-xs">
                    {p.assemblies.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-300">
                        <span>سال مالی {a.fiscalYear} ({a.assemblyType}):</span>
                        <div className="text-left font-mono">
                          <span className="font-bold text-emerald-400">{formatToman(a.dpsToman)}</span>
                          <span className="text-[10px] text-slate-500 block">تقسیم {a.payoutRatioPercent}٪</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {p.assemblies[0]?.capitalIncreasePct && (
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-[11px] text-indigo-300 flex justify-between">
                      <span>افزایش سرمایه اخیر:</span>
                      <span className="font-bold font-mono">+{p.assemblies[0].capitalIncreasePct}٪ از {p.assemblies[0].capitalIncreaseSource}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Smart Money & Tape Flow Analyzer */}
      {activeTab === 'smart_tape' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100">رادار جریان هوشمند و تابلوخوانی بورس‌ویو</h3>
                <span className="text-xs text-slate-400">قدرت خریدار حقیقی، سرانه‌ها و ردیابی حجم‌های مشکوک معاملاتی</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/70 font-semibold">
                    <th className="py-3 px-3">نماد</th>
                    <th className="py-3 px-3">قدرت خریدار حقیقی</th>
                    <th className="py-3 px-3">سرانه خرید (میلیون تومان)</th>
                    <th className="py-3 px-3">سرانه فروش (میلیون تومان)</th>
                    <th className="py-3 px-3">ورود پول امروز</th>
                    <th className="py-3 px-3">ورود پول ۵ روزه</th>
                    <th className="py-3 px-3">نسبت حجم به میانگین ماه (حجم مشکوک)</th>
                    <th className="py-3 px-3">ارزش صف خرید / فروش</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {overview?.allProfiles.map((p) => (
                    <tr key={p.insCode} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-200">{p.symbol}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-xs ${p.realBuyerPower >= 1.3 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'}`}>
                          {p.realBuyerPower}x
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                        {p.perCapitaBuyMillionToman.toLocaleString('fa-IR')} م.ت
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {p.perCapitaSellMillionToman.toLocaleString('fa-IR')} م.ت
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={p.netRealFlow1dBillionToman >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          {p.netRealFlow1dBillionToman > 0 ? '+' : ''}{p.netRealFlow1dBillionToman.toLocaleString('fa-IR')} م.ت
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={p.netRealFlow5dBillionToman >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                          {p.netRealFlow5dBillionToman > 0 ? '+' : ''}{p.netRealFlow5dBillionToman.toLocaleString('fa-IR')} م.ت
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={p.suspiciousVolumeRatio >= 1.3 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          {p.suspiciousVolumeRatio}x {p.suspiciousVolumeRatio >= 1.3 ? '⚡ مشکوک' : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {p.buyQueueBillionToman > 0 ? (
                          <span className="text-emerald-400 font-bold">صف خرید {p.buyQueueBillionToman} م.ت</span>
                        ) : p.sellQueueBillionToman > 0 ? (
                          <span className="text-rose-400 font-bold">صف فروش {p.sellQueueBillionToman} م.ت</span>
                        ) : (
                          <span className="text-slate-500">متعادل</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
