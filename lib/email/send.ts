/**
 * Provider-agnostic email send wrapper (MED-8).
 *
 * Reads provider creds from env. Today: Resend. To swap providers,
 * replace the `sendViaResend` body — the public `sendEmail` signature
 * stays the same.
 *
 * Fail-open: if creds are missing or the provider returns an error,
 * we log the failure and return `{ ok: false }` rather than throwing.
 * Submission routes use this to decide whether to flag the row as
 * "unconfirmed but submitted anyway" rather than rejecting the user.
 *
 * Expected env:
 *   RESEND_API_KEY       — provisioned at https://resend.com
 *   EMAIL_FROM_ADDRESS   — must be on a domain you've verified at the
 *                          provider with SPF/DKIM/DMARC set up
 */

import logger from '@/lib/logger';

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SendEmailResult {
  ok: boolean;
  /** Provider-specific id when ok, otherwise undefined. */
  id?: string;
  /** Error class for log filtering when not ok. */
  reason?: 'no-creds' | 'provider-error' | 'invalid-input';
}

interface ResendSuccess { id: string }
interface ResendError { name?: string; message?: string; statusCode?: number }
interface ResendResponse { data?: ResendSuccess | null; error?: ResendError | null }

async function sendViaResend({ to, subject, text, html }: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS;
  if (!apiKey || !from) {
    logger.warn(
      { event: 'email_no_creds' },
      'RESEND_API_KEY or EMAIL_FROM_ADDRESS unset; skipping send',
    );
    return { ok: false, reason: 'no-creds' };
  }

  // Lazy import so deploys without Resend don't ship the client.
  const { Resend } = await import('resend');
  const client = new Resend(apiKey);

  try {
    const result = (await client.emails.send({
      from,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    })) as ResendResponse;

    if (result.error) {
      logger.error(
        { event: 'email_send_failed', err: result.error, to: redactEmail(to) },
        'Resend send returned an error',
      );
      return { ok: false, reason: 'provider-error' };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    logger.error(
      { event: 'email_send_threw', err, to: redactEmail(to) },
      'Resend send threw',
    );
    return { ok: false, reason: 'provider-error' };
  }
}

/** Replace local-part with `***` for log safety; keep domain for triage. */
function redactEmail(addr: string): string {
  const at = addr.indexOf('@');
  return at <= 0 ? '***' : `***@${addr.slice(at + 1)}`;
}

/** Public entry point. Logs an `email_sent` event on success. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!input.to || !input.subject || !input.text) {
    return { ok: false, reason: 'invalid-input' };
  }
  const r = await sendViaResend(input);
  if (r.ok) {
    logger.info(
      { event: 'email_sent', id: r.id, to: redactEmail(input.to), subject: input.subject },
    );
  }
  return r;
}
