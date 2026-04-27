import { NextResponse } from 'next/server';
import { prisma } from '@/lib/cms/db';

export const dynamic = 'force-dynamic';

/*
 * Health probe for load balancers / orchestrators.
 *
 * Returns 200 with a tiny JSON payload when:
 *   - The Next.js process is running.
 *   - The DB responds to a trivial query within ~500ms.
 *
 * On the vercel+vps split, the DB lives over the public internet
 * on the VPS — this endpoint is also a useful smoke test for
 * "can the Vercel function reach the VPS Postgres pooler at all?"
 *
 * Returns 503 if the DB is unreachable. Caddy / Traefik / Dokploy /
 * Vercel can all use this as a health check target.
 */
export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      uptime: Math.round(process.uptime()),
      db_ms: Date.now() - start,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: 'db_unreachable', detail: msg.slice(0, 200) },
      { status: 503 },
    );
  }
}
