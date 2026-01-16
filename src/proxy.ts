import { i18nRouter } from 'next-i18n-router';
import { NextRequest } from 'next/server';

import { i18nMiddlewareConfig } from './app/i18n/settings';

export function proxy(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const pathLocale = i18nMiddlewareConfig.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  const localeHeader = pathLocale ?? i18nMiddlewareConfig.defaultLocale;
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-immoteur-locale', localeHeader);
  const requestWithLocale = new NextRequest(request, {
    headers: requestHeaders,
  });

  return i18nRouter(requestWithLocale, i18nMiddlewareConfig);
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
