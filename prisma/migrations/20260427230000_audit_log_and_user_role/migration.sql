-- CMS_ROADMAP PR #7 — audit log + role + lastLogin.
--
-- 1) AuditLogEntry table — append-only record of CMS writes.
-- 2) User.lastLogin column — nullable, updated on each successful login.
--
-- The `role` column already exists with default "admin"; we keep it
-- as-is on the existing row(s) and let the application enforce
-- "newly seeded users default to editor" via the schema's `@default`
-- (Prisma applies the new default at the application layer for
-- inserts; existing data stays put).

CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "diff" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuditLogEntry_createdAt_idx" ON "AuditLogEntry"("createdAt");
CREATE INDEX "AuditLogEntry_actor_idx" ON "AuditLogEntry"("actor");

-- SQLite doesn't support adding a typed nullable DATETIME via simple
-- ALTER. The portable form: ALTER TABLE ADD COLUMN. SQLite accepts
-- DATETIME (treats it as TEXT/REAL/INTEGER affinity), which Prisma
-- reads back via its serializer. Existing rows get NULL.
ALTER TABLE "User" ADD COLUMN "lastLogin" DATETIME;
