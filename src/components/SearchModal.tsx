import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { CurrencyUnit, Language, SymbolQuote } from '../types';
import { translations } from '../translations';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: SymbolQuote[];
  lang: Language;
  currency: CurrencyUnit;
  onSelectSymbol: (symbol: SymbolQuote) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  symbols,
  lang,
  currency,
  onSelectSymbol,
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim()
    ? symbols
        .filter((s) => {
          const q = query.toLowerCase();
          return (
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            s.symbolEn.toLowerCase().includes(q) ||
            s.nameEn.toLowerCase().includes(q)
          );
        })
        .slice(0, 10)
    : symbols.slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {lang === 'fa' ? 'هیچ نمادی یافت نشد.' : 'No matching symbols found.'}
            </div>
          ) : (
            results.map((s) => {
              const isPos = s.percentChange >= 0;
              return (
                <div
                  key={s.insCode}
                  onClick={() => {
                    onSelectSymbol(s);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-white">{s.symbol}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{s.name}</div>
                  </div>

                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-100 tabular-nums">
                      {formatCurrency(s.lastPrice, currency, lang)}
                    </div>
                    <div
                      className={`text-[11px] font-bold tabular-nums ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatPercent(s.percentChange, lang)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
