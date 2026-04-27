/**
 * Storage-adapter factory. Pick the adapter once per process based
 * on env so the API route doesn't have to think about it.
 *
 * Order:
 *   1. S3_ENDPOINT set        → S3-compatible adapter (MinIO / R2 / S3 / B2).
 *   2. BLOB_READ_WRITE_TOKEN  → Vercel Blob.
 *   3. Otherwise              → local disk (dev default).
 *
 * S3 wins over Vercel Blob: this branch's target is Vercel app +
 * VPS-hosted MinIO, so when both env vars happen to be set during
 * a transition we want S3.
 */

import type { StorageAdapter } from '@/lib/media/storage';
import { localDiskAdapter } from '@/lib/media/local-disk';
import { s3Adapter } from '@/lib/media/s3';
import { vercelBlobAdapter } from '@/lib/media/vercel-blob';

let cached: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (cached) return cached;
  if (process.env.S3_ENDPOINT) {
    cached = s3Adapter;
  } else if (process.env.BLOB_READ_WRITE_TOKEN) {
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
