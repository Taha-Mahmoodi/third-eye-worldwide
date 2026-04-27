import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * End-to-end tests of the volunteer submission route handler. Mocks
 * the Prisma client so the test doesn't require a database, but
 * exercises the real validation, rate-limit, CSRF and honeypot paths.
 */

const createMock = vi.fn();

vi.mock('@/lib/cms/db', () => ({
  prisma: {
    volunteerSubmission: { create: createMock },
  },
}));

// The logger writes to stderr; silence it during tests.
vi.mock('@/lib/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Cut the import chain that would otherwise pull lib/auth.ts → next-auth
// (next-auth's ESM tries to resolve next/server which vitest's jsdom
// loader can't). The POST handler under test never calls isAdmin —
// only the GET path does — so the mock has no behavioral effect.
vi.mock('@/lib/cms/auth-guard', () => ({
  isAdmin: vi.fn(async () => null),
}));

// Re-import after the mocks are set up. The route module reads its
// dependencies at the top level, so the order matters.
async function loadRoute() {
  const mod = await import('@/app/api/cms/submissions/volunteer/route');
  return mod;
}

function makeReq(body: unknown, headers: Record<string, string> = {}): NextRequest {
  // Same-origin fetch by default — set Origin to a value that matches
  // what isAllowedOrigin computes from Host (which we also set).
  const merged = {
    'content-type': 'application/json',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    ...headers,
  };
  return new NextRequest('http://localhost:3000/api/cms/submissions/volunteer', {
    method: 'POST',
    headers: merged,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  createMock.mockReset();
  createMock.mockResolvedValue({ id: 42 });
});

describe('POST /api/cms/submissions/volunteer', () => {
  it('creates a row on a clean valid payload', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeReq({ name: 'Jane Smith', email: 'jane@example.com' }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, id: 42 });
    expect(createMock).toHaveBeenCalledOnce();
  });

  it('rejects missing email with 400', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ name: 'Jane' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: expect.stringMatching(/required/i) });
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects missing name with 400', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ email: 'jane@example.com' }));
    expect(res.status).toBe(400);
  });

  it('rejects malformed email with 400', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ name: 'Jane', email: 'not-an-email' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: expect.stringMatching(/email/i) });
  });

  it('rejects single-letter TLD email (a@b.c)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ name: 'Jane', email: 'a@b.c' }));
    expect(res.status).toBe(400);
  });

  it('truncates oversize fields to schema bounds', async () => {
    const { POST } = await loadRoute();
    const longName = 'x'.repeat(500);
    const longSkills = 'y'.repeat(1000);
    await POST(
      makeReq({
        name: longName,
        email: 'jane@example.com',
        skills: longSkills,
      }),
    );
    expect(createMock).toHaveBeenCalledOnce();
    const arg = createMock.mock.calls[0][0];
    expect(arg.data.name.length).toBe(200);
    expect(arg.data.skills.length).toBe(500);
  });

  it('drops cross-origin POST with 403', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeReq(
        { name: 'Jane', email: 'jane@example.com' },
        { origin: 'https://evil.example' },
      ),
    );
    expect(res.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('honeypot trip returns 200 with id 0 (no DB write)', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeReq({
        name: 'Bot',
        email: 'bot@example.com',
        website: 'http://spam.example',
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 0 });
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON with 400', async () => {
    const { POST } = await loadRoute();
    const req = new NextRequest(
      'http://localhost:3000/api/cms/submissions/volunteer',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          host: 'localhost:3000',
          origin: 'http://localhost:3000',
        },
        body: 'not-json{',
      },
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
