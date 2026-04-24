import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import DonateWidget from '@/components/donate/DonateWidget';
import ImpactRow from '@/components/donate/ImpactRow';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';

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

export default async function DonatePage() {
  const content = await getContent();
  const d = content?.donate || {};
  const monthly = visibleSorted(d.monthlyAmounts || []);
  const once = visibleSorted(d.onceAmounts || []);
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
            <DonateWidget monthly={monthly} once={once} />

            <div className="donate-sidebar">
              <div className="donate-impact">
                <div className="donate-impact-eyebrow">Your Impact</div>
                <h3>Where your gift goes</h3>
                <p className="lead">
                  Every donation is tracked to a specific program. We publish quarterly impact
                  reports showing exactly how funds are deployed.
                </p>
                {impact.map((it) => <ImpactRow key={it.id || it.title} item={it} />)}
              </div>

              <div className="donate-other">
                <div className="donate-other-eyebrow">Other Ways to Give</div>
                <div className="donate-other-links">
                  <a href="#"><i className="ph ph-bank" aria-hidden="true"></i> Bank transfer / wire</a>
                  <a href="#"><i className="ph ph-chart-line-up" aria-hidden="true"></i> Donate stock or crypto</a>
                  <a href="#"><i className="ph ph-briefcase" aria-hidden="true"></i> Employer matching</a>
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
              Audited annually. Published publicly. Available in accessible formats on request.
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon"><i className="ph ph-file-text" aria-hidden="true"></i></div>
              <h3>Annual reports</h3>
              <p>Detailed financial and program reports published every March — available since our founding in 2025.</p>
              <a className="card-link" href="#">View reports <i className="ph ph-arrow-right" aria-hidden="true"></i></a>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><i className="ph ph-check-circle" aria-hidden="true"></i></div>
              <h3>Third-party audited</h3>
              <p>Independently audited by Baker Tilly. Charity Navigator 4-star. GuideStar Platinum Seal 2025-2026.</p>
              <a className="card-link" href="#">See audits <i className="ph ph-arrow-right" aria-hidden="true"></i></a>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><i className="ph ph-shield-check" aria-hidden="true"></i></div>
              <h3>Donor privacy</h3>
              <p>We never sell, rent, or share donor information. Full anonymity available on request.</p>
              <a className="card-link" href="#">Privacy policy <i className="ph ph-arrow-right" aria-hidden="true"></i></a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
