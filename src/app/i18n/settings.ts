import type { Config } from 'next-i18n-router/dist/types';

export const fallbackLng = 'fr';
export const languages: string[] = [fallbackLng, 'en'];
export type Language = (typeof languages)[number];
export const defaultNS = 'default';
export const cookieName = 'i18next';

export const i18nMiddlewareConfig: Config = {
  locales: languages,
  defaultLocale: fallbackLng,
  localeCookie: cookieName,
};

export interface I18nOptions {
  supportedLngs: string[];
  fallbackLng: string;
  lng: string;
  fallbackNS: string;
  defaultNS: string;
  ns: string;
}

export function getOptions(lng: string = fallbackLng, ns: string = defaultNS): I18nOptions {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
