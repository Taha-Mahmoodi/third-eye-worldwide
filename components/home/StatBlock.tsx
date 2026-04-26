import RichText from '@/components/RichText';

interface Stat { number?: string; label?: string }
export default function StatBlock({ stat }: { stat?: Stat }) {
  const { number, label } = stat || {};
  return (
    <div className="stat-block">
      <RichText as="span" className="num" html={number} />
      <span className="lbl">{label}</span>
    </div>
  );
}
