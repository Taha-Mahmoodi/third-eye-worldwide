import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { hashPassword } from '@/lib/auth/hash-password';
import { isValidEmail } from '@/lib/validators';
import { logAudit } from '@/lib/audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['admin', 'editor'] as const;
type UserRole = (typeof VALID_ROLES)[number];

const UNAUTH = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
);

/**
 * GET /api/cms/users
 *
 * List dashboard users. Admin-only. Excludes the password hash.
 */
export async function GET(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      lastLogin: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

/**
 * POST /api/cms/users
 *
 * Create a new dashboard user with an initial password the admin
 * shares out-of-band. The doc's full "invite + set-password email"
 * flow is deferred — sending an email requires a new template, a
 * signed token, and a /set-password page. Direct creation here is a
 * realistic v0 that doesn't depend on any of that infrastructure.
 *
 * Body: { email, password, name?, role: 'admin' | 'editor' }
 */
export async function POST(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  let body: { email?: unknown; password?: unknown; name?: unknown; role?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : null;
  const role = typeof body.role === 'string' ? body.role : 'editor';

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'email format is invalid' }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json(
      { error: 'password must be at least 12 characters' },
      { status: 400 },
    );
  }
  if (!(VALID_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json(
      { error: `role must be one of: ${VALID_ROLES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.user.create({
      data: {
        email: email.slice(0, 200),
        passwordHash: hashPassword(password),
        name: name ? name.slice(0, 200) : null,
        role: role as UserRole,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    const actor = admin.user?.email || admin.user?.name || 'token';
    logger.info({ event: 'cms_user_created', id: created.id, email: created.email, by: actor });
    void logAudit({
      actor,
      action: 'cms.user.create',
      target: String(created.id),
      diff: { email: created.email, role: created.role },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with that email already exists' },
        { status: 409 },
      );
    }
    logger.error({ err: e, event: 'cms_user_create_failed' }, 'user create failed');
    throw e;
  }
}
