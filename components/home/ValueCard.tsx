interface Value { num?: string; icon?: string; title?: string; desc?: string; meta?: string; variant?: string }
export default function ValueCard({ value }: { value?: Value }) {
  const { num, icon, title, desc, meta, variant } = value || {};
  return (
    <li className={`val-card ${variant || 'v-brand'}`}>
      <div className="val-num">{num}</div>
      <div className="val-ico"><i className={`ph ${icon || ''}`} aria-hidden="true"></i></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <div className="val-meta"><span>{meta}</span></div>
    </li>
  );
}
