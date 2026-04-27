import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * isAdmin() is the single authentication boundary for every CMS write
 * route. If it grants access wrongly, the entire admin surface is
 * exposed. Exercise:
 *  - happy path: header SHA-256 matches env hash → { via: 'token' }
 *  - reject: header present but wrong → null + audit log emitted
 *  - reject: missing header → null
 *  - reject: plaintext CMS_TOKEN in dev → null + plaintext warn
 *  - throw: plaintext CMS_TOKEN in production → hard error
 *  - session fallback: NextAuth admin session → { via: 'session' }
 */

vi.mock('@/lib/auth', () => ({ auth: vi.fn(async () => null) }));
vi.mock('@/lib/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  delete process.env.CMS_TOKEN;
  delete process.env.NODE_ENV;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function loadGuard() {
  return import('@/lib/cms/auth-guard');
}

function makeReq(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/', { headers });
}

function sha256Hex(s: string): string {
  // Tests run in node — pull this in dynamically to avoid leaking the
  // import to the module under test.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require('node:crypto');
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

describe('isAdmin', () => {
  it('returns null when no token header and no session', async () => {
    const { isAdmin } = await loadGuard();
    expect(await isAdmin(makeReq())).toBeNull();
  });

  it("returns { via: 'token' } when header hashes to the env value", async () => {
    const secret = 'my-cms-secret';
    process.env.CMS_TOKEN = sha256Hex(secret);
    const { isAdmin } = await loadGuard();
    const result = await isAdmin(makeReq({ 'x-cms-token': secret }));
    expect(result).toEqual({ via: 'token' });
  });

  it('returns null and logs cms_token_invalid when valid-format hash mismatches', async () => {
    process.env.CMS_TOKEN = '0'.repeat(64);
    const logger = await import('@/lib/logger');
    const { isAdmin } = await loadGuard();
    const result = await isAdmin(makeReq({ 'x-cms-token': 'wrong-secret' }));
    expect(result).toBeNull();
    const warnCalls = (logger.default.warn as ReturnType<typeof vi.fn>).mock.calls;
    const tagged = warnCalls.find(
      (c) => (c[0] as { event?: string })?.event === 'cms_token_invalid',
    );
    expect(tagged).toBeDefined();
  });

  it('warns once and returns null when CMS_TOKEN is plaintext in dev', async () => {
    process.env.CMS_TOKEN = 'not-a-sha256-hash';
    process.env.NODE_ENV = 'development';
    const logger = await import('@/lib/logger');
    const { isAdmin } = await loadGuard();
    const result = await isAdmin(makeReq({ 'x-cms-token': 'anything' }));
    expect(result).toBeNull();
    const warnCalls = (logger.default.warn as ReturnType<typeof vi.fn>).mock.calls;
    const tagged = warnCalls.find(
      (c) => (c[0] as { event?: string })?.event === 'cms_token_plaintext',
    );
    expect(tagged).toBeDefined();
  });

  it('throws when CMS_TOKEN is plaintext in production', async () => {
    process.env.CMS_TOKEN = 'not-a-sha256-hash';
    process.env.NODE_ENV = 'production';
    const { isAdmin } = await loadGuard();
    await expect(isAdmin(makeReq({ 'x-cms-token': 'anything' }))).rejects.toThrow(
      /64-char hex SHA-256/i,
    );
  });

  it('returns { via: "session", user } when an admin session exists', async () => {
    const authMod = await import('@/lib/auth');
    (authMod.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
    });
    const { isAdmin } = await loadGuard();
    const result = await isAdmin(makeReq());
    expect(result?.via).toBe('session');
    expect(result?.user?.email).toBe('admin@example.com');
  });

  it('returns null when session role is not admin', async () => {
    const authMod = await import('@/lib/auth');
    (authMod.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: '2', email: 'editor@example.com', role: 'editor' },
    });
    const { isAdmin } = await loadGuard();
    expect(await isAdmin(makeReq())).toBeNull();
  });
});
