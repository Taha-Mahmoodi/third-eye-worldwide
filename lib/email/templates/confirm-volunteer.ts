/**
 * Confirmation email body for volunteer applications (MED-8).
 *
 * Returns a `{ subject, text, html }` triple consumable by sendEmail().
 * Plain text + minimal HTML — deliberately bland so spam filters don't
 * latch onto image-heavy or marketing-style content for transactional
 * mail.
 */

import { signConfirmationToken } from '@/lib/email/token';

export interface VolunteerConfirmationInput {
  id: number;
  name: string;
  createdAt: Date;
  /** Public site URL (no trailing slash). */
  siteUrl: string;
}

export function volunteerConfirmationEmail(input: VolunteerConfirmationInput) {
  const token = signConfirmationToken('volunteer', input.id, input.createdAt);
  const link = `${input.siteUrl}/api/cms/submissions/confirm?type=volunteer&id=${input.id}&token=${encodeURIComponent(token)}`;

  const subject = 'Confirm your Third Eye Worldwide volunteer application';

  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';

  const text = [
    greeting,
    '',
    'Thanks for applying to volunteer with Third Eye Worldwide. Click',
    'the link below within 24 hours to confirm your application:',
    '',
    link,
    '',
    "If you didn't fill out our volunteer form, you can ignore this",
    "email — your address won't be added to anything.",
    '',
    '— The Third Eye Worldwide team',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<body style="font-family: -apple-system, system-ui, sans-serif; color: #0d0407; line-height: 1.55; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>${escape(greeting)}</p>
  <p>Thanks for applying to volunteer with Third Eye Worldwide. Click the link below within 24 hours to confirm your application:</p>
  <p><a href="${escape(link)}" style="display:inline-block;padding:12px 22px;background:#1F61FF;color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;">Confirm my application</a></p>
  <p style="font-size: 13px; color: #4a4a6a;">Or copy this link into your browser:<br><span style="word-break:break-all;">${escape(link)}</span></p>
  <p style="font-size: 13px; color: #4a4a6a;">If you didn't fill out our volunteer form, you can ignore this email — your address won't be added to anything.</p>
  <p>— The Third Eye Worldwide team</p>
</body>
</html>`;

  return { subject, text, html };
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
