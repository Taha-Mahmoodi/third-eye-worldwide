/**
 * Storage-adapter interface for the media library (CMS_ROADMAP PR #1).
 *
 * The dashboard talks to this interface; the concrete adapter is
 * picked at runtime in `lib/media/index.ts` based on env. Today there
 * are two implementations:
 *
 *   - local-disk.ts — writes to public/uploads/ and serves via the
 *     same origin. Default in dev. Zero-config but loses files when
 *     the container's filesystem is ephemeral (Vercel, Fly).
 *
 *   - vercel-blob.ts — uploads to Vercel Blob, returns a public CDN
 *     URL. Picked when BLOB_READ_WRITE_TOKEN is present.
 *
 * Adding a new provider (Cloudflare R2, S3, Cloudinary…) means
 * implementing this interface and wiring it into index.ts.
 */

export type MediaKind = 'image' | 'video' | 'audio' | 'document';

export interface UploadInput {
  /** Original filename. The adapter is free to rename / sanitise. */
  filename: string;
  mime: string;
  body: Uint8Array | Buffer;
}

export interface UploadResult {
  /** Canonical full-size URL — relative for same-origin, absolute otherwise. */
  url: string;
  /** Bytes actually written. May differ from body.length if the adapter compressed. */
  bytes: number;
  /** Storage-key the adapter uses to delete later. Stored in MediaAsset.id-adjacent state. */
  storageKey: string;
}

export interface StorageAdapter {
  /** Provider name, used in logs. */
  readonly name: string;
  upload(input: UploadInput): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
}

/**
 * MIME → kind classification. Anything that doesn't match an
 * image/video/audio prefix lands in `document` so PDFs and rare
 * formats still flow through.
 */
export function classifyKind(mime: string): MediaKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Per-kind size caps in bytes. Doc says 10 MB images, 100 MB video,
 * 25 MB audio, 25 MB PDF. Enforced by the upload route — the adapter
 * trusts the caller has already sized the body.
 */
export const MAX_BYTES: Record<MediaKind, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  document: 25 * 1024 * 1024,
};
