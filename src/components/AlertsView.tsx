import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Tag,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import { AlertItem, AlertNotification, SymbolQuote } from '../types';
import { formatPercent, formatPrice, toPersianDigits } from '../utils/formatters';

interface AlertsViewProps {
  symbols: SymbolQuote[];
  onSelectSymbol: (symbol: SymbolQuote) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ symbols, onSelectSymbol }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('tsetmc_alerts');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              symbolCode: '46348559193224090',
              symbolName: 'فولاد',
              type: 'PRICE_ABOVE',
              targetValue: 520,
              targetValueDisplay: 'قیمت بالاتر از ۵۲۰ تومان',
              createdAt: '۱۴۰۳/۰۸/۰۲',
              isActive: true,
              note: 'حد سود کوتاه‌مدت پله اول',
            },
            {
              id: '2',
              symbolCode: '65883838195688438',
              symbolName: 'وبملت',
              type: 'RSI_OVERSOLD',
              targetValue: 30,
              targetValueDisplay: 'RSI کمتر از ۳۰ (اشباع فروش)',
              createdAt: '۱۴۰۳/۰۸/۰۳',
              isActive: true,
              lastTriggered: '۱۴۰۳/۰۸/۰۴ ۱۰:۱۵',
              note: 'سیگنال ورود پله‌ای',
            },
          ];
    } catch {
      return [];
    }
  });

  // Notifications history
  const [notifications, setNotifications] = useState<AlertNotification[]>([
    {
      id: 'n1',
      alertId: '2',
      symbolName: 'وبملت',
      message: 'شاخص RSI نماد وبملت به ۲۸.۵ رسید و سیگنال اشباع فروش صادر شد.',
      timestamp: 'امروز ۱۰:۱۵',
      read: false,
    },
    {
      id: 'n2',
      alertId: '1',
      symbolName: 'فولاد',
      message: 'حجم معاملات نماد فولاد از میانگین ماهانه فراتر رفت.',
      timestamp: 'دیروز ۱۱:۳۰',
      read: true,
    },
  ]);

  // Form states for creating a new alert
  const [selectedSymbolCode, setSelectedSymbolCode] = useState<string>(
    symbols[0]?.insCode || '46348559193224090'
  );
  const [alertType, setAlertType] = useState<AlertItem['type']>('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState<number>(500);
  const [alertNote, setAlertNote] = useState<string>('');

  // Persist alerts
  useEffect(() => {
    localStorage.setItem('tsetmc_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleCreateAlert = () => {
    const sym = symbols.find((s) => s.insCode === selectedSymbolCode);
    if (!sym) return;

    const displayLabels: Record<AlertItem['type'], string> = {
      PRICE_ABOVE: `قیمت بالاتر از ${targetValue} تومان`,
      PRICE_BELOW: `قیمت کمتر از ${targetValue} تومان`,
      PERCENT_CHANGE: `تغییر قیمت بیشتر از ${targetValue}٪`,
      RSI_OVERSOLD: `RSI کمتر از ${targetValue}`,
      RSI_OVERBOUGHT: `RSI بیشتر از ${targetValue}`,
      MACD_CROSS: `تقاطع صعودی مکدی (MACD Golden Cross)`,
      HIGH_VOLUME: `حجم معاملات بیشتر از ${targetValue} میلیون برگه`,
      REAL_CASH_INFLOW: `ورود پول حقیقی بیش از ${targetValue} میلیارد تومان`,
    };

    const newAlert: AlertItem = {
      id: `alt_${Date.now()}`,
      symbolCode: sym.insCode,
      symbolName: sym.symbol,
      type: alertType,
      targetValue,
      targetValueDisplay: displayLabels[alertType],
      createdAt: '۱۴۰۳/۰۸/۰۴',
      isActive: true,
      note: alertNote.trim(),
    };

    setAlerts([newAlert, ...alerts]);
    setAlertNote('');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <span>مرکز مدیریت هشدارها و اعلانات (Alerts & Notifications)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          تعریف هشدارهای هوشمند قیمتی، اندیکاتورهای تکنیکال، وقایع بنیادی و دریافت پیام‌های آنی
        </p>
      </div>

      {/* New Alert Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-800">
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>تعریف هشدار جدید</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">نماد مورد نظر:</label>
            <select
              value={selectedSymbolCode}
              onChange={(e) => setSelectedSymbolCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
            >
              {symbols.map((s) => (
                <option key={s.insCode} value={s.insCode}>
                  {s.symbol} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">نوع شرط یا اندیکاتور:</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as AlertItem['type'])}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="PRICE_ABOVE">عبور قیمت از سقف مشخص (تومان)</option>
              <option value="PRICE_BELOW">افت قیمت به زیر کف مشخص (تومان)</option>
              <option value="PERCENT_CHANGE">درصد تغییر روزانه قیمت (٪)</option>
              <option value="RSI_OVERSOLD">اشباع فروش RSI (کمتر از مقدار)</option>
              <option value="RSI_OVERBOUGHT">اشباع خرید RSI (بیشتر از مقدار)</option>
              <option value="MACD_CROSS">تقاطع صعودی مکدی (MACD Crossover)</option>
              <option value="HIGH_VOLUME">جهش غیرعادی حجم معاملات</option>
              <option value="REAL_CASH_INFLOW">ورود پول سنگین حقیقی</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">مقدار هدف / آستانه:</label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">یادداشت / برچسب:</label>
            <input
              type="text"
              placeholder="مثلاً: حد ضرر یا نقطه ورود"
              value={alertNote}
              onChange={(e) => setAlertNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleCreateAlert}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت و فعال‌سازی هشدار</span>
          </button>
        </div>
      </div>

      {/* Active Alerts List & Trigger History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <span>فهرست هشدارهای فعال و پایش مداوم</span>
              <span className="text-emerald-400">({toPersianDigits(alerts.length)} هشدار)</span>
            </h3>
          </div>

          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">هنوز هشداری تنظیم نشده است.</p>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    alt.isActive
                      ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/30 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-100">{alt.symbolName}</span>
                      <span className="text-xs text-amber-300 font-semibold">{alt.targetValueDisplay}</span>
                      {alt.lastTriggered && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                          آخرین اجرا: {alt.lastTriggered}
                        </span>
                      )}
                    </div>
                    {alt.note && <p className="text-[11px] text-slate-400">{alt.note}</p>}
                    <span className="text-[10px] text-slate-500 block">ثبت شده در: {alt.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(alt.id)}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={alt.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                    >
                      {alt.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg cursor-pointer"
                      title="حذف هشدار"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications History Feed (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>تاریخچه هشدارهای اجرا شده</span>
            </h3>
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              خوانده شد
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  !n.read
                    ? 'bg-slate-950/90 border-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{n.symbolName}</span>
                  <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
