-- CMS_ROADMAP PR #1 — media library.

CREATE TABLE "MediaAsset" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "kind"       TEXT NOT NULL,
    "filename"   TEXT NOT NULL,
    "mime"       TEXT NOT NULL,
    "bytes"      INTEGER NOT NULL,
    "width"      INTEGER,
    "height"     INTEGER,
    "duration"   REAL,
    "alt"        TEXT,
    "caption"    TEXT,
    "url"        TEXT NOT NULL,
    "urlThumb"   TEXT,
    "urlMedium"  TEXT,
    "blurhash"   TEXT,
    "uploadedBy" TEXT,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MediaAsset_kind_createdAt_idx" ON "MediaAsset"("kind", "createdAt");
