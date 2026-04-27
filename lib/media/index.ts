/**
 * Storage-adapter factory. Pick the adapter once per process based
 * on env so the API route doesn't have to think about it.
 *
 * Order:
 *   1. BLOB_READ_WRITE_TOKEN set → Vercel Blob.
 *   2. Otherwise → local disk.
 *
 * If we add more providers (R2, S3, Cloudinary), insert their guards
 * here in priority order. The shape of `getStorageAdapter()` stays
 * the same.
 */

import type { StorageAdapter } from '@/lib/media/storage';
import { localDiskAdapter } from '@/lib/media/local-disk';
import { vercelBlobAdapter } from '@/lib/media/vercel-blob';

let cached: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (cached) return cached;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    cached = vercelBlobAdapter;
  } else {
    cached = localDiskAdapter;
  }
  return cached;
}

/** Test-only: reset the cached adapter so each test picks fresh env. */
export function __resetStorageAdapter(): void {
  cached = null;
}
