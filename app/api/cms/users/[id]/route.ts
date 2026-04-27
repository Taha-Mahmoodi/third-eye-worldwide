import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { logAudit } from '@/lib/audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const VALID_ROLES = ['admin', 'editor'] as const;

const UNAUTH = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
);

/**
 * Resolve the signed-in admin's id (numeric) so the routes below can
 * refuse self-demotion / self-deletion. Token auth has no associated
 * user record so it's allowed to do anything (it's an out-of-band
 * deploy secret, not a person).
 */
function callerUserId(admin: { user?: { id?: string } } | null): number | null {
  const raw = admin?.user?.id;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : null;
}

async function adminCount(): Promise<number> {
  return prisma.user.count({ where: { role: 'admin' } });
}

/**
 * PATCH /api/cms/users/:id
 *
 * Update name and/or role. Admin-only. Self-demotion is blocked
 * when the caller is the only admin so the dashboard can't lock
 * itself out of admin access.
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const id = Number.parseInt(params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  let body: { name?: unknown; role?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data: { name?: string | null; role?: string } = {};
  if (body.name !== undefined) {
    if (body.name === null || body.name === '') {
      data.name = null;
    } else if (typeof body.name === 'string') {
      data.name = body.name.trim().slice(0, 200);
    } else {
      return NextResponse.json({ error: 'name must be a string or null' }, { status: 400 });
    }
  }
  if (body.role !== undefined) {
    if (typeof body.role !== 'string' || !(VALID_ROLES as readonly string[]).includes(body.role)) {
      return NextResponse.json(
        { error: `role must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 },
      );
    }
    data.role = body.role;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'patch must include at least one of: name, role' },
      { status: 400 },
    );
  }

  // Self-demotion guard: refuse when caller is demoting themselves
  // and they're currently the only admin.
  const me = callerUserId(admin);
  if (data.role && data.role !== 'admin' && me === id) {
    if ((await adminCount()) <= 1) {
      return NextResponse.json(
        { error: 'Refusing to demote the last remaining admin.' },
        { status: 409 },
      );
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, lastLogin: true, createdAt: true },
    });
    const actor = admin.user?.email || admin.user?.name || 'token';
    logger.info({ event: 'cms_user_patched', id, keys: Object.keys(data), by: actor });
    void logAudit({
      actor,
      action: data.role ? 'cms.user.role_change' : 'cms.user.patch',
      target: String(id),
      diff: data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'cms_user_patch_failed', id }, 'user patch failed');
    throw e;
  }
}

/**
 * DELETE /api/cms/users/:id
 *
 * Removes a dashboard user. Admin-only. Self-deletion is always
 * blocked — even if there's another admin, deleting yourself in
 * mid-session is messy state for next-auth.
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const id = Number.parseInt(params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const me = callerUserId(admin);
  if (me === id) {
    return NextResponse.json(
      { error: 'Refusing to delete your own account.' },
      { status: 409 },
    );
  }

  // Don't let the dashboard wipe its last admin via PATCH-then-DELETE.
  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true, email: true },
  });
  if (target?.role === 'admin' && (await adminCount()) <= 1) {
    return NextResponse.json(
      { error: 'Refusing to delete the last remaining admin.' },
      { status: 409 },
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    const actor = admin.user?.email || admin.user?.name || 'token';
    logger.info({ event: 'cms_user_deleted', id, by: actor });
    void logAudit({
      actor,
      action: 'cms.user.delete',
      target: String(id),
      diff: { email: target?.email },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'cms_user_delete_failed', id }, 'user delete failed');
    throw e;
  }
}
