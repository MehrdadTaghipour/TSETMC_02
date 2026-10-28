import React from 'react';
import { ShieldAlert, Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import { Language, ResponseMeta } from '../types';
import { translations } from '../translations';
import { formatDateTime } from '../utils/formatters';

interface MarketStatusBarProps {
  meta: ResponseMeta | null;
  lang: Language;
}

export const MarketStatusBar: React.FC<MarketStatusBarProps> = ({ meta, lang }) => {
  const t = translations[lang];

  const isOpen = meta?.market_status === 'OPEN';
  const isDemo = meta?.demo ?? false;
  const isRealtime = meta?.realtime ?? true;
  const isStale = meta?.stale ?? false;
  const isUpstreamOnline = meta?.circuit_breaker !== 'OPEN';

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800/80 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Left Side: Market Hours & Connection Status */}
        <div className="flex items-center gap-3">
          {/* Real-time Live Badge */}
          {isRealtime && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{lang === 'fa' ? 'جریان زنده لحظه‌ای (Real-time)' : 'Live Real-time'}</span>
            </div>
          )}

          {/* Market Status (Live streaming indicator) */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOpen ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-500'
              }`}
            />
            <span className={isOpen ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
              {isOpen ? t.marketOpen : t.marketClosed}
            </span>
          </div>

          <span className="text-slate-600">/</span>

          {/* Upstream Connectivity */}
          <div className="flex items-center gap-1.5 text-slate-400">
            {isUpstreamOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={isUpstreamOnline ? 'text-slate-300' : 'text-rose-400 font-medium'}>
              {isUpstreamOnline ? t.upstreamOnline : t.upstreamDegraded}
            </span>
          </div>

          {meta?.source && (
            <>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 font-mono">
                {meta.source === 'relay'
                  ? 'Iran Relay Proxy'
                  : meta.source === 'realtime-stream'
                  ? (lang === 'fa' ? 'پخش زنده معاملات TSETMC' : 'TSETMC Live Stream')
                  : meta.source === 'fixture'
                  ? 'Fixtures Engine'
                  : 'TSETMC CDN'}
              </span>
            </>
          )}
        </div>

        {/* Right Side: Demo Mode & Timestamps */}
        <div className="flex items-center gap-3">
          {isStale && (
            <div className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.staleDataNotice}</span>
            </div>
          )}

          {isDemo && (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-500/30 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{t.demoNotice}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-slate-400 tabular-nums">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{formatDateTime(meta?.fetched_at, lang)}</span>
          </div>
        </div>
      </div>

      {isDemo && (
        <div className="bg-amber-950/20 border-t border-amber-900/30 px-4 py-1.5 text-[11px] text-amber-300/90 text-center">
          {t.demoExplanation}
        </div>
      )}
    </div>
  );
};
