/*
 * Video card. When `youtubeId` is set, renders a lazy-loaded YouTube
 * iframe (nocookie domain) sized to 16:9. Without an ID, shows the
 * legacy gradient placeholder — useful while editors are still
 * pasting IDs from the admin dashboard.
 */
export interface VideoData {
  id?: string;
  bg?: string;
  label?: string;
  dur?: string;
  title?: string;
  desc?: string;
  date?: string;
  views?: string;
  cat?: string;
  youtubeId?: string;
}

export default function VideoCard({ video }: { video?: VideoData }) {
  const {
    bg = 'vid-bg-1', label = '', dur = '', title = '', desc = '',
    date = '', views = '', cat = '', youtubeId = '',
  } = video || {};

  return (
    <div className="video-card" data-filter-target="videos" data-cat={cat}>
      {youtubeId ? (
        <div className="video-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className={`video-thumb ${bg}`}>
          <div className="vid-inner-label">{label || 'Coming soon'}</div>
          <div className="play-btn"><i className="ph-fill ph-play" aria-hidden="true"></i></div>
          {dur ? <div className="dur">{dur}</div> : null}
          <div className="video-pending" aria-hidden="true">Awaiting YouTube link</div>
        </div>
      )}
      <div className="video-body">
        <h4>{title}</h4>
        {desc ? <p>{desc}</p> : null}
        {(date || views) ? (
          <div className="video-meta">
            {date ? <span>{date}</span> : null}
            {date && views ? <span className="sep">·</span> : null}
            {views ? <span>{views}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
