-- DonationSubmission: amount Float -> Int (cents) + updatedAt + indexes.
-- VolunteerSubmission: updatedAt + indexes.
-- ContentRevision: createdAt index.

-- RedefineTables (DonationSubmission)
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DonationSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- Convert pre-existing dollar floats to integer cents and seed updatedAt
-- with createdAt so the column is non-null without losing the audit trail.
INSERT INTO "new_DonationSubmission" ("id", "name", "email", "amount", "mode", "currency", "status", "note", "confirmed", "createdAt", "updatedAt")
SELECT "id", "name", "email", CAST(ROUND("amount" * 100) AS INTEGER), "mode", "currency", "status", "note", "confirmed", "createdAt", "createdAt"
FROM "DonationSubmission";
DROP TABLE "DonationSubmission";
ALTER TABLE "new_DonationSubmission" RENAME TO "DonationSubmission";
CREATE INDEX "DonationSubmission_confirmed_createdAt_idx" ON "DonationSubmission"("confirmed", "createdAt");
CREATE INDEX "DonationSubmission_status_idx" ON "DonationSubmission"("status");
CREATE INDEX "DonationSubmission_email_idx" ON "DonationSubmission"("email");

-- RedefineTables (VolunteerSubmission)
CREATE TABLE "new_VolunteerSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "skills" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_VolunteerSubmission" ("id", "name", "email", "role", "skills", "message", "status", "confirmed", "createdAt", "updatedAt")
SELECT "id", "name", "email", "role", "skills", "message", "status", "confirmed", "createdAt", "createdAt"
FROM "VolunteerSubmission";
DROP TABLE "VolunteerSubmission";
ALTER TABLE "new_VolunteerSubmission" RENAME TO "VolunteerSubmission";
CREATE INDEX "VolunteerSubmission_confirmed_createdAt_idx" ON "VolunteerSubmission"("confirmed", "createdAt");
CREATE INDEX "VolunteerSubmission_status_idx" ON "VolunteerSubmission"("status");
CREATE INDEX "VolunteerSubmission_email_idx" ON "VolunteerSubmission"("email");

-- ContentRevision createdAt index — pruneRevisions() orders by createdAt.
CREATE INDEX "ContentRevision_createdAt_idx" ON "ContentRevision"("createdAt");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
