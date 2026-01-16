import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import { fallbackLng, languages } from './i18n/settings';
import './globals.css';

const bodyFont = Space_Grotesk({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const displayFont = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
});

export const metadata: Metadata = {
  title: "Invest'Immo",
  description: 'Reno API demo showcasing DPE G apartment classifieds with department filtering.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get('x-immoteur-locale') ?? fallbackLng;
  const lng = languages.includes(headerLocale) ? headerLocale : fallbackLng;

  return (
    <html suppressHydrationWarning lang={lng}>
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
