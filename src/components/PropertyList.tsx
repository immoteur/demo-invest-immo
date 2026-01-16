'use client';

import { Suspense, use } from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import type { EnergyDpeLabel } from '@immoteur/openapi-zod';
import { Building2, ExternalLink, Github, MapPin, Tag } from 'lucide-react';
import { useTranslation } from '@/app/i18n/client';
import { toPropertyCards, type PropertyCard as PropertyCardType } from '@/lib/classifieds';
import { departments, type Department } from '@/lib/departments';
import { formatInteger } from '@/lib/format';
import type { PropertySearchResponse } from '@/lib/immoteur';
import { PropertyCard } from './PropertyCard';
import { DepartmentAutocomplete } from './DepartmentAutocomplete';
import { LanguageSwitch } from './LanguageSwitch';

type PropertyListProps = {
  selectedDepartment: Department;
  dpeLabels: EnergyDpeLabel[];
  responsePromise: Promise<PropertySearchResponse>;
  maxResults: number;
};

type PropertySummaryProps = {
  responsePromise: Promise<PropertySearchResponse>;
};

type PropertyResultsProps = {
  responsePromise: Promise<PropertySearchResponse>;
  maxResults: number;
  selectedDepartment: Department;
};

type PropertyResultsSkeletonProps = {
  selectedDepartment: Department;
};

const SKELETON_PROPERTY_COUNT = 6;

const createSkeletonProperty = (index: number, department: Department): PropertyCardType => ({
  id: `skeleton-${department.code}-${index}`,
  imageUrl: null,
  price: null,
  pricePerSquareUnit: null,
  roomCount: null,
  bedroomCount: null,
  area: null,
  dpeLabel: null,
  gesLabel: null,
  postcode: '00000',
  city: 'Cityname',
  department: department.code,
  description: '',
  isProfessional: false,
  sources: [],
  firstSeenAt: '1970-01-01T00:00:00.000Z',
});

function PropertySummary({ responsePromise }: PropertySummaryProps) {
  const { t, language } = useTranslation();
  const notAvailableLabel = t('labels.notAvailable');
  const response = use(responsePromise);
  const totalMatchesLabel = formatInteger(response.meta.total, language, notAvailableLabel);

  return (
    <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
      <span>
        {t('summary.totalMatches', {
          count: response.meta.total,
          countLabel: totalMatchesLabel,
        })}
      </span>
    </div>
  );
}

function PropertySummarySkeleton() {
  const { t } = useTranslation();
  return (
    <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
      <span className="skeleton text-transparent inline-flex rounded-md px-2">
        {t('summary.totalMatches', { count: 0, countLabel: '000' })}
      </span>
    </div>
  );
}

function PropertyResults({
  responsePromise,
  maxResults,
  selectedDepartment,
}: PropertyResultsProps) {
  const { t } = useTranslation();
  const response = use(responsePromise);
  const displayedProperties = toPropertyCards(response.items, maxResults);
  const showEmptyState = displayedProperties.length === 0;

  if (showEmptyState) {
    return (
      <div className="rounded-3xl bg-card p-8 text-sm text-muted soft-ring">
        {t('empty.noClassifieds', { department: selectedDepartment.name })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {displayedProperties.map((property, index) => (
          <PropertyCard key={property.id} property={property} index={index} />
        ))}
      </div>
      <div className="rounded-2xl bg-card/80 p-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted soft-ring">
        {t('pagination.notice')}
      </div>
    </div>
  );
}

function PropertyResultsSkeleton({ selectedDepartment }: PropertyResultsSkeletonProps) {
  const { t } = useTranslation();
  const displayedProperties = Array.from({ length: SKELETON_PROPERTY_COUNT }, (_, index) =>
    createSkeletonProperty(index, selectedDepartment),
  );

  return (
    <div className="space-y-6" aria-busy>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {displayedProperties.map((property, index) => (
          <PropertyCard key={property.id} property={property} index={index} isSkeleton />
        ))}
      </div>
      <div className="rounded-2xl bg-card/80 p-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted soft-ring skeleton text-transparent">
        {t('pagination.notice')}
      </div>
    </div>
  );
}

export function PropertyList({
  selectedDepartment,
  dpeLabels,
  responsePromise,
  maxResults,
}: PropertyListProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_top,_rgba(47,95,70,0.35),_transparent_60%)] blur-2xl animate-[drift_10s_ease-in-out_infinite_alternate]" />
      <div className="pointer-events-none absolute -left-28 top-80 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_top,_rgba(224,106,79,0.35),_transparent_60%)] blur-3xl animate-[drift_12s_ease-in-out_infinite_alternate]" />

      <header className="relative mx-auto max-w-6xl px-6 pt-16">
        <div className="flex flex-wrap items-center gap-2">
          <a href="https://immoteur.com/" target="_blank" rel="noreferrer" className="inline-flex">
            <Chip
              variant="flat"
              radius="sm"
              className="bg-card soft-ring text-[11px] uppercase tracking-[0.3em]"
              endContent={<ExternalLink size={14} />}
            >
              {t('hero.badge')}
            </Chip>
          </a>
          <a
            href="https://github.com/immoteur/demo-invest-immo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <Chip
              variant="flat"
              radius="sm"
              className="bg-card soft-ring text-[11px] uppercase tracking-[0.3em]"
              endContent={<Github size={14} />}
            >
              {t('hero.githubCta')}
            </Chip>
          </a>
          <LanguageSwitch className="ml-auto" />
        </div>
        <h1 className="mt-4 font-display text-4xl text-foreground sm:text-5xl md:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">{t('hero.subtitle')}</p>

        <Card
          className="mt-8 bg-card/80 soft-ring border border-transparent"
          radius="lg"
          shadow="none"
        >
          <CardBody className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <DepartmentAutocomplete
                key={selectedDepartment.code}
                departments={departments}
                selectedCode={selectedDepartment.code}
              />
              <div className="flex flex-wrap gap-2">
                <Chip
                  variant="flat"
                  radius="sm"
                  className="bg-card soft-ring"
                  startContent={<Tag size={14} />}
                >
                  {t('filters.sale')}
                </Chip>
                <Chip
                  variant="flat"
                  radius="sm"
                  className="bg-card soft-ring"
                  startContent={<Building2 size={14} />}
                >
                  {t('filters.apartment')}
                </Chip>
                {dpeLabels.map((label) => (
                  <Chip
                    key={label}
                    variant="flat"
                    radius="sm"
                    className="border text-xs uppercase tracking-[0.2em] energy-chip"
                    data-energy={label.toUpperCase()}
                  >
                    {t('labels.dpe', { label: label.toUpperCase() })}
                  </Chip>
                ))}
                <Chip
                  color="secondary"
                  variant="flat"
                  radius="sm"
                  className="bg-card soft-ring"
                  startContent={<MapPin size={14} />}
                >
                  {selectedDepartment.code} {selectedDepartment.name}
                </Chip>
              </div>
            </div>
            <Suspense
              key={`summary-${selectedDepartment.code}`}
              fallback={<PropertySummarySkeleton />}
            >
              <PropertySummary responsePromise={responsePromise} />
            </Suspense>
          </CardBody>
        </Card>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-12">
        <Suspense
          key={`results-${selectedDepartment.code}`}
          fallback={<PropertyResultsSkeleton selectedDepartment={selectedDepartment} />}
        >
          <PropertyResults
            responsePromise={responsePromise}
            maxResults={maxResults}
            selectedDepartment={selectedDepartment}
          />
        </Suspense>
      </main>
    </div>
  );
}
