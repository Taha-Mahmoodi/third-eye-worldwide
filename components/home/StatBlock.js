import RichText from '@/components/RichText';

export default function StatBlock({ stat }) {
  const { number, label } = stat || {};
  return (
    <div className="stat-block">
      <RichText as="span" className="num" html={number} />
      <span className="lbl">{label}</span>
    </div>
  );
}
