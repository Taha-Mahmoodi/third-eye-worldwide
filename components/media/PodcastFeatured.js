export default function PodcastFeatured({ show, episodeCount }) {
  const { name = 'Our podcast', desc = '' } = show || {};
  return (
    <div className="pod-featured">
      <div>
        <div className="pod-featured-eyebrow">Featured Podcast</div>
        <h3 className="pod-featured-title">{name}</h3>
        <p className="pod-featured-desc">{desc}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn-primary">
            <i className="ph-fill ph-play" aria-hidden="true"></i> Play Latest
          </button>
          <button type="button" className="btn-secondary">
            <i className="ph ph-rss-simple" aria-hidden="true"></i> Subscribe
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
