import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

/**
 * checkUpstashConfig() should:
 *  - say nothing when BOTH Upstash vars are set
 *  - say nothing when NEITHER is set
 *  - warn (or error in prod) when EXACTLY ONE is set, naming the missing one
 *  - only warn once per process
 */

// vi.stubEnv is the only reliable way to mutate NODE_ENV in modern
// Node/Vitest — direct assignment is silently a no-op in strict mode.
// Other env vars are still set directly via the permissive cast.
const env = process.env as Record<string, string | undefined>;

beforeEach(() => {
  vi.resetModules();
  delete env.UPSTASH_REDIS_REST_URL;
  delete env.UPSTASH_REDIS_REST_TOKEN;
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('checkUpstashConfig', () => {
  it('is silent when both vars are set', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { checkUpstashConfig } = await import('@/lib/env');
    checkUpstashConfig();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('is silent when neither var is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { checkUpstashConfig } = await import('@/lib/env');
    checkUpstashConfig();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('warns when only the URL is set, naming the missing TOKEN', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { checkUpstashConfig } = await import('@/lib/env');
    checkUpstashConfig();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('UPSTASH_REDIS_REST_TOKEN');
  });

  it('warns when only the TOKEN is set, naming the missing URL', async () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { checkUpstashConfig } = await import('@/lib/env');
    checkUpstashConfig();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('UPSTASH_REDIS_REST_URL');
  });

  it('escalates to console.error in production', async () => {
    env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { checkUpstashConfig } = await import('@/lib/env');
    checkUpstashConfig();
    expect(error).toHaveBeenCalledOnce();
    expect(warn).not.toHaveBeenCalled();
  });

  it('only fires once per process', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { checkUpstashConfig } = await import('@/lib/env');
    checkUpstashConfig();
    checkUpstashConfig();
    checkUpstashConfig();
    expect(warn).toHaveBeenCalledOnce();
  });
});
