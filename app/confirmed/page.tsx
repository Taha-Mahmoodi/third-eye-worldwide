import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Confirmed — Third Eye Worldwide',
  description: 'Thanks — your form submission is confirmed.',
  path: '/confirmed',
  noindex: true,
});

interface PageProps {
  searchParams: Promise<{ error?: string; already?: string }>;
}

const ERROR_COPY: Record<string, { title: string; body: string }> = {
  malformed: {
    title: 'That link looks incomplete',
    body: 'We could not read the confirmation link. If you copied it from an email, make sure you copied the whole URL — try clicking the link directly from your email instead.',
  },
  unknown: {
    title: "We couldn't find that submission",
    body: 'No matching submission exists, or it was already deleted. If this seems wrong, get in touch and we will sort it out.',
  },
  expired: {
    title: 'That confirmation link has expired',
    body: 'Confirmation links are good for 2 hours. Submit the form again to get a fresh one.',
  },
  mismatch: {
    title: 'That link is not valid for this submission',
    body: 'The confirmation link did not match what we have on file. This usually means the submission was deleted or the link was tampered with. Submit the form again to get a fresh one.',
  },
  tampered: {
    title: 'That link did not pass verification',
    body: 'The confirmation link signature did not match. If you got this from us, try clicking the link in the original email rather than copy-pasting.',
  },
};

export default async function ConfirmedPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorState = params.error ? ERROR_COPY[params.error] : null;
  const alreadyConfirmed = params.already === '1';

  return (
    <section className="section">
      <div className="section-inner" style={{ maxWidth: 640 }}>
        <header
          className="section-heading"
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          {errorState ? (
            <>
              <div className="section-eyebrow" style={{ color: 'var(--accent)' }}>
                Hmm
              </div>
              <h1 className="section-title">{errorState.title}</h1>
              <p className="section-subtitle">{errorState.body}</p>
            </>
          ) : alreadyConfirmed ? (
            <>
              <div className="section-eyebrow">All set</div>
              <h1 className="section-title">Already confirmed</h1>
              <p className="section-subtitle">
                Thanks — this submission is already confirmed. There&rsquo;s nothing else
                you need to do.
              </p>
            </>
          ) : (
            <>
              <div className="section-eyebrow">Thank you</div>
              <h1 className="section-title">You&rsquo;re confirmed</h1>
              <p className="section-subtitle">
                A member of our team will be in touch shortly. Welcome to the work.
              </p>
            </>
          )}
        </header>

        <div style={{ textAlign: 'center', display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
          <Link href="/about" className="btn-secondary">
            About our work
          </Link>
        </div>
      </div>
    </section>
  );
}
