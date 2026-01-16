'use client';

import { Button } from '@heroui/react';
import { useSetLocale, useTranslation } from '@/app/i18n/client';

const localeLabels = {
  en: 'EN',
  fr: 'FR',
} as const;

type LanguageSwitchProps = {
  className?: string;
  isSkeleton?: boolean;
};

export function LanguageSwitch({ className, isSkeleton = false }: LanguageSwitchProps) {
  const { t, language } = useTranslation();
  const setLocale = useSetLocale();
  const nextLocale = language === 'en' ? 'fr' : 'en';

  return (
    <Button
      variant="flat"
      radius="sm"
      size="sm"
      className={`bg-card soft-ring text-[11px] uppercase tracking-[0.3em] ${
        className ?? ''
      } ${isSkeleton ? 'pointer-events-none opacity-60' : ''}`}
      onPress={isSkeleton ? undefined : () => setLocale(nextLocale)}
      aria-label={t('language.switch')}
      title={t('language.switch')}
      isDisabled={isSkeleton}
    >
      {localeLabels[nextLocale]}
    </Button>
  );
}
