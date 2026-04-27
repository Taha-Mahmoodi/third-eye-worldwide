import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/cms/db';
import { isAdmin } from '@/lib/cms/auth-guard';
import { getStorageAdapter } from '@/lib/media';
import { classifyKind, MAX_BYTES, type MediaKind } from '@/lib/media/storage';
import { logAudit } from '@/lib/audit';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';

const UNAUTH = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="CMS Admin"' } },
);

const VALID_KINDS = ['image', 'video', 'audio', 'document'] as const;

/**
 * GET /api/cms/media
 *
 * Paginated list of MediaAssets ordered newest first. Filterable by
 * `kind` and free-text `q` (matches against filename and alt). Cursor
 * pagination on createdAt — same shape as audit-log.
 */
export async function GET(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const url = new URL(req.url);
  const kind = url.searchParams.get('kind');
  const q = url.searchParams.get('q');
  const cursor = url.searchParams.get('cursor');
  const PAGE_SIZE = 60;

  const where: {
    kind?: string;
    OR?: { filename?: { contains: string }; alt?: { contains: string } }[];
    createdAt?: { lt?: Date };
  } = {};
  if (kind && (VALID_KINDS as readonly string[]).includes(kind)) {
    where.kind = kind;
  }
  if (q && q.trim()) {
    where.OR = [{ filename: { contains: q.trim() } }, { alt: { contains: q.trim() } }];
  }
  if (cursor) {
    const cursorRow = await prisma.mediaAsset.findUnique({
      where: { id: cursor },
      select: { createdAt: true },
    });
    if (cursorRow) where.createdAt = { lt: cursorRow.createdAt };
  }

  const rows = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE,
  });
  const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].id : null;

  return NextResponse.json({ rows, nextCursor });
}

/**
 * POST /api/cms/media
 *
 * Multipart upload (one file per request). Form fields:
 *   file   — required
 *   alt    — optional plain text
 *   caption — optional plain text
 *
 * The route reads the file, validates kind + size, then hands the
 * bytes to the storage adapter. The adapter returns a public URL +
 * storage key; we record both in MediaAsset (storageKey lives in
 * `urlMedium`'s slot for the local adapter — see comments below —
 * so we never need a side table).
 *
 * Image variant generation (sharp / blurhash) is intentionally
 * deferred: the schema fields stay nullable, the local-disk adapter
 * doesn't run a pipeline, and a future PR can add a sharp step
 * inside the adapter without touching this route.
 */
export async function POST(req: NextRequest) {
  const admin = await isAdmin(req);
  if (!admin) return UNAUTH;

  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      { error: 'expected multipart/form-data' },
      { status: 400 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    logger.warn({ err, event: 'media_form_parse_failed' }, 'multipart parse failed');
    return NextResponse.json({ error: 'failed to parse multipart body' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'missing file' }, { status: 400 });
  }

  const mime = file.type || 'application/octet-stream';
  const kind: MediaKind = classifyKind(mime);
  const cap = MAX_BYTES[kind];
  if (file.size > cap) {
    return NextResponse.json(
      {
        error:
          `${kind} files must be at most ${Math.round(cap / 1024 / 1024)} MB ` +
          `(received ${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const adapter = getStorageAdapter();

  let uploaded;
  try {
    uploaded = await adapter.upload({
      filename: file.name,
      mime,
      body: buffer,
    });
  } catch (err) {
    logger.error({ err, event: 'media_upload_failed', adapter: adapter.name });
    return NextResponse.json({ error: 'storage backend rejected the upload' }, { status: 500 });
  }

  const alt = form.get('alt');
  const caption = form.get('caption');
  const actor = admin.user?.email || admin.user?.name || 'token';

  try {
    const row = await prisma.mediaAsset.create({
      data: {
        kind,
        filename: file.name.slice(0, 200),
        mime,
        bytes: uploaded.bytes,
        alt: typeof alt === 'string' && alt.trim() ? alt.trim().slice(0, 500) : null,
        caption:
          typeof caption === 'string' && caption.trim() ? caption.trim().slice(0, 500) : null,
        url: uploaded.url,
        // We re-purpose urlMedium to remember the storage key for the
        // delete path. For the local-disk adapter the key IS the
        // on-disk filename (no leading "/uploads/"); for Vercel Blob
        // it's the absolute URL Blob's `del()` expects. Either way,
        // it's not a human-facing variant URL — the local adapter
        // never produces one. A future image-pipeline PR that wants
        // a real urlMedium can split storageKey into its own column.
        urlMedium: uploaded.storageKey,
        uploadedBy: actor,
      },
    });
    logger.info({
      event: 'media_uploaded',
      id: row.id,
      kind,
      bytes: uploaded.bytes,
      adapter: adapter.name,
      by: actor,
    });
    void logAudit({
      actor,
      action: 'cms.media.upload',
      target: row.id,
      diff: { kind, bytes: uploaded.bytes, filename: row.filename },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error({ err, event: 'media_db_failed', code: err.code });
    } else {
      logger.error({ err, event: 'media_db_failed' });
    }
    // Best-effort: undo the storage write so an orphan blob doesn't
    // accumulate in the bucket every time the DB hiccups.
    void adapter.delete(uploaded.storageKey).catch(() => {});
    return NextResponse.json({ error: 'failed to record upload' }, { status: 500 });
  }
}
