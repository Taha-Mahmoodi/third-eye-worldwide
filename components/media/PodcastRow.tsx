import { CalendarBlank, Clock, FileText, Play } from '@/components/icons';

interface Episode {
  num?: string; artV?: string; ep?: string; title?: string; desc?: string; len?: string; date?: string;
}
export default function PodcastRow({ episode }: { episode?: Episode }) {
  const { num = '', artV = '', ep = '', title = '', desc = '', len = '', date = '' } = episode || {};
  return (
    <div className="pod-row">
      <div className={`pod-art ${artV}`}>{num}</div>
      <div className="pod-body">
        <div className="ep">{ep}</div>
        <h4>{title}</h4>
        <p>{desc}</p>
        <div className="pod-meta">
          <span><Clock size="1em" aria-hidden="true" /> {len}</span>
          <span><CalendarBlank size="1em" aria-hidden="true" /> {date}</span>
          <span><FileText size="1em" aria-hidden="true" /> Transcript</span>
        </div>
      </div>
      <button type="button" className="pod-play" aria-label={`Play ${ep}`}>
        <Play weight="fill" size="1em" aria-hidden="true" />
      </button>
    </div>
  );
}
