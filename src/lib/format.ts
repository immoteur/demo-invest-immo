type FormatterBundle = {
  price: Intl.NumberFormat;
  integer: Intl.NumberFormat;
  decimal: Intl.NumberFormat;
  date: Intl.DateTimeFormat;
};

const formatterCache = new Map<string, FormatterBundle>();

const localeMap: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
};

function resolveLocale(language?: string): string {
  const normalized = (language ?? '').toLowerCase();
  if (normalized.startsWith('en')) return localeMap.en;
  if (normalized.startsWith('fr')) return localeMap.fr;
  return localeMap.fr;
}

function getFormatters(language?: string): FormatterBundle {
  const locale = resolveLocale(language);
  const cached = formatterCache.get(locale);
  if (cached) return cached;

  const entry: FormatterBundle = {
    price: new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }),
    integer: new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }),
    decimal: new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
    }),
    date: new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
  formatterCache.set(locale, entry);
  return entry;
}

export function formatPrice(
  value: number | null | undefined,
  language?: string,
  fallback = 'N/A',
): string {
  if (value === null || value === undefined) return fallback;
  return getFormatters(language).price.format(value);
}

export function formatCount(
  value: number | null | undefined,
  language?: string,
  fallback = 'N/A',
): string {
  if (value === null || value === undefined) return fallback;
  return getFormatters(language).decimal.format(value);
}

export function formatInteger(
  value: number | null | undefined,
  language?: string,
  fallback = 'N/A',
): string {
  return formatCount(value, language, fallback);
}

export function truncateText(
  value: string | null | undefined,
  fallback: string,
  maxLength = 160,
): string {
  if (!value) return fallback;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

export function formatDate(
  value: string | null | undefined,
  language?: string,
  fallback = 'N/A',
): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return getFormatters(language).date.format(parsed);
}
