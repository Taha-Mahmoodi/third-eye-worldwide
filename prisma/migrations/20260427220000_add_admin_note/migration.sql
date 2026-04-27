-- CMS_ROADMAP PR #4 — admin notes on submission rows.
-- Both columns are NULLABLE so the migration is non-breaking on existing rows.

ALTER TABLE "VolunteerSubmission" ADD COLUMN "adminNote" TEXT;
ALTER TABLE "DonationSubmission" ADD COLUMN "adminNote" TEXT;
