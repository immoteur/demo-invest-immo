import 'server-only';

import {
  EnergyDpeLabel as EnergyDpeLabelSchema,
  PropertySearch200Response as PropertySearch200ResponseSchema,
  PropertySearchBody as PropertySearchBodySchema,
  PropertyType as PropertyTypeSchema,
  TransactionType as TransactionTypeSchema,
} from '@immoteur/openapi-zod';
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
  const propertyTypes = parseEnumList(
    process.env.IMMOTEUR_PROPERTY_TYPES,
    ALLOWED_PROPERTY_TYPES,
    DEFAULT_PROPERTY_TYPES,
  );
  const energyDpeLabels = getDpeFilterLabels();
  const maxResults = options.maxResults ?? getMaxResults();
  const cacheKey = buildCacheKey({
    department,
    transactionType,
    propertyTypes,
    energyDpeLabels,
    maxResults,
  });
  const cached = getCachedEntry(cacheKey);
  if (cached) {
    return cached.value;
  }

  const payload: PropertySearchBody = PropertySearchBodySchema.parse({
    page: 1,
    transactionType,
    propertyTypes,
    energyDpeLabels,
    locationDepartments: [department],
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
    const message = await response.text();
    throw new Error(`Immoteur API error (${response.status}): ${message}`);
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
