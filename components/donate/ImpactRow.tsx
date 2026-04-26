// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ImpactItem { icon?: string; title?: string; desc?: string; [key: string]: any }
export default function ImpactRow({ item }: { item?: ImpactItem }) {
  const { icon = 'ph-circle', title = '', desc = '' } = item || {};
  return (
    <div className="impact-row">
      <div className="impact-icon"><i className={`ph ${icon}`} aria-hidden="true"></i></div>
      <div className="text">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
    </div>
  );
}
