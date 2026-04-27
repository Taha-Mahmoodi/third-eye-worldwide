import { Suspense } from 'react';
import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import { SkeletonHero } from '@/components/Skeleton';
import DonateWidget from '@/components/donate/DonateWidget';
import ImpactRow from '@/components/donate/ImpactRow';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';
import {
  ArrowRight,
  Bank,
  Briefcase,
  ChartLineUp,
  CheckCircle,
  FileText,
  ShieldCheck,
} from '@/components/icons';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/donate');
  const d = content?.donate || {};
  return pageMetadata({
    title: o.title || 'Donate — Third Eye Worldwide',
    description: o.description || d.heroSub || 'Every dollar funds free assistive technology for visually impaired people worldwide.',
    path: '/donate',
    image: o.image,
    noindex: o.noindex,
  });
}

export default function DonatePage() {
  return (
    <Suspense fallback={<SkeletonHero />}>
      <DonatePageContent />
    </Suspense>
  );
}

async function DonatePageContent() {
  // DB hiccup → empty sections, not a 500. See app/page.tsx.
  let content = null;
  try {
    content = await getContent();
  } catch {
    // fall through to empty-content render
  }
  const d = content?.donate || {};
  const impact = visibleSorted(d.impactBreakdown || []);

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-eyebrow">{d.heroEyebrow || 'Give'}</div>
          <RichText as="h1" html={d.heroTitle || 'Your gift opens worlds.'} />
          {d.heroSub ? <p>{d.heroSub}</p> : null}
        </div>
      </div>

      <section className="section">
        <div className="section-inner">
          <div className="donate-grid">
            <DonateWidget />

            <div className="donate-sidebar">
              <div className="donate-impact">
                <div className="donate-impact-eyebrow">Your Impact</div>
                <h3>Where your gift goes</h3>
                <p className="lead">
                  Every donation is tracked to a specific program. We publish an annual
                  transparency report showing exactly how funds are deployed, and we&apos;ll
                  publish quarterly reports starting in our second year. Mistakes will be
                  published alongside the wins.
                </p>
                <p className="lead">
                  Right now, your gift funds four things, in roughly this order of need:
                </p>
                {impact.map((it) => <ImpactRow key={it.id || it.title} item={it} />)}
                <p className="donate-impact-foot">
                  We&apos;ll publish the actual ratio in our first annual report and update
                  it every year after that.
                </p>
              </div>

              <div className="donate-other">
                <div className="donate-other-eyebrow">Other Ways to Give</div>
                <div className="donate-other-links">
                  <a href="mailto:hello@thirdeyeworldwide.org?subject=Bank%20transfer">
                    <Bank size="1em" aria-hidden="true" /> Bank transfer / wire
                  </a>
                  <a href="mailto:hello@thirdeyeworldwide.org?subject=Stock%20or%20crypto%20donation">
                    <ChartLineUp size="1em" aria-hidden="true" /> Donate stock or crypto
                  </a>
                  <a href="mailto:hello@thirdeyeworldwide.org?subject=Employer%20matching">
                    <Briefcase size="1em" aria-hidden="true" /> Employer matching
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-heading">
            <div className="section-eyebrow">Transparency</div>
            <h2 className="section-title">Every dollar is accounted for</h2>
            <p className="section-subtitle">
              We are a young organization. We are not yet third-party rated, and we will
              not claim ratings we don&apos;t have. Here&apos;s what we do commit to:
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon"><FileText size="1em" aria-hidden="true" /></div>
              <h3>Annual reports</h3>
              <p>
                Our first annual financial and program report will be published in the
                first quarter following our first full operating year. Available in
                accessible formats on request.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><CheckCircle size="1em" aria-hidden="true" /></div>
              <h3>Independent review</h3>
              <p>
                We will engage an independent auditor when the budget supports it — and
                we&apos;ll publish the results, including anything unflattering. Until
                then, our books are open on request.
              </p>
              <a
                className="card-link"
                href="mailto:hello@thirdeyeworldwide.org?subject=Books"
              >
                Request our books <ArrowRight size="1em" aria-hidden="true" />
              </a>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck size="1em" aria-hidden="true" /></div>
              <h3>Donor privacy</h3>
              <p>
                We never sell, rent, or share donor information. Full anonymity available
                on request.
              </p>
              <a className="card-link" href="/privacy">
                Privacy policy <ArrowRight size="1em" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
