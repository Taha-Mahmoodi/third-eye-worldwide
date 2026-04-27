import { Play, RssSimple } from '@/components/icons';

interface Show { name?: string; desc?: string }
interface PodcastFeaturedProps { show?: Show; episodeCount?: number }
export default function PodcastFeatured({ show, episodeCount }: PodcastFeaturedProps) {
  const { name = 'Our podcast', desc = '' } = show || {};
  return (
    <div className="pod-featured">
      <div>
        <div className="pod-featured-eyebrow">Featured Podcast</div>
        <h3 className="pod-featured-title">{name}</h3>
        <p className="pod-featured-desc">{desc}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary">
            <Play weight="fill" size="1em" aria-hidden="true" /> Play Latest
          </button>
          <button type="button" className="btn-secondary">
            <RssSimple size="1em" aria-hidden="true" /> Subscribe
          </button>
        </div>
      </div>
      <div className="pod-art-bg">
        <div className="pod-art-inner">
          <div className="pod-art-name">{name}</div>
          <div className="pod-art-meta">PODCAST · {episodeCount} EPISODES LISTED</div>
        </div>
      </div>
    </div>
  );
}
