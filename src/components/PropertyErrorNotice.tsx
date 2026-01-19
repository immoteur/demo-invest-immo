'use client';

import { Card, CardBody } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/app/i18n/client';
import type { ImmoteurErrorState } from '@/lib/immoteur';

type PropertyErrorNoticeProps = {
  error: ImmoteurErrorState;
};

type ParsedMessage = {
  value: string;
  isJson: boolean;
};

function parseJsonBody(body: string | null): unknown | null {
  if (!body) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

function formatErrorMessage(parsedBody: unknown | null, fallback: string): ParsedMessage {
  if (parsedBody === null) {
    return { value: fallback, isJson: false };
  }

  if (typeof parsedBody === 'string') {
    return { value: parsedBody, isJson: false };
  }

  if (typeof parsedBody === 'object') {
    return { value: JSON.stringify(parsedBody, null, 2), isJson: true };
  }

  return { value: String(parsedBody), isJson: false };
}

export function PropertyErrorNotice({ error }: PropertyErrorNoticeProps) {
  const { t } = useTranslation();
  const parsedBody = parseJsonBody(error.body);
  const message = formatErrorMessage(parsedBody, error.message);
  const statusLabel =
    error.status === null
      ? t('errors.statusUnknown')
      : error.statusText
        ? `${error.status} ${error.statusText}`
        : String(error.status);
  const headerEntries = Object.entries(error.rateLimitHeaders).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const headerLabels: Record<string, string> = {
    'ratelimit-policy': 'RateLimit-Policy',
    'ratelimit-limit': 'RateLimit-Limit',
    'ratelimit-remaining': 'RateLimit-Remaining',
    'ratelimit-reset': 'RateLimit-Reset',
  };

  return (
    <Card className="bg-card/80 soft-ring border border-transparent" shadow="none">
      <CardBody className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-2 text-foreground">
          <AlertTriangle size={18} />
          <span className="font-display text-lg">{t('errors.loadClassifieds')}</span>
        </div>

        <div className="grid gap-4 text-sm text-muted">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {t('errors.statusLabel')}
            </div>
            <div className="mt-2 rounded-2xl bg-card px-4 py-3 text-foreground">{statusLabel}</div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {t('errors.messageLabel')}
            </div>
            <div
              className={[
                'mt-2 rounded-2xl bg-card px-4 py-3 text-foreground whitespace-pre-wrap break-words',
                message.isJson ? 'font-mono text-xs' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {message.value}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {t('errors.headersLabel')}
            </div>
            {headerEntries.length === 0 ? (
              <div className="mt-2 rounded-2xl bg-card px-4 py-3 text-foreground">
                {t('errors.headersEmpty')}
              </div>
            ) : (
              <div className="mt-2 space-y-2 rounded-2xl bg-card px-4 py-3 text-foreground">
                {headerEntries.map(([key, value]) => (
                  <div key={key} className="flex flex-wrap gap-2">
                    <span className="text-muted">{headerLabels[key] ?? key}</span>
                    <span className="font-mono text-xs text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
