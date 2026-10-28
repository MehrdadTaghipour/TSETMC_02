import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, DollarSign, Clock, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { CurrencyUnit, HealthStatus, Language, SymbolQuote } from '../types';
import { translations } from '../translations';

interface SettingsViewProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  currency: CurrencyUnit;
  onSetCurrency: (curr: CurrencyUnit) => void;
  refreshInterval: number;
  onSetRefreshInterval: (sec: number) => void;
  watchlist: string[];
  symbols: SymbolQuote[];
  onRemoveFromWatchlist: (insCode: string) => void;
  onClearWatchlist: () => void;
  health: HealthStatus | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  onSetLang,
  currency,
  onSetCurrency,
  refreshInterval,
  onSetRefreshInterval,
  watchlist,
  symbols,
  onRemoveFromWatchlist,
  onClearWatchlist,
  health,
}) => {
  const t = translations[lang];

  const [relayInput, setRelayInput] = useState(
    () => localStorage.getItem('tsetmc_custom_relay') || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveRelay = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tsetmc_custom_relay', relayInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const watchlistSymbols = symbols.filter((s) => watchlist.includes(s.insCode));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">{t.settings}</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          {lang === 'fa'
            ? 'تنظیمات زبان، واحد پول، زمان‌بندی دریافت اطلاعات و مدیریت رله بورس'
            : 'Configure language, currency, data polling rate, and Iranian proxy relay'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Language & Display */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800 pb-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t.language}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetLang('fa')}
              className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                lang === 'fa'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>فارسی (RTL)</span>
            </button>
            <button
              onClick={() => onSetLang('en')}
              className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                lang === 'en'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>English (LTR)</span>
            </button>
          </div>

          {/* Currency Unit */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{t.currencyUnit}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSetCurrency('toman')}
                className={`p-3 rounded-lg border text-xs font-semibold transition-colors ${
                  currency === 'toman'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.toman} ({lang === 'fa' ? 'پیش‌فرض' : 'Default'})
              </button>
              <button
                onClick={() => onSetCurrency('rial')}
                className={`p-3 rounded-lg border text-xs font-semibold transition-colors ${
                  currency === 'rial'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.rial}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Auto-Refresh Interval */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{t.refreshInterval}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: `۵ ${t.sec}`, value: 5 },
              { label: `۱۰ ${t.sec}`, value: 10 },
              { label: `۳۰ ${t.sec}`, value: 30 },
              { label: t.disabled, value: 0 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSetRefreshInterval(opt.value)}
                className={`p-2.5 rounded-lg border font-medium transition-colors ${
                  refreshInterval === opt.value
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* System Health Overview */}
          <div className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'پخش زنده و برخط:' : 'Real-time Streaming:'}</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {lang === 'fa' ? 'فعال (نرخ ۲ ثانیه)' : 'Active (2s Rate)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'دستیار هوش مصنوعی:' : 'Gemini AI Assistant:'}</span>
              <span className="font-semibold text-emerald-400">
                {lang === 'fa' ? 'متصل (Gemini 3.8 Flash)' : 'Connected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'وضعیت اتصال بالا‌دستی:' : 'Upstream Health:'}</span>
              <span className="font-semibold text-white">{health?.upstream || 'ONLINE'}</span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'وضعیت مدارشکن:' : 'Circuit Breaker:'}</span>
              <span className="font-semibold text-emerald-400">
                {health?.circuit_breaker_state || 'CLOSED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'fa' ? 'استفاده از سرور رله:' : 'Relay Active:'}</span>
              <span className="text-slate-300">
                {health?.relay_configured ? (lang === 'fa' ? 'بله' : 'Yes') : (lang === 'fa' ? 'خیر (جریان زنده مستقیم)' : 'Direct Stream')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Iranian IP Relay Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{t.relayConfig}</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">{t.relayDesc}</p>

        <form onSubmit={handleSaveRelay} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={relayInput}
            onChange={(e) => setRelayInput(e.target.value)}
            placeholder={t.relayPlaceholder}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>{savedSuccess ? t.settingsSaved : t.saveSettings}</span>
          </button>
        </form>
      </div>

      {/* 4. Watchlist Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="text-sm font-semibold text-white">{t.watchlist}</div>
          {watchlist.length > 0 && (
            <button
              onClick={onClearWatchlist}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'پاک‌کردن همه' : 'Clear All'}</span>
            </button>
          )}
        </div>

        {watchlistSymbols.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">{t.emptyWatchlist}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {watchlistSymbols.map((s) => (
              <div
                key={s.insCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs"
              >
                <span className="font-bold text-white">{s.symbol}</span>
                <span className="text-slate-400 text-[11px]">{s.name}</span>
                <button
                  onClick={() => onRemoveFromWatchlist(s.insCode)}
                  className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
