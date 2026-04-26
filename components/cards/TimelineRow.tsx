import Link from 'next/link';

/*
 * Row in the story timeline (home archive + any future archive view).
 * `story` shape: { date, location, title, desc, initials, author, meta }.
 * Date is space-separated "Month Day" (e.g. "Apr 12").
 */
export interface TimelineRowData {
  date?: string;
  location?: string;
  title?: string;
  desc?: string;
  initials?: string;
  author?: string;
  meta?: string;
}

export default function TimelineRow({ story }: { story?: TimelineRowData }) {
  const { date = '', location, title, desc, initials = 'TE', author = '', meta } = story || {};
  const [month = '', day = ''] = date.split(' ');

  return (
    <li className="story-row">
      <Link href="/documents#stories" className="story-row-link" aria-label={title}>
        <div className="sr-rail"><span className="sr-dot"></span></div>
        <div className="sr-date">
          <div className="sr-month">{month}</div>
          <div className="sr-day">{day}</div>
        </div>
        <div className="sr-body">
          <div className="sr-tags">
            <span className="cat-tag story">Story</span>
            {location ? <span className="sr-loc">{location}</span> : null}
          </div>
          <h4>{title}</h4>
          <p>{desc}</p>
          <div className="sr-meta">
            <div className="avatar sm">{initials}</div>
            <span>{author}</span>
            <span className="sep">·</span>
            <span>{meta || ''}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
