'use client';

import { useEffect } from 'react';
import { Button, Card, CardBody } from '@heroui/react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6 py-16">
      <Card className="bg-card/80 soft-ring border border-transparent" shadow="none">
        <CardBody className="flex flex-col gap-4 p-6 text-center">
          <h2 className="font-display text-2xl text-foreground">Something went wrong.</h2>
          <p className="text-sm text-muted">Please try again.</p>
          <div className="flex justify-center">
            <Button
              variant="flat"
              radius="sm"
              className="bg-card soft-ring text-[11px] uppercase tracking-[0.2em] text-foreground"
              onPress={reset}
            >
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
