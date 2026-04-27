import { Suspense } from 'react';
import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import { SkeletonHero } from '@/components/Skeleton';
import Subnav from '@/components/site/Subnav';
import FilterablePhotoGrid from '@/components/media/FilterablePhotoGrid';
import PodcastFeatured from '@/components/media/PodcastFeatured';
import PodcastRow from '@/components/media/PodcastRow';
import PodcastComingSoon from '@/components/media/PodcastComingSoon';
import FilterableVideoGrid from '@/components/media/FilterableVideoGrid';
import PhotoLightbox from '@/components/media/PhotoLightbox';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata() {
  const content = await getContent();
  const o = readSeoOverrides(content, '/media');
  const m = content?.media || {};
  return pageMetadata({
    title: o.title || 'Media — Third Eye Worldwide',
    description: o.description || m.heroSub || 'Photos, podcasts, and videos from the field — all captioned, transcribed, and audio-described.',
    path: '/media',
    image: o.image,
    noindex: o.noindex,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PhotosTab({ photos, cats }: { photos: any[]; cats: string[] }) {
  // If no photos are configured (the v2 default state — no fictional
  // archive), render an honest empty state with a contribution CTA
  // instead of the filterable grid.
  if (photos.length === 0) {
    return (
      <>
        <section className="section">
          <div className="section-inner" style={{ maxWidth: 720, textAlign: 'left' }}>
            <h2 className="section-title">Photos</h2>
            <p style={{ color: 'var(--fg-muted)', lineHeight: 1.7, fontSize: '1.02rem' }}>
              Our photo archive is being built. The first images will come from community
              members who choose to share — alongside contributed photos from people who
              use our tools, with their consent. Every photo will include full alt text
              and audio description.
            </p>
            <p style={{ color: 'var(--fg-muted)', lineHeight: 1.7, fontSize: '1.02rem' }}>
              Want to contribute a photo? Email{' '}
              <a href="mailto:hello@thirdeyeworldwide.org?subject=Photo">
                hello@thirdeyeworldwide.org
              </a>{' '}
              with the subject line <strong>Photo</strong>. With consent, with credit.
            </p>
            <div style={{ marginTop: 24 }}>
              <a
                href="mailto:hello@thirdeyeworldwide.org?subject=Photo"
                className="btn-primary"
              >
                Contribute a photo
              </a>
            </div>
          </div>
        </section>
        <section className="section section-alt">
          <div className="section-inner" style={{ textAlign: 'center' }}>
            <div className="photo-accessibility-eyebrow">Photo Accessibility</div>
            <h2 className="photo-accessibility-title">Every image will be described.</h2>
            <p className="photo-accessibility-body">
              Each photo will include full alt text and an audio description before it
              publishes. Translations follow as the volunteer translation pool grows.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="section">
        <div className="section-inner">
          <FilterablePhotoGrid photos={photos} cats={cats} />
        </div>
      </section>
      <section className="section section-alt">
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <div className="photo-accessibility-eyebrow">Photo Accessibility</div>
          <h2 className="photo-accessibility-title">Every image is described.</h2>
          <p className="photo-accessibility-body">
            Each photo includes full alt text and an audio description. Translations
            follow as the volunteer translation pool grows.
          </p>
        </div>
      </section>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PodcastsTab({ show, pods }: { show: any; pods: any[] }) {
  const isComingSoon = (show?.status === 'coming-soon') || pods.length === 0;

  return (
    <section className="section">
      <div className="section-inner">
        {isComingSoon ? (
          <PodcastComingSoon show={show} />
        ) : (
          <>
            <PodcastFeatured show={show} episodeCount={pods.length} />
            <h3 className="pod-list-heading">Recent episodes</h3>
            <div className="pod-list">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {pods.map((ep: any) => <PodcastRow key={ep.id || ep.ep} episode={ep} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VideosTab({ videos, cats }: { videos: any[]; cats: string[] }) {
  return (
    <section className="section">
      <div className="section-inner">
        <FilterableVideoGrid videos={videos} cats={cats} />
      </div>
    </section>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<SkeletonHero />}>
      <MediaPageContent />
    </Suspense>
  );
}

async function MediaPageContent() {
  const content = await getContent();
  const m = content?.media || {};
  const photos = visibleSorted(m.photos || []);
  const pods   = visibleSorted(m.podcasts || []);
  const vids   = visibleSorted(m.videos || []);
  const show   = m.podcastShow || {};

  const photoCats = Array.from(new Set(photos.map((p) => (p as { cat?: string }).cat).filter(Boolean))) as string[];
  const videoCats = Array.from(new Set(vids.map((v) => (v as { cat?: string }).cat).filter(Boolean))) as string[];

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="section-eyebrow">{m.heroEyebrow || 'Media'}</div>
          <RichText as="h1" html={m.heroTitle || 'From the field.'} />
          {m.heroSub ? <p>{m.heroSub}</p> : null}
        </div>
      </div>

      <Subnav
        page="media"
        ariaLabel="Media sections"
        defaultTab="photos"
        tabs={[
          { id: 'photos',   label: 'Photos',   content: <PhotosTab photos={photos} cats={photoCats} /> },
          { id: 'podcasts', label: 'Podcasts', content: <PodcastsTab show={show} pods={pods} /> },
          { id: 'videos',   label: 'Videos',   content: <VideosTab videos={vids} cats={videoCats} /> },
        ]}
      />

      <PhotoLightbox />
    </>
  );
}
