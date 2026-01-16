'use client';

import { HeroUIProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const navigate = (path: string) => {
    router.push(path);
  };

  return <HeroUIProvider navigate={navigate}>{children}</HeroUIProvider>;
}
