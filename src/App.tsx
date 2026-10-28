import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MarketStatusBar } from './components/MarketStatusBar';
import { DashboardView } from './components/DashboardView';
import { MarketMapView } from './components/MarketMapView';
import { MarketWatchView } from './components/MarketWatchView';
import { ScreenerView } from './components/ScreenerView';
import { SectorsView } from './components/SectorsView';
import { IndicesView } from './components/IndicesView';
import { ReportsView } from './components/ReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import { SymbolDetailModal } from './components/SymbolDetailModal';
import { SearchModal } from './components/SearchModal';
import { BourseViewTerminal } from './components/BourseViewTerminal';
import {
  CurrencyUnit,
  HealthStatus,
  IndexData,
  Language,
  MarketSummary,
  ResponseMeta,
  SectorItem,
  SymbolQuote,
} from './types';
import { translations } from './translations';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('tsetmc_lang') as Language) || 'fa';
  });

  const [currency, setCurrency] = useState<CurrencyUnit>(() => {
    return (localStorage.getItem('tsetmc_currency') as CurrencyUnit) || 'toman';
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [refreshInterval, setRefreshInterval] = useState<number>(2); // 2s default for real-time market updates
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('tsetmc_watchlist');
      return stored ? JSON.parse(stored) : ['46348559193224090', '65883838195688438', '61101334182947180'];
    } catch {
      return ['46348559193224090'];
    }
  });

  const [symbols, setSymbols] = useState<SymbolQuote[]>([]);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [meta, setMeta] = useState<ResponseMeta | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const [selectedSymbol, setSelectedSymbol] = useState<SymbolQuote | null>(null);
  const [aiTargetSymbol, setAiTargetSymbol] = useState<SymbolQuote | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync document RTL and language
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('tsetmc_lang', lang);
  }, [lang]);

  // Sync currency
  useEffect(() => {
    localStorage.setItem('tsetmc_currency', currency);
  }, [currency]);

  // Sync watchlist
  useEffect(() => {
    localStorage.setItem('tsetmc_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Global Ctrl+K keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleWatchlist = (insCode: string) => {
    setWatchlist((prev) =>
      prev.includes(insCode) ? prev.filter((id) => id !== insCode) : [...prev, insCode]
    );
  };

  const clearWatchlist = () => setWatchlist([]);

  // Data Fetching
  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [mwRes, idxRes, secRes, healthRes] = await Promise.all([
        fetch('/api/market-watch').then((r) => r.json()).catch(() => null),
        fetch('/api/indices').then((r) => r.json()).catch(() => null),
        fetch('/api/sectors').then((r) => r.json()).catch(() => null),
        fetch('/api/health').then((r) => r.json()).catch(() => null),
      ]);

      if (mwRes?.data) {
        setSymbols(mwRes.data);
      }
      if (mwRes?._meta) {
        setMeta(mwRes._meta);
      }
      if (idxRes?.data?.indices) {
        setIndices(idxRes.data.indices);
      }
      if (idxRes?.data?.marketSummary) {
        setMarketSummary(idxRes.data.marketSummary);
      }
      if (secRes?.data) {
        setSectors(secRes.data);
      }
      if (healthRes) {
        setHealth(healthRes);
      }
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Polling loop
  useEffect(() => {
    if (refreshInterval <= 0) return;
    const timer = setInterval(() => {
      fetchAllData();
    }, refreshInterval * 1000);
    return () => clearInterval(timer);
  }, [refreshInterval, fetchAllData]);

  // Quick Action Handlers for Symbol Modal
  const handleLaunchAIWithSymbol = (sym: SymbolQuote) => {
    setAiTargetSymbol(sym);
    setSelectedSymbol(null);
    setCurrentView('aiAssistant');
  };

  const handleLaunchReportWithSymbol = (sym: SymbolQuote) => {
    setSelectedSymbol(null);
    setCurrentView('reports');
  };

  const handleLaunchAlertWithSymbol = (sym: SymbolQuote) => {
    setSelectedSymbol(null);
    setCurrentView('alerts');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* 1. Header Bar */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        lang={lang}
        onToggleLang={() => setLang(lang === 'fa' ? 'en' : 'fa')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
      />

      {/* 2. Connection & Market Status Bar */}
      <MarketStatusBar meta={meta} lang={lang} />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            indices={indices}
            marketSummary={marketSummary}
            symbols={symbols}
            lang={lang}
            currency={currency}
            onSelectSymbol={setSelectedSymbol}
            onNavigateToMarketWatch={() => setCurrentView('marketWatch')}
            onNavigateToAIAssistant={() => setCurrentView('aiAssistant')}
          />
        )}

        {currentView === 'bourseview' && (
          <BourseViewTerminal
            symbols={symbols}
            currency={currency}
            lang={lang}
            onSelectSymbol={setSelectedSymbol}
            onAskAI={handleLaunchAIWithSymbol}
          />
        )}

        {currentView === 'marketMap' && (
          <MarketMapView
            symbols={symbols}
            watchlist={watchlist}
            onSelectSymbol={setSelectedSymbol}
          />
        )}

        {currentView === 'marketWatch' && (
          <MarketWatchView
            symbols={symbols}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            lang={lang}
            currency={currency}
            onSelectSymbol={setSelectedSymbol}
            onAskAI={handleLaunchAIWithSymbol}
          />
        )}

        {currentView === 'screener' && (
          <ScreenerView
            symbols={symbols}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            onSelectSymbol={setSelectedSymbol}
            onCreateAlert={() => setCurrentView('alerts')}
          />
        )}

        {currentView === 'sectors' && (
          <SectorsView
            sectors={sectors}
            symbols={symbols}
            lang={lang}
            currency={currency}
            onSelectSymbol={setSelectedSymbol}
          />
        )}

        {currentView === 'indices' && <IndicesView indices={indices} lang={lang} />}

        {currentView === 'reports' && (
          <ReportsView
            symbols={symbols}
            sectors={sectors}
            indices={indices}
            marketSummary={marketSummary}
            onSelectSymbol={setSelectedSymbol}
          />
        )}

        {currentView === 'aiAssistant' && (
          <AIAssistantView
            symbols={symbols}
            indices={indices}
            marketSummary={marketSummary}
            onSelectSymbol={setSelectedSymbol}
            initialSymbol={aiTargetSymbol}
          />
        )}

        {currentView === 'alerts' && (
          <AlertsView symbols={symbols} onSelectSymbol={setSelectedSymbol} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            lang={lang}
            onSetLang={setLang}
            currency={currency}
            onSetCurrency={setCurrency}
            refreshInterval={refreshInterval}
            onSetRefreshInterval={setRefreshInterval}
            watchlist={watchlist}
            symbols={symbols}
            onRemoveFromWatchlist={toggleWatchlist}
            onClearWatchlist={clearWatchlist}
            health={health}
          />
        )}
      </main>

      {/* 4. Symbol Detail Modal */}
      <SymbolDetailModal
        symbol={selectedSymbol}
        allSymbols={symbols}
        onClose={() => setSelectedSymbol(null)}
        lang={lang}
        currency={currency}
        isWatchlist={selectedSymbol ? watchlist.includes(selectedSymbol.insCode) : false}
        onToggleWatchlist={toggleWatchlist}
        onAskAI={handleLaunchAIWithSymbol}
        onGenerateReport={handleLaunchReportWithSymbol}
        onCreateAlert={handleLaunchAlertWithSymbol}
      />

      {/* 5. Autocomplete Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        symbols={symbols}
        lang={lang}
        currency={currency}
        onSelectSymbol={setSelectedSymbol}
      />

      {/* 6. Clean Institutional Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <span className="font-semibold text-slate-400">
              سامانه هوشمند و جامع بورس و فرابورس تهران (TSETMC)
            </span>
            <span className="mx-2">·</span>
            <span>کلیه تحلیل‌ها و مدل‌های تکنیکال و بنیادی به صورت خودکار و مستقل درون‌برنامه‌ای محاسبه می‌گردند</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>مرجع داده: cdn.tsetmc.com</span>
            <span className="text-slate-700">·</span>
            <span>نسخه ۲.۰.۰ (هوشمند)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
