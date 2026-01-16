'use client';

import { useEffect } from 'react';
import i18next from 'i18next';
import {
  initReactI18next,
  useTranslation as useTranslationI18Next,
  type UseTranslationOptions,
  type UseTranslationResponse,
} from 'react-i18next';
import { useCookies } from 'react-cookie';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { useCurrentLocale } from 'next-i18n-router/client';
import { usePathname, useRouter } from 'next/navigation';

import { getOptions, languages, cookieName, i18nMiddlewareConfig, type Language } from './settings';

const isServerSide = () => typeof window === 'undefined';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
    lng: undefined,
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: isServerSide() ? languages : [],
  });

export const useTranslation = (
  ns?: string,
  options: UseTranslationOptions<string> = {},
): UseTranslationResponse<string, string> & { language: Language } => {
  const locale = useCurrentLocale(i18nMiddlewareConfig);
  const [cookies, setCookie] = useCookies([cookieName]);
  const mergedOptions = locale && !options.lng ? { ...options, lng: locale } : options;
  const ret = useTranslationI18Next(ns, mergedOptions);
  const { i18n } = ret;

  useEffect(() => {
    if (locale && i18n.resolvedLanguage !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  useEffect(() => {
    if (locale && cookies.i18next !== locale) {
      setCookie(cookieName, locale, { path: '/' });
    }
  }, [locale, cookies.i18next, setCookie]);

  const language = (locale ?? ret.i18n.resolvedLanguage ?? ret.i18n.language) as Language;

  return Object.assign(ret, { language });
};

export type Locale = (typeof i18nMiddlewareConfig.locales)[number];
export const useLocale = (): Locale | '' => {
  const { language } = useTranslation();

  return i18nMiddlewareConfig.defaultLocale === language ? '' : language;
};

export const useSetLocale = () => {
  const { i18n } = useTranslation();
  const [, setCookie] = useCookies([cookieName]);
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments[0] && i18nMiddlewareConfig.locales.includes(pathSegments[0])) {
    pathSegments.shift();
  }

  return (locale: Locale) => {
    i18n.changeLanguage(locale);
    setCookie(cookieName, locale, { path: '/' });
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const restPath = pathSegments.join('/');
    const nextPath =
      (locale === i18nMiddlewareConfig.defaultLocale
        ? `/${restPath}`
        : restPath
          ? `/${locale}/${restPath}`
          : `/${locale}`) +
      search +
      hash;

    router.replace(nextPath, { scroll: false });
  };
};
