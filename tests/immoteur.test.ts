import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const originalEnv = { ...process.env };

describe('fetchPropertiesByDepartmentSafe', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('captures rate limit headers when the API responds with an error', async () => {
    process.env.IMMOTEUR_API_KEY = 'test-key';
    process.env.IMMOTEUR_API_BASE_URL = 'https://api.example.test/public/v1';

    const response = new Response('rate limited', {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'RateLimit-Policy': '1;w=1',
        'RateLimit-Limit': '1',
        'RateLimit-Remaining': '0',
        'RateLimit-Reset': '1',
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { fetchPropertiesByDepartmentSafe } = await import('../src/lib/immoteur');

    const result = await fetchPropertiesByDepartmentSafe('75');

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected an error result');

    expect(result.error.status).toBe(429);
    expect(result.error.statusText).toBe('Too Many Requests');
    expect(result.error.rateLimitHeaders).toEqual({
      'ratelimit-policy': '1;w=1',
      'ratelimit-limit': '1',
      'ratelimit-remaining': '0',
      'ratelimit-reset': '1',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Immoteur API request failed',
      expect.objectContaining({
        status: 429,
        statusText: 'Too Many Requests',
        rateLimitHeaders: {
          'ratelimit-policy': '1;w=1',
          'ratelimit-limit': '1',
          'ratelimit-remaining': '0',
          'ratelimit-reset': '1',
        },
      }),
    );
  });

  it('returns an error result when the API key is missing', async () => {
    delete process.env.IMMOTEUR_API_KEY;

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { fetchPropertiesByDepartmentSafe } = await import('../src/lib/immoteur');

    const result = await fetchPropertiesByDepartmentSafe('75');

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected an error result');

    expect(result.error.status).toBeNull();
    expect(result.error.rateLimitHeaders).toEqual({});
    expect(result.error.message).toMatch(/IMMOTEUR_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('omits locationDepartments when ALLOW_NO_DEPARTMENT is enabled', async () => {
    process.env.IMMOTEUR_API_KEY = 'test-key';
    process.env.IMMOTEUR_API_BASE_URL = 'https://api.example.test/public/v1';
    process.env.ALLOW_NO_DEPARTMENT = 'true';

    const response = new Response('rate limited', {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'RateLimit-Policy': '1;w=1',
      },
    });

    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { fetchPropertiesByDepartmentSafe } = await import('../src/lib/immoteur');

    await fetchPropertiesByDepartmentSafe('all');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init?.body));

    expect(body.locationDepartments).toBeUndefined();
  });
});
