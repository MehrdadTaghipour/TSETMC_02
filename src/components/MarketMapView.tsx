import React, { useState, useMemo } from 'react';
import {
  Grid,
  CircleDot,
  ScatterChart,
  Filter,
  Layers,
  Search,
  Maximize2,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { SymbolQuote } from '../types';
import { formatPercent, formatPrice, formatToman, formatVolume, toPersianDigits } from '../utils/formatters';

interface MarketMapViewProps {
  symbols: SymbolQuote[];
  watchlist: string[];
  onSelectSymbol: (symbol: SymbolQuote) => void;
}

type MapMode = 'treemap' | 'bubble' | 'scatter';
type SizeMetric = 'value' | 'volume' | 'marketCap';

export const MarketMapView: React.FC<MarketMapViewProps> = ({
  symbols,
  watchlist,
  onSelectSymbol,
}) => {
  const [mapMode, setMapMode] = useState<MapMode>('treemap');
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('value');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [watchlistOnly, setWatchlistOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique sectors
  const sectors = useMemo(() => {
    const list = Array.from(new Set(symbols.map((s) => s.sectorName).filter(Boolean)));
    return list.sort();
  }, [symbols]);

  // Filter symbols
  const filteredSymbols = useMemo(() => {
    return symbols.filter((s) => {
      if (watchlistOnly && !watchlist.includes(s.insCode)) return false;
      if (selectedMarket !== 'all' && s.market !== selectedMarket) return false;
      if (selectedSector !== 'all' && s.sectorName !== selectedSector) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [symbols, watchlistOnly, watchlist, selectedMarket, selectedSector, searchQuery]);

  // Group by sector for Treemap
  const sectorGroups = useMemo(() => {
    const groups: { [sector: string]: SymbolQuote[] } = {};
    filteredSymbols.forEach((s) => {
      const sec = s.sectorName || 'سایر صنایع';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(s);
    });
    return groups;
  }, [filteredSymbols]);

  // Helper for sizing
  const getItemSizeValue = (s: SymbolQuote) => {
    if (sizeMetric === 'volume') return s.volume || 100000;
    if (sizeMetric === 'marketCap') return (s.lastPriceToman || 1000) * (s.shareCount || 5000000000);
    return s.valueToman || 1000000;
  };

  // Helper for color scale based on % change (Iranian green up, red down)
  const getColorClass = (change: number) => {
    if (change >= 4.5) return 'bg-emerald-600 text-white border-emerald-400';
    if (change >= 2.0) return 'bg-emerald-700 text-emerald-100 border-emerald-500';
    if (change > 0) return 'bg-emerald-900/80 text-emerald-200 border-emerald-700/60';
    if (change === 0) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (change > -2.0) return 'bg-rose-950/80 text-rose-200 border-rose-800/60';
    if (change > -4.5) return 'bg-rose-800 text-rose-100 border-rose-600';
    return 'bg-rose-600 text-white border-rose-400';
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Left: View Mode Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMapMode('treemap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mapMode === 'treemap' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>نقشه درختی (Treemap)</span>
            </button>
            <button
              onClick={() => setMapMode('bubble')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mapMode === 'bubble' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>نقشه حبابی (Bubble)</span>
            </button>
            <button
              onClick={() => setMapMode('scatter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mapMode === 'scatter' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScatterChart className="w-3.5 h-3.5" />
              <span>پراکندگی (Scatter)</span>
            </button>
          </div>

          {/* Size Metric Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-2">
            <span>مبنای مساحت:</span>
            <select
              value={sizeMetric}
              onChange={(e) => setSizeMetric(e.target.value as SizeMetric)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="value">ارزش معاملات</option>
              <option value="volume">حجم معاملات</option>
              <option value="marketCap">ارزش کل بازار (Market Cap)</option>
            </select>
          </div>
        </div>

        {/* Right: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Market Filter */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">همه بازارها</option>
            <option value="بورس">بورس اوراق بهادار</option>
            <option value="فرابورس">فرابورس ایران</option>
            <option value="پایه">بازار پایه</option>
          </select>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 max-w-[150px]"
          >
            <option value="all">همه صنایع ({toPersianDigits(sectors.length)})</option>
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          {/* Watchlist toggle */}
          <button
            onClick={() => setWatchlistOnly(!watchlistOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              watchlistOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            دیده‌بان من ({toPersianDigits(watchlist.length)})
          </button>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="فیلتر نماد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-3 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 w-32 focus:w-44 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[580px] overflow-hidden">
        {filteredSymbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-2">
            <Filter className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-medium">هیچ نمادی با فیلترهای انتخابی مطابقت ندارد.</p>
          </div>
        ) : mapMode === 'treemap' ? (
          /* ================= TREEMAP MODE ================= */
          <div className="space-y-4">
            {Object.entries(sectorGroups).map(([sectorName, groupSymbols]) => {
              const sectorTotalValue = groupSymbols.reduce((sum, s) => sum + getItemSizeValue(s), 0);
              const sortedInSector = [...groupSymbols].sort((a, b) => getItemSizeValue(b) - getItemSizeValue(a));

              return (
                <div key={sectorName} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 text-xs">
                    <span className="font-bold text-slate-300">{sectorName}</span>
                    <span className="text-[11px] text-slate-500">
                      {toPersianDigits(groupSymbols.length)} نماد | مجموع ارزش: {formatToman(sectorTotalValue)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sortedInSector.map((s) => {
                      const sizeVal = getItemSizeValue(s);
                      const flexGrow = Math.max(1, Math.min(12, Math.round((sizeVal / (sectorTotalValue || 1)) * 30)));
                      const isPositive = s.percentChange > 0;

                      return (
                        <div
                          key={s.insCode}
                          onClick={() => onSelectSymbol(s)}
                          style={{ flexGrow, minWidth: '85px', minHeight: '68px' }}
                          className={`p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:z-10 shadow-sm flex flex-col justify-between ${getColorClass(
                            s.percentChange
                          )}`}
                          title={`${s.symbol} (${s.name})
قیمت: ${formatPrice(s.lastPriceToman)} تومان
تغییر: ${formatPercent(s.percentChange)}
ارزش معاملات: ${formatToman(s.valueToman)}
P/E: ${s.pe || '---'}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-black text-xs md:text-sm tracking-tight">{s.symbol}</span>
                            <span className="text-[10px] font-bold dir-ltr">{formatPercent(s.percentChange)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] opacity-90 w-full mt-1">
                            <span>{formatPrice(s.lastPriceToman)}</span>
                            <span>{formatToman(s.valueToman, false)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : mapMode === 'bubble' ? (
          /* ================= BUBBLE MAP MODE ================= */
          <div className="flex flex-wrap items-center justify-center gap-3 p-4 min-h-[500px]">
            {filteredSymbols
              .sort((a, b) => getItemSizeValue(b) - getItemSizeValue(a))
              .slice(0, 75)
              .map((s) => {
                const sizeVal = getItemSizeValue(s);
                const maxVal = getItemSizeValue(filteredSymbols[0]) || 1;
                const ratio = Math.sqrt(sizeVal / maxVal);
                const pixelSize = Math.max(55, Math.min(130, Math.round(ratio * 125)));

                return (
                  <div
                    key={s.insCode}
                    onClick={() => onSelectSymbol(s)}
                    style={{ width: `${pixelSize}px`, height: `${pixelSize}px` }}
                    className={`rounded-full border-2 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-transform hover:scale-110 shadow-lg ${getColorClass(
                      s.percentChange
                    )}`}
                    title={`${s.symbol} - تغییر: ${formatPercent(s.percentChange)} - ارزش: ${formatToman(s.valueToman)}`}
                  >
                    <span className="font-extrabold text-xs md:text-sm truncate w-full">{s.symbol}</span>
                    <span className="text-[10px] font-bold dir-ltr mt-0.5">{formatPercent(s.percentChange)}</span>
                    {pixelSize > 75 && (
                      <span className="text-[9px] opacity-80 mt-0.5">{formatPrice(s.lastPriceToman)}</span>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          /* ================= SCATTER MAP MODE ================= */
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 pb-2 border-b border-slate-800">
              <span>محور افقی (X): نسبت P/E (ارزش‌گذاری)</span>
              <span>محور عمودی (Y): درصد تغییر روزانه (بازدهی)</span>
            </div>

            <div className="relative w-full h-[460px] bg-slate-950/80 rounded-xl border border-slate-800 p-6 overflow-hidden">
              {/* Zero return line */}
              <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-700/60 z-0"></div>

              {filteredSymbols.slice(0, 60).map((s) => {
                const pe = Math.min(25, Math.max(1, s.pe || 6));
                const change = Math.min(7, Math.max(-7, s.percentChange || 0));

                const leftPercent = ((pe - 1) / 24) * 88 + 6;
                const topPercent = 50 - (change / 7) * 44;

                return (
                  <div
                    key={s.insCode}
                    onClick={() => onSelectSymbol(s)}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-transform hover:scale-125 z-10 shadow-md ${getColorClass(
                      s.percentChange
                    )}`}
                    title={`${s.symbol} | P/E: ${pe} | تغییر: ${formatPercent(change)}`}
                  >
                    <span>{s.symbol}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
