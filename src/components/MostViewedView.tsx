import React from 'react';
import { Eye, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { CurrencyUnit, Language, SymbolQuote } from '../types';
import { translations } from '../translations';
import { formatCompact, formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface MostViewedViewProps {
  symbols: SymbolQuote[];
  watchlist: string[];
  onToggleWatchlist: (insCode: string) => void;
  lang: Language;
  currency: CurrencyUnit;
  onSelectSymbol: (symbol: SymbolQuote) => void;
}

export const MostViewedView: React.FC<MostViewedViewProps> = ({
  symbols,
  watchlist,
  onToggleWatchlist,
  lang,
  currency,
  onSelectSymbol,
}) => {
  const t = translations[lang];

  // Sort by trade count / market activity to get most viewed
  const mostViewed = [...symbols]
    .sort((a, b) => (b.tradeCount || 0) - (a.tradeCount || 0))
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">{t.mostViewed}</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === 'fa'
            ? 'پربیننده‌ترین نمادهای بازار سرمایه با بیشترین تعداد تراکنش و توجه معامله‌گران'
            : 'Most visited and heavily traded equities across Tehran Stock Exchange'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mostViewed.map((symbol, index) => {
          const isPos = symbol.percentChange >= 0;
          const isWatch = watchlist.includes(symbol.insCode);

          return (
            <div
              key={symbol.insCode}
              onClick={() => onSelectSymbol(symbol)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs tabular-nums">
                      {formatNumber(index + 1, lang)}
                    </span>
                    <span className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {symbol.symbol}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(symbol.insCode);
                    }}
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isWatch ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="text-xs text-slate-400 truncate mt-1">
                  {symbol.name}
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  {lang === 'fa' ? symbol.sectorName : symbol.sectorNameEn} · {lang === 'fa' ? symbol.market : symbol.marketEn}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">{t.lastPrice}</div>
                  <div className="text-sm font-bold text-slate-100 tabular-nums">
                    {formatCurrency(symbol.lastPrice, currency, lang)}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold tabular-nums flex items-center justify-end gap-0.5 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {formatPercent(symbol.percentChange, lang)}
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    {formatNumber(symbol.tradeCount, lang)} {lang === 'fa' ? 'معامله' : 'trades'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
