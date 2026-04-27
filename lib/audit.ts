/**
 * Audit log helpers (CMS_ROADMAP PR #7).
 *
 * Every CMS write should call `logAudit()` so the dashboard's
 * `/admin/audit-log` view can answer "who changed this?". Failures to
 * write the audit row are swallowed so a hot path (publish, status
 * update) never aborts because the audit table is briefly down — the
 * primary action's success is what the user cares about.
 *
 * The action namespace is open-ended; the convention is `domain.verb`:
 *   cms.publish                 — content document PUT
 *   cms.user.create             — admin invited a new user
 *   cms.user.delete             — admin removed a user
 *   cms.user.role_change        — role flipped between admin/editor
 *   submission.volunteer.patch  — status / adminNote updated
 *   submission.volunteer.delete — row removed (GDPR erasure)
 *   submission.donation.patch   — same shape for donations
 *   submission.donation.delete  — same
 */

import { prisma } from '@/lib/cms/db';
import logger from '@/lib/logger';

export interface LogAuditInput {
  /** User email or `'system'` for cron / migration / startup writes. */
  actor: string;
  /** `domain.verb` slug. See module comment for known values. */
  action: string;
  /** Optional pointer at the affected record (path, slug, id). */
  target?: string | null;
  /** Optional structured diff. JSON-serialized before insert. */
  diff?: unknown;
}

/**
 * Append a single row to AuditLogEntry. Best-effort: errors get
 * logged but never thrown. Callers shouldn't await this in latency-
 * sensitive paths — fire-and-forget is fine.
 */
export async function logAudit({
  actor,
  action,
  target,
  diff,
}: LogAuditInput): Promise<void> {
  try {
    await prisma.auditLogEntry.create({
      data: {
        actor: actor.slice(0, 200),
        action: action.slice(0, 100),
        target: target ? String(target).slice(0, 500) : null,
        diff: diff !== undefined ? JSON.stringify(diff).slice(0, 50_000) : null,
      },
    });
  } catch (err) {
    logger.error(
      { err, event: 'audit_log_failed', actor, action, target },
      'audit_log insert failed',
    );
  }
}
