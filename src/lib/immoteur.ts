import 'server-only';

import {
  EnergyDpeLabel as EnergyDpeLabelSchema,
  PropertySearch200Response as PropertySearch200ResponseSchema,
  PropertySearchBody as PropertySearchBodySchema,
  PropertyType as PropertyTypeSchema,
  TransactionType as TransactionTypeSchema,
} from '@immoteur/openapi-zod';
import { ALL_DEPARTMENT_CODE } from './departments';
import type {
  EnergyDpeLabel,
  PropertySearch200Response,
  PropertySearchBody,
  PropertySearchOrder,
  PropertySearchSortBy,
  PropertyType,
  TransactionType,
} from '@immoteur/openapi-zod';

export type PropertySearchResponse = PropertySearch200Response;

const RATE_LIMIT_HEADER_KEYS = [
  'ratelimit-policy',
  'ratelimit-limit',
  'ratelimit-remaining',
  'ratelimit-reset',
] as const;

type RateLimitHeaderKey = (typeof RATE_LIMIT_HEADER_KEYS)[number];
type RateLimitHeaders = Partial<Record<RateLimitHeaderKey, string>>;

export type ImmoteurErrorState = {
  message: string;
  status: number | null;
  statusText: string | null;
  rateLimitHeaders: RateLimitHeaders;
  body: string | null;
};

export type PropertySearchResult =
  | { ok: true; data: PropertySearchResponse }
  | { ok: false; error: ImmoteurErrorState };

const API_BASE_URL =
  process.env.IMMOTEUR_API_BASE_URL?.trim() || 'https://api.immoteur.com/public/v1';
const API_KEY = process.env.IMMOTEUR_API_KEY;

const DEFAULT_TRANSACTION_TYPE: TransactionType = 'sale';
const DEFAULT_PROPERTY_TYPES: PropertyType[] = ['apartment'];
const DEFAULT_DPE_LABELS: EnergyDpeLabel[] = ['f', 'g'];
const DEFAULT_MAX_RESULTS = 15;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

const ALLOWED_PROPERTY_TYPES = new Set<PropertyType>(PropertyTypeSchema.options as PropertyType[]);
const ALLOWED_DPE_LABELS = new Set<EnergyDpeLabel>(
  EnergyDpeLabelSchema.options as EnergyDpeLabel[],
);
const SORT_BY: PropertySearchSortBy = 'firstSeenAt';
const ORDER_BY: PropertySearchOrder = 'desc';

type CachedEntry = {
  value: PropertySearchResponse;
  expiresAt: number;
};

type ImmoteurApiErrorDetails = {
  status: number;
  statusText: string;
  url: string;
  body: string;
  rateLimitHeaders: RateLimitHeaders;
};

class ImmoteurApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: string;
  readonly rateLimitHeaders: RateLimitHeaders;

  constructor(details: ImmoteurApiErrorDetails) {
    const statusLabel = details.statusText
      ? `${details.status} ${details.statusText}`
      : `${details.status}`;
    super(`Immoteur API error (${statusLabel}): ${details.body}`);
    this.name = 'ImmoteurApiError';
    this.status = details.status;
    this.statusText = details.statusText;
    this.url = details.url;
    this.body = details.body;
    this.rateLimitHeaders = details.rateLimitHeaders;
  }
}

const propertySearchCache = new Map<string, CachedEntry>();

function ensureApiKey(): string {
  if (!API_KEY) {
    throw new Error('IMMOTEUR_API_KEY is required to call the Immoteur API.');
  }
  return API_KEY;
}

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseBooleanFlag(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

function parseEnumList<T extends string>(
  value: string | undefined,
  allowed: Set<T>,
  fallback: T[],
): T[] {
  const normalized = parseCsv(value).map((entry) => entry.toLowerCase()) as T[];
  const filtered = normalized.filter((entry) => allowed.has(entry));
  if (filtered.length === 0) return [...fallback];
  return Array.from(new Set(filtered));
}

function extractRateLimitHeaders(headers: Headers): RateLimitHeaders {
  const rateLimitHeaders: RateLimitHeaders = {};
  for (const key of RATE_LIMIT_HEADER_KEYS) {
    const value = headers.get(key);
    if (value) {
      rateLimitHeaders[key] = value;
    }
  }
  return rateLimitHeaders;
}

function logApiError(details: ImmoteurApiErrorDetails): void {
  const payload: Record<string, unknown> = {
    status: details.status,
    statusText: details.statusText,
    url: details.url,
  };
  if (details.body) payload.body = details.body;
  if (Object.keys(details.rateLimitHeaders).length > 0) {
    payload.rateLimitHeaders = details.rateLimitHeaders;
  }
  console.error('Immoteur API request failed', payload);
}

function normalizeApiError(error: unknown): ImmoteurErrorState {
  if (error instanceof ImmoteurApiError) {
    return {
      message: error.message,
      status: error.status,
      statusText: error.statusText || null,
      rateLimitHeaders: error.rateLimitHeaders,
      body: error.body,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: null,
      statusText: null,
      rateLimitHeaders: {},
      body: null,
    };
  }

  return {
    message: String(error),
    status: null,
    statusText: null,
    rateLimitHeaders: {},
    body: null,
  };
}

export function getAllowNoDepartment(): boolean {
  return parseBooleanFlag(process.env.ALLOW_NO_DEPARTMENT);
}

export function getPropertyTypes(): PropertyType[] {
  return parseEnumList(
    process.env.IMMOTEUR_PROPERTY_TYPES,
    ALLOWED_PROPERTY_TYPES,
    DEFAULT_PROPERTY_TYPES,
  );
}

export function getDpeFilterLabels(): EnergyDpeLabel[] {
  return parseEnumList(process.env.IMMOTEUR_DPE_LABELS, ALLOWED_DPE_LABELS, DEFAULT_DPE_LABELS);
}

function getTransactionType(): TransactionType {
  const normalized = process.env.IMMOTEUR_TRANSACTION_TYPE?.trim().toLowerCase();
  if (!normalized) return DEFAULT_TRANSACTION_TYPE;
  const parsed = TransactionTypeSchema.safeParse(normalized);
  return parsed.success ? parsed.data : DEFAULT_TRANSACTION_TYPE;
}

export function getMaxResults(): number {
  const value = process.env.IMMOTEUR_MAX_RESULTS;
  if (!value) return DEFAULT_MAX_RESULTS;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return DEFAULT_MAX_RESULTS;
  return parsed;
}

function parseCacheTtlMs(value: string | undefined): number {
  if (!value) return DEFAULT_CACHE_TTL_MS;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1000) return DEFAULT_CACHE_TTL_MS;
  return parsed;
}

function getCacheTtlMs(): number {
  return parseCacheTtlMs(process.env.IMMOTEUR_CACHE_TTL_MS);
}

function buildUrl(path: string): string {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(path, base).toString();
}

function buildCacheKey(params: {
  department: string;
  transactionType: TransactionType;
  propertyTypes: PropertyType[];
  energyDpeLabels: EnergyDpeLabel[];
  maxResults: number;
}): string {
  return [
    'properties-search',
    API_BASE_URL,
    params.department,
    params.transactionType,
    params.propertyTypes.join(','),
    params.energyDpeLabels.join(','),
    String(params.maxResults),
  ].join('|');
}

function getCachedEntry(key: string): CachedEntry | null {
  const cached = propertySearchCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    propertySearchCache.delete(key);
    return null;
  }
  return cached;
}

function setCachedEntry(key: string, value: PropertySearchResponse, ttlMs: number): void {
  propertySearchCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export async function fetchPropertiesByDepartment(
  department: string,
  options: { maxResults?: number } = {},
): Promise<PropertySearchResponse> {
  const transactionType = getTransactionType();
  const propertyTypes = getPropertyTypes();
  const energyDpeLabels = getDpeFilterLabels();
  const maxResults = options.maxResults ?? getMaxResults();
  const normalizedDepartment = department.trim();
  const cacheKey = buildCacheKey({
    department: normalizedDepartment,
    transactionType,
    propertyTypes,
    energyDpeLabels,
    maxResults,
  });
  const cached = getCachedEntry(cacheKey);
  if (cached) {
    return cached.value;
  }

  const shouldFilterDepartment =
    normalizedDepartment.length > 0 &&
    !(getAllowNoDepartment() && normalizedDepartment.toLowerCase() === ALL_DEPARTMENT_CODE);

  const payload: PropertySearchBody = PropertySearchBodySchema.parse({
    page: 1,
    transactionType,
    propertyTypes,
    energyDpeLabels,
    ...(shouldFilterDepartment ? { locationDepartments: [normalizedDepartment] } : {}),
    sortBy: SORT_BY,
    orderBy: ORDER_BY,
  });

  const response = await fetch(buildUrl('properties/search'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ensureApiKey()}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const details: ImmoteurApiErrorDetails = {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body: await response.text(),
      rateLimitHeaders: extractRateLimitHeaders(response.headers),
    };
    logApiError(details);
    throw new ImmoteurApiError(details);
  }

  const json = await response.json();
  const parsed = PropertySearch200ResponseSchema.parse(json);
  const responseMeta = parsed.meta;
  let items = parsed.items;

  if (items.length >= maxResults) {
    items = items.slice(0, maxResults);
  }

  if (!responseMeta) {
    throw new Error('Immoteur API returned no pagination metadata.');
  }

  const result = {
    items,
    meta: responseMeta,
  };
  setCachedEntry(cacheKey, result, getCacheTtlMs());
  return result;
}

export async function fetchPropertiesByDepartmentSafe(
  department: string,
  options: { maxResults?: number } = {},
): Promise<PropertySearchResult> {
  try {
    const data = await fetchPropertiesByDepartment(department, options);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}
