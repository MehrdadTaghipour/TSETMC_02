import React from 'react';
import {
  Search,
  RefreshCw,
  Sparkles,
  Bell,
  Grid,
  SlidersHorizontal,
  FileText,
  Activity,
  Layers,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { toPersianDigits } from '../utils/formatters';

interface HeaderProps {
  currentView: string;
  onSelectView: (view: string) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  unreadAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  lang,
  onToggleLang,
  onOpenSearch,
  onRefresh,
  isRefreshing,
  unreadAlertsCount = 1,
}) => {
  const t = translations[lang];

  const navLinks = [
    { id: 'dashboard', label: 'داشبورد بازار', icon: Activity },
    { id: 'bourseview', label: 'بورس‌ویو بنیادی', icon: BarChart3, highlight: true },
    { id: 'marketMap', label: 'نقشه بازار', icon: Grid },
    { id: 'marketWatch', label: 'دیده‌بان نمادها', icon: Layers },
    { id: 'screener', label: 'فیلترساز', icon: SlidersHorizontal },
    { id: 'sectors', label: 'صنایع', icon: Layers },
    { id: 'reports', label: 'گزارش‌ها', icon: FileText },
    { id: 'aiAssistant', label: 'دستیار هوشمند', icon: Sparkles },
    { id: 'alerts', label: 'هشدارها', icon: Bell, badge: unreadAlertsCount },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-4 h-16">
        {/* Brand */}
        <button
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2 group cursor-pointer shrink-0 text-right"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
            بورس
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors block leading-tight">
              سامانه هوشمند بورس تهران
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">TSETMC Intelligent System</span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;

            return (
              <button
                key={link.id}
                onClick={() => onSelectView(link.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : link.highlight
                    ? 'text-emerald-400 hover:bg-emerald-500/10 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">جستجو...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            title="به‌روزرسانی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Navigation */}
      <div className="xl:hidden flex items-center gap-1 px-3 py-2 bg-slate-900/90 border-t border-slate-800/80 overflow-x-auto text-xs font-semibold scrollbar-none">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = currentView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onSelectView(link.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
