'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
} from '@heroui/react';
import { BedDouble, Briefcase, ChevronDown, ExternalLink, Home, User } from 'lucide-react';
import { useTranslation } from '@/app/i18n/client';
import type { PropertyCard as PropertyCardData } from '@/lib/classifieds';
import { formatCount, formatDate, formatPrice, truncateText } from '@/lib/format';

type PropertyCardProps = {
  property: PropertyCardData;
  index: number;
  isSkeleton?: boolean;
};

export function PropertyCard({ property, index, isSkeleton = false }: PropertyCardProps) {
  const { t, language } = useTranslation();
  const skeletonClass = isSkeleton ? 'skeleton text-transparent' : '';
  const skeletonBlockClass = isSkeleton ? 'skeleton' : '';
  const skeletonChipClass = isSkeleton ? 'skeleton text-transparent border-transparent' : '';
  const skeletonIconClass = isSkeleton ? 'text-transparent' : '';
  const placeholderCount = '00';
  const placeholderDate = '00/00/0000';
  const placeholderPrice = '000 000 EUR';
  const placeholderCity = 'Cityname';
  const placeholderPostcode = '00000';
  const placeholderDescription = 'Loading description for this property listing.';

  const notAvailableLabel = t('labels.notAvailable');
  const noDescriptionLabel = t('labels.noDescription');
  const priceLabel = isSkeleton
    ? placeholderPrice
    : formatPrice(property.price, language, notAvailableLabel);
  const description = isSkeleton
    ? placeholderDescription
    : truncateText(property.description, noDescriptionLabel);
  const dpeLabel = isSkeleton ? '--' : (property.dpeLabel?.toUpperCase() ?? '?');
  const gesLabel = isSkeleton ? '--' : (property.gesLabel?.toUpperCase() ?? '?');
  const dpeEnergy = isSkeleton ? undefined : property.dpeLabel?.toUpperCase();
  const gesEnergy = isSkeleton ? undefined : property.gesLabel?.toUpperCase();
  const firstSeenLabel = isSkeleton
    ? placeholderDate
    : formatDate(property.firstSeenAt, language, notAvailableLabel);
  const roomCount = property.roomCount ?? 0;
  const roomCountLabel = isSkeleton
    ? placeholderCount
    : formatCount(property.roomCount, language, notAvailableLabel);
  const bedroomCountLabel = isSkeleton
    ? placeholderCount
    : formatCount(property.bedroomCount, language, notAvailableLabel);
  const areaLabel = isSkeleton
    ? t('labels.areaUnit', { area: '000' })
    : property.area === null || property.area === undefined
      ? notAvailableLabel
      : t('labels.areaUnit', {
          area: formatCount(property.area, language, notAvailableLabel),
        });
  const [primarySource, ...otherSources] = property.sources;
  const hasOtherSources = otherSources.length > 0;

  return (
    <Card
      className={`bg-card soft-ring border border-transparent overflow-hidden ${isSkeleton ? 'pointer-events-none select-none' : 'card-reveal'}`}
      style={isSkeleton ? undefined : { animationDelay: `${index * 70}ms` }}
      radius="lg"
      shadow="none"
      aria-hidden={isSkeleton}
    >
      <CardHeader className="relative p-0">
        <div className="relative aspect-[4/3] w-full">
          {isSkeleton ? (
            <div className={`h-full w-full ${skeletonBlockClass}`} aria-hidden />
          ) : property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={t('card.imageAlt', { city: property.city })}
              className="block h-full w-full object-cover"
              removeWrapper
              loading="lazy"
              decoding="async"
              disableSkeleton
              classNames={{ img: 'opacity-100' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(224,106,79,0.3),_rgba(47,95,70,0.1))]">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                {t('card.noImage')}
              </span>
            </div>
          )}
          <div className="absolute left-4 top-4 z-20">
            <Chip
              variant="flat"
              radius="sm"
              className={`bg-card text-[11px] uppercase tracking-[0.18em] shadow-sm border border-[rgba(31,26,19,0.2)] ${
                isSkeleton ? skeletonChipClass : 'text-foreground'
              }`}
            >
              {t('card.firstSeen', { date: firstSeenLabel })}
            </Chip>
          </div>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-4 p-5 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chip
            variant="flat"
            radius="sm"
            className={`bg-card soft-ring text-xs ${skeletonChipClass}`}
          >
            {priceLabel}
          </Chip>
          <div className="flex items-center gap-2">
            <Chip
              variant="flat"
              radius="sm"
              className={`border text-[11px] uppercase tracking-[0.2em] ${isSkeleton ? '' : 'energy-chip'} ${skeletonChipClass}`}
              data-energy={dpeEnergy}
            >
              {t('labels.dpe', { label: dpeLabel })}
            </Chip>
            <Chip
              variant="flat"
              radius="sm"
              className={`border text-[11px] uppercase tracking-[0.2em] ${isSkeleton ? '' : 'energy-chip'} ${skeletonChipClass}`}
              data-energy={gesEnergy}
            >
              {t('labels.ges', { label: gesLabel })}
            </Chip>
          </div>
        </div>
        <div className="flex w-full items-start justify-between text-xs uppercase tracking-[0.2em] text-muted">
          <span className={skeletonClass}>
            {(isSkeleton ? placeholderCity : property.city) ?? placeholderCity} -{' '}
            {(isSkeleton ? placeholderPostcode : property.postcode) ?? placeholderPostcode}
          </span>
          <Chip
            size="sm"
            radius="sm"
            variant="flat"
            className={`bg-card soft-ring text-[11px] font-semibold uppercase tracking-[0.15em] ${skeletonChipClass}`}
            startContent={
              isSkeleton ? (
                <span className={`h-3 w-3 rounded-full ${skeletonBlockClass}`} aria-hidden />
              ) : property.isProfessional ? (
                <Briefcase size={14} />
              ) : (
                <User size={14} />
              )
            }
          >
            {isSkeleton
              ? t('card.professional')
              : property.isProfessional
                ? t('card.professional')
                : t('card.private')}
          </Chip>
        </div>
        <div className="space-y-2">
          <h3 className={`font-display text-xl ${isSkeleton ? skeletonClass : 'text-foreground'}`}>
            {t('card.title', { count: roomCount, countLabel: roomCountLabel })}
          </h3>
          <p className={`text-sm ${isSkeleton ? skeletonClass : 'text-muted'}`}>{description}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-3 text-xs uppercase tracking-[0.2em] text-muted">
          <span className="flex items-center gap-2">
            <Home size={14} className={skeletonIconClass} />{' '}
            <span className={skeletonClass}>{roomCountLabel}</span>
          </span>
          <span className="flex items-center gap-2">
            <BedDouble size={14} className={skeletonIconClass} />{' '}
            <span className={skeletonClass}>{bedroomCountLabel}</span>
          </span>
          <span className={`flex items-center gap-2 ${skeletonClass}`}>
            {t('card.area', { area: areaLabel })}
          </span>
        </div>
      </CardBody>
      <CardFooter className="flex items-center justify-between gap-3 p-5 pt-4">
        {isSkeleton ? (
          <div className={`h-8 w-32 rounded-lg ${skeletonBlockClass}`} aria-hidden />
        ) : primarySource ? (
          hasOtherSources ? (
            <div className="inline-flex items-stretch overflow-hidden rounded-lg bg-card soft-ring">
              <Button
                as="a"
                href={primarySource.source.url}
                target="_blank"
                rel="noreferrer"
                variant="flat"
                radius="none"
                size="sm"
                className="bg-transparent text-[11px] uppercase tracking-[0.2em] text-foreground"
                startContent={<ExternalLink size={14} />}
              >
                {primarySource.source.domain}
              </Button>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="flat"
                    radius="none"
                    size="sm"
                    className="bg-transparent text-foreground border-l border-[rgba(31,26,19,0.15)]"
                    aria-label={t('card.source.otherLinks')}
                  >
                    <ChevronDown size={14} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label={t('card.source.otherSources')}>
                  {otherSources.map((source) => (
                    <DropdownItem
                      key={source.id}
                      as="a"
                      href={source.source.url}
                      target="_blank"
                      rel="noreferrer"
                      startContent={<ExternalLink size={14} />}
                      className="text-foreground"
                    >
                      {source.source.domain}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            <Button
              as="a"
              href={primarySource.source.url}
              target="_blank"
              rel="noreferrer"
              variant="flat"
              radius="sm"
              size="sm"
              className="bg-card soft-ring text-[11px] uppercase tracking-[0.2em] text-foreground"
              startContent={<ExternalLink size={14} />}
            >
              {primarySource.source.domain}
            </Button>
          )
        ) : (
          <span className="text-xs uppercase tracking-[0.2em] text-muted">
            {t('card.source.none')}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
