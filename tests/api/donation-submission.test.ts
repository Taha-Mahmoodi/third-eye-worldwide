import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * End-to-end test of POST /api/cms/submissions/donation. Mocks Prisma
 * + the email send so the test doesn't need a database or Resend, but
 * exercises the real validation, CSRF, honeypot, currency allow-list,
 * and the cents-conversion path.
 */

const createMock = vi.fn();

vi.mock('@/lib/cms/db', () => ({
  prisma: {
    donationSubmission: { create: createMock },
  },
}));

vi.mock('@/lib/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Cut the import chain that would otherwise pull lib/auth.ts.
vi.mock('@/lib/cms/auth-guard', () => ({
  isAdmin: vi.fn(async () => null),
}));

const sendEmailMock = vi.fn(async () => ({ ok: true, id: 'mock-id' }));
vi.mock('@/lib/email/send', () => ({
  sendEmail: sendEmailMock,
}));

async function loadRoute() {
  return import('@/app/api/cms/submissions/donation/route');
}

function makeReq(body: unknown, headers: Record<string, string> = {}): NextRequest {
  const merged = {
    'content-type': 'application/json',
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    ...headers,
  };
  return new NextRequest('http://localhost:3000/api/cms/submissions/donation', {
    method: 'POST',
    headers: merged,
    body: JSON.stringify(body),
  });
}

const validPayload = {
  name: 'Jane Donor',
  email: 'jane@example.com',
  amount: 25,
  mode: 'once',
};

beforeEach(() => {
  createMock.mockReset();
  // The route reads id, email, name, amount, mode, currency, createdAt
  // off the returned row when building the confirmation email.
  createMock.mockResolvedValue({
    id: 7,
    email: 'jane@example.com',
    name: 'Jane Donor',
    amount: 2500,
    mode: 'once',
    currency: 'USD',
    createdAt: new Date('2026-04-27T00:00:00Z'),
  });
  sendEmailMock.mockReset();
  sendEmailMock.mockResolvedValue({ ok: true, id: 'mock-id' });
});

describe('POST /api/cms/submissions/donation', () => {
  it('creates a row on a clean valid payload', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq(validPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 7 });
    expect(createMock).toHaveBeenCalledOnce();
  });

  it('stores amount as integer cents (49.99 → 4999)', async () => {
    const { POST } = await loadRoute();
    await POST(makeReq({ ...validPayload, amount: 49.99 }));
    const arg = createMock.mock.calls[0][0];
    expect(arg.data.amount).toBe(4999);
  });

  it('rejects amount below MIN_DONATION_AMOUNT', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ ...validPayload, amount: 0 }));
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects amount above MAX_DONATION_AMOUNT', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ ...validPayload, amount: 999_999 }));
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects invalid mode (e.g. "weekly")', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ ...validPayload, mode: 'weekly' }));
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects malformed email', async () => {
    const { POST } = await loadRoute();
    const res = await POST(makeReq({ ...validPayload, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('coerces an off-list currency to USD', async () => {
    const { POST } = await loadRoute();
    await POST(makeReq({ ...validPayload, currency: 'MONOPOLY' }));
    const arg = createMock.mock.calls[0][0];
    expect(arg.data.currency).toBe('USD');
  });

  it('keeps an allow-listed currency (uppercased)', async () => {
    const { POST } = await loadRoute();
    await POST(makeReq({ ...validPayload, currency: 'eur' }));
    const arg = createMock.mock.calls[0][0];
    expect(arg.data.currency).toBe('EUR');
  });

  it('drops cross-origin POST with 403', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeReq(validPayload, { origin: 'https://evil.example' }),
    );
    expect(res.status).toBe(403);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('honeypot trip returns 200 id:0 with no DB write', async () => {
    const { POST } = await loadRoute();
    const res = await POST(
      makeReq({ ...validPayload, website: 'http://spam.example' }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 0 });
    expect(createMock).not.toHaveBeenCalled();
  });

  it('fires the confirmation email on success', async () => {
    const { POST } = await loadRoute();
    await POST(makeReq(validPayload));
    // sendEmail is fire-and-forget — give it a microtask tick.
    await new Promise((r) => setTimeout(r, 0));
    expect(sendEmailMock).toHaveBeenCalledOnce();
    const arg = sendEmailMock.mock.calls[0][0] as { to: string; subject: string };
    expect(arg.to).toBe('jane@example.com');
    expect(arg.subject).toMatch(/confirm/i);
  });

  it('rejects malformed JSON with 400', async () => {
    const { POST } = await loadRoute();
    const req = new NextRequest(
      'http://localhost:3000/api/cms/submissions/donation',
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
