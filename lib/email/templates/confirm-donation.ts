/**
 * Confirmation email for donation-intent submissions (MED-8).
 *
 * Same shape as volunteer; copy clarifies that the donation is an
 * intent registration and the team will follow up to actually collect
 * payment (matches the on-page Option B copy).
 */

import { signConfirmationToken } from '@/lib/email/token';

export interface DonationConfirmationInput {
  id: number;
  name: string;
  amount: number;
  mode: 'monthly' | 'once' | string;
  currency: string;
  createdAt: Date;
  siteUrl: string;
}

export function donationConfirmationEmail(input: DonationConfirmationInput) {
  const token = signConfirmationToken('donation', input.id, input.createdAt);
  const link = `${input.siteUrl}/api/cms/submissions/confirm?type=donation&id=${input.id}&token=${encodeURIComponent(token)}`;

  const subject = 'Confirm your Third Eye Worldwide donation';

  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  const cadence = input.mode === 'monthly' ? 'monthly' : 'one-time';
  const formattedAmount = formatAmount(input.amount, input.currency);

  const text = [
    greeting,
    '',
    `Thanks for choosing to support Third Eye Worldwide with a ${cadence}`,
    `${formattedAmount} gift. Click the link below within 2 hours to`,
    'confirm your interest — once confirmed, a team member will be in',
    'touch shortly to complete your gift through a secure checkout.',
    '',
    link,
    '',
    "If you didn't fill out our donation form, you can ignore this email",
    "— no payment has been or will be taken.",
    '',
    '— The Third Eye Worldwide team',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<body style="font-family: -apple-system, system-ui, sans-serif; color: #0d0407; line-height: 1.55; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>${escape(greeting)}</p>
  <p>Thanks for choosing to support Third Eye Worldwide with a <strong>${escape(cadence)}</strong> <strong>${escape(formattedAmount)}</strong> gift. Click the link below within 2 hours to confirm your interest — once confirmed, a team member will be in touch shortly to complete your gift through a secure checkout.</p>
  <p><a href="${escape(link)}" style="display:inline-block;padding:12px 22px;background:#E76021;color:#fff;text-decoration:none;border-radius:9999px;font-weight:600;">Confirm my donation</a></p>
  <p style="font-size: 13px; color: #4a4a6a;">Or copy this link into your browser:<br><span style="word-break:break-all;">${escape(link)}</span></p>
  <p style="font-size: 13px; color: #4a4a6a;">If you didn't fill out our donation form, you can ignore this email — no payment has been or will be taken.</p>
  <p>— The Third Eye Worldwide team</p>
</body>
</html>`;

  return { subject, text, html };
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
