import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { IndexData, Language } from '../types';
import { translations } from '../translations';
import { formatNumber, formatPercent } from '../utils/formatters';

interface IndicesViewProps {
  indices: IndexData[];
  lang: Language;
}

export const IndicesView: React.FC<IndicesViewProps> = ({ indices, lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{t.indices}</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === 'fa'
            ? 'بررسی وضعیت شاخص‌های منتخب، روند تغییرات و نمادهای دارای بیشترین اثرگذاری'
            : 'Detailed benchmark indices, day changes, and major stock contributors'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {indices.map((idx) => {
          const isPos = idx.isPositive;

          return (
            <div
              key={idx.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-base font-bold text-white">
                      {lang === 'fa' ? idx.titleFa : idx.titleEn}
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-semibold tabular-nums flex items-center gap-0.5 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {formatPercent(idx.percentChange, lang)}
                  </span>
                </div>

                <div className="my-4">
                  <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                    {formatNumber(idx.value, lang)}
                  </div>
                  <div
                    className={`text-sm tabular-nums font-medium mt-1 ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {formatNumber(idx.change, lang)} {lang === 'fa' ? 'واحد' : 'pts'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 bg-slate-950/40 rounded-md px-3 text-xs text-slate-400 tabular-nums">
                  <div>
                    <span>{lang === 'fa' ? 'کمترین مقدار روز: ' : 'Day Low: '}</span>
                    <span className="text-slate-200 font-medium">{formatNumber(idx.low, lang)}</span>
                  </div>
                  <div>
                    <span>{lang === 'fa' ? 'بیشترین مقدار روز: ' : 'Day High: '}</span>
                    <span className="text-slate-200 font-medium">{formatNumber(idx.high, lang)}</span>
                  </div>
                </div>
              </div>

              {/* Top movers affecting this index */}
              {idx.topMovers && idx.topMovers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800/60">
                  <div className="text-xs text-slate-400 mb-2 font-medium">
                    {lang === 'fa' ? 'بیشترین اثرگذاری بر شاخص:' : 'Top Impact Contributors:'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {idx.topMovers.map((mover, i) => {
                      const moverPos = mover.impact >= 0;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300"
                        >
                          <span className="font-semibold text-white">{mover.symbol}</span>
                          <span
                            className={`tabular-nums text-[11px] font-medium ${
                              moverPos ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {moverPos ? '+' : ''}
                            {formatNumber(mover.impact, lang)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
