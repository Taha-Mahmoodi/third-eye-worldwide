import { getContent, visibleSorted } from '@/lib/cms/db';
import RichText from '@/components/RichText';
import Subnav from '@/components/site/Subnav';
import FilterablePhotoGrid from '@/components/media/FilterablePhotoGrid';
import PodcastFeatured from '@/components/media/PodcastFeatured';
import PodcastRow from '@/components/media/PodcastRow';
import PodcastComingSoon from '@/components/media/PodcastComingSoon';
import FilterableVideoGrid from '@/components/media/FilterableVideoGrid';
import PhotoLightbox from '@/components/media/PhotoLightbox';
import { pageMetadata, readSeoOverrides } from '@/lib/seo';


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

function PhotosTab({ photos, cats }) {
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
            All our photos include full alt text in 40+ languages. Audio descriptions are
            available for every photo essay.
          </p>
        </div>
      </section>
    </>
  );
}

function PodcastsTab({ show, pods }) {
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
              {pods.map((ep) => <PodcastRow key={ep.id || ep.ep} episode={ep} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function VideosTab({ videos, cats }) {
  return (
    <section className="section">
      <div className="section-inner">
        <FilterableVideoGrid videos={videos} cats={cats} />
      </div>
    </section>
  );
}

export default async function MediaPage() {
  const content = await getContent();
  const m = content?.media || {};
  const photos = visibleSorted(m.photos || []);
  const pods   = visibleSorted(m.podcasts || []);
  const vids   = visibleSorted(m.videos || []);
  const show   = m.podcastShow || {};

  const photoCats = Array.from(new Set(photos.map((p) => p.cat).filter(Boolean)));
  const videoCats = Array.from(new Set(vids.map((v) => v.cat).filter(Boolean)));

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
