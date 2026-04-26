import Link from 'next/link';

interface Feature { icon?: string; title?: string; desc?: string }
export default function FeatureCard({ feature }: { feature?: Feature }) {
  const { icon, title, desc } = feature || {};
  return (
    <div className="feature-card">
      <div className="feature-icon"><i className={`ph ${icon || ''}`} aria-hidden="true"></i></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <Link className="card-link" href="/projects">
        Learn more <i className="ph ph-arrow-right" aria-hidden="true"></i>
      </Link>
    </div>
  );
}
