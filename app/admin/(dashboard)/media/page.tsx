import { prisma } from '@/lib/cms/db';
import MediaBrowser, { type MediaRow } from '@/components/admin/MediaBrowser';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 60;

export default async function MediaAdminPage() {
  const rows = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE,
  });
  const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].id : null;

  const serialized: MediaRow[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    filename: r.filename,
    mime: r.mime,
    bytes: r.bytes,
    alt: r.alt,
    caption: r.caption,
    url: r.url,
    urlThumb: r.urlThumb,
    uploadedBy: r.uploadedBy,
    createdAt: r.createdAt.toISOString(),
  }));

  return <MediaBrowser initialRows={serialized} initialNextCursor={nextCursor} />;
}
