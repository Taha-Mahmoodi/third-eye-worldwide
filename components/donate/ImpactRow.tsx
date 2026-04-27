import CmsIcon from '@/components/CmsIcon';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ImpactItem { icon?: string; title?: string; desc?: string; [key: string]: any }
export default function ImpactRow({ item }: { item?: ImpactItem }) {
  const { icon, title = '', desc = '' } = item || {};
  return (
    <div className="impact-row">
      <div className="impact-icon"><CmsIcon name={icon} aria-hidden="true" /></div>
      <div className="text">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
    </div>
  );
}
