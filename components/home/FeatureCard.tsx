import Link from 'next/link';
import CmsIcon from '@/components/CmsIcon';
import { ArrowRight } from '@/components/icons';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Feature { icon?: string; title?: string; desc?: string; [key: string]: any }
export default function FeatureCard({ feature }: { feature?: Feature }) {
  const { icon, title, desc } = feature || {};
  return (
    <div className="feature-card">
      <div className="feature-icon"><CmsIcon name={icon} aria-hidden="true" /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <Link className="card-link" href="/projects">
        Learn more <ArrowRight size="1em" aria-hidden="true" />
      </Link>
    </div>
  );
}
