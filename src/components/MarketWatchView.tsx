import React, { useState, useMemo } from 'react';
import {
  Star,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Tag,
  FolderPlus,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CurrencyUnit, Language, SymbolQuote } from '../types';
import { translations } from '../translations';
import { formatPercent, formatPrice, formatToman, formatVolume, toPersianDigits } from '../utils/formatters';

interface MarketWatchViewProps {
  symbols: SymbolQuote[];
  watchlist: string[];
  onToggleWatchlist: (insCode: string) => void;
  lang: Language;
  currency: CurrencyUnit;
  onSelectSymbol: (symbol: SymbolQuote) => void;
  onAskAI?: (symbol: SymbolQuote) => void;
}

type SortField =
  | 'symbol'
  | 'lastPrice'
  | 'percentChange'
  | 'closePercentChange'
  | 'volume'
  | 'valueToman'
  | 'tradeCount'
  | 'pe';

export const MarketWatchView: React.FC<MarketWatchViewProps> = ({
  symbols,
  watchlist,
  onToggleWatchlist,
  lang,
  currency,
  onSelectSymbol,
  onAskAI,
}) => {
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'TSE' | 'FARABOURSE' | 'WATCHLIST'>('ALL');
  const [sortField, setSortField] = useState<SortField>('valueToman');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Watchlist custom groups: stored in localStorage
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [watchlistGroups, setWatchlistGroups] = useState<{ [group: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem('tsetmc_watchlist_groups');
      return saved
        ? JSON.parse(saved)
        : {
            'بانکی': ['65883838195688438'],
            'پتروشیمی و فلزات': ['46348559193224090', '61101334182947180'],
            'کوتاه‌مدت': ['46348559193224090'],
          };
    } catch {
      return {
        'بانکی': [],
        'پتروشیمی و فلزات': [],
        'کوتاه‌مدت': [],
      };
    }
  });

  // Distinct sectors
  const sectors = useMemo(() => {
    const map = new Map<string, string>();
    symbols.forEach((s) => {
      if (s.sectorCode && s.sectorName) {
        map.set(s.sectorCode, s.sectorName);
      }
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [symbols]);

  // Filtering & Sorting
  const filteredSymbols = useMemo(() => {
    let result = symbols.filter((s) => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matches =
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.symbolEn?.toLowerCase().includes(q) ||
          s.nameEn?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Sector
      if (selectedSector !== 'ALL' && s.sectorCode !== selectedSector) {
        return false;
      }

      // Market
      if (marketFilter === 'TSE' && !s.market.includes('بورس')) {
        return false;
      }
      if (marketFilter === 'FARABOURSE' && !s.market.includes('فرابورس')) {
        return false;
      }
      if (marketFilter === 'WATCHLIST') {
        if (!watchlist.includes(s.insCode)) return false;
        if (selectedGroup !== 'all') {
          const groupCodes = watchlistGroups[selectedGroup] || [];
          if (!groupCodes.includes(s.insCode)) return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'lastPrice') {
        valA = a.lastPriceToman;
        valB = b.lastPriceToman;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });

    return result;
  }, [symbols, searchQuery, selectedSector, marketFilter, sortField, sortOrder, watchlist, selectedGroup, watchlistGroups]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>دیده‌بان بازار و فهرست نمادها (Market Watch)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              فهرست زنده قیمت، حجم، ارزش معاملات، نسبت‌های ارزندگی و دسته‌بندی اختصاصی نمادها
            </p>
          </div>

          {/* Market Tab Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setMarketFilter('ALL')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                marketFilter === 'ALL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه نمادها ({toPersianDigits(symbols.length)})
            </button>
            <button
              onClick={() => setMarketFilter('TSE')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                marketFilter === 'TSE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              بورس تهران
            </button>
            <button
              onClick={() => setMarketFilter('FARABOURSE')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                marketFilter === 'FARABOURSE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فرابورس
            </button>
            <button
              onClick={() => setMarketFilter('WATCHLIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                marketFilter === 'WATCHLIST' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>دیده‌بان من ({toPersianDigits(watchlist.length)})</span>
            </button>
          </div>
        </div>

        {/* Watchlist Group Filter (shown when WATCHLIST filter is active) */}
        {marketFilter === 'WATCHLIST' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>دسته‌بندی دیده‌بان:</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGroup === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                همه ({toPersianDigits(watchlist.length)})
              </button>
              {Object.keys(watchlistGroups).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGroup === grp
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {grp} ({toPersianDigits((watchlistGroups[grp] || []).length)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Sector Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="جستجوی نماد، نام شرکت یا صنعت..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">همه صنایع ({toPersianDigits(sectors.length)})</option>
            {sectors.map((sec) => (
              <option key={sec.code} value={sec.code}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80 select-none">
                <th className="py-3 px-3 text-center w-10">★</th>
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>نماد</span>
                    {sortField === 'symbol' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3">نام شرکت</th>
                <th className="py-3 px-3">صنعت</th>
                <th
                  onClick={() => handleSort('lastPrice')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>آخرین قیمت</span>
                    {sortField === 'lastPrice' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('percentChange')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>تغییر لحظه‌ای</span>
                    {sortField === 'percentChange' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('closePercentChange')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>تغییر پایانی</span>
                    {sortField === 'closePercentChange' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('valueToman')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ارزش معاملات</span>
                    {sortField === 'valueToman' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>حجم معاملات</span>
                    {sortField === 'volume' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pe')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>P/E</span>
                    {sortField === 'pe' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSymbols.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    هیچ نمادی با فیلترهای مورد نظر پیدا نشد.
                  </td>
                </tr>
              ) : (
                filteredSymbols.map((s) => {
                  const isWatched = watchlist.includes(s.insCode);
                  const isPos = s.percentChange > 0;
                  const isNeg = s.percentChange < 0;

                  return (
                    <tr
                      key={s.insCode}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectSymbol(s)}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(s.insCode);
                        }}
                      >
                        <button
                          className={`p-1 rounded hover:bg-slate-700 transition-colors cursor-pointer ${
                            isWatched ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {s.symbol}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[150px]">{s.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.sectorName}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        {formatPrice(s.lastPriceToman)} تومان
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-black dir-ltr px-1.5 py-0.5 rounded text-[11px] ${
                            isPos
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isNeg
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isPos ? '+' : ''}{toPersianDigits(s.percentChange)}٪
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-bold dir-ltr ${
                            s.closePercentChange > 0
                              ? 'text-emerald-400'
                              : s.closePercentChange < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.closePercentChange > 0 ? '+' : ''}{toPersianDigits(s.closePercentChange)}٪
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-300">
                        {formatToman(s.valueToman)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{formatVolume(s.volume)}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-300">{s.pe || '---'}</td>
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {onAskAI && (
                            <button
                              onClick={() => onAskAI(s)}
                              className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                              title="تحلیل هوشمند نماد"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectSymbol(s)}
                            className="px-2 py-0.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition-colors"
                          >
                            جزئیات
                          </button>
                        </div>
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
