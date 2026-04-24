export default function VideoCard({ video }) {
  const { bg = 'vid-bg-1', label = '', dur = '', title = '', desc = '', date = '', views = '', cat = '' } = video || {};
  return (
    <div className="video-card" data-filter-target="videos" data-cat={cat}>
      <div className={`video-thumb ${bg}`}>
        <div className="vid-inner-label">{label}</div>
        <div className="play-btn"><i className="ph-fill ph-play" aria-hidden="true"></i></div>
        <div className="cc">CC</div>
        <div className="dur">{dur}</div>
      </div>
      <div className="video-body">
        <h4>{title}</h4>
        <p>{desc}</p>
        <div className="video-meta">
          <span>{date}</span>
          <span className="sep">·</span>
          <span>{views}</span>
        </div>
      </div>
    </div>
  );
}
