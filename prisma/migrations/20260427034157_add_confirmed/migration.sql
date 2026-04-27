-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DonationSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "mode" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DonationSubmission" ("amount", "createdAt", "currency", "email", "id", "mode", "name", "note", "status") SELECT "amount", "createdAt", "currency", "email", "id", "mode", "name", "note", "status" FROM "DonationSubmission";
DROP TABLE "DonationSubmission";
ALTER TABLE "new_DonationSubmission" RENAME TO "DonationSubmission";
CREATE TABLE "new_VolunteerSubmission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "skills" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_VolunteerSubmission" ("createdAt", "email", "id", "message", "name", "role", "skills", "status") SELECT "createdAt", "email", "id", "message", "name", "role", "skills", "status" FROM "VolunteerSubmission";
DROP TABLE "VolunteerSubmission";
ALTER TABLE "new_VolunteerSubmission" RENAME TO "VolunteerSubmission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
