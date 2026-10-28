/**
 * Persian number, currency, and date formatters for Iranian Capital Markets.
 */

export function toPersianDigits(n: number | string | undefined | null): string {
  if (n === undefined || n === null || n === '') return '۰';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}

export function formatToman(value: number | undefined | null, showUnit: boolean = true): string {
  if (value === undefined || value === null || isNaN(value)) return '۰';

  const absVal = Math.abs(value);
  const sign = value < 0 ? '−' : '';

  // همت (هزار میلیارد تومان)
  if (absVal >= 1_000_000_000_000) {
    const formatted = (absVal / 1_000_000_000_000).toFixed(2);
    return `${sign}${toPersianDigits(formatted)}${showUnit ? ' همت' : ''}`;
  }

  // میلیارد تومان
  if (absVal >= 1_000_000_000) {
    const formatted = (absVal / 1_000_000_000).toFixed(2);
    return `${sign}${toPersianDigits(formatted)}${showUnit ? ' میلیارد تومان' : ''}`;
  }

  // میلیون تومان
  if (absVal >= 1_000_000) {
    const formatted = (absVal / 1_000_000).toFixed(1);
    return `${sign}${toPersianDigits(formatted)}${showUnit ? ' میلیون تومان' : ''}`;
  }

  // هزار تومان
  if (absVal >= 1_000) {
    const formatted = Math.round(absVal).toLocaleString('en-US');
    return `${sign}${toPersianDigits(formatted)}${showUnit ? ' تومان' : ''}`;
  }

  return `${sign}${toPersianDigits(Math.round(absVal).toString())}${showUnit ? ' تومان' : ''}`;
}

export function formatPrice(price: number | undefined | null): string {
  if (!price && price !== 0) return '۰';
  return toPersianDigits(Math.round(price).toLocaleString('en-US'));
}

export function formatCurrency(
  value: number | undefined | null,
  currencyUnit?: string,
  _lang?: string
): string {
  if (value === undefined || value === null) return '۰';
  const formatted = Math.round(value).toLocaleString('en-US');
  const unitLabel = currencyUnit === 'rial' ? ' ریال' : ' تومان';
  return `${toPersianDigits(formatted)}${unitLabel}`;
}

export function formatNumber(value: number | undefined | null, _lang?: string): string {
  if (value === undefined || value === null) return '۰';
  return toPersianDigits(Math.round(value).toLocaleString('en-US'));
}

export function formatCompact(
  value: number | undefined | null,
  currencyUnit?: string,
  _lang?: string
): string {
  return formatToman(value, true);
}

export function formatPercent(percent: number | undefined | null, _unused?: any): string {
  if (percent === undefined || percent === null || isNaN(percent)) return '۰.۰٪';
  const sign = percent > 0 ? '+' : percent < 0 ? '−' : '';
  const absVal = Math.abs(percent).toFixed(2);
  return `${sign}${toPersianDigits(absVal)}٪`;
}

export function formatVolume(volume: number | undefined | null): string {
  if (!volume && volume !== 0) return '۰';
  const abs = Math.abs(volume);
  if (abs >= 1_000_000_000) {
    return `${toPersianDigits((abs / 1_000_000_000).toFixed(2))} B`;
  }
  if (abs >= 1_000_000) {
    return `${toPersianDigits((abs / 1_000_000).toFixed(1))} M`;
  }
  if (abs >= 1_000) {
    return `${toPersianDigits((abs / 1_000).toFixed(0))} K`;
  }
  return toPersianDigits(abs.toLocaleString('en-US'));
}

export function formatDateTime(isoString?: string | null, _lang?: string): string {
  if (!isoString) return getNowJalali();
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return getNowJalali();
  }
}

export function getNowJalali(): string {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(now);
  } catch {
    return '۱۴۰۳/۰۸/۰۴ ۱۲:۳۰';
  }
}

export function getTodayJalaliDate(): string {
  try {
    const now = new Date();
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(now);
  } catch {
    return 'شنبه ۴ آبان ۱۴۰۳';
  }
}
