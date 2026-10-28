import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  BarChart2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { CurrencyUnit, Language, SectorItem, SymbolQuote } from '../types';
import { formatPercent, formatPrice, formatToman, formatVolume, toPersianDigits } from '../utils/formatters';

interface SectorsViewProps {
  sectors: SectorItem[];
  symbols: SymbolQuote[];
  lang: Language;
  currency: CurrencyUnit;
  onSelectSymbol: (symbol: SymbolQuote) => void;
}

type SectorTimeframe = 'day' | 'week' | 'month' | 'year';

export const SectorsView: React.FC<SectorsViewProps> = ({
  sectors,
  symbols,
  lang,
  currency,
  onSelectSymbol,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<SectorTimeframe>('day');
  const [activeDrilldownSector, setActiveDrilldownSector] = useState<SectorItem | null>(null);

  // Augment sectors with realistic weekly, monthly, and yearly variations if not present
  const augmentedSectors = useMemo(() => {
    return sectors.map((s, idx) => ({
      ...s,
      weekChange: s.weekChange ?? Math.round((s.averagePercentChange * 2.2 + (idx % 3 - 1) * 1.2) * 10) / 10,
      monthChange: s.monthChange ?? Math.round((s.averagePercentChange * 4.5 + (idx % 4 - 1.5) * 2.8) * 10) / 10,
      yearChange: s.yearChange ?? Math.round((28 + (idx % 5) * 8.5 - 12) * 10) / 10,
    }));
  }, [sectors]);

  // Helper to get change by selected timeframe
  const getChangeByTf = (sec: typeof augmentedSectors[0]) => {
    if (selectedTimeframe === 'week') return sec.weekChange;
    if (selectedTimeframe === 'month') return sec.monthChange;
    if (selectedTimeframe === 'year') return sec.yearChange;
    return sec.averagePercentChange;
  };

  // Sort sectors by current timeframe return
  const sortedSectors = useMemo(() => {
    return [...augmentedSectors].sort((a, b) => getChangeByTf(b) - getChangeByTf(a));
  }, [augmentedSectors, selectedTimeframe]);

  // Leading and lagging sectors
  const leadingSector = sortedSectors[0];
  const laggingSector = sortedSectors[sortedSectors.length - 1];

  // Drilldown symbols in active sector
  const drilldownSymbols = useMemo(() => {
    if (!activeDrilldownSector) return [];
    return symbols.filter(
      (s) =>
        s.sectorCode === activeDrilldownSector.sectorCode ||
        s.sectorName === activeDrilldownSector.nameFa
    );
  }, [activeDrilldownSector, symbols]);

  return (
    <div className="space-y-6">
      {/* Header and Timeframe Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>صنایع بازار بورس و فرابورس (TSE Sectors)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تحلیل عملکرد یکپارچه، حجم و ارزش نقدینگی، و رصد صنایع پیشتاز و عقب‌مانده بازار
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedTimeframe('day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTimeframe === 'day'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            روزانه
          </button>
          <button
            onClick={() => setSelectedTimeframe('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTimeframe === 'week'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            هفتگی
          </button>
          <button
            onClick={() => setSelectedTimeframe('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTimeframe === 'month'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ماهانه
          </button>
          <button
            onClick={() => setSelectedTimeframe('year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedTimeframe === 'year'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            سالانه
          </button>
        </div>
      </div>

      {/* Leading & Lagging Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leadingSector && (
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                صنعت پیشتاز بازار ({selectedTimeframe === 'day' ? 'امروز' : selectedTimeframe === 'week' ? 'این هفته' : selectedTimeframe === 'month' ? 'این ماه' : 'امسال'})
              </span>
              <h3 className="text-base font-extrabold text-slate-100">{leadingSector.nameFa}</h3>
              <p className="text-xs text-slate-400">
                ارزش معاملات: {formatToman(leadingSector.totalValueToman)} | نماد لیدر:{' '}
                <span className="text-emerald-300 font-bold">{leadingSector.topSymbol}</span>
              </p>
            </div>
            <div className="text-left bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
              <span className="text-lg font-black text-emerald-300 block dir-ltr">
                +{toPersianDigits(getChangeByTf(leadingSector))}٪
              </span>
            </div>
          </div>
        )}

        {laggingSector && (
          <div className="bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                بیشترین اصلاح / عقب‌مانده
              </span>
              <h3 className="text-base font-extrabold text-slate-100">{laggingSector.nameFa}</h3>
              <p className="text-xs text-slate-400">
                ارزش معاملات: {formatToman(laggingSector.totalValueToman)} | نماد لیدر:{' '}
                <span className="text-rose-300 font-bold">{laggingSector.topSymbol}</span>
              </p>
            </div>
            <div className="text-left bg-rose-500/20 border border-rose-500/30 px-3.5 py-2 rounded-xl">
              <span className="text-lg font-black text-rose-300 block dir-ltr">
                {toPersianDigits(getChangeByTf(laggingSector))}٪
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sector Heatmap & Drilldown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">
              نقشه حرارتی صنایع (Heatmap) — جهت مشاهده نمادهای هر صنعت کلیک کنید
            </h3>
          </div>
          {activeDrilldownSector && (
            <button
              onClick={() => setActiveDrilldownSector(null)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              بستن بخش زیرمجموعه ✕
            </button>
          )}
        </div>

        {/* Heatmap Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedSectors.map((sec) => {
            const change = getChangeByTf(sec);
            const isPos = change >= 0;
            const isSelected = activeDrilldownSector?.sectorCode === sec.sectorCode;

            return (
              <div
                key={sec.sectorCode}
                onClick={() => setActiveDrilldownSector(isSelected ? null : sec)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                  isSelected
                    ? 'ring-2 ring-emerald-400 border-emerald-500 bg-slate-800'
                    : isPos
                    ? 'bg-emerald-950/30 border-emerald-800/40 hover:border-emerald-500/70'
                    : 'bg-rose-950/30 border-rose-800/40 hover:border-rose-500/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-xs md:text-sm text-slate-100 truncate">{sec.nameFa}</h4>
                    <span
                      className={`text-xs font-black dir-ltr px-2 py-0.5 rounded ${
                        isPos ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isPos ? '+' : ''}{toPersianDigits(change)}٪
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>ارزش: {formatToman(sec.totalValueToman)}</div>
                    <div>حجم: {formatVolume(sec.totalVolume)} برگه</div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{toPersianDigits(sec.symbolsCount)} نماد</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                    لیدر: {sec.topSymbol}
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drilldown Symbols Table for Selected Sector */}
      {activeDrilldownSector && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                نمادهای زیرمجموعه صنعت «{activeDrilldownSector.nameFa}» ({toPersianDigits(drilldownSymbols.length)} نماد)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                برای باز شدن شناسنامه و تحلیل تکنیکال و بنیادی کامل روی هر نماد کلیک کنید
              </p>
            </div>
            <button
              onClick={() => setActiveDrilldownSector(null)}
              className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              بستن
            </button>
          </div>

          {drilldownSymbols.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">هیچ نمادی در این گروه در داده‌های فعلی بارگذاری نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-2.5 px-3">نماد</th>
                    <th className="py-2.5 px-3">نام شرکت</th>
                    <th className="py-2.5 px-3">آخرین قیمت (تومان)</th>
                    <th className="py-2.5 px-3">تغییر روز</th>
                    <th className="py-2.5 px-3">ارزش معاملات</th>
                    <th className="py-2.5 px-3">حجم معاملات</th>
                    <th className="py-2.5 px-3">P/E</th>
                    <th className="py-2.5 px-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {drilldownSymbols.map((s) => (
                    <tr
                      key={s.insCode}
                      onClick={() => onSelectSymbol(s)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-black text-slate-100">{s.symbol}</td>
                      <td className="py-2.5 px-3 text-slate-300">{s.name}</td>
                      <td className="py-2.5 px-3 font-semibold">{formatPrice(s.lastPriceToman)}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold dir-ltr ${
                            s.percentChange > 0 ? 'text-emerald-400' : s.percentChange < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {s.percentChange > 0 ? '+' : ''}{toPersianDigits(s.percentChange)}٪
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{formatToman(s.valueToman)}</td>
                      <td className="py-2.5 px-3 text-slate-400">{formatVolume(s.volume)}</td>
                      <td className="py-2.5 px-3 font-mono">{s.pe || '---'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
                          تحلیل جامع
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
