import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { getStorageAdapter } from '@/lib/media';
import { logAudit } from '@/lib/audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const UNAUTH = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
);

/**
 * PATCH /api/cms/media/:id
 *
 * Updates `alt` and/or `caption`. Both nullable in the DB so passing
 * null or empty string clears them.
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  let body: { alt?: unknown; caption?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const data: { alt?: string | null; caption?: string | null } = {};
  for (const key of ['alt', 'caption'] as const) {
    const v = body[key];
    if (v === undefined) continue;
    if (v === null || v === '') data[key] = null;
    else if (typeof v === 'string') data[key] = v.trim().slice(0, 500);
    else return NextResponse.json({ error: `${key} must be string or null` }, { status: 400 });
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'patch must include at least one of: alt, caption' },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.mediaAsset.update({ where: { id: params.id }, data });
    const actor = admin.user?.email || admin.user?.name || 'token';
    void logAudit({
      actor,
      action: 'cms.media.patch',
      target: params.id,
      diff: data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    logger.error({ err: e, event: 'media_patch_failed', id: params.id });
    throw e;
  }
}

/**
 * DELETE /api/cms/media/:id
 *
 * Removes the row AND the underlying storage object. If the storage
 * delete fails the DB row is preserved — better an orphan in the
 * dashboard than a confused state where the image still serves but
 * the metadata is gone.
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const row = await prisma.mediaAsset.findUnique({ where: { id: params.id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const adapter = getStorageAdapter();
  try {
    if (row.urlMedium) await adapter.delete(row.urlMedium);
  } catch (err) {
    logger.error({ err, event: 'media_blob_delete_failed', id: params.id });
    return NextResponse.json(
      { error: 'failed to remove blob — DB row preserved, retry shortly' },
      { status: 502 },
    );
  }

  try {
    await prisma.mediaAsset.delete({ where: { id: params.id } });
    const actor = admin.user?.email || admin.user?.name || 'token';
    void logAudit({
      actor,
      action: 'cms.media.delete',
      target: params.id,
      diff: { kind: row.kind, filename: row.filename, bytes: row.bytes },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error({ err, event: 'media_db_delete_failed', id: params.id });
    throw err;
  }
}
