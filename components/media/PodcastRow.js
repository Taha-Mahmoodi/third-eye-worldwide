export default function PodcastRow({ episode }) {
  const { num = '', artV = '', ep = '', title = '', desc = '', len = '', date = '' } = episode || {};
  return (
    <div className="pod-row">
      <div className={`pod-art ${artV}`}>{num}</div>
      <div className="pod-body">
        <div className="ep">{ep}</div>
        <h4>{title}</h4>
        <p>{desc}</p>
        <div className="pod-meta">
          <span><i className="ph ph-clock" aria-hidden="true"></i> {len}</span>
          <span><i className="ph ph-calendar-blank" aria-hidden="true"></i> {date}</span>
          <span><i className="ph ph-file-text" aria-hidden="true"></i> Transcript</span>
        </div>
      </div>
      <button type="button" className="pod-play" aria-label={`Play ${ep}`}>
        <i className="ph-fill ph-play" aria-hidden="true"></i>
      </button>
    </div>
  );
}
