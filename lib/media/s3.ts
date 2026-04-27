/**
 * S3-compatible storage adapter (MinIO / Cloudflare R2 / Backblaze
 * B2 / AWS S3 / etc).
 *
 * Engaged automatically when `S3_ENDPOINT` is set in the env.
 * Configured by:
 *
 *   S3_ENDPOINT     — full URL of the S3 API. For MinIO behind Caddy:
 *                     https://media.your-domain.com
 *   S3_ACCESS_KEY   — bucket-scoped access key.
 *   S3_SECRET_KEY   — bucket-scoped secret key.
 *   S3_BUCKET       — bucket name (e.g. teww-media).
 *   S3_PUBLIC_BASE  — public-readable URL prefix that the bucket
 *                     serves. For MinIO this is typically the same
 *                     as S3_ENDPOINT plus the bucket name; for R2
 *                     with a public-bucket route it's `https://
 *                     pub-<hash>.r2.dev`. The adapter records full
 *                     URLs in MediaAsset.url so next/image's
 *                     remotePatterns matches.
 *
 * `forcePathStyle: true` is required for MinIO. R2 / S3 work either
 * way; sticking with path-style across providers keeps URLs uniform.
 */

import { randomBytes } from 'node:crypto';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { StorageAdapter, UploadInput, UploadResult } from '@/lib/media/storage';

let cachedClient: S3Client | null = null;

function client(): S3Client {
  if (cachedClient) return cachedClient;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'S3 storage requested but S3_ENDPOINT / S3_ACCESS_KEY / S3_SECRET_KEY are not all set.',
    );
  }
  cachedClient = new S3Client({
    region: process.env.S3_REGION ?? 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  return cachedClient;
}

function safeName(filename: string): string {
  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf('.');
  const stem = dot > 0 ? lower.slice(0, dot) : lower;
  const ext = dot > 0 ? lower.slice(dot) : '';
  const safeStem = stem.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'file';
  const safeExt = ext.replace(/[^a-z0-9.]/g, '').slice(0, 16);
  return `${safeStem}${safeExt}`;
}

export const s3Adapter: StorageAdapter = {
  name: 's3',

  async upload(input: UploadInput): Promise<UploadResult> {
    const bucket = process.env.S3_BUCKET;
    const publicBase = (process.env.S3_PUBLIC_BASE ?? '').replace(/\/$/, '');
    if (!bucket) {
      throw new Error('S3 storage requested but S3_BUCKET is not set.');
    }
    if (!publicBase) {
      throw new Error('S3 storage requested but S3_PUBLIC_BASE is not set.');
    }

    const random = randomBytes(8).toString('hex');
    const key = `media/${random}-${safeName(input.filename)}`;
    const buffer = input.body instanceof Buffer ? input.body : Buffer.from(input.body);

    await client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: input.mime,
        // Adjust if your bucket isn't world-readable: switch to a
        // signed URL flow + the dashboard talks via signed URL too.
        ACL: 'public-read',
      }),
    );

    return {
      url: `${publicBase}/${bucket}/${key}`,
      bytes: buffer.byteLength,
      storageKey: key,
    };
  },

  async delete(storageKey: string): Promise<void> {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) return;
    await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: storageKey }));
  },
};
