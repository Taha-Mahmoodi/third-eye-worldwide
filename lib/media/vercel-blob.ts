/**
 * Vercel Blob storage adapter (used in production deploys).
 *
 * Engaged automatically when `BLOB_READ_WRITE_TOKEN` is in the env.
 * The dependency itself is loaded lazily so dev installs that don't
 * have @vercel/blob yet don't fail at import time — the adapter
 * factory throws a clean error on first use instead.
 *
 * Vercel Blob returns absolute URLs on a `*.public.blob.vercel-
 * storage.com` host. The URL is stored verbatim in MediaAsset.url;
 * next.config.mjs `images.remotePatterns` should include the host
 * so next/image can serve them.
 */

import { randomBytes } from 'node:crypto';
import type { StorageAdapter, UploadInput, UploadResult } from '@/lib/media/storage';

function safeName(filename: string): string {
  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf('.');
  const stem = dot > 0 ? lower.slice(0, dot) : lower;
  const ext = dot > 0 ? lower.slice(dot) : '';
  const safeStem = stem.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'file';
  const safeExt = ext.replace(/[^a-z0-9.]/g, '').slice(0, 16);
  return `${safeStem}${safeExt}`;
}

interface VercelBlobModule {
  put: (
    pathname: string,
    body: Blob | Uint8Array | Buffer,
    opts: {
      access: 'public';
      contentType?: string;
      addRandomSuffix?: boolean;
      token?: string;
    },
  ) => Promise<{ url: string }>;
  del: (url: string, opts?: { token?: string }) => Promise<void>;
}

let cached: VercelBlobModule | null = null;
async function loadBlob(): Promise<VercelBlobModule> {
  if (cached) return cached;
  try {
    // Spec stored in a variable so TS doesn't try to resolve the
    // module at compile time. Vercel Blob is an opt-in install for
    // production; dev builds without it should still typecheck.
    const spec = '@vercel/blob';
    const mod = (await import(/* @vite-ignore */ spec)) as unknown as VercelBlobModule;
    cached = mod;
    return mod;
  } catch (err) {
    throw new Error(
      'Vercel Blob requested but @vercel/blob is not installed. ' +
      'Run `npm install @vercel/blob` or unset BLOB_READ_WRITE_TOKEN to fall back to the local-disk adapter.',
      { cause: err as Error },
    );
  }
}

export const vercelBlobAdapter: StorageAdapter = {
  name: 'vercel-blob',

  async upload(input: UploadInput): Promise<UploadResult> {
    const blob = await loadBlob();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const random = randomBytes(6).toString('hex');
    const pathname = `media/${random}-${safeName(input.filename)}`;
    const buffer = input.body instanceof Buffer ? input.body : Buffer.from(input.body);
    const result = await blob.put(pathname, buffer, {
      access: 'public',
      contentType: input.mime,
      addRandomSuffix: false,
      token,
    });
    return {
      url: result.url,
      bytes: buffer.byteLength,
      storageKey: result.url, // Blob deletes by absolute URL
    };
  },

  async delete(storageKey: string): Promise<void> {
    const blob = await loadBlob();
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    await blob.del(storageKey, { token });
  },
};
