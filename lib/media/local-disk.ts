/**
 * Local-disk storage adapter (default, dev-friendly).
 *
 * Writes uploads to `public/uploads/<random>-<safe-filename>` and
 * serves them through Next.js's static-asset pipeline at
 * `/uploads/...`. The directory is gitignored so dev uploads never
 * land in version control.
 *
 * Trade-offs:
 *   - Pros: zero env config, works in `npm run dev` and a long-
 *     running Node process. Files survive restarts.
 *   - Cons: Vercel's serverless filesystem is ephemeral — uploads
 *     made by one invocation aren't visible to the next. For a real
 *     production deploy switch to lib/media/vercel-blob.ts (auto-
 *     selected when BLOB_READ_WRITE_TOKEN is set).
 *
 * The disk path follows the storage-key convention so `delete()` can
 * undo what `upload()` wrote without parsing the URL.
 */

import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import type { StorageAdapter, UploadInput, UploadResult } from '@/lib/media/storage';

const UPLOAD_DIR_FS = path.join(process.cwd(), 'public', 'uploads');

/** Strip everything that isn't a-z0-9._- and squash repeats. Names
 *  with spaces, parens, accented chars, etc all get sanitised here. */
function safeName(filename: string): string {
  const lower = filename.toLowerCase();
  // Keep extension, sanitise the stem.
  const dot = lower.lastIndexOf('.');
  const stem = dot > 0 ? lower.slice(0, dot) : lower;
  const ext = dot > 0 ? lower.slice(dot) : '';
  const safeStem = stem.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').slice(0, 80) || 'file';
  const safeExt = ext.replace(/[^a-z0-9.]/g, '').slice(0, 16);
  return `${safeStem}${safeExt}`;
}

export const localDiskAdapter: StorageAdapter = {
  name: 'local-disk',

  async upload(input: UploadInput): Promise<UploadResult> {
    await mkdir(UPLOAD_DIR_FS, { recursive: true });
    const random = randomBytes(8).toString('hex');
    const sanitized = safeName(input.filename);
    const onDisk = `${random}-${sanitized}`;
    const filepath = path.join(UPLOAD_DIR_FS, onDisk);
    const buffer = input.body instanceof Buffer ? input.body : Buffer.from(input.body);
    await writeFile(filepath, buffer);
    return {
      url: `/uploads/${onDisk}`,
      bytes: buffer.byteLength,
      storageKey: onDisk,
    };
  },

  async delete(storageKey: string): Promise<void> {
    // Defence in depth: never let a storage-key escape the upload dir.
    const safe = path.basename(storageKey);
    if (safe !== storageKey) return;
    const filepath = path.join(UPLOAD_DIR_FS, safe);
    try {
      await unlink(filepath);
    } catch (err) {
      // ENOENT is fine — file already gone is an idempotent delete.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  },
};
