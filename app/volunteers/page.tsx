import { Suspense } from 'react';
import Link from 'next/link';
import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import { SkeletonHero } from '@/components/Skeleton';
import StatTile from '@/components/site/StatTile';
import RoleCard from '@/components/volunteers/RoleCard';
import StepItem from '@/components/volunteers/StepItem';
import VolunteerForm from '@/components/volunteers/VolunteerForm';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';
import { CalendarPlus } from '@/components/icons';

export const revalidate = 3600;

export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/volunteers');
  const v = content?.volunteers || {};
  return pageMetadata({
    title: o.title || 'Volunteer — Third Eye Worldwide',
    description: o.description || v.heroSub || 'Help build free assistive technology. Translators, developers, narrators, and organisers always welcome.',
    path: '/volunteers',
    image: o.image,
    noindex: o.noindex,
  });
}

export default function VolunteersPage() {
  return (
    <Suspense fallback={<SkeletonHero />}>
      <VolunteersPageContent />
    </Suspense>
  );
}

async function VolunteersPageContent() {
  const content = await getContent();
  const v = content?.volunteers || {};
  const stats = visibleSorted(v.stats || []);
  const roles = visibleSorted(v.roles || []);
  const steps = visibleSorted(v.steps || []);

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-eyebrow">{v.heroEyebrow || 'Volunteer'}</div>
          <RichText as="h1" html={v.heroTitle || 'Lend your skills.'} />
          {v.heroSub ? <p>{v.heroSub}</p> : null}
        </div>
      </div>

      <section className="section">
        <div className="section-inner">
          {stats.length > 0 ? (
            <div className="vol-stat-grid">
              {stats.map((s, i) => <StatTile key={s.id || i} stat={s} />)}
            </div>
          ) : null}

          <div className="section-heading left" style={{ maxWidth: 720 }}>
            <div className="section-eyebrow">Open Roles</div>
            <h2 className="section-title">Find a role that fits</h2>
            <p className="section-subtitle">
              {(v.rolesSubhead as string | undefined) ||
                'Every role is remote-friendly, self-paced, and paired with a mentor.'}
            </p>
          </div>

          <div className="role-grid">
            {roles.length > 0
              ? roles.map((r) => <RoleCard key={r.id || r.title} role={r} />)
              : <p style={{ color: 'var(--fg-muted)' }}>No roles listed yet.</p>}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="section-inner">
          <div className="vol-split">
            <div>
              <div className="section-eyebrow">How It Works</div>
              <h2 className="vol-how-title">
                {(v.stepsHeading as string | undefined) ||
                  'From application to first contribution in under two weeks.'}
              </h2>
              <div className="vol-steps">
                {steps.map((s, i) => <StepItem key={s.id || i} step={s} />)}
              </div>
            </div>
            <VolunteerForm roles={roles} />
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-inner">
          {(() => {
            const cta = (v.dropInCta || {}) as {
              heading?: string;
              body?: string;
              primaryLabel?: string;
              primaryHref?: string;
              secondaryLabel?: string;
              secondaryHref?: string;
            };
            const heading = cta.heading || 'Not sure where you fit?';
            const body = cta.body ||
              "Send an email — we'll set up a 20-minute call. No commitment, no script.";
            const primaryLabel = cta.primaryLabel || 'Email us';
            const primaryHref = cta.primaryHref ||
              'mailto:hello@thirdeyeworldwide.org?subject=Volunteer';
            const secondaryLabel = cta.secondaryLabel || 'Donate Instead';
            const secondaryHref = cta.secondaryHref || '/donate';
            return (
              <>
                <h2>{heading}</h2>
                <p>{body}</p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a href={primaryHref} className="btn-accent">
                    <CalendarPlus size="1em" aria-hidden="true" /> {primaryLabel}
                  </a>
                  <Link href={secondaryHref} className="btn-secondary">{secondaryLabel}</Link>
                </div>
              </>
            );
          })()}
        </div>
      </section>
    </>
  );
}
